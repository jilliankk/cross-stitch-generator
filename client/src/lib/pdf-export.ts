/**
 * PDF Export for Cross-Stitch Patterns
 * "Take this masterpiece home."
 *
 * Generates a multi-page PDF with:
 * - Cover page with pattern preview
 * - Color legend / thread list
 * - Full pattern grid with symbols (split across pages if needed)
 */

import { PatternData, countStitches, estimateSkeins } from "./pattern-engine";

interface PDFPage {
  canvas: HTMLCanvasElement;
}

const PAGE_WIDTH = 595; // A4 in points
const PAGE_HEIGHT = 842;
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const CONTENT_HEIGHT = PAGE_HEIGHT - 2 * MARGIN;

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width * 2; // 2x for retina
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);
  return canvas;
}

function drawCoverPage(pattern: PatternData, patternCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = createCanvas(PAGE_WIDTH, PAGE_HEIGHT);
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#FAF7F2";
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  // Title
  ctx.fillStyle = "#1A1A1A";
  ctx.font = "bold 28px 'Playfair Display', serif";
  ctx.textAlign = "center";
  ctx.fillText("Cross Stitch Pattern", PAGE_WIDTH / 2, 60);

  // Subtitle
  ctx.font = "14px 'Source Sans 3', sans-serif";
  ctx.fillStyle = "#666";
  ctx.fillText("Not Your Grandma's Stitch", PAGE_WIDTH / 2, 85);

  // Pattern preview
  const previewMaxWidth = CONTENT_WIDTH - 40;
  const previewMaxHeight = 400;
  const scale = Math.min(
    previewMaxWidth / patternCanvas.width,
    previewMaxHeight / patternCanvas.height
  );
  const previewW = patternCanvas.width * scale;
  const previewH = patternCanvas.height * scale;
  const previewX = (PAGE_WIDTH - previewW) / 2;
  const previewY = 110;

  // Border
  ctx.strokeStyle = "#DDD";
  ctx.lineWidth = 1;
  ctx.strokeRect(previewX - 2, previewY - 2, previewW + 4, previewH + 4);

  ctx.drawImage(patternCanvas, previewX, previewY, previewW, previewH);

  // Pattern info
  const infoY = previewY + previewH + 40;
  ctx.font = "12px 'Source Sans 3', sans-serif";
  ctx.fillStyle = "#333";
  ctx.textAlign = "left";

  const stitchCounts = countStitches(pattern);
  const totalStitches = Array.from(stitchCounts.values()).reduce((a, b) => a + b, 0);

  const info = [
    `Pattern Size: ${pattern.width} × ${pattern.height} stitches`,
    `Total Stitches: ${totalStitches.toLocaleString()}`,
    `Colors: ${pattern.palette.length}`,
    `Recommended Fabric: 14-count Aida`,
    `Finished Size (14ct): ${(pattern.width / 14).toFixed(1)}" × ${(pattern.height / 14).toFixed(1)}"`,
  ];

  info.forEach((line, i) => {
    ctx.fillText(line, MARGIN + 20, infoY + i * 20);
  });

  // Footer
  ctx.font = "10px 'Source Sans 3', sans-serif";
  ctx.fillStyle = "#999";
  ctx.textAlign = "center";
  ctx.fillText(
    "Generated with Not Your Grandma's Stitch — because some things are better stitched than said.",
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 30
  );

  return canvas;
}

function drawLegendPage(pattern: PatternData): HTMLCanvasElement {
  const canvas = createCanvas(PAGE_WIDTH, PAGE_HEIGHT);
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#FAF7F2";
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  // Title
  ctx.fillStyle = "#1A1A1A";
  ctx.font = "bold 20px 'Playfair Display', serif";
  ctx.textAlign = "center";
  ctx.fillText("Thread Legend", PAGE_WIDTH / 2, 50);

  // Table header
  const startY = 80;
  const colX = [MARGIN + 10, MARGIN + 40, MARGIN + 80, MARGIN + 200, MARGIN + 320, MARGIN + 420];
  const headers = ["Symbol", "DMC #", "Color Name", "Hex", "Stitches", "Skeins"];

  ctx.font = "bold 10px 'Source Sans 3', sans-serif";
  ctx.fillStyle = "#333";
  ctx.textAlign = "left";
  headers.forEach((h, i) => {
    ctx.fillText(h, colX[i], startY);
  });

  // Divider
  ctx.strokeStyle = "#CCC";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(MARGIN, startY + 8);
  ctx.lineTo(PAGE_WIDTH - MARGIN, startY + 8);
  ctx.stroke();

  // Rows
  const stitchCounts = countStitches(pattern);
  ctx.font = "10px 'Source Sans 3', sans-serif";

  pattern.palette.forEach((color, i) => {
    const y = startY + 25 + i * 22;
    if (y > PAGE_HEIGHT - MARGIN) return; // Skip if off page

    // Color swatch
    ctx.fillStyle = color.hex;
    ctx.fillRect(colX[0] - 2, y - 10, 16, 16);
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(colX[0] - 2, y - 10, 16, 16);

    // Symbol on swatch
    const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
    ctx.fillStyle = brightness > 128 ? "#000" : "#FFF";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      pattern.symbolMap.get(color.dmc) || "?",
      colX[0] + 6,
      y - 1
    );

    // Text columns
    ctx.textAlign = "left";
    ctx.font = "10px 'Source Sans 3', sans-serif";
    ctx.fillStyle = "#333";
    ctx.fillText(pattern.symbolMap.get(color.dmc) || "?", colX[1], y);
    ctx.fillText(`DMC ${color.dmc}`, colX[2], y);
    ctx.fillText(color.name, colX[3], y);
    ctx.fillText(color.hex, colX[4], y);

    const count = stitchCounts.get(color.dmc) || 0;
    ctx.fillText(count.toLocaleString(), colX[5], y);
  });

  // Footer
  ctx.font = "10px 'Source Sans 3', sans-serif";
  ctx.fillStyle = "#999";
  ctx.textAlign = "center";
  ctx.fillText(
    "Thread Legend — Not Your Grandma's Stitch",
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 30
  );

  return canvas;
}

function drawPatternPage(
  pattern: PatternData,
  startCol: number,
  startRow: number,
  cols: number,
  rows: number,
  pageNum: number,
  totalPages: number
): HTMLCanvasElement {
  const canvas = createCanvas(PAGE_WIDTH, PAGE_HEIGHT);
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  // Header
  ctx.fillStyle = "#333";
  ctx.font = "10px 'Source Sans 3', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(
    `Columns ${startCol + 1}-${Math.min(startCol + cols, pattern.width)} | Rows ${startRow + 1}-${Math.min(startRow + rows, pattern.height)}`,
    MARGIN,
    25
  );
  ctx.textAlign = "right";
  ctx.fillText(`Page ${pageNum} of ${totalPages}`, PAGE_WIDTH - MARGIN, 25);

  // Calculate cell size to fit
  const availW = CONTENT_WIDTH;
  const availH = CONTENT_HEIGHT - 30;
  const actualCols = Math.min(cols, pattern.width - startCol);
  const actualRows = Math.min(rows, pattern.height - startRow);
  const cellSize = Math.min(availW / actualCols, availH / actualRows, 14);

  const gridW = actualCols * cellSize;
  const gridH = actualRows * cellSize;
  const offsetX = MARGIN + (availW - gridW) / 2;
  const offsetY = 40;

  // Draw cells
  for (let dy = 0; dy < actualRows; dy++) {
    for (let dx = 0; dx < actualCols; dx++) {
      const cell = pattern.grid[startRow + dy][startCol + dx];
      const px = offsetX + dx * cellSize;
      const py = offsetY + dy * cellSize;

      ctx.fillStyle = cell.dmc.hex;
      ctx.fillRect(px, py, cellSize, cellSize);

      // Symbol
      if (cellSize >= 8) {
        const brightness = (cell.r * 299 + cell.g * 587 + cell.b * 114) / 1000;
        ctx.fillStyle = brightness > 128 ? "#000000" : "#FFFFFF";
        ctx.font = `${Math.max(6, cellSize * 0.55)}px 'JetBrains Mono', monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(cell.symbol, px + cellSize / 2, py + cellSize / 2);
      }
    }
  }

  // Grid lines
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 0.25;
  for (let dx = 0; dx <= actualCols; dx++) {
    const px = offsetX + dx * cellSize;
    ctx.beginPath();
    ctx.moveTo(px, offsetY);
    ctx.lineTo(px, offsetY + gridH);
    ctx.stroke();
  }
  for (let dy = 0; dy <= actualRows; dy++) {
    const py = offsetY + dy * cellSize;
    ctx.beginPath();
    ctx.moveTo(offsetX, py);
    ctx.lineTo(offsetX + gridW, py);
    ctx.stroke();
  }

  // Heavy lines every 10
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 0.75;
  for (let dx = 0; dx <= actualCols; dx += 10) {
    const px = offsetX + dx * cellSize;
    ctx.beginPath();
    ctx.moveTo(px, offsetY);
    ctx.lineTo(px, offsetY + gridH);
    ctx.stroke();
  }
  for (let dy = 0; dy <= actualRows; dy += 10) {
    const py = offsetY + dy * cellSize;
    ctx.beginPath();
    ctx.moveTo(offsetX, py);
    ctx.lineTo(offsetX + gridW, py);
    ctx.stroke();
  }

  // Row/col numbers
  ctx.font = "7px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#999";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let dy = 0; dy < actualRows; dy += 10) {
    ctx.fillText(
      String(startRow + dy + 1),
      offsetX - 3,
      offsetY + dy * cellSize + cellSize / 2
    );
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let dx = 0; dx < actualCols; dx += 10) {
    ctx.fillText(
      String(startCol + dx + 1),
      offsetX + dx * cellSize + cellSize / 2,
      offsetY + gridH + 3
    );
  }

  return canvas;
}

/**
 * Export pattern as a multi-page PDF using canvas-to-image approach.
 * Returns a Blob of the PDF.
 */
export async function exportPatternPDF(
  pattern: PatternData,
  patternCanvas: HTMLCanvasElement
): Promise<Blob> {
  // We'll use jspdf for PDF generation
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  // Cover page
  const coverCanvas = drawCoverPage(pattern, patternCanvas);
  const coverImg = coverCanvas.toDataURL("image/jpeg", 0.95);
  doc.addImage(coverImg, "JPEG", 0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  // Legend page
  doc.addPage();
  const legendCanvas = drawLegendPage(pattern);
  const legendImg = legendCanvas.toDataURL("image/jpeg", 0.95);
  doc.addImage(legendImg, "JPEG", 0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  // Pattern pages — split into chunks
  const colsPerPage = 50;
  const rowsPerPage = 55;

  const totalColPages = Math.ceil(pattern.width / colsPerPage);
  const totalRowPages = Math.ceil(pattern.height / rowsPerPage);
  const totalPatternPages = totalColPages * totalRowPages;
  const totalPages = 2 + totalPatternPages;

  let pageNum = 3;
  for (let rowPage = 0; rowPage < totalRowPages; rowPage++) {
    for (let colPage = 0; colPage < totalColPages; colPage++) {
      doc.addPage();
      const patternPageCanvas = drawPatternPage(
        pattern,
        colPage * colsPerPage,
        rowPage * rowsPerPage,
        colsPerPage,
        rowsPerPage,
        pageNum,
        totalPages
      );
      const patternImg = patternPageCanvas.toDataURL("image/jpeg", 0.95);
      doc.addImage(patternImg, "JPEG", 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
      pageNum++;
    }
  }

  return doc.output("blob");
}
