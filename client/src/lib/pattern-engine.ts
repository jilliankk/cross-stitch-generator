/**
 * Cross-Stitch Pattern Engine
 * Handles image processing, color quantization, and pattern generation.
 * "Because some things are better stitched than said."
 */

import { DMC_COLORS, DMCColor, findClosestDMC } from "./dmc-palette";

export interface PatternCell {
  r: number;
  g: number;
  b: number;
  dmc: DMCColor;
  symbol: string;
}

export interface PatternData {
  width: number;
  height: number;
  grid: PatternCell[][];
  palette: DMCColor[];
  symbolMap: Map<string, string>;
}

// Symbols used to represent different colors on the pattern
const SYMBOLS = [
  "X", "O", "/", "\\", "+", "-", "|", "*", "#", "@",
  "=", "~", "^", "v", "<", ">", "!", "?", "%", "&",
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
  "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U",
  "V", "W", "Y", "Z", "1", "2", "3", "4", "5", "6",
  "7", "8", "9", "0", "a", "b", "c", "d", "e", "f",
];

/**
 * Load an image from a File object and return pixel data.
 */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Downsample an image to the target grid size and extract pixel data.
 */
export function downsampleImage(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): { r: number; g: number; b: number }[][] {
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d")!;

  // Disable image smoothing for crisp pixel sampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const pixels: { r: number; g: number; b: number }[][] = [];

  for (let y = 0; y < targetHeight; y++) {
    const row: { r: number; g: number; b: number }[] = [];
    for (let x = 0; x < targetWidth; x++) {
      const i = (y * targetWidth + x) * 4;
      row.push({
        r: imageData.data[i],
        g: imageData.data[i + 1],
        b: imageData.data[i + 2],
      });
    }
    pixels.push(row);
  }

  return pixels;
}

/**
 * Simple median-cut color quantization to reduce colors to maxColors.
 */
function quantizeColors(
  pixels: { r: number; g: number; b: number }[][],
  maxColors: number
): Map<string, { r: number; g: number; b: number }> {
  // Collect all pixel colors
  const allPixels: { r: number; g: number; b: number }[] = [];
  for (const row of pixels) {
    for (const p of row) {
      allPixels.push(p);
    }
  }

  // Simple k-means-ish approach: find dominant colors
  // First, map all pixels to their closest DMC color
  const dmcCounts = new Map<string, { count: number; color: DMCColor }>();
  for (const p of allPixels) {
    const dmc = findClosestDMC(p.r, p.g, p.b);
    const key = dmc.dmc;
    const existing = dmcCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      dmcCounts.set(key, { count: 1, color: dmc });
    }
  }

  // Sort by frequency and take top maxColors
  const sorted = Array.from(dmcCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, maxColors);

  const selectedDMCs = new Map<string, { r: number; g: number; b: number }>();
  for (const [key, val] of sorted) {
    selectedDMCs.set(key, { r: val.color.r, g: val.color.g, b: val.color.b });
  }

  return selectedDMCs;
}

/**
 * Generate a cross-stitch pattern from an image.
 */
export function generatePattern(
  img: HTMLImageElement,
  gridWidth: number,
  maxColors: number
): PatternData {
  // Calculate grid height maintaining aspect ratio
  const aspectRatio = img.height / img.width;
  const gridHeight = Math.round(gridWidth * aspectRatio);

  // Downsample image
  const pixels = downsampleImage(img, gridWidth, gridHeight);

  // Quantize colors to maxColors DMC colors
  const selectedColors = quantizeColors(pixels, maxColors);
  const selectedDMCList = Array.from(selectedColors.keys());

  // Build the grid, mapping each pixel to the closest selected DMC color
  const palette: DMCColor[] = [];
  const paletteMap = new Map<string, DMCColor>();
  const symbolMap = new Map<string, string>();
  let symbolIndex = 0;

  const grid: PatternCell[][] = [];

  for (let y = 0; y < gridHeight; y++) {
    const row: PatternCell[] = [];
    for (let x = 0; x < gridWidth; x++) {
      const p = pixels[y][x];

      // Find closest color from the selected palette
      let minDist = Infinity;
      let bestDMCKey = selectedDMCList[0];

      for (const dmcKey of selectedDMCList) {
        const c = selectedColors.get(dmcKey)!;
        const dr = p.r - c.r;
        const dg = p.g - c.g;
        const db = p.b - c.b;
        const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
        if (dist < minDist) {
          minDist = dist;
          bestDMCKey = dmcKey;
        }
      }

      // Get or create DMC color entry
      let dmcColor = paletteMap.get(bestDMCKey);
      if (!dmcColor) {
        dmcColor = DMC_COLORS.find(c => c.dmc === bestDMCKey)!;
        paletteMap.set(bestDMCKey, dmcColor);
        palette.push(dmcColor);
        symbolMap.set(bestDMCKey, SYMBOLS[symbolIndex % SYMBOLS.length]);
        symbolIndex++;
      }

      row.push({
        r: dmcColor.r,
        g: dmcColor.g,
        b: dmcColor.b,
        dmc: dmcColor,
        symbol: symbolMap.get(bestDMCKey)!,
      });
    }
    grid.push(row);
  }

  return {
    width: gridWidth,
    height: gridHeight,
    grid,
    palette,
    symbolMap,
  };
}

/**
 * Count stitches per color in the pattern.
 */
export function countStitches(pattern: PatternData): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of pattern.grid) {
    for (const cell of row) {
      const key = cell.dmc.dmc;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return counts;
}

/**
 * Estimate skeins needed (each DMC skein has ~8m of thread,
 * and each cross stitch on 14-count aida uses ~1.3cm of thread).
 */
export function estimateSkeins(stitchCount: number, aidaCount: number = 14): number {
  const threadPerStitch = 0.013 * (14 / aidaCount); // meters
  const threadPerSkein = 8; // meters
  const skeins = (stitchCount * threadPerStitch) / threadPerSkein;
  return Math.ceil(skeins * 10) / 10; // Round up to 1 decimal
}

/**
 * Render the pattern to a canvas element for preview.
 */
export function renderPatternToCanvas(
  canvas: HTMLCanvasElement,
  pattern: PatternData,
  cellSize: number,
  showSymbols: boolean,
  showGrid: boolean,
  highlightColor?: string | null
) {
  const ctx = canvas.getContext("2d")!;
  const width = pattern.width * cellSize;
  const height = pattern.height * cellSize;

  canvas.width = width;
  canvas.height = height;

  // Draw cells
  for (let y = 0; y < pattern.height; y++) {
    for (let x = 0; x < pattern.width; x++) {
      const cell = pattern.grid[y][x];
      const px = x * cellSize;
      const py = y * cellSize;

      // Fill with color
      if (highlightColor && cell.dmc.dmc !== highlightColor) {
        ctx.fillStyle = `rgba(${cell.r}, ${cell.g}, ${cell.b}, 0.2)`;
      } else {
        ctx.fillStyle = `rgb(${cell.r}, ${cell.g}, ${cell.b})`;
      }
      ctx.fillRect(px, py, cellSize, cellSize);

      // Draw symbol
      if (showSymbols && cellSize >= 10) {
        const brightness = (cell.r * 299 + cell.g * 587 + cell.b * 114) / 1000;
        ctx.fillStyle = brightness > 128 ? "#000000" : "#FFFFFF";
        ctx.font = `${Math.max(8, cellSize * 0.6)}px 'JetBrains Mono', monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(cell.symbol, px + cellSize / 2, py + cellSize / 2);
      }
    }
  }

  // Draw grid lines
  if (showGrid && cellSize >= 4) {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= pattern.width; x++) {
      const px = x * cellSize;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
    }

    for (let y = 0; y <= pattern.height; y++) {
      const py = y * cellSize;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }

    // Draw heavier lines every 10 cells
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 1;

    for (let x = 0; x <= pattern.width; x += 10) {
      const px = x * cellSize;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
    }

    for (let y = 0; y <= pattern.height; y += 10) {
      const py = y * cellSize;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }
  }
}
