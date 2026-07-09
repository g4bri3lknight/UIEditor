"use client";

import { useState, useCallback } from "react";
import { useEditorStore } from "@/store/editor-store";
import { ProjectMenu } from "./ProjectMenu";
import { Button } from "@/components/ui/button";
import { Eye, Code, CircleHelp, Pencil, Check } from "lucide-react";

interface EditorToolbarProps {
  onPreview: () => void;
  onCode: () => void;
  onShortcuts: () => void;
  onThemeDialog: () => void;
}

/**
 * Secondary toolbar (between the header and the page tabs).
 *
 * Left side (all together): editable project name + small gap +
 *   Project menu · Anteprima · HTML · Scorciatoie.
 *
 * Undo/Redo live in the canvas toolbar (next to zoom). Page tabs live
 * in the PageTabs bar. Theme cycle lives in the header (Toolbar).
 */
export function EditorToolbar({
  onPreview,
  onCode,
  onShortcuts,
  onThemeDialog,
}: EditorToolbarProps) {
  const projectName = useEditorStore((s) => s.projectName);
  const setProjectName = useEditorStore((s) => s.setProjectName);
  const components = useEditorStore((s) => s.components);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(projectName);

  const startEdit = useCallback(() => {
    setDraft(projectName);
    setEditing(true);
  }, [projectName]);

  const commitEdit = useCallback(() => {
    const trimmed = draft.trim();
    setProjectName(trimmed || "Progetto senza nome");
    setEditing(false);
  }, [draft, setProjectName]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
  }, []);

  return (
    <div className="border-b ios-border-subtle ios-satin-toolbar flex items-center gap-2 px-3 h-10 shrink-0 z-10">
      {/* Editable project name — left side */}
      <div className="flex items-center gap-1.5 min-w-0 shrink-0">
        {editing ? (
          <>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              className="h-6 min-w-[140px] max-w-[320px] text-xs font-medium bg-transparent border border-primary/40 rounded-md px-2 outline-none focus:ring-1 focus:ring-primary/30 text-foreground"
              placeholder="Nome progetto"
            />
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                commitEdit();
              }}
              className="p-1 rounded-md hover:bg-foreground/5 text-primary transition-colors"
              title="Conferma"
              aria-label="Conferma nome progetto"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={startEdit}
            className="group flex items-center gap-1.5 h-6 px-2 rounded-md hover:bg-foreground/5 transition-colors max-w-[340px]"
            title="Clicca per rinominare il progetto"
          >
            <span className="text-xs font-semibold text-foreground truncate">
              {projectName}
            </span>
            <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        )}
      </div>

      {/* Commands — immediately after the project name (small gap) */}
      <div className="flex items-center gap-0.5 shrink-0 ml-3">
        {/* Project menu */}
        <ProjectMenu onOpenThemeDialog={onThemeDialog} />

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
