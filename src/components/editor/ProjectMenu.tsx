"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/editor-store";
import { logger } from "@/lib/logger";
import {
  Save,
  Upload,
  Download,
  FolderOpen,
  Palette,
  Plus,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

interface ProjectMenuProps {
  onOpenThemeDialog: () => void;
}

export function ProjectMenu({ onOpenThemeDialog }: ProjectMenuProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const components = useEditorStore((s) => s.components);
  const pages = useEditorStore((s) => s.pages);
  const activePageId = useEditorStore((s) => s.activePageId);
  const addPage = useEditorStore((s) => s.addPage);
  const deletePage = useEditorStore((s) => s.deletePage);

  // ── Save / Load / Export ──
  const handleSave = useCallback(() => {
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
      } else if (parsed && parsed.version >= 2 && parsed.components) {
        const stateUpdate: Record<string, unknown> = {
          components: parsed.components,
          selectedId: null,
        };
        if (parsed.bootstrapTheme) stateUpdate.bootstrapTheme = parsed.bootstrapTheme;
        if (parsed.customCSS !== undefined) stateUpdate.customCSS = parsed.customCSS;
        if (parsed.pages && parsed.activePageId) {
          stateUpdate.pages = parsed.pages;
          stateUpdate.activePageId = parsed.activePageId;
          const activePage = parsed.pages.find((p: { id: string }) => p.id === parsed.activePageId);
          if (activePage) {
            stateUpdate.components = activePage.components;
            stateUpdate.history = activePage.history || [[]];
            stateUpdate.historyIndex = activePage.historyIndex ?? 0;
          }
        }
        useEditorStore.setState(stateUpdate);
        useEditorStore.getState().pushHistory();
      } else if (parsed && parsed.components && Array.isArray(parsed.components)) {
        const stateUpdate: Record<string, unknown> = {
          components: parsed.components,
          selectedId: null,
        };
        if (parsed.bootstrapTheme) stateUpdate.bootstrapTheme = parsed.bootstrapTheme;
        if (parsed.customCSS !== undefined) stateUpdate.customCSS = parsed.customCSS;
        useEditorStore.setState(stateUpdate);
        useEditorStore.getState().pushHistory();
      } else {
        toast.error("Formato progetto non riconosciuto");
        return;
      }
      toast.success("Progetto caricato!");
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      logger.error("Failed to load project", err, "ProjectMenu");
      toast.error("Errore nel caricamento del progetto");
    }
  }, []);

  const handleExport = useCallback(() => {
    useEditorStore.getState()._syncCurrentPage();
    const { components, bootstrapTheme, pages, activePageId, customCSS } = useEditorStore.getState();
    const project = {
      version: 2,
      exportedAt: new Date().toISOString(),
      components,
      bootstrapTheme,
      pages,
      activePageId,
      customCSS,
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bootstrap-editor-project.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Progetto esportato!");
  }, []);

  const handleImportClick = useCallback(() => {
    importInputRef.current?.click();
  }, []);

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

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        const store = useEditorStore.getState();

        if (Array.isArray(parsed)) {
          const success = store.importProject(parsed);
          if (success) {
            toast.success("Progetto importato!");
          } else {
            toast.error("File JSON non valido: formato non riconosciuto");
          }
          return;
        }

        if (!parsed.components || !Array.isArray(parsed.components)) {
          toast.error("File JSON non valido: componenti non trovati");
          return;
        }

        const isValid = parsed.components.every(
          (item: Record<string, unknown>) =>
            typeof item === "object" &&
            item !== null &&
            typeof item.id === "string" &&
            typeof item.type === "string" &&
            typeof item.props === "object"
        );
        if (!isValid) {
          toast.error("File JSON non valido: componenti corrotti");
          return;
        }

        const stateUpdate: Record<string, unknown> = {
          components: parsed.components,
          selectedId: null,
        };

        if (parsed.bootstrapTheme) {
          stateUpdate.bootstrapTheme = parsed.bootstrapTheme;
        }

        if (parsed.customCSS !== undefined) {
          stateUpdate.customCSS = parsed.customCSS;
        }

        if (parsed.pages && parsed.activePageId) {
          stateUpdate.pages = parsed.pages;
          stateUpdate.activePageId = parsed.activePageId;
          const activePage = parsed.pages.find((p: { id: string }) => p.id === parsed.activePageId);
          if (activePage) {
            stateUpdate.components = activePage.components;
            stateUpdate.history = activePage.history || [[]];
            stateUpdate.historyIndex = activePage.historyIndex ?? 0;
          } else {
            stateUpdate.history = [[]];
            stateUpdate.historyIndex = 0;
          }
        } else {
          const importedComps = parsed.components;
          const singlePage = {
            id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: "Home",
            components: importedComps,
            history: [[]],
            historyIndex: 0,
          };
          stateUpdate.pages = [singlePage];
          stateUpdate.activePageId = singlePage.id;
        }

        useEditorStore.setState(stateUpdate);
        useEditorStore.getState().pushHistory();
        toast.success("Progetto importato!");
      } catch {
        toast.error("Errore nella lettura del file JSON");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-imported
    e.target.value = "";
  }, []);

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
            onClick={() => { handleSave(); setMenuOpen(false); }}
            disabled={components.length === 0}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-default"
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
            onClick={() => { handleLoad(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors duration-100 cursor-pointer"
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
            onClick={() => { handleImportClick(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors duration-100 cursor-pointer"
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
            onClick={() => { handleExport(); setMenuOpen(false); }}
            disabled={components.length === 0}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Download className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Esporta</div>
              <div className="text-[11px] text-muted-foreground leading-snug">Esporta come file JSON</div>
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
      {/* Hidden file input for JSON import */}
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportFile}
      />
    </div>
  );
}
