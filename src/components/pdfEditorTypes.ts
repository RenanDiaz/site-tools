// Shared types for the PDF Editor and its annotation overlay.
//
// All annotation coordinates are stored in *page space*: PDF points with a
// top-left origin, matching the pdf.js viewport at scale 1. On export they are
// translated to pdf-lib user space (bottom-left origin) — see PDFEditor's
// export logic. Storing in page space keeps annotations independent of the
// zoom level used while editing.

export interface Point {
  x: number;
  y: number;
}

export interface TextAnnotation {
  id: string;
  type: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

export interface DrawAnnotation {
  id: string;
  type: "draw";
  points: Point[];
  color: string;
  lineWidth: number;
}

export interface HighlightAnnotation {
  id: string;
  type: "highlight";
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  opacity: number;
}

// A simple geometric shape (rectangle or ellipse) defined by a bounding box.
// `fill` toggles between a filled shape and an outline-only one; `color` is
// used for both the outline and (when filled) the fill.
export interface ShapeAnnotation {
  id: string;
  type: "rect" | "ellipse";
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  lineWidth: number;
  fill: boolean;
}

// The standard-14 fonts usable when replacing existing text. Sticking to the
// built-in fonts avoids embedding a font file (and the fontkit dependency); the
// trade-off is that only WinAnsi-encodable characters can be written — see
// `winAnsiUnsupported`.
export type EditFontKey =
  | "helvetica"
  | "helvetica-bold"
  | "helvetica-oblique"
  | "times"
  | "times-bold"
  | "times-italic"
  | "courier"
  | "courier-bold"
  | "courier-oblique";

export const EDIT_FONT_LABELS: Record<EditFontKey, string> = {
  helvetica: "Helvetica",
  "helvetica-bold": "Helvetica Bold",
  "helvetica-oblique": "Helvetica Italic",
  times: "Times",
  "times-bold": "Times Bold",
  "times-italic": "Times Italic",
  courier: "Courier",
  "courier-bold": "Courier Bold",
  "courier-oblique": "Courier Italic",
};

// CSS equivalents, used to preview a replacement the way pdf-lib will draw it.
export const EDIT_FONT_CSS: Record<
  EditFontKey,
  { fontFamily: string; fontWeight: string; fontStyle: string }
> = {
  helvetica: { fontFamily: "Helvetica, Arial, sans-serif", fontWeight: "normal", fontStyle: "normal" },
  "helvetica-bold": { fontFamily: "Helvetica, Arial, sans-serif", fontWeight: "bold", fontStyle: "normal" },
  "helvetica-oblique": { fontFamily: "Helvetica, Arial, sans-serif", fontWeight: "normal", fontStyle: "italic" },
  times: { fontFamily: "'Times New Roman', Times, serif", fontWeight: "normal", fontStyle: "normal" },
  "times-bold": { fontFamily: "'Times New Roman', Times, serif", fontWeight: "bold", fontStyle: "normal" },
  "times-italic": { fontFamily: "'Times New Roman', Times, serif", fontWeight: "normal", fontStyle: "italic" },
  courier: { fontFamily: "'Courier New', Courier, monospace", fontWeight: "normal", fontStyle: "normal" },
  "courier-bold": { fontFamily: "'Courier New', Courier, monospace", fontWeight: "bold", fontStyle: "normal" },
  "courier-oblique": { fontFamily: "'Courier New', Courier, monospace", fontWeight: "normal", fontStyle: "italic" },
};

// A replacement for a run of text that already exists in the page. PDFs store
// positioned glyphs rather than editable paragraphs, and pdf-lib cannot rewrite
// a content stream, so "editing" is done by painting an opaque `bgColor` box
// over the original run's box (x/y/w/h) and drawing `text` on the original
// baseline. Consequences the UI has to be honest about: the original glyphs are
// still in the file underneath, the cover only blends in over a flat
// background, and longer replacements overflow into whatever follows.
export interface EditTextAnnotation {
  id: string;
  type: "edit";
  // Id of the pdf.js text run this replaces, so the picker can hide runs that
  // already have a replacement.
  runId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  // Distance from the top of the box down to the original text baseline.
  baselineOffset: number;
  text: string;
  original: string;
  fontSize: number;
  fontKey: EditFontKey;
  color: string;
  bgColor: string;
}

// A raster stamp (drawn or uploaded signature, logo, etc.) embedded as PNG.
export interface ImageAnnotation {
  id: string;
  type: "signature";
  x: number;
  y: number;
  w: number;
  h: number;
  dataUrl: string;
}

export type Annotation =
  | TextAnnotation
  | DrawAnnotation
  | HighlightAnnotation
  | ShapeAnnotation
  | ImageAnnotation
  | EditTextAnnotation;

// Document-level metadata, edited via a collapsible form and written on export.
export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
}

export type StampPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "center";

// Configuration for page-number / text / watermark stamping applied on export.
export interface StampOptions {
  // Page numbers
  pageNumbers: boolean;
  pageNumberFormat: string; // supports {n} and {total}
  pageNumberPosition: StampPosition;
  pageNumberSize: number;

  // Free text / watermark
  watermarkText: string;
  watermarkPosition: StampPosition;
  watermarkSize: number;
  watermarkOpacity: number; // 0..1
  watermarkRotation: number; // degrees
  watermarkColor: string; // hex
}

export const DEFAULT_METADATA: PdfMetadata = {
  title: "",
  author: "",
  subject: "",
  keywords: "",
  creator: "",
  producer: "",
};

export const DEFAULT_STAMP_OPTIONS: StampOptions = {
  pageNumbers: false,
  pageNumberFormat: "{n} / {total}",
  pageNumberPosition: "bottom-center",
  pageNumberSize: 12,
  watermarkText: "",
  watermarkPosition: "center",
  watermarkSize: 48,
  watermarkOpacity: 0.2,
  watermarkRotation: 45,
  watermarkColor: "#888888",
};

// The WinAnsi (CP1252) code points that live outside Latin-1: the standard-14
// fonts can encode these on top of the 0x20-0x7e and 0xa0-0xff ranges.
const WIN_ANSI_EXTRA =
  "€‚ƒ„…†‡ˆ‰Š‹ŒŽ" +
  "‘’“”•–—˜™š›œžŸ";

// Characters a standard-14 font cannot encode, deduplicated and in order of
// first appearance. Used to warn while editing and to fail the export with a
// message that names the offending characters instead of a pdf-lib stack trace.
export const winAnsiUnsupported = (text: string): string[] => {
  const bad: string[] = [];
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    const ok =
      (code >= 0x20 && code <= 0x7e) ||
      (code >= 0xa0 && code <= 0xff) ||
      WIN_ANSI_EXTRA.includes(ch);
    if (!ok && !bad.includes(ch)) bad.push(ch);
  }
  return bad;
};

// Parse a "#rrggbb" string into 0..1 RGB components for pdf-lib's rgb().
export const hexToRgb01 = (hex: string): { r: number; g: number; b: number } => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return { r: 0, g: 0, b: 0 };
  const int = parseInt(m[1], 16);
  return {
    r: ((int >> 16) & 0xff) / 255,
    g: ((int >> 8) & 0xff) / 255,
    b: (int & 0xff) / 255,
  };
};
