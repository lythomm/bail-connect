"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Color mappings matching DSFR theme color palettes
  const bgColors = {
    success: "bg-[#E8F6EE] border-[#18753C] text-[#1E522F]",
    error: "bg-[#FCEAEB] border-[#CE0500] text-[#7F1D1D]",
    warning: "bg-[#FFEFE0] border-[#B35C00] text-[#7C2D12]",
  };

  const hoverBgColors = {
    success: "hover:bg-[#18753C]/10",
    error: "hover:bg-[#CE0500]/10",
    warning: "hover:bg-[#B35C00]/10",
  };

  const icons = {
    success: (
      <svg className="w-5 h-5 text-[#18753C] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-[#CE0500] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-[#B35C00] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded border shadow-lg max-w-sm transition-all duration-300 animate-slide-in-right ${bgColors[type]}`}
      role="alert"
    >
      {icons[type]}
      <p className="text-sm font-medium flex-1 pr-2">{message}</p>
      <button
        onClick={onClose}
        className={`p-1 rounded-md transition-colors cursor-pointer ${hoverBgColors[type]}`}
        aria-label="Fermer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
