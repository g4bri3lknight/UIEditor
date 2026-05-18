"use client";

import React from "react";
import { CanvasComponent } from "@/lib/editor/types";
import { getRenderer, renderComponent } from "./renderers";
import { RendererProps, Wrapper } from "./renderers/shared";

export function BootstrapRenderer({ component, renderChildren, slotChildren, isDragging }: RendererProps) {
  const { type } = component;
  const renderer = getRenderer(type);

  if (renderer) {
    return renderer(component, renderChildren, slotChildren, isDragging);
  }

  // Fallback for unknown component types
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  return (
    <Wrapper customClass={customClass} style={{ padding: "8px" }}>
      <div style={{ color: "#6c757d", fontSize: "0.875rem" }}>Unknown: {type}</div>
    </Wrapper>
  );
}

// Re-export renderComponent for recursive rendering
export { renderComponent };
