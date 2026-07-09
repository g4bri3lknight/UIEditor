"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEditorStore } from "@/store/editor-store";
import { generateFullHTML } from "@/lib/editor/code-generator";
import {
  Eye,
  Camera,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import { domToPng } from "modern-screenshot";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VIEWPORT_PRESETS = {
  mobile: { w: 375, h: 667 },
  tablet: { w: 768, h: 1024 },
  desktop: { w: 1280, h: 800 },
} as const;

/**
 * Convert a data-URL (e.g. "data:image/png;base64,....") into a Blob.
 *
 * This is used instead of `fetch(dataUrl)` because a data-URL fetch is
 * governed by the page's CSP `connect-src` directive. With
 * `connect-src 'self'` the browser blocks the fetch and throws
 * "TypeError: Failed to fetch". A manual atob() + ArrayBuffer conversion
 * is not subject to `connect-src`, so it works in every environment
 * (sandbox, production, custom CSP, etc.).
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const commaIdx = dataUrl.indexOf(",");
  if (commaIdx === -1) {
    throw new Error("Data URL non valido");
  }
  const header = dataUrl.slice(0, commaIdx);
  const base64Data = dataUrl.slice(commaIdx + 1);

  const mimeMatch = header.match(/^data:([^;,]+)/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";

  const isBase64 = header.includes(";base64");

  if (isBase64) {
    const byteString = atob(base64Data);
    const len = byteString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = byteString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }

  // Fallback: URL-encoded payload
  return new Blob([decodeURIComponent(base64Data)], { type: mime });
}

type ViewportPreset = keyof typeof VIEWPORT_PRESETS;

export function PreviewDialog({ open, onOpenChange }: PreviewDialogProps) {
  const components = useEditorStore((s) => s.components);
  const hiddenComponents = useEditorStore((s) => s.hiddenComponents);
  const customCSS = useEditorStore((s) => s.customCSS);
  const bootstrapTheme = useEditorStore((s) => s.bootstrapTheme);

  const htmlCode = useMemo(
    () => generateFullHTML(components, hiddenComponents, customCSS, bootstrapTheme),
    [components, hiddenComponents, customCSS, bootstrapTheme]
  );

  const detectDevicePreset = useCallback((): ViewportPreset => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    if (w <= 480) return "mobile";
    if (w <= 1024) return "tablet";
    return "desktop";
  }, []);

  const getDefaultPreviewSize = useCallback(() => {
    if (typeof window === "undefined") return VIEWPORT_PRESETS.desktop;
    const preset = detectDevicePreset();
    const { w, h } = VIEWPORT_PRESETS[preset];
    const maxW = window.innerWidth - 48;
    const maxH = window.innerHeight - 100;
    return { w: Math.min(w, maxW), h: Math.min(h, maxH) };
  }, [detectDevicePreset]);

  const previewSizeRef = useRef(getDefaultPreviewSize());
  const [previewSize, setPreviewSize] = useState(getDefaultPreviewSize);
  const [activePreset, setActivePreset] = useState<ViewportPreset | "custom">(detectDevicePreset);
  const [isResizingDialog, setIsResizingDialog] = useState(false);
  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const [previewZoom, setPreviewZoom] = useState(100);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  const [isCapturing, setIsCapturing] = useState(false);

  // Resize handlers for the dialog
  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingDialog(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: previewSizeRef.current.w,
      h: previewSizeRef.current.h,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handleResizeMove = useCallback((e: React.PointerEvent) => {
    if (!isResizingDialog) return;
    const dx = e.clientX - resizeStartRef.current.x;
    const dy = e.clientY - resizeStartRef.current.y;
    const newW = Math.max(400, Math.min(resizeStartRef.current.w + dx, window.innerWidth - 48));
    const newH = Math.max(300, Math.min(resizeStartRef.current.h + dy, window.innerHeight - 48));
    previewSizeRef.current = { w: newW, h: newH };
    setPreviewSize({ w: newW, h: newH });
    setActivePreset("custom");
  }, [isResizingDialog]);

  const handleResizeEnd = useCallback(() => {
    setIsResizingDialog(false);
  }, []);

  const applyPresetSize = useCallback((w: number, h: number, preset?: ViewportPreset) => {
    const maxW = window.innerWidth - 48;
    const maxH = window.innerHeight - 100;
    const clampedW = Math.min(w, maxW);
    const clampedH = Math.min(h, maxH);
    previewSizeRef.current = { w: clampedW, h: clampedH };
    setPreviewSize({ w: clampedW, h: clampedH });
    if (preset) setActivePreset(preset);
  }, []);

  const handlePreviewZoomIn = useCallback(() => {
    setPreviewZoom((z) => Math.min(200, z + 10));
  }, []);

  const handlePreviewZoomOut = useCallback(() => {
    setPreviewZoom((z) => Math.max(25, z - 10));
  }, []);

  const handlePreviewZoomReset = useCallback(() => {
    setPreviewZoom(100);
  }, []);

  // Screenshot handler
  const handleScreenshot = useCallback(async () => {
    if (!htmlCode) {
      toast.error("Nessun contenuto da catturare");
      return;
    }
    setIsCapturing(true);

    let tempIframe: HTMLIFrameElement | null = null;

    try {
      toast.info("Generazione screenshot in corso...");

      const captureWidth = previewSizeRef.current.w;
      // Base viewport height used so that `vh` units (e.g. 100vh hero
      // sections) render at a sensible size. This matches the preview
      // dialog height rather than the tiny initial iframe height.
      const baseViewportHeight = previewSizeRef.current.h;

      tempIframe = document.createElement("iframe");
      tempIframe.style.position = "fixed";
      tempIframe.style.left = "-99999px";
      tempIframe.style.top = "0";
      tempIframe.style.width = `${captureWidth}px`;
      tempIframe.style.height = `${baseViewportHeight}px`;
      tempIframe.style.border = "none";
      tempIframe.style.background = "white";
      tempIframe.style.overflow = "hidden";
      document.body.appendChild(tempIframe);

      await new Promise<void>((resolve, reject) => {
        tempIframe?.addEventListener("load", () => resolve());
        tempIframe?.addEventListener("error", () => reject(new Error("Errore nel caricamento del contenuto")));
        if (tempIframe) tempIframe.srcdoc = htmlCode;
      });

      // Wait for Bootstrap JS, fonts and images to settle.
      await new Promise((r) => setTimeout(r, 1500));

      const tempDoc = tempIframe?.contentDocument;
      const tempBody = tempDoc?.body;
      const tempHtml = tempDoc?.documentElement;
      if (!tempBody || !tempHtml || !tempDoc) {
        throw new Error("Impossibile accedere al contenuto dell'iframe temporaneo");
      }

      // ── KEY FIX: override the height constraints injected by the
      // generated HTML. `generateFullHTML` emits:
      //   <html style="height:100%">
      //   <style>html,body{height:100%;margin:0}</style>
      //   <body style="display:flex;flex-direction:column;min-height:100%">
      // These force `html`/`body` to the iframe viewport height, so
      // `scrollHeight` reports only the visible viewport and the
      // screenshot is clipped to the preview-dialog size. By resetting
      // height/min-height/max-height to auto and overflow to hidden,
      // the elements flow to their natural full content height and the
      // capture covers the ENTIRE page, not just the visible part.
      const overrideStyle = tempDoc.createElement("style");
      overrideStyle.id = "__screenshot_override";
      overrideStyle.textContent = [
        "html, body {",
        "  height: auto !important;",
        "  min-height: 0 !important;",
        "  max-height: none !important;",
        "  overflow: hidden !important;",
        "  display: block !important;",
        "  flex-direction: initial !important;",
        "}",
      ].join("\n");
      tempDoc.head.appendChild(overrideStyle);

      // Let the override CSS reflow the document.
      await new Promise((r) => setTimeout(r, 150));

      // Measure the TRUE full content dimensions now that the height
      // constraints are removed.
      const fullWidth = Math.max(
        tempBody.scrollWidth,
        tempHtml.scrollWidth,
        captureWidth
      );
      const finalWidth = Math.max(fullWidth, 200);

      // Set the iframe to the full width so layout is correct.
      tempIframe.style.width = `${finalWidth}px`;
      await new Promise((r) => setTimeout(r, 100));

      // Measure the natural content height. We compute the max bottom
      // edge across the body and ALL of its descendants — this is
      // independent of the iframe viewport size and of any height /
      // overflow constraints, so it reliably reflects the full page
      // height even when `100vh` sections or nested overflow are
      // involved. We also take the body/html scrollHeight as a lower
      // bound.
      let maxBottom = tempBody.getBoundingClientRect().height;
      {
        const all = tempBody.getElementsByTagName("*");
        for (let i = 0; i < all.length; i++) {
          const r = (all[i] as HTMLElement).getBoundingClientRect();
          if (r.bottom > maxBottom) maxBottom = r.bottom;
        }
      }
      let contentHeight = Math.max(
        maxBottom,
        tempBody.scrollHeight,
        tempHtml.scrollHeight
      );

      // Now set the iframe to the exact full content height so every
      // part of the page is actually rendered for the capture.
      contentHeight = Math.max(contentHeight, 50);
      tempIframe.style.height = `${contentHeight + 32}px`;
      await new Promise((r) => setTimeout(r, 250));

      const captureHeight = Math.max(contentHeight, 50);

      // Capture the entire <html> document (documentElement) — this
      // includes the body plus any html-level background/styling, i.e.
      // the whole page. Passing the measured full height guarantees the
      // rendered PNG is not clipped to the viewport.
      const dataUrl = await domToPng(tempHtml, {
        scale: 2,
        width: finalWidth,
        height: captureHeight + 32,
        backgroundColor: "#ffffff",
        fetchOptions: {
          requestInit: {
            mode: "cors",
          },
        },
      });

      // Convert the data-URL (base64) directly to a Blob in JS.
      // Using fetch(dataUrl) here would be blocked by the page's
      // Content-Security-Policy (connect-src 'self' does not allow
      // data: URLs), producing "TypeError: Failed to fetch".
      // A direct base64 → Blob conversion is CSP-independent and
      // works in every environment (sandbox, production, etc.).
      const blob = dataUrlToBlob(dataUrl);

      const fileName = `bootstrap-preview-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-")}.png`;
      if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
        try {
          const handle = await (window as unknown as { showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
            suggestedName: fileName,
            types: [{
              description: "Immagine PNG",
              accept: { "image/png": [".png"] },
            }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          toast.success("Screenshot salvato!");
        } catch (err) {
          if ((err as DOMException).name === "AbortError") return;
          throw err;
        }
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Screenshot scaricato!");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Screenshot error:", err);
      toast.error("Errore durante la generazione dello screenshot");
    } finally {
      if (tempIframe && tempIframe.parentNode) {
        tempIframe.parentNode.removeChild(tempIframe);
      }
      setIsCapturing(false);
    }
  }, [htmlCode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 overflow-hidden flex flex-col"
        style={{
          width: `${previewSize.w}px`,
          maxWidth: `${previewSize.w}px`,
          height: `${previewSize.h}px`,
          maxHeight: `${previewSize.h}px`,
        }}
        showCloseButton={false}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50 shrink-0">
          <DialogTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Anteprima (Bootstrap 5.3.3)
            <span className="text-[11px] text-muted-foreground font-normal ml-1">
              {previewSize.w} × {previewSize.h}
            </span>
          </DialogTitle>
          <div className="flex items-center gap-1">
            {/* Screenshot */}
            <button
              onClick={handleScreenshot}
              disabled={isCapturing}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
              title="Salva screenshot come immagine (PNG) — Scegli dove salvare"
            >
              <Camera className={`w-3.5 h-3.5 ${isCapturing ? "animate-pulse" : ""}`} />
              <span className="text-xs">Screenshot</span>
            </button>
            <button
              onClick={handleScreenshot}
              disabled={isCapturing}
              className="sm:hidden p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
              title="Salva screenshot come immagine (PNG)"
            >
              <Camera className={`w-3.5 h-3.5 ${isCapturing ? "animate-pulse" : ""}`} />
            </button>
            <div className="w-px h-4 bg-border mx-0.5" />
            {/* Zoom controls */}
            <button
              onClick={handlePreviewZoomOut}
              disabled={previewZoom <= 25}
              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30"
              title="Riduci zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <select
              value={previewZoom}
              onChange={(e) => setPreviewZoom(Number(e.target.value))}
              className="h-6 w-[56px] text-[11px] text-center bg-muted border-0 rounded px-0.5 text-muted-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none"
            >
              {[25, 50, 75, 100, 125, 150, 200].map((level) => (
                <option key={level} value={level}>{level}%</option>
              ))}
            </select>
            <button
              onClick={handlePreviewZoomIn}
              disabled={previewZoom >= 200}
              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30"
              title="Aumenta zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {previewZoom !== 100 && (
              <button
                onClick={handlePreviewZoomReset}
                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Resetta zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
            <div className="w-px h-4 bg-border mx-0.5" />
            {/* Viewport presets */}
            <button
              onClick={() => applyPresetSize(375, 667, "mobile")}
              className={`p-1.5 rounded transition-colors ${
                activePreset === "mobile"
                  ? "bg-primary/15 text-primary"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
              title="Cellulare (375×667)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyPresetSize(768, 1024, "tablet")}
              className={`p-1.5 rounded transition-colors ${
                activePreset === "tablet"
                  ? "bg-primary/15 text-primary"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
              title="Tablet (768×1024)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyPresetSize(1280, 800, "desktop")}
              className={`p-1.5 rounded transition-colors ${
                activePreset === "desktop"
                  ? "bg-primary/15 text-primary"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
              title="Desktop (1280×800)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-border mx-0.5" />
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Chiudi"
            >
              <span className="text-base leading-none">✕</span>
            </button>
          </div>
        </div>
        {/* Iframe container */}
        <div className="flex-1 min-h-0 min-w-0 relative overflow-hidden">
          <div className="absolute inset-0 overflow-auto">
            <div
              style={{
                transform: `scale(${previewZoom / 100})`,
                transformOrigin: "top left",
                transition: "transform 150ms ease-out",
                width: previewZoom !== 100 ? `${previewSize.w}px` : `${previewSize.w}px`,
                minHeight: previewZoom !== 100 ? `${(previewSize.h - 40) * 100 / previewZoom}px` : "100%",
              }}
            >
              <iframe
                ref={previewIframeRef}
                srcDoc={htmlCode}
                style={{
                  width: "100%",
                  minHeight: `${previewSize.h - 40}px`,
                  border: "none",
                  background: "white",
                  display: "block",
                }}
                title="Bootstrap Preview"
              />
            </div>
          </div>
        </div>
        {/* Resize handle */}
        <div
          className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-end justify-end pb-0.5 pr-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10"
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <circle cx="8" cy="8" r="1.2" />
            <circle cx="4.5" cy="8" r="1.2" />
            <circle cx="8" cy="4.5" r="1.2" />
          </svg>
        </div>
      </DialogContent>
    </Dialog>
  );
}
