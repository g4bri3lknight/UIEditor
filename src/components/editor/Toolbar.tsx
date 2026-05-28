"use client";

import { Badge } from "@/components/ui/badge";
import { useEditorStore } from "@/store/editor-store";

export function Toolbar() {
  const _isDirty = useEditorStore((s) => s._isDirty);
  const _lastSavedAt = useEditorStore((s) => s._lastSavedAt);

  return (
    <header className="h-16 border-b ios-border-subtle ios-satin-toolbar flex items-center px-4 shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-primary/90 flex items-center justify-center shadow-sm shadow-primary/20">
          <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        </div>
        <span className="text-[15px] font-bold text-foreground tracking-tight">
          Bootstrap Editor
        </span>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal rounded-md ios-border-subtle">
          Bootstrap 5.3
        </Badge>
        {/* Auto-save indicator */}
        <div className="flex items-center gap-1 ml-2">
          {_isDirty ? (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Salvataggio...
            </span>
          ) : _lastSavedAt ? (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Salvato
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
