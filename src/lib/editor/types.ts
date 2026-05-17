// Bootstrap GUI Editor - Core Types

export type ComponentCategory =
  | "layout"
  | "typography"
  | "forms"
  | "buttons"
  | "navigation"
  | "content"
  | "tables"
  | "images"
  | "utilities";

export interface CategoryInfo {
  id: ComponentCategory;
  label: string;
  icon: string;
}

export interface CanvasComponent {
  id: string;
  type: string;
  label: string;
  props: Record<string, string | boolean | number>;
  slot?: "header" | "body" | "footer"; // Slot assignment for slotted components (card, modal, offcanvas)
  children?: CanvasComponent[];
}

export interface BootstrapComponentDefinition {
  type: string;
  label: string;
  category: ComponentCategory;
  icon: string;
  description: string;
  properties: PropertyDefinition[];
  defaultSize?: { w: number; h: number };
  hidden?: boolean;
}

export type PropType =
  | "text"
  | "textarea"
  | "select"
  | "boolean"
  | "number"
  | "color"
  | "icon-select";

export interface PropOption {
  label: string;
  value: string;
}

export interface PropertyDefinition {
  key: string;
  label: string;
  type: PropType;
  defaultValue: string | boolean | number;
  options?: PropOption[];
  placeholder?: string;
  description?: string;
  group?: string;
}

// ── Saved Snippet (reusable component template) ──
export interface SavedSnippet {
  id: string;
  name: string;
  category: string; // User-defined category for organizing snippets
  components: CanvasComponent[];  // Can be 1 or more components
  createdAt: number;
  updatedAt: number;
}
