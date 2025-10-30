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

  // Mount to body via portal target
  const [mountNode, setMountNode] = useState(null);
  useEffect(() => setMountNode(document.body), []);

  // Lock background scroll + compensate for scrollbar shift
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
      document.body.style.overflow = prevOverflow || "";
      document.body.style.paddingRight = prevPaddingRight || "";
    };
  }, [open]);

  // Enter animation tick
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setAnim("entered"));
    return () => cancelAnimationFrame(id);
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOnEsc, onClose]);

  // Initial focus
  useEffect(() => {
    if (!open) return;
    const el =
      (initialFocusSelector && document.querySelector(initialFocusSelector)) ||
      panelRef.current;
    el?.focus?.();
  }, [open, initialFocusSelector]);

  if (!open || !mountNode) return null;

  const backdropClasses =
    "fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[1px] opacity-100"; // always full screen
  const panelWrapBase =
    "fixed inset-0 z-[9999] flex items-start md:items-center justify-center overflow-y-auto";
  const panelWrapAnim =
    anim === "entered" ? "opacity-100" : "opacity-0";
  const panelBase =
    "mt-10 md:mt-0 outline-none focus:outline-none rounded-2xl shadow-2xl bg-white dark:bg-neutral-900";
  const panelAnim =
    anim === "entered"
      ? "translate-y-0 scale-100"
      : "translate-y-4 md:translate-y-0 md:scale-95";
  const panelPadding = "p-5 md:p-6";
  const headerBase =
    "flex items-start justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-3";
  const closeBtn =
    "shrink-0 rounded-xl px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10";

  const stop = (e) => e.stopPropagation();

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={backdropClasses}
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Panel wrapper */}
      <div
        className={`${panelWrapBase} ${panelWrapAnim}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onClick={closeOnBackdrop ? onClose : undefined}
      >
        {/* Spacer for keyboard on mobile and vertical centering */}
        <div className="min-h-full md:min-h-0" />

        {/* Panel */}
        <div
          ref={panelRef}
          tabIndex={-1}
          className={`${panelBase} ${panelAnim} ${widthClass}`}
          onClick={stop}
          style={{ transition: "opacity 120ms ease, transform 120ms ease" }}
        >
          {/* Header */}
          {(title || onClose) && (
            <div className={`${headerBase} ${panelPadding}`}>
              {title ? (
                <h2 id={titleId} className="text-lg md:text-xl font-semibold">
                  {title}
                </h2>
              ) : (
                <span className="sr-only" id={titleId}>
                  Modal
                </span>
              )}
              {onClose && (
                <button className={closeBtn} onClick={onClose} aria-label="Close">
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className={panelPadding}>{children}</div>
        </div>
      </div>
    </>,
    mountNode
  );
}
