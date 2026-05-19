export interface ComponentPreset {
  name: string;
  icon?: string; // Emoji or short label
  props: Record<string, string | boolean | number>;
}

export interface ComponentPresetGroup {
  componentType: string;
  presets: ComponentPreset[];
}

// Variant presets for common components
export const COMPONENT_PRESETS: Record<string, ComponentPreset[]> = {
  button: [
    { name: "Primary", props: { variant: "primary", outline: false } },
    { name: "Secondary", props: { variant: "secondary", outline: false } },
    { name: "Success", props: { variant: "success", outline: false } },
    { name: "Danger", props: { variant: "danger", outline: false } },
    { name: "Warning", props: { variant: "warning", outline: false } },
    { name: "Info", props: { variant: "info", outline: false } },
    { name: "Outline Primary", props: { variant: "primary", outline: true } },
    { name: "Outline Secondary", props: { variant: "secondary", outline: true } },
    { name: "Outline Success", props: { variant: "success", outline: true } },
    { name: "Outline Danger", props: { variant: "danger", outline: true } },
  ],
  alert: [
    { name: "Primary", props: { variant: "primary" } },
    { name: "Success", props: { variant: "success" } },
    { name: "Danger", props: { variant: "danger" } },
    { name: "Warning", props: { variant: "warning" } },
    { name: "Info", props: { variant: "info" } },
  ],
  badge: [
    { name: "Primary", props: { variant: "primary" } },
    { name: "Secondary", props: { variant: "secondary" } },
    { name: "Success", props: { variant: "success" } },
    { name: "Danger", props: { variant: "danger" } },
    { name: "Warning", props: { variant: "warning" } },
    { name: "Info", props: { variant: "info" } },
    { name: "Pill", props: { pill: true, variant: "primary" } },
  ],
  card: [
    { name: "Default", props: { variant: "", header: "Card Header" } },
    { name: "Primary", props: { variant: "primary", header: "Primary Card" } },
    { name: "Secondary", props: { variant: "secondary", header: "Secondary Card" } },
    { name: "Success", props: { variant: "success", header: "Success Card" } },
    { name: "Danger", props: { variant: "danger", header: "Danger Card" } },
  ],
  "button-group": [
    { name: "Primary", props: { variant: "primary", buttons: "Sinistra,Centro,Destra" } },
    { name: "Outline", props: { variant: "outline-primary", buttons: "Opzione A,Opzione B,Opzione C" } },
    { name: "Vertical", props: { variant: "secondary", vertical: true, buttons: "Uno,Due,Tre" } },
  ],
  heading: [
    { name: "H1", props: { level: "1" } },
    { name: "H2", props: { level: "2" } },
    { name: "H3", props: { level: "3" } },
    { name: "H4", props: { level: "4" } },
    { name: "Display 1", props: { level: "1", displayClass: "1" } },
    { name: "Display 2", props: { level: "1", displayClass: "2" } },
    { name: "Display 3", props: { level: "1", displayClass: "3" } },
  ],
  input: [
    { name: "Text", props: { type: "text", label: "Label" } },
    { name: "Email", props: { type: "email", label: "Email" } },
    { name: "Password", props: { type: "password", label: "Password" } },
    { name: "Number", props: { type: "number", label: "Numero" } },
    { name: "Floating", props: { type: "text", label: "Label", floating: true } },
    { name: "Small", props: { type: "text", label: "Small", size: "sm" } },
    { name: "Large", props: { type: "text", label: "Large", size: "lg" } },
  ],
  navbar: [
    { name: "Dark", props: { variant: "dark", bgColor: "dark", brand: "Brand" } },
    { name: "Light", props: { variant: "light", bgColor: "light", brand: "Brand" } },
    { name: "Primary", props: { variant: "dark", bgColor: "primary", brand: "Brand" } },
  ],
};
