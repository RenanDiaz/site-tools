import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  Button,
  ButtonGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "reactstrap";
import type { Annotation, Point } from "./pdfEditorTypes";

// The page is rendered to this CSS width (points are scaled to fit). Stored
// annotation coordinates remain in page-space points regardless of this value.
const DISPLAY_WIDTH = 680;

type Tool = "select" | "text" | "draw" | "rect" | "ellipse" | "highlight" | "signature";

// Tools that are created by dragging a bounding box on the page.
const BOX_TOOLS: Tool[] = ["rect", "ellipse", "highlight"];

const TOOL_LABELS: Record<Tool, string> = {
  select: "Select",
  text: "Text",
  draw: "Draw",
  rect: "Rectangle",
  ellipse: "Circle",
  highlight: "Highlight",
  signature: "Signature",
};

interface PDFAnnotatorProps {
  isOpen: boolean;
  pageBytes: Uint8Array;
  pageIndex: number;
  pageLabel: string;
  initialAnnotations: Annotation[];
  onSave: (annotations: Annotation[]) => void;
  onCancel: () => void;
}

export const PDFAnnotator: FC<PDFAnnotatorProps> = ({
  isOpen,
  pageBytes,
  pageIndex,
  pageLabel,
  initialAnnotations,
  onSave,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);

  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [tool, setTool] = useState<Tool>("select");
  const [color, setColor] = useState<string>("#ff0000");
  const [lineWidth, setLineWidth] = useState<number>(2);
  const [fontSize, setFontSize] = useState<number>(16);
  const [fill, setFill] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [scale, setScale] = useState<number>(1); // CSS px per PDF point
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<string>("");

  // Signature capture
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  const [signatureAspect, setSignatureAspect] = useState<number>(0.4); // h / w
  const sigDrawing = useRef<boolean>(false);

  // In-progress freehand path / highlight rectangle (page-space points)
  const [draftPoints, setDraftPoints] = useState<Point[] | null>(null);
  const [draftRect, setDraftRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const drawingRef = useRef<boolean>(false);
  const rectStart = useRef<Point | null>(null);

  // Drag state for moving an existing annotation in select mode
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAnnotations(initialAnnotations);
      setSelectedId(null);
      setTool("select");
    }
  }, [isOpen, initialAnnotations]);

  // Render the page to the background canvas whenever the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const task = pdfjsLib.getDocument({ data: new Uint8Array(pageBytes) });

    (async () => {
      setIsRendering(true);
      setRenderError("");
      try {
        const pdf = await task.promise;
        const page = await pdf.getPage(pageIndex + 1);
        const base = page.getViewport({ scale: 1 });
        const displayScale = DISPLAY_WIDTH / base.width;
        const viewport = page.getViewport({ scale: displayScale });

        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not create canvas context");

        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        if (!cancelled) setScale(displayScale);
      } catch (err) {
        if (!cancelled) {
          setRenderError(
            err instanceof Error ? `Failed to render page: ${err.message}` : "Failed to render page."
          );
        }
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    })();

    return () => {
      cancelled = true;
      task.destroy();
    };
  }, [isOpen, pageBytes, pageIndex]);

  // Convert a pointer event to page-space points.
  const toPoint = useCallback(
    (clientX: number, clientY: number): Point => {
      const rect = surfaceRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
    },
    [scale]
  );

  const updateAnnotation = useCallback((id: string, patch: Partial<Annotation>) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? ({ ...a, ...patch } as Annotation) : a))
    );
  }, []);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setAnnotations((prev) => prev.filter((a) => a.id !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  // --- Surface pointer handlers (create new annotations) ---

  const handleSurfacePointerDown = (e: React.PointerEvent) => {
    if (isRendering) return;
    const p = toPoint(e.clientX, e.clientY);

    if (tool === "draw") {
      drawingRef.current = true;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      setDraftPoints([p]);
      return;
    }
    if (BOX_TOOLS.includes(tool)) {
      drawingRef.current = true;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      rectStart.current = p;
      setDraftRect({ x: p.x, y: p.y, w: 0, h: 0 });
      return;
    }
    if (tool === "text") {
      const id = crypto.randomUUID();
      setAnnotations((prev) => [
        ...prev,
        { id, type: "text", x: p.x, y: p.y, text: "Text", fontSize, color },
      ]);
      setSelectedId(id);
      setTool("select");
      return;
    }
    if (tool === "signature") {
      if (!signatureUrl) return;
      const id = crypto.randomUUID();
      const w = 160;
      setAnnotations((prev) => [
        ...prev,
        { id, type: "signature", x: p.x, y: p.y, w, h: w * signatureAspect, dataUrl: signatureUrl },
      ]);
      setSelectedId(id);
      setTool("select");
      return;
    }
    // select mode: clicking empty surface clears selection
    setSelectedId(null);
  };

  const handleSurfacePointerMove = (e: React.PointerEvent) => {
    if (tool === "draw" && drawingRef.current) {
      const p = toPoint(e.clientX, e.clientY);
      setDraftPoints((prev) => (prev ? [...prev, p] : [p]));
    } else if (BOX_TOOLS.includes(tool) && drawingRef.current && rectStart.current) {
      const p = toPoint(e.clientX, e.clientY);
      const s = rectStart.current;
      setDraftRect({
        x: Math.min(s.x, p.x),
        y: Math.min(s.y, p.y),
        w: Math.abs(p.x - s.x),
        h: Math.abs(p.y - s.y),
      });
    }
  };

  const handleSurfacePointerUp = () => {
    if (tool === "draw" && drawingRef.current) {
      drawingRef.current = false;
      if (draftPoints && draftPoints.length > 1) {
        const id = crypto.randomUUID();
        setAnnotations((prev) => [
          ...prev,
          { id, type: "draw", points: draftPoints, color, lineWidth },
        ]);
      }
      setDraftPoints(null);
    } else if (BOX_TOOLS.includes(tool) && drawingRef.current) {
      drawingRef.current = false;
      if (draftRect && draftRect.w > 2 && draftRect.h > 2) {
        const id = crypto.randomUUID();
        if (tool === "highlight") {
          setAnnotations((prev) => [
            ...prev,
            { id, type: "highlight", ...draftRect, color, opacity: 0.4 },
          ]);
        } else {
          setAnnotations((prev) => [
            ...prev,
            { id, type: tool as "rect" | "ellipse", ...draftRect, color, lineWidth, fill },
          ]);
        }
        setSelectedId(id);
      }
      setDraftRect(null);
      rectStart.current = null;
    }
  };

  // --- Moving existing annotations (select mode) ---

  const beginDrag = (e: React.PointerEvent, a: Annotation) => {
    if (tool !== "select") return;
    e.stopPropagation();
    setSelectedId(a.id);
    if (a.type === "draw") return; // freehand paths are not draggable
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { id: a.id, startX: e.clientX, startY: e.clientY, origX: a.x, origY: a.y };
  };

  const handleDragMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = (e.clientX - d.startX) / scale;
    const dy = (e.clientY - d.startY) / scale;
    updateAnnotation(d.id, { x: d.origX + dx, y: d.origY + dy } as Partial<Annotation>);
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  // --- Signature pad ---

  const sigPos = (e: React.PointerEvent) => {
    const c = sigCanvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };

  const handleSigDown = (e: React.PointerEvent) => {
    const c = sigCanvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    sigDrawing.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const { x, y } = sigPos(e);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSigMove = (e: React.PointerEvent) => {
    if (!sigDrawing.current) return;
    const ctx = sigCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = sigPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const commitSignature = useCallback(() => {
    const c = sigCanvasRef.current;
    if (!c) return;
    setSignatureUrl(c.toDataURL("image/png"));
    setSignatureAspect(c.height / c.width);
    setTool("signature");
  }, []);

  const clearSignaturePad = useCallback(() => {
    const c = sigCanvasRef.current;
    const ctx = c?.getContext("2d");
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
  }, []);

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      const img = new Image();
      img.onload = () => {
        setSignatureUrl(url);
        setSignatureAspect(img.height / img.width);
        setTool("signature");
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const selected = annotations.find((a) => a.id === selectedId) ?? null;
  const cursor = tool === "select" ? "default" : "crosshair";

  return (
    <Modal isOpen={isOpen} toggle={onCancel} size="xl" centered scrollable>
      <ModalHeader toggle={onCancel}>Annotate — {pageLabel}</ModalHeader>
      <ModalBody>
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <ButtonGroup size="sm">
            {(["select", "text", "draw", "rect", "ellipse", "highlight"] as Tool[]).map((t) => (
              <Button
                key={t}
                color={tool === t ? "primary" : "outline-secondary"}
                onClick={() => setTool(t)}
              >
                {TOOL_LABELS[t]}
              </Button>
            ))}
          </ButtonGroup>
          <Label className="mb-0 d-flex align-items-center gap-1">
            <span className="text-muted small">Color</span>
            <Input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                if (selected && selected.type !== "signature") {
                  updateAnnotation(selected.id, { color: e.target.value } as Partial<Annotation>);
                }
              }}
              style={{ width: "38px", height: "31px", padding: "2px" }}
            />
          </Label>
          <Label className="mb-0 d-flex align-items-center gap-1">
            <span className="text-muted small">Line</span>
            <Input
              type="number"
              min={1}
              max={20}
              value={lineWidth}
              onChange={(e) => {
                setLineWidth(Number(e.target.value));
                if (
                  selected &&
                  (selected.type === "draw" || selected.type === "rect" || selected.type === "ellipse")
                ) {
                  updateAnnotation(selected.id, { lineWidth: Number(e.target.value) } as Partial<Annotation>);
                }
              }}
              bsSize="sm"
              style={{ width: "64px" }}
            />
          </Label>
          <Label className="mb-0 d-flex align-items-center gap-1">
            <Input
              type="checkbox"
              checked={
                selected && (selected.type === "rect" || selected.type === "ellipse")
                  ? selected.fill
                  : fill
              }
              onChange={(e) => {
                setFill(e.target.checked);
                if (selected && (selected.type === "rect" || selected.type === "ellipse")) {
                  updateAnnotation(selected.id, { fill: e.target.checked } as Partial<Annotation>);
                }
              }}
            />
            <span className="text-muted small">Fill</span>
          </Label>
          <Label className="mb-0 d-flex align-items-center gap-1">
            <span className="text-muted small">Font</span>
            <Input
              type="number"
              min={6}
              max={96}
              value={fontSize}
              onChange={(e) => {
                setFontSize(Number(e.target.value));
                if (selected && selected.type === "text") {
                  updateAnnotation(selected.id, { fontSize: Number(e.target.value) } as Partial<Annotation>);
                }
              }}
              bsSize="sm"
              style={{ width: "64px" }}
            />
          </Label>
          <Button
            color="outline-danger"
            size="sm"
            onClick={deleteSelected}
            disabled={!selectedId}
          >
            Delete selected
          </Button>
        </div>

        {selected && selected.type === "text" && (
          <div className="mb-3">
            <Label for="annTextValue" className="text-muted small mb-1">
              Selected text
            </Label>
            <Input
              id="annTextValue"
              type="text"
              value={selected.text}
              onChange={(e) => updateAnnotation(selected.id, { text: e.target.value } as Partial<Annotation>)}
            />
          </div>
        )}

        {renderError && <p className="text-danger">{renderError}</p>}

        <div className="d-flex justify-content-center">
          <div
            ref={surfaceRef}
            onPointerDown={handleSurfacePointerDown}
            onPointerMove={(e) => {
              handleSurfacePointerMove(e);
              handleDragMove(e);
            }}
            onPointerUp={() => {
              handleSurfacePointerUp();
              endDrag();
            }}
            style={{
              position: "relative",
              lineHeight: 0,
              cursor,
              touchAction: "none",
              boxShadow: "0 0 8px rgba(0,0,0,0.4)",
            }}
          >
            <canvas ref={canvasRef} style={{ display: "block" }} />
            {isRendering && (
              <div
                className="d-flex align-items-center justify-content-center gap-2"
                style={{ position: "absolute", inset: 0, background: "var(--bs-tertiary-bg)" }}
              >
                <Spinner size="sm" color="primary" />
                <span className="text-muted">Rendering…</span>
              </div>
            )}

            {/* Every annotation is rendered in creation order with an explicit
                z-index so freehand strokes and shapes drawn over earlier text,
                signatures or other annotations always appear on top — matching
                the order pdf-lib paints them on export. */}
            {annotations.map((a, index) => {
              const vectorEvents: React.CSSProperties = {
                pointerEvents: tool === "select" ? "auto" : "none",
              };
              const isSel = selectedId === a.id;

              if (a.type === "text") {
                return (
                  <div
                    key={a.id}
                    onPointerDown={(e) => beginDrag(e, a)}
                    style={{
                      position: "absolute",
                      zIndex: index + 1,
                      left: a.x * scale,
                      top: a.y * scale,
                      color: a.color,
                      fontSize: a.fontSize * scale,
                      lineHeight: 1,
                      whiteSpace: "pre",
                      fontFamily: "Helvetica, Arial, sans-serif",
                      pointerEvents: tool === "select" ? "auto" : "none",
                      cursor: tool === "select" ? "move" : cursor,
                      outline: isSel ? "1px dashed #0d6efd" : "none",
                    }}
                  >
                    {a.text || " "}
                  </div>
                );
              }

              if (a.type === "signature") {
                return (
                  <img
                    key={a.id}
                    src={a.dataUrl}
                    alt="signature"
                    draggable={false}
                    onPointerDown={(e) => beginDrag(e, a)}
                    style={{
                      position: "absolute",
                      zIndex: index + 1,
                      left: a.x * scale,
                      top: a.y * scale,
                      width: a.w * scale,
                      height: a.h * scale,
                      pointerEvents: tool === "select" ? "auto" : "none",
                      cursor: tool === "select" ? "move" : cursor,
                      outline: isSel ? "1px dashed #0d6efd" : "none",
                    }}
                  />
                );
              }

              // Vector annotations (draw / highlight / rect / ellipse) each live
              // in their own full-surface SVG so they can be layered by z-index.
              return (
                <svg
                  key={a.id}
                  width="100%"
                  height="100%"
                  style={{ position: "absolute", inset: 0, zIndex: index + 1, pointerEvents: "none" }}
                >
                  {a.type === "highlight" ? (
                    <rect
                      x={a.x * scale}
                      y={a.y * scale}
                      width={a.w * scale}
                      height={a.h * scale}
                      fill={a.color}
                      fillOpacity={a.opacity}
                      stroke={isSel ? "#0d6efd" : "none"}
                      strokeWidth={isSel ? 2 : 0}
                      style={vectorEvents}
                      onPointerDown={(e) => beginDrag(e, a)}
                    />
                  ) : a.type === "draw" ? (
                    <polyline
                      points={a.points.map((p) => `${p.x * scale},${p.y * scale}`).join(" ")}
                      fill="none"
                      stroke={a.color}
                      strokeWidth={a.lineWidth * scale}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={isSel ? 0.7 : 1}
                      style={vectorEvents}
                      onPointerDown={(e) => beginDrag(e, a)}
                    />
                  ) : a.type === "rect" ? (
                    <rect
                      x={a.x * scale}
                      y={a.y * scale}
                      width={a.w * scale}
                      height={a.h * scale}
                      fill={a.fill ? a.color : "none"}
                      stroke={a.color}
                      strokeWidth={a.lineWidth * scale}
                      strokeDasharray={isSel ? "4 3" : undefined}
                      style={vectorEvents}
                      onPointerDown={(e) => beginDrag(e, a)}
                    />
                  ) : (
                    <ellipse
                      cx={(a.x + a.w / 2) * scale}
                      cy={(a.y + a.h / 2) * scale}
                      rx={(a.w / 2) * scale}
                      ry={(a.h / 2) * scale}
                      fill={a.fill ? a.color : "none"}
                      stroke={a.color}
                      strokeWidth={a.lineWidth * scale}
                      strokeDasharray={isSel ? "4 3" : undefined}
                      style={vectorEvents}
                      onPointerDown={(e) => beginDrag(e, a)}
                    />
                  )}
                </svg>
              );
            })}

            {/* In-progress drafts always render on top while drawing. */}
            <svg
              width="100%"
              height="100%"
              style={{ position: "absolute", inset: 0, zIndex: annotations.length + 1, pointerEvents: "none" }}
            >
              {draftRect &&
                (tool === "highlight" ? (
                  <rect
                    x={draftRect.x * scale}
                    y={draftRect.y * scale}
                    width={draftRect.w * scale}
                    height={draftRect.h * scale}
                    fill={color}
                    fillOpacity={0.4}
                  />
                ) : tool === "ellipse" ? (
                  <ellipse
                    cx={(draftRect.x + draftRect.w / 2) * scale}
                    cy={(draftRect.y + draftRect.h / 2) * scale}
                    rx={(draftRect.w / 2) * scale}
                    ry={(draftRect.h / 2) * scale}
                    fill={fill ? color : "none"}
                    stroke={color}
                    strokeWidth={lineWidth * scale}
                  />
                ) : (
                  <rect
                    x={draftRect.x * scale}
                    y={draftRect.y * scale}
                    width={draftRect.w * scale}
                    height={draftRect.h * scale}
                    fill={fill ? color : "none"}
                    stroke={color}
                    strokeWidth={lineWidth * scale}
                  />
                ))}
              {draftPoints && draftPoints.length > 1 && (
                <polyline
                  points={draftPoints.map((p) => `${p.x * scale},${p.y * scale}`).join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth={lineWidth * scale}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>
        </div>

        {/* Signature capture */}
        <div className="mt-3 border-top pt-3">
          <div className="d-flex flex-wrap align-items-start gap-3">
            <div>
              <Label className="text-muted small d-block mb-1">Draw a signature</Label>
              <canvas
                ref={sigCanvasRef}
                width={300}
                height={120}
                onPointerDown={handleSigDown}
                onPointerMove={handleSigMove}
                onPointerUp={() => (sigDrawing.current = false)}
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--bs-border-color)",
                  borderRadius: "4px",
                  touchAction: "none",
                  cursor: "crosshair",
                }}
              />
              <div className="d-flex gap-2 mt-2">
                <Button color="primary" size="sm" onClick={commitSignature}>
                  Use signature
                </Button>
                <Button color="outline-secondary" size="sm" onClick={clearSignaturePad}>
                  Clear pad
                </Button>
              </div>
            </div>
            <div>
              <Label for="sigUpload" className="text-muted small d-block mb-1">
                …or upload an image
              </Label>
              <Input id="sigUpload" type="file" accept="image/png,image/jpeg" bsSize="sm" onChange={handleSignatureUpload} />
              {signatureUrl && (
                <div className="mt-2 d-flex align-items-center gap-2">
                  <img
                    src={signatureUrl}
                    alt="signature preview"
                    style={{ maxHeight: "40px", background: "#fff", border: "1px solid var(--bs-border-color)" }}
                  />
                  <span className="text-muted small">
                    Ready — pick the <strong>Signature</strong> tool, then click the page.
                  </span>
                  <Button
                    color={tool === "signature" ? "primary" : "outline-secondary"}
                    size="sm"
                    onClick={() => setTool("signature")}
                  >
                    Signature tool
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button color="primary" onClick={() => onSave(annotations)}>
          Apply annotations
        </Button>
      </ModalFooter>
    </Modal>
  );
};
