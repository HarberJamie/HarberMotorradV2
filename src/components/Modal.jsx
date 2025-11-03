import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  title,
  children,
  widthClass = "w-[min(900px,92vw)]",
  initialFocusSelector,
  closeOnBackdrop = true,
  closeOnEsc = true,
  variant = "light", // "light" | "dark"
}) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef(null);
  const backdropRef = useRef(null);
  const previouslyFocused = useRef(null);

  const isDark = variant === "dark";

  // Mount/unmount
  useEffect(() => {
    if (!open) return setMounted(false);
    setMounted(true);
  }, [open]);

  // Lock scroll
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  // Focus handling
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;
    const focusTarget =
      (initialFocusSelector &&
        document.querySelector(initialFocusSelector)) ||
      panelRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    if (focusTarget) requestAnimationFrame(() => focusTarget.focus());
    else panelRef.current?.focus();
    return () => {
      if (previouslyFocused.current && previouslyFocused.current.focus) {
        previouslyFocused.current.focus();
      }
    };
  }, [open, initialFocusSelector]);

  // ESC to close
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEsc, onClose]);

  if (!mounted) return null;

  const panelBg = isDark ? "#0f142a" : "#ffffff";
  const panelColor = isDark ? "#f5f6fa" : "#111827";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return createPortal(
    <div
      ref={backdropRef}
      role="presentation"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (!closeOnBackdrop) return;
        if (e.target === backdropRef.current) onClose?.();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        ref={panelRef}
        className={`relative max-h-[90vh] overflow-auto rounded-2xl shadow-xl ${widthClass}`}
        style={{
          background: panelBg,
          color: panelColor,
          border: `1px solid ${borderColor}`,
          padding: 20,
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Close"
            className="rounded-xl px-2 py-1 border hover:shadow transition"
            style={{
              borderColor,
              color: panelColor,
              background: "transparent",
            }}
          >
            ✕
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
}
