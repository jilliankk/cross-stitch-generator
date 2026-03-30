/**
 * PatternSettings Component
 * Design: Clean control panel with subversive tooltips.
 * "Fine-tune your passive aggression."
 */

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, RotateCcw, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PatternSettings as PatternSettingsType } from "@/hooks/usePatternGenerator";
import { motion } from "framer-motion";

interface PatternSettingsProps {
  settings: PatternSettingsType;
  onUpdateSettings: (updates: Partial<PatternSettingsType>) => void;
  onGenerate: () => void;
  onReset: () => void;
  isGenerating: boolean;
  imagePreview: string | null;
}

export default function PatternSettingsPanel({
  settings,
  onUpdateSettings,
  onGenerate,
  onReset,
  isGenerating,
  imagePreview,
}: PatternSettingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-6"
    >
      {/* Image preview thumbnail */}
      {imagePreview && (
        <div className="rounded-lg overflow-hidden border border-border">
          <img
            src={imagePreview}
            alt="Source"
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      {/* Grid Width */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Pattern Width
          </Label>
          <Tooltip>
            <TooltipTrigger>
              <Info size={14} className="text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[200px]">
                More stitches = more detail = more time questioning your life choices.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Slider
          value={[settings.gridWidth]}
          onValueChange={([val]) => onUpdateSettings({ gridWidth: val })}
          min={30}
          max={200}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          <span>30 (quick & dirty)</span>
          <span className="font-mono text-foreground font-semibold">{settings.gridWidth} stitches</span>
          <span>200 (masochist)</span>
        </div>
      </div>

      {/* Max Colors */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Thread Colors
          </Label>
          <Tooltip>
            <TooltipTrigger>
              <Info size={14} className="text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[200px]">
                Each color is a DMC thread you'll need to buy. Your wallet has been warned.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Slider
          value={[settings.maxColors]}
          onValueChange={([val]) => onUpdateSettings({ maxColors: val })}
          min={4}
          max={50}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          <span>4 (minimalist)</span>
          <span className="font-mono text-foreground font-semibold">{settings.maxColors} colors</span>
          <span>50 (rainbow chaos)</span>
        </div>
      </div>

      {/* Aida Count */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Fabric Count
          </Label>
          <Tooltip>
            <TooltipTrigger>
              <Info size={14} className="text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[200px]">
                Higher count = smaller stitches = you'll need reading glasses. 14ct is the sweet spot.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Select
          value={String(settings.aidaCount)}
          onValueChange={(val) => onUpdateSettings({ aidaCount: parseInt(val) })}
        >
          <SelectTrigger className="bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="11">11-count (big & bold)</SelectItem>
            <SelectItem value="14">14-count (the classic)</SelectItem>
            <SelectItem value="16">16-count (getting fancy)</SelectItem>
            <SelectItem value="18">18-count (show-off)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Size estimate */}
      <div className="bg-secondary/50 rounded-lg p-3 border border-border">
        <p className="text-xs text-muted-foreground mb-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          Estimated finished size
        </p>
        <p className="text-sm font-semibold text-foreground font-mono">
          {(settings.gridWidth / settings.aidaCount).toFixed(1)}" wide
        </p>
        <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          On {settings.aidaCount}-count Aida cloth
        </p>
      </div>

      {/* Action buttons */}
      <div className="space-y-2 pt-2">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {isGenerating ? (
            <>
              <Sparkles className="animate-spin mr-2" size={16} />
              Counting stitches...
            </>
          ) : (
            <>
              <Sparkles className="mr-2" size={16} />
              Generate Pattern
            </>
          )}
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          <RotateCcw className="mr-2" size={14} />
          Start Over
        </Button>
      </div>
    </motion.div>
  );
}
