"use client";

import React from "react";
import { ZoomIn, ZoomOut, RotateCcw, Sun, Moon, PanelLeft, PanelRight, Grid3x3 } from "lucide-react";
import { MIN_ZOOM, MAX_ZOOM, ZOOM_LEVELS, VIEWPORT_BREAKPOINTS, type ViewportKey } from "./constants";

interface CanvasToolbarProps {
  zoom: number;
  viewport: ViewportKey;
  isDragging: boolean;
  componentCount: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomChange: (zoom: number) => void;
  onViewportChange: (viewport: ViewportKey) => void;
  canvasDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  onToggleLeftSidebar?: () => void;
  onToggleRightSidebar?: () => void;
  leftSidebarOpen?: boolean;
  rightSidebarOpen?: boolean;
}

export function CanvasToolbar({
  zoom,
  viewport,
  isDragging,
  componentCount,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomChange,
  onViewportChange,
  canvasDarkMode,
  onToggleDarkMode,
  showGrid,
  onToggleGrid,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  leftSidebarOpen,
  rightSidebarOpen,
}: CanvasToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
      <div className="flex items-center gap-2">
        {/* Mobile sidebar toggles */}
        {onToggleLeftSidebar && (
          <button
            onClick={onToggleLeftSidebar}
            className={`lg:hidden p-1.5 rounded transition-colors ${leftSidebarOpen ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            title="Componenti"
            aria-label="Attiva/disattiva pannello componenti"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}
        {onToggleRightSidebar && (
          <button
            onClick={onToggleRightSidebar}
            className={`lg:hidden p-1.5 rounded transition-colors ${rightSidebarOpen ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            title="Proprietà"
            aria-label="Attiva/disattiva pannello proprietà"
          >
            <PanelRight className="w-4 h-4" />
          </button>
        )}
        <div
          className={`w-2 h-2 rounded-full transition-colors ${
            isDragging ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
          }`}
        />
        <span className="text-xs font-medium text-muted-foreground">
          Area di lavoro
        </span>
        <span className="text-xs text-muted-foreground/60">
          {componentCount} componente{componentCount !== 1 ? "i" : ""}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {/* Viewport breakpoint toggle */}
        <div className="flex items-center gap-0.5 bg-muted/50 rounded-md p-0.5">
          {VIEWPORT_BREAKPOINTS.map((bp) => {
            const IconComp = bp.icon;
            const isActive = viewport === bp.key;
            return (
              <button
                key={bp.key}
                onClick={() => onViewportChange(bp.key)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-background text-foreground shadow-sm"
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
        <div className="w-px h-4 bg-border" />
        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            title="Riduci zoom (Ctrl+Scroll)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <select
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="h-6 w-[58px] text-[11px] text-center bg-muted border-0 rounded px-1 text-muted-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none"
          >
            {ZOOM_LEVELS.map((level) => (
              <option key={level} value={level}>{level}%</option>
            ))}
          </select>
          <button
            onClick={onZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            title="Aumenta zoom (Ctrl+Scroll)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoom !== 100 && (
            <button
              onClick={onZoomReset}
              className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Resetta zoom (100%)"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="w-px h-4 bg-border" />
        {/* Dark mode toggle */}
        {onToggleDarkMode !== undefined && (
          <button
            onClick={onToggleDarkMode}
            className={`p-1.5 rounded transition-colors ${
              canvasDarkMode
                ? "bg-primary/15 text-primary"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
            title={canvasDarkMode ? "Modalità chiara" : "Modalità scura"}
          >
            {canvasDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        )}
        {/* Grid toggle */}
        {onToggleGrid !== undefined && (
          <button
            onClick={onToggleGrid}
            className={`p-1.5 rounded transition-colors ${
              showGrid
                ? "bg-primary/15 text-primary"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
            title={showGrid ? "Nascondi griglia" : "Mostra griglia Bootstrap"}
          >
            <Grid3x3 className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
          <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border font-mono">Ctrl+Z</kbd>
          <span>Annulla</span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border font-mono ml-2">Del</kbd>
          <span>Elimina</span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border font-mono ml-2">Esc</kbd>
          <span>Deseleziona</span>
        </div>
      </div>
    </div>
  );
}
