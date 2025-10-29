import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  title,
  children,
  initialFocusSelector,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    // Prevent body scroll when modal is open
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    // Close on ESC
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);

    // Focus handling
    const toFocus =
      (initialFocusSelector &&
        document.querySelector(initialFocusSelector)) ||
      containerRef.current;
    toFocus && toFocus.focus();

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, initialFocusSelector]);

  if (!open) return null;

  // Click outside to close
  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onMouseDown={onBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 opacity-100 transition-opacity" />

      {/* Panel */}
      <div
        ref={containerRef}
        tabIndex={-1}
        className="
          relative z-[1001] w-[min(900px,92vw)] max-h-[90vh] overflow-auto
          rounded-2xl bg-white shadow-2xl
          outline-none
          transition-all duration-200
          data-[state=enter]:opacity-0 data-[state=enter]:translate-y-2 data-[state=enter]:scale-[0.98]
          data-[state=entered]:opacity-100 data-[state=entered]:translate-y-0 data-[state=entered]:scale-100
          p-5 sm:p-6
        "
        data-state="entered"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          {title ? (
            <h2 className="text-xl font-semibold leading-6">{title}</h2>
          ) : null}
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}
