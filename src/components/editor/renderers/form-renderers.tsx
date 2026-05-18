import React from "react";
import { CanvasComponent } from "@/lib/editor/types";
import { registerRenderer } from "./registry";
import { BS, Wrapper } from "./shared";

// ── Input ──
function renderInput(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const inputSize: Record<string, string> = { "sm": "0.75rem", "": "1rem", "lg": "1.25rem" };
  const inputPadding: Record<string, string> = { "sm": "4px 8px", "": "8px 12px", "lg": "12px 16px" };
  const sz = String(p.size || "");
  const isCurrency = String(p.type || "") === "currency";

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
            data-prop="text"
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
          <label data-prop="label" style={{
            position: "absolute", top: "6px", left: "12px", fontSize: "0.75rem",
            color: BS.muted, pointerEvents: "none",
          }}>
            {p.label}
          </label>
        </div>
        {p.helpText && <div data-prop="helpText" style={{ fontSize: "0.875rem", color: BS.muted, marginTop: "4px" }}>{p.helpText}</div>}
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
      {p.label && <label data-prop="label" style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "0.9rem", color: BS.body }}>{p.label}{p.required && <span style={{ color: BS.danger, marginLeft: "2px" }}>*</span>}</label>}
      <input
        data-prop="text"
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
      {p.helpText && <div data-prop="helpText" style={{ fontSize: "0.875rem", color: BS.muted, marginTop: "4px" }}>{p.helpText}</div>}
      {p.validation && p.validation !== "none" && (
        <div style={{ fontSize: "0.875rem", marginTop: "4px", color: p.validation === "valid" ? BS.success : BS.danger }}>
          {p.feedbackMessage || (p.validation === "valid" ? "Looks good!" : "Please correct this field.")}
        </div>
      )}
    </Wrapper>
  );
}

// ── Textarea ──
function renderTextarea(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const sz = String(p.size || "");
  const taKey = component.id + "-" + String(p.text || "");
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      {p.label && <label data-prop="label" style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "0.9rem" }}>{p.label}</label>}
      <textarea
        data-prop="text"
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
      {p.helpText && <div data-prop="helpText" style={{ fontSize: "0.875rem", color: BS.muted, marginTop: "4px" }}>{p.helpText}</div>}
      {p.validation && p.validation !== "none" && (
        <div style={{ fontSize: "0.875rem", marginTop: "4px", color: p.validation === "valid" ? BS.success : BS.danger }}>
          {p.feedbackMessage || (p.validation === "valid" ? "Looks good!" : "Please correct this field.")}
        </div>
      )}
    </Wrapper>
  );
}

// ── Select Input ──
function renderSelectInput(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const selectSize = String(p.size || "");
  const isSmall = selectSize === "sm";
  const isLarge = selectSize === "lg";
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      {p.label && <label data-prop="label" style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "0.9rem" }}>{p.label}</label>}
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

// ── Checkbox ──
function renderCheckbox(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      <label style={{ display: !!p.inline ? "inline-flex" : "flex", alignItems: "center", gap: "8px", cursor: p.disabled ? "not-allowed" : "pointer", opacity: p.disabled ? 0.65 : 1, flexDirection: p.reverse ? "row-reverse" : "row" }}>
        <input type="checkbox" defaultChecked={!!p.checked} disabled={!!p.disabled}
          style={{ width: "18px", height: "18px", accentColor: BS.primary, cursor: "inherit" }} />
        <span data-prop="label" style={{ fontSize: "1rem", color: BS.body }}>{p.label}</span>
      </label>
    </Wrapper>
  );
}

// ── Radio ──
function renderRadio(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      <label style={{ display: !!p.inline ? "inline-flex" : "flex", alignItems: "center", gap: "8px", cursor: p.disabled ? "not-allowed" : "pointer", opacity: p.disabled ? 0.65 : 1 }}>
        <input type="radio" name={String(p.name)} defaultChecked={!!p.checked} disabled={!!p.disabled}
          style={{ width: "18px", height: "18px", accentColor: BS.primary, cursor: "inherit" }} />
        <span data-prop="label" style={{ fontSize: "1rem", color: BS.body }}>{p.label}</span>
      </label>
    </Wrapper>
  );
}

// ── Range ──
function renderRange(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      {p.label && <label data-prop="label" style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "0.9rem" }}>{p.label}</label>}
      <input
        type="range" min={Number(p.min)} max={Number(p.max)} step={Number(p.step)}
        defaultValue={Number(p.defaultValue)} disabled={!!p.disabled}
        style={{ width: "100%", accentColor: BS.primary }}
      />
    </Wrapper>
  );
}

// ── Switch ──
function renderSwitch(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
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
        <span data-prop="label" style={{ fontSize: "1rem", color: BS.body }}>{p.label}</span>
      </label>
    </Wrapper>
  );
}

// ── File Input ──
function renderFileInput(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const fSize = String(p.size || "");
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      {p.label && <label data-prop="label" style={{ display: "block", marginBottom: "4px", fontWeight: 500, fontSize: "0.9rem" }}>{p.label}</label>}
      <input type="file" disabled={!!p.disabled}
        style={{ fontSize: fSize === "sm" ? "0.8rem" : fSize === "lg" ? "1.05rem" : "0.875rem", color: BS.body }} />
      {p.helpText && <div data-prop="helpText" style={{ fontSize: "0.875rem", color: BS.muted, marginTop: "4px" }}>{p.helpText}</div>}
    </Wrapper>
  );
}

// ── Input Group ──
function renderInputGroup(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const igSize = String(p.size || "");
  const igPad = igSize === "sm" ? "4px 8px" : igSize === "lg" ? "10px 14px" : "8px 12px";
  const igFontSize = igSize === "sm" ? "0.875rem" : igSize === "lg" ? "1.25rem" : "1rem";
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {p.prepend && (
          <span data-prop="prepend" style={{ display: "flex", alignItems: "center", padding: igPad, background: BS.light, borderWidth: "1px", borderStyle: "solid", borderColor: BS.borderColor, borderRightStyle: "none", borderRadius: "6px 0 0 6px", fontSize: igFontSize, color: BS.body, minWidth: "40px", justifyContent: "center" }}>
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
          <span data-prop="append" style={{ display: "flex", alignItems: "center", padding: igPad, background: BS.light, borderWidth: "1px", borderStyle: "solid", borderColor: BS.borderColor, borderLeftStyle: "none", borderRadius: "0 6px 6px 0", fontSize: igFontSize, color: BS.body, minWidth: "40px", justifyContent: "center" }}>
            {p.append}
          </span>
        )}
      </div>
    </Wrapper>
  );
}

// ── Register all form renderers ──
registerRenderer("input", renderInput);
registerRenderer("textarea", renderTextarea);
registerRenderer("select-input", renderSelectInput);
registerRenderer("checkbox", renderCheckbox);
registerRenderer("radio", renderRadio);
registerRenderer("range", renderRange);
registerRenderer("switch", renderSwitch);
registerRenderer("file-input", renderFileInput);
registerRenderer("input-group", renderInputGroup);
