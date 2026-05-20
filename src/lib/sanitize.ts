import DOMPurify from "dompurify";

/**
 * Sanifica HTML per prevenire XSS attacks
 * Rimuove script, event handlers e tag pericolosi
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre",
      "span", "div", "table", "thead", "tbody", "tr", "td", "th",
      "section", "article", "header", "footer", "main",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel", "class", "id"],
  });
}

/**
 * Escape HTML special characters per prevenire HTML injection in attributes
 */
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Sanifica CSS per prevenire injection in style tags
 */
export function sanitizeCSS(css: string): string {
  // Rimuove javascript: e data: URLs, @import malicioso, ecc.
  const maliciousPatterns = [
    /javascript:/gi,
    /data:/gi,
    /@import/gi,
    /expression\(/gi,
    /behavior:/gi,
  ];

  let sanitized = css;
  maliciousPatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "");
  });

  return sanitized;
}
