"use client";

import React, { useState } from "react";
import { CATEGORIES } from "@/lib/editor/bootstrap-components";
import { useEditorStore } from "@/store/editor-store";
import { ComponentPalette } from "./ComponentPalette";
import { LayersPanel } from "./LayersPanel";
import { TemplatesPanel } from "./TemplatesPanel";

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

  return (
    <div
      className="border-r ios-border-subtle ios-satin-sidebar flex flex-col h-full shrink-0 overflow-hidden"
      style={{ width: `${width}px` }}
    >
      {/* Tab Switcher — iOS segmented control style */}
      <div className="flex gap-0.5 p-2 border-b ios-border-subtle shrink-0">
        <div className="flex gap-0.5 w-full bg-muted/90 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab("componenti")}
            className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-all duration-200 ${
              activeTab === "componenti"
                ? "bg-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Componenti
          </button>
          <button
            onClick={() => setActiveTab("livelli")}
            className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-all duration-200 ${
              activeTab === "livelli"
                ? "bg-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Livelli
          </button>
          <button
            onClick={() => setActiveTab("template")}
            className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-all duration-200 relative ${
              activeTab === "template"
                ? "bg-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Template
            {savedSnippetsCount > 0 && (
              <span className={`ml-1 text-[9px] leading-none rounded-full px-1 py-0.5 font-bold ${
                activeTab === "template"
                  ? "bg-primary/15 text-primary"
                  : "bg-primary/10 text-primary"
              }`}>
                {savedSnippetsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Componenti Tab */}
      {activeTab === "componenti" && (
        <ComponentPalette
          search={search}
          onSearchChange={setSearch}
          expandedCategories={expandedCategories}
          onToggleCategory={toggleCategory}
        />
      )}

      {/* Livelli Tab */}
      {activeTab === "livelli" && <LayersPanel />}

      {/* Template Tab */}
      {activeTab === "template" && <TemplatesPanel />}
    </div>
  );
}
