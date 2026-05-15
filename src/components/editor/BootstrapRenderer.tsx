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
  gray: "#adb5bd",
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
  slotChildren?: Record<string, React.ReactNode>;
  isDragging?: boolean;
}

const Wrapper: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  customClass?: string;
}> = ({ children, style, className, customClass }) => (
  <div
    className={`transition-all duration-150 ${className || ""} ${customClass || ""}`}
    style={{
      ...style,
      borderRadius: "4px",
      position: "relative",
    }}
  >
    {children}
  </div>
);

export function BootstrapRenderer({ component, renderChildren, slotChildren, isDragging }: RendererProps) {
  const { type, props } = component;
  const p = props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");

  switch (type) {


    // ── LAYOUT ──
    case "container": {
      const fluid = p.fluid;
      const maxWidth = fluid === "fixed" ? "1140px" : "100%";
      const hasChildren = component.children && component.children.length > 0;
      return (
        <Wrapper customClass={customClass} style={{
          width: "100%",
          maxWidth,
          margin: "0 auto",
          padding: spacing(String(p.padding || "3")),
          background: BS_BG[String(p.bgColor)] || "transparent",
          color: BS_TEXT[String(p.textColor)] || BS.body,
          minHeight: "60px",
          boxSizing: "border-box",
          border: !hasChildren && !renderChildren ? "1px dashed #dee2e6" : "none",
          textAlign: String(p.textAlign) as any,
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
        <Wrapper customClass={customClass} style={{ display: "flex", gap: `${spacing(String(p.gutter || "3"))}`, minHeight: "50px", alignItems: p.verticalAlign === "center" ? "center" : p.verticalAlign === "end" ? "flex-end" : "flex-start" }}>
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
      const hasChildren = component.children && component.children.length > 0;
      const colSize = String(p.size || "auto");
      const grow = colSize === "auto" ? 1 : Math.max(0, Number(colSize));
      return (
        <Wrapper customClass={customClass} style={{
          background: BS_BG[String(p.bgColor)] || BS.light,
          color: BS_TEXT[String(p.textColor)] || BS.body,
          padding: spacing(String(p.padding || "3")),
          borderRadius: "4px",
          minHeight: "50px",
          boxSizing: "border-box",
          flex: `${grow} 0 0%`,
          textAlign: String(p.textAlign) as any,
        }}>
          {renderChildren ?? (hasChildren ? (
            component.children!.map((child) => (
              <BootstrapRenderer key={child.id} component={child} />
            ))
          ) : (
            <span style={{ fontSize: "12px", color: BS.muted }}>
              Drop here
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
        <Wrapper customClass={customClass} style={{ padding: "8px 4px" }}>
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
      const pBg = BS_BG[String(p.bgColor)];
      const isDarkBg = ["primary", "secondary", "success", "danger", "info", "dark"].includes(String(p.bgColor));
      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
          <p style={{
            fontSize: p.textSize === "fs-6" ? "1rem" : p.textSize === "fs-4" ? "1.5rem" : p.textSize === "fs-2" ? "2rem" : "1rem",
            fontWeight: p.lead ? 300 : 400,
            lineHeight: p.lead ? 1.7 : 1.6,
            color: isDarkBg ? BS.white : (BS_TEXT[String(p.textColor)] || BS.body),
            textAlign: String(p.textAlign) as any,
            margin: 0,
            background: pBg || "transparent",
            padding: spacing(String(p.padding || "2")),
            borderRadius: String(p.borderRadius || "0"),
          }}>
            {p.text || "Paragraph text"}
          </p>
        </Wrapper>
      );
    }

    case "blockquote": {
      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
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
        <Wrapper customClass={customClass} style={{ padding: "4px 4px 4px 20px" }}>
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
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
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
      const isCurrency = String(p.type || "") === "currency";

      // Helper: format number as Italian currency (1.234,56 €)
      const formatEuro = (val: string | number | undefined) => {
        if (!val && val !== 0) return "";
        const raw = String(val).replace(/[^\d.,\-]/g, "").replace(/\./g, "").replace(",", ".");
        const num = parseFloat(raw);
        if (isNaN(num)) return "";
        return num.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
      };

      const displayValue = isCurrency ? formatEuro(p.text) : String(p.text || "");
      const inputKey = component.id + "-" + String(p.type || "") + "-" + String(p.text || "");

      if (p.floating && !isCurrency) {
        return (
          <Wrapper customClass={customClass} style={{ padding: "4px" }}>
            <div style={{ position: "relative" }}>
              <input
                key={inputKey}
                type={String(p.type || "text")}
                placeholder={String(p.placeholder || "")}
                value={String(p.text || "")}
                readOnly
                disabled={!!p.disabled}
                style={{
                  width: "100%", padding: p.floating ? "24px 12px 6px 12px" : inputPadding[sz],
                  fontSize: inputSize[sz], border: `1px solid ${p.validation === "valid" ? BS.success : p.validation === "invalid" ? BS.danger : BS.borderColor}`, borderRadius: "8px",
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
            {p.validation && p.validation !== "none" && (
              <div style={{ fontSize: "0.875rem", marginTop: "4px", color: p.validation === "valid" ? BS.success : BS.danger }}>
                {p.feedbackMessage || (p.validation === "valid" ? "Looks good!" : "Please correct this field.")}
              </div>
            )}
          </Wrapper>
        );
      }

      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
          {p.label && <label style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "0.9rem", color: BS.body }}>{p.label}{p.required && <span style={{ color: BS.danger, marginLeft: "2px" }}>*</span>}</label>}
          <input
            key={inputKey}
            type={isCurrency ? "text" : String(p.type || "text")}
            placeholder={String(p.placeholder || "")}
            value={displayValue}
            readOnly
            disabled={!!p.disabled}
            inputMode={isCurrency ? "decimal" : undefined}
            style={{
              width: "100%", padding: inputPadding[sz], fontSize: inputSize[sz],
              border: p.plaintext ? "none" : `1px solid ${p.validation === "valid" ? BS.success : p.validation === "invalid" ? BS.danger : BS.borderColor}`,
              borderRadius: "6px", background: BS.white, boxSizing: "border-box",
              opacity: p.disabled ? 0.65 : 1, outline: "none",
            }}
          />
          {p.helpText && <div style={{ fontSize: "0.875rem", color: BS.muted, marginTop: "4px" }}>{p.helpText}</div>}
          {p.validation && p.validation !== "none" && (
            <div style={{ fontSize: "0.875rem", marginTop: "4px", color: p.validation === "valid" ? BS.success : BS.danger }}>
              {p.feedbackMessage || (p.validation === "valid" ? "Looks good!" : "Please correct this field.")}
            </div>
          )}
        </Wrapper>
      );
    }

    case "textarea": {
      const sz = String(p.size || "");
      const taKey = component.id + "-" + String(p.text || "");
      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
          {p.label && <label style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "0.9rem" }}>{p.label}</label>}
          <textarea
            key={taKey}
            placeholder={String(p.placeholder || "")}
            value={String(p.text || "")}
            readOnly
            rows={Number(p.rows) || 3}
            disabled={!!p.disabled}
            style={{
              width: "100%", padding: "8px 12px", fontSize: sz === "sm" ? "0.875rem" : sz === "lg" ? "1.25rem" : "1rem",
              border: `1px solid ${p.validation === "valid" ? BS.success : p.validation === "invalid" ? BS.danger : BS.borderColor}`, borderRadius: "6px", background: BS.white,
              boxSizing: "border-box", resize: "vertical", opacity: p.disabled ? 0.65 : 1, outline: "none",
            }}
          />
          {p.helpText && <div style={{ fontSize: "0.875rem", color: BS.muted, marginTop: "4px" }}>{p.helpText}</div>}
          {p.validation && p.validation !== "none" && (
            <div style={{ fontSize: "0.875rem", marginTop: "4px", color: p.validation === "valid" ? BS.success : BS.danger }}>
              {p.feedbackMessage || (p.validation === "valid" ? "Looks good!" : "Please correct this field.")}
            </div>
          )}
        </Wrapper>
      );
    }

    case "select-input": {
      const selectSize = String(p.size || "");
      const isSmall = selectSize === "sm";
      const isLarge = selectSize === "lg";
      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
          {p.label && <label style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "0.9rem" }}>{p.label}</label>}
          <select disabled={!!p.disabled} multiple={!!p.multiple} defaultValue={String(p.options || "").split("\n").filter(Boolean)[0] || ""} style={{
            width: "100%", padding: isSmall ? "4px 8px" : isLarge ? "10px 14px" : "8px 12px", border: `1px solid ${p.validation === "valid" ? BS.success : p.validation === "invalid" ? BS.danger : BS.borderColor}`,
            borderRadius: "6px", background: BS.white, fontSize: isSmall ? "0.875rem" : isLarge ? "1.25rem" : "1rem", boxSizing: "border-box",
            opacity: p.disabled ? 0.65 : 1, outline: "none",
            height: p.multiple ? "120px" : undefined,
          }}>
            {String(p.options || "").split("\n").filter(Boolean).map((opt, i) => (
              <option key={i}>{opt}</option>
            ))}
          </select>
          {p.validation && p.validation !== "none" && (
            <div style={{ fontSize: "0.875rem", marginTop: "4px", color: p.validation === "valid" ? BS.success : BS.danger }}>
              {p.feedbackMessage || (p.validation === "valid" ? "Looks good!" : "Please correct this field.")}
            </div>
          )}
        </Wrapper>
      );
    }

    case "checkbox": {
      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
          <label style={{ display: !!p.inline ? "inline-flex" : "flex", alignItems: "center", gap: "8px", cursor: p.disabled ? "not-allowed" : "pointer", opacity: p.disabled ? 0.65 : 1, flexDirection: p.reverse ? "row-reverse" : "row" }}>
            <input type="checkbox" defaultChecked={!!p.checked} disabled={!!p.disabled}
              style={{ width: "18px", height: "18px", accentColor: BS.primary, cursor: "inherit" }} />
            <span style={{ fontSize: "1rem", color: BS.body }}>{p.label}</span>
          </label>
        </Wrapper>
      );
    }

    case "radio": {
      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
          <label style={{ display: !!p.inline ? "inline-flex" : "flex", alignItems: "center", gap: "8px", cursor: p.disabled ? "not-allowed" : "pointer", opacity: p.disabled ? 0.65 : 1 }}>
            <input type="radio" name={String(p.name)} defaultChecked={!!p.checked} disabled={!!p.disabled}
              style={{ width: "18px", height: "18px", accentColor: BS.primary, cursor: "inherit" }} />
            <span style={{ fontSize: "1rem", color: BS.body }}>{p.label}</span>
          </label>
        </Wrapper>
      );
    }

    case "range": {
      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
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
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
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
      const fSize = String(p.size || "");
      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
          {p.label && <label style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "0.9rem" }}>{p.label}</label>}
          <input type="file" disabled={!!p.disabled}
            style={{ fontSize: fSize === "sm" ? "0.8rem" : fSize === "lg" ? "1.05rem" : "0.875rem", color: BS.body }} />
          {p.helpText && <div style={{ fontSize: "0.875rem", color: BS.muted, marginTop: "4px" }}>{p.helpText}</div>}
        </Wrapper>
      );
    }

    case "input-group": {
      const igSize = String(p.size || "");
      const igPad = igSize === "sm" ? "4px 8px" : igSize === "lg" ? "10px 14px" : "8px 12px";
      const igFontSize = igSize === "sm" ? "0.875rem" : igSize === "lg" ? "1.25rem" : "1rem";
      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
          <div style={{ display: "flex", alignItems: "stretch" }}>
            {p.prepend && (
              <span style={{ display: "flex", alignItems: "center", padding: igPad, background: BS.light, borderWidth: "1px", borderStyle: "solid", borderColor: BS.borderColor, borderRightStyle: "none", borderRadius: "6px 0 0 6px", fontSize: igFontSize, color: BS.body, minWidth: "40px", justifyContent: "center" }}>
                {p.prepend}
              </span>
            )}
            <input
              type={String(p.inputType || "text")}
              placeholder={String(p.label || "")}
              disabled={!!p.disabled}
              style={{
                flex: 1, padding: igPad, border: `1px solid ${BS.borderColor}`,
                borderRadius: !p.prepend && !p.append ? "6px" : "0", background: BS.white,
                fontSize: igFontSize, outline: "none", boxSizing: "border-box",
              }}
            />
            {p.append && (
              <span style={{ display: "flex", alignItems: "center", padding: igPad, background: BS.light, borderWidth: "1px", borderStyle: "solid", borderColor: BS.borderColor, borderLeftStyle: "none", borderRadius: "0 6px 6px 0", fontSize: igFontSize, color: BS.body, minWidth: "40px", justifyContent: "center" }}>
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
        <Wrapper customClass={customClass} style={{ padding: "4px", display: "inline-block" }}>
          <button disabled={!!p.disabled} style={{
            ...btnStyle,
            padding: sz === "sm" ? "4px 12px" : sz === "lg" ? "10px 24px" : "6px 16px",
            fontSize: sz === "sm" ? "0.875rem" : sz === "lg" ? "1.25rem" : "1rem",
            borderRadius: "6px", cursor: p.disabled ? "not-allowed" : "pointer",
            width: p.block ? "100%" : undefined,
            opacity: p.disabled ? 0.65 : 1,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
            fontWeight: 400,
          }}>
            {p.iconLeft && <i className={String(p.iconLeft)} style={{ fontSize: "inherit" }} />}
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
      const bgSize = String(p.size || "");
      const bgPad = bgSize === "sm" ? "4px 12px" : bgSize === "lg" ? "10px 24px" : "6px 16px";
      const bgFontSize = bgSize === "sm" ? "0.875rem" : bgSize === "lg" ? "1.25rem" : "1rem";

      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
          <div style={{ display: "flex", flexDirection: vertical ? "column" : "row" }}>
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

    // ── NAVIGATION ──
    case "navbar": {
      return (
        <Wrapper customClass={customClass} style={{ padding: "0" }}>
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

    case "breadcrumb": {
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

    case "pagination": {
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

    case "dropdown": {
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

    // ── CONTENT ──
    case "card": {
      const headerBgMap: Record<string, string> = {
        "": BS.transparent, primary: BS.primary, secondary: BS.secondary,
        success: BS.success, danger: BS.danger, warning: BS.warning,
        info: BS.info, light: BS.light, dark: BS.dark,
      };
      const headerBg = headerBgMap[String(p.variant)] || BS.transparent;
      const isDarkHeader = ["primary", "secondary", "success", "danger", "info", "dark"].includes(String(p.variant));
      const borderColor = p.borderColor ? BS[String(p.borderColor)] : BS.borderColor;
      const hasSlotChildren = slotChildren && Object.keys(slotChildren).length > 0;
      const hasDirectChildren = component.children && component.children.length > 0;
      const hasHeaderChildren = component.children?.some(c => c.slot === "header") || false;
      const hasBodySlot = renderChildren || hasDirectChildren || (hasSlotChildren && slotChildren.body);
      const hasFooterChildren = component.children?.some(c => c.slot === "footer") || false;
      const dragging = !!isDragging;
      const showHeader = p.header || hasHeaderChildren || dragging || p.variant;
      const headerFontSizeMap: Record<string, string> = { "": "0.875rem", sm: "0.75rem", md: "0.875rem", lg: "1.25rem", xl: "1.5rem" };
      const headerFontSize = headerFontSizeMap[String(p.headerSize)] || "0.875rem";

      return (
        <Wrapper customClass={customClass} style={{ padding: "0" }}>
          <div style={{
            border: `1px solid ${borderColor}`, borderRadius: "12px", overflow: "hidden",
            background: BS.white, color: BS.body,
            textAlign: String(p.textAlign) as any,
          }}>
            {p.imgSrc && (
              <img src={String(p.imgSrc)} alt="" style={{ width: "100%", height: "180px", objectFit: "cover" }} />
            )}
            {/* Header */}
            {showHeader && (
              <div style={{
                padding: "12px 20px",
                borderBottom: `1px solid ${isDarkHeader ? "rgba(255,255,255,0.15)" : BS.borderColor}`,
                fontSize: headerFontSize, fontWeight: 600, minHeight: "20px",
                background: headerBg,
                color: isDarkHeader ? BS.white : BS.body,
              }}>
                {hasHeaderChildren ? (
                  slotChildren?.header
                ) : (
                  <>
                    {p.header && <span>{p.header as string}</span>}
                    {slotChildren?.header}
                  </>
                )}
              </div>
            )}
            {/* Body */}
            <div style={{ padding: "20px" }}>
              {hasBodySlot ? (
                renderChildren ?? (hasSlotChildren ? slotChildren.body : null)
              ) : (
                <>
                  {p.title && <h5 style={{ fontWeight: 600, marginBottom: "8px", fontSize: "1.25rem" }}>{p.title}</h5>}
                  {p.subtitle && <h6 style={{ fontSize: "0.875rem", color: BS.muted, marginBottom: "12px", fontWeight: 400 }}>{p.subtitle}</h6>}
                  {p.text && <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, margin: 0 }}>{String(p.text).replace(/\\n/g, "\n")}</p>}
                  {p.showButton && (
                    <button style={{
                      marginTop: "16px", padding: "6px 16px", borderRadius: "6px",
                      background: BS.primary, color: BS.white,
                      border: "none",
                      cursor: "pointer", fontSize: "0.9rem", fontWeight: 400,
                    }}>
                      {p.buttonText || "Go somewhere"}
                    </button>
                  )}
                </>
              )}
            </div>
            {/* Footer */}
            {(p.footer || hasFooterChildren || dragging) && (
              <div style={{
                padding: "12px 20px", borderTop: `1px solid ${BS.borderColor}`,
                fontSize: "0.875rem", color: BS.muted, minHeight: "20px",
              }}>
                {hasFooterChildren ? (
                  slotChildren?.footer
                ) : (
                  <>
                    {p.footer && <span>{p.footer as string}</span>}
                    {slotChildren?.footer}
                  </>
                )}
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
        <Wrapper customClass={customClass} style={{ padding: "0" }}>
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
        <Wrapper customClass={customClass} style={{ padding: "4px", display: "inline-block" }}>
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
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
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
      const isFlush = !!p.flush;
      const hasDirectChildren = component.children && component.children.length > 0;

      return (
        <Wrapper customClass={customClass} style={{ padding: "0" }}>
          <div style={{ borderRadius: isFlush ? "0" : "8px", overflow: "hidden", border: isFlush ? "none" : `1px solid ${BS.borderColor}` }}>
            {items.map((item, i) => {
              const accSlotKey = `acc-${i}`;
              const slotContent = slotChildren?.[accSlotKey];
              const hasSlotChildren = slotContent !== undefined && slotContent !== null;

              return (
                <React.Fragment key={i}>
                  <div style={{ borderBottom: i < items.length - 1 ? `1px solid ${BS.borderColor}` : "none" }}>
                    <div style={{
                      padding: "16px 20px", fontWeight: 600, fontSize: "1rem", cursor: "pointer",
                      background: i === 0 ? BS.light : BS.white,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      borderBottom: i === 0 ? `1px solid ${BS.borderColor}` : "none",
                      borderRadius: isFlush ? "0" : (i === 0 ? "8px 8px 0 0" : i === items.length - 1 ? "0 0 8px 8px" : "0"),
                    }}>
                      {item.title}
                      <span style={{ fontSize: "0.875rem", color: BS.muted, transform: i === 0 ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                    </div>
                    {i === 0 && (
                      <div style={{ padding: "16px 20px", background: BS.white, fontSize: "0.9375rem", color: BS.body, minHeight: "40px" }}>
                        {hasSlotChildren ? slotContent : <div dangerouslySetInnerHTML={{ __html: item.body }} />}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </Wrapper>
      );
    }

    case "spinner": {
      const color = BS[String(p.variant)] || BS.primary;
      const isSmall = p.size === "sm";
      const size = isSmall ? "1rem" : "2rem";

      return (
        <Wrapper customClass={customClass} style={{ padding: "8px 4px", display: "inline-block" }}>
          {p.type === "grow" ? (
            <div style={{ width: size, height: size, background: color, borderRadius: "50%", animation: "bs-grow 0.75s linear infinite" }} />
          ) : (
            <div style={{
              width: size, height: size, borderWidth: isSmall ? "2px" : "3px", borderStyle: "solid", borderColor: BS.borderColor,
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
      const numbered = !!p.numbered;
      const flush = !!p.flush;

      return (
        <Wrapper customClass={customClass} style={{ padding: "0" }}>
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
        <Wrapper customClass={customClass} style={{ padding: "0" }}>
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
        <Wrapper customClass={customClass} style={{ padding: "0" }}>
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
        <Wrapper customClass={customClass} style={{ padding: "0" }}>
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
      const sizeWidthMap: Record<string, string> = {
        "": "500px", sm: "300px", lg: "800px", xl: "1140px",
      };
      const modalMaxWidth = sizeWidthMap[String(p.size)] || "500px";
      const isCentered = !!p.centered;
      const isScrollable = !!p.scrollable;
      const hasSlotChildren = slotChildren && Object.keys(slotChildren).length > 0;
      const hasDirectChildren = component.children && component.children.length > 0;
      const hasHeaderChildren = component.children?.some(c => c.slot === "header") || false;
      const hasBodySlot = renderChildren || hasDirectChildren || (hasSlotChildren && slotChildren.body);
      const hasFooterChildren = component.children?.some(c => c.slot === "footer") || false;
      const dragging = !!isDragging;

      return (
        <Wrapper customClass={customClass} style={{ padding: "0", display: "flex", justifyContent: "center", alignItems: isCentered ? "center" : "flex-start", minHeight: isCentered ? "200px" : undefined, background: "rgba(0,0,0,0.1)", borderRadius: "8px" }}>
          <div style={{
            borderRadius: "12px", overflow: "hidden", border: `1px solid ${BS.borderColor}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)", background: BS.white, maxWidth: modalMaxWidth, width: "100%",
            display: "flex", flexDirection: "column",
            ...(isScrollable ? { maxHeight: "400px" } : {}),
          }}>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BS.borderColor}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", minHeight: "24px" }}>
              <div style={{ flex: 1 }}>
                {hasHeaderChildren ? (
                  slotChildren?.header
                ) : (
                  <>
                    <h5 style={{ fontWeight: 600, fontSize: "1.1rem", margin: 0 }}>{p.title || "Modal"}</h5>
                    {slotChildren?.header}
                  </>
                )}
              </div>
              <button style={{ background: "transparent", border: "none", width: "32px", height: "32px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#6c757d"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>
              </button>
            </div>
            {/* Body */}
            <div style={{ padding: "20px", fontSize: "0.9375rem", color: BS.body, flex: 1, overflowY: isScrollable ? "auto" : undefined }}>
              {hasBodySlot ? (
                renderChildren ?? (hasSlotChildren ? slotChildren.body : null)
              ) : (
                String(p.text || "").replace(/\\n/g, "\n")
              )}
            </div>
            {/* Footer */}
            {(p.showCloseButton || p.showPrimaryButton || hasFooterChildren || dragging) && (
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${BS.borderColor}`, display: "flex", justifyContent: "flex-end", gap: "8px", flexWrap: "wrap" }}>
              {hasFooterChildren ? (
                slotChildren?.footer
              ) : (
                <>
                  {p.showCloseButton && (
                    <button style={{
                      ...getButtonStyle(String(p.closeButtonStyle || "secondary"), String(p.closeButtonStyle || "").startsWith("outline-")),
                      padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5,
                    }}>{p.closeButtonText || "Close"}</button>
                  )}
                  {p.showPrimaryButton && (
                    <button style={{
                      ...getButtonStyle(String(p.primaryButtonStyle || "primary"), String(p.primaryButtonStyle || "").startsWith("outline-")),
                      padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5,
                    }}>{p.footer || "Save Changes"}</button>
                  )}
                  {slotChildren?.footer}
                </>
              )}
            </div>
            )}
          </div>
        </Wrapper>
      );
    }

    case "form-builder": {
      let formFields: Array<Record<string, any>> = [];
      try {
        formFields = JSON.parse(String(p.fields || "[]"));
      } catch {
        formFields = [];
      }
      const layout = String(p.layout || "stacked");
      const submitVariant = String(p.submitVariant || "primary");
      const isSubmitOutline = submitVariant.startsWith("outline-");
      const submitBaseVariant = isSubmitOutline ? submitVariant.replace("outline-", "") : submitVariant;
      const submitBtnStyle = getButtonStyle(submitBaseVariant, isSubmitOutline);
      const isInline = layout === "inline";

      const renderFormField = (field: Record<string, any>, idx: number) => {
        const fieldLabel = String(field.label || "");
        const fieldType = String(field.type || "input");
        const isCheckLike = fieldType === "checkbox" || fieldType === "switch" || fieldType === "radio";
        const fieldMargin = isInline ? "0 8px 0 0" : "0 0 12px 0";
        const displayStyle = isInline ? "inline-flex" : "flex";

        // Horizontal layout wrapper for non-check fields
        const horizontalWrapper = (labelEl: React.ReactNode, controlEl: React.ReactNode) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "12px", gap: "12px" }}>
            <label style={{ width: "120px", flexShrink: 0, fontWeight: 500, fontSize: "0.9rem", color: BS.body, marginBottom: 0 }}>
              {fieldLabel}{field.required && <span style={{ color: BS.danger, marginLeft: "2px" }}>*</span>}
            </label>
            <div style={{ flex: 1 }}>{controlEl}</div>
          </div>
        );

        const controlBaseStyle: React.CSSProperties = {
          width: "100%",
          padding: "8px 12px",
          fontSize: "1rem",
          border: `1px solid ${BS.borderColor}`,
          borderRadius: "6px",
          background: BS.white,
          boxSizing: "border-box",
          outline: "none",
        };

        if (isCheckLike) {
          if (fieldType === "switch") {
            return (
              <div key={idx} style={{ marginBottom: fieldMargin }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <div style={{ position: "relative", width: "44px", height: "24px", background: field.checked ? BS.primary : BS.secondary, borderRadius: "24px", transition: "background 0.2s", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: "2px", left: field.checked ? "22px" : "2px", width: "20px", height: "20px", background: BS.white, borderRadius: "50%", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                  <span style={{ fontSize: "1rem", color: BS.body }}>{fieldLabel}</span>
                </label>
              </div>
            );
          }
          if (fieldType === "checkbox") {
            return (
              <div key={idx} style={{ marginBottom: fieldMargin }}>
                <label style={{ display: displayStyle, alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" defaultChecked={!!field.checked} disabled={!!field.disabled} style={{ width: "18px", height: "18px", accentColor: BS.primary }} />
                  <span style={{ fontSize: "1rem", color: BS.body }}>{fieldLabel}</span>
                </label>
              </div>
            );
          }
          if (fieldType === "radio") {
            const radioOptions: Array<{ label: string; value: string }> = Array.isArray(field.options) ? field.options : [];
            return (
              <div key={idx} style={{ marginBottom: fieldMargin }}>
                {fieldLabel && <span style={{ fontWeight: 500, fontSize: "0.9rem", color: BS.body, display: "block", marginBottom: "4px" }}>{fieldLabel}{field.required && <span style={{ color: BS.danger, marginLeft: "2px" }}>*</span>}</span>}
                {radioOptions.map((opt, ri) => (
                  <label key={ri} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "4px" }}>
                    <input type="radio" name={field.name || `fb-radio-${idx}`} defaultChecked={!!opt.checked} disabled={!!field.disabled} style={{ width: "18px", height: "18px", accentColor: BS.primary }} />
                    <span style={{ fontSize: "1rem", color: BS.body }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            );
          }
        }

        if (fieldType === "input" || fieldType === "file") {
          const inputEl = (
            <input
              type={String(field.inputType || (fieldType === "file" ? "file" : "text"))}
              placeholder={String(field.placeholder || "")}
              readOnly
              disabled={!!field.disabled}
              required={!!field.required}
              style={fieldType === "file" ? { fontSize: "0.875rem", color: BS.body } : controlBaseStyle}
            />
          );
          if (layout === "horizontal") {
            return horizontalWrapper(null, inputEl);
          }
          return (
            <div key={idx} style={{ marginBottom: fieldMargin, display: displayStyle, flexDirection: "column", gap: "4px" }}>
              {fieldLabel && <label style={{ fontWeight: 500, fontSize: "0.9rem", color: BS.body, marginBottom: 0, whiteSpace: "nowrap" }}>{fieldLabel}{field.required && <span style={{ color: BS.danger, marginLeft: "2px" }}>*</span>}</label>}
              {inputEl}
            </div>
          );
        }

        if (fieldType === "textarea") {
          const taEl = (
            <textarea
              placeholder={String(field.placeholder || "")}
              readOnly
              rows={Number(field.rows) || 3}
              disabled={!!field.disabled}
              required={!!field.required}
              style={{ ...controlBaseStyle, resize: "vertical" }}
            />
          );
          if (layout === "horizontal") {
            return horizontalWrapper(null, taEl);
          }
          return (
            <div key={idx} style={{ marginBottom: fieldMargin, display: displayStyle, flexDirection: "column", gap: "4px" }}>
              {fieldLabel && <label style={{ fontWeight: 500, fontSize: "0.9rem", color: BS.body, marginBottom: 0, whiteSpace: "nowrap" }}>{fieldLabel}{field.required && <span style={{ color: BS.danger, marginLeft: "2px" }}>*</span>}</label>}
              {taEl}
            </div>
          );
        }

        if (fieldType === "select") {
          const selectOptions: Array<{ label: string; value: string }> = Array.isArray(field.options) ? field.options : [];
          const selEl = (
            <select disabled={!!field.disabled} required={!!field.required} defaultValue="" style={controlBaseStyle}>
              <option value="" disabled>{String(field.placeholder || "Scegli...")}</option>
              {selectOptions.map((opt, oi) => (
                <option key={oi} value={opt.value || opt.label}>{opt.label}</option>
              ))}
            </select>
          );
          if (layout === "horizontal") {
            return horizontalWrapper(null, selEl);
          }
          return (
            <div key={idx} style={{ marginBottom: fieldMargin, display: displayStyle, flexDirection: "column", gap: "4px" }}>
              {fieldLabel && <label style={{ fontWeight: 500, fontSize: "0.9rem", color: BS.body, marginBottom: 0, whiteSpace: "nowrap" }}>{fieldLabel}{field.required && <span style={{ color: BS.danger, marginLeft: "2px" }}>*</span>}</label>}
              {selEl}
            </div>
          );
        }

        if (fieldType === "range") {
          const rangeEl = (
            <input type="range" min={Number(field.min) || 0} max={Number(field.max) || 100} step={Number(field.step) || 1} defaultValue={Number(field.defaultValue) || 50} disabled={!!field.disabled} style={{ width: "100%", accentColor: BS.primary }} />
          );
          if (layout === "horizontal") {
            return horizontalWrapper(null, rangeEl);
          }
          return (
            <div key={idx} style={{ marginBottom: fieldMargin, display: displayStyle, flexDirection: "column", gap: "4px" }}>
              {fieldLabel && <label style={{ fontWeight: 500, fontSize: "0.9rem", color: BS.body, marginBottom: 0, whiteSpace: "nowrap" }}>{fieldLabel}</label>}
              {rangeEl}
            </div>
          );
        }

        return null;
      };

      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
          <div style={{
            display: isInline ? "inline-flex" : "flex",
            flexDirection: isInline ? "row" : "column",
            flexWrap: isInline ? "wrap" : "nowrap",
            alignItems: isInline ? "center" : "stretch",
            gap: isInline ? "8px" : "0",
          }}>
            {formFields.map((field, idx) => renderFormField(field, idx))}
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center" }}>
            <button type="button" style={{ ...submitBtnStyle, padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "1rem", fontWeight: 400 }}>
              {p.submitText || "Invia"}
            </button>
            {p.showReset && (
              <button type="button" style={{ ...getButtonStyle("secondary", false), padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "1rem", fontWeight: 400 }}>
                Reset
              </button>
            )}
          </div>
        </Wrapper>
      );
    }

    case "offcanvas": {
      const placement = String(p.placement || "start");
      const isVertical = placement === "start" || placement === "end";
      const width = isVertical ? "350px" : "100%";
      const height = isVertical ? "100%" : "250px";
      const hasSlotChildren = slotChildren && Object.keys(slotChildren).length > 0;
      const hasDirectChildren = component.children && component.children.length > 0;
      const hasHeaderChildren = component.children?.some(c => c.slot === "header") || false;
      const hasBodySlot = renderChildren || hasDirectChildren || (hasSlotChildren && slotChildren.body);

      return (
        <Wrapper customClass={customClass} style={{ padding: "0" }}>
          <div style={{
            width, height, maxWidth: isVertical ? "80vw" : undefined, maxHeight: isVertical ? undefined : "50vh",
            border: `1px solid ${BS.borderColor}`,
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)", background: BS.white,
            borderRadius: isVertical ? "0 8px 8px 0" : "0 0 8px 8px",
            overflow: "hidden", display: "flex", flexDirection: "column",
            ...(p.backdrop ? { position: "relative" } : {}),
          }}>
            {/* Header */}
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BS.borderColor}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", minHeight: "24px" }}>
              <div style={{ flex: 1 }}>
                {hasHeaderChildren ? (
                  slotChildren?.header
                ) : (
                  <>
                    <h5 style={{ fontWeight: 600, fontSize: "1.1rem", margin: 0 }}>{p.title || "Offcanvas"}</h5>
                    {slotChildren?.header}
                  </>
                )}
              </div>
              <button style={{ background: "transparent", border: "none", width: "32px", height: "32px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#6c757d"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>
              </button>
            </div>
            {/* Body */}
            <div style={{ padding: "16px", flex: 1, overflowY: "auto" }}>
              {hasBodySlot ? (
                renderChildren ?? (hasSlotChildren ? slotChildren.body : null)
              ) : (
                String(p.text || "").replace(/\\n/g, "\n")
              )}
            </div>
          </div>
          {p.backdrop && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.1)", borderRadius: "8px", marginTop: "-4px", pointerEvents: "none" }} />
          )}
        </Wrapper>
      );
    }

    case "link": {
      const linkColor = BS_TEXT[String(p.variant)] || BS.primary;
      const linkSize: Record<string, string> = { "": "1rem", sm: "0.875rem", lg: "1.25rem" };
      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
          <a
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

    case "collapse": {
      const variant = String(p.variant || "");
      const isShown = !!p.show;
      const btnBgMap: Record<string, string> = { "": BS.secondary, primary: BS.primary, secondary: BS.secondary };
      const btnBg = btnBgMap[variant] || BS.secondary;
      const isDarkBtn = variant === "primary" || variant === "secondary";
      return (
        <Wrapper customClass={customClass} style={{ padding: "0" }}>
          <div style={{
            border: p.bordered ? `1px solid ${BS.borderColor}` : "none",
            borderRadius: "8px",
            overflow: "hidden",
          }}>
            <button style={{
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
            <div style={{
              padding: isShown ? "16px" : "0 16px",
              maxHeight: isShown ? "500px" : "0",
              overflow: "hidden",
              transition: "all 0.2s ease",
              fontSize: "0.9375rem", lineHeight: 1.6, color: BS.body,
              background: BS.white,
            }}>
              {p.body || "This is the collapsible content."}
            </div>
          </div>
        </Wrapper>
      );
    }

    case "tab-content": {
      const rawItems = String(p.items || "").split("\n").filter(Boolean);
      const items = rawItems.map((item) => {
        const parts = item.split("|");
        return { label: parts[0] || "Tab", content: parts[1] || "" };
      });
      const active = Number(p.active) || 0;
      const style = String(p.style || "tabs");

      // Check if any tab has slotted children
      const hasSlotChildren = slotChildren && Object.keys(slotChildren).length > 0;
      const hasDirectChildren = component.children && component.children.length > 0;

      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
          {/* Tab navigation */}
          <div style={{
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
          {/* Tab panes — show slotted children or static content */}
          <div style={{
            marginTop: "12px",
            padding: "16px",
            background: BS.light,
            borderRadius: style === "pills" ? "8px" : "0 0 8px 8px",
            minHeight: "60px",
          }}>
            {/* Render each tab's slot content (only active tab visible in Canvas via display:none) */}
            {hasDirectChildren && items.map((_, tabIndex) => {
              const slotKey = `tab-${tabIndex}`;
              return <React.Fragment key={slotKey}>{slotChildren?.[slotKey] || null}</React.Fragment>;
            })}
            {/* Fallback: if no children, show static text content */}
            {(!hasDirectChildren) && active >= 0 && active < items.length && (
              <div style={{ fontSize: "0.9375rem", color: BS.body }}>
                {items[active].content}
              </div>
            )}
          </div>
        </Wrapper>
      );
    }

    // ── TABLES ──
    case "table": {
      const headers = String(p.headers || "").split("|").map(h => h.trim()).filter(Boolean);

      return (
        <Wrapper customClass={customClass} style={{ padding: "0" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%", borderCollapse: "collapse", fontSize: "0.9375rem",
              ...(p.bordered ? {
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: p.borderColor ? BS[String(p.borderColor)] : BS.borderColor,
              } : {}),
            }}>
              <thead>
                <tr style={{
                  background: BS.light, borderBottom: `2px solid ${BS.borderColor}`,
                }}>
                  {headers.map((h, i) => (
                    <th key={i} style={{
                      padding: p.condensed ? "6px 12px" : "12px 16px",
                      ...(p.bordered ? {
                        borderTopWidth: "1px",
                        borderTopStyle: "solid",
                        borderLeftWidth: "1px",
                        borderLeftStyle: "solid",
                        borderRightWidth: "1px",
                        borderRightStyle: "solid",
                      } : {}),
                      borderBottomWidth: "2px",
                      borderBottomStyle: "solid",
                      borderBottomColor: BS.borderColor,
                      fontWeight: 600, textAlign: "left", color: BS.body,
                      borderColor: p.borderColor ? BS[String(p.borderColor)] : (p.bordered ? BS.borderColor : undefined),
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderChildren ?? null}
              </tbody>
            </table>
          </div>
        </Wrapper>
      );
    }

    case "table-row": {
      // The CanvasItem wrapper has display:table-row, so we just pass through children
      return <>{renderChildren ?? null}</>;
    }

    case "table-cell": {
      // The CanvasItem wrapper has display:table-cell, so we just pass through children
      // If cell has no children and has text, show the text directly
      const cellText = String(p.text || "");
      const hasCellChildren = component.children && component.children.length > 0;
      return <>{hasCellChildren ? (renderChildren ?? null) : cellText}</>;
    }

    // ── IMAGES ──
    case "image": {
      const roundedMap: Record<string, string> = {
        "": "0", rounded: "8px", circle: "50%", thumbnail: "4px",
      };
      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
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
        <Wrapper customClass={customClass} style={{ padding: "4px", display: "flex", justifyContent: p.alignment === "center" ? "center" : p.alignment === "end" ? "flex-end" : "flex-start" }}>
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

    case "icon": {
      const iconName = String(p.name || "bi-house");
      const iconSize = Number(p.size) || 16;
      const iconColor = BS_TEXT[String(p.color)] || BS.body;
      return (
        <Wrapper customClass={customClass} style={{ padding: "4px", display: "inline-block" }}>
          <i
            className={`bi ${iconName}`}
            style={{
              fontSize: `${iconSize}px`,
              color: iconColor,
              lineHeight: 1,
              display: "inline-block",
            }}
          />
        </Wrapper>
      );
    }

    // ── UTILITIES ──
    case "divider": {
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

    case "spacer": {
      const height = spacing(String(p.size || "4"));
      return (
        <Wrapper customClass={customClass} style={{ padding: "4px" }}>
          <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "11px", color: BS.muted, opacity: 0.5 }}>Spacer ({p.size})</span>
          </div>
        </Wrapper>
      );
    }

    case "embed-video": {
      const ratioMap: Record<string, string> = { "21x9": "42.86%", "16x9": "56.25%", "4:3": "75%", "1x1": "100%" };
      return (
        <Wrapper customClass={customClass} style={{ padding: "0" }}>
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

    case "tooltip": {
      const placement = String(p.placement || "top");
      const isDark = p.variant === "dark" || !p.variant;
      return (
        <Wrapper customClass={customClass} style={{ padding: "8px 4px" }}>
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "8px", position: "relative" }}>
            {/* Tooltip indicator */}
            <div style={{
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
            {/* Trigger button */}
            <button style={{
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

    case "popover": {
      const placement = String(p.placement || "top");
      return (
        <Wrapper customClass={customClass} style={{ padding: "8px 4px" }}>
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            {/* Popover preview card */}
            <div style={{
              width: "240px",
              border: `1px solid ${BS.borderColor}`,
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              background: BS.white,
              overflow: "hidden",
            }}>
              {p.title && (
                <div style={{
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
              <div style={{
                padding: "10px 14px",
                fontSize: "0.875rem",
                color: BS.muted,
              }}>
                {p.body || "Popover body content"}
              </div>
            </div>
            {/* Trigger button */}
            <button style={{
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

    default:
      return (
        <Wrapper customClass={customClass} style={{ padding: "8px" }}>
          <div style={{ color: BS.muted, fontSize: "0.875rem" }}>Unknown: {type}</div>
        </Wrapper>
      );
  }
}

// ── Helper functions ──

function getButtonStyle(variant: string, isOutline: boolean): React.CSSProperties {
  if (isOutline) {
    // Strip "outline-" prefix if present (e.g. "outline-danger" -> "danger")
    const baseVariant = variant.startsWith("outline-") ? variant.replace("outline-", "") : variant;
    const colorMap: Record<string, string> = {
      primary: BS.primary, secondary: BS.secondary, success: BS.success,
      danger: BS.danger, warning: BS.warning, info: BS.info,
    };
    const color = colorMap[baseVariant] || BS.primary;
    return {
      background: "transparent",
      color,
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: color,
    };
  }

  const styles: Record<string, React.CSSProperties> = {
    primary: { background: BS.primary, color: BS.white, borderWidth: "1px", borderStyle: "solid", borderColor: BS.primary },
    secondary: { background: BS.secondary, color: BS.white, borderWidth: "1px", borderStyle: "solid", borderColor: BS.secondary },
    success: { background: BS.success, color: BS.white, borderWidth: "1px", borderStyle: "solid", borderColor: BS.success },
    danger: { background: BS.danger, color: BS.white, borderWidth: "1px", borderStyle: "solid", borderColor: BS.danger },
    warning: { background: BS.warning, color: BS.dark, borderWidth: "1px", borderStyle: "solid", borderColor: BS.warning },
    info: { background: BS.info, color: BS.dark, borderWidth: "1px", borderStyle: "solid", borderColor: BS.info },
    light: { background: BS.light, color: BS.dark, borderWidth: "1px", borderStyle: "solid", borderColor: BS.borderColor },
    dark: { background: BS.dark, color: BS.white, borderWidth: "1px", borderStyle: "solid", borderColor: BS.dark },
    link: { background: "transparent", color: BS.primary, borderWidth: "0", borderStyle: "none", textDecoration: "underline" },
  };
  return styles[variant] || styles.primary;
}

function pageBtnStyle(active: boolean, scale: number = 1): React.CSSProperties {
  return {
    padding: `${6 * scale}px ${12 * scale}px`,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: active ? BS.primary : BS.borderColor,
    background: active ? BS.primary : BS.white, color: active ? BS.white : BS.primary,
    borderRadius: "6px", cursor: "pointer", fontSize: `${0.875 * scale}rem`, fontWeight: 400,
  };
}
