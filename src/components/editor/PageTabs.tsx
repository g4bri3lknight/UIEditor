"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { useTheme } from "next-themes";
import { ProjectMenu } from "./ProjectMenu";
import { Button } from "@/components/ui/button";
import {
  FileText, Plus, X,
  Undo2, Redo2, Eye, Code, Trash2, Moon, Sun, CircleHelp,
} from "lucide-react";
import { toast } from "sonner";

interface PageTabsProps {
  onAddPage: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onPreview: () => void;
  onCode: () => void;
  onClear: () => void;
  onShortcuts: () => void;
  onThemeDialog: () => void;
}

export function PageTabs({
  onAddPage,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onPreview,
  onCode,
  onClear,
  onShortcuts,
  onThemeDialog,
}: PageTabsProps) {
  const pages = useEditorStore((s) => s.pages);
  const activePageId = useEditorStore((s) => s.activePageId);
  const components = useEditorStore((s) => s.components);
  const switchPage = useEditorStore((s) => s.switchPage);
  const deletePage = useEditorStore((s) => s.deletePage);
  const renamePage = useEditorStore((s) => s.renamePage);

  const { theme, setTheme } = useTheme();

  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [renamingPageName, setRenamingPageName] = useState("");

  return (
    <div className="border-b ios-border-subtle ios-satin-toolbar flex items-center gap-0 px-2 h-10 shrink-0 z-10">
      {/* Page tabs — left side */}
      <div className="flex items-center gap-0 overflow-x-auto shrink-0">
        {pages.map((page) => (
          <div
            key={page.id}
            className={`group flex items-center gap-1.5 px-3 h-full text-xs font-medium cursor-pointer border-b-2 transition-all duration-200 shrink-0 ${
              page.id === activePageId
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/50"
            }`}
            onClick={() => switchPage(page.id)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setRenamingPageId(page.id);
              setRenamingPageName(page.name);
            }}
          >
            {renamingPageId === page.id ? (
              <input
                autoFocus
                value={renamingPageName}
                onChange={(e) => setRenamingPageName(e.target.value)}
                onBlur={() => {
                  if (renamingPageName.trim()) {
                    renamePage(page.id, renamingPageName.trim());
                  }
                  setRenamingPageId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (renamingPageName.trim()) {
                      renamePage(page.id, renamingPageName.trim());
                    }
                    setRenamingPageId(null);
                  }
                  if (e.key === "Escape") {
                    setRenamingPageId(null);
                  }
                }}
                className="w-20 h-5 text-xs bg-transparent border border-primary/40 rounded-md px-1 outline-none focus:ring-1 focus:ring-primary/30"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <FileText className="w-3 h-3 shrink-0 opacity-60" />
                <span className="max-w-[120px] truncate">{page.name}</span>
              </>
            )}
            {pages.length > 1 && renamingPageId !== page.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (pages.length <= 1) return;
                  deletePage(page.id);
                  toast.success(`Pagina "${page.name}" eliminata`);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-foreground/5 transition-all"
                title="Elimina pagina"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={onAddPage}
          className="flex items-center gap-1 px-2 h-full text-xs text-muted-foreground hover:text-primary transition-colors shrink-0"
          title="Aggiungi pagina"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden sm:inline">Nuova</span>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Commands — right side */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-7 w-7 p-0 rounded-lg hover:bg-foreground/5 transition-colors"
          title="Annulla (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-7 w-7 p-0 rounded-lg hover:bg-foreground/5 transition-colors"
          title="Ripristina (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </Button>

        <div className="w-px h-4 ios-separator mx-1 rounded-full" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onPreview}
          disabled={components.length === 0}
          className="h-7 px-2 gap-1 rounded-lg hover:bg-foreground/5 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="text-[11px]">Anteprima</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCode}
          disabled={components.length === 0}
          className="h-7 px-2 gap-1 rounded-lg hover:bg-foreground/5 transition-colors"
        >
          <Code className="w-3.5 h-3.5" />
          <span className="text-[11px]">HTML</span>
        </Button>

        <div className="w-px h-4 ios-separator mx-1 rounded-full" />

        {/* Project menu */}
        <ProjectMenu onOpenThemeDialog={onThemeDialog} />

        <div className="w-px h-4 ios-separator mx-1 rounded-full" />

        {/* Clear canvas */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={components.length === 0}
          className="h-7 w-7 p-0 rounded-lg hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors"
          title="Svuota canvas"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>

        <div className="w-px h-4 ios-separator mx-1 rounded-full" />

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-7 w-7 p-0 rounded-lg hover:bg-foreground/5 transition-colors"
          title={theme === "dark" ? "Modalità chiara" : "Modalità scura"}
        >
          {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </Button>

        {/* Shortcuts */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onShortcuts}
          className="h-7 w-7 p-0 rounded-lg hover:bg-foreground/5 transition-colors"
          title="Scorciatoie da tastiera"
        >
          <CircleHelp className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
