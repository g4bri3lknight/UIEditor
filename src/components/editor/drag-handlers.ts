/**
 * Drag & Drop handler logic for the Editor (ARCH-4 — Strategy Pattern)
 *
 * This module contains:
 * - Custom collision detection (editorCollisionDetection)
 * - Parse helpers for slot IDs, before/after IDs
 * - Strategy-based handleDragEnd with sub-handlers:
 *   - handlePaletteDrop: drops from the component palette
 *   - handleCanvasReorder: reordering existing canvas items
 * - handleDragStart logic
 */

import {
  DragStartEvent,
  DragEndEvent,
  pointerWithin,
  type CollisionDetection,
} from "@dnd-kit/core";
import { useEditorStore, isSlottedType } from "@/store/editor-store";
import type { CanvasComponent } from "@/store/editor-store";
import { getComponentByType } from "@/lib/editor/bootstrap-components";

// ── Custom collision detection ──
// Prioritizes drop indicators, then picks the innermost (smallest area) container.
export const editorCollisionDetection: CollisionDetection = (args) => {
  const { droppableRects } = args;

  // Step 1: Get all droppables that actually contain the pointer
  const pointerHits = pointerWithin(args);
  if (pointerHits.length === 0) return [];

  // Step 2: Sort by priority
  const sorted = [...pointerHits].sort((a, b) => {
    const aId = String(a.id);
    const bId = String(b.id);

    const isIndicator = (id: string) =>
      id.startsWith("before::") ||
      id.startsWith("after::") ||
      id.startsWith("bottom-") ||
      id.startsWith("top-");

    const aIsInd = isIndicator(aId);
    const bIsInd = isIndicator(bId);

    // Indicators always win over container drops
    if (aIsInd && !bIsInd) return -1;
    if (!aIsInd && bIsInd) return 1;

    // Among same type, prefer smaller area (innermost container wins)
    const aRect = droppableRects.get(a.id);
    const bRect = droppableRects.get(b.id);
    const aArea = aRect ? (aRect.right - aRect.left) * (aRect.bottom - aRect.top) : Infinity;
    const bArea = bRect ? (bRect.right - bRect.left) * (bRect.bottom - bRect.top) : Infinity;

    return aArea - bArea;
  });

  return sorted;
};

// ── Parse helpers ──

/**
 * Parse slot IDs like "slot-comp-123-0-header" or "slot-comp-123-0-tab-2"
 * into { parentId, slot }.
 */
export function parseSlotId(slotId: string): { parentId: string; slot: string } | null {
  const rest = slotId.replace("slot-", "");
  // Numbered slots: tab-N, acc-N
  const numberedSlotMatch = rest.match(/^(comp-\d+-\d+)-(tab|acc)-(\d+)$/);
  // Simple slots: header, footer, body
  const simpleMatch = rest.match(/^(comp-\d+-\d+)-(header|footer|body)$/);
  const match = numberedSlotMatch || simpleMatch;
  if (!match) return null;

  const parentId = match[1];
  const slot = numberedSlotMatch ? `${numberedSlotMatch[2]}-${numberedSlotMatch[3]}` : match[2];
  return { parentId, slot };
}

/**
 * Parse before/after IDs like "before::comp-123-0::comp-456-0" or "after::comp-123-0"
 * into { targetId, parentId, isBefore }.
 */
export function parseBeforeAfterId(id: string): { targetId: string; parentId: string | null; isBefore: boolean } | null {
  const isBefore = id.startsWith("before::");
  const isAfter = id.startsWith("after::");
  if (!isBefore && !isAfter) return null;

  const prefix = isBefore ? "before::" : "after::";
  const rest = id.replace(prefix, "");
  const parts = rest.split("::");
  const targetId = parts[0];
  const parentId = parts.length > 1 ? parts[1] : null;

  return { targetId, parentId, isBefore };
}

/**
 * Resolve the correct drop target for a component being added or moved into a container.
 * Handles special redirect logic (col→row, table-row→cell, slotted→body, etc.)
 */
function resolveDropTarget(
  parentComp: CanvasComponent,
  type: string,
  store: ReturnType<typeof useEditorStore.getState>,
  action: "add" | "move",
  activeId?: string
): { parentId: string | null; slot?: string } | null {
  // If dropping on a column
  if (parentComp.type === "col") {
    const colParentInfo = store.getParentInfo(parentComp.id);
    if (type === "row" && colParentInfo?.parent) {
      // Add row as sibling of the parent row (inside the container)
      return { parentId: colParentInfo.parent.id };
    }
    return { parentId: parentComp.id };
  }

  // If dropping on a row with children
  if (parentComp.type === "row" && parentComp.children && parentComp.children.length > 0) {
    if (type === "row") {
      // Don't nest rows inside rows — add/move as sibling of the row instead
      const parentInfo = store.getParentInfo(parentComp.id);
      return { parentId: parentInfo?.parent?.id ?? null };
    }
    // Redirect into first column
    return { parentId: parentComp.children[0].id };
  }

  // If dropping on a table-row
  if (parentComp.type === "table-row" && parentComp.children && parentComp.children.length > 0) {
    return { parentId: parentComp.children[0].id };
  }

  // If dropping on a table
  if (parentComp.type === "table") {
    const firstRow = parentComp.children?.[0];
    if (firstRow?.children?.[0]) {
      return { parentId: firstRow.children[0].id };
    }
    return null;
  }

  // For slotted types (card/modal/offcanvas), add to body slot by default
  if (isSlottedType(parentComp.type)) {
    return { parentId: parentComp.id, slot: "body" };
  }

  return { parentId: parentComp.id };
}

// ── Drag context ──
interface DragContext {
  activeId: string;
  overId: string;
  components: CanvasComponent[];
  store: ReturnType<typeof useEditorStore.getState>;
}

// ── Palette drop strategies ──

function handlePaletteSlotDrop(ctx: DragContext, type: string): boolean {
  const parsed = parseSlotId(ctx.overId);
  if (!parsed) return false;

  const parentComp = ctx.store.findComponent(parsed.parentId);
  if (parentComp && isSlottedType(parentComp.type)) {
    ctx.store.addComponent(type, parsed.parentId, undefined, parsed.slot);
    return true;
  }
  return false;
}

function handlePaletteContainerDrop(ctx: DragContext, type: string): boolean {
  const parentId = ctx.overId.replace("container-", "");
  const parentComp = ctx.store.findComponent(parentId);
  if (!parentComp) return false;

  const target = resolveDropTarget(parentComp, type, ctx.store, "add");
  if (!target) return false;

  ctx.store.addComponent(type, target.parentId, undefined, target.slot);
  return true;
}

function handlePaletteBottomDrop(ctx: DragContext, type: string): boolean {
  if (ctx.overId === "bottom-drop") return false;
  const parentId = ctx.overId.replace("bottom-", "");
  const parentComp = ctx.store.findComponent(parentId);
  if (!parentComp) return false;

  const target = resolveDropTarget(parentComp, type, ctx.store, "add");
  if (!target) return false;

  ctx.store.addComponent(type, target.parentId, undefined, target.slot);
  return true;
}

function handlePaletteBeforeAfterDrop(ctx: DragContext, type: string): boolean {
  const parsed = parseBeforeAfterId(ctx.overId);
  if (!parsed) return false;

  const siblings = parsed.parentId
    ? ctx.store.findComponent(parsed.parentId)?.children || []
    : ctx.components;
  const idx = siblings.findIndex((c) => c.id === parsed.targetId);

  if (parsed.isBefore) {
    ctx.store.addComponent(type, parsed.parentId, idx !== -1 ? idx : undefined);
  } else {
    ctx.store.addComponent(type, parsed.parentId, idx !== -1 ? idx + 1 : undefined);
  }
  return true;
}

/** Handle drops from the component palette */
function handlePaletteDrop(ctx: DragContext): boolean {
  const type = ctx.activeId.replace("palette-", "");

  if (ctx.overId.startsWith("slot-")) return handlePaletteSlotDrop(ctx, type);
  if (ctx.overId.startsWith("container-")) return handlePaletteContainerDrop(ctx, type);
  if (ctx.overId.startsWith("bottom-")) return handlePaletteBottomDrop(ctx, type);
  if (ctx.overId.startsWith("before::") || ctx.overId.startsWith("after::")) return handlePaletteBeforeAfterDrop(ctx, type);

  // Dropped on a canvas item directly → add as sibling
  if (!ctx.overId.startsWith("palette-") && ctx.overId !== "canvas-drop-zone" && ctx.overId !== "top-drop" && ctx.overId !== "bottom-drop") {
    ctx.store.addComponent(type, null);
  } else {
    // Dropped on canvas or top/bottom indicator → add at root
    ctx.store.addComponent(type);
  }
  return true;
}

// ── Canvas reorder strategies ──

function handleReorderSlot(ctx: DragContext): boolean {
  const parsed = parseSlotId(ctx.overId);
  if (!parsed) return false;

  if (parsed.parentId !== ctx.activeId) {
    const parentComp = ctx.store.findComponent(parsed.parentId);
    if (parentComp && isSlottedType(parentComp.type)) {
      ctx.store.moveComponentInTree(ctx.activeId, parsed.parentId, undefined, parsed.slot);
    }
  }
  return true;
}

function handleReorderContainer(ctx: DragContext): boolean {
  const newParentId = ctx.overId.replace("container-", "");
  // Don't move into self
  if (newParentId === ctx.activeId) return true;

  const parentComp = ctx.store.findComponent(newParentId);
  const draggedComp = ctx.store.findComponent(ctx.activeId);
  if (!parentComp) return false;

  const dropType = draggedComp?.type || "";
  const target = resolveDropTarget(parentComp, dropType, ctx.store, "move", ctx.activeId);

  if (target) {
    ctx.store.moveComponentInTree(ctx.activeId, target.parentId, undefined, target.slot);
  }
  return true;
}

function handleReorderBottom(ctx: DragContext): boolean {
  if (ctx.overId === "bottom-drop") return false;
  const newParentId = ctx.overId.replace("bottom-", "");
  if (newParentId === ctx.activeId) return true;

  const parentComp = ctx.store.findComponent(newParentId);
  const draggedComp = ctx.store.findComponent(ctx.activeId);

  if (!parentComp) return false;

  // Special handling for row/col/table redirects
  if (parentComp.type === "row") {
    const parentInfo = ctx.store.getParentInfo(newParentId);
    ctx.store.moveComponentInTree(ctx.activeId, parentInfo?.parent?.id ?? null);
  } else if (parentComp.type === "col" && draggedComp?.type === "row") {
    const colParentInfo = ctx.store.getParentInfo(newParentId);
    ctx.store.moveComponentInTree(ctx.activeId, colParentInfo?.parent?.id ?? null);
  } else if (parentComp.type === "table-row") {
    const firstCell = parentComp.children?.[0];
    if (firstCell) {
      ctx.store.moveComponentInTree(ctx.activeId, firstCell.id);
    }
  } else if (parentComp.type === "table") {
    const firstRow = parentComp.children?.[0];
    if (firstRow?.children?.[0]) {
      ctx.store.moveComponentInTree(ctx.activeId, firstRow.children[0].id);
    }
  } else {
    ctx.store.moveComponentInTree(ctx.activeId, newParentId);
  }
  return true;
}

function handleReorderBeforeAfter(ctx: DragContext): boolean {
  const parsed = parseBeforeAfterId(ctx.overId);
  if (!parsed) return false;

  // Self-drop on own indicator: skip
  if (ctx.activeId === parsed.targetId) return true;

  const siblings = parsed.parentId
    ? ctx.store.findComponent(parsed.parentId)?.children || []
    : ctx.components;
  const targetIdx = siblings.findIndex((c) => c.id === parsed.targetId);
  if (targetIdx !== -1) {
    // Adjust index: after removeFromTree removes activeId, the target shifts
    // if activeId was before the target in the same parent
    const activeIdx = siblings.findIndex((c) => c.id === ctx.activeId);
    let insertIdx: number;
    if (activeIdx !== -1 && activeIdx < targetIdx) {
      // Active was before target — after removal, target shifts left by 1
      insertIdx = parsed.isBefore ? targetIdx - 1 : targetIdx;
    } else {
      insertIdx = parsed.isBefore ? targetIdx : targetIdx + 1;
    }
    ctx.store.moveComponentInTree(ctx.activeId, parsed.parentId, insertIdx);
  }
  return true;
}

/** Handle canvas item reordering */
function handleCanvasReorder(ctx: DragContext): boolean {
  if (ctx.overId.startsWith("slot-")) return handleReorderSlot(ctx);
  if (ctx.overId.startsWith("container-")) return handleReorderContainer(ctx);
  if (ctx.overId.startsWith("bottom-")) return handleReorderBottom(ctx);
  if (ctx.overId.startsWith("before::") || ctx.overId.startsWith("after::")) return handleReorderBeforeAfter(ctx);
  return false;
}

// ── Main dispatcher ──

export function handleDragEnd(event: DragEndEvent): void {
  const { active, over } = event;
  if (!over) return;

  const activeId = String(active.id);
  const overId = String(over.id);
  const store = useEditorStore.getState();
  const { components } = store;

  const ctx: DragContext = {
    activeId,
    overId,
    components,
    store,
  };

  if (activeId.startsWith("palette-")) {
    handlePaletteDrop(ctx);
  } else if (activeId !== overId && !overId.startsWith("palette-")) {
    handleCanvasReorder(ctx);
  }
}

// ── Drag Start ──

export interface DragStartResult {
  activeDragId: string;
  activeDragData: {
    fromPalette: boolean;
    type?: string;
    label?: string;
  };
}

export function computeDragStartData(event: DragStartEvent): DragStartResult {
  const id = String(event.active.id);
  let activeDragData: DragStartResult["activeDragData"];

  if (id.startsWith("palette-")) {
    const type = id.replace("palette-", "");
    const def = getComponentByType(type);
    activeDragData = {
      fromPalette: true,
      type,
      label: def?.label || type,
    };
  } else {
    const comp = useEditorStore.getState().components.find((c) => c.id === id);
    activeDragData = {
      fromPalette: false,
      type: comp?.type,
      label: comp?.label,
    };
  }

  return {
    activeDragId: id,
    activeDragData,
  };
}
