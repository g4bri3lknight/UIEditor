"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CircleHelp } from "lucide-react";

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EDIT_SHORTCUTS = [
  { keys: "Ctrl + Z", desc: "Annulla" },
  { keys: "Ctrl + Y", desc: "Ripristina" },
  { keys: "Ctrl + Shift + Z", desc: "Ripristina (alternativo)" },
  { keys: "Ctrl + C", desc: "Copia componente selezionato" },
  { keys: "Ctrl + V", desc: "Incolla componente" },
  { keys: "Ctrl + D", desc: "Duplica componente selezionato" },
  { keys: "Delete / Backspace", desc: "Elimina componente selezionato" },
];

const NAV_SHORTCUTS = [
  { keys: "Alt + ↑", desc: "Sposta componente su" },
  { keys: "Alt + ↓", desc: "Sposta componente giù" },
  { keys: "Escape", desc: "Seleziona genitore / Deseleziona" },
  { keys: "?", desc: "Apri scorciatoie da tastiera" },
];

const PROJECT_SHORTCUTS = [
  { keys: "Ctrl + S", desc: "Salva progetto" },
];

function ShortcutRow({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50">
      <span className="text-sm text-foreground">{desc}</span>
      <div className="flex items-center gap-1">
        {keys.split(" + ").map((k, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-xs text-muted-foreground">+</span>}
            <kbd className="inline-flex items-center justify-center h-6 min-w-[28px] px-1.5 rounded bg-muted border border-border text-[11px] font-mono font-medium text-muted-foreground">
              {k.trim()}
            </kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function ShortcutSection({
  title,
  shortcuts,
}: {
  title: string;
  shortcuts: { keys: string; desc: string }[];
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </p>
      <div className="space-y-1.5">
        {shortcuts.map((s) => (
          <ShortcutRow key={s.keys} keys={s.keys} desc={s.desc} />
        ))}
      </div>
    </div>
  );
}

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CircleHelp className="w-5 h-5" />
            Scorciatoie da tastiera
          </DialogTitle>
          <DialogDescription>
            Tutte le scorciatoie disponibili per velocizzare il tuo flusso di lavoro.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <ShortcutSection title="Modifica" shortcuts={EDIT_SHORTCUTS} />
          <ShortcutSection title="Navigazione" shortcuts={NAV_SHORTCUTS} />
          <ShortcutSection title="Progetto" shortcuts={PROJECT_SHORTCUTS} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
