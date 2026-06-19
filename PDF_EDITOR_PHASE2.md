# PDF Editor — Phase 2 Handoff

Phase 1 shipped a **PDF Editor** tool (`src/components/PDFEditor.tsx`, route
`/pdf-editor`, category `document`). It loads one or more PDFs into a single
ordered list of page thumbnails and supports **merge, split/extract, reorder,
rotate, and delete**, then exports a fresh PDF. Everything runs client-side.

This document describes what's intentionally left for Phase 2 and how to build
it within the existing architecture.

## Architecture recap (so Phase 2 stays consistent)

- **Libraries:** `pdf-lib` (create/modify/save) + `pdfjs-dist` (render
  thumbnails). The pdf.js worker is wired up at the top of `PDFEditor.tsx`:
  ```ts
  import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  ```
- **State model:** a `SourceDoc[]` keeps the *pristine* original bytes per
  uploaded file; a flat `PageItem[]` is the working document. Each `PageItem`
  references `{ srcId, pageIndex, rotation }`. Export rebuilds a new
  `PDFDocument`, copying pages from cached source docs in list order and
  applying `rotation`.
- **Important gotcha:** `pdfjs.getDocument({ data })` *detaches* the buffer it
  receives, so we always hand it `new Uint8Array(src.bytes)` (a copy) and keep
  the original bytes for pdf-lib. Preserve this pattern.
- **UI conventions:** reactstrap (`Card`/`CardHeader`/`CardBody`/`Row`/`Col`/
  `Button`/`Alert`/`Badge`), dark Bootstrap theme via CSS variables
  (`var(--bs-tertiary-bg)` etc.), `crypto.randomUUID()` for ids. Match the
  structure of existing tools (see `QRReader.tsx`).

## Phase 2 features (recommended order)

### 1. Drag-and-drop page reordering
Currently reordering uses ←/→ buttons. Replace/augment with drag-and-drop on
the thumbnail grid. Keep the buttons as an accessible fallback.
- Native HTML5 DnD (`draggable`, `onDragStart`/`onDragOver`/`onDrop`) avoids a
  new dependency. Reorder the `pages` array on drop (same swap/splice logic as
  `movePage`).
- Also add a file drop zone on the "Add PDFs" card (`onDrop` → `handleFiles`).

### 2. Image ↔ PDF conversion
- **Images → PDF:** accept PNG/JPG; for each, `pdfDoc.embedPng`/`embedJpg`, add
  a page sized to the image (or fit to A4). Ties into the existing Images tool.
- **PDF page → image:** the thumbnail pipeline already renders to canvas;
  render at full scale and offer per-page PNG/JPG download via
  `canvas.toDataURL`.

### 3. Document metadata editor
`pdf-lib` exposes `setTitle`, `setAuthor`, `setSubject`, `setKeywords`,
`setProducer`, `setCreator`. Add a collapsible form; read current values with
the matching getters and write them on export.

### 4. Page number / text / watermark stamping
Use `pdfDoc.embedFont(StandardFonts.Helvetica)` and `page.drawText(...)`.
Watermarks: `drawText` with low `opacity` and a `rotate` angle. Expose
position presets (corners/center) rather than raw coordinates.

### 5. Annotation & signature overlay (largest effort)
This is the jump from "page operations" to a true editor and warrants its own
sub-phase.
- Render the active page to a canvas at display scale; overlay an absolutely
  positioned interaction layer (HTML/SVG or a second canvas).
- Support text boxes, freehand drawing, highlight rectangles, and an image/
  drawn **signature** stamp.
- Track annotations in page-space coordinates (independent of zoom), then on
  export translate to PDF user-space and draw via `pdf-lib`
  (`drawText`/`drawLine`/`drawRectangle`/`drawImage`). Remember PDF's origin is
  bottom-left; convert y as `pageHeight - y`.
- **Redaction** must *flatten* — draw an opaque box AND remove underlying text,
  not just cover it. `pdf-lib` can't reliably delete text runs, so for true
  redaction rasterize the page (render to image, re-embed) or document the
  limitation clearly.

### 6. Encryption / password
`pdf-lib` does not support encryption. Options: integrate a library that does
(e.g. a WASM build) or drop this feature. Validate bundle-size impact first.

## Performance notes

- The PDFEditor chunk is ~307 kB gzipped (lazy-loaded, so only fetched when the
  tool opens). If Phase 2 adds more, consider `manualChunks` to split pdfjs/
  pdf-lib, or render thumbnails lazily (IntersectionObserver) for large PDFs.
- Thumbnails currently render sequentially on load. For 100+ page documents,
  render visible pages first or show a progress count.

## Testing checklist for Phase 2

- Single PDF: reorder, rotate each 90° step, delete, export → verify order &
  rotation in a viewer.
- Multiple PDFs merged: confirm pages interleave in list order on export.
- Re-import an exported file (round-trip) to confirm validity.
- Large file (50+ pages) for responsiveness.
- Encrypted/corrupt input → friendly error (currently surfaced via the `error`
  Alert).
