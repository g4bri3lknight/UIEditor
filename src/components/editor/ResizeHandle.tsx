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
  const latestWidth = useRef(width);

  // Keep ref in sync
  useEffect(() => {
    latestWidth.current = width;
  }, [width]);

  // Save to localStorage when width changes and not resizing
  useEffect(() => {
    if (!isResizing.current) {
      localStorage.setItem(storageKey, String(width));
    }
  }, [width, storageKey]);

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing.current = true;
      startX.current = e.clientX;
      startWidth.current = latestWidth.current;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMove = (ev: MouseEvent) => {
        if (!isResizing.current) return;
        ev.preventDefault();
        const dx = ev.clientX - startX.current;
        const newW = Math.max(
          minWidth,
          Math.min(
            startWidth.current + (direction === "right" ? -dx : dx),
            maxWidth
          )
        );
        setWidth(newW);
        latestWidth.current = newW;
      };

      const onUp = () => {
        isResizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        localStorage.setItem(storageKey, String(latestWidth.current));
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [minWidth, maxWidth, storageKey, direction]
  );

  return { width, startResize, isResizing };
}

// ── Resize handle component ──
// Full-height vertical strip — iOS satin style
export function ResizeHandle({
  onMouseDown,
  side,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
  side: "left" | "right";
}) {
  return (
    <div
      onMouseDown={onMouseDown}
      onDragStart={() => false}
      className={`
        group relative shrink-0 cursor-col-resize select-none
        w-[6px] h-full flex-none
        ios-satin
        ${side === "left" ? "border-r ios-border-subtle" : "border-l ios-border-subtle"}
        hover:bg-primary/15
        active:bg-primary/25
        transition-colors duration-100
      `}
      title="Trascina per ridimensionare"
    >
      {/* Grip dots indicator — centered vertically, only visual */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 pointer-events-none"
      >
        <div className="flex flex-col gap-[3px] py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] h-[3px] rounded-full bg-foreground/20 group-hover:bg-primary/60 transition-colors duration-100"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
