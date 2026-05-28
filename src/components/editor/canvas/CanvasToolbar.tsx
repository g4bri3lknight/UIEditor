"use client";

import React from "react";
import { ZoomIn, ZoomOut, RotateCcw, Grid3x3, PanelLeft, PanelRight } from "lucide-react";
import { MIN_ZOOM, MAX_ZOOM, ZOOM_LEVELS } from "./constants";
import { useEditorStore } from "@/store/editor-store";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface CanvasToolbarProps {
  zoom: number;
  isDragging: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomChange: (zoom: number) => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  onToggleLeftSidebar?: () => void;
  onToggleRightSidebar?: () => void;
  leftSidebarOpen?: boolean;
  rightSidebarOpen?: boolean;
}

export function CanvasToolbar({
  zoom,
  isDragging,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomChange,
  showGrid,
  onToggleGrid,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  leftSidebarOpen,
  rightSidebarOpen,
}: CanvasToolbarProps) {
  const selectedId = useEditorStore(s => s.selectedId);
  const findComponent = useEditorStore(s => s.findComponent);
  const getAncestors = useEditorStore(s => s.getAncestors);
  const selectComponent = useEditorStore(s => s.selectComponent);

  const selectedComponent = selectedId ? findComponent(selectedId) : null;
  const ancestors = selectedComponent ? getAncestors(selectedComponent.id) : [];

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b ios-border-subtle ios-satin-toolbar shrink-0 h-10 z-10">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Mobile sidebar toggles */}
        {onToggleLeftSidebar && (
          <button
            onClick={onToggleLeftSidebar}
            className={`lg:hidden p-1.5 rounded-lg transition-colors shrink-0 ${leftSidebarOpen ? "text-foreground bg-foreground/5" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"}`}
            title="Componenti"
            aria-label="Attiva/disattiva pannello componenti"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}
        {onToggleRightSidebar && (
          <button
            onClick={onToggleRightSidebar}
            className={`lg:hidden p-1.5 rounded-lg transition-colors shrink-0 ${rightSidebarOpen ? "text-foreground bg-foreground/5" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"}`}
            title="Proprietà"
            aria-label="Attiva/disattiva pannello proprietà"
          >
            <PanelRight className="w-4 h-4" />
          </button>
        )}

        {/* Breadcrumb navigation for selected component */}
        {ancestors.length > 0 ? (
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="text-[11px] gap-1 flex-nowrap">
              {ancestors.map((ancestor) => (
                <React.Fragment key={ancestor.id}>
                  <BreadcrumbItem className="shrink-0">
                    <BreadcrumbLink
                      asChild
                      className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <button onClick={() => selectComponent(ancestor.id)} title={ancestor.type}>
                        {ancestor.label}
                      </button>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-[8px] shrink-0" />
                </React.Fragment>
              ))}
              <BreadcrumbItem className="shrink-0">
                <BreadcrumbPage className="text-[11px] font-medium truncate max-w-[200px]">
                  {selectedComponent?.label}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ) : selectedComponent ? (
          <span className="text-[11px] font-medium text-muted-foreground truncate">
            {selectedComponent.label}
          </span>
        ) : (
          <div
            className={`w-2 h-2 rounded-full transition-colors shrink-0 ${
              isDragging ? "bg-primary animate-pulse" : "bg-muted-foreground/20"
            }`}
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Zoom controls */}
        <div className="flex items-center gap-0.5 bg-muted/90 rounded-lg p-0.5">
          <button
            onClick={onZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="p-1 rounded-md hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            title="Riduci zoom (Ctrl+Scroll)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <select
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="h-6 w-[58px] text-[11px] text-center bg-transparent border-0 rounded px-1 text-muted-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none"
          >
            {ZOOM_LEVELS.map((level) => (
              <option key={level} value={level}>{level}%</option>
            ))}
          </select>
          <button
            onClick={onZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="p-1 rounded-md hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            title="Aumenta zoom (Ctrl+Scroll)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoom !== 100 && (
            <button
              onClick={onZoomReset}
              className="p-1 rounded-md hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground"
              title="Resetta zoom (100%)"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Grid toggle */}
        {onToggleGrid !== undefined && (
          <button
            onClick={onToggleGrid}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              showGrid
                ? "bg-primary/12 text-primary"
                : "hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
            }`}
            title={showGrid ? "Nascondi griglia" : "Mostra griglia Bootstrap"}
          >
            <Grid3x3 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
