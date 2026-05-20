"use client";

import React, { useCallback, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useEditorStore } from "@/store/editor-store";
import { sanitizeCSS } from "@/lib/sanitize";
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP, VIEWPORT_BREAKPOINTS, type ViewportKey } from "./constants";
import { DropIndicator } from "./DropIndicator";
import { CanvasItem } from "./CanvasItem";
import { CanvasToolbar } from "./CanvasToolbar";
import { StatusBar } from "./StatusBar";
import { InlineEditOverlay, type InlineEditState, type PropPickerState } from "./InlineEditOverlay";

// ── Empty state ──
function EmptyCanvas({ isOver }: { isOver: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-32 rounded-2xl border-2 border-dashed transition-all duration-300 ${
        isOver
          ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10"
          : "border-border/60 hover:border-border"
      }`}
    >
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-muted-foreground/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1">
        Trascina i componenti qui
      </p>
      <p className="text-xs text-muted-foreground/60">
        Inizia a costruire la tua interfaccia Bootstrap
      </p>
    </div>
  );
}

export function Canvas({
  activeDragId,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  leftSidebarOpen,
  rightSidebarOpen,
}: {
  activeDragId: string | null;
  onToggleLeftSidebar?: () => void;
  onToggleRightSidebar?: () => void;
  leftSidebarOpen?: boolean;
  rightSidebarOpen?: boolean;
}) {
  const { components, selectComponent, updateComponentProps } = useEditorStore();
  const bootstrapTheme = useEditorStore(s => s.bootstrapTheme);
  const customCSS = useEditorStore(s => s.customCSS);
  const showGrid = useEditorStore(s => s.showGrid);
  const isDragging = !!activeDragId;

  // ── Zoom state ──
  const [zoom, setZoom] = useState(100);
  const [viewport, setViewport] = useState<ViewportKey>("xl");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(100);
  }, []);

  const handleToggleGrid = useCallback(() => {
    useEditorStore.getState().toggleGrid();
  }, []);

  // Ctrl+Scroll to zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((z) => {
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta));
      });
    }
  }, []);

  // ── Inline text editing state ──
  const [inlineEdit, setInlineEdit] = useState<InlineEditState | null>(null);
  const [editValue, setEditValue] = useState("");
  const committedRef = useRef(false);
  const cancelRef = useRef(false);

  // ── Property picker state (for components with multiple editable props) ──
  const [propPicker, setPropPicker] = useState<PropPickerState | null>(null);

  // PERF-2: Disable canvas root droppable when not dragging
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-root", disabled: !isDragging });

  const handleStartInlineEdit = useCallback(
    (id: string, propKey: string, rect: DOMRect, currentValue: string, multiline: boolean) => {
      committedRef.current = false;
      cancelRef.current = false;
      setPropPicker(null); // Close picker if open
      setInlineEdit({ id, propKey, rect, multiline });
      setEditValue(currentValue);
    },
    []
  );

  const handleShowPropPicker = useCallback(
    (id: string, props: Array<{ key: string; label: string; multiline: boolean }>, rect: DOMRect) => {
      setPropPicker({ id, props, rect });
    },
    []
  );

  const handlePickProp = useCallback(
    (propKey: string, multiline: boolean) => {
      if (!propPicker) return;
      const comp = useEditorStore.getState().findComponent(propPicker.id);
      const currentValue = comp ? String(comp.props[propKey] ?? "") : "";
      handleStartInlineEdit(propPicker.id, propKey, propPicker.rect, currentValue, multiline);
    },
    [propPicker, handleStartInlineEdit]
  );

  const commitEdit = useCallback(() => {
    if (!inlineEdit || committedRef.current || cancelRef.current) return;
    committedRef.current = true;
    updateComponentProps(inlineEdit.id, { [inlineEdit.propKey]: editValue });
    setInlineEdit(null);
  }, [inlineEdit, editValue, updateComponentProps]);

  const handleCancelInlineEdit = useCallback(() => {
    cancelRef.current = true;
    committedRef.current = true;
    setInlineEdit(null);
  }, []);

  // Close inline editor / prop picker when clicking on canvas background
  const handleCanvasClick = useCallback(() => {
    if (inlineEdit) {
      commitEdit();
    }
    if (propPicker) {
      setPropPicker(null);
    }
    selectComponent(null);
    // Clear multi-selection
    useEditorStore.getState().clearSelection();
  }, [inlineEdit, commitEdit, propPicker, selectComponent]);

  const handleDismissPropPicker = useCallback(() => {
    setPropPicker(null);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-muted/30 overflow-hidden">
      {/* Canvas Toolbar — breadcrumb + zoom + grid */}
      <CanvasToolbar
        zoom={zoom}
        isDragging={isDragging}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onZoomChange={setZoom}
        showGrid={showGrid}
        onToggleGrid={handleToggleGrid}
        onToggleLeftSidebar={onToggleLeftSidebar}
        onToggleRightSidebar={onToggleRightSidebar}
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
      />

      {/* Drop Zone */}
      <div
        ref={(node) => {
          setNodeRef(node);
          if (node) scrollContainerRef.current = node;
        }}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        className={`flex-1 overflow-auto transition-colors duration-200 ${
          isOver && isDragging ? "bg-primary/5" : ""
        }`}
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div
          className="w-[95%] mx-auto p-6 origin-top"
          style={{ transform: `scale(${zoom / 100})`, transition: 'transform 150ms ease-out' }}
        >
          {/* Custom CSS injection for canvas */}
          {customCSS && (
            <style dangerouslySetInnerHTML={{ __html: sanitizeCSS(customCSS) }} />
          )}
          <div
            style={{
              position: "relative",
              maxWidth: viewport === "xl" ? "100%" : `${VIEWPORT_BREAKPOINTS.find(bp => bp.key === viewport)?.width || "100%"}px`,
              margin: "0 auto",
              transition: "max-width 200ms ease-out",
              border: viewport !== "xl" ? "1px solid #e5e7eb" : "none",
              borderRadius: viewport !== "xl" ? "8px" : "0",
              overflow: "hidden",
              // Theme CSS custom properties — cascade to all Bootstrap components in canvas
              "--bs-primary": bootstrapTheme.primaryColor,
              "--bs-secondary": bootstrapTheme.secondaryColor,
              "--bs-success": bootstrapTheme.successColor,
              "--bs-danger": bootstrapTheme.dangerColor,
              "--bs-warning": bootstrapTheme.warningColor,
              "--bs-info": bootstrapTheme.infoColor,
              "--bs-body-bg": bootstrapTheme.bodyBg,
              "--bs-body-color": bootstrapTheme.bodyColor,
              "--bs-font-family": bootstrapTheme.fontFamily,
              "--bs-border-radius": bootstrapTheme.borderRadius,
              "--bs-border-radius-sm": bootstrapTheme.borderRadius,
              "--bs-border-radius-lg": bootstrapTheme.borderRadius,
              "--bs-border-radius-pill": `calc(${bootstrapTheme.borderRadius} * 10)`,
              // Also set background and color directly for the body
              backgroundColor: bootstrapTheme.bodyBg,
              color: bootstrapTheme.bodyColor,
              fontFamily: bootstrapTheme.fontFamily,
            } as React.CSSProperties}
          >
          {/* Grid Overlay (FEAT-6) — 12-column Bootstrap grid */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none z-50"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                gap: "0px",
                padding: "0 12px",
              }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className="h-full relative"
                  style={{
                    borderLeft: i > 0 ? "1px solid rgba(59, 130, 246, 0.15)" : "none",
                    borderRight: i === 11 ? "1px solid rgba(59, 130, 246, 0.15)" : "none",
                    background: "repeating-linear-gradient(to bottom, rgba(59, 130, 246, 0.04) 0px, rgba(59, 130, 246, 0.04) 1px, transparent 1px, transparent 40px)",
                  }}
                >
                  <span
                    className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold"
                    style={{ color: "rgba(59, 130, 246, 0.35)" }}
                  >
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
          {components.length === 0 ? (
            <EmptyCanvas isOver={isOver && isDragging} />
          ) : (
            <div className="space-y-0">
              {/* PERF-2: Only render top/bottom DropIndicators when dragging */}
              {isDragging && (
                <DropIndicator
                  id="top-drop"
                  isActive={false}
                  isDragging={isDragging}
                  dropHint="Rilascia all'inizio"
                  disabled={!isDragging}
                />
              )}

              {components.map((comp, index) => (
                <CanvasItem
                  key={comp.id}
                  component={comp}
                  index={index}
                  siblings={components}
                  parentId={null}
                  isDragging={isDragging}
                  depth={0}
                  onStartInlineEdit={handleStartInlineEdit}
                  onShowPropPicker={handleShowPropPicker}
                />
              ))}

              {/* PERF-2: Only render bottom DropIndicator when dragging */}
              {isDragging && (
                <DropIndicator
                  id="bottom-drop"
                  isActive={false}
                  isDragging={isDragging}
                  dropHint="Rilascia alla fine"
                  disabled={!isDragging}
                />
              )}
              {/* Extra spacer at bottom to ensure the drop zone has room */}
              {isDragging && <div className="h-4" />}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Status Bar — viewport modifiers + shortcuts */}
      <StatusBar
        viewport={viewport}
        onViewportChange={setViewport}
      />

      {/* Inline text editing overlay */}
      <InlineEditOverlay
        inlineEdit={inlineEdit}
        editValue={editValue}
        onEditValueChange={setEditValue}
        commitEdit={commitEdit}
        onCancel={handleCancelInlineEdit}
        propPicker={propPicker}
        onPickProp={handlePickProp}
        onDismissPropPicker={handleDismissPropPicker}
      />
    </div>
  );
}
