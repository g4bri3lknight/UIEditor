"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditorStore } from "@/store/editor-store";
import { saveProject, hasCurrentFile } from "@/lib/editor/project-file";
import { toast } from "sonner";
import { Save, X } from "lucide-react";

const REMINDER_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Non-blocking banner that appears at the top of the editor every 5
 * minutes and asks the user whether they want to save the project.
 *
 * - "Sì": saves (overwrites the current file, or falls back to Save As
 *   if no file is open yet) and resets the timer.
 * - "No": dismisses the banner and resets the timer (will ask again in
 *   another 5 minutes).
 *
 * The banner does NOT block the application — the user can keep editing
 * while it is visible. It auto-resets the timer whenever a save or load
 * happens (detected via the project file name changing).
 */
export function SaveReminderBanner() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track the project file name so we can reset the timer when the user
  // saves or loads manually (the name changes on every save/load).
  const currentProjectFileName = useEditorStore(
    (s) => s.currentProjectFileName
  );
  const components = useEditorStore((s) => s.components);
  const setCurrentProjectFileName = useEditorStore(
    (s) => s.setCurrentProjectFileName
  );

  const scheduleReminder = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, REMINDER_INTERVAL_MS);
  }, []);

  // (Re)schedule the reminder on mount and whenever a save/load happens
  // (detected via the file name changing). We intentionally do NOT
  // reschedule on every keystroke / component change — the reminder is
  // time-based, not activity-based.
  useEffect(() => {
    scheduleReminder();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleReminder, currentProjectFileName]);

  const handleYes = useCallback(async () => {
    setVisible(false);
    try {
      const fileName = await saveProject();
      if (fileName === null) {
        // User cancelled the Save As dialog — reschedule.
        scheduleReminder();
        return;
      }
      setCurrentProjectFileName(fileName);
      toast.success(`Progetto salvato in "${fileName}"`);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Errore sconosciuto";
      toast.error(`Errore nel salvataggio: ${msg}`);
    }
    scheduleReminder();
  }, [scheduleReminder, setCurrentProjectFileName]);

  const handleNo = useCallback(() => {
    setVisible(false);
    scheduleReminder();
  }, [scheduleReminder]);

  // Don't show the banner if there's nothing to save.
  if (!visible || components.length === 0) return null;

  const canOverwrite = hasCurrentFile();

  return (
    <div
      role="dialog"
      aria-label="Promemoria salvataggio"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[min(92vw,440px)] ios-satin-card rounded-xl shadow-lg border border-border/60 px-4 py-3 flex items-center gap-3"
    >
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Save className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          Vuoi salvare le modifiche?
        </p>
        <p className="text-[11px] text-muted-foreground leading-snug">
          {canOverwrite
            ? "Sono passati 5 minuti dall'ultimo salvataggio."
            : "Salva il progetto per non perdere il lavoro."}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => void handleYes()}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Sì
        </button>
        <button
          onClick={handleNo}
          className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          No
        </button>
        <button
          onClick={handleNo}
          className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Chiudi"
          aria-label="Chiudi promemoria"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
