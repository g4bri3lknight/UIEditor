import { Monitor, Smartphone, Tablet } from "lucide-react";

// ── Editable text props per component type ──
// Maps component types to their editable text prop keys, labels, and whether they need a textarea (multiline)
// The FIRST entry is the default property edited on double-click for single-prop components
export const EDITABLE_TEXT_PROPS: Record<string, Array<{ key: string; label: string; multiline: boolean }>> = {
  "heading": [{ key: "text", label: "Testo", multiline: false }],
  "paragraph": [{ key: "text", label: "Testo", multiline: true }],
  "blockquote": [{ key: "text", label: "Citazione", multiline: true }, { key: "attribution", label: "Attribuzione", multiline: false }],
  "list": [{ key: "items", label: "Elementi", multiline: true }],
  "code-block": [{ key: "code", label: "Codice", multiline: true }],
  "button": [{ key: "text", label: "Testo", multiline: false }],
  "button-group": [{ key: "buttons", label: "Pulsanti", multiline: false }],
  "input": [{ key: "text", label: "Valore", multiline: false }, { key: "label", label: "Etichetta", multiline: false }, { key: "placeholder", label: "Placeholder", multiline: false }, { key: "helpText", label: "Testo aiuto", multiline: false }],
  "textarea": [{ key: "text", label: "Valore", multiline: false }, { key: "label", label: "Etichetta", multiline: false }, { key: "placeholder", label: "Placeholder", multiline: false }, { key: "helpText", label: "Testo aiuto", multiline: false }],
  "select-input": [{ key: "label", label: "Etichetta", multiline: false }],
  "checkbox": [{ key: "label", label: "Etichetta", multiline: false }],
  "radio": [{ key: "label", label: "Etichetta", multiline: false }],
  "switch": [{ key: "label", label: "Etichetta", multiline: false }],
  "range": [{ key: "label", label: "Etichetta", multiline: false }],
  "file-input": [{ key: "label", label: "Etichetta", multiline: false }],
  "input-group": [{ key: "label", label: "Placeholder", multiline: false }, { key: "prepend", label: "Prefisso", multiline: false }, { key: "append", label: "Suffisso", multiline: false }],
  "card": [{ key: "title", label: "Titolo", multiline: false }, { key: "text", label: "Testo", multiline: true }, { key: "header", label: "Header", multiline: false }, { key: "subtitle", label: "Sottotitolo", multiline: false }, { key: "footer", label: "Footer", multiline: false }],
  "alert": [{ key: "text", label: "Testo", multiline: false }, { key: "heading", label: "Titolo", multiline: false }],
  "badge": [{ key: "text", label: "Testo", multiline: false }],
  "accordion": [{ key: "items", label: "Elementi", multiline: true }],
  "list-group": [{ key: "items", label: "Elementi", multiline: true }],
  "toast": [{ key: "title", label: "Titolo", multiline: false }, { key: "text", label: "Testo", multiline: false }],
  "jumbotron": [{ key: "title", label: "Titolo", multiline: false }, { key: "lead", label: "Sottotitolo", multiline: false }],
  "carousel": [{ key: "slides", label: "Slide", multiline: true }],
  "modal": [{ key: "title", label: "Titolo", multiline: false }, { key: "closeButtonText", label: "Testo chiusura", multiline: false }, { key: "footer", label: "Footer", multiline: false }],
  "offcanvas": [{ key: "title", label: "Titolo", multiline: false }],
  "link": [{ key: "text", label: "Testo", multiline: false }],
  "collapse": [{ key: "title", label: "Titolo", multiline: false }, { key: "body", label: "Contenuto", multiline: true }],
  "tab-content": [{ key: "items", label: "Tab", multiline: true }],
  "tooltip": [{ key: "text", label: "Testo trigger", multiline: false }, { key: "tooltipText", label: "Testo tooltip", multiline: false }],
  "popover": [{ key: "text", label: "Testo trigger", multiline: false }, { key: "title", label: "Titolo", multiline: false }, { key: "body", label: "Contenuto", multiline: true }],
  "table-cell": [{ key: "text", label: "Testo", multiline: false }],
  "text": [{ key: "text", label: "Testo", multiline: false }],
};

export function getFirstEditableProp(type: string): { key: string; multiline: boolean } | null {
  const props = EDITABLE_TEXT_PROPS[type];
  return props && props.length > 0 ? props[0] : null;
}

export function hasEditableProps(type: string): boolean {
  return !!EDITABLE_TEXT_PROPS[type];
}

// ── Inline component types (should not stretch to full width) ──
export const INLINE_TYPES = new Set(["button", "badge", "spinner", "progress", "checkbox", "radio", "switch", "range", "text"]);

// ── Zoom constants ──
export const MIN_ZOOM = 25;
export const MAX_ZOOM = 200;
export const ZOOM_STEP = 10;
export const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];

// ── Viewport breakpoints ──
export const VIEWPORT_BREAKPOINTS = [
  { key: "xl", label: "XL", width: 1200, icon: Monitor },
  { key: "lg", label: "LG", width: 992, icon: Monitor },
  { key: "md", label: "MD", width: 768, icon: Tablet },
  { key: "sm", label: "SM", width: 576, icon: Smartphone },
  { key: "xs", label: "XS", width: 375, icon: Smartphone },
] as const;

export type ViewportKey = typeof VIEWPORT_BREAKPOINTS[number]["key"];
