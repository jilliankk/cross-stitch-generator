/**
 * PatternViewer Component
 * Design: The main pattern display with zoom, pan, and view mode controls.
 * "Behold, your masterpiece."
 */

import { useRef, useEffect, useState, useCallback } from "react";
import { PatternData, renderPatternToCanvas } from "@/lib/pattern-engine";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { ZoomIn, ZoomOut, Grid3X3, Type, Maximize2, Download } from "lucide-react";
import { motion } from "framer-motion";

interface PatternViewerProps {
  pattern: PatternData;
  highlightColor?: string | null;
  onExportPDF: () => void;
  isExporting: boolean;
}

export default function PatternViewer({
  pattern,
  highlightColor,
  onExportPDF,
  isExporting,
}: PatternViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(12);
  const [showSymbols, setShowSymbols] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Render pattern whenever settings change
  useEffect(() => {
    if (!canvasRef.current || !pattern) return;
    renderPatternToCanvas(
      canvasRef.current,
      pattern,
      cellSize,
      showSymbols,
      showGrid,
      highlightColor
    );
  }, [pattern, cellSize, showSymbols, showGrid, highlightColor]);

  const zoomIn = useCallback(() => {
    setCellSize(prev => Math.min(prev + 2, 30));
  }, []);

  const zoomOut = useCallback(() => {
    setCellSize(prev => Math.max(prev - 2, 4));
  }, []);

  const fitToView = useCallback(() => {
    if (!containerRef.current || !pattern) return;
    const containerWidth = containerRef.current.clientWidth - 20;
    const containerHeight = containerRef.current.clientHeight - 20;
    const fitW = containerWidth / pattern.width;
    const fitH = containerHeight / pattern.height;
    setCellSize(Math.max(2, Math.min(Math.floor(Math.min(fitW, fitH)), 30)));
  }, [pattern]);

  // Get canvas for PDF export
  const getCanvas = useCallback(() => canvasRef.current, []);

  // Expose canvas via a data attribute for the parent to access
  useEffect(() => {
    if (canvasRef.current) {
      (canvasRef.current as any).__patternCanvas = true;
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-card border border-border rounded-t-lg">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={zoomOut} className="h-8 w-8 p-0">
            <ZoomOut size={14} />
          </Button>
          <span className="text-xs font-mono text-muted-foreground w-12 text-center">
            {cellSize}px
          </span>
          <Button variant="outline" size="sm" onClick={zoomIn} className="h-8 w-8 p-0">
            <ZoomIn size={14} />
          </Button>
          <Button variant="outline" size="sm" onClick={fitToView} className="h-8 px-2 ml-1">
            <Maximize2 size={14} className="mr-1" />
            <span className="text-xs">Fit</span>
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Toggle
            pressed={showGrid}
            onPressedChange={setShowGrid}
            size="sm"
            className="h-8 px-2"
          >
            <Grid3X3 size={14} className="mr-1" />
            <span className="text-xs">Grid</span>
          </Toggle>
          <Toggle
            pressed={showSymbols}
            onPressedChange={setShowSymbols}
            size="sm"
            className="h-8 px-2"
          >
            <Type size={14} className="mr-1" />
            <span className="text-xs">Symbols</span>
          </Toggle>
        </div>

        <Button
          onClick={onExportPDF}
          disabled={isExporting}
          size="sm"
          className="h-8 bg-primary text-primary-foreground"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          <Download size={14} className="mr-1" />
          {isExporting ? "Stitching PDF..." : "Export PDF"}
        </Button>
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-white border border-t-0 border-border rounded-b-lg"
        style={{ minHeight: "400px" }}
      >
        <div className="p-2 inline-block min-w-full min-h-full">
          <canvas
            ref={canvasRef}
            className="block mx-auto"
            style={{
              imageRendering: cellSize <= 6 ? "pixelated" : "auto",
            }}
          />
        </div>
      </div>

      {/* Pattern info bar */}
      <div className="flex items-center justify-between mt-2 px-1">
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {pattern.width} × {pattern.height} stitches &middot; {pattern.palette.length} colors
        </p>
        <p className="text-xs text-muted-foreground italic" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          Every stitch is a tiny act of rebellion
        </p>
      </div>
    </motion.div>
  );
}
