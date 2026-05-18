"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditorStore } from "@/store/editor-store";
import type { BootstrapTheme } from "@/store/editor-store";
import { Palette, RotateCcw } from "lucide-react";

interface ThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLOR_FIELDS: { key: keyof BootstrapTheme; label: string; desc: string }[] = [
  { key: "primaryColor", label: "Primario", desc: "Pulsanti, link, active states" },
  { key: "secondaryColor", label: "Secondario", desc: "Elementi secondari" },
  { key: "successColor", label: "Successo", desc: "Messaggi di conferma" },
  { key: "dangerColor", label: "Pericolo", desc: "Errori, eliminazioni" },
  { key: "warningColor", label: "Avviso", desc: "Notifiche di attenzione" },
  { key: "infoColor", label: "Info", desc: "Messaggi informativi" },
  { key: "bodyBg", label: "Sfondo pagina", desc: "Colore di sfondo principale" },
  { key: "bodyColor", label: "Testo", desc: "Colore del testo principale" },
];

export function ThemeDialog({ open, onOpenChange }: ThemeDialogProps) {
  const bootstrapTheme = useEditorStore((s) => s.bootstrapTheme);
  const updateTheme = useEditorStore((s) => s.updateTheme);
  const resetTheme = useEditorStore((s) => s.resetTheme);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Personalizza Tema Bootstrap
          </DialogTitle>
          <DialogDescription>
            Modifica i colori e lo stile del tema Bootstrap. Le modifiche si applicano in anteprima ed esportazione.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Colors */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Colori</p>
            <div className="space-y-2.5">
              {COLOR_FIELDS.map((f) => (
                <div key={f.key} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={String(bootstrapTheme[f.key])}
                    onChange={(e) => updateTheme({ [f.key]: e.target.value })}
                    className="w-8 h-8 rounded border border-input cursor-pointer shrink-0"
                    tabIndex={-1}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">{f.label}</div>
                    <div className="text-[10px] text-muted-foreground">{f.desc}</div>
                  </div>
                  <Input
                    value={String(bootstrapTheme[f.key])}
                    onChange={(e) => updateTheme({ [f.key]: e.target.value })}
                    className="h-7 w-24 text-[11px] font-mono text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Typography & Style */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tipografia & Stile</p>
            <div className="space-y-2.5">
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-foreground">Font Family</div>
                <Input
                  value={bootstrapTheme.fontFamily}
                  onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                  className="h-8 text-xs font-mono"
                  placeholder="system-ui, sans-serif"
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-foreground">Border Radius</div>
                <Input
                  value={bootstrapTheme.borderRadius}
                  onChange={(e) => updateTheme({ borderRadius: e.target.value })}
                  className="h-8 text-xs font-mono w-32"
                  placeholder="0.375rem"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={resetTheme}
            className="gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ripristina predefiniti
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
