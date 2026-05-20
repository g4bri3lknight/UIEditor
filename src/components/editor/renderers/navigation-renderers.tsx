import React from "react";
import { CanvasComponent } from "@/lib/editor/types";
import { registerRenderer } from "./registry";
import { BS, BS_BG, Wrapper, getButtonStyle, pageBtnStyle } from "./shared";

// ── Navbar ──
function renderNavbar(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  return (
    <Wrapper customClass={customClass} style={{ padding: "0" }}>
      <nav style={{
        display: "flex", alignItems: "center", padding: "12px 20px",
        background: BS_BG[String(p.bgColor)] || BS.light,
        borderBottom: `1px solid ${BS.borderColor}`,
        flexWrap: "wrap", gap: "12px",
      }}>
        <a data-prop="brand" style={{ fontWeight: 700, fontSize: "1.25rem", color: p.bgColor === "dark" || p.bgColor === "primary" ? BS.white : BS.body, textDecoration: "none" }}>
          {p.brand || "Navbar"}
        </a>
        <div style={{ display: "flex", gap: "4px", marginLeft: "auto", flexWrap: "wrap" }}>
          {String(p.items || "").split(",").map((item, i) => (
            <a key={i} style={{
              padding: "8px 16px", color: p.bgColor === "dark" || p.bgColor === "primary" ? "rgba(255,255,255,0.85)" : BS.body,
              textDecoration: "none", borderRadius: "4px", fontSize: "0.95rem",
              background: i === 0 && (p.bgColor !== "dark" && p.bgColor !== "primary") ? "rgba(13,110,253,0.08)" : "transparent",
            }}>
              {item.trim()}
            </a>
          ))}
        </div>
      </nav>
    </Wrapper>
  );
}

// ── Nav Tabs ──
function renderNavTabs(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const items = String(p.items || "").split(",").map(i => i.trim()).filter(Boolean);
  const style = String(p.style || "tabs");
  const active = Number(p.active) || 0;

  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      <div style={{ display: "flex", borderBottom: style === "tabs" ? `2px solid ${BS.borderColor}` : "none", gap: "2px", flexDirection: p.vertical ? "column" : "row", flex: !!p.fill ? "1" : undefined }}>
        {items.map((item, i) => (
          <button key={i} style={{
            padding: "8px 16px", background: "transparent",
            ...(style === "tabs" ? {
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "transparent",
              borderRightColor: i === active ? BS.borderColor : "transparent",
              borderLeftColor: i === active ? BS.borderColor : "transparent",
            } : style === "underline" ? {
              borderWidth: "0",
              borderBottomWidth: "2px",
              borderBottomStyle: "solid",
              borderBottomColor: i === active ? BS.primary : "transparent",
            } : {
              borderWidth: "0",
              borderStyle: "none",
            }),
            borderRadius: style === "pills" ? "20px" : style === "tabs" ? "6px 6px 0 0" : "6px",
            color: i === active ? BS.primary : BS.muted,
            fontWeight: i === active ? 600 : 400,
            cursor: "pointer", fontSize: "0.95rem",
            backgroundColor: style === "pills" && i === active ? BS.primary : "transparent",
            ...(style === "pills" && i === active ? { color: BS.white } : {}),
          }}>
            {item}
          </button>
        ))}
      </div>
    </Wrapper>
  );
}

// ── Breadcrumb ──
function renderBreadcrumb(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const items = String(p.items || "").split(",").map(i => i.trim()).filter(Boolean);
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      <nav style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.875rem" }}>
        {items.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: BS.muted }}>/</span>}
            {i === items.length - 1 ? (
              <span style={{ color: BS.muted, fontWeight: 500 }}>{item}</span>
            ) : (
              <a style={{ color: BS.primary, textDecoration: "none" }}>{item}</a>
            )}
          </React.Fragment>
        ))}
      </nav>
    </Wrapper>
  );
}

// ── Pagination ──
function renderPagination(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const pages = Number(p.pages) || 5;
  const active = Number(p.active) || 1;
  const pgSize = String(p.size || "");
  const pgScale = pgSize === "sm" ? 0.85 : pgSize === "lg" ? 1.15 : 1;
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      <div style={{ display: "flex", gap: "4px" }}>
        <button style={pageBtnStyle(false, pgScale)}>&laquo;</button>
        {Array.from({ length: pages }).map((_, i) => (
          <button key={i} style={{
            ...pageBtnStyle(i + 1 === active, pgScale),
            background: i + 1 === active ? BS.primary : BS.white,
          }}>
            {i + 1}
          </button>
        ))}
        <button style={pageBtnStyle(false, pgScale)}>&raquo;</button>
      </div>
    </Wrapper>
  );
}

// ── Dropdown ──
function renderDropdown(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const items = String(p.items || "").split("\n").filter(Boolean);
  const variant = String(p.variant || "primary");
  const btnStyle = getButtonStyle(variant, false);
  const ddSize = String(p.size || "");
  const ddPad = ddSize === "sm" ? "4px 12px" : ddSize === "lg" ? "10px 24px" : "6px 16px";
  const ddFontSize = ddSize === "sm" ? "0.875rem" : ddSize === "lg" ? "1.25rem" : "1rem";
  const dir = String(p.direction || "down");
  const isUp = dir === "up";
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      <div style={{ display: "inline-flex", flexDirection: isUp ? "column-reverse" : "column" }}>
        <button style={{ ...btnStyle, padding: ddPad, borderRadius: isUp ? "0 0 6px 6px" : "6px 6px 0 0", cursor: "pointer", fontSize: ddFontSize, fontWeight: 400, display: "flex", alignItems: "center", gap: "6px" }}>
          {p.label || "Dropdown"} <span style={{ marginLeft: "4px", transform: isUp ? "rotate(180deg)" : "none" }}>▾</span>
        </button>
        <div style={{ borderWidth: "1px", borderStyle: "solid", borderColor: BS.borderColor, borderTopStyle: isUp ? "none" : undefined, borderBottomStyle: isUp ? undefined : "none", borderRadius: isUp ? "6px 6px 0 0" : "0 0 6px 6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "inline-block", minWidth: "180px" }}>
          {items.map((item, i) => item.trim() === "---" ? (
            <div key={i} style={{ borderTop: `1px solid ${BS.borderColor}`, margin: "4px 0" }} />
          ) : (
            <div key={i} style={{ padding: "8px 16px", cursor: "pointer", fontSize: "0.9rem", color: BS.body }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </Wrapper>
  );
}

// ── Register all navigation renderers ──
registerRenderer("navbar", renderNavbar);
registerRenderer("nav-tabs", renderNavTabs);
registerRenderer("breadcrumb", renderBreadcrumb);
registerRenderer("pagination", renderPagination);
registerRenderer("dropdown", renderDropdown);
