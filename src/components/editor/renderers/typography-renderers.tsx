import React from "react";
import { CanvasComponent } from "@/lib/editor/types";
import { registerRenderer } from "./registry";
import { BS, BS_BG, BS_TEXT, buildPaddingStyle, Wrapper } from "./shared";

// ── Heading ──
function renderHeading(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const level = Number(p.level) || 2;
  const sizes: Record<number, string> = { 1: "2.5rem", 2: "2rem", 3: "1.75rem", 4: "1.5rem", 5: "1.25rem", 6: "1rem" };
  const displaySizes: Record<string, string> = { "1": "5rem", "2": "4.5rem", "3": "4rem", "4": "3.5rem", "5": "3rem", "6": "2.5rem" };
  const isDisplay = !!p.displayClass;
  return (
    <Wrapper customClass={customClass} style={{ padding: "8px 4px" }}>
      <div data-prop="text" style={{
        fontSize: isDisplay ? (displaySizes[String(p.displayClass)] || "2rem") : (sizes[level] || "2rem"),
        fontWeight: isDisplay ? 300 : 700,
        lineHeight: 1.2,
        color: BS_TEXT[String(p.textColor)] || BS.body,
        textAlign: String(p.textAlign) as React.CSSProperties["textAlign"],
        fontStyle: String(p.textClass)?.includes("italic") ? "italic" : undefined,
        textDecoration: String(p.textClass)?.includes("underline") ? "underline" : undefined,
        textTransform: String(p.textClass)?.includes("uppercase") ? "uppercase" : String(p.textClass)?.includes("lowercase") ? "lowercase" : String(p.textClass)?.includes("capitalize") ? "capitalize" : undefined,
      }}>
        {p.text || "Heading"}
      </div>
    </Wrapper>
  );
}

// ── Paragraph ──
function renderParagraph(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const pBg = BS_BG[String(p.bgColor)];
  const isDarkBg = ["primary", "secondary", "success", "danger", "info", "dark"].includes(String(p.bgColor));
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      <p data-prop="text" style={{
        fontSize: p.textSize === "fs-6" ? "1rem" : p.textSize === "fs-4" ? "1.5rem" : p.textSize === "fs-2" ? "2rem" : "1rem",
        fontWeight: p.lead ? 300 : 400,
        lineHeight: p.lead ? 1.7 : 1.6,
        color: isDarkBg ? BS.white : (BS_TEXT[String(p.textColor)] || BS.body),
        textAlign: String(p.textAlign) as React.CSSProperties["textAlign"],
        margin: 0,
        background: pBg || "transparent",
        padding: buildPaddingStyle(p, "2"),
        borderRadius: String(p.borderRadius || "0"),
      }}>
        {p.text || "Paragraph text"}
      </p>
    </Wrapper>
  );
}

// ── Blockquote ──
function renderBlockquote(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      <blockquote style={{
        borderLeft: `4px solid ${p.borderColor ? BS[String(p.borderColor)] || BS.secondary : BS.gray}`,
        paddingLeft: "16px",
        margin: 0,
        color: BS.muted,
        textAlign: String(p.alignment) as React.CSSProperties["textAlign"],
      }}>
        <p data-prop="text" style={{ fontSize: "1.25rem", fontStyle: "italic", margin: 0 }}>{p.text || "Quote text"}</p>
        {p.attribution && (
          <footer data-prop="attribution" style={{ marginTop: "8px", fontSize: "0.875rem", color: BS.muted }}>
            — {p.attribution}
          </footer>
        )}
      </blockquote>
    </Wrapper>
  );
}

// ── List ──
function renderList(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const items = String(p.items || "").split("\n").filter(Boolean);
  const Tag = p.listType === "ordered" ? "ol" : "ul";
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px 4px 4px 20px" }}>
      <Tag data-prop="items" style={{
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

// ── Code Block ──
function renderCodeBlock(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px" }}>
      {p.inline ? (
        <code data-prop="code" style={{ background: "#e9ecef", padding: "2px 6px", borderRadius: "4px", fontSize: "0.875em", fontFamily: "monospace" }}>
          {p.code}
        </code>
      ) : (
        <pre data-prop="code" style={{
          background: BS.dark, color: BS.light, padding: "16px", borderRadius: "8px", fontSize: "0.875rem",
          fontFamily: "monospace", overflow: "auto", margin: 0, border: `1px solid ${BS.borderColor}`,
        }}>
          <code>{p.code}</code>
        </pre>
      )}
    </Wrapper>
  );
}

// ── Register all typography renderers ──
registerRenderer("heading", renderHeading);
registerRenderer("paragraph", renderParagraph);
registerRenderer("blockquote", renderBlockquote);
registerRenderer("list", renderList);
registerRenderer("code-block", renderCodeBlock);
