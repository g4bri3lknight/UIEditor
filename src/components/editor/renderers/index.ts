// ── Central export for the renderer registry system ──
// This module imports all renderer files (for their side-effect of registering)
// and re-exports the registry API and shared utilities.

// ── Re-export registry API ──
export { registerRenderer, getRenderer, renderComponent } from "./registry";
export type { RendererFn } from "./registry";

// ── Re-export shared utilities ──
export { BS, BS_TEXT, BS_BG, spacing, buildPaddingStyle, Wrapper, getButtonStyle, pageBtnStyle } from "./shared";
export type { RendererProps } from "./shared";

// ── Import all renderer modules to populate the registry (side effects) ──
import "./layout-renderers";
import "./typography-renderers";
import "./form-renderers";
import "./button-renderers";
import "./navigation-renderers";
import "./content-renderers";
import "./image-renderers";
import "./utility-renderers";
import "./table-renderers";
