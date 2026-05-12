"use client";

import React from "react";
import { CanvasComponent } from "@/lib/editor/types";

// Bootstrap 5 color palette
const BS = {
  primary: "#0d6efd",
  secondary: "#6c757d",
  success: "#198754",
  danger: "#dc3545",
  warning: "#ffc107",
  info: "#0dcaf0",
  light: "#f8f9fa",
  dark: "#212529",
  white: "#ffffff",
  muted: "#6c757d",
  body: "#212529",
  bodyBg: "#ffffff",
  borderColor: "#dee2e6",
};

const BS_TEXT: Record<string, string> = {
  "": BS.body,
  primary: BS.primary,
  secondary: BS.secondary,
  success: BS.success,
  danger: BS.danger,
  warning: BS.warning,
  info: BS.info,
  muted: BS.muted,
  white: BS.white,
  dark: BS.dark,
};

const BS_BG: Record<string, string> = {
  transparent: "transparent",
  primary: BS.primary,
  secondary: BS.secondary,
  success: BS.success,
  danger: BS.danger,
  warning: BS.warning,
  info: BS.info,
  light: BS.light,
  dark: BS.dark,
  white: BS.white,
};

const spacing = (v: string | number): string => {
  const map: Record<string, string> = {
    "0": "0", "1": "0.25rem", "2": "0.5rem", "3": "1rem", "4": "1.5rem", "5": "3rem", auto: "auto",
  };
  return map[String(v)] || `${v}rem`;
};

interface RendererProps {
  component: CanvasComponent;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  renderChildren?: React.ReactNode;
}

const Wrapper: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}> = ({ children, style, className }) => (
  <div
    className={`transition-all duration-150 ${className || ""}`}
    style={{
      ...style,
      borderRadius: "4px",
      position: "relative",
    }}
  >
    {children}
  </div>
);

export function BootstrapRenderer({ component, renderChildren }: RendererProps) {
  const { type, props } = component;
  const p = props as Record<string, string | boolean | number>;

  switch (type) {
    // ── LAYOUT ──
    case "container": {
      const fluid = p.fluid;
      const maxWidth = fluid === "fixed" ? "1140px" : "100%";
      const hasChildren = component.children && component.children.length > 0;
      return (
        <Wrapper style={{
          width: "100%",
          maxWidth,
          margin: "0 auto",
          padding: spacing(String(p.padding || "3")),
          background: BS_BG[String(p.bgColor)] || "transparent",
          color: BS_TEXT[String(p.textColor)] || BS.body,
          minHeight: "60px",
          boxSizing: "border-box",
          border: !hasChildren && !renderChildren ? "1px dashed #dee2e6" : "none",
        }}>
          {renderChildren ?? (hasChildren ? (
            component.children!.map((child) => (
              <BootstrapRenderer key={child.id} component={child} />
            ))
          ) : (
            <span style={{ color: "#adb5bd", fontSize: "12px", textAlign: "center", display: "block" }}>
              {fluid === "fluid" ? "Container (Fluid)" : fluid === "fixed" ? "Container (Fixed)" : `Container (${fluid})`}
            </span>
          ))}
        </Wrapper>
      );
    }

    case "row": {
      const hasChildren = component.children && component.children.length > 0;
      return (
        <Wrapper style={{ display: "flex", gap: `${spacing(String(p.gutter || "3"))}`, minHeight: "50px", alignItems: p.verticalAlign === "center" ? "center" : p.verticalAlign === "end" ? "flex-end" : "flex-start" }}>
          {renderChildren ?? (hasChildren ? (
            component.children!.map((child) => (
              <BootstrapRenderer key={child.id} component={child} />
            ))
          ) : (
            <span style={{ color: "#adb5bd", fontSize: "12px", margin: "auto" }}>Row — drop columns here</span>
          ))}
        </Wrapper>
      );
    }

    case "col": {
      const size = Number(p.size) || 12;
      const isAuto = String(p.size) === "auto";
      const hasChildren = component.children && component.children.length > 0;
      return (
        <Wrapper style={{
          // Width is 100% — actual sizing is handled by the CanvasItem wrapper's flex-basis
          width: "100%",
          background: BS_BG[String(p.bgColor)] || BS.light,
          color: BS_TEXT[String(p.textColor)] || BS.body,
          padding: spacing(String(p.padding || "3")),
          borderRadius: "4px",
          minHeight: "50px",
          boxSizing: "border-box",
          flex: isAuto ? "1 1 0%" : undefined,
        }}>
          {renderChildren ?? (hasChildren ? (
            component.children!.map((child) => (
              <BootstrapRenderer key={child.id} component={child} />
            ))
          ) : (
            <span style={{ fontSize: "12px", color: BS.muted }}>
              {isAuto ? "Col-auto" : `Col-${size}`}
            </span>
          ))}
        </Wrapper>
      );
    }

    // ── TYPOGRAPHY ──
    case "heading": {
      const level = Number(p.level) || 2;
      const sizes: Record<number, string> = { 1: "2.5rem", 2: "2rem", 3: "1.75rem", 4: "1.5rem", 5: "1.25rem", 6: "1rem" };
      const displaySizes: Record<string, string> = { "1": "5rem", "2": "4.5rem", "3": "4rem", "4": "3.5rem", "5": "3rem", "6": "2.5rem" };
      const isDisplay = !!p.displayClass;
      return (
        <Wrapper style={{ padding: "8px 4px" }}>
          <div style={{
            fontSize: isDisplay ? (displaySizes[String(p.displayClass)] || "2rem") : (sizes[level] || "2rem"),
            fontWeight: isDisplay ? 300 : 700,
            lineHeight: 1.2,
            color: BS_TEXT[String(p.textColor)] || BS.body,
            textAlign: String(p.textAlign) as any,
            fontStyle: String(p.textClass)?.includes("italic") ? "italic" : undefined,
            textDecoration: String(p.textClass)?.includes("underline") ? "underline" : undefined,
            textTransform: String(p.textClass)?.includes("uppercase") ? "uppercase" : String(p.textClass)?.includes("lowercase") ? "lowercase" : String(p.textClass)?.includes("capitalize") ? "capitalize" : undefined,
          }}>
            {p.text || "Heading"}
          </div>
        </Wrapper>
      );
    }

    case "paragraph": {
      return (
        <Wrapper style={{ padding: "4px" }}>
          <p style={{
            fontSize: p.textSize === "fs-6" ? "1rem" : p.textSize === "fs-4" ? "1.5rem" : p.textSize === "fs-2" ? "2rem" : "1rem",
            fontWeight: p.lead ? 300 : 400,
            lineHeight: p.lead ? 1.7 : 1.6,
            color: BS_TEXT[String(p.textColor)] || BS.body,
            textAlign: String(p.textAlign) as any,
            margin: 0,
          }}>
            {p.text || "Paragraph text"}
          </p>
        </Wrapper>
      );
    }

    case "blockquote": {
      return (
        <Wrapper style={{ padding: "4px" }}>
          <blockquote style={{
            borderLeft: `4px solid ${p.borderColor ? BS[String(p.borderColor)] || BS.secondary : BS.gray}`,
            paddingLeft: "16px",
            margin: 0,
            color: BS.muted,
            textAlign: String(p.alignment) as any,
          }}>
            <p style={{ fontSize: "1.25rem", fontStyle: "italic", margin: 0 }}>{p.text || "Quote text"}</p>
            {p.attribution && (
              <footer style={{ marginTop: "8px", fontSize: "0.875rem", color: BS.muted }}>
                — {p.attribution}
              </footer>
            )}
          </blockquote>
        </Wrapper>
      );
    }

    case "list": {
      const items = String(p.items || "").split("\n").filter(Boolean);
      const Tag = p.listType === "ordered" ? "ol" : "ul";
      return (
        <Wrapper style={{ padding: "4px 4px 4px 20px" }}>
          <Tag style={{
            color: BS_TEXT[String(p.textColor)] || BS.body,
            margin: 0,
            listStyle: p.listType === "unstyled" ? "none" : undefined,
            paddingLeft: p.listType === "unstyled" ? 0 : "20px",
          }}>
            {items.map((item, i) => <li key={i} style={{ marginBottom: "4px" }}>{item}</li>)}
          </Tag>
        </Wrapper>
      );
    }

    case "code-block": {
      return (
        <Wrapper style={{ padding: "4px" }}>
          {p.inline ? (
            <code style={{ background: "#e9ecef", padding: "2px 6px", borderRadius: "4px", fontSize: "0.875em", fontFamily: "monospace" }}>
              {p.code}
            </code>
          ) : (
            <pre style={{
              background: BS.dark, color: BS.light, padding: "16px", borderRadius: "8px", fontSize: "0.875rem",
              fontFamily: "monospace", overflow: "auto", margin: 0, border: `1px solid ${BS.borderColor}`,
            }}>
              <code>{p.code}</code>
            </pre>
          )}
        </Wrapper>
      );
    }

    // ── FORMS ──
    case "input": {
      const inputSize: Record<string, string> = { "sm": "0.75rem", "": "1rem", "lg": "1.25rem" };
      const inputPadding: Record<string, string> = { "sm": "4px 8px", "": "8px 12px", "lg": "12px 16px" };
      const sz = String(p.size || "");

      if (p.floating) {
        return (
          <Wrapper style={{ padding: "4px" }}>
            <div style={{ position: "relative" }}>
              <input
                type={String(p.type || "text")}
                placeholder={String(p.placeholder || "")}
                disabled={!!p.disabled}
                readOnly={!!p.readonly}
                style={{
                  width: "100%", padding: p.floating ? "24px 12px 6px 12px" : inputPadding[sz],
                  fontSize: inputSize[sz], border: `1px solid ${BS.borderColor}`, borderRadius: "8px",
                  background: BS.white, boxSizing: "border-box",
                  opacity: p.disabled ? 0.65 : 1,
                }}
              />
              <label style={{
                position: "absolute", top: "6px", left: "12px", fontSize: "0.75rem",
                color: BS.muted, pointerEvents: "none",
              }}>
                {p.label}
              </label>
            </div>
            {p.helpText && <div style={{ fontSize: "0.875rem", color: BS.muted, marginTop: "4px" }}>{p.helpText}</div>}
          </Wrapper>
        );
      }

      return (
        <Wrapper style={{ padding: "4px" }}>
          {p.label && <label style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "0.9rem", color: BS.body }}>{p.label}{p.required && <span style={{ color: BS.danger, marginLeft: "2px" }}>*</span>}</label>}
          <input
            type={String(p.type || "text")}
            placeholder={String(p.placeholder || "")}
            disabled={!!p.disabled}
            readOnly={!!p.readonly || !!p.plaintext}
            style={{
              width: "100%", padding: inputPadding[sz], fontSize: inputSize[sz],
              border: p.plaintext ? "none" : `1px solid ${BS.borderColor}`,
              borderRadius: "6px", background: BS.white, boxSizing: "border-box",
              opacity: p.disabled ? 0.65 : 1, outline: "none",
            }}
          />
          {p.helpText && <div style={{ fontSize: "0.875rem", color: BS.muted, marginTop: "4px" }}>{p.helpText}</div>}
        </Wrapper>
      );
    }

    case "textarea": {
      const sz = String(p.size || "");
      return (
        <Wrapper style={{ padding: "4px" }}>
          {p.label && <label style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "0.9rem" }}>{p.label}</label>}
          <textarea
            placeholder={String(p.placeholder || "")}
            rows={Number(p.rows) || 3}
            disabled={!!p.disabled}
            style={{
              width: "100%", padding: "8px 12px", fontSize: sz === "sm" ? "0.875rem" : sz === "lg" ? "1.25rem" : "1rem",
              border: `1px solid ${BS.borderColor}`, borderRadius: "6px", background: BS.white,
              boxSizing: "border-box", resize: "vertical", opacity: p.disabled ? 0.65 : 1, outline: "none",
            }}
          />
          {p.helpText && <div style={{ fontSize: "0.875rem", color: BS.muted, marginTop: "4px" }}>{p.helpText}</div>}
        </Wrapper>
      );
    }

    case "select-input": {
      return (
        <Wrapper style={{ padding: "4px" }}>
          {p.label && <label style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "0.9rem" }}>{p.label}</label>}
          <select disabled={!!p.disabled} style={{
            width: "100%", padding: "8px 12px", border: `1px solid ${BS.borderColor}`,
            borderRadius: "6px", background: BS.white, fontSize: "1rem", boxSizing: "border-box",
            opacity: p.disabled ? 0.65 : 1, outline: "none",
          }}>
            {String(p.options || "").split("\n").filter(Boolean).map((opt, i) => (
              <option key={i} selected={i === 0}>{opt}</option>
            ))}
          </select>
        </Wrapper>
      );
    }

    case "checkbox": {
      return (
        <Wrapper style={{ padding: "4px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: p.disabled ? "not-allowed" : "pointer", opacity: p.disabled ? 0.65 : 1, flexDirection: p.reverse ? "row-reverse" : "row" }}>
            <input type="checkbox" defaultChecked={!!p.checked} disabled={!!p.disabled}
              style={{ width: "18px", height: "18px", accentColor: BS.primary, cursor: "inherit" }} />
            <span style={{ fontSize: "1rem", color: BS.body }}>{p.label}</span>
          </label>
        </Wrapper>
      );
    }

    case "radio": {
      return (
        <Wrapper style={{ padding: "4px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: p.disabled ? "not-allowed" : "pointer", opacity: p.disabled ? 0.65 : 1 }}>
            <input type="radio" name={String(p.name)} defaultChecked={!!p.checked} disabled={!!p.disabled}
              style={{ width: "18px", height: "18px", accentColor: BS.primary, cursor: "inherit" }} />
            <span style={{ fontSize: "1rem", color: BS.body }}>{p.label}</span>
          </label>
        </Wrapper>
      );
    }

    case "range": {
      return (
        <Wrapper style={{ padding: "4px" }}>
          {p.label && <label style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "0.9rem" }}>{p.label}</label>}
          <input
            type="range" min={Number(p.min)} max={Number(p.max)} step={Number(p.step)}
            defaultValue={Number(p.defaultValue)} disabled={!!p.disabled}
            style={{ width: "100%", accentColor: BS.primary }}
          />
        </Wrapper>
      );
    }

    case "switch": {
      return (
        <Wrapper style={{ padding: "4px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: p.disabled ? "not-allowed" : "pointer", opacity: p.disabled ? 0.65 : 1, flexDirection: p.reverse ? "row-reverse" : "row" }}>
            <div style={{
              position: "relative", width: "44px", height: "24px",
              background: p.checked ? BS.primary : BS.secondary,
              borderRadius: "24px", transition: "background 0.2s",
            }}>
              <div style={{
                position: "absolute", top: "2px", left: p.checked ? "22px" : "2px",
                width: "20px", height: "20px", background: BS.white,
                borderRadius: "50%", transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
            </div>
            <span style={{ fontSize: "1rem", color: BS.body }}>{p.label}</span>
          </label>
        </Wrapper>
      );
    }

    case "file-input": {
      return (
        <Wrapper style={{ padding: "4px" }}>
          {p.label && <label style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "0.9rem" }}>{p.label}</label>}
          <input type="file" disabled={!!p.disabled}
            style={{ fontSize: "0.875rem", color: BS.body }} />
          {p.helpText && <div style={{ fontSize: "0.875rem", color: BS.muted, marginTop: "4px" }}>{p.helpText}</div>}
        </Wrapper>
      );
    }

    case "input-group": {
      return (
        <Wrapper style={{ padding: "4px" }}>
          <div style={{ display: "flex", alignItems: "stretch" }}>
            {p.prepend && (
              <span style={{ display: "flex", alignItems: "center", padding: "8px 12px", background: BS.light, border: `1px solid ${BS.borderColor}`, borderRight: "none", borderRadius: "6px 0 0 6px", fontSize: "0.875rem", color: BS.body, minWidth: "40px", justifyContent: "center" }}>
                {p.prepend}
              </span>
            )}
            <input
              type={String(p.inputType || "text")}
              placeholder={String(p.label || "")}
              disabled={!!p.disabled}
              style={{
                flex: 1, padding: "8px 12px", border: `1px solid ${BS.borderColor}`,
                borderRadius: !p.prepend && !p.append ? "6px" : "0", background: BS.white,
                fontSize: "1rem", outline: "none", boxSizing: "border-box",
              }}
            />
            {p.append && (
              <span style={{ display: "flex", alignItems: "center", padding: "8px 12px", background: BS.light, border: `1px solid ${BS.borderColor}`, borderLeft: "none", borderRadius: "0 6px 6px 0", fontSize: "0.875rem", color: BS.body, minWidth: "40px", justifyContent: "center" }}>
                {p.append}
              </span>
            )}
          </div>
        </Wrapper>
      );
    }

    // ── BUTTONS ──
    case "button": {
      const variant = String(p.variant || "primary");
      const isOutline = !!p.outline;
      const btnStyle = getButtonStyle(variant, isOutline);
      const sz = String(p.size || "");
      return (
        <Wrapper style={{ padding: "4px", display: "inline-block" }}>
          <button disabled={!!p.disabled} style={{
            ...btnStyle,
            padding: sz === "sm" ? "4px 12px" : sz === "lg" ? "10px 24px" : "6px 16px",
            fontSize: sz === "sm" ? "0.875rem" : sz === "lg" ? "1.25rem" : "1rem",
            borderRadius: "6px", cursor: p.disabled ? "not-allowed" : "pointer",
            width: p.block ? "100%" : undefined,
            opacity: p.disabled ? 0.65 : 1,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            border: btnStyle.border,
            fontWeight: 400,
          }}>
            {p.text || "Button"}
          </button>
        </Wrapper>
      );
    }

    case "button-group": {
      const variant = String(p.variant || "primary");
      const isOutline = variant.startsWith("outline-");
      const baseVariant = isOutline ? variant.replace("outline-", "") : variant;
      const btnStyle = getButtonStyle(baseVariant, isOutline);
      const buttons = String(p.buttons || "").split(",").map(b => b.trim()).filter(Boolean);
      const vertical = !!p.vertical;

      return (
        <Wrapper style={{ padding: "4px" }}>
          <div style={{ display: "flex", flexDirection: vertical ? "column" : "row" }}>
            {buttons.map((btn, i) => (
              <button key={i} style={{
                ...btnStyle,
                padding: "6px 16px", fontSize: "1rem", fontWeight: 400,
                borderRight: !vertical && i < buttons.length - 1 ? "none" : btnStyle.border,
                borderBottom: vertical && i < buttons.length - 1 ? "none" : btnStyle.border,
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

    // ── NAVIGATION ──
    case "navbar": {
      return (
        <Wrapper style={{ padding: "0" }}>
          <nav style={{
            display: "flex", alignItems: "center", padding: "12px 20px",
            background: BS_BG[String(p.bgColor)] || BS.light,
            borderBottom: `1px solid ${BS.borderColor}`,
            flexWrap: "wrap", gap: "12px",
          }}>
            <a style={{ fontWeight: 700, fontSize: "1.25rem", color: p.bgColor === "dark" || p.bgColor === "primary" ? BS.white : BS.body, textDecoration: "none" }}>
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

    case "nav-tabs": {
      const items = String(p.items || "").split(",").map(i => i.trim()).filter(Boolean);
      const style = String(p.style || "tabs");
      const active = Number(p.active) || 0;

      return (
        <Wrapper style={{ padding: "4px" }}>
          <div style={{ display: "flex", borderBottom: style === "tabs" ? `2px solid ${BS.borderColor}` : "none", gap: "2px", flexDirection: p.vertical ? "column" : "row" }}>
            {items.map((item, i) => (
              <button key={i} style={{
                padding: "8px 16px", background: "transparent",
                border: style === "tabs"
                  ? `1px solid ${i === active ? "transparent transparent" + " " + BS.borderColor + " transparent" : "transparent"}`
                  : style === "underline"
                    ? `none ${i === active ? `2px solid ${BS.primary}` : `2px solid transparent`} none`
                    : "none",
                borderBottom: style === "underline" ? i === active ? `2px solid ${BS.primary}` : "2px solid transparent" : undefined,
                borderRadius: style === "pills" ? "20px" : style === "tabs" ? "6px 6px 0 0" : "6px",
                color: i === active ? BS.primary : BS.muted,
                fontWeight: i === active ? 600 : 400,
                cursor: "pointer", fontSize: "0.95rem",
                background2: style === "pills" && i === active ? BS.primary : "transparent",
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

    case "breadcrumb": {
      const items = String(p.items || "").split(",").map(i => i.trim()).filter(Boolean);
      return (
        <Wrapper style={{ padding: "4px" }}>
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

    case "pagination": {
      const pages = Number(p.pages) || 5;
      const active = Number(p.active) || 1;
      return (
        <Wrapper style={{ padding: "4px" }}>
          <div style={{ display: "flex", gap: "4px" }}>
            <button style={pageBtnStyle(false)}>&laquo;</button>
            {Array.from({ length: pages }).map((_, i) => (
              <button key={i} style={{
                ...pageBtnStyle(i + 1 === active),
                background: i + 1 === active ? BS.primary : BS.white,
                borderColor: i + 1 === active ? BS.primary : BS.borderColor,
              }}>
                {i + 1}
              </button>
            ))}
            <button style={pageBtnStyle(false)}>&raquo;</button>
          </div>
        </Wrapper>
      );
    }

    case "dropdown": {
      const items = String(p.items || "").split("\n").filter(Boolean);
      const variant = String(p.variant || "primary");
      const btnStyle = getButtonStyle(variant, false);
      return (
        <Wrapper style={{ padding: "4px" }}>
          <button style={{ ...btnStyle, padding: "6px 16px", borderRadius: "6px 0 0 6px", cursor: "pointer", fontSize: "1rem", border: btnStyle.border, fontWeight: 400 }}>
            {p.label || "Dropdown"} <span style={{ marginLeft: "4px" }}>▾</span>
          </button>
          <div style={{ border: `1px solid ${BS.borderColor}`, borderTop: "none", borderRadius: "0 0 6px 6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "inline-block", minWidth: "180px" }}>
            {items.map((item, i) => item.trim() === "---" ? (
              <div key={i} style={{ borderTop: `1px solid ${BS.borderColor}`, margin: "4px 0" }} />
            ) : (
              <div key={i} style={{ padding: "8px 16px", cursor: "pointer", fontSize: "0.9rem", color: BS.body }}>
                {item}
              </div>
            ))}
          </div>
        </Wrapper>
      );
    }

    // ── CONTENT ──
    case "card": {
      const bgMap: Record<string, string> = {
        "": BS.white, primary: BS.primary, secondary: BS.secondary,
        success: BS.success, danger: BS.danger, warning: BS.warning,
        info: BS.info, light: BS.light, dark: BS.dark,
      };
      const bgColor = bgMap[String(p.variant)] || BS.white;
      const isDark = ["primary", "secondary", "success", "danger", "info", "dark"].includes(String(p.variant));
      const borderColor = p.borderColor ? BS[String(p.borderColor)] : BS.borderColor;

      return (
        <Wrapper style={{ padding: "0" }}>
          <div style={{
            border: `1px solid ${borderColor}`, borderRadius: "12px", overflow: "hidden",
            background: bgColor, color: isDark ? BS.white : BS.body,
            textAlign: String(p.textAlign) as any,
          }}>
            {p.imgSrc && (
              <img src={String(p.imgSrc)} alt="" style={{ width: "100%", height: "180px", objectFit: "cover" }} />
            )}
            {p.header && (
              <div style={{ padding: "12px 20px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : BS.borderColor}`, fontSize: "0.875rem", fontWeight: 600 }}>
                {p.header}
              </div>
            )}
            <div style={{ padding: "20px" }}>
              {p.title && <h5 style={{ fontWeight: 600, marginBottom: "8px", fontSize: "1.25rem" }}>{p.title}</h5>}
              {p.subtitle && <h6 style={{ fontSize: "0.875rem", color: isDark ? "rgba(255,255,255,0.7)" : BS.muted, marginBottom: "12px", fontWeight: 400 }}>{p.subtitle}</h6>}
              {p.text && <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, margin: 0, color: isDark ? "rgba(255,255,255,0.85)" : "inherit" }}>{String(p.text).replace(/\\n/g, "\n")}</p>}
              {p.showButton && (
                <button style={{
                  marginTop: "16px", padding: "6px 16px", borderRadius: "6px",
                  background: isDark ? "transparent" : BS.primary, color: isDark ? BS.white : BS.white,
                  border: isDark ? `1px solid rgba(255,255,255,0.5)` : "none",
                  cursor: "pointer", fontSize: "0.9rem", fontWeight: 400,
                }}>
                  {p.buttonText || "Go somewhere"}
                </button>
              )}
            </div>
            {p.footer && (
              <div style={{ padding: "12px 20px", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : BS.borderColor}`, fontSize: "0.875rem", color: isDark ? "rgba(255,255,255,0.6)" : BS.muted }}>
                {p.footer}
              </div>
            )}
          </div>
        </Wrapper>
      );
    }

    case "alert": {
      const colorMap: Record<string, { bg: string; border: string; text: string }> = {
        primary: { bg: "#cfe2ff", border: "#b6d4fe", text: "#084298" },
        secondary: { bg: "#e2e3e5", border: "#d3d6d8", text: "#41464b" },
        success: { bg: "#d1e7dd", border: "#badbcc", text: "#0f5132" },
        danger: { bg: "#f8d7da", border: "#f5c2c7", text: "#842029" },
        warning: { bg: "#fff3cd", border: "#ffecb5", text: "#664d03" },
        info: { bg: "#cff4fc", border: "#b6effb", text: "#055160" },
        light: { bg: "#f8f9fa", border: "#fdfdfe", text: "#6c757d" },
        dark: { bg: "#d3d3d4", border: "#bcbebf", text: "#141619" },
      };
      const c = colorMap[String(p.variant)] || colorMap.primary;
      return (
        <Wrapper style={{ padding: "0" }}>
          <div style={{
            padding: "16px 20px", borderRadius: "8px", background: c.bg,
            border: `1px solid ${c.border}`, color: c.text, position: "relative",
          }}>
            {p.heading && <h4 style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "8px" }}>{p.heading}</h4>}
            <div style={{ fontSize: "0.9375rem" }}>{p.text}</div>
            {p.dismissible && (
              <button style={{
                position: "absolute", top: "8px", right: "12px", background: "none",
                border: "none", fontSize: "1.2rem", cursor: "pointer", color: c.text, lineHeight: 1,
              }}>×</button>
            )}
          </div>
        </Wrapper>
      );
    }

    case "badge": {
      const badgeColor = BS[String(p.variant)] || BS.primary;
      return (
        <Wrapper style={{ padding: "4px", display: "inline-block" }}>
          <span style={{
            display: "inline-block", padding: "4px 10px", background: badgeColor,
            color: BS.white, borderRadius: p.pill ? "20px" : "4px",
            fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.4,
          }}>
            {p.text || "Badge"}
          </span>
        </Wrapper>
      );
    }

    case "progress": {
      const variant = String(p.variant);
      const barColor = variant === "striped" || variant === "animated" ? BS.primary :
        variant ? BS[variant] : BS.primary;
      const isStriped = variant === "striped" || variant === "animated";
      const value = Number(p.value) || 0;
      const height = Number(p.height) || 16;

      return (
        <Wrapper style={{ padding: "4px" }}>
          <div style={{ width: "100%", height: `${height}px`, background: "#e9ecef", borderRadius: `${height}px`, overflow: "hidden" }}>
            <div style={{
              width: `${value}%`, height: "100%", background: barColor,
              borderRadius: `${height}px`, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", color: BS.white, fontWeight: 600,
              backgroundImage: isStriped
                ? `linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)`
                : undefined,
              backgroundSize: isStriped ? "1rem 1rem" : undefined,
              animation: variant === "animated" ? "bs-progress-bar-stripes 1s linear infinite" : undefined,
            }}>
              {p.label ? `${value}%` : ""}
            </div>
          </div>
          <style>{`
            @keyframes bs-progress-bar-stripes {
              0% { background-position: 1rem 0; }
              100% { background-position: 0 0; }
            }
          `}</style>
        </Wrapper>
      );
    }

    case "accordion": {
      const rawItems = String(p.items || "").split("\n").filter(Boolean);
      const items = rawItems.map((item) => {
        const parts = item.split("|");
        return { title: parts[0] || "Item", body: parts[1] || "" };
      });

      return (
        <Wrapper style={{ padding: "0" }}>
          <div style={{ borderRadius: "8px", overflow: "hidden", border: `1px solid ${BS.borderColor}` }}>
            {items.map((item, i) => (
              <div key={i} style={{ borderBottom: i < items.length - 1 ? `1px solid ${BS.borderColor}` : "none" }}>
                <div style={{
                  padding: "16px 20px", fontWeight: 600, fontSize: "1rem", cursor: "pointer",
                  background: i === 0 ? BS.light : BS.white,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderBottom: i === 0 ? `1px solid ${BS.borderColor}` : "none",
                }}>
                  {item.title}
                  <span style={{ fontSize: "0.875rem", color: BS.muted, transform: i === 0 ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                </div>
                {i === 0 && (
                  <div style={{ padding: "16px 20px", background: BS.white, fontSize: "0.9375rem", color: BS.body }}>
                    <div dangerouslySetInnerHTML={{ __html: item.body }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Wrapper>
      );
    }

    case "spinner": {
      const color = BS[String(p.variant)] || BS.primary;
      const isSmall = p.size === "sm";
      const size = isSmall ? "1rem" : "2rem";

      return (
        <Wrapper style={{ padding: "8px 4px", display: "inline-block" }}>
          {p.type === "grow" ? (
            <div style={{ width: size, height: size, background: color, borderRadius: "50%", animation: "bs-grow 0.75s linear infinite" }} />
          ) : (
            <div style={{
              width: size, height: size, border: `${isSmall ? "2px" : "3px"} solid ${BS.borderColor}`,
              borderTopColor: color, borderRadius: "50%", animation: "bs-spin 0.75s linear infinite",
            }} />
          )}
          <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)" }}>
            {p.label || "Loading..."}
          </span>
          <style>{`
            @keyframes bs-spin { to { transform: rotate(360deg); } }
            @keyframes bs-grow { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
          `}</style>
        </Wrapper>
      );
    }

    case "list-group": {
      const items = String(p.items || "").split("\n").filter(Boolean);
      const numbered = p.variant === "numbered";
      const flush = p.variant === "flush";

      return (
        <Wrapper style={{ padding: "0" }}>
          <div style={{ borderRadius: flush ? 0 : "8px", overflow: "hidden", border: flush ? "none" : `1px solid ${BS.borderColor}` }}>
            {items.map((item, i) => (
              <div key={i} style={{
                padding: "12px 20px", background: i === Number(p.activeItem) ? BS.primary : BS.white,
                color: i === Number(p.activeItem) ? BS.white : BS.body,
                borderBottom: i < items.length - 1 ? `1px solid ${BS.borderColor}` : "none",
                opacity: i === Number(p.disabledItem) ? 0.65 : 1,
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                {numbered && <span style={{ fontWeight: 600, minWidth: "24px" }}>{i + 1}.</span>}
                {item}
              </div>
            ))}
          </div>
        </Wrapper>
      );
    }

    case "toast": {
      const headerColor = BS[String(p.variant)] || BS.primary;
      return (
        <Wrapper style={{ padding: "0" }}>
          <div style={{
            borderRadius: "8px", overflow: "hidden", background: BS.white,
            border: `1px solid ${BS.borderColor}`, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            maxWidth: "350px",
          }}>
            <div style={{
              padding: "12px 16px", background: headerColor, color: BS.white,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <strong style={{ fontSize: "0.9375rem" }}>{p.title}</strong>
              <span style={{ fontSize: "0.75rem", opacity: 0.85 }}>{p.time}</span>
            </div>
            <div style={{ padding: "12px 16px", fontSize: "0.9375rem", color: BS.body }}>
              {p.text}
            </div>
          </div>
        </Wrapper>
      );
    }

    case "jumbotron": {
      const bg = BS_BG[String(p.bgColor)] || BS.light;
      const isDark = ["dark", "primary", "secondary", "success", "danger", "info"].includes(String(p.bgColor));

      return (
        <Wrapper style={{ padding: "0" }}>
          <div style={{
            padding: "48px 32px", borderRadius: "12px", background: bg,
            textAlign: String(p.textAlign) as any, color: isDark ? BS.white : BS.body,
          }}>
            <h1 style={{ fontWeight: 600, fontSize: "2.75rem", marginBottom: "12px" }}>{p.title}</h1>
            <p style={{ fontSize: "1.2rem", fontWeight: 300, lineHeight: 1.6, opacity: isDark ? 0.85 : 1, margin: 0 }}>
              {String(p.lead).replace(/\\n/g, "\n")}
            </p>
            <hr style={{ margin: "24px 0", borderColor: isDark ? "rgba(255,255,255,0.2)" : BS.borderColor }} />
            <div style={{ display: "flex", gap: "8px", justifyContent: String(p.textAlign) }}>
              <button style={{
                padding: "10px 24px", borderRadius: "6px",
                background: isDark ? "transparent" : (BS[String(p.buttonVariant)] || BS.primary),
                color: isDark ? BS.white : BS.white,
                border: isDark ? `1px solid rgba(255,255,255,0.5)` : "none",
                cursor: "pointer", fontSize: "1.1rem", fontWeight: 400,
              }}>
                {p.buttonText}
              </button>
              {p.secondaryButtonText && (
                <button style={{
                  padding: "10px 24px", borderRadius: "6px",
                  background: isDark ? "transparent" : BS.white,
                  color: isDark ? BS.white : BS.secondary,
                  border: isDark ? `1px solid rgba(255,255,255,0.3)` : `1px solid ${BS.borderColor}`,
                  cursor: "pointer", fontSize: "1.1rem", fontWeight: 400,
                }}>
                  {p.secondaryButtonText}
                </button>
              )}
            </div>
          </div>
        </Wrapper>
      );
    }

    case "carousel": {
      const slides = String(p.slides || "").split("\n").filter(Boolean);
      return (
        <Wrapper style={{ padding: "0" }}>
          <div style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${BS.borderColor}` }}>
            {p.indicators && (
              <div style={{ display: "flex", gap: "6px", justifyContent: "center", padding: "8px 0", background: BS.light }}>
                {slides.map((_, i) => (
                  <div key={i} style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: i === 0 ? BS.secondary : BS.borderColor,
                  }} />
                ))}
              </div>
            )}
            <div style={{ position: "relative", height: "200px", background: BS.dark }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center", color: BS.white }}>
                  <h5 style={{ fontWeight: 600, fontSize: "1.25rem" }}>{slides[0] || "Slide 1"}</h5>
                  <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>Representative content</p>
                </div>
              </div>
              {p.controls && (
                <>
                  <button style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.4)", border: "none", color: BS.white, padding: "12px 16px", borderRadius: "6px", cursor: "pointer" }}>‹</button>
                  <button style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.4)", border: "none", color: BS.white, padding: "12px 16px", borderRadius: "6px", cursor: "pointer" }}>›</button>
                </>
              )}
            </div>
          </div>
        </Wrapper>
      );
    }

    case "modal": {
      return (
        <Wrapper style={{ padding: "0" }}>
          <div style={{
            borderRadius: "12px", overflow: "hidden", border: `1px solid ${BS.borderColor}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)", background: BS.white, maxWidth: "500px",
          }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BS.borderColor}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h5 style={{ fontWeight: 600, fontSize: "1.1rem", margin: 0 }}>{p.title}</h5>
              <button style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: BS.muted, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: "20px", fontSize: "0.9375rem", color: BS.body }}>
              {String(p.text).replace(/\\n/g, "\n")}
            </div>
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${BS.borderColor}`, display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button style={{ padding: "6px 16px", borderRadius: "6px", border: `1px solid ${BS.borderColor}`, background: BS.white, cursor: "pointer", fontSize: "0.9rem" }}>Close</button>
              <button style={{ padding: "6px 16px", borderRadius: "6px", background: BS.primary, color: BS.white, border: "none", cursor: "pointer", fontSize: "0.9rem" }}>{p.footer || "Save Changes"}</button>
            </div>
          </div>
        </Wrapper>
      );
    }

    // ── TABLES ──
    case "table": {
      const headers = String(p.headers || "").split(",").map(h => h.trim());
      const rows = String(p.rows || "").split("\n").filter(Boolean).map(r => r.split(",").map(c => c.trim()));

      return (
        <Wrapper style={{ padding: "0" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%", borderCollapse: "collapse", fontSize: "0.9375rem",
              border: p.bordered ? `1px solid ${BS.borderColor}` : undefined,
            }}>
              <thead>
                <tr style={{
                  background: BS.light, borderBottom: `2px solid ${BS.borderColor}`,
                }}>
                  {headers.map((h, i) => (
                    <th key={i} style={{
                      padding: p.condensed ? "6px 12px" : "12px 16px",
                      border: p.bordered ? `1px solid ${BS.borderColor}` : undefined,
                      borderBottom: `2px solid ${BS.borderColor}`,
                      fontWeight: 600, textAlign: "left", color: BS.body,
                      borderColor: p.borderColor ? BS[String(p.borderColor)] : undefined,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} style={{
                    background: p.striped && ri % 2 === 1 ? BS.light : BS.white,
                    borderBottom: `1px solid ${BS.borderColor}`,
                    cursor: p.hover ? "pointer" : undefined,
                  }}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{
                        padding: p.condensed ? "6px 12px" : "12px 16px",
                        border: p.bordered ? `1px solid ${BS.borderColor}` : undefined,
                        borderColor: p.borderColor ? BS[String(p.borderColor)] : undefined,
                      }}>
                        {ci === 0 ? <strong>{cell}</strong> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Wrapper>
      );
    }

    // ── IMAGES ──
    case "image": {
      const roundedMap: Record<string, string> = {
        "": "0", rounded: "8px", circle: "50%", thumbnail: "4px",
      };
      return (
        <Wrapper style={{ padding: "4px" }}>
          <img
            src={String(p.src || "https://picsum.photos/seed/bseditor/800/400")}
            alt={String(p.alt || "")}
            style={{
              maxWidth: p.fluid ? "100%" : undefined,
              height: "auto",
              borderRadius: roundedMap[String(p.rounded)] || "0",
              display: "block",
              boxShadow: p.rounded === "thumbnail" ? `0 0 0 4px ${BS.light}` : undefined,
              border: p.rounded === "thumbnail" ? `1px solid ${BS.borderColor}` : undefined,
            }}
          />
        </Wrapper>
      );
    }

    case "figure": {
      return (
        <Wrapper style={{ padding: "4px", display: "flex", justifyContent: p.alignment === "center" ? "center" : p.alignment === "end" ? "flex-end" : "flex-start" }}>
          <figure style={{ margin: 0, maxWidth: "100%" }}>
            <img src={String(p.src || "https://picsum.photos/seed/figure/400/300")} alt="" style={{
              maxWidth: "100%", height: "auto", borderRadius: "8px",
            }} />
            <figcaption style={{ textAlign: "center", fontSize: "0.875rem", color: BS.muted, marginTop: "8px" }}>
              {p.caption}
            </figcaption>
          </figure>
        </Wrapper>
      );
    }

    // ── UTILITIES ──
    case "divider": {
      return (
        <Wrapper style={{ padding: "8px 4px" }}>
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

    case "spacer": {
      const height = spacing(String(p.size || "4"));
      return (
        <Wrapper style={{ padding: "4px" }}>
          <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "11px", color: BS.muted, opacity: 0.5 }}>Spacer ({p.size})</span>
          </div>
        </Wrapper>
      );
    }

    case "embed-video": {
      const ratioMap: Record<string, string> = { "21x9": "42.86%", "16x9": "56.25%", "4:3": "75%", "1x1": "100%" };
      return (
        <Wrapper style={{ padding: "0" }}>
          <div style={{
            position: "relative", width: "100%",
            paddingBottom: ratioMap[String(p.ratio)] || "56.25%",
            height: 0, overflow: "hidden", background: BS.dark, borderRadius: "8px",
          }}>
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ textAlign: "center", color: BS.white }}>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>▶</div>
                <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>Video Embed</div>
              </div>
            </div>
          </div>
        </Wrapper>
      );
    }

    default:
      return (
        <Wrapper style={{ padding: "8px" }}>
          <div style={{ color: BS.muted, fontSize: "0.875rem" }}>Unknown: {type}</div>
        </Wrapper>
      );
  }
}

// ── Helper functions ──

function getButtonStyle(variant: string, isOutline: boolean): React.CSSProperties {
  if (isOutline) {
    const colorMap: Record<string, string> = {
      primary: BS.primary, secondary: BS.secondary, success: BS.success,
      danger: BS.danger, warning: BS.warning, info: BS.info,
    };
    const color = colorMap[variant] || BS.primary;
    return {
      background: "transparent",
      color,
      border: `1px solid ${color}`,
    };
  }

  const styles: Record<string, React.CSSProperties> = {
    primary: { background: BS.primary, color: BS.white, border: `1px solid ${BS.primary}` },
    secondary: { background: BS.secondary, color: BS.white, border: `1px solid ${BS.secondary}` },
    success: { background: BS.success, color: BS.white, border: `1px solid ${BS.success}` },
    danger: { background: BS.danger, color: BS.white, border: `1px solid ${BS.danger}` },
    warning: { background: BS.warning, color: BS.dark, border: `1px solid ${BS.warning}` },
    info: { background: BS.info, color: BS.dark, border: `1px solid ${BS.info}` },
    light: { background: BS.light, color: BS.dark, border: `1px solid ${BS.borderColor}` },
    dark: { background: BS.dark, color: BS.white, border: `1px solid ${BS.dark}` },
    link: { background: "transparent", color: BS.primary, border: "none", textDecoration: "underline" },
  };
  return styles[variant] || styles.primary;
}

function pageBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: "6px 12px", border: `1px solid ${active ? BS.primary : BS.borderColor}`,
    background: active ? BS.primary : BS.white, color: active ? BS.white : BS.primary,
    borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem", fontWeight: 400,
  };
}
