"use client";

import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CATEGORIES, COMPONENTS } from "@/lib/editor/bootstrap-components";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  LayoutGrid, Type, FileInput, MousePointerClick, Navigation,
  Layers, Table, Image, Wrench, Search, List, Code,
} from "lucide-react";

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
  GalleryHorizontalEnd: Layers, AppWindow: Layers, Minus: Wrench, MoveVertical: Wrench, Video: Image, Frame: Image,
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
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/30 bg-background cursor-grab active:cursor-grabbing transition-all duration-150 hover:border-primary/30 hover:bg-primary/[0.03] ${
        isDragging ? "shadow-xl ring-2 ring-primary/30 scale-105" : "hover:shadow-sm"
      }`}
    >
      <IconComp className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm font-medium text-foreground truncate">{label}</span>
    </div>
  );
}

interface LeftSidebarProps {
  width: number;
}

export function LeftSidebar({ width }: LeftSidebarProps) {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CATEGORIES.map((c) => c.id))
  );

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
      <div className="p-3 border-b border-border shrink-0">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
          Components
        </h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search components..."
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
    </div>
  );
}
