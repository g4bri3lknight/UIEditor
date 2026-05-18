"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code, Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  htmlCode: string;
}

export function CodeDialog({ open, onOpenChange, htmlCode }: CodeDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      toast.success("Codice copiato negli appunti!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = htmlCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      toast.success("Codice copiato negli appunti!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bootstrap-page.html";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File HTML scaricato!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl flex flex-col max-h-[85vh] overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            HTML Bootstrap generato
          </DialogTitle>
          <DialogDescription>
            Copia il codice HTML generato o scaricalo come file. Richiede
            Bootstrap 5.3.3 CSS e JS.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="gap-1.5"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copiato!" : "Copia codice"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Scarica HTML
          </Button>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <pre className="bg-muted rounded-lg p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words">
            {htmlCode || "<!-- Nessun componente sulla canvas -->"}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
