"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";

export function SlotDropZone({
  slotId,
  isDragging,
  children,
  label,
}: {
  slotId: string;
  isDragging: boolean;
  children: React.ReactNode;
  label: string;
}) {
  // PERF-2: Disable droppable when not dragging to reduce collision detection overhead
  const { setNodeRef, isOver } = useDroppable({
    id: slotId,
    data: { type: "slot-drop", slotId },
    disabled: !isDragging,
  });

  const showHint = isOver && isDragging;
  const isEmpty = !children || (React.Children.count(children) === 0);

  return (
    <div
      ref={setNodeRef}
      className={`relative transition-all duration-150 w-full ${
        showHint ? "ring-1 ring-primary/40 bg-primary/5 rounded" : ""
      } ${isEmpty && isDragging ? "min-h-[40px]" : ""}`}
    >
      {children}
      {isEmpty && isDragging && (
        <div className={`absolute inset-0 flex items-center justify-center rounded transition-opacity pointer-events-none ${
          showHint ? "opacity-100" : "opacity-0"
        }`}>
          <span className="text-[10px] text-primary/60 font-medium">{label}</span>
        </div>
      )}
    </div>
  );
}
