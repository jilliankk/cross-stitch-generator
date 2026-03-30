import { Button } from "@/components/ui/button";
import { Scissors, Home } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="text-blush/60 text-sm tracking-[0.5em] mb-6 select-none">
          ✕ — ✕ — ✕ — ✕ — ✕
        </div>

        <div className="w-20 h-20 rounded-full bg-blush/20 flex items-center justify-center mx-auto mb-6">
          <Scissors className="text-hot-pink" size={32} />
        </div>

        <h1
          className="text-6xl font-bold text-foreground mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          404
        </h1>

        <h2
          className="text-xl font-semibold text-foreground mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          You've wandered off the grid.
        </h2>

        <p
          className="text-muted-foreground mb-8 leading-relaxed"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          This page doesn't exist — kind of like your motivation to finish that last cross-stitch project.
          Let's get you back on track.
        </p>

        <Button
          onClick={() => setLocation("/")}
          className="bg-primary text-primary-foreground font-semibold px-6 py-5"
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        >
          <Home className="mr-2" size={16} />
          Back to Stitching
        </Button>

        <div className="text-blush/60 text-sm tracking-[0.5em] mt-8 select-none">
          ✕ — ✕ — ✕ — ✕ — ✕
        </div>
      </motion.div>
    </div>
  );
}
