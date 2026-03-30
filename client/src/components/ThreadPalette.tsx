/**
 * ThreadPalette Component
 * Design: Thread color legend with swatch circles that look like wound thread.
 * "Your shopping list of passive aggression."
 */

import { StitchInfo } from "@/hooks/usePatternGenerator";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ThreadPaletteProps {
  stitchInfo: StitchInfo[];
  highlightColor: string | null;
  onHighlightColor: (dmcCode: string | null) => void;
}

export default function ThreadPalette({
  stitchInfo,
  highlightColor,
  onHighlightColor,
}: ThreadPaletteProps) {
  const totalStitches = stitchInfo.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h3
          className="text-base font-semibold text-foreground"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Thread Shopping List
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {stitchInfo.length} colors &middot; {totalStitches.toLocaleString()} total stitches
        </p>
        {highlightColor && (
          <button
            onClick={() => onHighlightColor(null)}
            className="text-xs text-hot-pink hover:underline mt-1 block"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Clear highlight
          </button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {stitchInfo.map((info, index) => {
            const isHighlighted = highlightColor === info.dmcCode;
            const isDimmed = highlightColor && !isHighlighted;
            const percentage = ((info.count / totalStitches) * 100).toFixed(1);

            return (
              <motion.button
                key={info.dmcCode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() =>
                  onHighlightColor(isHighlighted ? null : info.dmcCode)
                }
                className={`
                  w-full flex items-center gap-2.5 p-2 rounded-md text-left
                  transition-all duration-200 group
                  ${isHighlighted
                    ? "bg-blush/30 ring-1 ring-hot-pink/30"
                    : isDimmed
                    ? "opacity-40"
                    : "hover:bg-secondary/50"
                  }
                `}
              >
                {/* Color swatch */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: info.hex }}
                  />
                  {/* Symbol overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-[9px] font-bold font-mono leading-none"
                      style={{
                        color:
                          parseInt(info.hex.slice(1, 3), 16) * 0.299 +
                          parseInt(info.hex.slice(3, 5), 16) * 0.587 +
                          parseInt(info.hex.slice(5, 7), 16) * 0.114 >
                          128
                            ? "#000"
                            : "#FFF",
                      }}
                    >
                      {info.symbol}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold text-foreground truncate"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      DMC {info.dmcCode}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono ml-2 flex-shrink-0">
                      {info.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span
                      className="text-[10px] text-muted-foreground truncate"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      {info.colorName}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {percentage}%
                    </span>
                  </div>
                  {/* Usage bar */}
                  <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: info.hex,
                        minWidth: "2px",
                      }}
                    />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
