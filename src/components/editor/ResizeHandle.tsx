"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

// ── Sidebar resize hook ──
export function useSidebarResize(
  storageKey: string,
  defaultWidth: number,
  minWidth: number,
  maxWidth: number,
  direction: "left" | "right" = "left"
) {
  const [width, setWidth] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = Number(saved);
        if (parsed >= minWidth && parsed <= maxWidth) return parsed;
      }
    }
    return defaultWidth;
  });

  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const currentWidth = useRef(width);

  // Keep the ref in sync with the state
  useEffect(() => {
    currentWidth.current = width;
  }, [width]);

  const startResize = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMove = (ev: PointerEvent) => {
        if (!isResizing.current) return;
        const dx = ev.clientX - startX.current;
        // Right sidebar: dragging left (negative dx) should INCREASE width
        const newW = Math.max(
          minWidth,
          Math.min(
            startWidth.current + (direction === "right" ? -dx : dx),
            maxWidth
          )
        );
        setWidth(newW);
      };

      const onUp = () => {
        isResizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        localStorage.setItem(storageKey, String(currentWidth.current));
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [width, minWidth, maxWidth, storageKey, direction]
  );

  return { width, startResize };
}

// ── Resize handle component ──
export function ResizeHandle({
  onPointerDown,
  side,
}: {
  onPointerDown: (e: React.PointerEvent) => void;
  side: "left" | "right";
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      className={`group relative w-[5px] shrink-0 cursor-col-resize transition-colors duration-150
        ${side === "left" ? "border-r border-border" : "border-l border-border"}
        hover:bg-primary/20 active:bg-primary/30`}
      title="Trascina per ridimensionare"
    >
      {/* Visible grip indicator on hover */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 ${
          side === "left" ? "right-0" : "left-0"
        } translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none`}
      >
        <div className="flex flex-col gap-[2px] py-3 px-[2px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] h-[3px] rounded-full bg-primary/60"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
