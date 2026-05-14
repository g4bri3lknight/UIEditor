"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CATEGORIES, COMPONENTS } from "@/lib/editor/bootstrap-components";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useEditorStore, isAutoManaged } from "@/store/editor-store";
import type { CanvasComponent } from "@/lib/editor/types";
import {
  LayoutGrid, Type, FileInput, MousePointerClick, Navigation,
  Layers, Table, Image, Wrench, Search, List, Code, EyeOff,
  Bookmark, Trash2, Pencil, Check, X, Plus,
} from "lucide-react";
import { toast } from "sonner";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutGrid, Type, FileInput, MousePointerClick, Navigation,
  Layers, Table, Image, Wrench, Box: LayoutGrid,
  Columns3: LayoutGrid, RectangleVertical: LayoutGrid, Heading: Type,
  AlignLeft: Type, TextQuote: Type, List, Code, TextCursorInput: FileInput,
  AlignJustify: FileInput, ChevronDown: FileInput, CheckSquare: FileInput,
  CircleDot: FileInput, SlidersHorizontal: FileInput, ToggleLeft: FileInput,
  Upload: FileInput, Combine: FileInput, Menu: Navigation, Columns: Navigation,
  ChevronRight: Navigation, ChevronsLeftRight: Navigation, ChevronsUpDown: Navigation,
  CreditCard: Layers, AlertTriangle: Layers, Tag: Layers, BarChart3: Layers,
  Loader2: Layers, ListOrdered: Layers, Bell: Layers, PanelTop: Layers,
  GalleryHorizontalEnd: Layers, AppWindow: Layers, Sidebar: Layers,
  Minus: Wrench, MoveVertical: Wrench, Video: Image, Frame: Image,
  MoreHorizontal: MousePointerClick,
};

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
const TABLE_TYPES = new Set(["table"]);
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

// Filter out hidden components (e.g. col which is auto-managed by row)
const VISIBLE_COMPONENTS = COMPONENTS.filter((c) => !c.hidden);

function DraggablePaletteItem({ type, label, icon }: { type: string; label: string; icon: string }) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: `palette-${type}`,
    data: { type, fromPalette: true },
  });

  const IconComp = ICON_MAP[icon] || LayoutGrid;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        touchAction: "none",
        opacity: isDragging ? 0.4 : 1,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      }}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/30 bg-background cursor-grab active:cursor-grabbing transition-all duration-150 hover:border-primary/30 hover:bg-primary/[0.03] ${
        isDragging ? "shadow-xl ring-2 ring-primary/30 scale-105" : "hover:shadow-sm"
      }`}
    >
      <IconComp className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm font-medium text-foreground truncate">{label}</span>
    </div>
  );
}

// ── Recursive Layer Tree Item ──
function LayerTreeItem({
  component,
  depth,
  selectedId,
  onSelect,
  isHidden,
}: {
  component: CanvasComponent;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  isHidden: boolean;
}) {
  const autoManaged = isAutoManaged(component.type);
  const isSelected = selectedId === component.id;
  const layerIcon = getLayerIcon(component.type);

  return (
    <div>
      <button
        onClick={() => onSelect(component.id)}
        className={`w-full flex items-center gap-2 py-1.5 px-2 text-sm rounded-md transition-colors duration-100 cursor-pointer ${
          isSelected
            ? "bg-primary/10 text-primary border-l-2 border-primary pl-1.5"
            : "text-foreground/80 hover:bg-muted/50 border-l-2 border-transparent"
        } ${autoManaged ? "opacity-50" : ""} ${isHidden && !isSelected ? "opacity-40" : ""}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <span className="shrink-0">
          {React.createElement(layerIcon, {
            className: `w-3.5 h-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`,
          })}
        </span>
        <span className="truncate text-xs">{component.label}</span>
        {isHidden && (
          <EyeOff className="w-3 h-3 text-muted-foreground/60 shrink-0 ml-auto" />
        )}
      </button>
      {component.children && component.children.length > 0 && (
        <div>
          {component.children.map((child) => (
            <LayerTreeItem
              key={child.id}
              component={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              isHidden={isHidden}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Layers Panel ──
function LayersPanel() {
  const components = useEditorStore((s) => s.components);
  const selectedId = useEditorStore((s) => s.selectedId);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const hiddenComponents = useEditorStore((s) => s.hiddenComponents);

  const handleSelect = useCallback(
    (id: string) => {
      selectComponent(id);
    },
    [selectComponent]
  );

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
        <div className="p-2 space-y-0.5">
          {components.map((comp) => (
            <LayerTreeItem
              key={comp.id}
              component={comp}
              depth={0}
              selectedId={selectedId}
              onSelect={handleSelect}
              isHidden={hiddenComponents.has(comp.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ── Helper: count total components in a tree ──
function countComponents(comps: CanvasComponent[]): number {
  let count = 0;
  for (const c of comps) {
    count++;
    if (c.children) count += countComponents(c.children);
  }
  return count;
}

// ── Saved Templates Panel ──
function TemplatesPanel() {
  const savedSnippets = useEditorStore((s) => s.savedSnippets);
  const insertSnippet = useEditorStore((s) => s.insertSnippet);
  const deleteSnippet = useEditorStore((s) => s.deleteSnippet);
  const renameSnippet = useEditorStore((s) => s.renameSnippet);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleInsert = useCallback((snippetId: string) => {
    insertSnippet(snippetId, null);
    toast.success("Template inserito!");
  }, [insertSnippet]);

  const handleDelete = useCallback((snippetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSnippet(snippetId);
    toast.success("Template eliminato");
  }, [deleteSnippet]);

  const handleStartRename = useCallback((snippetId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(snippetId);
    setEditingName(currentName);
  }, []);

  const handleConfirmRename = useCallback(() => {
    if (editingId && editingName.trim()) {
      renameSnippet(editingId, editingName.trim());
      toast.success("Template rinominato");
    }
    setEditingId(null);
  }, [editingId, editingName, renameSnippet]);

  const handleCancelRename = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleToggleExpand = useCallback((snippetId: string) => {
    setExpandedId(prev => prev === snippetId ? null : snippetId);
  }, []);

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
  };

  if (savedSnippets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-12">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
          <Bookmark className="w-5 h-5 text-muted-foreground/50" />
        </div>
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Nessun template salvato.
        </p>
        <p className="text-[11px] text-muted-foreground/60 text-center mt-1">
          Clicca col tasto destro su un componente e seleziona &quot;Salva come template&quot;.
        </p>
      </div>
    );
  }

  // Sort by most recent first
  const sorted = [...savedSnippets].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-3 pt-2 pb-1.5 border-b border-border/50">
        <span className="text-[10px] text-muted-foreground font-medium">
          {savedSnippets.length} template{savedSnippets.length !== 1 ? "s" : ""} salvat{savedSnippets.length !== 1 ? "i" : "o"}
        </span>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-1.5">
          {sorted.map((snippet) => {
            const isEditing = editingId === snippet.id;
            const isExpanded = expandedId === snippet.id;
            const totalComps = countComponents(snippet.components);
            const typeLabels = snippet.components.map(c => c.type);

            return (
              <div
                key={snippet.id}
                className="rounded-lg border border-border/50 bg-background/50 overflow-hidden transition-colors hover:border-primary/20"
              >
                {/* Header */}
                <div className="flex items-start gap-2 px-2.5 py-2">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bookmark className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="h-6 text-xs px-1.5 py-0"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleConfirmRename();
                            if (e.key === "Escape") handleCancelRename();
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleConfirmRename}
                          className="p-0.5 rounded hover:bg-primary/10 text-primary"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="p-0.5 rounded hover:bg-muted text-muted-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-xs font-medium text-foreground truncate">{snippet.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {snippet.components.length} componente{snippet.components.length !== 1 ? "i" : ""}
                            {totalComps !== snippet.components.length && ` (${totalComps} totali)`}
                          </span>
                          <span className="text-[10px] text-muted-foreground/40">·</span>
                          <span className="text-[10px] text-muted-foreground/60">
                            {formatDate(snippet.updatedAt)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 px-2.5 pb-2">
                  <button
                    onClick={() => handleInsert(snippet.id)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Inserisci
                  </button>
                  <button
                    onClick={(e) => handleToggleExpand(snippet.id)}
                    className="px-1.5 py-1 rounded-md text-[11px] text-muted-foreground hover:bg-muted transition-colors"
                    title="Dettagli"
                  >
                    <svg className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="flex-1" />
                  {!isEditing && (
                    <button
                      onClick={(e) => handleStartRename(snippet.id, snippet.name, e)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Rinomina"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(snippet.id, e)}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Elimina"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Expanded: show component types */}
                {isExpanded && (
                  <div className="px-2.5 pb-2 pt-0">
                    <div className="rounded-md bg-muted/50 p-1.5 space-y-0.5">
                      {snippet.components.map((comp, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          {React.createElement(getLayerIcon(comp.type), { className: "w-3 h-3 shrink-0" })}
                          <span className="truncate">{comp.label}</span>
                          {comp.children && comp.children.length > 0 && (
                            <span className="text-[9px] text-muted-foreground/50 ml-auto shrink-0">
                              {countComponents(comp.children)} figli
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

interface LeftSidebarProps {
  width: number;
}

export function LeftSidebar({ width }: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<"componenti" | "livelli" | "template">("componenti");
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CATEGORIES.map((c) => c.id))
  );

  const savedSnippetsCount = useEditorStore((s) => s.savedSnippets.length);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredComponents = search
    ? VISIBLE_COMPONENTS.filter(
        (c) =>
          c.label.toLowerCase().includes(search.toLowerCase()) ||
          c.type.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase())
      )
    : VISIBLE_COMPONENTS;

  const filteredCategories = search
    ? CATEGORIES.filter((cat) =>
        filteredComponents.some((c) => c.category === cat.id)
      )
    : CATEGORIES;

  const catIconMap: Record<string, React.ElementType> = {
    layout: LayoutGrid, typography: Type, forms: FileInput, buttons: MousePointerClick,
    navigation: Navigation, content: Layers, tables: Table, images: Image, utilities: Wrench,
  };

  return (
    <div
      className="border-r border-border bg-card flex flex-col h-full shrink-0 overflow-hidden"
      style={{ width: `${width}px` }}
    >
      {/* Tab Switcher */}
      <div className="flex gap-1 p-2 border-b border-border shrink-0">
        <button
          onClick={() => setActiveTab("componenti")}
          className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-colors duration-150 ${
            activeTab === "componenti"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Componenti
        </button>
        <button
          onClick={() => setActiveTab("livelli")}
          className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-colors duration-150 ${
            activeTab === "livelli"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Livelli
        </button>
        <button
          onClick={() => setActiveTab("template")}
          className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-colors duration-150 relative ${
            activeTab === "template"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Template
          {savedSnippetsCount > 0 && (
            <span className={`ml-1 text-[9px] leading-none rounded-full px-1 py-0.5 font-bold ${
              activeTab === "template"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-primary text-primary-foreground"
            }`}>
              {savedSnippetsCount}
            </span>
          )}
        </button>
      </div>

      {/* Componenti Tab */}
      {activeTab === "componenti" && (
        <>
          <div className="p-3 border-b border-border shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Cerca componenti..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-2 space-y-2">
              {filteredCategories.map((category) => {
                const CatIcon = catIconMap[category.id] || LayoutGrid;
                const components = filteredComponents.filter(
                  (c) => c.category === category.id
                );
                const isExpanded = expandedCategories.has(category.id);

                return (
                  <div
                    key={category.id}
                    className={`rounded-lg border transition-colors duration-150 ${
                      isExpanded
                        ? "border-primary/15 bg-primary/[0.02]"
                        : "border-border/50 bg-background/50"
                    }`}
                  >
                    {/* Group header */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-t-lg transition-colors text-left group hover:bg-primary/[0.05] ${
                        !isExpanded ? "rounded-b-lg" : ""
                      }`}
                    >
                      <CatIcon className={`w-3.5 h-3.5 transition-colors ${isExpanded ? "text-primary" : "text-primary/60"}`} />
                      <span className={`text-xs font-semibold flex-1 ${isExpanded ? "text-foreground" : "text-muted-foreground"}`}>
                        {category.label}
                      </span>
                      <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-medium ${
                        isExpanded
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground/60 bg-muted"
                      }`}>
                        {components.length}
                      </span>
                      <svg
                        className={`w-3 h-3 transition-transform duration-200 ${
                          isExpanded ? "text-primary/60 rotate-90" : "text-muted-foreground/40"
                        }`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Group content */}
                    {isExpanded && (
                      <div className="px-1.5 pb-1.5 pt-0.5 space-y-1">
                        {components.map((comp) => (
                          <DraggablePaletteItem
                            key={comp.type}
                            type={comp.type}
                            label={comp.label}
                            icon={comp.icon}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </>
      )}

      {/* Livelli Tab */}
      {activeTab === "livelli" && <LayersPanel />}

      {/* Template Tab */}
      {activeTab === "template" && <TemplatesPanel />}
    </div>
  );
}
