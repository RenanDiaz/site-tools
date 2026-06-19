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
  | ImageAnnotation;

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
