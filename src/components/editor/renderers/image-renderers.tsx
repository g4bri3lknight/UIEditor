/* eslint-disable @next/next/no-img-element */
import React from "react";
import { CanvasComponent } from "@/lib/editor/types";
import { registerRenderer } from "./registry";
import { BS, BS_TEXT, Wrapper } from "./shared";

// ── Image ──
function renderImage(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
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

// ── Figure ──
function renderFigure(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
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

// ── Icon ──
function renderIcon(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
  const iconName = String(p.name || "house").replace(/^bi-?/, '');
  const iconSize = Number(p.size) || 16;
  const iconColor = BS_TEXT[String(p.color)] || BS.body;
  return (
    <Wrapper customClass={customClass} style={{ padding: "4px", display: "inline-block" }}>
      <i
        className={`bi-${iconName}`}
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

// ── Embed Video ──
function renderEmbedVideo(
  component: CanvasComponent,
  _renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
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

// ── Register all image renderers ──
registerRenderer("image", renderImage);
registerRenderer("figure", renderFigure);
registerRenderer("icon", renderIcon);
registerRenderer("embed-video", renderEmbedVideo);
