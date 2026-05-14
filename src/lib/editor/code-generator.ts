// Bootstrap GUI Editor - HTML Code Generator
import { CanvasComponent } from "./types";

// Bootstrap color map for CSS preview
export const BS_COLORS: Record<string, string> = {
  primary: "#0d6efd",
  secondary: "#6c757d",
  success: "#198754",
  danger: "#dc3545",
  warning: "#ffc107",
  info: "#0dcaf0",
  light: "#f8f9fa",
  dark: "#212529",
  white: "#ffffff",
  body: "#212529",
  muted: "#6c757d",
};

export const BS_BG_COLORS: Record<string, string> = {
  transparent: "transparent",
  primary: "#0d6efd",
  secondary: "#6c757d",
  success: "#198754",
  danger: "#dc3545",
  warning: "#ffc107",
  info: "#0dcaf0",
  light: "#f8f9fa",
  dark: "#212529",
  white: "#ffffff",
};

export const BS_TEXT_COLORS: Record<string, string> = {
  "": "#212529",
  primary: "#0d6efd",
  secondary: "#6c757d",
  success: "#198754",
  danger: "#dc3545",
  warning: "#ffc107",
  info: "#0dcaf0",
  muted: "#6c757d",
  white: "#ffffff",
  dark: "#212529",
};

function indent(str: string, level: number): string {
  const spaces = "  ".repeat(level);
  return str
    .split("\n")
    .map((line) => (line.trim() ? spaces + line : line))
    .join("\n");
}

function attrs(props: Record<string, string>): string {
  return Object.entries(props)
    .filter(([, v]) => v !== "" && v !== undefined)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");
}

function wrap(
  tag: string,
  classes: string,
  content: string,
  extraAttrs: Record<string, string> = {},
  inline: boolean = false,
  customClass?: string,
  hidden?: boolean
): string {
  let cls = classes;
  if (customClass) cls = cls ? `${cls} ${customClass}` : customClass;
  const clsAttr = cls ? ` class="${cls}"` : "";
  const extra = attrs(extraAttrs);
  if (hidden) {
    const styleAttr = extraAttrs.style ? `;${extraAttrs.style}` : "";
    const styleStr = ` style="display:none${styleAttr}"`;
    if (inline) {
      return `<${tag}${clsAttr}${styleStr}>${content}</${tag}>`;
    }
    return `<${tag}${clsAttr}${styleStr}>\n${content}\n</${tag}>`;
  }
  if (inline) {
    return `<${tag}${clsAttr}${extra}>${content}</${tag}>`;
  }
  return `<${tag}${clsAttr}${extra}>\n${content}\n</${tag}>`;
}

function generateChildrenHTML(component: CanvasComponent, indentLevel: number = 0, hiddenComponents?: Set<string>): string {
  if (!component.children || component.children.length === 0) return "";
  return component.children
    .map((child) => generateComponentHTML(child, indentLevel, hiddenComponents))
    .join("\n");
}

function generateComponentHTML(component: CanvasComponent, indentLevel: number = 0, hiddenComponents?: Set<string>): string {
  const { type, props, children } = component;
  const p = props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "").trim();
  const customId = String(p.customId || "").trim();
  const isHidden = hiddenComponents?.has(component.id);

  // Build extra attrs for customId (id attr handled via wrapExtraAttrs)
  const wrapExtraAttrs: Record<string, string> = {};
  if (customId) wrapExtraAttrs["id"] = customId;

  switch (type) {


    // ── LAYOUT ──
    case "container": {
      const fluid = p.fluid;
      let cls = "container";
      if (fluid === "fluid") cls = "container-fluid";
      else if (fluid !== "fixed") cls = `container-${fluid}`;

      if (p.bgColor && p.bgColor !== "transparent") cls += ` bg-${p.bgColor}`;
      if (p.padding && p.padding !== "0") cls += ` p-${p.padding}`;
      if (p.textColor && p.textColor !== "dark") cls += ` text-${p.textColor}`;
      if (p.textAlign && p.textAlign !== "start") cls += ` text-${p.textAlign}`;

      const content = generateChildrenHTML(component, indentLevel + 1, hiddenComponents) || "";
      return indent(wrap("div", cls, content, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "row": {
      let cls = "row";
      if (p.gutter && p.gutter !== "3") cls += ` g-${p.gutter}`;
      if (p.verticalAlign && p.verticalAlign !== "start")
        cls += ` align-items-${p.verticalAlign}`;
      const content = generateChildrenHTML(component, indentLevel + 1, hiddenComponents) || "";
      return indent(wrap("div", cls, content, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "col": {
      let cls = "col";
      const colSize = String(p.size || "12");
      if (colSize !== "12" && colSize !== "auto") cls += `-${colSize}`;
      if (colSize === "auto") cls += "-auto";
      if (p.bgColor && p.bgColor !== "transparent") cls += ` bg-${p.bgColor}`;
      if (p.textColor && p.textColor !== "dark") cls += ` text-${p.textColor}`;
      if (p.padding && p.padding !== "0") cls += ` p-${p.padding}`;
      if (p.textAlign && p.textAlign !== "start") cls += ` text-${p.textAlign}`;
      const content = generateChildrenHTML(component, indentLevel + 1, hiddenComponents) || "";
      return indent(wrap("div", cls, content, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    // ── TYPOGRAPHY ──
    case "heading": {
      const level = p.level || "2";
      const tag = `h${level}`;
      let cls = "";
      if (p.displayClass) cls = `display-${p.displayClass}`;
      if (p.textColor) cls += ` text-${p.textColor}`;
      if (p.textAlign && p.textAlign !== "start") cls += ` text-${p.textAlign}`;
      if (p.textClass) cls += ` ${p.textClass}`;
      cls = cls.trim();
      return indent(wrap(tag, cls, p.text as string, wrapExtraAttrs, true, customClass, isHidden), indentLevel);
    }

    case "paragraph": {
      let cls = "";
      if (p.lead) cls = "lead";
      if (p.textColor) cls += ` text-${p.textColor}`;
      if (p.textAlign && p.textAlign !== "start") cls += ` text-${p.textAlign}`;
      if (p.textSize && p.textSize !== "lead") cls += ` ${p.textSize}`;
      if (p.bgColor && p.bgColor !== "transparent") cls += ` bg-${p.bgColor}`;
      const pPad = String(p.padding || "0");
      if (pPad !== "0") cls += ` p-${pPad}`;
      const pRadius = String(p.borderRadius || "0");
      if (pRadius === "4px") cls += " rounded";
      else if (pRadius === "8px") cls += " rounded-3";
      else if (pRadius === "12px") cls += " rounded-4";
      else if (pRadius === "50px") cls += " rounded-pill";
      cls = cls.trim();
      const text = (p.text as string).replace(/\n/g, "<br>\n");
      return indent(wrap("p", cls, text, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "blockquote": {
      let cls = "blockquote";
      if (p.borderColor) cls += ` border-start border-${p.borderColor} ps-3`;
      if (p.alignment && p.alignment !== "start") cls += ` text-${p.alignment}`;
      let html = indent(wrap("p", "", p.text as string), indentLevel + 1);
      if (p.attribution) {
        html += "\n" + indent('<footer class="blockquote-footer mt-1">' + (p.attribution as string) + "</footer>", indentLevel + 1);
      }
      return indent(wrap("blockquote", cls, html, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "list": {
      const items = ((p.items as string) || "")
        .split("\n")
        .filter(Boolean)
        .map((item) => indent(`<li>${item}</li>`, indentLevel + 1))
        .join("\n");

      let tag = "ul";
      let cls = "";
      if (p.listType === "ordered") tag = "ol";
      else if (p.listType === "unstyled") cls = "list-unstyled";
      if (p.textColor) cls += ` text-${p.textColor}`;
      cls = cls.trim();
      return indent(wrap(tag, cls, items, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "code-block": {
      if (p.inline) {
        return indent(`<code>${p.code as string}</code>`, indentLevel);
      }
      let html = indent(`<code>${p.code as string}</code>`, indentLevel + 1);
      return indent(wrap("pre", "", html, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    // ── FORMS ──
    case "input": {
      let sizeCls = p.size ? `form-control${p.size !== "" ? ` form-control-${p.size}` : ""}` : "form-control";
      let inputCls = sizeCls;
      const extras: string[] = [];

      if (p.disabled) extras.push("disabled");
      if (p.readonly) extras.push("readonly");
      if (p.required) extras.push("required");
      if (p.text) extras.push('value="' + String(p.text) + '"');

      if (p.plaintext) inputCls = "form-control-plaintext";

      const label = p.label as string;
      const inputType = p.type as string;
      const isCurrency = inputType === "currency";

      // Helper: format number as Italian currency (1.234,56 €)
      const formatEuroForCode = (val: string | number | undefined) => {
        if (!val && val !== 0) return "";
        const raw = String(val).replace(/[^\d.,\-]/g, "").replace(/\./g, "").replace(",", ".");
        const num = parseFloat(raw);
        if (isNaN(num)) return "";
        return String(num.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })) + " €";
      };

      // For currency, override the value with formatted version
      const actualExtras = [...extras];
      if (isCurrency && p.text) {
        // Remove the raw value from extras, add formatted one
        const formatted = formatEuroForCode(p.text);
        const idx = actualExtras.indexOf('value="' + String(p.text) + '"');
        if (idx !== -1) actualExtras.splice(idx, 1);
        actualExtras.push('value="' + formatted + '"');
      }
      const finalExtras = actualExtras.join(" ");
      const htmlInputType = isCurrency ? "text" : inputType;
      const inputModeAttr = isCurrency ? " inputmode=\"decimal\"" : "";

      if (p.floating) {
        let html = indent(`<label for="floating${indentLevel}" class="form-label">${label}</label>`, indentLevel + 1);
        html = indent(`<input type="${htmlInputType}" class="form-control" id="floating${indentLevel}" placeholder="${p.placeholder || ""}"${inputModeAttr} ${finalExtras}>`) + "\n" + html;
        html = indent(wrap("div", "form-floating mb-3", html, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
        return html;
      }

      let html = "";
      if (label) {
        html += indent(`<label for="input${indentLevel}" class="form-label">${label}</label>\n`, indentLevel);
      }
      html += indent(
        `<input type="${htmlInputType}" class="${inputCls}" id="input${indentLevel}" placeholder="${p.placeholder || ""}"${inputModeAttr} ${finalExtras}>\n`,
        indentLevel
      );
      if (p.helpText) {
        html += indent(`<div id="help${indentLevel}" class="form-text">${p.helpText}</div>\n`, indentLevel);
      }
      return indent(wrap("div", "", html.trimEnd(), wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "textarea": {
      let sizeCls = p.size ? `form-control${p.size !== "" ? ` form-control-${p.size}` : ""}` : "form-control";
      const extras: string[] = [];
      if (p.disabled) extras.push("disabled");

      let html = "";
      if (p.label) {
        html += indent(`<label for="ta${indentLevel}" class="form-label">${p.label}</label>\n`, indentLevel);
      }
      html += indent(
        `<textarea class="${sizeCls}" id="ta${indentLevel}" rows="${p.rows || 3}" placeholder="${p.placeholder || ""}" ${extras.join(" ")}>${String(p.text || "")}</textarea>\n`,
        indentLevel
      );
      if (p.helpText) {
        html += indent(`<div class="form-text">${p.helpText}</div>\n`, indentLevel);
      }
      return indent(wrap("div", "", html.trimEnd(), wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "select-input": {
      let sizeCls = p.size ? `form-select${p.size !== "" ? ` form-select-${p.size}` : ""}` : "form-select";
      const extras: string[] = [];
      if (p.multiple) extras.push("multiple");
      if (p.disabled) extras.push("disabled");

      const options = ((p.options as string) || "")
        .split("\n")
        .filter(Boolean)
        .map((opt, i) => `  <option${i === 0 ? " selected" : ""}>${opt}</option>`)
        .join("\n");

      let html = "";
      if (p.label) {
        html += indent(`<label for="sel${indentLevel}" class="form-label">${p.label}</label>\n`, indentLevel);
      }
      html += indent(`<select class="${sizeCls}" id="sel${indentLevel}" ${extras.join(" ")}>\n${options}\n</select>`, indentLevel);
      return indent(wrap("div", "", html.trimEnd(), wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "checkbox": {
      let cls = "form-check";
      if (p.inline) cls += " form-check-inline";
      if (p.reverse) cls += " form-check-reverse";

      const inputAttrs: string[] = [];
      if (p.checked) inputAttrs.push("checked");
      if (p.disabled) inputAttrs.push("disabled");

      const html = indent(`<input class="form-check-input" type="checkbox" id="chk${indentLevel}" ${inputAttrs.join(" ")}>\n` +
        indent(`<label class="form-check-label" for="chk${indentLevel}">${p.label}</label>`, indentLevel + 1), indentLevel);
      return indent(wrap("div", cls, html, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "radio": {
      let cls = "form-check";
      if (p.inline) cls += " form-check-inline";

      const inputAttrs: string[] = [];
      if (p.checked) inputAttrs.push("checked");
      if (p.disabled) inputAttrs.push("disabled");

      const html = indent(`<input class="form-check-input" type="radio" name="${p.name}" id="rad${indentLevel}" ${inputAttrs.join(" ")}>\n` +
        indent(`<label class="form-check-label" for="rad${indentLevel}">${p.label}</label>`, indentLevel + 1), indentLevel);
      return indent(wrap("div", cls, html, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "range": {
      const html = indent(`<label for="range${indentLevel}" class="form-label">${p.label}</label>\n` +
        indent(`<input type="range" class="form-range" id="range${indentLevel}" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.defaultValue}" ${p.disabled ? "disabled" : ""}>`, indentLevel), indentLevel);
      return indent(wrap("div", "", html.trimEnd(), wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "switch": {
      let cls = "form-check form-switch";
      if (p.reverse) cls += " form-check-reverse";

      const html = indent(`<input class="form-check-input" type="checkbox" role="switch" id="sw${indentLevel}" ${p.checked ? "checked" : ""} ${p.disabled ? "disabled" : ""}>\n` +
        indent(`<label class="form-check-label" for="sw${indentLevel}">${p.label}</label>`, indentLevel + 1), indentLevel);
      return indent(wrap("div", cls, html, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "file-input": {
      let sizeCls = p.size ? `form-control${p.size !== "" ? ` form-control-${p.size}` : ""}` : "form-control";

      let html = "";
      if (p.label) {
        html += indent(`<label for="file${indentLevel}" class="form-label">${p.label}</label>\n`, indentLevel);
      }
      html += indent(`<input class="${sizeCls}" type="file" id="file${indentLevel}" ${p.disabled ? "disabled" : ""}>\n`, indentLevel);
      if (p.helpText) {
        html += indent(`<div class="form-text">${p.helpText}</div>\n`, indentLevel);
      }
      return indent(wrap("div", "", html.trimEnd(), wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "input-group": {
      let sizeCls = p.size ? `input-group${p.size !== "" ? ` input-group-${p.size}` : ""}` : "input-group";
      let html = "";

      if (p.prepend) {
        html += indent(`<span class="input-group-text">${p.prepend}</span>\n`, indentLevel + 1);
      }
      html += indent(`<input type="${p.inputType || "text"}" class="form-control" placeholder="${p.label}" ${p.disabled ? "disabled" : ""}>\n`, indentLevel + 1);
      if (p.append) {
        html += indent(`<span class="input-group-text">${p.append}</span>\n`, indentLevel + 1);
      }
      return indent(wrap("div", sizeCls, html.trimEnd(), wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    // ── BUTTONS ──
    case "button": {
      let cls = "btn";
      if (p.outline) cls += ` btn-outline-${p.variant}`;
      else cls += ` btn-${p.variant}`;
      if (p.size) cls += ` btn-${p.size}`;
      if (p.block) cls += " w-100";
      if (p.disabled) cls += " disabled";

      const extras: Record<string, string> = { ...wrapExtraAttrs };
      if (p.disabled) extras["aria-disabled"] = "true";

      const icon = p.iconLeft ? `<i class="bi ${p.iconLeft} me-1"></i>` : "";
      return indent(wrap("button", cls, `${icon}${p.text}`.trim(), extras, true, customClass, isHidden), indentLevel);
    }

    case "button-group": {
      let variant = p.variant as string;
      let isOutline = variant.startsWith("outline-");
      let baseVariant = isOutline ? variant.replace("outline-", "") : variant;

      const btns = ((p.buttons as string) || "")
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);

      let sizeCls = p.size ? ` btn-${p.size}` : "";
      let html = btns
        .map(
          (btn) =>
            indent(
              wrap(
                "button",
                `btn ${isOutline ? `btn-outline-${baseVariant}` : `btn-${baseVariant}`}${sizeCls}`,
                btn,
                {},
                true
              ),
              indentLevel + 1
            )
        )
        .join("\n");

      let cls = "btn-group";
      if (p.vertical) cls = "btn-group-vertical";
      if (p.size) cls += ` btn-group-${p.size}`;
      return indent(wrap("div", cls, html, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    // ── NAVIGATION ──
    case "navbar": {
      const items = ((p.items as string) || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const navItems = items
        .map(
          (item) =>
            indent(`<li class="nav-item">\n` +
              indent(wrap("a", "nav-link", item, { href: "#" }), indentLevel + 3) + "\n" +
              indent("</li>", indentLevel + 2), indentLevel + 1)
        )
        .join("\n");

      const expandClass = p.expand === "never" ? "" : p.expand === "always" ? "navbar-expand" : `navbar-expand-${p.expand}`;
      let cls = `navbar ${expandClass} navbar-${p.variant} bg-${p.bgColor}`;

      let content = indent(wrap("a", "navbar-brand", p.brand as string, { href: "#" }), indentLevel + 2);
      content += "\n" + indent('<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navContent">\n' +
        indent('<span class="navbar-toggler-icon"></span>', indentLevel + 3) + "\n" +
        indent("</button>", indentLevel + 2), indentLevel + 1);
      content += "\n" + indent(wrap("div", "collapse navbar-collapse", indent(wrap("ul", "navbar-nav me-auto", navItems), indentLevel + 2), { id: "navContent" }), indentLevel + 1);

      let containerCls = "container";
      if (p.container === "fluid") containerCls = "container-fluid";
      else if (p.container === "none") containerCls = "";

      if (containerCls) {
        return indent(wrap("nav", cls, indent(wrap("div", containerCls, content), indentLevel + 1), wrapExtraAttrs, false, customClass, isHidden), indentLevel);
      }
      return indent(wrap("nav", cls, content, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "nav-tabs": {
      const items = ((p.items as string) || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const navItems = items
        .map((item, i) =>
          indent(
            wrap("button", `nav-link${i === Number(p.active) ? " active" : ""}`, item, {}, true),
            indentLevel + 1
          )
        )
        .join("\n");

      let cls = "nav";
      if (p.style === "tabs") cls += " nav-tabs";
      else if (p.style === "pills") cls += " nav-pills";
      else if (p.style === "underline") cls += " nav-underline";
      if (p.fill === "justify") cls += " nav-justified";
      else if (p.fill === "fill") cls += " nav-fill";
      if (p.vertical) cls += " flex-column";

      return indent(wrap("ul", cls, navItems, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "breadcrumb": {
      const items = ((p.items as string) || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const crumbs = items.map((item, i) => {
        if (i === items.length - 1) {
          return indent(wrap("li", "breadcrumb-item active", item, { "aria-current": "page" }), indentLevel + 1);
        }
        return indent(`<li class="breadcrumb-item"><a href="#">${item}</a></li>`, indentLevel + 1);
      }).join("\n");

      return indent(wrap("nav", "mb-2", indent(wrap("ol", "breadcrumb", crumbs), indentLevel), { "aria-label": "breadcrumb", ...wrapExtraAttrs }, false, customClass, isHidden), indentLevel);
    }

    case "pagination": {
      const pages = Number(p.pages) || 5;
      const active = Number(p.active) || 1;

      let sizeCls = p.size ? ` pagination-${p.size}` : "";

      const items: string[] = [];
      items.push(indent(wrap("li", "page-item", indent(wrap("a", "page-link", "&laquo;", { href: "#" }), indentLevel + 1)), indentLevel));
      for (let i = 1; i <= pages; i++) {
        items.push(indent(wrap("li", `page-item${i === active ? " active" : ""}`, indent(wrap("a", "page-link", String(i), { href: "#" }), indentLevel + 1)), indentLevel));
      }
      items.push(indent(wrap("li", "page-item", indent(wrap("a", "page-link", "&raquo;", { href: "#" }), indentLevel + 1)), indentLevel));

      return indent(wrap("nav", "", indent(wrap("ul", `pagination${sizeCls}`, items.join("\n")), indentLevel), { "aria-label": "Page navigation", ...wrapExtraAttrs }, false, customClass, isHidden), indentLevel);
    }

    case "dropdown": {
      const items = ((p.items as string) || "")
        .split("\n")
        .filter(Boolean);

      const menuItems = items
        .map((item) => {
          if (item.trim() === "---") {
            return indent('<li><hr class="dropdown-divider"></li>', indentLevel + 2);
          }
          return indent(`<li>${wrap("a", "dropdown-item", item.trim(), { href: "#" }, true)}</li>`, indentLevel + 2);
        })
        .join("\n");

      let btnCls = `btn btn-${p.variant}${p.size ? ` btn-${p.size}` : ""} dropdown-toggle`;
      let wrapperCls = "btn-group";
      if (p.direction === "up") wrapperCls = "dropup";
      else if (p.direction === "end") wrapperCls = "dropend";
      else if (p.direction === "start") wrapperCls = "dropstart";

      let html = indent(wrap("button", btnCls, p.label as string, { "data-bs-toggle": "dropdown", "aria-expanded": "false" }, true), indentLevel + 1);
      html += "\n" + indent(wrap("ul", "dropdown-menu", menuItems), indentLevel + 1);

      return indent(wrap("div", wrapperCls, html, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    // ── CONTENT ──
    case "card": {
      let cls = "card";
      if (p.borderColor) cls += ` border-${p.borderColor}`;
      if (p.textAlign && p.textAlign !== "start") cls += ` text-${p.textAlign}`;

      const hasChildren = children && children.length > 0;
      const headerChildren = hasChildren ? children.filter(c => c.slot === "header") : [];
      const bodyChildren = hasChildren ? children.filter(c => !c.slot || c.slot === "body") : [];
      const footerChildren = hasChildren ? children.filter(c => c.slot === "footer") : [];
      const hasHeaderSlot = headerChildren.length > 0;
      const hasBodySlot = bodyChildren.length > 0;
      const hasFooterSlot = footerChildren.length > 0;
      const isDarkHeader = ["primary", "secondary", "success", "danger", "info", "dark"].includes(String(p.variant));

      let html = "";
      if (p.imgSrc) {
        html += indent(wrap("img", "card-img-top", "", { src: p.imgSrc as string, alt: "Card image" }), indentLevel + 1) + "\n";
      }
      // Header
      if (p.header || hasHeaderSlot || p.variant) {
        let headerCls = "card-header";
        if (p.variant) headerCls += ` bg-${p.variant}`;
        if (isDarkHeader) headerCls += " text-white";
        const headerSizeStyleMap: Record<string, string> = { "": "", sm: "0.75rem", md: "0.875rem", lg: "1.25rem", xl: "1.5rem" };
        const headerFs = headerSizeStyleMap[String(p.headerSize)] || "";
        const headerStyleObj: Record<string, string> = {};
        if (headerFs) headerStyleObj.style = "font-size:" + headerFs;
        const headerContent = hasHeaderSlot
          ? headerChildren.map(c => generateComponentHTML(c, indentLevel + 2, hiddenComponents)).join("\n")
          : (p.header as string);
        html += indent(wrap("div", headerCls, headerContent, headerStyleObj), indentLevel + 1) + "\n";
      }
      // Body
      html += indent('<div class="card-body">\n', indentLevel + 1);
      if (hasBodySlot) {
        html += bodyChildren.map(c => generateComponentHTML(c, indentLevel + 2, hiddenComponents)).join("\n");
      } else {
        if (p.title) html += indent(wrap("h5", "card-title", p.title as string, {}, true), indentLevel + 2) + "\n";
        if (p.subtitle) html += indent(wrap("h6", "card-subtitle mb-2 text-muted", p.subtitle as string, {}, true), indentLevel + 2) + "\n";
        if (p.text) html += indent(wrap("p", "card-text", (p.text as string).replace(/\n/g, "<br>\n")), indentLevel + 2) + "\n";
        if (p.showButton) {
          const btnVariant = p.variant && p.variant !== "" ? `btn-outline-light` : "btn-primary";
          html += indent(wrap("a", `btn ${btnVariant}`, p.buttonText as string, { href: "#" }, true), indentLevel + 2) + "\n";
        }
      }
      html += indent("</div>", indentLevel + 1) + "\n";
      // Footer
      if (p.footer || hasFooterSlot) {
        const footerContent = hasFooterSlot
          ? footerChildren.map(c => generateComponentHTML(c, indentLevel + 2, hiddenComponents)).join("\n")
          : (p.footer as string);
        html += indent(wrap("div", "card-footer text-muted", footerContent), indentLevel + 1);
      }

      return indent(wrap("div", cls, html.trimEnd(), wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "alert": {
      let cls = `alert alert-${p.variant}`;
      if (p.dismissible) cls += " alert-dismissible fade show";

      let html = "";
      if (p.heading) {
        html += indent(`<h4 class="alert-heading">${p.heading}</h4>\n`, indentLevel + 1);
      }
      html += indent(p.text as string, indentLevel + 1);
      if (p.dismissible) {
        html += '\n' + indent('<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>', indentLevel + 1);
      }

      return indent(wrap("div", cls, html, { role: "alert", ...wrapExtraAttrs }, false, customClass, isHidden), indentLevel);
    }

    case "badge": {
      let cls = "badge";
      if (p.variant) cls += ` bg-${p.variant}`;
      if (p.pill) cls += " rounded-pill";
      return indent(wrap("span", cls, p.text as string, wrapExtraAttrs, true, customClass, isHidden), indentLevel);
    }

    case "progress": {
      let barCls = "progress-bar";
      if (p.variant === "striped") barCls += " progress-bar-striped";
      else if (p.variant === "animated") barCls += " progress-bar-striped progress-bar-animated";
      else if (p.variant) barCls += ` bg-${p.variant}`;

      let html = indent(
        wrap("div", barCls, p.label ? `${p.value}%` : "", {
          role: "progressbar",
          "aria-valuenow": String(p.value),
          "aria-valuemin": "0",
          "aria-valuemax": "100",
          style: `width: ${p.value}%`,
        }, true),
        indentLevel + 1
      );

      let outerCls = "progress";
      if (p.height && Number(p.height) > 0) {
        return indent(wrap("div", outerCls, html, { style: `height: ${p.height}px`, ...wrapExtraAttrs }, false, customClass, isHidden), indentLevel);
      }
      return indent(wrap("div", outerCls, html, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "accordion": {
      const rawItems = ((p.items as string) || "")
        .split("\n")
        .filter(Boolean);

      const items = rawItems.map((item, i) => {
        const parts = item.split("|");
        const title = parts[0] || `Item ${i + 1}`;
        const body = parts[1] || `Content for item ${i + 1}`;
        return { title, body };
      });

      const flushCls = p.flush ? " accordion-flush" : "";

      const accordionItems = items
        .map((item, i) => {
          const headerId = `heading${i}`;
          const collapseId = `collapse${i}`;
          const show = i === 0 ? " show" : "";
          const collapsed = i === 0 ? "" : " collapsed";
          const expanded = i === 0 ? "true" : "false";

          let html = indent(
            `<h2 class="accordion-header" id="${headerId}">\n` +
              indent(
                wrap("button", `accordion-button${collapsed}`, item.title, {
                  type: "button",
                  "data-bs-toggle": "collapse",
                  "data-bs-target": `#${collapseId}`,
                  "aria-expanded": expanded,
                  "aria-controls": collapseId,
                }, true),
                indentLevel + 3
              ) +
              "\n" +
              indent("</h2>", indentLevel + 2),
            indentLevel + 1
          );
          html += "\n" + indent(
            wrap("div", `accordion-collapse collapse${show}`, indent(wrap("div", "accordion-body", item.body), indentLevel + 3), {
              id: collapseId,
              "aria-labelledby": headerId,
              "data-bs-parent": "#accordionExample",
            }),
            indentLevel + 1
          );
          return wrap("div", "accordion-item", html);
        })
        .join("\n");

      return indent(wrap("div", `accordion${flushCls}`, items.map(item => indent(item, indentLevel)).join("\n"), { id: "accordionExample", ...wrapExtraAttrs }, false, customClass, isHidden), indentLevel);
    }

    case "spinner": {
      let cls = `spinner-${p.type}`;
      if (p.variant) cls += ` text-${p.variant}`;
      if (p.size) cls += ` spinner-${p.type}-${p.size}`;
      if (customClass) cls += ` ${customClass}`;
      cls = cls.trim();
      const idAttr = customId ? ` id="${customId}"` : "";
      const hiddenAttr = isHidden ? ' style="display:none"' : "";
      return indent(
        `<div class="${cls}" role="status"${idAttr}${hiddenAttr}>\n${indent('<span class="visually-hidden">' + (p.label || "Loading...") + "</span>", indentLevel + 1)}\n</div>`,
        indentLevel
      );
    }

    case "list-group": {
      const items = ((p.items as string) || "")
        .split("\n")
        .filter(Boolean);

      const listItems = items
        .map((item, i) => {
          let cls = "list-group-item";
          if (i === Number(p.activeItem)) cls += " active";
          if (i === Number(p.disabledItem)) cls += " disabled";
          return indent(`<li class="${cls}">${item}</li>`, indentLevel + 1);
        })
        .join("\n");

      let cls = "list-group";
      if (p.flush) cls += " list-group-flush";
      if (p.numbered) cls += " list-group-numbered";
      if (p.horizontal) cls += " list-group-horizontal";

      if (p.numbered) {
        return indent(wrap("ol", cls, listItems, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
      }
      return indent(wrap("ul", cls, listItems, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    case "toast": {
      let html = indent(wrap("strong", "me-auto", p.title as string, {}, true), indentLevel + 2);
      html += "\n" + indent(`<small>${p.time}</small>`, indentLevel + 2);
      html += "\n" + indent('<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>', indentLevel + 2);

      let bodyHtml = indent(wrap("div", "toast-header bg-${p.variant} text-white", html), indentLevel + 1);
      bodyHtml += "\n" + indent(wrap("div", "toast-body", p.text as string), indentLevel + 1);

      return indent(
        wrap("div", "toast", bodyHtml, { role: "alert", "aria-live": "assertive", "aria-atomic": "true", ...wrapExtraAttrs }, false, customClass, isHidden),
        indentLevel
      );
    }

    case "jumbotron": {
      const isDark = p.bgColor === "dark" || p.bgColor === "primary";
      const textCls = isDark ? "text-white" : "";
      const mbCls = p.bgColor === "dark" ? "mb-0 text-white" : `mb-0`;

      let html = indent(`<h1 class="display-4">${p.title}</h1>\n`, indentLevel + 1);
      html += indent(`<p class="lead">${p.lead}</p>\n`, indentLevel + 1);
      html += indent('<hr class="my-4">\n', indentLevel + 1);
      if (p.secondaryButtonText) {
        html += indent('<div class="d-flex gap-2 justify-content-center">\n', indentLevel + 1);
        html += indent(wrap("a", `btn btn-${p.buttonVariant} btn-lg`, p.buttonText as string, { href: "#", role: "button" }, true), indentLevel + 2) + "\n";
        html += indent(wrap("a", "btn btn-outline-secondary btn-lg", p.secondaryButtonText as string, { href: "#", role: "button" }, true), indentLevel + 2) + "\n";
        html += indent("</div>", indentLevel + 1);
      } else {
        html += indent(wrap("a", `btn btn-${p.buttonVariant} btn-lg`, p.buttonText as string, { href: "#", role: "button" }, true), indentLevel + 1);
      }

      return indent(wrap("div", `p-5 mb-4 bg-${p.bgColor} rounded-3`, html, { style: `text-align: ${p.textAlign};`, ...wrapExtraAttrs }, false, customClass, isHidden), indentLevel);
    }

    case "carousel": {
      const slides = ((p.slides as string) || "")
        .split("\n")
        .filter(Boolean);

      const slideItems = slides
        .map((slide, i) => {
          let html = indent(wrap("div", `carousel-item${i === 0 ? " active" : ""}`,
            indent(wrap("div", "carousel-caption d-none d-md-block",
              indent(wrap("h5", "", slide, {}, true), indentLevel + 4) + "\n" +
              indent("<p>Some representative placeholder content for the slide.</p>", indentLevel + 4)
            ), indentLevel + 3)
          ), indentLevel + 2);
          return html;
        })
        .join("\n");

      let html = "";
      if (p.indicators) {
        html += indent(wrap("div", "carousel-indicators",
          slides.map((_, i) =>
            indent(`<button type="button" data-bs-target="#carouselExample" data-bs-slide-to="${i}"${i === 0 ? ' class="active" aria-current="true"' : ""} aria-label="Slide ${i + 1}"></button>`, indentLevel + 2)
          ).join("\n")
        ), indentLevel + 1) + "\n";
      }

      html += indent(wrap("div", "carousel-inner", slideItems), indentLevel + 1) + "\n";

      if (p.controls) {
        html += indent('<button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">\n' +
          indent('<span class="carousel-control-prev-icon" aria-hidden="true"></span>\n' +
            '<span class="visually-hidden">Previous</span>', indentLevel + 2) + "\n" +
          indent("</button>", indentLevel + 1), indentLevel + 1) + "\n";
        html += indent('<button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">\n' +
          indent('<span class="carousel-control-next-icon" aria-hidden="true"></span>\n' +
            '<span class="visually-hidden">Next</span>', indentLevel + 2) + "\n" +
          indent("</button>", indentLevel + 1), indentLevel + 1);
      }

      return indent(wrap("div", `carousel slide${p.dark ? " carousel-dark" : ""}`, html, { id: "carouselExample", "data-bs-ride": p.autoplay ? "carousel" : "false", ...wrapExtraAttrs }, false, customClass, isHidden), indentLevel);
    }

    case "modal": {
      let sizeAttr = p.size ? `modal-${p.size}` : "";
      let dialogCls = `modal-dialog ${sizeAttr}`;
      if (p.centered) dialogCls += " modal-dialog-centered";
      if (p.scrollable) dialogCls += " modal-dialog-scrollable";

      const hasChildren = children && children.length > 0;
      const headerSlotChildren = hasChildren ? children.filter(c => c.slot === "header") : [];
      const bodySlotChildren = hasChildren ? children.filter(c => !c.slot || c.slot === "body") : [];
      const footerSlotChildren = hasChildren ? children.filter(c => c.slot === "footer") : [];
      const hasHeaderSlot = headerSlotChildren.length > 0;
      const hasBodySlot = bodySlotChildren.length > 0;
      const hasFooterSlot = footerSlotChildren.length > 0;

      const bodyContent = hasBodySlot
        ? bodySlotChildren.map(c => generateComponentHTML(c, indentLevel + 3, hiddenComponents)).join("\n")
        : (p.text as string || "").replace(/\n/g, "<br>\n");

      let headerHTML = hasHeaderSlot
        ? headerSlotChildren.map(c => generateComponentHTML(c, indentLevel + 3, hiddenComponents)).join("\n")
        : indent(`<h5 class="modal-title">${p.title || "Modal"}</h5>\n`, indentLevel + 3);

      // Build footer inside modal-content
      const showClose = !!p.showCloseButton;
      const showPrimary = !!p.showPrimaryButton;
      const closeStyle = String(p.closeButtonStyle || "secondary");
      const primaryStyle = String(p.primaryButtonStyle || "primary");
      const closeCls = `btn btn-${closeStyle}`;
      const primaryCls = `btn btn-${primaryStyle}`;
      let footerHTML = "";
      if (showClose || showPrimary || hasFooterSlot) {
        let footerContent = "";
        if (hasFooterSlot) {
          footerContent = footerSlotChildren.map(c => generateComponentHTML(c, indentLevel + 3, hiddenComponents)).join("\n");
        } else {
          if (showClose) {
            footerContent = indent(wrap("button", closeCls, p.closeButtonText || "Close", { "data-bs-dismiss": "modal" }, true), indentLevel + 3);
          }
          if (showPrimary) {
            footerContent += (footerContent ? "\n" : "") + indent(wrap("button", primaryCls, (p.footer as string) || "Save Changes", {}, true), indentLevel + 3);
          }
        }
        footerHTML = "\n" + indent(wrap("div", "modal-footer", footerContent), indentLevel + 2);
      }

      let html = indent(wrap("div", "modal-content",
        indent(wrap("div", "modal-header",
          headerHTML +
          indent('<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>', indentLevel + 3)
        ), indentLevel + 2) + "\n" +
        indent(wrap("div", "modal-body", bodyContent), indentLevel + 2) +
        footerHTML
      ), indentLevel + 1);

      const dialogContent = indent(wrap("div", dialogCls.trim(), "\n" + html + "\n"), indentLevel + 1);

      const idAttr = customId ? ` id="${customId}"` : "";
      const hiddenAttr = isHidden ? ' style="display:none"' : "";
      return indent(
        `<div class="modal d-block position-relative" tabindex="-1"${idAttr}${hiddenAttr}>\n${dialogContent}\n</div>`,
        indentLevel
      );
    }

    case "offcanvas": {
      const placement = String(p.placement || "start");
      const backdropClass = p.backdrop !== false ? " offcanvas-backdrop" : "";
      const scrollClass = p.scrollBody ? " offcanvas-body-scroll" : "";
      const ocClasses = `offcanvas offcanvas-${placement}${backdropClass}${scrollClass}`;

      const hasChildren = children && children.length > 0;
      const headerSlotChildren = hasChildren ? children.filter(c => c.slot === "header") : [];
      const bodySlotChildren = hasChildren ? children.filter(c => !c.slot || c.slot === "body") : [];
      const hasHeaderSlot = headerSlotChildren.length > 0;
      const hasBodySlot = bodySlotChildren.length > 0;

      let headerHTML = hasHeaderSlot
        ? headerSlotChildren.map(c => generateComponentHTML(c, indentLevel + 2, hiddenComponents)).join("\n")
        : indent(`<h5 class="offcanvas-title">${p.title || "Offcanvas"}</h5>`, indentLevel + 2);

      const bodyContent = hasBodySlot
        ? bodySlotChildren.map(c => generateComponentHTML(c, indentLevel + 2, hiddenComponents)).join("\n")
        : (p.text as string || "").replace(/\n/g, "<br>\n");

      const inner = indent(
        wrap("div", "offcanvas-header",
          headerHTML + "\n" +
          indent('<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>', indentLevel + 2)
        ), indentLevel + 1
      ) + "\n" +
      indent(wrap("div", "offcanvas-body", bodyContent), indentLevel + 1);

      return indent(wrap("div", ocClasses, "\n" + inner + "\n", wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    // ── TABLES ──
    case "table": {
      const headers = ((p.headers as string) || "")
        .split("|")
        .map((h) => h.trim())
        .filter(Boolean);
      const tableRows = children || [];

      let cls = "table";
      if (p.striped) cls += " table-striped";
      if (p.bordered) cls += " table-bordered";
      if (p.hover) cls += " table-hover";
      if (p.condensed) cls += " table-sm";
      if (p.borderColor) cls += ` table-${p.borderColor}`;
      if (p.stripedColumns) cls += " table-striped-columns";
      if (customClass) cls += ` ${customClass}`;

      const headerHtml = indent(
        "<tr>" + headers.map((h) => `<th scope="col">${h}</th>`).join("") + "</tr>",
        indentLevel + 2
      );

      const bodyHtml = tableRows
        .map(
          (row, i) =>
            indent(
              "<tr>" +
                (row.children || [])
                  .map((cell, ci) => {
                    const cellP = cell.props as Record<string, string | boolean | number>;
                    const cellText = String(cellP.text || "");
                    const cellAlign = String(cellP.align || "left");
                    const alignAttr = cellAlign !== "left" ? ` style="text-align: ${cellAlign}"` : "";
                    const hasCellChildren = cell.children && cell.children.length > 0;
                    let cellContent = "";
                    if (hasCellChildren) {
                      cellContent = cell.children!
                        .map(c => generateComponentHTML(c, indentLevel + 3, hiddenComponents))
                        .join("\n");
                    } else {
                      cellContent = cellText;
                    }
                    if (ci === 0) return `<th scope="row"${alignAttr}>${cellContent}</th>`;
                    return `<td${alignAttr}>${cellContent}</td>`;
                  })
                  .join("\n") +
                "</tr>",
              indentLevel + 2
            )
        )
        .join("\n");

      let tableHtml = indent(wrap("thead", "", headerHtml), indentLevel + 1) + "\n" +
        indent(wrap("tbody", "", bodyHtml), indentLevel + 1);

      const table = wrap("table", cls, tableHtml);

      if (p.responsive) {
        return indent(wrap("div", "table-responsive", indent(table, indentLevel + 1), wrapExtraAttrs, false, undefined, isHidden), indentLevel);
      }
      return indent(wrap("div", "", table, wrapExtraAttrs, false, undefined, isHidden), indentLevel);
    }

    case "table-row": {
      // Handled by the table case — no standalone output
      return "";
    }

    case "table-cell": {
      // Handled by the table case — no standalone output
      return "";
    }

    // ── IMAGES ──
    case "image": {
      let cls = "";
      if (p.fluid) cls += " img-fluid";
      if (p.rounded === "rounded") cls += " rounded";
      else if (p.rounded === "circle") cls += " rounded-circle";
      else if (p.rounded === "thumbnail") cls += " img-thumbnail";
      else if (p.rounded === "rounded-pill") cls += " rounded-pill";
      if (customClass) cls += ` ${customClass}`;
      cls = cls.trim();
      const idAttr = customId ? ` id="${customId}"` : "";
      const hiddenAttr = isHidden ? ' style="display:none"' : "";
      return indent(`<img src="${p.src}" class="${cls}" alt="${p.alt}"${idAttr}${hiddenAttr}>`, indentLevel);
    }

    case "figure": {
      let alignCls = "";
      if (p.alignment === "center") alignCls = "mx-auto";
      else if (p.alignment === "end") alignCls = "ms-auto";

      const html = indent(
        `<img src="${p.src}" class="figure-img img-fluid rounded" alt="">\n` +
        indent(wrap("figcaption", "figure-caption", p.caption as string), indentLevel + 2),
        indentLevel + 1
      );
      return indent(wrap("figure", `figure ${alignCls}`, html, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    // ── UTILITIES ──
    case "divider": {
      let cls = "";
      if (p.variant) cls += ` text-${p.variant}`;
      cls = cls.trim();

      if (p.text) {
        let textCls = "";
        if (p.textColor) textCls = `text-${p.textColor}`;
        const inner = indent(
          `<span class="${textCls}">${p.text}</span>`,
          indentLevel + 1
        );
        const hrCls = p.variant ? `divider border border-${p.variant} border-2 opacity-50` : "divider";
        return indent(wrap("div", hrCls, inner, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
      }

      let hrCls = "";
      if (p.variant) hrCls += ` border-${p.variant} border-2 opacity-50`;
      if (customClass) hrCls += ` ${customClass}`;
      hrCls = hrCls.trim();
      const idAttr = customId ? ` id="${customId}"` : "";
      const hiddenAttr = isHidden ? ' style="display:none"' : "";
      return indent(`<hr class="${hrCls}"${idAttr}${hiddenAttr}>`, indentLevel);
    }

    case "spacer": {
      const size = p.size || "4";
      const height = { "1": "0.25rem", "2": "0.5rem", "3": "1rem", "4": "1.5rem", "5": "3rem", auto: "auto" };
      const idAttr = customId ? ` id="${customId}"` : "";
      const hiddenAttr = isHidden ? ' style="display:none"' : "";
      return indent(`<div${idAttr}${hiddenAttr} style="height: ${height[size as string] || "1.5rem"}"></div>`, indentLevel);
    }

    case "embed-video": {
      let ratioCls = `ratio ratio-${p.ratio}`;
      let html = indent(`<iframe src="${p.url}" title="Video embed" allowfullscreen></iframe>`, indentLevel + 1);
      return indent(wrap("div", ratioCls, html, wrapExtraAttrs, false, customClass, isHidden), indentLevel);
    }

    default:
      return indent(`<!-- Unknown component: ${type} -->`, indentLevel);
  }
}

export function generateFullHTML(components: CanvasComponent[], hiddenComponents?: Set<string>): string {
  if (components.length === 0) return "";

  const body = components
    .map((comp) => generateComponentHTML(comp, 1, hiddenComponents))
    .join("\n\n");

  return `<!doctype html>
<html lang="en" style="height:100%">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bootstrap Page</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>html,body{height:100%;margin:0}</style>
  </head>
  <body style="display:flex;flex-direction:column;min-height:100%">
${body}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  </body>
</html>`;
}
