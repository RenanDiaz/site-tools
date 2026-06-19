import type { FC } from "react";
import { useCallback, useRef, useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
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
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";

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

export const PDFEditor: FC = () => {
  const [sources, setSources] = useState<Record<string, SourceDoc>>({});
  const [pages, setPages] = useState<PageItem[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

        for (const file of Array.from(fileList)) {
          if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            setError(`Skipped "${file.name}": not a PDF file.`);
            continue;
          }

          const bytes = new Uint8Array(await file.arrayBuffer());
          const src: SourceDoc = { id: crypto.randomUUID(), name: file.name, bytes };
          const items = await renderThumbnails(src);

          newSources[src.id] = src;
          newPages.push(...items);
        }

        setSources((prev) => ({ ...prev, ...newSources }));
        setPages((prev) => [...prev, ...newPages]);
      } catch (err) {
        setError(
          err instanceof Error
            ? `Failed to load PDF: ${err.message}`
            : "Failed to load PDF."
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

  const movePage = (index: number, direction: -1 | 1) => {
    setPages((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
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
  };

  const handleClear = () => {
    setPages([]);
    setSources({});
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExport = async () => {
    if (pages.length === 0) return;
    setError("");
    setIsExporting(true);

    try {
      const out = await PDFDocument.create();
      const loaded = new Map<string, PDFDocument>();

      for (const page of pages) {
        let src = loaded.get(page.srcId);
        if (!src) {
          src = await PDFDocument.load(sources[page.srcId].bytes);
          loaded.set(page.srcId, src);
        }

        const [copied] = await out.copyPages(src, [page.pageIndex]);
        if (page.rotation !== 0) {
          const base = copied.getRotation().angle;
          copied.setRotation(degrees((base + page.rotation) % 360));
        }
        out.addPage(copied);
      }

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
        err instanceof Error
          ? `Failed to export PDF: ${err.message}`
          : "Failed to export PDF."
      );
    } finally {
      setIsExporting(false);
    }
  };

  const sourceCount = Object.keys(sources).length;

  return (
    <>
      <h2>PDF Editor</h2>
      <p>
        Merge, split, reorder, rotate, and delete pages across one or more PDFs,
        then export a new document. Everything runs in your browser — files never
        leave your device.
      </p>

      <Card className="mb-3">
        <CardHeader>Add PDFs</CardHeader>
        <CardBody>
          <FormGroup className="mb-0">
            <Label for="pdfFiles">Select one or more PDF files</Label>
            <Input
              type="file"
              id="pdfFiles"
              accept="application/pdf,.pdf"
              multiple
              onChange={handleFileChange}
              innerRef={fileInputRef}
              disabled={isLoading}
            />
          </FormGroup>
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
            <Row className="g-3">
              {pages.map((page, index) => (
                <Col key={page.id} xs={6} sm={4} md={3} lg={2}>
                  <Card className="h-100">
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
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>About PDF Editor</CardHeader>
        <CardBody>
          <p className="mb-2">This tool lets you:</p>
          <ul className="mb-2">
            <li><strong>Merge:</strong> Add several PDFs to combine their pages</li>
            <li><strong>Split / extract:</strong> Delete the pages you don't want, then export</li>
            <li><strong>Reorder:</strong> Move pages left or right into any order</li>
            <li><strong>Rotate:</strong> Turn individual pages in 90° steps</li>
          </ul>
          <p className="mb-0">
            <strong>Privacy:</strong> All processing happens locally in your
            browser. Nothing is uploaded to a server.
          </p>
        </CardBody>
      </Card>
    </>
  );
};
