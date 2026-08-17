// Discovery of the text that already exists on a PDF page, plus the colour
// sampling used to paint over it. Kept out of PDFAnnotator so that component
// stays focused on the interaction layer.
//
// Everything here works in *page space* (PDF points, top-left origin) to match
// how annotations are stored — see pdfEditorTypes.

import { Util } from "pdfjs-dist";
import type { PDFPageProxy } from "pdfjs-dist";
import type { EditFontKey } from "./pdfEditorTypes";

// One run of text as pdf.js reports it. A run is whatever the content stream
// drew in one go, so it can be a whole line, a single word, or one glyph.
export interface TextRun {
  id: string;
  str: string;
  x: number;
  y: number; // top of the run's box (ascent above the baseline)
  w: number;
  h: number; // ascent + descent
  baselineOffset: number; // from the top of the box down to the baseline
  fontSize: number;
  fontKey: EditFontKey;
}

// Used when the font descriptor carries no usable ascent/descent.
const FALLBACK_ASCENT = 0.75;
const FALLBACK_DESCENT = -0.22;

// Runs tilted more than this (radians) are skipped: both the cover box and the
// replacement text are drawn axis-aligned, so a rotated run cannot be replaced
// convincingly.
const MAX_ANGLE = 0.02;

type TextContent = Awaited<ReturnType<PDFPageProxy["getTextContent"]>>;

// pdf.js maps every font to one of three fallback families; weight and slant
// are not reported, so the user picks those from the font dropdown.
const fontKeyFor = (family: string | undefined): EditFontKey => {
  if (family === "monospace") return "courier";
  if (family === "serif") return "times";
  return "helvetica";
};

export const extractTextRuns = async (page: PDFPageProxy): Promise<TextRun[]> => {
  const viewport = page.getViewport({ scale: 1 });
  const content: TextContent = await page.getTextContent();
  const runs: TextRun[] = [];

  content.items.forEach((item, index) => {
    // Marked-content markers have no `str`; whitespace-only runs are noise.
    if (!("str" in item) || !item.str.trim()) return;

    const style = content.styles[item.fontName];
    if (style?.vertical) return;

    const tx = Util.transform(viewport.transform, item.transform);
    if (Math.abs(Math.atan2(tx[1], tx[0])) > MAX_ANGLE) return;

    const fontSize = Math.hypot(tx[2], tx[3]);
    if (fontSize <= 0) return;

    const ascent = (style?.ascent || FALLBACK_ASCENT) * fontSize;
    const descent = (style?.descent || FALLBACK_DESCENT) * fontSize;
    const w = item.width > 0 ? item.width : fontSize * item.str.length * 0.5;

    runs.push({
      id: `run-${index}`,
      str: item.str,
      x: tx[4],
      y: tx[5] - ascent,
      w,
      h: ascent - descent,
      baselineOffset: ascent,
      fontSize,
      fontKey: fontKeyFor(style?.fontFamily),
    });
  });

  return runs;
};

const toHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;

// Most frequent colour in a list of packed RGB keys, or null if the list is
// empty. Backgrounds are usually flat, so an exact-match mode beats averaging —
// averaging would blend antialiased glyph edges into the result.
const modeColor = (counts: Map<number, number>): string | null => {
  let best = -1;
  let bestCount = 0;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  if (best < 0) return null;
  return toHex((best >> 16) & 0xff, (best >> 8) & 0xff, best & 0xff);
};

const distance = (a: string, b: string): number => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  return (
    Math.abs(((pa >> 16) & 0xff) - ((pb >> 16) & 0xff)) +
    Math.abs(((pa >> 8) & 0xff) - ((pb >> 8) & 0xff)) +
    Math.abs((pa & 0xff) - (pb & 0xff))
  );
};

// How different from the background a pixel must be to count as ink.
const INK_THRESHOLD = 90;

// Sample the page background around a run and the ink colour inside it, so a
// replacement can be covered and redrawn without the user picking colours by
// hand. `scale` is the CSS-px-per-point factor the canvas was rendered at.
export const sampleRunColors = (
  canvas: HTMLCanvasElement,
  run: TextRun,
  scale: number
): { bg: string; fg: string } => {
  const fallback = { bg: "#ffffff", fg: "#000000" };
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return fallback;

  const x0 = Math.max(0, Math.floor(run.x * scale));
  const y0 = Math.max(0, Math.floor(run.y * scale));
  const x1 = Math.min(canvas.width, Math.ceil((run.x + run.w) * scale));
  const y1 = Math.min(canvas.height, Math.ceil((run.y + run.h) * scale));
  if (x1 <= x0 || y1 <= y0) return fallback;

  // Background: a band just outside the run box, above and below it. Sampling
  // outside keeps glyph pixels out of the tally.
  const band = Math.max(2, Math.round(2 * scale));
  const bandTop = Math.max(0, y0 - band);
  const bandBottom = Math.min(canvas.height, y1 + band);
  const bgCounts = new Map<number, number>();

  const tally = (counts: Map<number, number>, sx: number, sy: number, sw: number, sh: number) => {
    if (sw <= 0 || sh <= 0) return;
    const { data } = ctx.getImageData(sx, sy, sw, sh);
    for (let i = 0; i < data.length; i += 4) {
      // Transparent pixels mean "nothing was painted here", i.e. paper.
      const key =
        data[i + 3] < 8 ? 0xffffff : (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  };

  try {
    tally(bgCounts, x0, bandTop, x1 - x0, y0 - bandTop);
    tally(bgCounts, x0, y1, x1 - x0, bandBottom - y1);
    const bg = modeColor(bgCounts) ?? fallback.bg;

    // Ink: the most common colour inside the box that is far enough from the
    // background. Antialiased edges are closer to the background than the
    // glyph body, so the body wins the tally.
    const inkCounts = new Map<number, number>();
    tally(inkCounts, x0, y0, x1 - x0, y1 - y0);
    let fg: string | null = null;
    let bestCount = 0;
    for (const [key, count] of inkCounts) {
      const hex = toHex((key >> 16) & 0xff, (key >> 8) & 0xff, key & 0xff);
      if (distance(hex, bg) < INK_THRESHOLD) continue;
      if (count > bestCount) {
        fg = hex;
        bestCount = count;
      }
    }

    return { bg, fg: fg ?? fallback.fg };
  } catch {
    // getImageData throws on a tainted canvas; local files never taint it, but
    // fall back rather than break the editor.
    return fallback;
  }
};
