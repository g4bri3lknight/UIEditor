"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEditorStore } from "@/store/editor-store";
import { useTheme } from "next-themes";
import { ProjectMenu } from "./ProjectMenu";
import {
  Undo2,
  Redo2,
  Eye,
  Code,
  Trash2,
  Moon,
  Sun,
  CircleHelp,
} from "lucide-react";

interface ToolbarProps {
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

export function Toolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onPreview,
  onCode,
  onClear,
  onShortcuts,
  onThemeDialog,
}: ToolbarProps) {
  const components = useEditorStore((s) => s.components);
  const _isDirty = useEditorStore((s) => s._isDirty);
  const _lastSavedAt = useEditorStore((s) => s._lastSavedAt);

  const { theme, setTheme } = useTheme();

  return (
    <header className="h-12 border-b ios-border-subtle ios-satin-toolbar flex items-center justify-between px-4 shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[8px] bg-primary/90 flex items-center justify-center shadow-sm shadow-primary/20">
            <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-foreground tracking-tight">
            Bootstrap Editor
          </span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal rounded-md ios-border-subtle">
            Bootstrap 5.3
          </Badge>
          {/* Auto-save indicator */}
          <div className="flex items-center gap-1 ml-2">
            {_isDirty ? (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Salvataggio...
              </span>
            ) : _lastSavedAt ? (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Salvato
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-8 w-8 p-0 rounded-lg hover:bg-foreground/5 transition-colors"
          title="Annulla (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-8 w-8 p-0 rounded-lg hover:bg-foreground/5 transition-colors"
          title="Ripristina (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 ios-separator mx-1.5 rounded-full" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onPreview}
          disabled={components.length === 0}
          className="h-8 px-2.5 gap-1.5 rounded-lg hover:bg-foreground/5 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="text-xs">Anteprima</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCode}
          disabled={components.length === 0}
          className="h-8 px-2.5 gap-1.5 rounded-lg hover:bg-foreground/5 transition-colors"
        >
          <Code className="w-3.5 h-3.5" />
          <span className="text-xs">HTML</span>
        </Button>

        <div className="w-px h-5 ios-separator mx-1.5 rounded-full" />

        {/* Project menu — Save / Load / Import / Export */}
        <ProjectMenu onOpenThemeDialog={onThemeDialog} />

        <div className="w-px h-5 ios-separator mx-1.5 rounded-full" />

        {/* Clear canvas */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={components.length === 0}
          className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors"
          title="Svuota canvas"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 ios-separator mx-1.5 rounded-full" />

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8 p-0 rounded-lg hover:bg-foreground/5 transition-colors"
          title={theme === "dark" ? "Modalità chiara" : "Modalità scura"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Shortcuts */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onShortcuts}
          className="h-8 w-8 p-0 rounded-lg hover:bg-foreground/5 transition-colors"
          title="Scorciatoie da tastiera"
        >
          <CircleHelp className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
