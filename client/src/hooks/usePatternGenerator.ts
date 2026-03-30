/**
 * usePatternGenerator Hook
 * Manages the full state machine for the cross-stitch pattern generator.
 * "Counting stitches and questioning life choices..."
 */

import { useState, useCallback, useRef } from "react";
import {
  PatternData,
  loadImage,
  generatePattern,
  countStitches,
  estimateSkeins,
} from "@/lib/pattern-engine";

export type GeneratorStep = "upload" | "configure" | "generating" | "result";

export interface PatternSettings {
  gridWidth: number;
  maxColors: number;
  aidaCount: number;
}

export interface StitchInfo {
  dmcCode: string;
  colorName: string;
  hex: string;
  symbol: string;
  count: number;
  skeins: number;
}

const DEFAULT_SETTINGS: PatternSettings = {
  gridWidth: 80,
  maxColors: 20,
  aidaCount: 14,
};

export function usePatternGenerator() {
  const [step, setStep] = useState<GeneratorStep>("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [settings, setSettings] = useState<PatternSettings>(DEFAULT_SETTINGS);
  const [pattern, setPattern] = useState<PatternData | null>(null);
  const [stitchInfo, setStitchInfo] = useState<StitchInfo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      setImageFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Pre-load the image
      const img = await loadImage(file);
      imageRef.current = img;

      setStep("configure");
    } catch (err) {
      setError("Couldn't read that image. Try another one — we're not picky, just particular.");
      console.error(err);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!imageRef.current) {
      setError("No image loaded. Did it ghost us?");
      return;
    }

    try {
      setError(null);
      setIsGenerating(true);
      setStep("generating");

      // Small delay to let the UI update with the loading state
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = generatePattern(
        imageRef.current,
        settings.gridWidth,
        settings.maxColors
      );

      // Calculate stitch info
      const counts = countStitches(result);
      const info: StitchInfo[] = result.palette.map(color => {
        const count = counts.get(color.dmc) || 0;
        return {
          dmcCode: color.dmc,
          colorName: color.name,
          hex: color.hex,
          symbol: result.symbolMap.get(color.dmc) || "?",
          count,
          skeins: estimateSkeins(count, settings.aidaCount),
        };
      });

      // Sort by stitch count descending
      info.sort((a, b) => b.count - a.count);

      setPattern(result);
      setStitchInfo(info);
      setStep("result");
    } catch (err) {
      setError("Something went wrong during generation. The thread got tangled. Try again?");
      setStep("configure");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [settings]);

  const handleReset = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setStep("upload");
    setImageFile(null);
    setImagePreview(null);
    setPattern(null);
    setStitchInfo([]);
    setSettings(DEFAULT_SETTINGS);
    setError(null);
    imageRef.current = null;
  }, [imagePreview]);

  const handleBackToConfigure = useCallback(() => {
    setStep("configure");
    setPattern(null);
    setStitchInfo([]);
  }, []);

  const updateSettings = useCallback((updates: Partial<PatternSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    step,
    imageFile,
    imagePreview,
    settings,
    pattern,
    stitchInfo,
    isGenerating,
    error,
    handleImageUpload,
    handleGenerate,
    handleReset,
    handleBackToConfigure,
    updateSettings,
  };
}
