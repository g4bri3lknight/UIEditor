"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CATEGORIES, COMPONENTS } from "@/lib/editor/bootstrap-components";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  LayoutGrid, Type, FileInput, MousePointerClick, Navigation,
  Layers, Table, Image, Wrench, Search,
  ChevronsDownUp, ChevronsUpDown,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutGrid, Type, FileInput, MousePointerClick, Navigation,
  Layers, Table, Image, Wrench, Box: LayoutGrid,
  Columns3: LayoutGrid, RectangleVertical: LayoutGrid, Heading: Type,
  AlignLeft: Type, TextQuote: Type, List: LayoutGrid, Code: LayoutGrid, TextCursorInput: FileInput,
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
      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-foreground/[0.05] ${
        isDragging ? "shadow-xl ring-2 ring-primary/30 scale-105 bg-background" : ""
      }`}
    >
      <IconComp className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
      <span className="text-[13px] font-normal text-foreground/90 truncate">{label}</span>
    </div>
  );
}

interface ComponentPaletteProps {
  search: string;
  onSearchChange: (s: string) => void;
  expandedCategories: Set<string>;
  onToggleCategory: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function ComponentPalette({ search, onSearchChange, expandedCategories, onToggleCategory, onExpandAll, onCollapseAll }: ComponentPaletteProps) {
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

  // Whether every category is already expanded / collapsed — used to
  // disable the corresponding bulk button so the user gets feedback that
  // there's nothing more to toggle.
  const allExpanded = expandedCategories.size >= CATEGORIES.length;
  const allCollapsed = expandedCategories.size === 0;

  return (
    <>
      <div className="p-3 border-b ios-border-subtle shrink-0 flex items-center gap-1.5">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Cerca componenti..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/80 border-0 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>
        {/* Bulk expand / collapse controls — kept OUTSIDE the search field
            so they read as separate actions, not part of the text input. */}
        <button
          type="button"
          onClick={onExpandAll}
          disabled={allExpanded}
          title="Espandi tutte le categorie"
          aria-label="Espandi tutte le categorie"
          className="flex items-center justify-center w-8 h-8 rounded-lg border ios-border-subtle bg-muted/60 text-foreground/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 disabled:opacity-30 disabled:hover:bg-muted/60 disabled:hover:text-foreground/60 disabled:hover:border-transparent transition-colors"
        >
          <ChevronsUpDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onCollapseAll}
          disabled={allCollapsed}
          title="Collassa tutte le categorie"
          aria-label="Collassa tutte le categorie"
          className="flex items-center justify-center w-8 h-8 rounded-lg border ios-border-subtle bg-muted/60 text-foreground/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 disabled:opacity-30 disabled:hover:bg-muted/60 disabled:hover:text-foreground/60 disabled:hover:border-transparent transition-colors"
        >
          <ChevronsDownUp className="w-4 h-4" />
        </button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-2">
          {filteredCategories.map((category) => {
            const CatIcon = catIconMap[category.id] || LayoutGrid;
            const components = filteredComponents.filter(
              (c) => c.category === category.id
            );
            // Auto-expand every category while a search is active, so the
            // user immediately sees the matching components without having
            // to click each header.
            const isExpanded = !!search || expandedCategories.has(category.id);

            return (
              <div
                key={category.id}
                className={`rounded-xl overflow-hidden transition-colors duration-200 ${
                  isExpanded
                    ? "border ios-border-group-component bg-muted/30"
                    : "border ios-border-subtle bg-muted/40 hover:bg-muted/60"
                }`}
              >
                {/* Group header — visually prominent so it reads as a
                    container rather than as another component. */}
                <button
                  onClick={() => onToggleCategory(category.id)}
                  className={`flex items-center gap-2 w-full px-3 py-2.5 transition-colors text-left group ${
                    isExpanded ? "rounded-t-xl" : "rounded-xl"
                  } hover:bg-primary/[0.06]`}
                >
                  <span className={`flex items-center justify-center w-6 h-6 rounded-lg shrink-0 transition-colors ${
                    isExpanded ? "bg-primary/15 text-primary" : "bg-foreground/5 text-foreground/60"
                  }`}>
                    <CatIcon className="w-3.5 h-3.5" />
                  </span>
                  <span className={`text-[13px] font-bold tracking-tight flex-1 truncate ${
                    isExpanded ? "text-foreground" : "text-foreground/80"
                  }`}>
                    {category.label}
                  </span>
                  <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-semibold tabular-nums ${
                    isExpanded
                      ? "text-primary bg-primary/10"
                      : "text-foreground/50 bg-foreground/5"
                  }`}>
                    {components.length}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                      isExpanded ? "text-primary rotate-90" : "text-foreground/40"
                    }`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Group content — flatter, more subdued than the header so
                    the container hierarchy stays clear. */}
                {isExpanded && (
                  <div className="px-1.5 pb-1.5 pt-0.5 space-y-0.5">
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
  );
}
