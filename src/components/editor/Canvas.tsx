"use client";

import React, { useCallback } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useEditorStore, isContainer, isAutoManaged } from "@/store/editor-store";
import { BootstrapRenderer } from "./BootstrapRenderer";
import { CanvasComponent } from "@/lib/editor/types";

// ── Drop indicator between items ──
function DropIndicator({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "drop-indicator" },
  });

  const active = isOver || isActive;

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 rounded-lg ${
        active
          ? "min-h-3 min-w-3 bg-primary/20 border-2 border-primary/40 border-dashed"
          : "min-h-1 min-w-[2px]"
      }`}
      style={{ flex: "0 0 auto" }}
    />
  );
}

// ── Canvas Item (draggable wrapper + optional container drop target) ──
function CanvasItem({
  component,
  index,
  siblings,
  parentId,
  isDragging,
  depth = 0,
}: {
  component: CanvasComponent;
  index: number;
  siblings: CanvasComponent[];
  parentId: string | null;
  isDragging: boolean;
  depth?: number;
}) {
  const { selectedId, selectComponent } = useEditorStore();

  const isSelected = selectedId === component.id;
  const canContain = isContainer(component.type);
  const hasChildren = canContain && component.children && component.children.length > 0;
  const managed = isAutoManaged(component.type);

  // ── Draggable (disabled for auto-managed types like col) ──
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
  } = useDraggable({
    id: component.id,
    data: { type: "canvas-item", componentId: component.id },
    disabled: managed,
  });

  // ── Droppable (for container types) ──
  const {
    setNodeRef: setDropRef,
    isOver: isContainerOver,
  } = useDroppable({
    id: `container-${component.id}`,
    data: { type: "container-drop", componentId: component.id },
    disabled: !canContain,
  });

  const dragStyle: React.CSSProperties = {
    ...(transform
      ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 }
      : {}),
    touchAction: "none",
  };

  // Col components need explicit flex-basis to size correctly inside flex rows
  if (component.type === "col") {
    // Cols inside a row should be equal width
    dragStyle.flex = "1 1 0%";
    dragStyle.minWidth = "0";
  }

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectComponent(component.id);
    },
    [selectComponent, component.id]
  );

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setDragRef(node);
      setDropRef(node);
    },
    [setDragRef, setDropRef]
  );

  // ── Children rendered as CanvasItems (recursive, no wrapper div) ──
  const childrenContent = hasChildren ? (
    <>
      {component.children!.map((child, i) => (
        <React.Fragment key={child.id}>
          <DropIndicator
            id={`before-${child.id}-${component.id}`}
            isActive={false}
          />
          <CanvasItem
            component={child}
            index={i}
            siblings={component.children!}
            parentId={component.id}
            isDragging={isDragging}
            depth={depth + 1}
          />
          <DropIndicator
            id={`after-${child.id}-${component.id}`}
            isActive={false}
          />
        </React.Fragment>
      ))}
      {isDragging && (
        <DropIndicator
          id={`bottom-${component.id}`}
          isActive={false}
        />
      )}
    </>
  ) : null;

  return (
    <>
      <DropIndicator
        id={parentId ? `before-${component.id}-${parentId}` : `before-${component.id}`}
        isActive={false}
      />

      <div
        ref={mergedRef}
        style={dragStyle}
        className={`relative group/canvas-item rounded-lg transition-all duration-150 ${
          isDragging && selectedId === component.id
            ? "opacity-30 ring-2 ring-primary/40"
            : isContainerOver && isDragging
              ? "ring-2 ring-primary/40 bg-primary/5"
              : isSelected
                ? "ring-2 ring-primary/50 bg-primary/5"
                : "hover:ring-1 hover:ring-border"
        }`}
        onClick={handleSelect}
        {...attributes}
        {...listeners}
      >
        {/* Selection label */}
        {isSelected && (
          <div className="absolute -top-1.5 left-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-t-md z-10 leading-tight">
            {managed ? `Column ${index + 1}` : component.label}
          </div>
        )}

        {/* Container drop zone hint */}
        {canContain && isDragging && (
          <div
            className={`absolute inset-0 rounded-lg border-2 border-dashed pointer-events-none transition-colors z-0 ${
              isContainerOver
                ? "border-primary/60 bg-primary/5"
                : "border-primary/20"
            }`}
          />
        )}

        {/* Rendered component content */}
        <div className="relative z-[1]" style={{ padding: canContain ? "0" : "6px 4px" }}>
          {canContain ? (
            <BootstrapRenderer
              component={component}
              renderChildren={childrenContent}
            />
          ) : (
            <div className="pointer-events-none">
              <BootstrapRenderer component={component} />
            </div>
          )}
        </div>
      </div>

      <DropIndicator
        id={parentId ? `after-${component.id}-${parentId}` : `after-${component.id}`}
        isActive={false}
      />
    </>
  );
}

// ── Main Canvas ──
export function Canvas({ activeDragId }: { activeDragId: string | null }) {
  const { components, selectComponent } = useEditorStore();
  const isDragging = !!activeDragId;

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-drop-zone",
    data: { type: "canvas-zone" },
  });

  const handleCanvasClick = () => selectComponent(null);

  return (
    <div className="flex-1 flex flex-col h-full bg-muted/30 overflow-hidden">
      {/* Canvas Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              isDragging ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
            }`}
          />
          <span className="text-xs font-medium text-muted-foreground">
            Workspace
          </span>
          <span className="text-xs text-muted-foreground/60">
            {components.length} component{components.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
          <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border font-mono">
            Ctrl+Z
          </kbd>
          <span>Undo</span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border font-mono ml-2">
            Del
          </kbd>
          <span>Delete</span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border font-mono ml-2">
            Esc
          </kbd>
          <span>Deselect</span>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        onClick={handleCanvasClick}
        className={`flex-1 overflow-y-auto transition-colors duration-200 ${
          isOver && isDragging ? "bg-primary/5" : ""
        }`}
      >
        <div className="max-w-4xl mx-auto p-6">
          {components.length === 0 ? (
            <EmptyCanvas isOver={isOver && isDragging} />
          ) : (
            <div className="space-y-0">
              <DropIndicator
                id="top-drop"
                isActive={isOver && isDragging && components.length > 0}
              />

              {components.map((comp, index) => (
                <CanvasItem
                  key={comp.id}
                  component={comp}
                  index={index}
                  siblings={components}
                  parentId={null}
                  isDragging={isDragging}
                  depth={0}
                />
              ))}

              <DropIndicator
                id="bottom-drop"
                isActive={isOver && isDragging && components.length > 0}
              />
            </div>
          )}

          {components.length > 0 && isDragging && !isOver && (
            <div className="mt-4 h-12 border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center bg-primary/5 transition-all">
              <span className="text-xs text-primary/60 font-medium">
                Drop at the end
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
        Drag components here
      </p>
      <p className="text-xs text-muted-foreground/60">
        Start building your Bootstrap interface
      </p>
    </div>
  );
}
