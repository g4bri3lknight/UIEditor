import React from "react";
import { CanvasComponent } from "@/lib/editor/types";
import { registerRenderer } from "./registry";
import { BS, BS_TEXT, spacing, Wrapper } from "./shared";

// ── Divider (hr) ──
function renderDivider(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  return (
    <Wrapper customClass={customClass} style={{ padding: "8px 4px" }}>
      {p.text ? (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <hr style={{ flex: 1, borderColor: BS.borderColor, margin: 0 }} />
          <span style={{ fontSize: "0.875rem", color: BS_TEXT[String(p.textColor)] || BS.muted, whiteSpace: "nowrap" }}>
            {p.text}
          </span>
          <hr style={{ flex: 1, borderColor: BS.borderColor, margin: 0 }} />
        </div>
      ) : (
        <hr style={{ borderColor: BS.borderColor, margin: 0 }} />
      )}
    </Wrapper>
  );
}

// ── Spacer ──
function renderSpacer(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const height = spacing(String(p.size || "4"));
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "11px", color: BS.muted, opacity: 0.5 }}>Spacer ({p.size})</span>
      </div>
    </Wrapper>
  );
}

// ── Link ──
function renderLink(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const linkColor = BS_TEXT[String(p.variant)] || BS.primary;
  const linkSize: Record<string, string> = { "": "1rem", sm: "0.875rem", lg: "1.25rem" };
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      <a
        data-prop="text"
        href="#"
        style={{
          color: linkColor,
          textDecoration: p.underline ? "underline" : "none",
          fontSize: linkSize[String(p.size || "")],
          cursor: "pointer",
        }}
        target={p.target === "_blank" ? "_blank" : undefined}
        rel={p.target === "_blank" ? "noopener noreferrer" : undefined}
      >
        {p.text || "Link"}
        {p.target === "_blank" && (
          <sup style={{ fontSize: "0.65em", marginLeft: "2px", verticalAlign: "super" }}>↗</sup>
        )}
      </a>
    </Wrapper>
  );
}

// ── Collapse ──
function renderCollapse(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const variant = String(p.variant || "");
  const isShown = !!p.show;
  const btnBgMap: Record<string, string> = { "": BS.secondary, primary: BS.primary, secondary: BS.secondary };
  const btnBg = btnBgMap[variant] || BS.secondary;
  const isDarkBtn = variant === "primary" || variant === "secondary";
  const bodySlotContent = slotChildren?.body;
  const hasSlotChildren = bodySlotContent !== undefined && bodySlotContent !== null;

  return (
    <Wrapper customClass={customClass} style={{ padding: "0" }}>
      <div style={{
        border: p.bordered ? `1px solid ${BS.borderColor}` : "none",
        borderRadius: "8px",
        overflow: "hidden",
      }}>
        <button data-prop="title" style={{
          width: "100%", padding: "12px 16px", border: "none",
          background: btnBg, color: isDarkBtn ? BS.white : BS.white,
          fontSize: "1rem", fontWeight: 500, cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          textAlign: "left" as const,
        }}>
          {p.title || "Toggle collapse"}
          <span style={{
            fontSize: "0.875rem", transition: "transform 0.2s",
            transform: isShown ? "rotate(180deg)" : "rotate(0deg)",
          }}>▾</span>
        </button>
        <div data-prop="body" style={{
          padding: isShown ? "16px" : "0 16px",
          maxHeight: isShown ? "500px" : "0",
          overflow: "hidden",
          transition: "all 0.2s ease",
          fontSize: "0.9375rem", lineHeight: 1.6, color: BS.body,
          background: BS.white,
          minHeight: isShown ? "40px" : "0",
        }}>
          {hasSlotChildren ? bodySlotContent : (p.body || "This is the collapsible content.")}
        </div>
      </div>
    </Wrapper>
  );
}

// ── Tab Content ──
function renderTabContent(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const rawItems = String(p.items || "").split("\n").filter(Boolean);
  const items = rawItems.map((item) => {
    const parts = item.split("|");
    return { label: parts[0] || "Tab", content: parts[1] || "" };
  });
  const active = Number(p.active) || 0;
  const style = String(p.style || "tabs");

  const _hasSlotChildren = slotChildren && Object.keys(slotChildren).length > 0;
  const hasDirectChildren = component.children && component.children.length > 0;

  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      {/* Tab navigation */}
      <div data-prop="items" style={{
        display: "flex",
        borderBottom: style === "tabs" ? `2px solid ${BS.borderColor}` : "none",
        gap: "2px",
        ...(p.fill ? { flex: 1 } : {}),
      }}>
        {items.map((item, i) => (
          <button key={i} style={{
            padding: "8px 16px",
            background: "transparent",
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
            cursor: "pointer",
            fontSize: "0.95rem",
            backgroundColor: style === "pills" && i === active ? BS.primary : "transparent",
            ...(style === "pills" && i === active ? { color: BS.white } : {}),
          }}>
            {item.label}
          </button>
        ))}
      </div>
      {/* Tab panes */}
      <div style={{
        marginTop: "12px",
        padding: "16px",
        background: BS.light,
        borderRadius: style === "pills" ? "8px" : "0 0 8px 8px",
        minHeight: "60px",
      }}>
        {hasDirectChildren && items.map((_, tabIndex) => {
          const slotKey = `tab-${tabIndex}`;
          return <React.Fragment key={slotKey}>{slotChildren?.[slotKey] || null}</React.Fragment>;
        })}
        {(!hasDirectChildren) && active >= 0 && active < items.length && (
          <div style={{ fontSize: "0.9375rem", color: BS.body }}>
            {items[active].content}
          </div>
        )}
      </div>
    </Wrapper>
  );
}

// ── Tooltip ──
function renderTooltip(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const placement = String(p.placement || "top");
  const isDark = p.variant === "dark" || !p.variant;
  return (
    <Wrapper customClass={customClass} style={{ padding: "8px 4px" }}>
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "8px", position: "relative" }}>
        <div data-prop="tooltipText" style={{
          padding: "4px 10px",
          borderRadius: "4px",
          background: isDark ? BS.dark : BS.white,
          color: isDark ? BS.white : BS.body,
          fontSize: "0.75rem",
          border: `1px solid ${isDark ? BS.dark : BS.borderColor}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          whiteSpace: "nowrap",
          maxWidth: "200px",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          💬 {p.tooltipText || "Tooltip text"}
        </div>
        <button data-prop="text" style={{
          padding: "6px 16px",
          borderRadius: "6px",
          border: `1px solid ${BS.borderColor}`,
          background: BS.white,
          color: BS.body,
          fontSize: "0.875rem",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}>
          {p.text || "Hover me"}
          <span style={{
            fontSize: "0.65rem",
            padding: "1px 5px",
            borderRadius: "3px",
            background: isDark ? BS.dark : BS.light,
            color: isDark ? BS.white : BS.muted,
          }}>
            {placement}
          </span>
        </button>
      </div>
    </Wrapper>
  );
}

// ── Popover ──
function renderPopover(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const _placement = String(p.placement || "top");
  return (
    <Wrapper customClass={customClass} style={{ padding: "8px 4px" }}>
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <div style={{
          width: "240px",
          border: `1px solid ${BS.borderColor}`,
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          background: BS.white,
          overflow: "hidden",
        }}>
          {p.title && (
            <div data-prop="title" style={{
              padding: "10px 14px",
              borderBottom: `1px solid ${BS.borderColor}`,
              background: BS.light,
              fontWeight: 600,
              fontSize: "0.9375rem",
              color: BS.body,
            }}>
              {p.title}
            </div>
          )}
          <div data-prop="body" style={{
            padding: "10px 14px",
            fontSize: "0.875rem",
            color: BS.muted,
          }}>
            {p.body || "Popover body content"}
          </div>
        </div>
        <button data-prop="text" style={{
          padding: "8px 20px",
          borderRadius: "6px",
          border: "none",
          background: BS.danger,
          color: BS.white,
          fontSize: "1rem",
          cursor: "pointer",
        }}>
          {p.text || "Click to toggle popover"}
        </button>
      </div>
    </Wrapper>
  );
}

// ── Register all utility renderers ──
registerRenderer("divider", renderDivider);
registerRenderer("spacer", renderSpacer);
registerRenderer("link", renderLink);
registerRenderer("collapse", renderCollapse);
registerRenderer("tab-content", renderTabContent);
registerRenderer("tooltip", renderTooltip);
registerRenderer("popover", renderPopover);
