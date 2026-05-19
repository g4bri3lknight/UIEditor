"use client";

import React, { useCallback, useState, memo } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
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
  Eye,
  EyeOff,
} from "lucide-react";
import { useEditorStore, isContainer, isAutoManaged, isSlottedType, getTabSlots, getAccordionSlots } from "@/store/editor-store";
import { BootstrapRenderer } from "../BootstrapRenderer";
import { CanvasComponent } from "@/lib/editor/types";
import { COMPONENTS, CATEGORIES } from "@/lib/editor/bootstrap-components";
import { toast } from "sonner";
import { EDITABLE_TEXT_PROPS, getFirstEditableProp, INLINE_TYPES } from "./constants";
import { DropIndicator } from "./DropIndicator";
import { SlotDropZone } from "./SlotDropZone";

interface CanvasItemProps {
  component: CanvasComponent;
  index: number;
  siblings: CanvasComponent[];
  parentId: string | null;
  isDragging: boolean;
  depth?: number;
  onStartInlineEdit: (id: string, propKey: string, rect: DOMRect, currentValue: string, multiline: boolean) => void;
  onShowPropPicker: (id: string, props: Array<{ key: string; label: string; multiline: boolean }>, rect: DOMRect) => void;
}

/**
 * PERF-3: Custom comparison for React.memo.
 * Compares props by value where references may change on immutable tree updates.
 * - component: compare by id + shallow props (references change on ancestor updates)
 * - siblings: not used in rendering, skip comparison
 * - other props: reference equality
 */
function areCanvasItemPropsEqual(prev: CanvasItemProps, next: CanvasItemProps): boolean {
  // Quick checks for primitive props
  if (
    prev.index !== next.index ||
    prev.parentId !== next.parentId ||
    prev.isDragging !== next.isDragging ||
    prev.depth !== next.depth ||
    prev.onStartInlineEdit !== next.onStartInlineEdit ||
    prev.onShowPropPicker !== next.onShowPropPicker
  ) {
    return false;
  }

  // Component comparison — references change on ancestor updates even if data is the same
  const pc = prev.component;
  const nc = next.component;
  if (pc === nc) return true; // Same reference → definitely equal
  if (pc.id !== nc.id || pc.type !== nc.type || pc.label !== nc.label || pc.slot !== nc.slot) return false;

  // Shallow compare props object
  const pp = pc.props;
  const np = nc.props;
  if (pp === np) return true;
  const prevKeys = Object.keys(pp);
  const nextKeys = Object.keys(np);
  if (prevKeys.length !== nextKeys.length) return false;
  for (const key of prevKeys) {
    if (pp[key] !== np[key]) return false;
  }

  // Compare children reference — if children changed, parent must re-render to pass new data
  if (pc.children !== nc.children) return false;

  return true;
}

function CanvasItemInner({
  component,
  index,
  parentId,
  isDragging,
  depth = 0,
  onStartInlineEdit,
  onShowPropPicker,
}: CanvasItemProps) {
  // ── PERF-3: Targeted store selectors ──
  // Instead of subscribing to the entire store (which causes ALL CanvasItems to re-render
  // on ANY store change), only subscribe to values that affect THIS specific component.
  // - isSelected: only changes when this component's selection state changes
  // - isHidden: only changes when this component's visibility changes
  // - hasClipboard: changes when clipboard is set/cleared (infrequent, all items share this)
  const isSelected = useEditorStore(s => s.selectedId === component.id);
  const isHidden = useEditorStore(s => s.hiddenComponents.includes(component.id));
  const hasClipboard = useEditorStore(s => s.clipboard !== null);
  const isInMultiSelection = useEditorStore(s => s.selectedIds.includes(component.id));

  // For col components: subscribe directly to size changes to ensure visual resize
  // This guarantees the component re-renders when the flex width changes,
  // even if the parent's memo comparison fails to propagate the update.
  const colSize = useEditorStore(
    useCallback(s => {
      if (component.type !== "col") return null;
      // Walk the tree to find this component's current size
      const find = (comps: CanvasComponent[]): string | null => {
        for (const c of comps) {
          if (c.id === component.id) return String(c.props.size || "auto");
          if (c.children) {
            const r = find(c.children);
            if (r !== null) return r;
          }
        }
        return null;
      };
      return find(s.components);
    }, [component.id, component.type])
  );

  // Canvas-only collapsed state for Modal, Offcanvas, Dropdown
  const COLLAPSIBLE_TYPES = new Set(["modal", "offcanvas", "dropdown"]);
  const isCollapsible = COLLAPSIBLE_TYPES.has(component.type);
  const isCollapsed = useEditorStore(s => isCollapsible && s.collapsedComponents.includes(component.id));

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

  // ── PERF-2: Droppable — disable when not dragging to reduce collision detection overhead ──
  const {
    setNodeRef: setDropRef,
    isOver: isContainerOver,
  } = useDroppable({
    id: `container-${component.id}`,
    data: { type: "container-drop", componentId: component.id },
    disabled: !canContain || component.type === "table" || component.type === "table-row" || !isDragging,
  });

  const dragStyle: React.CSSProperties = {
    ...(transform
      ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 }
      : {}),
    touchAction: "none",
  };

  // Col components: use flex-grow proportional to size (12-column grid)
  // Use colSize from direct store subscription to guarantee visual update
  if (component.type === "col") {
    const size = colSize ?? String(component.props.size || "auto");
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

  // ── PERF-3: Use store.getState() for actions in callbacks ──
  // Actions are stable references in Zustand, but using getState() avoids
  // subscribing to the store just for action references.
  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const store = useEditorStore.getState();
      // Multi-selection support (FEAT-7)
      if (e.shiftKey) {
        // Shift+Click: add/remove from multi-selection
        if (isInMultiSelection) {
          store.removeFromSelection(component.id);
        } else {
          store.addToSelection(component.id);
        }
      } else if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd+Click: toggle in multi-selection
        store.toggleInSelection(component.id);
      } else {
        // Normal click: single selection
        store.selectComponent(component.id);
      }
    },
    [component.id, isInMultiSelection]
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
    useEditorStore.getState().duplicateComponent(component.id);
    toast.success("Componente duplicato");
  }, [component.id]);

  const handleCopy = useCallback(() => {
    useEditorStore.getState().copyComponent(component.id);
    toast.success("Componente copiato");
  }, [component.id]);

  const handlePaste = useCallback(() => {
    useEditorStore.getState().pasteComponent();
    toast.success("Componente incollato");
  }, []);

  const handleRemove = useCallback(() => {
    useEditorStore.getState().removeComponent(component.id);
    toast.success("Componente eliminato");
  }, [component.id]);

  // Save as template
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [snippetName, setSnippetName] = useState("");

  const handleSaveAsTemplate = () => {
    setSnippetName(component.label);
    setSaveDialogOpen(true);
  };

  const handleConfirmSave = () => {
    useEditorStore.getState().saveSnippet(snippetName, [component.id]);
    setSaveDialogOpen(false);
    toast.success("Template salvato!");
  };

  // Quick insert via context menu
  const handleQuickInsert = useCallback((type: string) => {
    useEditorStore.getState().addComponent(type, component.id, undefined, isSlotted ? "body" : undefined);
    toast.success(`${COMPONENTS.find(c => c.type === type)?.label || type} aggiunto`);
  }, [component.id, isSlotted]);

  // Determine target for quick insert (container or column inside slotted types)
  const canInsertInto = canContain || managed;

  // ── Build children content (split by slot for slotted types) ──
  // PERF-2: Only render DropIndicators when isDragging is true — this dramatically
  // reduces the number of registered droppables during idle state.
  const renderSlotContent = useCallback((slotChildren: CanvasComponent[]) => {
    if (slotChildren.length === 0) return null;
    return (
      <>
        {slotChildren.map((child, i) => (
          <React.Fragment key={child.id}>
            {isDragging && (
              <DropIndicator
                id={`before::${child.id}::${component.id}`}
                isActive={false}
                disabled={!isDragging}
              />
            )}
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
            {isDragging && (
              <DropIndicator
                id={`after::${child.id}::${component.id}`}
                isActive={false}
                disabled={!isDragging}
              />
            )}
          </React.Fragment>
        ))}
        {isDragging && (
          <DropIndicator
            id={`bottom-slot-${component.id}-${slotChildren[0]?.slot || "body"}`}
            isActive={false}
            disabled={!isDragging}
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
            {isDragging && !skipDropIndicators && (
              <DropIndicator
                id={`before::${child.id}::${component.id}`}
                isActive={false}
                disabled={!isDragging}
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
            {isDragging && !skipDropIndicators && (
              <DropIndicator
                id={`after::${child.id}::${component.id}`}
                isActive={false}
                disabled={!isDragging}
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
            disabled={!isDragging}
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

  // If this component is collapsed in the canvas, show a minimal placeholder
  if (isCollapsed) {
    return (
      <>
        {showOuterDropIndicators && isDragging && (
          <DropIndicator
            id={parentId ? `before::${component.id}::${parentId}` : `before::${component.id}`}
            isActive={false}
            disabled={!isDragging}
          />
        )}
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              ref={mergedRef}
              style={{
                ...dragStyle,
                borderRadius: "8px",
              }}
              className={`relative group/canvas-item transition-all duration-150 ${
                isSelected
                  ? "ring-2 ring-primary/50 bg-primary/5 rounded-lg"
                  : "hover:ring-1 hover:ring-border rounded-lg"
              }`}
              onClick={handleSelect}
              onDoubleClick={handleDoubleClick}
              {...attributes}
              {...listeners}
            >
              {isSelected && (
                <div className="absolute -top-1.5 left-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-t-md z-10 leading-tight">
                  {component.label}
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <EyeOff className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{component.label}</span>
                  <span className="text-[10px] text-muted-foreground/60">({component.type} — compresso)</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    useEditorStore.getState().toggleComponentCollapsed(component.id);
                  }}
                  className="ml-auto p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Espandi nel canvas"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
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
              disabled={!hasClipboard}
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
              onClick={() => useEditorStore.getState().moveUp(component.id)}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Sposta su
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => useEditorStore.getState().moveDown(component.id)}
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
        {showOuterDropIndicators && isDragging && (
          <DropIndicator
            id={parentId ? `after::${component.id}::${parentId}` : `after::${component.id}`}
            isActive={false}
            disabled={!isDragging}
          />
        )}
      </>
    );
  }

  return (
    <>
      {showOuterDropIndicators && isDragging && (
        <DropIndicator
          id={parentId ? `before::${component.id}::${parentId}` : `before::${component.id}`}
          isActive={false}
          disabled={!isDragging}
        />
      )}

      {/* Table structure: render <tr>/<td> directly with ContextMenu support.
          ContextMenuTrigger uses asChild so it doesn't create wrapper divs inside <tbody>.
          ContextMenuContent renders via portal (outside the DOM tree), so no HTML nesting issues. */}
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
          /* table-cell: wrap in ContextMenu for insert/paste/delete support */
          <ContextMenu>
            <ContextMenuTrigger asChild>
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
            </ContextMenuTrigger>
            <ContextMenuContent>
              {/* Insert submenu for table cells */}
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
              <ContextMenuSeparator />
              <ContextMenuItem
                disabled={!hasClipboard}
                onClick={handlePaste}
              >
                <ClipboardPaste className="mr-2 h-4 w-4" />
                Incolla
                <span className="ml-auto text-xs text-muted-foreground">Ctrl+V</span>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copia
                <span className="ml-auto text-xs text-muted-foreground">Ctrl+C</span>
              </ContextMenuItem>
              <ContextMenuItem onClick={handleDuplicate}>
                <ClipboardCopy className="mr-2 h-4 w-4" />
                Duplica
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                disabled={!hasClipboard}
                onClick={handleRemove}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
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
              // PERF-1: content-visibility auto — lets the browser skip paint/layout
              // for off-screen components. contain-intrinsic-size provides a fallback
              // height estimate so scroll position doesn't jump.
              // NOTE: Disabled for col components because it interferes with flex layout
              // recalculation during column resize (browser caches intrinsic size).
              ...(component.type !== "col" ? {
                contentVisibility: "auto" as React.CSSProperties["contentVisibility"],
                containIntrinsicSize: "auto 80px",
              } : {}),
            }}
            // NOTE: For col components, avoid transitioning `flex` to prevent
            // animation delay during inline resize. Use specific transitions instead.
            className={`relative group/canvas-item ${component.type === "col" ? "transition-[outline,box-shadow,background-color,opacity] duration-150" : "transition-all duration-150"} ${
              isDragging && isSelected
                ? "opacity-30 ring-2 ring-primary/40 rounded-lg"
                : isContainerOver && isDragging
                  ? "ring-2 ring-primary/40 bg-primary/5 rounded-lg"
                  : isSelected
                    ? "ring-2 ring-primary/50 bg-primary/5 rounded-lg"
                    : isInMultiSelection
                      ? "ring-2 ring-amber-400/60 bg-amber-50/30 dark:bg-amber-900/10 rounded-lg"
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
              <div className="absolute -top-1.5 left-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-t-md z-10 leading-tight flex items-center gap-1">
                <span>{managed ? `Column ${index + 1}` : component.label}</span>
                {isCollapsible && !isCollapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      useEditorStore.getState().toggleComponentCollapsed(component.id);
                    }}
                    className="ml-1 hover:bg-primary-foreground/20 rounded p-0.5 transition-colors"
                    title="Comprimi nel canvas"
                  >
                    <EyeOff className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            )}

            {/* Multi-selection indicator — amber badge for secondary selection */}
            {isInMultiSelection && !isSelected && (
              <div className="absolute -top-1.5 left-2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-t-md z-10 leading-tight">
                {managed ? `Col ${index + 1}` : component.label}
              </div>
            )}

            {/* Column resize handle — only when selected */}
            {component.type === "col" && isSelected && (
              <ColumnResizeHandle componentId={component.id} currentSize={Number(colSize ?? component.props.size) || 12} />
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
            disabled={!hasClipboard}
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
            onClick={() => useEditorStore.getState().moveUp(component.id)}
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Sposta su
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => useEditorStore.getState().moveDown(component.id)}
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

      {showOuterDropIndicators && isDragging && (
        <DropIndicator
          id={parentId ? `after::${component.id}::${parentId}` : `after::${component.id}`}
          isActive={false}
          disabled={!isDragging}
        />
      )}
    </>
  );
}

// ── Column Resize Handle with Tooltip ──
// Separate component to manage its own local state for the resize tooltip.
// Uses document-level pointer events so the drag continues even if the cursor
// leaves the handle area. Also avoids pushing a history entry on every pointer
// move — instead it updates props silently and pushes history once on pointer-up.
function ColumnResizeHandle({
  componentId,
  currentSize,
}: {
  componentId: string;
  currentSize: number;
}) {
  const [previewSize, setPreviewSize] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const colEl = (e.currentTarget as HTMLElement).parentElement!;
      const startX = e.clientX;
      const startWidth = colEl.offsetWidth;
      const startSize = currentSize;

      // Calculate width per grid unit from current column
      const pxPerUnit = startWidth / startSize;

      let lastAppliedSize = startSize;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - startX;
        const deltaUnits = Math.round(dx / pxPerUnit);
        const newSize = Math.max(1, Math.min(12, startSize + deltaUnits));
        setPreviewSize(newSize);
        if (newSize !== lastAppliedSize) {
          lastAppliedSize = newSize;
          // Use a lightweight update that doesn't push history
          // We'll push history once on pointer up
          useEditorStore.setState(s => {
            const updateInTree = (comps: CanvasComponent[]): CanvasComponent[] =>
              comps.map(c => {
                if (c.id === componentId) {
                  return { ...c, props: { ...c.props, size: String(newSize) } };
                }
                if (c.children) return { ...c, children: updateInTree(c.children) };
                return c;
              });
            return { components: updateInTree(s.components) };
          });
        }
      };

      const handlePointerUp = () => {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        setPreviewSize(null);
        setIsResizing(false);
        // Push history once at the end of the resize
        useEditorStore.getState().pushHistory();
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      setIsResizing(true);
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    },
    [componentId, currentSize]
  );

  return (
    <div
      className="absolute top-0 right-0 bottom-0 w-3 cursor-col-resize z-20 group/col-resize"
      onPointerDown={handlePointerDown}
      title="Trascina per ridimensionare"
    >
      <div className="absolute top-1/2 right-0.5 -translate-y-1/2 w-0.5 h-8 bg-primary/30 group-hover/col-resize:bg-primary/70 transition-colors rounded-full" />

      {/* Resize tooltip — shows n/12 during drag */}
      {(previewSize !== null || isResizing) && previewSize !== null && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-30 pointer-events-none">
          {previewSize}/12
        </div>
      )}
    </div>
  );
}

// PERF-3: Wrap with React.memo and custom comparison to prevent cascade re-renders.
// Only re-renders when this specific component's props or state actually changed.
export const CanvasItem = memo(CanvasItemInner);
