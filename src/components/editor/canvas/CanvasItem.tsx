"use client";

import React, { useCallback, useState } from "react";
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

export function CanvasItem({
  component,
  index,
  siblings,
  parentId,
  isDragging,
  depth = 0,
  onStartInlineEdit,
  onShowPropPicker,
}: CanvasItemProps) {
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
  const isHidden = hiddenComponents.includes(component.id);
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
                disabled={clipboard === null}
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
                disabled={clipboard === null}
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
