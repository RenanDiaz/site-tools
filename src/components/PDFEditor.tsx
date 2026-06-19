import type { FC } from "react";
import { useCallback, useRef, useState } from "react";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import type { PDFFont, PDFImage, PDFPage } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import { PDFAnnotator } from "./PDFAnnotator";
import {
  DEFAULT_METADATA,
  DEFAULT_STAMP_OPTIONS,
  hexToRgb01,
} from "./pdfEditorTypes";
import type {
  Annotation,
  PdfMetadata,
  StampOptions,
  StampPosition,
} from "./pdfEditorTypes";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// A loaded source document: the original bytes are kept untouched so pdf-lib
// can copy pages from them at export time.
interface SourceDoc {
  id: string;
  name: string;
  bytes: Uint8Array;
}

// A single page in the working document. Pages from multiple sources are
// flattened into one ordered list, which is what lets this one UI cover
// merge / split / reorder / rotate / delete at the same time.
interface PageItem {
  id: string;
  srcId: string;
  srcName: string;
  pageIndex: number;
  // User-applied rotation delta in degrees (0 / 90 / 180 / 270), added on top
  // of the page's intrinsic rotation when exporting.
  rotation: number;
  thumbnail: string;
  width: number;
  height: number;
}

const THUMBNAIL_SCALE = 0.4;

const STAMP_POSITIONS: { value: StampPosition; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "center", label: "Center" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
];

const isImageFile = (file: File): boolean =>
  file.type === "image/png" ||
  file.type === "image/jpeg" ||
  /\.(png|jpe?g)$/i.test(file.name);

const isPdfFile = (file: File): boolean =>
  file.type === "application/pdf" || /\.pdf$/i.test(file.name);

const dataUrlToBytes = (url: string): Uint8Array => {
  const base64 = url.slice(url.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

// Wrap an image file into a single-page PDF so it flows through the same
// source/page pipeline as a real PDF.
const imageToPdfBytes = async (file: File): Promise<Uint8Array> => {
  const ab = await file.arrayBuffer();
  const doc = await PDFDocument.create();
  const isPng = file.type === "image/png" || /\.png$/i.test(file.name);
  const img = isPng ? await doc.embedPng(ab) : await doc.embedJpg(ab);
  const page = doc.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  return doc.save();
};

// Resolve a stamp preset to the *center* of the stamp in pdf-lib user space
// (origin bottom-left). Rotated watermarks pivot around this point.
const presetCenter = (
  pos: StampPosition,
  w: number,
  h: number,
  inset: number,
  textWidth: number,
  fontSize: number
): { cx: number; cy: number } => {
  let cx = w / 2;
  let cy = h / 2;
  if (pos.includes("left")) cx = inset + textWidth / 2;
  else if (pos.includes("right")) cx = w - inset - textWidth / 2;
  if (pos.startsWith("top")) cy = h - inset - fontSize / 2;
  else if (pos.startsWith("bottom")) cy = inset + fontSize / 2;
  return { cx, cy };
};

const drawStampText = (
  page: PDFPage,
  font: PDFFont,
  text: string,
  pos: StampPosition,
  size: number,
  color: string,
  opacity: number,
  rotation: number
) => {
  const { width, height } = page.getSize();
  const tw = font.widthOfTextAtSize(text, size);
  const { cx, cy } = presetCenter(pos, width, height, 28, tw, size);
  const rad = (rotation * Math.PI) / 180;
  const { r, g, b } = hexToRgb01(color);
  page.drawText(text, {
    x: cx - (tw / 2) * Math.cos(rad),
    y: cy - (tw / 2) * Math.sin(rad) - size / 2,
    size,
    font,
    color: rgb(r, g, b),
    opacity,
    rotate: degrees(rotation),
  });
};

export const PDFEditor: FC = () => {
  const [sources, setSources] = useState<Record<string, SourceDoc>>({});
  const [pages, setPages] = useState<PageItem[]>([]);
  const [annotations, setAnnotations] = useState<Record<string, Annotation[]>>({});
  const [metadata, setMetadata] = useState<PdfMetadata>(DEFAULT_METADATA);
  const [stamp, setStamp] = useState<StampOptions>(DEFAULT_STAMP_OPTIONS);

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [metadataOpen, setMetadataOpen] = useState<boolean>(false);
  const [stampOpen, setStampOpen] = useState<boolean>(false);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [annotatorPageId, setAnnotatorPageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const metadataLoadedRef = useRef<boolean>(false);

  const renderThumbnails = useCallback(
    async (src: SourceDoc): Promise<PageItem[]> => {
      // pdf.js detaches the buffer it is given, so hand it a copy and keep the
      // pristine bytes on the SourceDoc for pdf-lib.
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(src.bytes) });
      const pdf = await loadingTask.promise;
      const items: PageItem[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: THUMBNAIL_SCALE });
        const fullViewport = page.getViewport({ scale: 1 });

        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not create canvas context");

        await page.render({ canvas, canvasContext: ctx, viewport }).promise;

        items.push({
          id: crypto.randomUUID(),
          srcId: src.id,
          srcName: src.name,
          pageIndex: i - 1,
          rotation: 0,
          thumbnail: canvas.toDataURL("image/png"),
          width: Math.round(fullViewport.width),
          height: Math.round(fullViewport.height),
        });
      }

      await loadingTask.destroy();
      return items;
    },
    []
  );

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      setError("");
      setIsLoading(true);

      try {
        const newSources: Record<string, SourceDoc> = {};
        const newPages: PageItem[] = [];
        let firstPdfBytes: Uint8Array | null = null;

        for (const file of Array.from(fileList)) {
          const isImage = isImageFile(file);
          const isPdf = isPdfFile(file);
          if (!isPdf && !isImage) {
            setError(`Skipped "${file.name}": not a PDF or image file.`);
            continue;
          }

          const bytes = isImage
            ? await imageToPdfBytes(file)
            : new Uint8Array(await file.arrayBuffer());
          const src: SourceDoc = { id: crypto.randomUUID(), name: file.name, bytes };
          const items = await renderThumbnails(src);

          newSources[src.id] = src;
          newPages.push(...items);
          if (isPdf && !firstPdfBytes) firstPdfBytes = bytes;
        }

        setSources((prev) => ({ ...prev, ...newSources }));
        setPages((prev) => [...prev, ...newPages]);

        // Pre-fill the metadata form from the first PDF the user adds.
        if (firstPdfBytes && !metadataLoadedRef.current) {
          metadataLoadedRef.current = true;
          try {
            const doc = await PDFDocument.load(firstPdfBytes, { ignoreEncryption: true });
            setMetadata({
              title: doc.getTitle() ?? "",
              author: doc.getAuthor() ?? "",
              subject: doc.getSubject() ?? "",
              keywords: doc.getKeywords() ?? "",
              creator: doc.getCreator() ?? "",
              producer: doc.getProducer() ?? "",
            });
          } catch {
            // Non-fatal: leave the metadata form empty.
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? `Failed to load file: ${err.message}` : "Failed to load file."
        );
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [renderThumbnails]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDropZone = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropping(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const movePage = (index: number, direction: -1 | 1) => {
    setPages((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const reorderPage = (from: number, to: number) => {
    setPages((prev) => {
      if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const rotatePage = (id: string, delta: 90 | -90) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, rotation: (((p.rotation + delta) % 360) + 360) % 360 } : p
      )
    );
  };

  const deletePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    setAnnotations((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const downloadPageImage = async (page: PageItem, index: number, format: "png" | "jpeg") => {
    setError("");
    const task = pdfjsLib.getDocument({ data: new Uint8Array(sources[page.srcId].bytes) });
    try {
      const pdf = await task.promise;
      const pg = await pdf.getPage(page.pageIndex + 1);
      const viewport = pg.getViewport({
        scale: 2,
        rotation: (pg.rotate + page.rotation) % 360,
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");
      if (format === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      await pg.render({ canvas, canvasContext: ctx, viewport }).promise;
      const url = canvas.toDataURL(`image/${format}`);
      const a = document.createElement("a");
      a.href = url;
      a.download = `page-${index + 1}.${format === "jpeg" ? "jpg" : "png"}`;
      a.click();
    } catch (err) {
      setError(
        err instanceof Error ? `Failed to export image: ${err.message}` : "Failed to export image."
      );
    } finally {
      await task.destroy();
    }
  };

  const handleClear = () => {
    setPages([]);
    setSources({});
    setAnnotations({});
    setMetadata(DEFAULT_METADATA);
    setStamp(DEFAULT_STAMP_OPTIONS);
    metadataLoadedRef.current = false;
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Draw a single annotation onto an output page (already added to `out`).
  const drawAnnotation = async (
    page: PDFPage,
    ann: Annotation,
    out: PDFDocument,
    font: PDFFont,
    imageCache: Map<string, PDFImage>
  ) => {
    const { height } = page.getSize();
    if (ann.type === "text") {
      const { r, g, b } = hexToRgb01(ann.color);
      page.drawText(ann.text, {
        x: ann.x,
        y: height - ann.y - ann.fontSize,
        size: ann.fontSize,
        font,
        color: rgb(r, g, b),
      });
    } else if (ann.type === "highlight") {
      const { r, g, b } = hexToRgb01(ann.color);
      page.drawRectangle({
        x: ann.x,
        y: height - ann.y - ann.h,
        width: ann.w,
        height: ann.h,
        color: rgb(r, g, b),
        opacity: ann.opacity,
      });
    } else if (ann.type === "draw") {
      const { r, g, b } = hexToRgb01(ann.color);
      for (let i = 1; i < ann.points.length; i++) {
        const p0 = ann.points[i - 1];
        const p1 = ann.points[i];
        page.drawLine({
          start: { x: p0.x, y: height - p0.y },
          end: { x: p1.x, y: height - p1.y },
          thickness: ann.lineWidth,
          color: rgb(r, g, b),
        });
      }
    } else if (ann.type === "rect") {
      const { r, g, b } = hexToRgb01(ann.color);
      page.drawRectangle({
        x: ann.x,
        y: height - ann.y - ann.h,
        width: ann.w,
        height: ann.h,
        borderColor: rgb(r, g, b),
        borderWidth: ann.lineWidth,
        ...(ann.fill ? { color: rgb(r, g, b) } : {}),
      });
    } else if (ann.type === "ellipse") {
      const { r, g, b } = hexToRgb01(ann.color);
      page.drawEllipse({
        x: ann.x + ann.w / 2,
        y: height - ann.y - ann.h / 2,
        xScale: ann.w / 2,
        yScale: ann.h / 2,
        borderColor: rgb(r, g, b),
        borderWidth: ann.lineWidth,
        ...(ann.fill ? { color: rgb(r, g, b) } : {}),
      });
    } else if (ann.type === "signature") {
      let img = imageCache.get(ann.dataUrl);
      if (!img) {
        const bytes = dataUrlToBytes(ann.dataUrl);
        img = ann.dataUrl.startsWith("data:image/png")
          ? await out.embedPng(bytes)
          : await out.embedJpg(bytes);
        imageCache.set(ann.dataUrl, img);
      }
      page.drawImage(img, {
        x: ann.x,
        y: height - ann.y - ann.h,
        width: ann.w,
        height: ann.h,
      });
    }
  };

  const handleExport = async () => {
    if (pages.length === 0) return;
    setError("");
    setIsExporting(true);

    try {
      const out = await PDFDocument.create();
      const loaded = new Map<string, PDFDocument>();
      const font = await out.embedFont(StandardFonts.Helvetica);
      const imageCache = new Map<string, PDFImage>();
      const total = pages.length;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        let src = loaded.get(page.srcId);
        if (!src) {
          src = await PDFDocument.load(sources[page.srcId].bytes, { ignoreEncryption: true });
          loaded.set(page.srcId, src);
        }

        const [copied] = await out.copyPages(src, [page.pageIndex]);
        if (page.rotation !== 0) {
          const base = copied.getRotation().angle;
          copied.setRotation(degrees((base + page.rotation) % 360));
        }
        out.addPage(copied);

        // Annotations and stamps are drawn in the page's original orientation;
        // any user rotation applied above rotates them along with the page.
        for (const ann of annotations[page.id] ?? []) {
          await drawAnnotation(copied, ann, out, font, imageCache);
        }

        if (stamp.watermarkText.trim()) {
          drawStampText(
            copied,
            font,
            stamp.watermarkText,
            stamp.watermarkPosition,
            stamp.watermarkSize,
            stamp.watermarkColor,
            stamp.watermarkOpacity,
            stamp.watermarkRotation
          );
        }
        if (stamp.pageNumbers) {
          const text = stamp.pageNumberFormat
            .replace(/\{n\}/g, String(i + 1))
            .replace(/\{total\}/g, String(total));
          drawStampText(
            copied,
            font,
            text,
            stamp.pageNumberPosition,
            stamp.pageNumberSize,
            "#000000",
            1,
            0
          );
        }
      }

      // Document metadata
      if (metadata.title) out.setTitle(metadata.title);
      if (metadata.author) out.setAuthor(metadata.author);
      if (metadata.subject) out.setSubject(metadata.subject);
      if (metadata.keywords) {
        out.setKeywords(
          metadata.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        );
      }
      if (metadata.creator) out.setCreator(metadata.creator);
      if (metadata.producer) out.setProducer(metadata.producer);

      const bytes = await out.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "edited.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? `Failed to export PDF: ${err.message}` : "Failed to export PDF."
      );
    } finally {
      setIsExporting(false);
    }
  };

  const sourceCount = Object.keys(sources).length;
  const annotatedPage = pages.find((p) => p.id === annotatorPageId) ?? null;

  const updateMeta = (patch: Partial<PdfMetadata>) =>
    setMetadata((prev) => ({ ...prev, ...patch }));
  const updateStamp = (patch: Partial<StampOptions>) =>
    setStamp((prev) => ({ ...prev, ...patch }));

  return (
    <>
      <h2>PDF Editor</h2>
      <p>
        Merge, split, reorder, rotate, and delete pages across one or more PDFs
        and images, add annotations, stamps and metadata, then export a new
        document. Everything runs in your browser — files never leave your
        device.
      </p>

      <Card className="mb-3">
        <CardHeader>Add PDFs &amp; images</CardHeader>
        <CardBody>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDropping(true);
            }}
            onDragLeave={() => setIsDropping(false)}
            onDrop={handleDropZone}
            style={{
              border: `2px dashed ${isDropping ? "var(--bs-primary)" : "var(--bs-border-color)"}`,
              borderRadius: "6px",
              padding: "1rem",
              backgroundColor: isDropping ? "var(--bs-tertiary-bg)" : "transparent",
              transition: "background-color 0.15s ease, border-color 0.15s ease",
            }}
          >
            <FormGroup className="mb-0">
              <Label for="pdfFiles">
                Drag &amp; drop files here, or select PDF / PNG / JPG files
              </Label>
              <Input
                type="file"
                id="pdfFiles"
                accept="application/pdf,.pdf,image/png,image/jpeg,.png,.jpg,.jpeg"
                multiple
                onChange={handleFileChange}
                innerRef={fileInputRef}
                disabled={isLoading}
              />
            </FormGroup>
          </div>
          {isLoading && (
            <div className="d-flex align-items-center gap-2 mt-3">
              <Spinner size="sm" color="primary" />
              <span className="text-muted">Rendering pages…</span>
            </div>
          )}
        </CardBody>
      </Card>

      {error && (
        <Alert color="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {pages.length > 0 && (
        <>
          <Card className="mb-3">
            <CardHeader
              role="button"
              onClick={() => setMetadataOpen((o) => !o)}
              className="d-flex justify-content-between align-items-center"
            >
              <span>Document metadata</span>
              <Badge color="secondary">{metadataOpen ? "Hide" : "Edit"}</Badge>
            </CardHeader>
            <Collapse isOpen={metadataOpen}>
              <CardBody>
                <Row className="g-3">
                  <Col md={6}>
                    <Label for="metaTitle">Title</Label>
                    <Input
                      id="metaTitle"
                      value={metadata.title}
                      onChange={(e) => updateMeta({ title: e.target.value })}
                    />
                  </Col>
                  <Col md={6}>
                    <Label for="metaAuthor">Author</Label>
                    <Input
                      id="metaAuthor"
                      value={metadata.author}
                      onChange={(e) => updateMeta({ author: e.target.value })}
                    />
                  </Col>
                  <Col md={6}>
                    <Label for="metaSubject">Subject</Label>
                    <Input
                      id="metaSubject"
                      value={metadata.subject}
                      onChange={(e) => updateMeta({ subject: e.target.value })}
                    />
                  </Col>
                  <Col md={6}>
                    <Label for="metaKeywords">Keywords (comma-separated)</Label>
                    <Input
                      id="metaKeywords"
                      value={metadata.keywords}
                      onChange={(e) => updateMeta({ keywords: e.target.value })}
                    />
                  </Col>
                  <Col md={6}>
                    <Label for="metaCreator">Creator</Label>
                    <Input
                      id="metaCreator"
                      value={metadata.creator}
                      onChange={(e) => updateMeta({ creator: e.target.value })}
                    />
                  </Col>
                  <Col md={6}>
                    <Label for="metaProducer">Producer</Label>
                    <Input
                      id="metaProducer"
                      value={metadata.producer}
                      onChange={(e) => updateMeta({ producer: e.target.value })}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Collapse>
          </Card>

          <Card className="mb-3">
            <CardHeader
              role="button"
              onClick={() => setStampOpen((o) => !o)}
              className="d-flex justify-content-between align-items-center"
            >
              <span>Page numbers &amp; watermark</span>
              <Badge color="secondary">{stampOpen ? "Hide" : "Edit"}</Badge>
            </CardHeader>
            <Collapse isOpen={stampOpen}>
              <CardBody>
                <Row className="g-3">
                  <Col md={12}>
                    <FormGroup check>
                      <Input
                        type="checkbox"
                        id="stampPageNumbers"
                        checked={stamp.pageNumbers}
                        onChange={(e) => updateStamp({ pageNumbers: e.target.checked })}
                      />
                      <Label check for="stampPageNumbers">
                        Add page numbers
                      </Label>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <Label for="pnFormat">Format ({"{n}"} / {"{total}"})</Label>
                    <Input
                      id="pnFormat"
                      value={stamp.pageNumberFormat}
                      onChange={(e) => updateStamp({ pageNumberFormat: e.target.value })}
                      disabled={!stamp.pageNumbers}
                    />
                  </Col>
                  <Col md={4}>
                    <Label for="pnPosition">Position</Label>
                    <Input
                      type="select"
                      id="pnPosition"
                      value={stamp.pageNumberPosition}
                      onChange={(e) =>
                        updateStamp({ pageNumberPosition: e.target.value as StampPosition })
                      }
                      disabled={!stamp.pageNumbers}
                    >
                      {STAMP_POSITIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </Input>
                  </Col>
                  <Col md={4}>
                    <Label for="pnSize">Font size</Label>
                    <Input
                      type="number"
                      id="pnSize"
                      min={6}
                      max={48}
                      value={stamp.pageNumberSize}
                      onChange={(e) => updateStamp({ pageNumberSize: Number(e.target.value) })}
                      disabled={!stamp.pageNumbers}
                    />
                  </Col>

                  <Col md={12}>
                    <hr className="my-1" />
                    <Label for="wmText">Watermark / stamp text</Label>
                    <Input
                      id="wmText"
                      placeholder="e.g. CONFIDENTIAL (leave blank for none)"
                      value={stamp.watermarkText}
                      onChange={(e) => updateStamp({ watermarkText: e.target.value })}
                    />
                  </Col>
                  <Col md={3}>
                    <Label for="wmPosition">Position</Label>
                    <Input
                      type="select"
                      id="wmPosition"
                      value={stamp.watermarkPosition}
                      onChange={(e) =>
                        updateStamp({ watermarkPosition: e.target.value as StampPosition })
                      }
                    >
                      {STAMP_POSITIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </Input>
                  </Col>
                  <Col md={3}>
                    <Label for="wmSize">Font size</Label>
                    <Input
                      type="number"
                      id="wmSize"
                      min={8}
                      max={144}
                      value={stamp.watermarkSize}
                      onChange={(e) => updateStamp({ watermarkSize: Number(e.target.value) })}
                    />
                  </Col>
                  <Col md={3}>
                    <Label for="wmRotation">Rotation°</Label>
                    <Input
                      type="number"
                      id="wmRotation"
                      min={-180}
                      max={180}
                      value={stamp.watermarkRotation}
                      onChange={(e) => updateStamp({ watermarkRotation: Number(e.target.value) })}
                    />
                  </Col>
                  <Col md={3}>
                    <Label for="wmOpacity">Opacity</Label>
                    <Input
                      type="number"
                      id="wmOpacity"
                      min={0.05}
                      max={1}
                      step={0.05}
                      value={stamp.watermarkOpacity}
                      onChange={(e) => updateStamp({ watermarkOpacity: Number(e.target.value) })}
                    />
                  </Col>
                  <Col md={3}>
                    <Label for="wmColor">Color</Label>
                    <Input
                      type="color"
                      id="wmColor"
                      value={stamp.watermarkColor}
                      onChange={(e) => updateStamp({ watermarkColor: e.target.value })}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Collapse>
          </Card>

          <Card className="mb-3">
            <CardHeader>
              <Row className="align-items-center">
                <Col className="d-flex align-items-center gap-2">
                  Pages
                  <Badge color="info" pill>
                    {pages.length} {pages.length === 1 ? "page" : "pages"} from{" "}
                    {sourceCount} {sourceCount === 1 ? "file" : "files"}
                  </Badge>
                </Col>
                <Col xs="auto" className="d-flex gap-2">
                  <Button
                    color="primary"
                    size="sm"
                    onClick={handleExport}
                    disabled={isExporting}
                  >
                    {isExporting ? "Exporting…" : "Export PDF"}
                  </Button>
                  <Button color="outline-secondary" size="sm" onClick={handleClear}>
                    Clear All
                  </Button>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <p className="text-muted small mb-3">
                Drag a page onto another to reorder, or use the ←/→ buttons.
              </p>
              <Row className="g-3">
                {pages.map((page, index) => {
                  const annCount = annotations[page.id]?.length ?? 0;
                  return (
                    <Col key={page.id} xs={6} sm={4} md={3} lg={2}>
                      <Card
                        className="h-100"
                        draggable
                        onDragStart={() => {
                          dragIndexRef.current = index;
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverIndex(index);
                        }}
                        onDragLeave={() => setDragOverIndex((cur) => (cur === index ? null : cur))}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (dragIndexRef.current !== null) {
                            reorderPage(dragIndexRef.current, index);
                          }
                          dragIndexRef.current = null;
                          setDragOverIndex(null);
                        }}
                        onDragEnd={() => {
                          dragIndexRef.current = null;
                          setDragOverIndex(null);
                        }}
                        style={{
                          cursor: "grab",
                          outline:
                            dragOverIndex === index ? "2px solid var(--bs-primary)" : "none",
                        }}
                      >
                        <CardBody className="p-2 d-flex flex-column">
                          <div
                            className="d-flex justify-content-center align-items-center mb-2"
                            style={{
                              minHeight: "140px",
                              backgroundColor: "var(--bs-tertiary-bg)",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={page.thumbnail}
                              alt={`Page ${index + 1}`}
                              draggable={false}
                              style={{
                                maxWidth: "100%",
                                maxHeight: "140px",
                                transform: `rotate(${page.rotation}deg)`,
                                transition: "transform 0.15s ease",
                                boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                              }}
                            />
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <Badge color="secondary" pill>
                              {index + 1}
                            </Badge>
                            {annCount > 0 && (
                              <Badge color="success" pill title="Annotations on this page">
                                ✎ {annCount}
                              </Badge>
                            )}
                            <small className="text-muted">
                              {page.width}×{page.height}
                            </small>
                          </div>
                          <small
                            className="text-muted text-truncate mb-2"
                            title={page.srcName}
                          >
                            {page.srcName}
                          </small>
                          <div className="mt-auto d-flex flex-wrap gap-1">
                            <Button
                              color="outline-secondary"
                              size="sm"
                              title="Move left"
                              disabled={index === 0}
                              onClick={() => movePage(index, -1)}
                            >
                              ←
                            </Button>
                            <Button
                              color="outline-secondary"
                              size="sm"
                              title="Move right"
                              disabled={index === pages.length - 1}
                              onClick={() => movePage(index, 1)}
                            >
                              →
                            </Button>
                            <Button
                              color="outline-secondary"
                              size="sm"
                              title="Rotate left"
                              onClick={() => rotatePage(page.id, -90)}
                            >
                              ⤺
                            </Button>
                            <Button
                              color="outline-secondary"
                              size="sm"
                              title="Rotate right"
                              onClick={() => rotatePage(page.id, 90)}
                            >
                              ⤻
                            </Button>
                            <Button
                              color="outline-danger"
                              size="sm"
                              title="Delete page"
                              onClick={() => deletePage(page.id)}
                            >
                              ✕
                            </Button>
                          </div>
                          <div className="mt-1 d-flex flex-wrap gap-1">
                            <Button
                              color="outline-primary"
                              size="sm"
                              title="Annotate page"
                              onClick={() => setAnnotatorPageId(page.id)}
                            >
                              ✎ Annotate
                            </Button>
                            <Button
                              color="outline-secondary"
                              size="sm"
                              title="Download page as PNG"
                              onClick={() => downloadPageImage(page, index, "png")}
                            >
                              ⤓ PNG
                            </Button>
                            <Button
                              color="outline-secondary"
                              size="sm"
                              title="Download page as JPG"
                              onClick={() => downloadPageImage(page, index, "jpeg")}
                            >
                              ⤓ JPG
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </CardBody>
          </Card>
        </>
      )}

      {annotatedPage && (
        <PDFAnnotator
          isOpen={annotatorPageId !== null}
          pageBytes={sources[annotatedPage.srcId].bytes}
          pageIndex={annotatedPage.pageIndex}
          pageLabel={`Page ${pages.findIndex((p) => p.id === annotatedPage.id) + 1}`}
          initialAnnotations={annotations[annotatedPage.id] ?? []}
          onCancel={() => setAnnotatorPageId(null)}
          onSave={(anns) => {
            setAnnotations((prev) => ({ ...prev, [annotatedPage.id]: anns }));
            setAnnotatorPageId(null);
          }}
        />
      )}

      <Card>
        <CardHeader>About PDF Editor</CardHeader>
        <CardBody>
          <p className="mb-2">This tool lets you:</p>
          <ul className="mb-2">
            <li><strong>Merge:</strong> Add several PDFs (or images) to combine their pages</li>
            <li><strong>Split / extract:</strong> Delete the pages you don't want, then export</li>
            <li><strong>Reorder:</strong> Drag pages, or use the ←/→ buttons</li>
            <li><strong>Rotate:</strong> Turn individual pages in 90° steps</li>
            <li><strong>Convert:</strong> Import PNG/JPG as pages, or download any page as an image</li>
            <li><strong>Annotate:</strong> Add text, freehand drawing, rectangles, circles, highlights and signatures</li>
            <li><strong>Stamp:</strong> Add page numbers and a text watermark</li>
            <li><strong>Metadata:</strong> Edit the document title, author, keywords and more</li>
          </ul>
          <p className="mb-2">
            <strong>Privacy:</strong> All processing happens locally in your
            browser. Nothing is uploaded to a server.
          </p>
          <p className="mb-0 text-muted small">
            <strong>Note:</strong> password protection / encryption is not
            available — the underlying library (pdf-lib) cannot encrypt PDFs.
            Redaction draws an opaque box but does not remove the underlying
            text, so do not rely on it to hide sensitive content.
          </p>
        </CardBody>
      </Card>
    </>
  );
};
