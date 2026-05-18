import React from "react";
import { CanvasComponent } from "@/lib/editor/types";
import { registerRenderer } from "./registry";
import { BS, BS_BG, BS_TEXT, Wrapper, getButtonStyle } from "./shared";

// ── Card ──
function renderCard(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
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
        textAlign: String(p.textAlign) as React.CSSProperties["textAlign"],
      }}>
        {p.imgSrc && (
          <img src={String(p.imgSrc)} alt="" style={{ width: "100%", height: "180px", objectFit: "cover" }} />
        )}
        {showHeader && (
          <div data-prop="header" style={{
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
        <div style={{ padding: "20px" }}>
          {hasBodySlot ? (
            renderChildren ?? (hasSlotChildren ? slotChildren.body : null)
          ) : (
            <>
              {p.title && <h5 data-prop="title" style={{ fontWeight: 600, marginBottom: "8px", fontSize: "1.25rem" }}>{p.title}</h5>}
              {p.subtitle && <h6 data-prop="subtitle" style={{ fontSize: "0.875rem", color: BS.muted, marginBottom: "12px", fontWeight: 400 }}>{p.subtitle}</h6>}
              {p.text && <p data-prop="text" style={{ fontSize: "0.9375rem", lineHeight: 1.6, margin: 0 }}>{String(p.text).replace(/\\n/g, "\n")}</p>}
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
        {(p.footer || hasFooterChildren || dragging) && (
          <div data-prop="footer" style={{
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

// ── Alert ──
function renderAlert(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
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
        {p.heading && <h4 data-prop="heading" style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "8px" }}>{p.heading}</h4>}
        <div data-prop="text" style={{ fontSize: "0.9375rem" }}>{p.text}</div>
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

// ── Badge ──
function renderBadge(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const badgeColor = BS[String(p.variant)] || BS.primary;
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px", display: "inline-block" }}>
      <span data-prop="text" style={{
        display: "inline-block", padding: "4px 10px", background: badgeColor,
        color: BS.white, borderRadius: p.pill ? "20px" : "4px",
        fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.4,
      }}>
        {p.text || "Badge"}
      </span>
    </Wrapper>
  );
}

// ── Progress ──
function renderProgress(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
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

// ── Accordion ──
function renderAccordion(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const rawItems = String(p.items || "").split("\n").filter(Boolean);
  const items = rawItems.map((item) => {
    const parts = item.split("|");
    return { title: parts[0] || "Item", body: parts[1] || "" };
  });
  const isFlush = !!p.flush;

  return (
    <Wrapper customClass={customClass} style={{ padding: "0" }}>
      <div data-prop="items" style={{ borderRadius: isFlush ? "0" : "8px", overflow: "hidden", border: isFlush ? "none" : `1px solid ${BS.borderColor}` }}>
        {items.map((item, i) => {
          const accSlotKey = `acc-${i}`;
          const slotContent = slotChildren?.[accSlotKey];
          const hasSlotContent = slotContent !== undefined && slotContent !== null;

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
                    {hasSlotContent ? slotContent : <div dangerouslySetInnerHTML={{ __html: item.body }} />}
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

// ── Spinner ──
function renderSpinner(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
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

// ── List Group ──
function renderListGroup(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const items = String(p.items || "").split("\n").filter(Boolean);
  const numbered = !!p.numbered;
  const flush = !!p.flush;

  return (
    <Wrapper customClass={customClass} style={{ padding: "0" }}>
      <div data-prop="items" style={{ borderRadius: flush ? 0 : "8px", overflow: "hidden", border: flush ? "none" : `1px solid ${BS.borderColor}` }}>
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

// ── Toast ──
function renderToast(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
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
          <strong data-prop="title" style={{ fontSize: "0.9375rem" }}>{p.title}</strong>
          <span style={{ fontSize: "0.75rem", opacity: 0.85 }}>{p.time}</span>
        </div>
        <div data-prop="text" style={{ padding: "12px 16px", fontSize: "0.9375rem", color: BS.body }}>
          {p.text}
        </div>
      </div>
    </Wrapper>
  );
}

// ── Jumbotron ──
function renderJumbotron(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const bg = BS_BG[String(p.bgColor)] || BS.light;
  const isDark = ["dark", "primary", "secondary", "success", "danger", "info"].includes(String(p.bgColor));

  return (
    <Wrapper customClass={customClass} style={{ padding: "0" }}>
      <div style={{
        padding: "48px 32px", borderRadius: "12px", background: bg,
        textAlign: String(p.textAlign) as React.CSSProperties["textAlign"], color: isDark ? BS.white : BS.body,
      }}>
        <h1 data-prop="title" style={{ fontWeight: 600, fontSize: "2.75rem", marginBottom: "12px" }}>{p.title}</h1>
        <p data-prop="lead" style={{ fontSize: "1.2rem", fontWeight: 300, lineHeight: 1.6, opacity: isDark ? 0.85 : 1, margin: 0 }}>
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

// ── Carousel ──
function renderCarousel(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const slides = String(p.slides || "").split("\n").filter(Boolean);
  return (
    <Wrapper customClass={customClass} style={{ padding: "0" }}>
      <div data-prop="slides" style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${BS.borderColor}` }}>
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

// ── Modal ──
function renderModal(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
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
                <h5 data-prop="title" style={{ fontWeight: 600, fontSize: "1.1rem", margin: 0 }}>{p.title || "Modal"}</h5>
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
        <div data-prop="footer" style={{ padding: "12px 20px", borderTop: `1px solid ${BS.borderColor}`, display: hasFooterChildren ? "block" : "flex", justifyContent: hasFooterChildren ? undefined : "flex-end", gap: hasFooterChildren ? undefined : "8px", flexWrap: hasFooterChildren ? undefined : "wrap" }}>
          {hasFooterChildren ? (
            slotChildren?.footer
          ) : (
            <>
              {p.showCloseButton && (
                <button data-prop="closeButtonText" style={{
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

// ── Form Builder ──
function renderFormBuilder(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");

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

// ── Offcanvas ──
function renderOffcanvas(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  slotChildren?: Record<string, React.ReactNode>,
  isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
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
                <h5 data-prop="title" style={{ fontWeight: 600, fontSize: "1.1rem", margin: 0 }}>{p.title || "Offcanvas"}</h5>
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

// ── Register all content renderers ──
registerRenderer("card", renderCard);
registerRenderer("alert", renderAlert);
registerRenderer("badge", renderBadge);
registerRenderer("progress", renderProgress);
registerRenderer("accordion", renderAccordion);
registerRenderer("spinner", renderSpinner);
registerRenderer("list-group", renderListGroup);
registerRenderer("toast", renderToast);
registerRenderer("jumbotron", renderJumbotron);
registerRenderer("carousel", renderCarousel);
registerRenderer("modal", renderModal);
registerRenderer("form-builder", renderFormBuilder);
registerRenderer("offcanvas", renderOffcanvas);
