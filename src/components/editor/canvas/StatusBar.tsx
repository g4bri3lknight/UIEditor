"use client";

import React from "react";
import { VIEWPORT_BREAKPOINTS, type ViewportKey } from "./constants";

interface StatusBarProps {
  viewport: ViewportKey;
  onViewportChange: (viewport: ViewportKey) => void;
}

export function StatusBar({
  viewport,
  onViewportChange,
}: StatusBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-1.5 border-t ios-border-subtle ios-satin-toolbar shrink-0 h-9 z-10">
      {/* Viewport breakpoint toggle */}
      <div className="flex items-center gap-0.5 bg-muted/90 rounded-lg p-0.5">
        {VIEWPORT_BREAKPOINTS.map((bp) => {
          const IconComp = bp.icon;
          const isActive = viewport === bp.key;
          return (
            <button
              key={bp.key}
              onClick={() => onViewportChange(bp.key)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-white dark:bg-neutral-700 shadow-sm text-foreground"
                  : "text-foreground/60 hover:text-foreground"
              }`}
              title={`${bp.label} — ${bp.width}px`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{bp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="flex items-center gap-1.5 text-[11px] text-foreground">
        <kbd className="px-1.5 py-0.5 bg-muted/80 rounded-md font-mono text-[10px]">⌘Z</kbd>
        <span>Annulla</span>
        <kbd className="px-1.5 py-0.5 bg-muted/80 rounded-md font-mono text-[10px] ml-2">⌫</kbd>
        <span>Elimina</span>
        <kbd className="px-1.5 py-0.5 bg-muted/80 rounded-md font-mono text-[10px] ml-2">Esc</kbd>
        <span>Deseleziona</span>
      </div>
    </div>
  );
}
