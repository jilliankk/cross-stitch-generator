/**
 * ImageUploader Component
 * Design: Subversive Craft — sweet-looking drop zone with cheeky copy.
 * "Drop your image here. We won't judge. Much."
 */

import { useState, useCallback, useRef } from "react";
import { Upload, ImagePlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imagePreview: string | null;
  onClear?: () => void;
}

const SNARKY_MESSAGES = [
  "Drop your image here. We won't judge. Much.",
  "Drag something in. We'll make it stitch-worthy.",
  "Your future masterpiece starts with a drag & drop.",
  "Go on, give us something to work with.",
];

export default function ImageUploader({ onImageUpload, imagePreview, onClear }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [message] = useState(() => SNARKY_MESSAGES[Math.floor(Math.random() * SNARKY_MESSAGES.length)]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onImageUpload(file);
      }
    },
    [onImageUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageUpload(file);
      }
    },
    [onImageUpload]
  );

  if (imagePreview) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-lg overflow-hidden border-2 border-border bg-card"
      >
        <img
          src={imagePreview}
          alt="Uploaded preview"
          className="w-full max-h-[400px] object-contain bg-white"
        />
        {onClear && (
          <button
            onClick={onClear}
            className="absolute top-3 right-3 bg-ink/70 hover:bg-ink/90 text-white rounded-full p-1.5 transition-colors"
          >
            <X size={16} />
          </button>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
          <p className="text-white text-sm font-medium" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Looking good. Let's turn this into something stitch-worthy.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative rounded-lg border-2 border-dashed p-12 text-center
          transition-all duration-300 cursor-pointer group
          ${isDragging
            ? "border-hot-pink bg-blush/30 scale-[1.02]"
            : "border-border hover:border-hot-pink/50 hover:bg-blush/10"
          }
        `}
      >
        {/* Decorative cross-stitch corners */}
        <div className="absolute top-2 left-2 text-blush opacity-40 text-xs tracking-widest select-none">
          ✕ ✕ ✕
        </div>
        <div className="absolute top-2 right-2 text-mint opacity-40 text-xs tracking-widest select-none">
          ✕ ✕ ✕
        </div>
        <div className="absolute bottom-2 left-2 text-lavender opacity-40 text-xs tracking-widest select-none">
          ✕ ✕ ✕
        </div>
        <div className="absolute bottom-2 right-2 text-butter opacity-40 text-xs tracking-widest select-none">
          ✕ ✕ ✕
        </div>

        <AnimatePresence mode="wait">
          {isDragging ? (
            <motion.div
              key="dragging"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-hot-pink/10 flex items-center justify-center">
                <ImagePlus className="text-hot-pink" size={28} />
              </div>
              <p className="text-hot-pink font-semibold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                Yes, right there. Drop it.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center group-hover:bg-blush/30 transition-colors">
                <Upload className="text-muted-foreground group-hover:text-hot-pink transition-colors" size={24} />
              </div>
              <div>
                <p className="text-foreground font-semibold text-lg mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {message}
                </p>
                <p className="text-muted-foreground text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                  PNG, JPG, or WEBP — whatever you've got
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                <Upload size={14} />
                Or click to browse
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </motion.div>
  );
}
