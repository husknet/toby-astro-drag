import { useState, useRef } from "react";

export default function DragVerify() {
  const [offset, setOffset] = useState(0);
  const [verified, setVerified] = useState(false);
  const sliderRef = useRef(null);

  const successUrl = import.meta.env.PUBLIC_SUCCESS_URL || "/";
  const failUrl = import.meta.env.PUBLIC_FAIL_URL || "/";

  const handlePointerDown = (e) => {
    if (verified) return;
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!e.target.hasPointerCapture(e.pointerId) || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    let newOffset = e.clientX - rect.left - 32;
    newOffset = Math.max(0, Math.min(newOffset, rect.width - 64));
    setOffset(newOffset);
  };

  const handlePointerUp = (e) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const successThreshold = rect.width - 80;
    if (offset >= successThreshold) {
      setVerified(true);
      setTimeout(() => (window.location.href = successUrl), 1500);
    } else {
      setOffset(0);
      alert("Verification failed. Redirecting...");
      window.location.href = failUrl;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        ref={sliderRef}
        className="relative h-16 bg-blue-200 rounded-full flex items-center overflow-hidden shadow-md select-none"
      >
        <div className="absolute inset-0 flex items-center justify-center text-blue-800 font-medium pointer-events-none">
          {verified ? "Success ✓" : "Drag to confirm"}
        </div>
        <div
          className={`absolute top-0 left-0 w-16 h-16 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center font-bold shadow-lg transition-all duration-300 ${
            verified ? "bg-green-500 text-white" : "bg-blue-600 text-white"
          }`}
          style={{ transform: `translateX(${offset}px)` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {verified ? "✓" : "⇨"}
        </div>
      </div>
    </div>
  );
}
