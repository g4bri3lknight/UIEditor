"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useEditorStore } from "@/store/editor-store";

export interface InlineEditState {
  id: string;
  propKey: string;
  rect: DOMRect;
  multiline: boolean;
}

export interface PropPickerState {
  id: string;
  props: Array<{ key: string; label: string; multiline: boolean }>;
  rect: DOMRect;
}

interface InlineEditOverlayProps {
  inlineEdit: InlineEditState | null;
  editValue: string;
  onEditValueChange: (value: string) => void;
  commitEdit: () => void;
  onCancel: () => void;
  propPicker: PropPickerState | null;
  onPickProp: (propKey: string, multiline: boolean) => void;
  onDismissPropPicker: () => void;
}

export function InlineEditOverlay({
  inlineEdit,
  editValue,
  onEditValueChange,
  commitEdit,
  onCancel,
  propPicker,
  onPickProp,
  onDismissPropPicker,
}: InlineEditOverlayProps) {
  const editInputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // Auto-resize textarea when value changes
  useEffect(() => {
    if (inlineEdit?.multiline && editInputRef.current) {
      const el = editInputRef.current;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [inlineEdit, editValue]);

  // Close prop picker when clicking outside
  useEffect(() => {
    if (!propPicker) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking inside the picker popup
      if (target.closest("[data-prop-picker]")) return;
      onDismissPropPicker();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [propPicker, onDismissPropPicker]);

  return (
    <>
      {/* Inline text editing overlay */}
      {inlineEdit &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: inlineEdit.rect.left,
              top: inlineEdit.rect.top,
              width: Math.max(inlineEdit.rect.width, 200),
              zIndex: 9999,
            }}
            onMouseDown={(e) => {
              // Only prevent default on the wrapper — let the input/textarea
              // handle mouse events normally so the user can reposition the cursor
              if (e.target === e.currentTarget) {
                e.preventDefault();
              }
            }}>
            {inlineEdit.multiline ? (
              <textarea
                ref={editInputRef as React.RefObject<HTMLTextAreaElement>}
                autoFocus
                value={editValue}
                onChange={(e) => onEditValueChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    commitEdit();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    onCancel();
                  }
                }}
                onBlur={commitEdit}
                className="w-full"
                style={{
                  padding: "6px 10px",
                  border: "2px solid hsl(var(--primary))",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  background: "white",
                  outline: "none",
                  resize: "vertical",
                  minHeight: "36px",
                  width: "100%",
                  boxSizing: "border-box",
                  lineHeight: "1.5",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                }}
              />
            ) : (
              <input
                ref={editInputRef as React.RefObject<HTMLInputElement>}
                autoFocus
                value={editValue}
                onChange={(e) => onEditValueChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitEdit();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    onCancel();
                  }
                }}
                onBlur={commitEdit}
                style={{
                  padding: "6px 10px",
                  border: "2px solid hsl(var(--primary))",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  background: "white",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                  lineHeight: "1.5",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                }}
              />
            )}
            <div className="flex items-center justify-between mt-1 px-1">
              <span className="text-[10px] text-muted-foreground">
                {inlineEdit.multiline ? "Ctrl+Enter per salvare" : "Enter per salvare"}
              </span>
              <span className="text-[10px] text-muted-foreground">Esc per annullare</span>
            </div>
          </div>,
          document.body
        )}

      {/* Property picker popup (for components with multiple editable props) */}
      {propPicker &&
        createPortal(
          <div
            data-prop-picker
            style={{
              position: "fixed",
              left: propPicker.rect.left,
              top: propPicker.rect.bottom + 4,
              zIndex: 10000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px] animate-in fade-in-0 zoom-in-95 duration-100"
              onMouseDown={(e) => {
                // Let interactive children (buttons, inputs) handle mouse normally
                if (e.target === e.currentTarget) {
                  e.preventDefault();
                }
              }}
            >
              <div className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 mb-0.5">
                Modifica proprietà
              </div>
              {propPicker.props.map((prop) => {
                const currentValue = useEditorStore.getState().findComponent(propPicker.id);
                const value = currentValue ? String(currentValue.props[prop.key] ?? "") : "";
                const hasValue = value.length > 0;
                return (
                  <button
                    key={prop.key}
                    onClick={() => onPickProp(prop.key, prop.multiline)}
                    className="w-full flex items-center justify-between gap-3 px-2.5 py-1.5 text-left hover:bg-accent transition-colors rounded-sm mx-0.5"
                    style={{ width: "calc(100% - 4px)" }}
                  >
                    <span className="text-xs font-medium text-foreground">{prop.label}</span>
                    {hasValue && (
                      <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                        {value.slice(0, 20)}{value.length > 20 ? "…" : ""}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
