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
  GalleryHorizontalEnd: Layers, AppWindow: Layers, AlignJustify: Layers,
  Minus: Wrench, MoveVertical: Wrench, Video: Image, Frame: Image,
};

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
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border/50 bg-card cursor-grab active:cursor-grabbing transition-all duration-150 hover:border-primary/40 hover:bg-primary/5 ${
        isDragging ? "shadow-xl ring-2 ring-primary/30 scale-105" : "hover:shadow-sm"
      }`}
    >
      <IconComp className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm font-medium text-foreground truncate">{label}</span>
    </div>
  );
}

export function LeftSidebar() {
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
    ? COMPONENTS.filter(
        (c) =>
          c.label.toLowerCase().includes(search.toLowerCase()) ||
          c.type.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase())
      )
    : COMPONENTS;

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
    <div className="w-64 border-r border-border bg-card flex flex-col h-full shrink-0">
      <div className="p-3 border-b border-border">
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

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredCategories.map((category) => {
            const CatIcon = catIconMap[category.id] || LayoutGrid;
            const components = filteredComponents.filter(
              (c) => c.category === category.id
            );
            const isExpanded = expandedCategories.has(category.id);

            return (
              <div key={category.id} className="mb-1">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md hover:bg-muted/50 transition-colors text-left group"
                >
                  <CatIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground flex-1">
                    {category.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                    {components.length}
                  </span>
                  <svg
                    className={`w-3 h-3 text-muted-foreground/60 transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="ml-1 mt-1 space-y-1">
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
