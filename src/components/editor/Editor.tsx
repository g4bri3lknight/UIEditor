"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { LeftSidebar } from "./LeftSidebar";
import { Canvas } from "./canvas/Canvas";
import { RightSidebar } from "./RightSidebar";
import { useEditorStore } from "@/store/editor-store";
import { Toolbar } from "./Toolbar";
import { PageTabs } from "./PageTabs";
import { CodeDialog } from "./CodeDialog";
import { PreviewDialog } from "./PreviewDialog";
import { ThemeDialog } from "./ThemeDialog";
import { ProjectMenu } from "./ProjectMenu";
import { ShortcutsDialog } from "./ShortcutsDialog";
import { ResizeHandle, useSidebarResize } from "./ResizeHandle";
import {
  editorCollisionDetection,
  handleDragEnd,
  computeDragStartData,
} from "./drag-handlers";
import { generateFullHTML } from "@/lib/editor/code-generator";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function Editor() {
  const {
    components,
    undo,
    redo,
    history,
    historyIndex,
    removeComponent,
    clearCanvas,
    hiddenComponents,
    customCSS,
    bootstrapTheme,
    addPage,
  } = useEditorStore();

  // ── Dialog states ──
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);

  // ── Drag state ──
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<{
    fromPalette: boolean;
    type?: string;
    label?: string;
  } | null>(null);

  // ── Sidebar resizing ──
  const leftSidebar = useSidebarResize("editor-left-width", 256, 180, 400);
  const rightSidebar = useSidebarResize("editor-right-width", 288, 200, 500, "right");

  // ── Generated HTML code ──
  const htmlCode = useMemo(
    () => generateFullHTML(components, hiddenComponents, customCSS, bootstrapTheme),
    [components, hiddenComponents, customCSS, bootstrapTheme]
  );

  // ── DnD sensors ──
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // ── Drag handlers ──
  const onDragStart = useCallback((event: Parameters<typeof computeDragStartData>[0]) => {
    const data = computeDragStartData(event);
    setActiveDragId(data.activeDragId);
    setActiveDragData(data.activeDragData);
  }, []);

  const onDragEnd = useCallback((event: Parameters<typeof handleDragEnd>[0]) => {
    handleDragEnd(event);
    setActiveDragId(null);
    setActiveDragData(null);
  }, []);

  const onDragCancel = useCallback(() => {
    setActiveDragId(null);
    setActiveDragData(null);
  }, []);

  // ── History state ──
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // ── Keyboard shortcuts ──
  const handleSave = useCallback(() => {
    // Sync current page into pages array before saving
    useEditorStore.getState()._syncCurrentPage();
    const { components, bootstrapTheme, pages, activePageId, customCSS } = useEditorStore.getState();
    const project = {
      version: 2,
      savedAt: new Date().toISOString(),
      components,
      bootstrapTheme,
      pages,
      activePageId,
      customCSS,
    };
    localStorage.setItem("bootstrap-editor-project", JSON.stringify(project));
    toast.success("Progetto salvato!");
  }, []);

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
        const { selectedId } = useEditorStore.getState();
        if (selectedId) {
          const parentInfo = useEditorStore.getState().getParentInfo(selectedId);
          if (parentInfo?.parent) {
            useEditorStore.getState().selectComponent(parentInfo.parent.id);
          } else {
            useEditorStore.getState().selectComponent(null);
          }
        }
        setShortcutsDialogOpen(false);
        setCodeDialogOpen(false);
        setPreviewDialogOpen(false);
      }
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          target.tagName !== "SELECT"
        ) {
          setShortcutsDialogOpen(true);
        }
      }
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
      if (e.key === "v" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        const { clipboard } = useEditorStore.getState();
        if (clipboard) {
          const target = e.target as HTMLElement;
          if (
            target.tagName !== "INPUT" &&
            target.tagName !== "TEXTAREA" &&
            target.tagName !== "SELECT"
          ) {
            e.preventDefault();
            const { selectedId } = useEditorStore.getState();
            useEditorStore.getState().pasteComponent(selectedId);
            toast.success("Componente incollato");
          }
        }
      }
      if (e.key === "s" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
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
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const { selectedId } = useEditorStore.getState();
        if (selectedId) {
          const target = e.target as HTMLElement;
          if (
            target.tagName !== "INPUT" &&
            target.tagName !== "TEXTAREA" &&
            target.tagName !== "SELECT"
          ) {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              useEditorStore.getState().moveUp(selectedId);
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              useEditorStore.getState().moveDown(selectedId);
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, removeComponent, handleSave]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={editorCollisionDetection}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="h-screen flex flex-col bg-background">
        {/* Top Toolbar */}
        <Toolbar
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onPreview={() => setPreviewDialogOpen(true)}
          onCode={() => setCodeDialogOpen(true)}
          onClear={() => setClearDialogOpen(true)}
          onShortcuts={() => setShortcutsDialogOpen(true)}
          onThemeDialog={() => setThemeDialogOpen(true)}
        />

        {/* Page Tabs */}
        <PageTabs onAddPage={() => { addPage(); toast.success("Nuova pagina creata"); }} />

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
      <CodeDialog
        open={codeDialogOpen}
        onOpenChange={setCodeDialogOpen}
        htmlCode={htmlCode}
      />

      {/* Preview Dialog */}
      <PreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
      />

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

      {/* Keyboard Shortcuts Dialog */}
      <ShortcutsDialog
        open={shortcutsDialogOpen}
        onOpenChange={setShortcutsDialogOpen}
      />

      {/* Theme Builder Dialog */}
      <ThemeDialog
        open={themeDialogOpen}
        onOpenChange={setThemeDialogOpen}
      />
    </DndContext>
  );
}
