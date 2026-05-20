"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useEditorStore, isAutoManaged, isSlottedType } from "@/store/editor-store";
import type { CanvasComponent } from "@/lib/editor/types";
import {
  LayoutGrid, Type, FileInput, MousePointerClick, Navigation,
  Layers, Table, Image, Wrench, ChevronRight, EyeOff, Eye,
  ArrowUp, ArrowDown, Trash2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

// ── Icon lookup for component types in the Layers tree ──
const LAYOUT_TYPES = new Set(["container", "row", "col"]);
const TYPOGRAPHY_TYPES = new Set(["heading", "paragraph", "blockquote", "list", "code-block"]);
const FORM_TYPES = new Set([
  "input", "textarea", "select-input", "checkbox", "radio",
  "range", "switch", "file-input", "input-group",
]);
const BUTTON_TYPES = new Set(["button", "button-group"]);
const NAVIGATION_TYPES = new Set(["navbar", "nav-tabs", "breadcrumb", "pagination", "dropdown"]);
const CONTENT_TYPES = new Set([
  "card", "modal", "alert", "offcanvas", "badge", "spinner",
  "accordion", "carousel", "jumbotron", "progress", "toast",
]);
const TABLE_TYPES = new Set(["table", "table-row", "table-cell"]);
const IMAGE_TYPES = new Set(["image", "video"]);

function getLayerIcon(type: string): React.ElementType {
  if (LAYOUT_TYPES.has(type)) return LayoutGrid;
  if (TYPOGRAPHY_TYPES.has(type)) return Type;
  if (FORM_TYPES.has(type)) return FileInput;
  if (BUTTON_TYPES.has(type)) return MousePointerClick;
  if (NAVIGATION_TYPES.has(type)) return Navigation;
  if (CONTENT_TYPES.has(type)) return Layers;
  if (TABLE_TYPES.has(type)) return Table;
  if (IMAGE_TYPES.has(type)) return Image;
  return Wrench;
}

// ── Slot order for slotted components ──
// Returns a numeric sort key so children appear in the same visual order as the canvas
function getSlotSortKey(parentType: string, slot: string | undefined): number {
  if (!slot) return 1; // no slot = body
  if (parentType === "tab-content") {
    const m = slot.match(/^tab-(\d+)$/);
    return m ? parseInt(m[1]) : 0;
  }
  if (parentType === "accordion") {
    const m = slot.match(/^acc-(\d+)$/);
    return m ? parseInt(m[1]) : 0;
  }
  // card, modal, offcanvas, collapse
  if (slot === "header") return 0;
  if (slot === "body") return 1;
  if (slot === "footer") return 2;
  return 3;
}

// ── Recursive Layer Tree Item ──
function LayerTreeItem({
  component,
  depth,
  selectedId,
  hiddenComponents,
  onSelect,
  onToggleVisibility,
  expandedNodes,
  toggleExpand,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
  parentType,
}: {
  component: CanvasComponent;
  depth: number;
  selectedId: string | null;
  hiddenComponents: string[];
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  expandedNodes: Set<string>;
  toggleExpand: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  canMoveUp: (id: string) => boolean;
  canMoveDown: (id: string) => boolean;
  parentType?: string;
}) {
  const autoManaged = isAutoManaged(component.type);
  const isSelected = selectedId === component.id;
  const isHidden = hiddenComponents.includes(component.id);
  const layerIcon = getLayerIcon(component.type);
  const hasChildren = component.children && component.children.length > 0;
  const isExpanded = expandedNodes.has(component.id);

  // Sort children by slot order for slotted components so the tree
  // matches the visual order on the canvas (header → body → footer)
  const sortedChildren = useMemo(() => {
    if (!component.children || component.children.length === 0) return [];
    if (isSlottedType(component.type)) {
      return [...component.children].sort((a, b) =>
        getSlotSortKey(component.type, a.slot) - getSlotSortKey(component.type, b.slot)
      );
    }
    return component.children;
  }, [component.children, component.type]);

  return (
    <div>
      <div
        className={`group flex items-center gap-0.5 py-0.5 pr-1 rounded-md transition-colors duration-100 ${
          isSelected
            ? "bg-primary/10"
            : "hover:bg-muted/50"
        } ${autoManaged ? "opacity-60" : ""} ${isHidden && !isSelected ? "opacity-40" : ""}`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
      >
        {/* Expand/collapse toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleExpand(component.id); }}
          className={`shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors ${
            hasChildren ? "hover:bg-muted cursor-pointer" : "cursor-default"
          }`}
        >
          {hasChildren ? (
            <ChevronRight
              className={`w-3 h-3 text-muted-foreground transition-transform duration-150 ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          ) : (
            <span className="w-3 h-3" />
          )}
        </button>

        {/* Main clickable area */}
        <button
          onClick={() => onSelect(component.id)}
          className={`flex-1 flex items-center gap-1.5 py-1 px-1 rounded text-sm transition-colors duration-100 cursor-pointer min-w-0 ${
            isSelected
              ? "text-primary"
              : "text-foreground/80"
          }`}
        >
          {React.createElement(layerIcon, {
            className: `w-3.5 h-3.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`,
          })}
          <span className="truncate text-xs">{component.label}</span>
          {/* Slot badge for children inside slotted components */}
          {parentType && isSlottedType(parentType) && component.slot && (
            <span className="text-[9px] text-muted-foreground/60 bg-muted/60 rounded px-1 py-px shrink-0">
              {component.slot}
            </span>
          )}
        </button>

        {/* Action buttons — visible on hover or when selected */}
        <div className={`shrink-0 flex items-center gap-0.5 transition-opacity duration-100 ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}>
          {/* Toggle visibility */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(component.id); }}
            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title={isHidden ? "Mostra" : "Nascondi"}
          >
            {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          {/* Move up/down */}
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(component.id); }}
            disabled={!canMoveUp(component.id)}
            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-default transition-colors"
            title="Sposta su"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(component.id); }}
            disabled={!canMoveDown(component.id)}
            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-default transition-colors"
            title="Sposta giù"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
          {/* Delete — hidden for auto-managed types (col, table-row, table-cell) */}
          {!autoManaged && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(component.id); }}
              className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Elimina"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      {/* Children — only rendered if expanded */}
      {hasChildren && isExpanded && (
        <div>
          {sortedChildren.map((child) => (
            <LayerTreeItem
              key={child.id}
              component={child}
              depth={depth + 1}
              selectedId={selectedId}
              hiddenComponents={hiddenComponents}
              onSelect={onSelect}
              onToggleVisibility={onToggleVisibility}
              expandedNodes={expandedNodes}
              toggleExpand={toggleExpand}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDelete={onDelete}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
              parentType={component.type}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Layers Panel ──
export function LayersPanel() {
  const components = useEditorStore((s) => s.components);
  const selectedId = useEditorStore((s) => s.selectedId);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const hiddenComponents = useEditorStore((s) => s.hiddenComponents);
  const moveUp = useEditorStore((s) => s.moveUp);
  const moveDown = useEditorStore((s) => s.moveDown);
  const getParentInfo = useEditorStore((s) => s.getParentInfo);
  const removeComponent = useEditorStore((s) => s.removeComponent);
  const toggleComponentVisibility = useEditorStore((s) => s.toggleComponentVisibility);

  const [expandedNodesRaw, setExpandedNodes] = useState<Set<string>>(() => {
    // Auto-expand root-level items with children
    const initial = new Set<string>();
    const expandWithChildren = (comps: CanvasComponent[]) => {
      for (const c of comps) {
        if (c.children && c.children.length > 0) {
          initial.add(c.id);
          expandWithChildren(c.children);
        }
      }
    };
    expandWithChildren(components);
    return initial;
  });

  // Compute expanded nodes from components — derive state instead of syncing via effect
  const expandedNodes = React.useMemo(() => {
    const prev = expandedNodesRaw;
    const next = new Set(prev);
    const addNew = (comps: CanvasComponent[]) => {
      for (const c of comps) {
        if (c.children && c.children.length > 0) {
          if (!prev.has(c.id)) next.add(c.id); // Auto-expand new containers
          addNew(c.children);
        }
      }
    };
    addNew(components);
    return next.size === prev.size && [...next].every(id => prev.has(id)) ? prev : next;
  }, [components, expandedNodesRaw]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      selectComponent(id);
    },
    [selectComponent]
  );

  // ── Move up/down logic ── Use store's moveUp/moveDown directly
  const handleMoveUp = useCallback((id: string) => {
    moveUp(id);
  }, [moveUp]);

  const handleMoveDown = useCallback((id: string) => {
    moveDown(id);
  }, [moveDown]);

  const handleDelete = useCallback((id: string) => {
    removeComponent(id);
    toast.success("Componente eliminato");
  }, [removeComponent]);

  const handleToggleVisibility = useCallback((id: string) => {
    toggleComponentVisibility(id);
  }, [toggleComponentVisibility]);

  const checkCanMoveUp = useCallback((id: string): boolean => {
    const info = getParentInfo(id);
    if (!info) return false;
    return info.index > 0;
  }, [getParentInfo]);

  const checkCanMoveDown = useCallback((id: string): boolean => {
    const info = getParentInfo(id);
    if (!info) return false;
    const { parent, index } = info;
    const siblings = parent ? (parent.children || []) : useEditorStore.getState().components;
    return index < siblings.length - 1;
  }, [getParentInfo]);

  // ── Count components by type ──
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const countRecursive = (comps: CanvasComponent[]) => {
      for (const c of comps) {
        counts[c.type] = (counts[c.type] || 0) + 1;
        if (c.children) countRecursive(c.children);
      }
    };
    countRecursive(components);
    return counts;
  }, [components]);

  if (components.length === 0) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <p className="text-xs text-muted-foreground text-center">
          Nessun componente sulla canvas
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Component count summary */}
      <div className="shrink-0 px-2 pt-2 pb-1 border-b border-border/50">
        <div className="flex flex-wrap gap-1">
          {Object.entries(typeCounts).map(([type, count]) => {
            const icon = getLayerIcon(type);
            return (
              <span
                key={type}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground"
              >
                {React.createElement(icon, { className: "w-3 h-3" })}
                <span className="text-[10px] font-medium leading-none">{count}</span>
              </span>
            );
          })}
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-0.5 pb-12">
          {components.map((comp) => (
            <LayerTreeItem
              key={comp.id}
              component={comp}
              depth={0}
              selectedId={selectedId}
              hiddenComponents={hiddenComponents}
              onSelect={handleSelect}
              onToggleVisibility={handleToggleVisibility}
              expandedNodes={expandedNodes}
              toggleExpand={toggleExpand}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onDelete={handleDelete}
              canMoveUp={checkCanMoveUp}
              canMoveDown={checkCanMoveDown}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Export getLayerIcon so TemplatesPanel can reuse it
export { getLayerIcon };
