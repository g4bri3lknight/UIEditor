import React from "react";
import { CanvasComponent } from "@/lib/editor/types";
import { registerRenderer } from "./registry";
import { BS, Wrapper, getButtonStyle } from "./shared";

// ── Button ──
function renderButton(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const variant = String(p.variant || "primary");
  const isOutline = !!p.outline;
  const btnStyle = getButtonStyle(variant, isOutline);
  const sz = String(p.size || "");
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px", display: "inline-block" }}>
      <button data-prop="text" disabled={!!p.disabled} style={{
        ...btnStyle,
        padding: sz === "sm" ? "4px 12px" : sz === "lg" ? "10px 24px" : "6px 16px",
        fontSize: sz === "sm" ? "0.875rem" : sz === "lg" ? "1.25rem" : "1rem",
        borderRadius: "6px", cursor: p.disabled ? "not-allowed" : "pointer",
        width: p.block ? "100%" : undefined,
        opacity: p.disabled ? 0.65 : 1,
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
        fontWeight: 400,
      }}>
        {p.iconLeft && <i className={`bi-${String(p.iconLeft).replace(/^bi-?/, '')}`} style={{ fontSize: "inherit" }} />}
        {p.text || "Button"}
      </button>
    </Wrapper>
  );
}

// ── Button Group ──
function renderButtonGroup(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const variant = String(p.variant || "primary");
  const isOutline = variant.startsWith("outline-");
  const baseVariant = isOutline ? variant.replace("outline-", "") : variant;
  const btnStyle = getButtonStyle(baseVariant, isOutline);
  const buttons = String(p.buttons || "").split(",").map(b => b.trim()).filter(Boolean);
  const vertical = !!p.vertical;
  const bgSize = String(p.size || "");
  const bgPad = bgSize === "sm" ? "4px 12px" : bgSize === "lg" ? "10px 24px" : "6px 16px";
  const bgFontSize = bgSize === "sm" ? "0.875rem" : bgSize === "lg" ? "1.25rem" : "1rem";

  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      <div data-prop="buttons" style={{ display: "flex", flexDirection: vertical ? "column" : "row" }}>
        {buttons.map((btn, i) => (
          <button key={i} style={{
            ...btnStyle,
            padding: bgPad, fontSize: bgFontSize, fontWeight: 400,
            borderRightStyle: !vertical && i < buttons.length - 1 ? "none" : undefined,
            borderBottomStyle: vertical && i < buttons.length - 1 ? "none" : undefined,
            cursor: "pointer",
            borderRadius: vertical
              ? i === 0 ? "6px 6px 0 0" : i === buttons.length - 1 ? "0 0 6px 6px" : 0
              : i === 0 ? "6px 0 0 6px" : i === buttons.length - 1 ? "0 6px 6px 0" : 0,
          }}>
            {btn}
          </button>
        ))}
      </div>
    </Wrapper>
  );
}

// ── Register all button renderers ──
registerRenderer("button", renderButton);
registerRenderer("button-group", renderButtonGroup);
