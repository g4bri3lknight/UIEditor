"use client";

import { useDroppable } from "@dnd-kit/core";

export function DropIndicator({
  id,
  isActive,
  isDragging = false,
  dropHint,
}: {
  id: string;
  isActive: boolean;
  isDragging?: boolean;
  dropHint?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "drop-indicator" },
  });

  const active = isOver || isActive;
  const isLarge = isDragging && !!dropHint;

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 rounded-xl ${
        active && !isLarge
          ? "min-h-3 min-w-3 bg-primary/15 border-2 border-primary/30 border-dashed"
          : isLarge
            ? `min-h-[48px] border-2 border-dashed rounded-xl ${isOver ? "border-primary/50 bg-primary/[0.06]" : "border-primary/20 bg-primary/[0.02]"}`
            : "min-h-1 min-w-[2px]"
      }`}
      style={{ flex: isLarge ? "1 1 100%" : "0 0 auto", width: isLarge ? "100%" : undefined }}
    >
      {isLarge && (
        <div className={`flex items-center justify-center h-full py-2 transition-opacity ${isOver ? "opacity-100" : "opacity-60"}`}>
          <span className="text-xs text-primary/50 font-medium">{dropHint}</span>
        </div>
      )}
    </div>
  );
}
