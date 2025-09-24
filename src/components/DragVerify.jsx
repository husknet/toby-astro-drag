import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

export default function DragVerification() {
  const [dragProgress, setDragProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const containerRef = useRef(null);

  // ✅ Env-based URLs
  const successUrl = import.meta.env.PUBLIC_SUCCESS_URL || "/";
  const failUrl = import.meta.env.PUBLIC_FAIL_URL || "/";

  // --- Move handlers ---
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || isComplete) return;
      const rect = containerRef.current.getBoundingClientRect();
      const maxWidth = rect.width - 60;
      const newProgress = Math.min(
        Math.max(0, e.clientX - rect.left - 30),
        maxWidth
      );
      setDragProgress((newProgress / maxWidth) * 100);
    },
    [isDragging, isComplete]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging || isComplete) return;
      const rect = containerRef.current.getBoundingClientRect();
      const maxWidth = rect.width - 60;
      const touch = e.touches[0];
      const newProgress = Math.min(
        Math.max(0, touch.clientX - rect.left - 30),
        maxWidth
      );
      setDragProgress((newProgress / maxWidth) * 100);
    },
    [isDragging, isComplete]
  );

  // --- Release handler ---
  const handleRelease = useCallback(() => {
    setIsDragging(false);

    if (dragProgress > 85) {
      setIsComplete(true);
      setDragProgress(100);
      setTimeout(() => {
        window.location.href = successUrl;
      }, 800);
    } else if (dragProgress > 0) {
      setShowFailure(true);
      setTimeout(() => {
        setDragProgress(0);
        setShowFailure(false);
        setTimeout(() => {
          window.location.href = failUrl;
        }, 1000);
      }, 1500);
    } else {
      setDragProgress(0);
    }
  }, [dragProgress, successUrl, failUrl]);

  // --- Start handlers ---
  const handleMouseDown = (e) => {
    if (isComplete) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchStart = (e) => {
    if (isComplete) return;
    setIsDragging(true);
    e.preventDefault();
  };

  // --- Attach listeners to document ---
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleRelease);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleRelease);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleRelease);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleRelease);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleRelease]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        ref={containerRef}
        className={`relative h-16 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
          isComplete
            ? "border-emerald-400 bg-emerald-50"
            : showFailure
            ? "border-red-400 bg-red-50"
            : isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        {/* Progress bar */}
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

        {/* Slider handle */}
        <motion.div
          className={`absolute top-2 left-2 w-12 h-12 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 flex items-center justify-center ${
            isComplete
              ? "bg-emerald-500 shadow-lg shadow-emerald-500/25"
              : showFailure
              ? "bg-red-500 shadow-lg shadow-red-500/25"
              : isDragging
              ? "bg-blue-500 shadow-lg shadow-blue-500/25"
              : "bg-white shadow-lg border border-gray-200"
          }`}
          style={{
            left: `${(dragProgress / 100) * (100 - 15)}%`,
            touchAction: "none", // ✅ prevent Safari scrolling
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          animate={isDragging && !isComplete ? { scale: 1.1 } : { scale: 1 }}
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

        {/* Overlay text */}
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
              ? "Verification complete!"
              : showFailure
              ? "Verification failed"
              : "Slide to verify you are human"}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
