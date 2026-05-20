import React from "react";
import { CanvasComponent } from "@/lib/editor/types";
import { registerRenderer, renderComponent } from "./registry";
import { BS_BG, BS_TEXT, spacing, buildPaddingStyle, Wrapper } from "./shared";

// ── Container ──
function renderContainer(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const fluid = p.fluid;
  const maxWidth = fluid === "fixed" ? "1140px" : "100%";
  const hasChildren = component.children && component.children.length > 0;
  return (
    <Wrapper customClass={customClass} style={{
      width: "100%",
      maxWidth,
      margin: "0 auto",
      padding: buildPaddingStyle(p, "3"),
      background: BS_BG[String(p.bgColor)] || "transparent",
      color: BS_TEXT[String(p.textColor)] || "#212529",
      minHeight: "60px",
      boxSizing: "border-box",
      border: !hasChildren && !renderChildren ? "1px dashed #dee2e6" : "none",
      textAlign: String(p.textAlign) as React.CSSProperties["textAlign"],
    }}>
      {renderChildren ?? (hasChildren ? (
        component.children?.map((child) => (
          <React.Fragment key={child.id}>{renderComponent(child)}</React.Fragment>
        ))
      ) : (
        <span style={{ color: "#adb5bd", fontSize: "12px", textAlign: "center", display: "block" }}>
          {fluid === "fluid" ? "Container (Fluid)" : fluid === "fixed" ? "Container (Fixed)" : `Container (${fluid})`}
        </span>
      ))}
    </Wrapper>
  );
}

// ── Row ──
function renderRow(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const hasChildren = component.children && component.children.length > 0;
  return (
    <Wrapper customClass={customClass} style={{ display: "flex", gap: `${spacing(String(p.gutter || "3"))}`, minHeight: "50px", alignItems: p.verticalAlign === "center" ? "center" : p.verticalAlign === "end" ? "flex-end" : "flex-start" }}>
      {renderChildren ?? (hasChildren ? (
        component.children?.map((child) => (
          <React.Fragment key={child.id}>{renderComponent(child)}</React.Fragment>
        ))
      ) : (
        <span style={{ color: "#adb5bd", fontSize: "12px", margin: "auto" }}>Row — drop columns here</span>
      ))}
    </Wrapper>
  );
}

// ── Col ──
function renderCol(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const hasChildren = component.children && component.children.length > 0;
  const colSize = String(p.size || "auto");
  const grow = colSize === "auto" ? 1 : Math.max(0, Number(colSize));
  const responsiveClasses: string[] = [];
  if (p.colSm) responsiveClasses.push(`sm:${p.colSm}`);
  if (p.colMd) responsiveClasses.push(`md:${p.colMd}`);
  if (p.colLg) responsiveClasses.push(`lg:${p.colLg}`);
  if (p.colXl) responsiveClasses.push(`xl:${p.colXl}`);
  return (
    <Wrapper customClass={customClass} style={{
      background: BS_BG[String(p.bgColor)] || "#f8f9fa",
      color: BS_TEXT[String(p.textColor)] || "#212529",
      padding: buildPaddingStyle(p, "3"),
      borderRadius: "4px",
      minHeight: "50px",
      boxSizing: "border-box",
      flex: `${grow} 0 0%`,
      textAlign: String(p.textAlign) as React.CSSProperties["textAlign"],
      position: "relative",
    }}>
      {responsiveClasses.length > 0 && <div style={{ position: "absolute", top: 2, right: 4, fontSize: "9px", color: "#0d6efd", opacity: 0.6, pointerEvents: "none" }}>{responsiveClasses.join(", ")}</div>}
      {renderChildren ?? (hasChildren ? (
        component.children?.map((child) => (
          <React.Fragment key={child.id}>{renderComponent(child)}</React.Fragment>
        ))
      ) : (
        <span style={{ fontSize: "12px", color: "#6c757d" }}>
          Drop here
        </span>
      ))}
    </Wrapper>
  );
}

// ── Register all layout renderers ──
registerRenderer("container", renderContainer);
registerRenderer("row", renderRow);
registerRenderer("col", renderCol);
