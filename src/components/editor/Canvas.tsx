"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { createPortal } from "react-dom";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Copy,
  ClipboardPaste,
  Trash2,
  ArrowUp,
  ArrowDown,
  ClipboardCopy,
  Plus,
  BookmarkPlus,
  Pencil,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { useEditorStore, isContainer, isAutoManaged, isSlottedType, getTabSlots, getAccordionSlots } from "@/store/editor-store";
import { BootstrapRenderer } from "./BootstrapRenderer";
import { CanvasComponent } from "@/lib/editor/types";
import { COMPONENTS, CATEGORIES } from "@/lib/editor/bootstrap-components";
import { toast } from "sonner";

// ── Editable text props per component type ──
// Maps component types to their editable text prop keys, labels, and whether they need a textarea (multiline)
// The FIRST entry is the default property edited on double-click for single-prop components
const EDITABLE_TEXT_PROPS: Record<string, Array<{ key: string; label: string; multiline: boolean }>> = {
  "heading": [{ key: "text", label: "Testo", multiline: false }],
  "paragraph": [{ key: "text", label: "Testo", multiline: true }],
  "blockquote": [{ key: "text", label: "Citazione", multiline: true }, { key: "attribution", label: "Attribuzione", multiline: false }],
  "list": [{ key: "items", label: "Elementi", multiline: true }],
  "code-block": [{ key: "code", label: "Codice", multiline: true }],
  "button": [{ key: "text", label: "Testo", multiline: false }],
  "button-group": [{ key: "buttons", label: "Pulsanti", multiline: false }],
  "input": [{ key: "text", label: "Valore", multiline: false }, { key: "label", label: "Etichetta", multiline: false }, { key: "placeholder", label: "Placeholder", multiline: false }, { key: "helpText", label: "Testo aiuto", multiline: false }],
  "textarea": [{ key: "text", label: "Valore", multiline: false }, { key: "label", label: "Etichetta", multiline: false }, { key: "placeholder", label: "Placeholder", multiline: false }, { key: "helpText", label: "Testo aiuto", multiline: false }],
  "select-input": [{ key: "label", label: "Etichetta", multiline: false }],
  "checkbox": [{ key: "label", label: "Etichetta", multiline: false }],
  "radio": [{ key: "label", label: "Etichetta", multiline: false }],
  "switch": [{ key: "label", label: "Etichetta", multiline: false }],
  "range": [{ key: "label", label: "Etichetta", multiline: false }],
  "file-input": [{ key: "label", label: "Etichetta", multiline: false }],
  "input-group": [{ key: "label", label: "Placeholder", multiline: false }, { key: "prepend", label: "Prefisso", multiline: false }, { key: "append", label: "Suffisso", multiline: false }],
  "card": [{ key: "title", label: "Titolo", multiline: false }, { key: "text", label: "Testo", multiline: true }, { key: "header", label: "Header", multiline: false }, { key: "subtitle", label: "Sottotitolo", multiline: false }, { key: "footer", label: "Footer", multiline: false }],
  "alert": [{ key: "text", label: "Testo", multiline: false }, { key: "heading", label: "Titolo", multiline: false }],
  "badge": [{ key: "text", label: "Testo", multiline: false }],
  "accordion": [{ key: "items", label: "Elementi", multiline: true }],
  "list-group": [{ key: "items", label: "Elementi", multiline: true }],
  "toast": [{ key: "title", label: "Titolo", multiline: false }, { key: "text", label: "Testo", multiline: false }],
  "jumbotron": [{ key: "title", label: "Titolo", multiline: false }, { key: "lead", label: "Sottotitolo", multiline: false }],
  "carousel": [{ key: "slides", label: "Slide", multiline: true }],
  "modal": [{ key: "title", label: "Titolo", multiline: false }, { key: "closeButtonText", label: "Testo chiusura", multiline: false }, { key: "footer", label: "Footer", multiline: false }],
  "offcanvas": [{ key: "title", label: "Titolo", multiline: false }],
  "link": [{ key: "text", label: "Testo", multiline: false }],
  "collapse": [{ key: "title", label: "Titolo", multiline: false }, { key: "body", label: "Contenuto", multiline: true }],
  "tab-content": [{ key: "items", label: "Tab", multiline: true }],
  "tooltip": [{ key: "text", label: "Testo trigger", multiline: false }, { key: "tooltipText", label: "Testo tooltip", multiline: false }],
  "popover": [{ key: "text", label: "Testo trigger", multiline: false }, { key: "title", label: "Titolo", multiline: false }, { key: "body", label: "Contenuto", multiline: true }],
  "table-cell": [{ key: "text", label: "Testo", multiline: false }],
};

function getFirstEditableProp(type: string): { key: string; multiline: boolean } | null {
  const props = EDITABLE_TEXT_PROPS[type];
  return props && props.length > 0 ? props[0] : null;
}

function hasEditableProps(type: string): boolean {
  return !!EDITABLE_TEXT_PROPS[type];
}

// ── Drop indicator between items ──
function DropIndicator({
  id,
  isActive,
  isDragging = false,
  dropHint,
}: {
  id: string;
  isActive: boolean;
  isDragging?: boolean;
  dropHint?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "drop-indicator" },
  });

  const active = isOver || isActive;
  const isLarge = isDragging && !!dropHint;

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 rounded-lg ${
        active && !isLarge
          ? "min-h-3 min-w-3 bg-primary/20 border-2 border-primary/40 border-dashed"
          : isLarge
            ? `min-h-[48px] border-2 border-dashed ${isOver ? "border-primary/60 bg-primary/10" : "border-primary/30 bg-primary/5"}`
            : "min-h-1 min-w-[2px]"
      }`}
      style={{ flex: isLarge ? "1 1 100%" : "0 0 auto", width: isLarge ? "100%" : undefined }}
    >
      {isLarge && (
        <div className={`flex items-center justify-center h-full py-2 transition-opacity ${isOver ? "opacity-100" : "opacity-70"}`}>
          <span className="text-xs text-primary/60 font-medium">{dropHint}</span>
        </div>
      )}
    </div>
  );
}

// ── Slot drop zone (header/footer) for slotted components ──
function SlotDropZone({
  slotId,
  isDragging,
  children,
  label,
}: {
  slotId: string;
  isDragging: boolean;
  children: React.ReactNode;
  label: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: slotId,
    data: { type: "slot-drop", slotId },
  });

  const showHint = isOver && isDragging;
  const isEmpty = !children || (React.Children.count(children) === 0);

  return (
    <div
      ref={setNodeRef}
      className={`relative transition-all duration-150 w-full ${
        showHint ? "ring-1 ring-primary/40 bg-primary/5 rounded" : ""
      } ${isEmpty && isDragging ? "min-h-[40px]" : ""}`}
    >
      {children}
      {isEmpty && isDragging && (
        <div className={`absolute inset-0 flex items-center justify-center rounded transition-opacity pointer-events-none ${
          showHint ? "opacity-100" : "opacity-0"
        }`}>
          <span className="text-[10px] text-primary/60 font-medium">{label}</span>
        </div>
      )}
    </div>
  );
}

// ── Canvas Item (draggable wrapper + optional container drop target) ──
function CanvasItem({
  component,
  index,
  siblings,
  parentId,
  isDragging,
  depth = 0,
  onStartInlineEdit,
  onShowPropPicker,
}: {
  component: CanvasComponent;
  index: number;
  siblings: CanvasComponent[];
  parentId: string | null;
  isDragging: boolean;
  depth?: number;
  onStartInlineEdit: (id: string, propKey: string, rect: DOMRect, currentValue: string, multiline: boolean) => void;
  onShowPropPicker: (id: string, props: Array<{ key: string; label: string; multiline: boolean }>, rect: DOMRect) => void;
}) {
  const {
    selectedId,
    selectComponent,
    addComponent,
    duplicateComponent,
    copyComponent,
    pasteComponent,
    moveUp,
    moveDown,
    removeComponent,
    clipboard,
    hiddenComponents,
  } = useEditorStore();

  const isSelected = selectedId === component.id;
  const isHidden = hiddenComponents.has(component.id);
  const canContain = isContainer(component.type);
  const isSlotted = isSlottedType(component.type);
  const allChildren = component.children || [];
  const hasAnyChildren = allChildren.length > 0;
  const managed = isAutoManaged(component.type);

  // Table structure types
  const isTable = component.type === "table";
  const isTableRow = component.type === "table-row";
  const isTableCell = component.type === "table-cell";
  const isTableStructure = isTableRow || isTableCell;
  // Table and table-structure children must not have DropIndicator <div>s (invalid inside <tbody>)
  const skipDropIndicators = isTable || isTableStructure;

  // Inline components should not stretch to full width
  const INLINE_TYPES = new Set(["button", "badge", "spinner", "progress", "checkbox", "radio", "switch", "range"]);
  const isInline = INLINE_TYPES.has(component.type);

  // ── Draggable (disabled for auto-managed types like col) ──
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
  } = useDraggable({
    id: component.id,
    data: { type: "canvas-item", componentId: component.id },
    disabled: managed,
  });

  // ── Droppable (for container types) ──
  // Disable for table and table-row so drops go directly to table-cell
  const {
    setNodeRef: setDropRef,
    isOver: isContainerOver,
  } = useDroppable({
    id: `container-${component.id}`,
    data: { type: "container-drop", componentId: component.id },
    disabled: !canContain || component.type === "table" || component.type === "table-row",
  });

  const dragStyle: React.CSSProperties = {
    ...(transform
      ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 }
      : {}),
    touchAction: "none",
  };

  // Col components: use flex-grow proportional to size (12-column grid)
  if (component.type === "col") {
    const size = String(component.props.size || "auto");
    const grow = size === "auto" ? 1 : Math.max(0, Number(size));
    dragStyle.flex = `${grow} 0 0%`;
    dragStyle.minWidth = "0";
  }

  // Table cell styling (rendered as actual <td> element, no CSS display needed)
  if (isTableCell) {
    dragStyle.padding = "12px 16px";
    dragStyle.verticalAlign = "middle";
    // Default subtle border to make cells visible
    dragStyle.borderBottomWidth = "1px";
    dragStyle.borderBottomStyle = "solid";
    dragStyle.borderBottomColor = "#e5e7eb";
    // Empty cells get a min-height for visibility
    const hasCellChildren = component.children && component.children.length > 0;
    if (!hasCellChildren) {
      dragStyle.minHeight = "36px";
    }
    // Text alignment
    const cellAlign = String(component.props.align || "left");
    if (cellAlign !== "left") {
      dragStyle.textAlign = cellAlign as "center" | "right" | "justify";
    }
  }

  // For table structure, look up parent table props for styling
  let tableProps: Record<string, string | boolean | number> | null = null;
  if (isTableStructure && parentId) {
    const findTableAncestor = (id: string): CanvasComponent | null => {
      const parentInfo = useEditorStore.getState().getParentInfo(id);
      if (!parentInfo?.parent) return null;
      if (parentInfo.parent.type === "table") return parentInfo.parent;
      return findTableAncestor(parentInfo.parent.id);
    };
    const tableAncestor = findTableAncestor(component.id);
    if (tableAncestor) {
      tableProps = tableAncestor.props as Record<string, string | boolean | number>;
    }
  }

  // Apply table cell border styles
  if (isTableCell && tableProps) {
    const bc = String(tableProps.borderColor || "");
    const bordered = !!tableProps.bordered;
    if (bordered && bc) {
      const color = bc === "primary" ? "#0d6efd" : bc === "secondary" ? "#6c757d" : bc === "success" ? "#198754" : bc === "danger" ? "#dc3545" : bc === "warning" ? "#ffc107" : bc === "info" ? "#0dcaf0" : "#dee2e6";
      dragStyle.borderTopWidth = "1px";
      dragStyle.borderTopStyle = "solid";
      dragStyle.borderTopColor = color;
      dragStyle.borderLeftWidth = "1px";
      dragStyle.borderLeftStyle = "solid";
      dragStyle.borderLeftColor = color;
      dragStyle.borderRightWidth = "1px";
      dragStyle.borderRightStyle = "solid";
      dragStyle.borderRightColor = color;
      dragStyle.borderBottomWidth = "1px";
      dragStyle.borderBottomStyle = "solid";
      dragStyle.borderBottomColor = color;
    }
    if (tableProps.condensed) {
      dragStyle.padding = "6px 12px";
    }
  }

  // First column cells with no child components: bold text
  if (isTableCell && index === 0) {
    const cellP = component.props as Record<string, string | boolean | number>;
    const hasCellChildren = component.children && component.children.length > 0;
    if (!hasCellChildren) {
      dragStyle.fontWeight = "600";
    }
  }

  // Apply table row background (striped)
  if (isTableRow && tableProps && tableProps.striped) {
    const rowIdx = index;
    if (rowIdx % 2 === 1) {
      dragStyle.background = "#f8f9fa";
    } else {
      dragStyle.background = "#ffffff";
    }
    dragStyle.borderBottom = "1px solid #dee2e6";
    if (tableProps.hover) {
      dragStyle.cursor = "pointer";
    }
  }

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectComponent(component.id);
    },
    [selectComponent, component.id]
  );

  // ── Inline text editing on double-click ──
  // Single editable prop → edit directly. Multiple → show property picker popup.
  const editableProp = getFirstEditableProp(component.type);
  const allEditableProps = EDITABLE_TEXT_PROPS[component.type];
  const isEditable = !!editableProp;

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!allEditableProps || allEditableProps.length === 0) return;

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

      if (allEditableProps.length === 1) {
        // Single prop → edit directly
        const prop = allEditableProps[0];
        const currentValue = String(component.props[prop.key] ?? "");
        onStartInlineEdit(component.id, prop.key, rect, currentValue, prop.multiline);
      } else {
        // Multiple props → show picker popup
        onShowPropPicker(component.id, allEditableProps, rect);
      }
    },
    [allEditableProps, component.id, component.props, onStartInlineEdit, onShowPropPicker]
  );

  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      setDragRef(node);
      setDropRef(node);
    },
    [setDragRef, setDropRef]
  );

  const handleDuplicate = useCallback(() => {
    duplicateComponent(component.id);
    toast.success("Componente duplicato");
  }, [duplicateComponent, component.id]);

  const handleCopy = useCallback(() => {
    copyComponent(component.id);
    toast.success("Componente copiato");
  }, [copyComponent, component.id]);

  const handlePaste = useCallback(() => {
    pasteComponent();
    toast.success("Componente incollato");
  }, [pasteComponent]);

  const handleRemove = useCallback(() => {
    removeComponent(component.id);
    toast.success("Componente eliminato");
  }, [removeComponent, component.id]);

  // Save as template
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [snippetName, setSnippetName] = useState("");
  const { saveSnippet } = useEditorStore();

  const handleSaveAsTemplate = () => {
    setSnippetName(component.label);
    setSaveDialogOpen(true);
  };

  const handleConfirmSave = () => {
    saveSnippet(snippetName, [component.id]);
    setSaveDialogOpen(false);
    toast.success("Template salvato!");
  };

  // Quick insert via context menu
  const handleQuickInsert = useCallback((type: string) => {
    addComponent(type, component.id, undefined, isSlotted ? "body" : undefined);
    toast.success(`${COMPONENTS.find(c => c.type === type)?.label || type} aggiunto`);
  }, [addComponent, component.id, isSlotted]);

  // Determine target for quick insert (container or column inside slotted types)
  const canInsertInto = canContain || managed;

  // ── Build children content (split by slot for slotted types) ──
  const renderSlotContent = useCallback((slotChildren: CanvasComponent[]) => {
    if (slotChildren.length === 0) return null;
    return (
      <>
        {slotChildren.map((child, i) => (
          <React.Fragment key={child.id}>
            <DropIndicator
              id={`before::${child.id}::${component.id}`}
              isActive={false}
            />
            <CanvasItem
              component={child}
              index={i}
              siblings={slotChildren}
              parentId={component.id}
              isDragging={isDragging}
              depth={depth + 1}
              onStartInlineEdit={onStartInlineEdit}
              onShowPropPicker={onShowPropPicker}
            />
            <DropIndicator
              id={`after::${child.id}::${component.id}`}
              isActive={false}
            />
          </React.Fragment>
        ))}
        {isDragging && (
          <DropIndicator
            id={`bottom-slot-${component.id}-${slotChildren[0]?.slot || "body"}`}
            isActive={false}
          />
        )}
      </>
    );
  }, [component.id, isDragging, depth, onStartInlineEdit, onShowPropPicker]);

  // For slotted types: split children into slot groups
  let slotChildrenMap: Record<string, React.ReactNode> | undefined;
  let childrenContent: React.ReactNode | null = null;

  if (isSlotted && component.type === "tab-content") {
    // Tab-content: dynamic slots based on the number of tabs
    const tabSlotIds = getTabSlots(component.props.items);
    const active = Number(component.props.active) || 0;

    // Get tab labels for display
    const rawItems = String(component.props.items || "").split("\n").filter(Boolean);
    const tabLabels = rawItems.map((item) => item.split("|")[0] || "Tab");

    slotChildrenMap = {};
    tabSlotIds.forEach((slotId, tabIndex) => {
      const tabChildren = allChildren.filter(c => c.slot === slotId);
      const isActive = tabIndex === active;
      slotChildrenMap[slotId] = (
        <div key={slotId} style={{ display: isActive ? "block" : "none" }}>
          <SlotDropZone
            slotId={`slot-${component.id}-${slotId}`}
            isDragging={isDragging}
            label={isActive ? `Rilascia nella tab "${tabLabels[tabIndex]}"` : undefined}
          >
            {renderSlotContent(tabChildren)}
          </SlotDropZone>
        </div>
      );
    });
  } else if (isSlotted && component.type === "accordion") {
    // Accordion: dynamic slots based on the number of accordion items
    const accSlotIds = getAccordionSlots(component.props.items);

    // Get accordion item titles for display
    const rawItems = String(component.props.items || "").split("\n").filter(Boolean);
    const accTitles = rawItems.map((item) => item.split("|")[0] || "Item");

    slotChildrenMap = {};
    accSlotIds.forEach((slotId, accIndex) => {
      const accChildren = allChildren.filter(c => c.slot === slotId);
      slotChildrenMap[slotId] = (
        <div key={slotId}>
          <SlotDropZone
            slotId={`slot-${component.id}-${slotId}`}
            isDragging={isDragging}
            label={`Rilascia nel pannello "${accTitles[accIndex]}"`}
          >
            {renderSlotContent(accChildren)}
          </SlotDropZone>
        </div>
      );
    });
  } else if (isSlotted && component.type === "collapse") {
    // Collapse: single body slot with drop zone
    const bodyChildren = allChildren.filter(c => !c.slot || c.slot === "body");
    slotChildrenMap = {
      body: (
        <SlotDropZone
          slotId={`slot-${component.id}-body`}
          isDragging={isDragging}
          label="Rilascia componenti qui"
        >
          {renderSlotContent(bodyChildren)}
        </SlotDropZone>
      ),
    };
  } else if (isSlotted) {
    const headerChildren = allChildren.filter(c => c.slot === "header");
    const bodyChildren = allChildren.filter(c => !c.slot || c.slot === "body");
    const footerChildren = allChildren.filter(c => c.slot === "footer");

    slotChildrenMap = {
      header: (
        <SlotDropZone slotId={`slot-${component.id}-header`} isDragging={isDragging} label="Rilascia componenti qui">
          {renderSlotContent(headerChildren)}
        </SlotDropZone>
      ),
      body: renderSlotContent(bodyChildren),
      footer: (
        <SlotDropZone slotId={`slot-${component.id}-footer`} isDragging={isDragging} label="Rilascia componenti qui">
          {renderSlotContent(footerChildren)}
        </SlotDropZone>
      ),
    };
  } else if (canContain && hasAnyChildren) {
    // Rows auto-manage their columns — don't show "drop at end" inside rows
    // Table structure also skips drop indicators to not break table layout
    const showBottomDrop = isDragging && component.type !== "row" && !managed && !skipDropIndicators;
    childrenContent = (
      <>
        {allChildren.map((child, i) => (
          <React.Fragment key={child.id}>
            {!skipDropIndicators && (
              <DropIndicator
                id={`before::${child.id}::${component.id}`}
                isActive={false}
              />
            )}
            <CanvasItem
              component={child}
              index={i}
              siblings={allChildren}
              parentId={component.id}
              isDragging={isDragging}
              depth={depth + 1}
              onStartInlineEdit={onStartInlineEdit}
              onShowPropPicker={onShowPropPicker}
            />
            {!skipDropIndicators && (
              <DropIndicator
                id={`after::${child.id}::${component.id}`}
                isActive={false}
              />
            )}
          </React.Fragment>
        ))}
        {showBottomDrop && (
          <DropIndicator
            id={`bottom-${component.id}`}
            isActive={false}
            isDragging={isDragging}
            dropHint="Rilascia qui"
          />
        )}
      </>
    );
  }

  // Skip outer DropIndicators for table structure (breaks table layout)
  const showOuterDropIndicators = !isTableStructure;

  // Shared base style for table structure (tr/td)
  const tableBaseStyle: React.CSSProperties = {
    ...dragStyle,
    ...(isHidden && !isDragging && !isSelected ? { opacity: 0.3 } : {}),
  };

  return (
    <>
      {showOuterDropIndicators && (
        <DropIndicator
          id={parentId ? `before::${component.id}::${parentId}` : `before::${component.id}`}
          isActive={false}
        />
      )}

      {/* Table structure: render <tr>/<td> directly — no ContextMenu wrapper (ContextMenu with asChild
          may not work correctly inside <tbody> since only <tr> elements are valid children) */}
      {isTableStructure ? (
        isTableRow ? (
          <tr
            ref={mergedRef}
            style={{
              ...tableBaseStyle,
              ...(isSelected ? { outline: "2px solid hsl(var(--primary) / 0.6)", outlineOffset: "-2px" } : {}),
            }}
            className="group/canvas-item transition-all duration-150 hover:bg-muted/20"
            onClick={handleSelect}
            onDoubleClick={handleDoubleClick}
            {...attributes}
            {...listeners}
          >
            <BootstrapRenderer
              component={component}
              renderChildren={childrenContent}
              slotChildren={slotChildrenMap}
              isDragging={isDragging}
            />
          </tr>
        ) : (
          <td
            ref={mergedRef}
            style={{
              ...tableBaseStyle,
              ...(isHidden && !isDragging && !(isContainerOver && isDragging) && !isSelected ? { opacity: 0.3 } : {}),
              ...(isSelected ? { outline: "2px solid hsl(var(--primary) / 0.6)", outlineOffset: "-2px" } : {}),
              ...(isContainerOver && isDragging ? { outline: "2px solid hsl(var(--primary) / 0.4)", outlineOffset: "-2px" } : {}),
            }}
            className="group/canvas-item transition-all duration-150 hover:bg-muted/30"
            onClick={handleSelect}
            onDoubleClick={handleDoubleClick}
            {...attributes}
            {...listeners}
          >
            <BootstrapRenderer
              component={component}
              renderChildren={childrenContent}
              slotChildren={slotChildrenMap}
              isDragging={isDragging}
            />
          </td>
        )
      ) : (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={mergedRef}
            style={{
              ...dragStyle,
              ...(isHidden && !isDragging && !(isContainerOver && isDragging) && !isSelected ? { opacity: 0.3 } : {}),
              borderRadius: "8px",
            }}
            className={`relative group/canvas-item transition-all duration-150 ${
              isDragging && selectedId === component.id
                ? "opacity-30 ring-2 ring-primary/40 rounded-lg"
                : isContainerOver && isDragging
                  ? "ring-2 ring-primary/40 bg-primary/5 rounded-lg"
                  : isSelected
                    ? "ring-2 ring-primary/50 bg-primary/5 rounded-lg"
                    : "hover:ring-1 hover:ring-border rounded-lg"
            }${isInline ? " inline-flex" : ""}`}
            onClick={handleSelect}
            onDoubleClick={handleDoubleClick}
            {...attributes}
            {...listeners}
          >
            {/* Inline edit hover indicator */}
            {isEditable && !isSelected && (
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/canvas-item:opacity-100 transition-opacity duration-150 z-20 pointer-events-none">
                <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm border border-border rounded px-1.5 py-0.5 shadow-sm">
                  <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground font-medium">
                    {allEditableProps && allEditableProps.length > 1 ? "2× click → modifica" : "2× click"}
                  </span>
                </div>
              </div>
            )}

            {/* Selection label */}
            {isSelected && (
              <div className="absolute -top-1.5 left-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-t-md z-10 leading-tight">
                {managed ? `Column ${index + 1}` : component.label}
              </div>
            )}

            {/* Container drop zone hint */}
            {canContain && !isSlotted && isDragging && (
              <div
                className={`absolute inset-0 rounded-lg border-2 border-dashed pointer-events-none transition-colors z-0 ${
                  isContainerOver
                    ? "border-primary/60 bg-primary/5"
                    : "border-primary/20"
                }`}
              />
            )}

            {/* Rendered component content */}
            <div className="relative z-[1]" style={{ padding: canContain ? "0" : "6px 4px" }}>
              {canContain ? (
                <BootstrapRenderer
                  component={component}
                  renderChildren={childrenContent}
                  slotChildren={slotChildrenMap}
                  isDragging={isDragging}
                />
              ) : (
                <div className="pointer-events-none">
                  <BootstrapRenderer component={component} />
                </div>
              )}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {/* Quick insert submenu — only for containers and columns */}
          {canInsertInto && (
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Plus className="mr-2 h-4 w-4" />
                Inserisci
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="max-h-[300px] overflow-y-auto">
                {CATEGORIES.map((cat) => {
                  const catComponents = COMPONENTS.filter(
                    (c) => c.category === cat.id && !c.hidden
                  );
                  if (catComponents.length === 0) return null;
                  return (
                    <ContextMenuSub key={cat.id}>
                      <ContextMenuSubTrigger>
                        {cat.label}
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent className="max-h-[250px] overflow-y-auto">
                        {catComponents.map((comp) => (
                          <ContextMenuItem
                            key={comp.type}
                            onClick={() => handleQuickInsert(comp.type)}
                          >
                            {comp.label}
                          </ContextMenuItem>
                        ))}
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                  );
                })}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
          {canInsertInto && <ContextMenuSeparator />}
          <ContextMenuItem
            disabled={managed}
            onClick={handleDuplicate}
          >
            <ClipboardCopy className="mr-2 h-4 w-4" />
            Duplica
          </ContextMenuItem>
          <ContextMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copia
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+C</span>
          </ContextMenuItem>
          <ContextMenuItem
            disabled={clipboard === null}
            onClick={handlePaste}
          >
            <ClipboardPaste className="mr-2 h-4 w-4" />
            Incolla
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+V</span>
          </ContextMenuItem>
          {!managed && (
            <ContextMenuItem onClick={handleSaveAsTemplate}>
              <BookmarkPlus className="mr-2 h-4 w-4" />
              Salva come template
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem
            disabled={managed}
            onClick={() => moveUp(component.id)}
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Sposta su
          </ContextMenuItem>
          <ContextMenuItem
            disabled={managed}
            onClick={() => moveDown(component.id)}
          >
            <ArrowDown className="mr-2 h-4 w-4" />
            Sposta giù
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            disabled={managed}
            onClick={handleRemove}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Elimina
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      )}

      {/* Save as Template Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5 text-primary" />
              Salva come template
            </DialogTitle>
            <DialogDescription>
              Salva questo componente come template riutilizzabile. Potrai inserirlo in qualsiasi momento dalla sidebar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nome template</label>
              <Input
                value={snippetName}
                onChange={(e) => setSnippetName(e.target.value)}
                placeholder="Es. Hero section, Footer, Login form..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && snippetName.trim()) handleConfirmSave();
                }}
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(false)}>
              Annulla
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmSave}
              disabled={!snippetName.trim()}
            >
              Salva
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showOuterDropIndicators && (
        <DropIndicator
          id={parentId ? `after::${component.id}::${parentId}` : `after::${component.id}`}
          isActive={false}
        />
      )}
    </>
  );
}

// ── Main Canvas ──
// ── Zoom constants ──
const MIN_ZOOM = 25;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;
const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];

export function Canvas({ activeDragId }: { activeDragId: string | null }) {
  const { components, selectComponent, updateComponentProps } = useEditorStore();
  const isDragging = !!activeDragId;

  // ── Zoom state ──
  const [zoom, setZoom] = useState(100);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(100);
  }, []);

  // Ctrl+Scroll to zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((z) => {
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta));
      });
    }
  }, []);

  // ── Inline text editing state ──
  const [inlineEdit, setInlineEdit] = useState<{
    id: string;
    propKey: string;
    rect: DOMRect;
    multiline: boolean;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const committedRef = useRef(false);
  const cancelRef = useRef(false);

  // ── Property picker state (for components with multiple editable props) ──
  const [propPicker, setPropPicker] = useState<{
    id: string;
    props: Array<{ key: string; label: string; multiline: boolean }>;
    rect: DOMRect;
  } | null>(null);

  const { setNodeRef, isOver } = useDroppable({ id: "canvas-root" });

  const handleStartInlineEdit = useCallback(
    (id: string, propKey: string, rect: DOMRect, currentValue: string, multiline: boolean) => {
      committedRef.current = false;
      cancelRef.current = false;
      setPropPicker(null); // Close picker if open
      setInlineEdit({ id, propKey, rect, multiline });
      setEditValue(currentValue);
    },
    []
  );

  const handleShowPropPicker = useCallback(
    (id: string, props: Array<{ key: string; label: string; multiline: boolean }>, rect: DOMRect) => {
      setPropPicker({ id, props, rect });
    },
    []
  );

  const handlePickProp = useCallback(
    (propKey: string, multiline: boolean) => {
      if (!propPicker) return;
      const comp = useEditorStore.getState().findComponent(propPicker.id);
      const currentValue = comp ? String(comp.props[propKey] ?? "") : "";
      handleStartInlineEdit(propPicker.id, propKey, propPicker.rect, currentValue, multiline);
    },
    [propPicker, handleStartInlineEdit]
  );

  const commitEdit = useCallback(() => {
    if (!inlineEdit || committedRef.current || cancelRef.current) return;
    committedRef.current = true;
    updateComponentProps(inlineEdit.id, { [inlineEdit.propKey]: editValue });
    setInlineEdit(null);
  }, [inlineEdit, editValue, updateComponentProps]);

  const handleCancelInlineEdit = useCallback(() => {
    cancelRef.current = true;
    committedRef.current = true;
    setInlineEdit(null);
  }, []);

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
      setPropPicker(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [propPicker]);

  // Close inline editor / prop picker when clicking on canvas background
  const handleCanvasClick = useCallback(() => {
    if (inlineEdit) {
      commitEdit();
    }
    if (propPicker) {
      setPropPicker(null);
    }
    selectComponent(null);
  }, [inlineEdit, commitEdit, propPicker, selectComponent]);

  return (
    <div className="flex-1 flex flex-col h-full bg-muted/30 overflow-hidden">
      {/* Canvas Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              isDragging ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
            }`}
          />
          <span className="text-xs font-medium text-muted-foreground">
            Area di lavoro
          </span>
          <span className="text-xs text-muted-foreground/60">
            {components.length} componente{components.length !== 1 ? "i" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
              className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
              title="Riduci zoom (Ctrl+Scroll)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <select
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-6 w-[58px] text-[11px] text-center bg-muted border-0 rounded px-1 text-muted-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none"
            >
              {[25, 50, 75, 100, 125, 150, 200].map((level) => (
                <option key={level} value={level}>{level}%</option>
              ))}
            </select>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
              title="Aumenta zoom (Ctrl+Scroll)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoom !== 100 && (
              <button
                onClick={handleZoomReset}
                className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Resetta zoom (100%)"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
            <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border font-mono">Ctrl+Z</kbd>
            <span>Annulla</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border font-mono ml-2">Del</kbd>
            <span>Elimina</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border font-mono ml-2">Esc</kbd>
            <span>Deseleziona</span>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        ref={(node) => {
          setNodeRef(node);
          if (node) scrollContainerRef.current = node;
        }}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        className={`flex-1 overflow-auto transition-colors duration-200 ${
          isOver && isDragging ? "bg-primary/5" : ""
        }`}
      >
        <div
          className="w-[95%] mx-auto p-6 origin-top"
          style={{ transform: `scale(${zoom / 100})`, transition: 'transform 150ms ease-out' }}
        >
          {components.length === 0 ? (
            <EmptyCanvas isOver={isOver && isDragging} />
          ) : (
            <div className="space-y-0">
              <DropIndicator
                id="top-drop"
                isActive={false}
                isDragging={isDragging}
                dropHint="Rilascia all'inizio"
              />

              {components.map((comp, index) => (
                <CanvasItem
                  key={comp.id}
                  component={comp}
                  index={index}
                  siblings={components}
                  parentId={null}
                  isDragging={isDragging}
                  depth={0}
                  onStartInlineEdit={handleStartInlineEdit}
                  onShowPropPicker={handleShowPropPicker}
                />
              ))}

              <DropIndicator
                id="bottom-drop"
                isActive={false}
                isDragging={isDragging}
                dropHint="Rilascia alla fine"
              />
              {/* Extra spacer at bottom to ensure the drop zone has room */}
              {isDragging && <div className="h-4" />}
            </div>
          )}
        </div>
      </div>

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
            onMouseDown={(e) => e.preventDefault()}
          >
            {inlineEdit.multiline ? (
              <textarea
                ref={editInputRef as React.RefObject<HTMLTextAreaElement>}
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    commitEdit();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    handleCancelInlineEdit();
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
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitEdit();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    handleCancelInlineEdit();
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
              onMouseDown={(e) => e.preventDefault()}
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
                    onClick={() => handlePickProp(prop.key, prop.multiline)}
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
    </div>
  );
}

// ── Empty state ──
function EmptyCanvas({ isOver }: { isOver: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-32 rounded-2xl border-2 border-dashed transition-all duration-300 ${
        isOver
          ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10"
          : "border-border/60 hover:border-border"
      }`}
    >
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-muted-foreground/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1">
        Trascina i componenti qui
      </p>
      <p className="text-xs text-muted-foreground/60">
        Inizia a costruire la tua interfaccia Bootstrap
      </p>
    </div>
  );
}
