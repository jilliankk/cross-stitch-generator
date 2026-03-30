/**
 * GeneratingOverlay Component
 * Design: Full-screen loading state with rotating snarky messages.
 * "Counting stitches and questioning life choices..."
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors } from "lucide-react";

const LOADING_MESSAGES = [
  "Counting stitches and questioning life choices...",
  "Converting pixels to passive aggression...",
  "Finding the perfect shade of petty...",
  "Threading the needle of your patience...",
  "Matching colors to your mood...",
  "Translating sass into cross-stitch...",
  "Almost there. Good things take time. And thread.",
  "Making your image stitch-worthy...",
];

export default function GeneratingOverlay() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="text-center space-y-6">
        {/* Animated scissors */}
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blush/30"
        >
          <Scissors className="text-hot-pink" size={32} />
        </motion.div>

        {/* Rotating messages */}
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-lg text-foreground max-w-md"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {LOADING_MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              className="w-2 h-2 rounded-full bg-hot-pink"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
