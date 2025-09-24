import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

const DragVerification = ({ onVerified, onFailed }) => {
  const [dragProgress, setDragProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const containerRef = useRef(null);

  const handlePointerMove = useCallback(
    (e) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId) || isComplete) return;

      const rect = containerRef.current.getBoundingClientRect();
      const maxWidth = rect.width - 60; // account for slider width
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
        {/* Progress background */}
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

        {/* Slider button */}
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
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <CheckCircle className="w-6 h-6 text-white" />
              </motion.div>
            ) : showFailure ? (
              <motion.div
                key="error"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <AlertCircle className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="arrow"
                initial={{ x: 0 }}
                animate={{ x: dragProgress > 0 ? 2 : 0 }}
                exit={{ scale: 0 }}
              >
                <ArrowRight
                  className={`w-6 h-6 transition-colors ${
                    dragProgress > 0 ? "text-white" : "text-gray-400"
                  }`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Text overlay */}
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
};

export default function Landing() {
  const [verificationStatus, setVerificationStatus] = useState("pending");

  // ✅ use env vars for redirect URLs
  const successUrl = import.meta.env.PUBLIC_SUCCESS_URL || "/";
  const failUrl = import.meta.env.PUBLIC_FAIL_URL || "/";

  const handleVerificationSuccess = () => {
    setVerificationStatus("success");
    setTimeout(() => {
      window.location.href = successUrl;
    }, 2000);
  };

  const handleVerificationFailure = () => {
    setVerificationStatus("failed");
    setTimeout(() => {
      window.location.href = failUrl;
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
          <AnimatePresence mode="wait">
            {verificationStatus === "pending" && (
              <motion.div
                key="verification"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-10 h-10 text-white" />
                </div>

                <h1 className="text-3xl md:text-4xl font-light text-slate-900 mb-4">
                  Vérification humaine
                </h1>

                <p className="text-slate-600 mb-12 leading-relaxed">
                  Veuillez compléter la vérification ci-dessous pour continuer.
                  Ceci nous aide à nous assurer que vous n'êtes pas un robot.
                </p>

                <DragVerification
                  onVerified={handleVerificationSuccess}
                  onFailed={handleVerificationFailure}
                />

                <p className="text-xs text-slate-400 mt-8">
                  Glissez le curseur complètement vers la droite pour vérifier
                </p>
              </motion.div>
            )}

            {verificationStatus === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-3xl font-light text-slate-900 mb-4">
                  Vérification réussie!
                </h2>

                <p className="text-slate-600 mb-8">
                  Merci d'avoir vérifié. Redirection en cours...
                </p>
              </motion.div>
            )}

            {verificationStatus === "failed" && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-3xl font-light text-slate-900 mb-4">
                  Vérification échouée
                </h2>

                <p className="text-slate-600 mb-8">
                  Impossible de vous vérifier comme humain. Redirection en cours...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
