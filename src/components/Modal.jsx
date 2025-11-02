// src/components/Modal.jsx
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
}) {
  const panelRef = useRef(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`).current;
  const [anim, setAnim] = useState("enter"); // "enter" -> "entered"

  // Lock background scroll + compensate for scrollbar shift
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

    // Animate in on next frame
    const raf = requestAnimationFrame(() => setAnim("entered"));

    const onKeyDown = (e) => {
      if (e.key === "Escape" && closeOnEsc) {
        e.stopPropagation();
        onClose?.();
      }
      if (e.key === "Tab") {
        trapFocus(e);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // Focus the panel (or a specific target)
    const target =
      (initialFocusSelector && document.querySelector(initialFocusSelector)) ||
      panelRef.current;
    target?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(raf);
      setAnim("enter");
    };
  }, [open, closeOnEsc, initialFocusSelector, onClose]);

  if (!open) return null;

  const onBackdropMouseDown = (e) => {
    if (!closeOnBackdrop) return;
    if (e.target === e.currentTarget) onClose?.();
  };

  // Simple focus trap within the panel
  const trapFocus = (e) => {
    const root = panelRef.current;
    if (!root) return;
    const focusable = root.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) {
      e.preventDefault();
      root.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first || document.activeElement === root) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      onMouseDown={onBackdropMouseDown}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
          anim === "entered" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={[
          "relative z-[1101] max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-2xl outline-none",
          "transition-all duration-200",
          // padding via classes only (no inline padding to avoid React warnings)
          "p-5 sm:p-6",
          widthClass,
          anim === "entered"
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-2 scale-[0.98]",
        ].join(" ")}
        role="document"
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          {title ? (
            <h2 id={titleId} className="text-xl font-semibold leading-6">
              {title}
            </h2>
          ) : (
            <span />
          )}
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
