"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editor-store";
import {
  Save,
  FilePlus2,
  FolderOpen,
  Palette,
  Plus,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  saveProject,
  saveProjectAs,
  loadProject,
  loadProjectFromFile,
  hasCurrentFile,
  supportsFileSystemAccess,
} from "@/lib/editor/project-file";

interface ProjectMenuProps {
  onOpenThemeDialog: () => void;
}

export function ProjectMenu({ onOpenThemeDialog }: ProjectMenuProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const loadInputRef = useRef<HTMLInputElement>(null);

  const components = useEditorStore((s) => s.components);
  const pages = useEditorStore((s) => s.pages);
  const activePageId = useEditorStore((s) => s.activePageId);
  const addPage = useEditorStore((s) => s.addPage);
  const deletePage = useEditorStore((s) => s.deletePage);
  const setCurrentProjectFileName = useEditorStore(
    (s) => s.setCurrentProjectFileName
  );

  // ── Salva: overwrite current file (or Save As if none) ──
  const handleSave = useCallback(async () => {
    try {
      const fileName = await saveProject();
      if (fileName === null) return; // user cancelled Save As
      setCurrentProjectFileName(fileName);
      toast.success(`Progetto salvato in "${fileName}"`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Errore sconosciuto";
      toast.error(`Errore nel salvataggio: ${msg}`);
    }
  }, [setCurrentProjectFileName]);

  // ── Salva con nome: always show the picker ──
  const handleSaveAs = useCallback(async () => {
    try {
      const fileName = await saveProjectAs();
      if (fileName === null) return; // user cancelled
      setCurrentProjectFileName(fileName);
      toast.success(`Progetto salvato in "${fileName}"`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Errore sconosciuto";
      toast.error(`Errore nel salvataggio: ${msg}`);
    }
  }, [setCurrentProjectFileName]);

  // ── Carica: open file dialog ──
  const handleLoad = useCallback(async () => {
    // Fallback for browsers without the File System Access API.
    if (!supportsFileSystemAccess()) {
      loadInputRef.current?.click();
      return;
    }
    try {
      const fileName = await loadProject();
      if (fileName === null) return; // user cancelled
      setCurrentProjectFileName(fileName);
      toast.success(`Progetto caricato da "${fileName}"`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Errore sconosciuto";
      toast.error(`Errore nel caricamento: ${msg}`);
    }
  }, [setCurrentProjectFileName]);

  // Fallback <input type=file> change handler
  const handleLoadFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const fileName = loadProjectFromFile(file);
        setCurrentProjectFileName(fileName);
        toast.success(`Progetto caricato da "${fileName}"`);
      } catch {
        toast.error("Errore nella lettura del file JSON");
      }
      e.target.value = "";
    },
    [setCurrentProjectFileName]
  );

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // "Salva" is enabled only when there's content AND a file is already
  // open (otherwise it would just behave like Save As, which has its
  // own entry). If no file is open, "Salva" is disabled and the user
  // uses "Salva con nome" the first time.
  const canSave = components.length > 0 && hasCurrentFile();

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMenuOpen(!menuOpen)}
        className="h-8 px-2.5 gap-1.5"
        title="Progetto"
      >
        <FolderOpen className="w-3.5 h-3.5" />
        <span className="text-xs">Progetto</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${menuOpen ? "rotate-180" : ""}`} />
      </Button>
      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-neutral-800 border ios-border-subtle rounded-xl shadow-lg z-50 py-1">
          <div className="px-3 py-1.5 border-b border-border">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Progetto</span>
          </div>
          <button
            onClick={() => { void handleSave(); setMenuOpen(false); }}
            disabled={!canSave}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Save className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Salva</div>
              <div className="text-[11px] text-muted-foreground leading-snug">Sovrascrivi il file corrente</div>
            </div>
          </button>
          <button
            onClick={() => { void handleSaveAs(); setMenuOpen(false); }}
            disabled={components.length === 0}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <FilePlus2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Salva con nome…</div>
              <div className="text-[11px] text-muted-foreground leading-snug">Scegli percorso file JSON</div>
            </div>
          </button>
          <button
            onClick={() => { void handleLoad(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors duration-100 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <FolderOpen className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Carica…</div>
              <div className="text-[11px] text-muted-foreground leading-snug">Apri file JSON</div>
            </div>
          </button>
          <div className="mx-3 my-1 border-t border-border" />
          <div className="px-3 py-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tema</span>
          </div>
          <button
            onClick={() => { onOpenThemeDialog(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors duration-100 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Palette className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Theme Builder</div>
              <div className="text-[11px] text-muted-foreground leading-snug">Personalizza tema Bootstrap</div>
            </div>
          </button>
          <div className="mx-3 my-1 border-t border-border" />
          <div className="px-3 py-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pagine</span>
          </div>
          <button
            onClick={() => { addPage(); setMenuOpen(false); toast.success("Nuova pagina creata"); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors duration-100 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Plus className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Nuova pagina</div>
              <div className="text-[11px] text-muted-foreground leading-snug">Aggiungi una pagina al progetto</div>
            </div>
          </button>
          <button
            onClick={() => {
              if (pages.length <= 1) return;
              deletePage(activePageId);
              setMenuOpen(false);
            }}
            disabled={pages.length <= 1}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            <div className="w-7 h-7 rounded-md bg-destructive/10 flex items-center justify-center shrink-0">
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Elimina pagina</div>
              <div className="text-[11px] text-muted-foreground leading-snug">Elimina la pagina corrente</div>
            </div>
          </button>
        </div>
      )}
      {/* Hidden file input for fallback JSON load (browsers without
          the File System Access API). */}
      <input
        ref={loadInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleLoadFile}
      />
    </div>
  );
}
