/**
 * Home Page — "Not Your Grandma's Stitch"
 * Design Philosophy: Subversive Craft Punk
 * Sweet-looking craft aesthetic hiding snarky energy.
 * Weaponized pastels. Floral borders framing attitude.
 */

import { useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Scissors, Heart, Sparkles, ArrowDown, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePatternGenerator } from "@/hooks/usePatternGenerator";
import ImageUploader from "@/components/ImageUploader";
import PatternSettingsPanel from "@/components/PatternSettings";
import PatternViewer from "@/components/PatternViewer";
import ThreadPalette from "@/components/ThreadPalette";
import GeneratingOverlay from "@/components/GeneratingOverlay";
import { exportPatternPDF } from "@/lib/pdf-export";
import { renderPatternToCanvas } from "@/lib/pattern-engine";
import { toast } from "sonner";

// CDN image URLs
const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234577742/bdBQa25eMBQCU7k6qDTcaV/hero-subversive-TYAJ3jhvGd29W3qkjUq5Th.webp";
const SAMPLE_1 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234577742/bdBQa25eMBQCU7k6qDTcaV/subversive-sample-1-bCsVWmheHy4LoGZtJ9mgE4.webp";
const SAMPLE_2 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234577742/bdBQa25eMBQCU7k6qDTcaV/subversive-sample-2-JdzkihQwJptWwifizRYbMB.webp";
const BG_TEXTURE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663234577742/bdBQa25eMBQCU7k6qDTcaV/pattern-workspace-bg-VzFeecrRbrQo7BvJrFE2xt.webp";

export default function Home() {
  const {
    step,
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
  } = usePatternGenerator();

  const [highlightColor, setHighlightColor] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleExportPDF = useCallback(async () => {
    if (!pattern) return;

    try {
      setIsExporting(true);
      toast.info("Stitching your PDF together...", { duration: 2000 });

      // Create a temporary canvas for the PDF cover
      const tempCanvas = document.createElement("canvas");
      renderPatternToCanvas(tempCanvas, pattern, 8, true, true, null);

      const blob = await exportPatternPDF(pattern, tempCanvas);

      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cross-stitch-pattern.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Pattern exported! Take this masterpiece home.", { duration: 3000 });
    } catch (err) {
      console.error(err);
      toast.error("PDF export failed. The thread got tangled. Try again?");
    } finally {
      setIsExporting(false);
    }
  }, [pattern]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Generating overlay */}
      <AnimatePresence>
        {isGenerating && <GeneratingOverlay />}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Scissors className="text-hot-pink" size={20} />
            <span
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Not Your Grandma's Stitch
            </span>
          </div>
          {step !== "upload" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              <ChevronLeft size={14} className="mr-1" />
              New Pattern
            </Button>
          )}
        </div>
      </nav>

      {/* HERO SECTION — only visible on upload step */}
      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero */}
            <section className="relative overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${HERO_IMG})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />

              <div className="relative container py-20 md:py-28">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="max-w-2xl"
                >
                  {/* Decorative cross-stitch border */}
                  <div className="text-blush/60 text-sm tracking-[0.5em] mb-4 select-none">
                    ✕ — ✕ — ✕ — ✕ — ✕
                  </div>

                  <h1
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-ink leading-tight mb-4"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Turn your pettiness
                    <br />
                    <span className="text-hot-pink">into a pattern.</span>
                  </h1>

                  <p
                    className="text-lg md:text-xl text-charcoal/80 mb-8 max-w-lg"
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    Upload any image. Get a cross-stitch pattern with DMC thread colors,
                    symbols, and a PDF you can actually follow.
                    Because some things are better stitched than said.
                  </p>

                  <div className="flex items-center gap-4">
                    <Button
                      onClick={scrollToWorkspace}
                      size="lg"
                      className="bg-primary text-primary-foreground font-semibold px-8 py-6 text-base"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      <Sparkles className="mr-2" size={18} />
                      Start Stitching
                    </Button>
                    <span
                      className="text-sm text-muted-foreground hidden sm:inline"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    >
                      Free. No signup. No BS.
                    </span>
                  </div>

                  <div className="text-blush/60 text-sm tracking-[0.5em] mt-6 select-none">
                    ✕ — ✕ — ✕ — ✕ — ✕
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-secondary/30">
              <div className="container">
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: <Scissors className="text-hot-pink" size={24} />,
                      title: "Image to Pattern",
                      desc: "Drop in any image — your cat, your ex's face, that meme. We'll turn it into a stitchable grid.",
                    },
                    {
                      icon: <Heart className="text-hot-pink" size={24} />,
                      title: "Real DMC Colors",
                      desc: "Matched to actual DMC thread numbers you can buy at the craft store. Your wallet's ready.",
                    },
                    {
                      icon: <Sparkles className="text-hot-pink" size={24} />,
                      title: "PDF Export",
                      desc: "Download a full pattern with color legend, symbols, and grid. Print it. Stitch it. Frame it. Gift it passive-aggressively.",
                    },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 }}
                      className="bg-card rounded-lg p-6 border border-border hover:border-hot-pink/30 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-blush/20 flex items-center justify-center mb-4">
                        {feature.icon}
                      </div>
                      <h3
                        className="text-lg font-semibold text-foreground mb-2"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className="text-sm text-muted-foreground leading-relaxed"
                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        {feature.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Gallery */}
            <section className="py-16">
              <div className="container">
                <h2
                  className="text-2xl md:text-3xl font-bold text-center text-foreground mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Stitch Inspo
                </h2>
                <p
                  className="text-center text-muted-foreground mb-10"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  Sweet on the outside. Salty on the inside.
                </p>
                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  <motion.div
                    whileHover={{ scale: 1.02, rotate: -1 }}
                    className="rounded-lg overflow-hidden border-2 border-border shadow-sm"
                  >
                    <img src={SAMPLE_1} alt="Cross stitch sample 1" className="w-full" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    className="rounded-lg overflow-hidden border-2 border-border shadow-sm"
                  >
                    <img src={SAMPLE_2} alt="Cross stitch sample 2" className="w-full" />
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Scroll indicator */}
            <div ref={workspaceRef} />

            {/* Upload Section */}
            <section
              className="py-16 relative"
              style={{
                backgroundImage: `url(${BG_TEXTURE})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-background/70" />
              <div className="relative container">
                <div className="max-w-xl mx-auto">
                  <h2
                    className="text-2xl md:text-3xl font-bold text-center text-foreground mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Let's Make Something
                  </h2>
                  <p
                    className="text-center text-muted-foreground mb-8"
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    Upload an image and we'll handle the rest. Mostly.
                  </p>
                  <ImageUploader
                    onImageUpload={handleImageUpload}
                    imagePreview={null}
                  />
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-border">
              <div className="container text-center">
                <div className="text-blush/60 text-xs tracking-[0.5em] mb-3 select-none">
                  ✕ — ✕ — ✕ — ✕ — ✕
                </div>
                <p
                  className="text-sm text-muted-foreground"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  Made with{" "}
                  <Heart className="inline text-hot-pink" size={12} />{" "}
                  and a healthy dose of sarcasm
                </p>
                <p
                  className="text-xs text-muted-foreground/60 mt-1"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  Not Your Grandma's Stitch &copy; {new Date().getFullYear()}
                </p>
              </div>
            </footer>
          </motion.div>
        )}

        {/* CONFIGURE STEP */}
        {step === "configure" && (
          <motion.div
            key="configure"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <div className="container py-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2
                    className="text-2xl font-bold text-foreground"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Fine-Tune Your Masterpiece
                  </h2>
                  <p
                    className="text-muted-foreground mt-1"
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    Adjust the settings, then hit generate. We'll do the tedious math.
                  </p>
                </div>

                <div className="grid md:grid-cols-[1fr_320px] gap-8">
                  {/* Image preview */}
                  <div>
                    <ImageUploader
                      onImageUpload={handleImageUpload}
                      imagePreview={imagePreview}
                      onClear={handleReset}
                    />
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                      >
                        <p className="text-sm text-destructive" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Settings panel */}
                  <div className="bg-card border border-border rounded-lg p-5">
                    <PatternSettingsPanel
                      settings={settings}
                      onUpdateSettings={updateSettings}
                      onGenerate={handleGenerate}
                      onReset={handleReset}
                      isGenerating={isGenerating}
                      imagePreview={imagePreview}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* RESULT STEP */}
        {step === "result" && pattern && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <div className="container py-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2
                    className="text-xl font-bold text-foreground"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Behold, Your Masterpiece
                  </h2>
                  <p
                    className="text-sm text-muted-foreground"
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  >
                    {pattern.width} × {pattern.height} stitches &middot; {pattern.palette.length} DMC colors
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToConfigure}
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  <ChevronLeft size={14} className="mr-1" />
                  Adjust Settings
                </Button>
              </div>

              {/* Workspace: Pattern + Palette */}
              <div className="grid lg:grid-cols-[1fr_280px] gap-4" style={{ height: "calc(100vh - 180px)" }}>
                {/* Pattern viewer */}
                <PatternViewer
                  pattern={pattern}
                  highlightColor={highlightColor}
                  onExportPDF={handleExportPDF}
                  isExporting={isExporting}
                />

                {/* Thread palette */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <ThreadPalette
                    stitchInfo={stitchInfo}
                    highlightColor={highlightColor}
                    onHighlightColor={setHighlightColor}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
