// Bootstrap GUI Editor - Type Definitions

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

export interface BootstrapComponentDefinition {
  type: string;
  label: string;
  category: ComponentCategory;
  icon: string;
  description: string;
  properties: PropertyDefinition[];
  defaultSize?: { w: number; h: number };
}

export interface CanvasComponent {
  id: string;
  type: string;
  label: string;
  props: Record<string, string | boolean | number>;
  children?: CanvasComponent[];
}

export interface CategoryInfo {
  id: ComponentCategory;
  label: string;
  icon: string;
}
