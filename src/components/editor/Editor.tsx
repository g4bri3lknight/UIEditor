"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  type CollisionDetection,
  type Collision,
} from "@dnd-kit/core";
import { LeftSidebar } from "./LeftSidebar";
import { Canvas } from "./Canvas";
import { RightSidebar } from "./RightSidebar";
import { useEditorStore, isSlottedType } from "@/store/editor-store";
import { getComponentByType } from "@/lib/editor/bootstrap-components";
import { generateFullHTML } from "@/lib/editor/code-generator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Code,
  Trash2,
  Undo2,
  Redo2,
  Eye,
  Download,
  Copy,
  Check,
  Save,
  Upload,
  FolderOpen,
  Smartphone,
  Tablet,
  Monitor,
  LayoutTemplate,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { TEMPLATES } from "@/lib/editor/templates";
import { domToPng } from "modern-screenshot";

// ── Custom collision detection ──
// Prioritizes drop indicators, then picks the innermost (smallest area) container.
// This fixes the bug where columns inside rows steal focus from the container's
// bottom drop zone when using closestCorners.
const editorCollisionDetection: CollisionDetection = (args) => {
  const { droppableRects } = args;

  // Step 1: Get all droppables that actually contain the pointer
  const pointerHits = pointerWithin(args);
  if (pointerHits.length === 0) return [];

  // Step 2: Sort by priority
  const sorted = [...pointerHits].sort((a, b) => {
    const aId = String(a.id);
    const bId = String(b.id);

    // Helper: check if ID is a drop indicator (between-item markers, NOT slot containers)
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

// ── Sidebar resize hook ──
function useSidebarResize(
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

  const startResize = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMove = (ev: PointerEvent) => {
        if (!isResizing.current) return;
        const dx = ev.clientX - startX.current;
        // Right sidebar: dragging left (negative dx) should INCREASE width
        const newW = Math.max(
          minWidth,
          Math.min(
            startWidth.current + (direction === "right" ? -dx : dx),
            maxWidth
          )
        );
        setWidth(newW);
      };

      const onUp = () => {
        isResizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        localStorage.setItem(storageKey, String(width));
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [width, minWidth, maxWidth, storageKey, direction]
  );

  return { width, startResize };
}

// ── Resize handle component ──
function ResizeHandle({
  onPointerDown,
  side,
}: {
  onPointerDown: (e: React.PointerEvent) => void;
  side: "left" | "right";
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      className={`group relative w-[5px] shrink-0 cursor-col-resize transition-colors duration-150
        ${side === "left" ? "border-r border-border" : "border-l border-border"}
        hover:bg-primary/20 active:bg-primary/30`}
      title="Trascina per ridimensionare"
    >
      {/* Visible grip indicator on hover */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 ${
          side === "left" ? "right-0" : "left-0"
        } translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none`}
      >
        <div className="flex flex-col gap-[2px] py-3 px-[2px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] h-[3px] rounded-full bg-primary/60"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Editor() {
  const {
    components,
    addComponent,
    clearCanvas,
    undo,
    redo,
    history,
    historyIndex,
    removeComponent,
    moveComponent,
    copyComponent,
    pasteComponent,
    clipboard,
    importProject,
    hiddenComponents,
    customCSS,
  } = useEditorStore();

  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<{
    fromPalette: boolean;
    type?: string;
    label?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);
  const projectMenuRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // ── Sidebar resizing ──
  const leftSidebar = useSidebarResize("editor-left-width", 256, 180, 400);
  const rightSidebar = useSidebarResize("editor-right-width", 288, 200, 500, "right");

  // ── Viewport preset detection ──
  // Detect which device preset matches the current screen and use it as default
  const VIEWPORT_PRESETS = {
    mobile:  { w: 375, h: 667 },
    tablet:  { w: 768, h: 1024 },
    desktop: { w: 1280, h: 800 },
  } as const;
  type ViewportPreset = keyof typeof VIEWPORT_PRESETS;

  const detectDevicePreset = useCallback((): ViewportPreset => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    if (w <= 480) return "mobile";
    if (w <= 1024) return "tablet";
    return "desktop";
  }, []);

  // ── Preview dialog resizing ──
  // Default to the device-appropriate preset size
  const getDefaultPreviewSize = useCallback(() => {
    if (typeof window === "undefined") return VIEWPORT_PRESETS.desktop;
    const preset = detectDevicePreset();
    const { w, h } = VIEWPORT_PRESETS[preset];
    const maxW = window.innerWidth - 48;
    const maxH = window.innerHeight - 100;
    return { w: Math.min(w, maxW), h: Math.min(h, maxH) };
  }, [detectDevicePreset]);
  const previewSizeRef = useRef(getDefaultPreviewSize());
  const [previewSize, setPreviewSize] = useState(getDefaultPreviewSize);
  const [activePreset, setActivePreset] = useState<ViewportPreset | "custom">(detectDevicePreset);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: previewSizeRef.current.w,
      h: previewSizeRef.current.h,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handleResizeMove = useCallback((e: React.PointerEvent) => {
    if (!isResizing) return;
    const dx = e.clientX - resizeStartRef.current.x;
    const dy = e.clientY - resizeStartRef.current.y;
    const newW = Math.max(400, Math.min(resizeStartRef.current.w + dx, window.innerWidth - 48));
    const newH = Math.max(300, Math.min(resizeStartRef.current.h + dy, window.innerHeight - 48));
    previewSizeRef.current = { w: newW, h: newH };
    setPreviewSize({ w: newW, h: newH });
    setActivePreset("custom");
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Preset viewport sizes (clamped to viewport)
  const applyPresetSize = useCallback((w: number, h: number, preset?: ViewportPreset) => {
    const maxW = window.innerWidth - 48;
    const maxH = window.innerHeight - 100;
    const clampedW = Math.min(w, maxW);
    const clampedH = Math.min(h, maxH);
    previewSizeRef.current = { w: clampedW, h: clampedH };
    setPreviewSize({ w: clampedW, h: clampedH });
    if (preset) setActivePreset(preset);
  }, []);

  // ── Preview zoom state ──
  const [previewZoom, setPreviewZoom] = useState(100);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  const handlePreviewZoomIn = useCallback(() => {
    setPreviewZoom((z) => Math.min(200, z + 10));
  }, []);

  const handlePreviewZoomOut = useCallback(() => {
    setPreviewZoom((z) => Math.max(25, z - 10));
  }, []);

  const handlePreviewZoomReset = useCallback(() => {
    setPreviewZoom(100);
  }, []);

  // ── Generated HTML code (must be before handleScreenshot) ──
  const htmlCode = useMemo(() => generateFullHTML(components, hiddenComponents, customCSS), [components, hiddenComponents, customCSS]);

  // ── Screenshot handler ──
  // Uses modern-screenshot (SVG foreignObject approach) instead of html2canvas
  // because html2canvas has fundamental bugs rendering text inside form controls
  // and buttons — text appears vertically shifted / cut off.
  // modern-screenshot captures the real browser rendering via SVG, so text,
  // tables, and all CSS properties are rendered correctly.
  const [isCapturing, setIsCapturing] = useState(false);
  const handleScreenshot = useCallback(async () => {
    if (!htmlCode) {
      toast.error("Nessun contenuto da catturare");
      return;
    }
    setIsCapturing(true);

    let tempIframe: HTMLIFrameElement | null = null;

    try {
      toast.info("Generazione screenshot in corso...");

      const captureWidth = previewSizeRef.current.w;

      // Create a temporary off-screen iframe sized to the full content
      tempIframe = document.createElement("iframe");
      tempIframe.style.position = "fixed";
      tempIframe.style.left = "-99999px";
      tempIframe.style.top = "0";
      tempIframe.style.width = `${captureWidth}px`;
      tempIframe.style.height = "8000px";
      tempIframe.style.border = "none";
      tempIframe.style.background = "white";
      document.body.appendChild(tempIframe);

      // Load the HTML content
      await new Promise<void>((resolve, reject) => {
        tempIframe!.onload = () => resolve();
        tempIframe!.onerror = () => reject(new Error("Errore nel caricamento del contenuto"));
        tempIframe!.srcdoc = htmlCode;
      });

      // Wait for Bootstrap CSS/JS from CDN to fully load and render
      await new Promise((r) => setTimeout(r, 1500));

      const tempDoc = tempIframe.contentDocument;
      const tempBody = tempDoc?.body;
      const tempHtml = tempDoc?.documentElement;
      if (!tempBody || !tempHtml || !tempDoc) {
        throw new Error("Impossibile accedere al contenuto dell'iframe temporaneo");
      }

      // Measure the actual full content size
      const fullWidth = Math.max(tempBody.scrollWidth, tempHtml.scrollWidth, captureWidth);
      const fullHeight = Math.max(tempBody.scrollHeight, tempHtml.scrollHeight);

      // Resize iframe to exactly match the content so nothing is clipped
      tempIframe.style.width = `${fullWidth}px`;
      tempIframe.style.height = `${fullHeight + 20}px`;

      // Wait for re-layout after resize
      await new Promise((r) => setTimeout(r, 300));

      // Use modern-screenshot to capture the full iframe body
      // Unlike html2canvas, modern-screenshot uses SVG foreignObject which
      // preserves the real browser rendering — text, form controls, tables,
      // and all CSS are pixel-perfect.
      const dataUrl = await domToPng(tempBody, {
        scale: 2,
        width: fullWidth,
        height: fullHeight,
        backgroundColor: "#ffffff",
        fetchOptions: {
          requestInit: {
            mode: "cors",
          },
        },
      });

      // Convert data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const fileName = `bootstrap-preview-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-")}.png`;
      // Try File System Access API ("Save As" dialog)
      if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
        try {
          const handle = await (window as unknown as { showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
            suggestedName: fileName,
            types: [{
              description: "Immagine PNG",
              accept: { "image/png": [".png"] },
            }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          toast.success("Screenshot salvato!");
        } catch (err) {
          // User cancelled the dialog — do nothing
          if ((err as DOMException).name === "AbortError") return;
          // Other error — fallback to direct download
          throw err;
        }
      } else {
        // Fallback: direct download
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Screenshot scaricato!");
      }
    } catch (err) {
      console.error("Screenshot error:", err);
      toast.error("Errore durante la generazione dello screenshot");
    } finally {
      if (tempIframe && tempIframe.parentNode) {
        tempIframe.parentNode.removeChild(tempIframe);
      }
      setIsCapturing(false);
    }
  }, [htmlCode]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // ── Drag Start ──
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveDragId(id);

    if (id.startsWith("palette-")) {
      const type = id.replace("palette-", "");
      const def = getComponentByType(type);
      setActiveDragData({
        fromPalette: true,
        type,
        label: def?.label || type,
      });
    } else {
      const comp = useEditorStore.getState().components.find((c) => c.id === id);
      setActiveDragData({
        fromPalette: false,
        type: comp?.type,
        label: comp?.label,
      });
    }
  }, []);

  // ── Drag End ──
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragId(null);
      setActiveDragData(null);

      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);
      const { components } = useEditorStore.getState();

      // ── Palette item dropped ──
      if (activeId.startsWith("palette-")) {
        const type = activeId.replace("palette-", "");

        // Dropped ON a slot drop zone (header/footer/body of card/modal/offcanvas, tab-N of tab-content, acc-N of accordion)
        if (overId.startsWith("slot-")) {
          const rest = overId.replace("slot-", "");
          // Slot IDs follow format: slot-{parentId}-{slotName}
          // parentId = comp-{timestamp}-{counter} (contains dashes)
          // slotName = header | footer | body | tab-0 | tab-1 | acc-0 | acc-1 | etc.
          // Strategy: strip known slot suffixes, remaining prefix is parentId
          const numberedSlotMatch = rest.match(/^(comp-\d+-\d+)-(tab|acc)-(\d+)$/);
          const simpleMatch = rest.match(/^(comp-\d+-\d+)-(header|footer|body)$/);
          const match = numberedSlotMatch || simpleMatch;
          if (match) {
            const parentId = match[1];
            const slot = numberedSlotMatch ? `${numberedSlotMatch[2]}-${numberedSlotMatch[3]}` : match[2];
            const parentComp = useEditorStore.getState().findComponent(parentId);
            if (parentComp && isSlottedType(parentComp.type)) {
              addComponent(type, parentId, undefined, slot);
              return;
            }
          }
        }

        // Dropped ON a container → add as child of that container
        if (overId.startsWith("container-")) {
          const parentId = overId.replace("container-", "");
          const parentComp = useEditorStore.getState().findComponent(parentId);
          // If dropping on a column, redirect rows to be siblings of the parent row
          if (parentComp?.type === "col") {
            const colParentInfo = useEditorStore.getState().getParentInfo(parentId);
            if (type === "row" && colParentInfo?.parent) {
              // Add row as sibling of the parent row (inside the container)
              addComponent(type, colParentInfo.parent.id);
            } else {
              addComponent(type, parentId);
            }
          } else if (parentComp?.type === "row" && parentComp.children && parentComp.children.length > 0) {
            if (type === "row") {
              // Don't nest rows inside rows — add as sibling of the row instead
              const parentInfo = useEditorStore.getState().getParentInfo(parentId);
              addComponent(type, parentInfo?.parent?.id ?? null);
            } else {
              addComponent(type, parentComp.children[0].id);
            }
          } else if (parentComp?.type === "table-row" && parentComp.children && parentComp.children.length > 0) {
            // Dropping on a table-row — redirect to first cell
            addComponent(type, parentComp.children[0].id);
          } else if (parentComp?.type === "table") {
            // Dropping on a table — redirect to first cell of first row
            const firstRow = parentComp.children?.[0];
            if (firstRow?.children?.[0]) {
              addComponent(type, firstRow.children[0].id);
            }
          } else {
            // For slotted types (card/modal/offcanvas), add to body slot by default
            if (isSlottedType(parentComp.type)) {
              addComponent(type, parentId, undefined, "body");
            } else {
              addComponent(type, parentId);
            }
          }
          return;
        }

        // Dropped on a container's "bottom" indicator → add as last child
        if (overId.startsWith("bottom-") && overId !== "bottom-drop") {
          const parentId = overId.replace("bottom-", "");
          const parentComp = useEditorStore.getState().findComponent(parentId);
          if (parentComp) {
            // For slotted types, add to body slot by default
            if (isSlottedType(parentComp.type)) {
              addComponent(type, parentId, undefined, "body");
            } else {
              addComponent(type, parentId);
            }
          }
          return;
        }

        // Dropped on a before/after indicator or canvas item
        if (overId.startsWith("before::")) {
          const rest = overId.replace("before::", "");
          const parts = rest.split("::");
          const targetId = parts[0];
          const parentId = parts.length > 1 ? parts[1] : null;
          const siblings = parentId
            ? useEditorStore.getState().findComponent(parentId)?.children || []
            : components;
          const idx = siblings.findIndex((c) => c.id === targetId);
          addComponent(type, parentId, idx !== -1 ? idx : undefined);
          return;
        }
        if (overId.startsWith("after::")) {
          const rest = overId.replace("after::", "");
          const parts = rest.split("::");
          const targetId = parts[0];
          const parentId = parts.length > 1 ? parts[1] : null;
          const siblings = parentId
            ? useEditorStore.getState().findComponent(parentId)?.children || []
            : components;
          const idx = siblings.findIndex((c) => c.id === targetId);
          addComponent(type, parentId, idx !== -1 ? idx + 1 : undefined);
          return;
        }

        // Dropped on a canvas item directly → add as sibling before it
        if (!overId.startsWith("palette-") && overId !== "canvas-drop-zone" && overId !== "top-drop" && overId !== "bottom-drop") {
          addComponent(type, null);
        } else {
          // Dropped on canvas or top/bottom indicator → add at root
          addComponent(type);
        }
        return;
      }

      // ── Canvas item reordered ──
      if (activeId !== overId && !overId.startsWith("palette-")) {
        // Moving into a slot drop zone (header/footer/body, tab-N, or acc-N)
        if (overId.startsWith("slot-")) {
          const rest = overId.replace("slot-", "");
          const numberedSlotMatch = rest.match(/^(comp-\d+-\d+)-(tab|acc)-(\d+)$/);
          const simpleMatch = rest.match(/^(comp-\d+-\d+)-(header|footer|body)$/);
          const match = numberedSlotMatch || simpleMatch;
          if (match) {
            const parentId = match[1];
            const slot = numberedSlotMatch ? `${numberedSlotMatch[2]}-${numberedSlotMatch[3]}` : match[2];
            if (parentId !== activeId) {
              const parentComp = useEditorStore.getState().findComponent(parentId);
              if (parentComp && isSlottedType(parentComp.type)) {
                useEditorStore.getState().moveComponentInTree(activeId, parentId, undefined, slot);
              }
            }
          }
          return;
        }

        // Moving into a container
        if (overId.startsWith("container-")) {
          const newParentId = overId.replace("container-", "");
          // Don't move into self
          if (newParentId !== activeId) {
            const parentComp = useEditorStore.getState().findComponent(newParentId);
            const draggedComp = useEditorStore.getState().findComponent(activeId);
            // If dropping on a column, redirect rows to be siblings of the parent row
            if (parentComp?.type === "col" && draggedComp?.type === "row") {
              const colParentInfo = useEditorStore.getState().getParentInfo(newParentId);
              useEditorStore.getState().moveComponentInTree(activeId, colParentInfo?.parent?.id ?? null);
            } else if (parentComp?.type === "row" && parentComp.children && parentComp.children.length > 0) {
              if (draggedComp?.type === "row") {
                // Don't nest rows inside rows — move as sibling of the target row
                const parentInfo = useEditorStore.getState().getParentInfo(newParentId);
                useEditorStore.getState().moveComponentInTree(activeId, parentInfo?.parent?.id ?? null);
              } else {
                useEditorStore.getState().moveComponentInTree(activeId, parentComp.children[0].id);
              }
            } else if (parentComp?.type === "table-row" && parentComp.children && parentComp.children.length > 0) {
              // Dropping on table-row — redirect to first cell
              useEditorStore.getState().moveComponentInTree(activeId, parentComp.children[0].id);
            } else if (parentComp?.type === "table") {
              // Dropping on table — redirect to first cell of first row
              const firstRow = parentComp.children?.[0];
              if (firstRow?.children?.[0]) {
                useEditorStore.getState().moveComponentInTree(activeId, firstRow.children[0].id);
              }
            } else {
              useEditorStore.getState().moveComponentInTree(activeId, newParentId);
            }
          }
          return;
        }

        // Moving via bottom-{id} indicator → add as last child of that container
        if (overId.startsWith("bottom-") && overId !== "bottom-drop") {
          const newParentId = overId.replace("bottom-", "");
          if (newParentId !== activeId) {
            const parentComp = useEditorStore.getState().findComponent(newParentId);
            const draggedComp = useEditorStore.getState().findComponent(activeId);
            // Prevent dropping rows inside rows or columns
            if (parentComp?.type === "row") {
              const parentInfo = useEditorStore.getState().getParentInfo(newParentId);
              useEditorStore.getState().moveComponentInTree(activeId, parentInfo?.parent?.id ?? null);
            } else if (parentComp?.type === "col" && draggedComp?.type === "row") {
              const colParentInfo = useEditorStore.getState().getParentInfo(newParentId);
              useEditorStore.getState().moveComponentInTree(activeId, colParentInfo?.parent?.id ?? null);
            } else if (parentComp?.type === "table-row") {
              // Dropping on table-row bottom — redirect to first cell
              const firstCell = parentComp.children?.[0];
              if (firstCell) {
                useEditorStore.getState().moveComponentInTree(activeId, firstCell.id);
              }
            } else if (parentComp?.type === "table") {
              // Dropping on table bottom — redirect to first cell of first row
              const firstRow = parentComp.children?.[0];
              if (firstRow?.children?.[0]) {
                useEditorStore.getState().moveComponentInTree(activeId, firstRow.children[0].id);
              }
            } else {
              useEditorStore.getState().moveComponentInTree(activeId, newParentId);
            }
          }
          return;
        }

        // Moving via before/after indicators
        if (overId.startsWith("before::") || overId.startsWith("after::")) {
          const isBefore = overId.startsWith("before::");
          const rest = overId.replace(isBefore ? "before::" : "after::", "");
          const parts = rest.split("::");
          const targetId = parts[0];
          const parentId = parts.length > 1 ? parts[1] : null;

          // Self-drop on own indicator: skip
          if (activeId === targetId) return;

          const siblings = parentId
            ? useEditorStore.getState().findComponent(parentId)?.children || []
            : components;
          const targetIdx = siblings.findIndex((c) => c.id === targetId);
          if (targetIdx !== -1) {
            // Adjust index: after removeFromTree removes activeId, the target shifts
            // if activeId was before the target in the same parent
            const activeIdx = siblings.findIndex((c) => c.id === activeId);
            let insertIdx: number;
            if (activeIdx !== -1 && activeIdx < targetIdx) {
              // Active was before target — after removal, target shifts left by 1
              insertIdx = isBefore ? targetIdx - 1 : targetIdx;
            } else {
              insertIdx = isBefore ? targetIdx : targetIdx + 1;
            }
            useEditorStore.getState().moveComponentInTree(activeId, parentId, insertIdx);
          }
          return;
        }
      }
    },
    [addComponent]
  );

  // ── Drag Cancel ──
  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
    setActiveDragData(null);
  }, []);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      toast.success("Codice copiato negli appunti!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = htmlCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      toast.success("Codice copiato negli appunti!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bootstrap-page.html";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File HTML scaricato!");
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // ── Save / Load / Export ──
  const handleSave = useCallback(() => {
    const { components } = useEditorStore.getState();
    localStorage.setItem("bootstrap-editor-project", JSON.stringify(components));
    toast.success("Progetto salvato!");
  }, []);

  const handleLoad = useCallback(() => {
    const saved = localStorage.getItem("bootstrap-editor-project");
    if (!saved) {
      toast.error("Nessun progetto salvato trovato");
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        useEditorStore.setState({ components: parsed, selectedId: null });
        useEditorStore.getState().pushHistory();
        toast.success("Progetto caricato!");
      }
    } catch {
      toast.error("Errore nel caricamento del progetto");
    }
  }, []);

  const handleExport = useCallback(() => {
    const { components } = useEditorStore.getState();
    const blob = new Blob([JSON.stringify(components, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bootstrap-editor-project.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Progetto esportato!");
  }, []);

  const handleImport = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  // Close template/project dropdown on outside click
  React.useEffect(() => {
    if (!templateOpen && !projectMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (templateOpen && templateRef.current && !templateRef.current.contains(e.target as Node)) {
        setTemplateOpen(false);
      }
      if (projectMenuOpen && projectMenuRef.current && !projectMenuRef.current.contains(e.target as Node)) {
        setProjectMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [templateOpen, projectMenuOpen]);

  const handleLoadTemplate = useCallback((templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    useEditorStore.getState().loadTemplate(tpl.components);
    setTemplateOpen(false);
    toast.success(`Template "${tpl.label}" caricato!`);
  }, []);

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        const success = useEditorStore.getState().importProject(parsed);
        if (success) {
          toast.success("Progetto importato!");
        } else {
          toast.error("File JSON non valido: formato non riconosciuto");
        }
      } catch {
        toast.error("Errore nella lettura del file JSON");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-imported
    e.target.value = "";
  }, []);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (
        (e.key === "y" && (e.ctrlKey || e.metaKey)) ||
        (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey)
      ) {
        e.preventDefault();
        redo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        const { selectedId } = useEditorStore.getState();
        if (selectedId) {
          const target = e.target as HTMLElement;
          if (
            target.tagName !== "INPUT" &&
            target.tagName !== "TEXTAREA" &&
            target.tagName !== "SELECT"
          ) {
            e.preventDefault();
            removeComponent(selectedId);
          }
        }
      }
      if (e.key === "Escape") {
        useEditorStore.getState().selectComponent(null);
      }
      // Ctrl+C: Copy component
      if (e.key === "c" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        const { selectedId } = useEditorStore.getState();
        if (selectedId) {
          const target = e.target as HTMLElement;
          if (
            target.tagName !== "INPUT" &&
            target.tagName !== "TEXTAREA" &&
            target.tagName !== "SELECT"
          ) {
            e.preventDefault();
            useEditorStore.getState().copyComponent(selectedId);
            toast.success("Componente copiato");
          }
        }
      }
      // Ctrl+V: Paste component
      if (e.key === "v" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        const { selectedId, clipboard } = useEditorStore.getState();
        if (clipboard) {
          const target = e.target as HTMLElement;
          if (
            target.tagName !== "INPUT" &&
            target.tagName !== "TEXTAREA" &&
            target.tagName !== "SELECT"
          ) {
            e.preventDefault();
            useEditorStore.getState().pasteComponent(selectedId);
            toast.success("Componente incollato");
          }
        }
      }
      // Ctrl+D: Duplicate component
      if (e.key === "d" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        const { selectedId } = useEditorStore.getState();
        if (selectedId) {
          const target = e.target as HTMLElement;
          if (
            target.tagName !== "INPUT" &&
            target.tagName !== "TEXTAREA" &&
            target.tagName !== "SELECT"
          ) {
            e.preventDefault();
            useEditorStore.getState().duplicateComponent(selectedId);
            toast.success("Componente duplicato");
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, removeComponent]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={editorCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="h-screen flex flex-col bg-background">
        {/* Top Toolbar */}
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-foreground">
                Bootstrap Editor
              </span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                Bootstrap 5.3
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              className="h-8 px-2"
              title="Annulla (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              className="h-8 px-2"
              title="Ripristina (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </Button>

            <div className="w-px h-5 bg-border mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewDialogOpen(true)}
              disabled={components.length === 0}
              className="h-8 px-2.5 gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="text-xs">Anteprima</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCodeDialogOpen(true)}
              disabled={components.length === 0}
              className="h-8 px-2.5 gap-1.5"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="text-xs">HTML</span>
            </Button>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Project menu — Save / Load / Import / Export */}
            <div className="relative" ref={projectMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                className="h-8 px-2.5 gap-1.5"
                title="Progetto"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="text-xs">Progetto</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${projectMenuOpen ? "rotate-180" : ""}`} />
              </Button>
              {projectMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-border">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Progetto</span>
                  </div>
                  <button
                    onClick={() => { handleSave(); setProjectMenuOpen(false); }}
                    disabled={components.length === 0}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted/80 transition-colors duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-default"
                  >
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Save className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Salva</div>
                      <div className="text-[11px] text-muted-foreground leading-snug">Salva nel browser (localStorage)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { handleLoad(); setProjectMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted/80 transition-colors duration-100 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <FolderOpen className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Carica</div>
                      <div className="text-[11px] text-muted-foreground leading-snug">Carica dal browser (localStorage)</div>
                    </div>
                  </button>
                  <div className="mx-3 my-1 border-t border-border" />
                  <button
                    onClick={() => { handleImport(); setProjectMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted/80 transition-colors duration-100 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Upload className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Importa</div>
                      <div className="text-[11px] text-muted-foreground leading-snug">Importa da file JSON</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { handleExport(); setProjectMenuOpen(false); }}
                    disabled={components.length === 0}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted/80 transition-colors duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-default"
                  >
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Download className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Esporta</div>
                      <div className="text-[11px] text-muted-foreground leading-snug">Esporta come file JSON</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-border mx-1" />

            <div className="relative" ref={templateRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTemplateOpen(!templateOpen)}
                className="h-8 px-2.5 gap-1.5"
                title="Template predefiniti"
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span className="text-xs">Template</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${templateOpen ? "rotate-180" : ""}`} />
              </Button>
              {templateOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-border">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Template predefiniti</span>
                  </div>
                  {TEMPLATES.map((tpl) => {
                    const IconComp = tpl.icon;
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => handleLoadTemplate(tpl.id)}
                        className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-muted/80 transition-colors duration-100 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <IconComp className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{tpl.label}</div>
                          <div className="text-[11px] text-muted-foreground leading-snug">{tpl.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Hidden file input for JSON import */}
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportFile}
            />

            <div className="w-px h-5 bg-border mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setClearDialogOpen(true)}
              disabled={components.length === 0}
              className="h-8 px-2 text-destructive hover:text-destructive"
              title="Svuota canvas"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Content — Resizable Sidebars */}
        <div className="flex-1 flex overflow-hidden">
          <LeftSidebar width={leftSidebar.width} />
          <ResizeHandle onPointerDown={leftSidebar.startResize} side="left" />
          <Canvas activeDragId={activeDragId} />
          <ResizeHandle onPointerDown={rightSidebar.startResize} side="right" />
          <RightSidebar width={rightSidebar.width} />
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {activeDragId && activeDragData && (
          <div className="bg-card border border-primary/30 rounded-lg px-4 py-3 shadow-2xl shadow-primary/10 flex items-center gap-2 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground">
              {activeDragData.label || "Componente"}
            </span>
            {activeDragData.fromPalette && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">
                Nuovo
              </Badge>
            )}
          </div>
        )}
      </DragOverlay>

      {/* Code Dialog */}
      <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
        <DialogContent className="max-w-4xl flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              HTML Bootstrap generato
            </DialogTitle>
            <DialogDescription>
              Copia il codice HTML generato o scaricalo come file. Richiede
              Bootstrap 5.3.3 CSS e JS.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="gap-1.5"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copiato!" : "Copia codice"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Scarica HTML
            </Button>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <pre className="bg-muted rounded-lg p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words">
              {htmlCode || "<!-- Nessun componente sulla canvas -->"}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent
          className="p-0 overflow-hidden flex flex-col"
          style={{
            width: `${previewSize.w}px`,
            maxWidth: `${previewSize.w}px`,
            height: `${previewSize.h}px`,
            maxHeight: `${previewSize.h}px`,
          }}
          showCloseButton={false}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50 shrink-0">
            <DialogTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Anteprima (Bootstrap 5.3.3)
              <span className="text-[11px] text-muted-foreground font-normal ml-1">
                {previewSize.w} × {previewSize.h}
              </span>
            </DialogTitle>
            <div className="flex items-center gap-1">
              {/* Screenshot — with text label for desktop */}
              <button
                onClick={handleScreenshot}
                disabled={isCapturing}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                title="Salva screenshot come immagine (PNG) — Scegli dove salvare"
              >
                <Camera className={`w-3.5 h-3.5 ${isCapturing ? "animate-pulse" : ""}`} />
                <span className="text-xs">Screenshot</span>
              </button>
              <button
                onClick={handleScreenshot}
                disabled={isCapturing}
                className="sm:hidden p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                title="Salva screenshot come immagine (PNG)"
              >
                <Camera className={`w-3.5 h-3.5 ${isCapturing ? "animate-pulse" : ""}`} />
              </button>
              <div className="w-px h-4 bg-border mx-0.5" />
              {/* Zoom controls */}
              <button
                onClick={handlePreviewZoomOut}
                disabled={previewZoom <= 25}
                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30"
                title="Riduci zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <select
                value={previewZoom}
                onChange={(e) => setPreviewZoom(Number(e.target.value))}
                className="h-6 w-[56px] text-[11px] text-center bg-muted border-0 rounded px-0.5 text-muted-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none"
              >
                {[25, 50, 75, 100, 125, 150, 200].map((level) => (
                  <option key={level} value={level}>{level}%</option>
                ))}
              </select>
              <button
                onClick={handlePreviewZoomIn}
                disabled={previewZoom >= 200}
                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30"
                title="Aumenta zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              {previewZoom !== 100 && (
                <button
                  onClick={handlePreviewZoomReset}
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Resetta zoom"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
              <div className="w-px h-4 bg-border mx-0.5" />
              {/* Viewport presets — highlight active */}
              <button
                onClick={() => applyPresetSize(375, 667, "mobile")}
                className={`p-1.5 rounded transition-colors ${
                  activePreset === "mobile"
                    ? "bg-primary/15 text-primary"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
                title="Cellulare (375×667)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => applyPresetSize(768, 1024, "tablet")}
                className={`p-1.5 rounded transition-colors ${
                  activePreset === "tablet"
                    ? "bg-primary/15 text-primary"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
                title="Tablet (768×1024)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => applyPresetSize(1280, 800, "desktop")}
                className={`p-1.5 rounded transition-colors ${
                  activePreset === "desktop"
                    ? "bg-primary/15 text-primary"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
                title="Desktop (1280×800)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-border mx-0.5" />
              <button
                onClick={() => setPreviewDialogOpen(false)}
                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Chiudi"
              >
                <span className="text-base leading-none">✕</span>
              </button>
            </div>
          </div>
          {/* Iframe container */}
          <div className="flex-1 min-h-0 min-w-0 relative overflow-hidden">
            {/* Scrollable wrapper for zoom */}
            <div
              className="absolute inset-0 overflow-auto"
            >
              <div
                style={{
                  transform: `scale(${previewZoom / 100})`,
                  transformOrigin: "top left",
                  transition: "transform 150ms ease-out",
                  width: previewZoom !== 100 ? `${previewSize.w}px` : `${previewSize.w}px`,
                  minHeight: previewZoom !== 100 ? `${(previewSize.h - 40) * 100 / previewZoom}px` : "100%",
                }}
              >
                <iframe
                  ref={previewIframeRef}
                  srcDoc={htmlCode}
                  style={{
                    width: "100%",
                    minHeight: `${previewSize.h - 40}px`,
                    border: "none",
                    background: "white",
                    display: "block",
                  }}
                  title="Bootstrap Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          </div>
          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-end justify-end pb-0.5 pr-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10"
            onPointerDown={handleResizeStart}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            onPointerCancel={handleResizeEnd}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <circle cx="8" cy="8" r="1.2" />
              <circle cx="4.5" cy="8" r="1.2" />
              <circle cx="8" cy="4.5" r="1.2" />
            </svg>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Canvas Confirmation */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Svuota canvas</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare tutti i componenti dal canvas? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClearDialogOpen(false)}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearCanvas();
                setClearDialogOpen(false);
                toast.success("Canvas svuotato");
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina tutto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndContext>
  );
}
