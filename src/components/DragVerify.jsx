import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

export default function DragVerification({ onVerified, onFailed }) {
  const [dragProgress, setDragProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const containerRef = useRef(null);

  const handlePointerMove = useCallback(
    (e) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId) || isComplete) return;

      const rect = containerRef.current.getBoundingClientRect();
      const maxWidth = rect.width - 60;
      const newProgress = Math.min(
        Math.max(0, e.clientX - rect.left - 30),
        maxWidth
      );
      setDragProgress((newProgress / maxWidth) * 100);
    },
    [isComplete]
  );

  const handlePointerUp = useCallback(() => {
    if (dragProgress > 85) {
      setIsComplete(true);
      setDragProgress(100);
      setTimeout(() => onVerified(), 800);
    } else if (dragProgress > 0) {
      setShowFailure(true);
      setTimeout(() => {
        setDragProgress(0);
        setShowFailure(false);
        setTimeout(() => onFailed(), 1000);
      }, 1500);
    } else {
      setDragProgress(0);
    }
  }, [dragProgress, onVerified, onFailed]);

  const handlePointerDown = (e) => {
    if (isComplete) return;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        ref={containerRef}
        className={`relative h-16 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
          isComplete
            ? "border-emerald-400 bg-emerald-50"
            : showFailure
            ? "border-red-400 bg-red-50"
            : dragProgress > 0
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        <motion.div
          className={`absolute inset-0 transition-colors duration-300 ${
            isComplete
              ? "bg-gradient-to-r from-emerald-200 to-emerald-300"
              : showFailure
              ? "bg-gradient-to-r from-red-200 to-red-300"
              : "bg-gradient-to-r from-blue-200 to-blue-300"
          }`}
          style={{ width: `${dragProgress}%` }}
        />

        <motion.div
          className={`absolute top-2 left-2 w-12 h-12 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 flex items-center justify-center ${
            isComplete
              ? "bg-emerald-500 shadow-lg shadow-emerald-500/25"
              : showFailure
              ? "bg-red-500 shadow-lg shadow-red-500/25"
              : dragProgress > 0
              ? "bg-blue-500 shadow-lg shadow-blue-500/25"
              : "bg-white shadow-lg border border-gray-200"
          }`}
          style={{
            left: `${(dragProgress / 100) * (100 - 15)}%`,
            touchAction: "none", // ✅ Safari fix
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          animate={dragProgress > 0 && !isComplete ? { scale: 1.1 } : { scale: 1 }}
        >
          <AnimatePresence mode="wait">
            {isComplete ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : showFailure ? (
              <AlertCircle className="w-6 h-6 text-white" />
            ) : (
              <ArrowRight
                className={`w-6 h-6 transition-colors ${
                  dragProgress > 0 ? "text-white" : "text-gray-400"
                }`}
              />
            )}
          </AnimatePresence>
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.span
            className={`font-medium transition-all duration-300 ${
              isComplete
                ? "text-emerald-700"
                : showFailure
                ? "text-red-700"
                : dragProgress > 50
                ? "text-white"
                : "text-gray-600"
            }`}
            animate={{ opacity: isComplete || showFailure ? 0.8 : 1 }}
          >
            {isComplete
              ? "Vérification terminée!"
              : showFailure
              ? "Vérification échouée"
              : "Glissez pour vérifier que vous êtes humain"}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
