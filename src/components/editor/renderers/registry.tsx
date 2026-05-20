import React from "react";
import { CanvasComponent } from "@/lib/editor/types";

// ── Renderer function type ──
export type RendererFn = (
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
) => React.ReactNode;

// ── Registry: Map of component type → render function ──
const RendererRegistry = new Map<string, RendererFn>();

// ── Register a renderer for a given component type ──
export function registerRenderer(type: string, fn: RendererFn): void {
  RendererRegistry.set(type, fn);
}

// ── Look up a renderer by type ──
export function getRenderer(type: string): RendererFn | undefined {
  return RendererRegistry.get(type);
}

// ── Render a component using the registry (for recursive calls) ──
export function renderComponent(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const fn = RendererRegistry.get(component.type);
  if (fn) {
    return fn(component, renderChildren, slotChildren, isDragging);
  }
  // Fallback for unknown types
  const p = component.props as Record<string, string | boolean | number>;
  const _customClass = String(p.customClass || "");
  return (
    <div style={{ padding: "8px", borderRadius: "4px", position: "relative" }}>
      <div style={{ color: "#6c757d", fontSize: "0.875rem" }}>Unknown: {component.type}</div>
    </div>
  );
}
