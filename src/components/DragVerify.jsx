import { useState, useRef } from "react";

export default function DragVerify() {
  const [dragProgress, setDragProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const containerRef = useRef(null);

  const successUrl = import.meta.env.PUBLIC_SUCCESS_URL || "/";
  const failUrl = import.meta.env.PUBLIC_FAIL_URL || "/";

  const handlePointerDown = (e) => {
    if (isComplete) return;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId) || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const maxWidth = rect.width - 60;
    let newProgress = Math.min(Math.max(0, e.clientX - rect.left - 30), maxWidth);
    setDragProgress((newProgress / maxWidth) * 100);
  };

  const handlePointerUp = () => {
    if (dragProgress > 85) {
      setIsComplete(true);
      setDragProgress(100);
      setTimeout(() => (window.location.href = successUrl), 800);
    } else if (dragProgress > 0) {
      setShowFailure(true);
      setTimeout(() => {
        setDragProgress(0);
        setShowFailure(false);
        setTimeout(() => (window.location.href = failUrl), 1000);
      }, 1500);
    } else {
      setDragProgress(0);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        ref={containerRef}
        className="relative h-16 rounded-full bg-blue-200 flex items-center overflow-hidden shadow-md select-none"
      >
        <div className="absolute inset-0 flex items-center justify-center text-blue-800 font-medium pointer-events-none">
          {isComplete ? "Success ✓" : showFailure ? "Failed ✗" : "Drag to confirm"}
        </div>
        <div
          className={`absolute top-0 w-16 h-16 rounded-full flex items-center justify-center font-bold shadow-lg transition-all duration-300 ${
            isComplete ? "bg-green-500 text-white" : showFailure ? "bg-red-500 text-white" : "bg-blue-600 text-white"
          }`}
          style={{
            left: `${(dragProgress / 100) * (100 - 15)}%`,
            touchAction: "none", // 👈 Crucial for Safari iOS
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {isComplete ? "✓" : "⇨"}
        </div>
      </div>
    </div>
  );
}
