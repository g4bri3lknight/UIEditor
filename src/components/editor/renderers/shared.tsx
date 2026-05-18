import React from "react";
import { CanvasComponent } from "@/lib/editor/types";

// ── Bootstrap 5 color palette ──
export const BS = {
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

export const BS_TEXT: Record<string, string> = {
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

export const BS_BG: Record<string, string> = {
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

export const spacing = (v: string | number): string => {
  const map: Record<string, string> = {
    "0": "0", "1": "0.25rem", "2": "0.5rem", "3": "1rem", "4": "1.5rem", "5": "3rem", auto: "auto",
  };
  return map[String(v)] || `${v}rem`;
};

// ── Build padding style from uniform + individual overrides ──
export function buildPaddingStyle(p: Record<string, unknown>, defaultVal: string): string {
  const uniform = spacing(String(p.padding || defaultVal));
  const pt = p.paddingTop !== undefined && p.paddingTop !== "" ? spacing(String(p.paddingTop)) : null;
  const pb = p.paddingBottom !== undefined && p.paddingBottom !== "" ? spacing(String(p.paddingBottom)) : null;
  const pl = p.paddingLeft !== undefined && p.paddingLeft !== "" ? spacing(String(p.paddingLeft)) : null;
  const pr = p.paddingRight !== undefined && p.paddingRight !== "" ? spacing(String(p.paddingRight)) : null;

  if (!pt && !pb && !pl && !pr) return uniform;

  const top = pt ?? uniform;
  const right = pr ?? uniform;
  const bottom = pb ?? uniform;
  const left = pl ?? uniform;

  if (top === bottom && left === right) {
    if (top === left) return top;
    return `${top} ${left}`;
  }
  return `${top} ${right} ${bottom} ${left}`;
}

// ── Renderer props interface ──
export interface RendererProps {
  component: CanvasComponent;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  renderChildren?: React.ReactNode;
  slotChildren?: Record<string, React.ReactNode>;
  isDragging?: boolean;
}

// ── Wrapper component used by every renderer ──
export const Wrapper: React.FC<{
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

// ── Helper: get button style by variant ──
export function getButtonStyle(variant: string, isOutline: boolean): React.CSSProperties {
  if (isOutline) {
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

// ── Helper: pagination button style ──
export function pageBtnStyle(active: boolean, scale: number = 1): React.CSSProperties {
  return {
    padding: `${6 * scale}px ${12 * scale}px`,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: active ? BS.primary : BS.borderColor,
    background: active ? BS.primary : BS.white, color: active ? BS.white : BS.primary,
    borderRadius: "6px", cursor: "pointer", fontSize: `${0.875 * scale}rem`, fontWeight: 400,
  };
}
