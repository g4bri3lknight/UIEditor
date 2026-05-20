import React from "react";
import { CanvasComponent } from "@/lib/editor/types";
import { registerRenderer } from "./registry";
import { BS, Wrapper } from "./shared";

// ── Table ──
function renderTable(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const customClass = String(p.customClass || "");
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

// ── Table Row ──
function renderTableRow(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  return <>{renderChildren ?? null}</>;
}

// ── Table Cell ──
function renderTableCell(
  component: CanvasComponent,
  renderChildren?: React.ReactNode,
  _slotChildren?: Record<string, React.ReactNode>,
  _isDragging?: boolean,
): React.ReactNode {
  const p = component.props as Record<string, string | boolean | number>;
  const cellText = String(p.text || "");
  const hasCellChildren = component.children && component.children.length > 0;
  return <>{hasCellChildren ? (renderChildren ?? null) : <span data-prop="text">{cellText}</span>}</>;
}

// ── Register all table renderers ──
registerRenderer("table", renderTable);
registerRenderer("table-row", renderTableRow);
registerRenderer("table-cell", renderTableCell);
