// src/components/Modal.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Minimal, stable modal:
 * - No auto-focus by default (avoid focus stealing)
 * - No focus trap by default (can enable if needed)
 * - Backdrop + ESC close
 * - Scroll lock + scrollbar compensation
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - title?: string | ReactNode
 *  - widthClass?: string (Tailwind width, e.g. "w-[min(900px,92vw)]")
 *  - variant?: "light" | "dark" (just colors)
 *  - closeOnBackdrop?: boolean (default true)
 *  - closeOnEsc?: boolean (default true)
 *  - manageFocus?: boolean (default false)  // opt-in initial focus
 *  - initialFocusSelector?: string          // used only if manageFocus=true
 *  - trapFocus?: boolean (default false)    // opt-in focus trap
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  widthClass = "w-[min(900px,92vw)]",
  variant = "light",
  closeOnBackdrop = true,
  closeOnEsc = true,
  manageFocus = false,
  initialFocusSelector,
  trapFocus = false,
}) {
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef(null);     // backdrop container
  const panelRef = useRef(null);         // dialog panel
  const prevFocusedRef = useRef(null);   // element focused before open

  const isDark = variant === "dark";

  // Mount/unmount based on `open`
  useEffect(() => {
    setMounted(!!open);
  }, [open]);

  // Scroll lock while open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  // Optional: initial focus (OFF by default)
  useEffect(() => {
    if (!open || !manageFocus) return;

    prevFocusedRef.current = document.activeElement;

    const panel = panelRef.current;
    if (!panel) return;

    // Try focusing the requested element inside the panel
    let el = null;
    if (initialFocusSelector) {
      try { el = panel.querySelector(initialFocusSelector); } catch { /* ignore */ }
    }
    if (!el) {
      el = panel.querySelector('input, select, textarea, button, [tabindex]:not([tabindex="-1"])');
    }

    if (el && typeof el.focus === "function") el.focus();
    else if (typeof panel.focus === "function") panel.focus();

    return () => {
      const prev = prevFocusedRef.current;
      if (prev && typeof prev.focus === "function") prev.focus();
    };
  }, [open, manageFocus, initialFocusSelector]);

  // Optional: focus trap (OFF by default)
  useEffect(() => {
    if (!open || !trapFocus) return;
    const node = panelRef.current;
    if (!node) return;

    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const focusables = node.querySelectorAll(
        'a[href], area[href], input, select, textarea, button, iframe, [tabindex]:not([tabindex="-1"])'
      );
      const els = Array.from(focusables).filter(
        (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
      );
      if (els.length === 0) { e.preventDefault(); return; }

      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement;

      if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && (active === first || !node.contains(active))) {
        e.preventDefault(); last.focus();
      }
    };

    node.addEventListener("keydown", onKeyDown);
    return () => node.removeEventListener("keydown", onKeyDown);
  }, [open, trapFocus]);

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
      ref={containerRef}
      role="presentation"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (!closeOnBackdrop) return;
        // close only when clicking the backdrop, not the panel
        if (e.target === e.currentTarget) onClose?.();
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
        className={`relative max-h-[90vh] overflow-auto rounded-2xl shadow-xl ${widthClass} focus:outline-none`}
        style={{
          background: panelBg,
          color: panelColor,
          border: `1px solid ${borderColor}`,
          padding: 20,
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Close"
            className="rounded-xl px-2 py-1 border hover:shadow transition"
            style={{ borderColor, color: panelColor, background: "transparent" }}
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
