"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { FileText, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface PageTabsProps {
  onAddPage: () => void;
}

export function PageTabs({ onAddPage }: PageTabsProps) {
  const pages = useEditorStore((s) => s.pages);
  const activePageId = useEditorStore((s) => s.activePageId);
  const switchPage = useEditorStore((s) => s.switchPage);
  const deletePage = useEditorStore((s) => s.deletePage);
  const renamePage = useEditorStore((s) => s.renamePage);

  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [renamingPageName, setRenamingPageName] = useState("");

  return (
    <div className="border-b border-border bg-card flex items-center gap-0 px-2 h-9 shrink-0 overflow-x-auto">
      {pages.map((page) => (
        <div
          key={page.id}
          className={`group flex items-center gap-1 px-3 h-full text-xs font-medium cursor-pointer border-b-2 transition-colors shrink-0 ${
            page.id === activePageId
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
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
              className="w-20 h-5 text-xs bg-transparent border border-primary rounded px-1 outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <FileText className="w-3 h-3 shrink-0" />
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
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-muted transition-all"
              title="Elimina pagina"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onAddPage}
        className="flex items-center gap-1 px-2 h-full text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        title="Aggiungi pagina"
      >
        <Plus className="w-3 h-3" />
        <span className="hidden sm:inline">Nuova</span>
      </button>
    </div>
  );
}
