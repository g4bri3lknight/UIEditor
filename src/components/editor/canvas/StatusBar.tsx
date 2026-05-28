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
    <div className="flex items-center justify-between px-4 py-1.5 border-t ios-border-subtle ios-satin-toolbar shrink-0 h-8 z-10">
      {/* Viewport breakpoint toggle — iOS segmented control style */}
      <div className="flex items-center gap-0.5 bg-muted/90 rounded-lg p-0.5">
        {VIEWPORT_BREAKPOINTS.map((bp) => {
          const IconComp = bp.icon;
          const isActive = viewport === bp.key;
          return (
            <button
              key={bp.key}
              onClick={() => onViewportChange(bp.key)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={`${bp.label} — ${bp.width}px`}
            >
              <IconComp className="w-3 h-3" />
              <span className="hidden sm:inline">{bp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
        <kbd className="px-1 py-0.5 bg-muted/80 rounded-md font-mono text-[9px]">⌘Z</kbd>
        <span>Annulla</span>
        <kbd className="px-1 py-0.5 bg-muted/80 rounded-md font-mono text-[9px] ml-2">⌫</kbd>
        <span>Elimina</span>
        <kbd className="px-1 py-0.5 bg-muted/80 rounded-md font-mono text-[9px] ml-2">Esc</kbd>
        <span>Deseleziona</span>
      </div>
    </div>
  );
}
