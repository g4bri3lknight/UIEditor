"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { useEditorStore } from "@/store/editor-store";
import type { CanvasComponent, SavedSnippet } from "@/lib/editor/types";
import { TEMPLATES } from "@/lib/editor/templates";
import { getLayerIcon } from "./LayersPanel";
import { Input } from "@/components/ui/input";
import {
  LayoutGrid, Type, FileInput, MousePointerClick, Navigation,
  Layers, Table, Image, Wrench,
  Bookmark, Trash2, Pencil, Check, X, Plus,
  Download, Upload, LayoutTemplate,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

// ── Helper: count total components in a tree ──
function countComponents(comps: CanvasComponent[]): number {
  let count = 0;
  for (const c of comps) {
    count++;
    if (c.children) count += countComponents(c.children);
  }
  return count;
}

// ── Snippet Card (self-contained — connects to store directly) ──
function SnippetCard({ snippet }: { snippet: SavedSnippet }) {
  // Internal UI state
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [categoryValue, setCategoryValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Store actions
  const insertSnippet = useEditorStore((s) => s.insertSnippet);
  const deleteSnippet = useEditorStore((s) => s.deleteSnippet);
  const renameSnippet = useEditorStore((s) => s.renameSnippet);
  const updateSnippetCategory = useEditorStore((s) => s.updateSnippetCategory);

  const snippetCat = snippet.category || "Generale";

  // Build a mini preview of the component types
  const allTypes = useMemo(() => {
    const types: string[] = [];
    const collect = (comps: CanvasComponent[]) => {
      for (const c of comps) {
        types.push(c.type);
        if (c.children) collect(c.children);
      }
    };
    collect(snippet.components);
    return types;
  }, [snippet.components]);

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
  };

  const handleInsert = useCallback(() => {
    insertSnippet(snippet.id, null);
    toast.success("Template inserito!");
  }, [insertSnippet, snippet.id]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSnippet(snippet.id);
    toast.success("Template eliminato");
  }, [deleteSnippet, snippet.id]);

  const handleStartRename = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingName(snippet.name);
  }, [snippet.name]);

  const handleConfirmRename = useCallback(() => {
    if (editingName.trim()) {
      renameSnippet(snippet.id, editingName.trim());
      toast.success("Template rinominato");
    }
    setIsEditing(false);
  }, [editingName, renameSnippet, snippet.id]);

  const handleCancelRename = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleStartCategoryEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingCat(true);
    setCategoryValue(snippetCat);
  }, [snippetCat]);

  const handleConfirmCategory = useCallback(() => {
    if (categoryValue.trim()) {
      updateSnippetCategory(snippet.id, categoryValue.trim());
      toast.success("Categoria aggiornata");
    }
    setIsEditingCat(false);
  }, [categoryValue, updateSnippetCategory, snippet.id]);

  return (
    <div className="rounded-lg border border-border/50 bg-background/50 overflow-hidden transition-colors hover:border-primary/20">
      {/* Header */}
      <div className="flex items-start gap-2 px-2.5 py-2">
        {/* Mini visual preview */}
        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 relative">
          {React.createElement(getLayerIcon(snippet.components[0]?.type || "container"), {
            className: "w-3.5 h-3.5 text-primary",
          })}
          {snippet.components.length > 1 && (
            <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-primary text-primary-foreground rounded-full w-3.5 h-3.5 flex items-center justify-center">
              {snippet.components.length}
            </span>
          )}
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
              <button onClick={handleConfirmRename} className="p-0.5 rounded hover:bg-primary/10 text-primary">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={handleCancelRename} className="p-0.5 rounded hover:bg-muted text-muted-foreground">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <div className="text-xs font-medium text-foreground truncate">{snippet.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isEditingCat ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={categoryValue}
                      onChange={(e) => setCategoryValue(e.target.value)}
                      className="h-5 text-[10px] px-1 py-0 w-24"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleConfirmCategory();
                        if (e.key === "Escape") setIsEditingCat(false);
                      }}
                      autoFocus
                    />
                    <button onClick={handleConfirmCategory} className="p-0.5 rounded hover:bg-primary/10 text-primary">
                      <Check className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleStartCategoryEdit}
                    className="text-[10px] text-primary/70 hover:text-primary transition-colors cursor-pointer"
                    title="Clicca per modificare la categoria"
                  >
                    {snippetCat}
                  </button>
                )}
                <span className="text-[10px] text-muted-foreground/40">·</span>
                <span className="text-[10px] text-muted-foreground">
                  {snippet.components.length} comp.
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

      {/* Mini type preview bar */}
      <div className="px-2.5 pb-1">
        <div className="flex gap-0.5 flex-wrap">
          {allTypes.slice(0, 8).map((type, i) => (
            <span key={i} className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-muted/40">
              {React.createElement(getLayerIcon(type), { className: "w-2.5 h-2.5 text-muted-foreground" })}
            </span>
          ))}
          {allTypes.length > 8 && (
            <span className="text-[9px] text-muted-foreground/50 px-1">+{allTypes.length - 8}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 px-2.5 pb-2">
        <button
          onClick={handleInsert}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Inserisci
        </button>
        <button
          onClick={() => setIsExpanded(prev => !prev)}
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
            onClick={handleStartRename}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Rinomina"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={handleDelete}
          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Elimina"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Expanded: show component tree */}
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
}

// ── Saved Templates Panel ──
export function TemplatesPanel() {
  const savedSnippets = useEditorStore((s) => s.savedSnippets);
  const hydrated = useEditorStore((s) => s._hydrated);
  const loadTemplate = useEditorStore((s) => s.loadTemplate);
  const exportSnippets = useEditorStore((s) => s.exportSnippets);
  const importSnippets = useEditorStore((s) => s.importSnippets);

  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<"predefiniti" | "custom">("predefiniti");
  const snippetImportRef = useRef<HTMLInputElement>(null);

  // Safety net: if onRehydrateStorage never fires, force _hydrated after 1s
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!useEditorStore.getState()._hydrated) {
        useEditorStore.setState({ _hydrated: true });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLoadBuiltinTemplate = useCallback((templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    loadTemplate(tpl.components);
    toast.success(`Template "${tpl.label}" caricato!`);
  }, [loadTemplate]);

  const handleExportAll = useCallback(() => {
    const json = exportSnippets();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bootstrap-snippets.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template esportati!");
  }, [exportSnippets]);

  const handleImport = useCallback(() => {
    snippetImportRef.current?.click();
  }, []);

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const count = importSnippets(text);
      if (count > 0) {
        toast.success(`${count} template importat${count !== 1 ? "i" : "o"}!`);
      } else {
        toast.error("Nessun template valido trovato nel file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [importSnippets]);

  // Get all categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const s of savedSnippets) {
      cats.add(s.category || "Generale");
    }
    return Array.from(cats).sort();
  }, [savedSnippets]);

  // Filter and sort snippets
  const filteredSnippets = useMemo(() => {
    let sorted = [...savedSnippets].sort((a, b) => b.updatedAt - a.updatedAt);
    if (filterCategory) {
      sorted = sorted.filter(s => (s.category || "Generale") === filterCategory);
    }
    return sorted;
  }, [savedSnippets, filterCategory]);

  const toggleSection = (section: "predefiniti" | "custom") => {
    setExpandedSection(prev => prev === section ? (prev === "predefiniti" ? "custom" : "predefiniti") : section);
  };

  if (!hydrated) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-12">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
          <LayoutTemplate className="w-5 h-5 text-muted-foreground/50" />
        </div>
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Caricamento...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-2 pb-4">
          {/* ── Template Predefiniti ── */}
          <div className="rounded-lg border border-border/50 bg-background/50 overflow-hidden">
            <button
              onClick={() => toggleSection("predefiniti")}
              className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
            >
              <svg
                className={`w-3 h-3 text-muted-foreground/60 transition-transform duration-200 ${expandedSection === "predefiniti" ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <LayoutTemplate className="w-3.5 h-3.5 text-primary/70" />
              <span className="text-xs font-semibold text-foreground flex-1">Template Predefiniti</span>
              <span className="text-[10px] rounded-full px-1.5 py-0.5 font-medium bg-muted text-muted-foreground">
                {TEMPLATES.length}
              </span>
            </button>
            {expandedSection === "predefiniti" && (
              <div className="px-2 pb-2 space-y-1">
                {TEMPLATES.map((tpl) => {
                  const IconComp = tpl.icon;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => handleLoadBuiltinTemplate(tpl.id)}
                      className="w-full flex items-start gap-2 px-2.5 py-2 rounded-md hover:bg-muted/60 transition-colors cursor-pointer text-left"
                    >
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <IconComp className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">{tpl.label}</div>
                        <div className="text-[11px] text-muted-foreground leading-snug">{tpl.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Template Custom ── */}
          <div className="rounded-lg border border-border/50 bg-background/50 overflow-hidden">
            <button
              onClick={() => toggleSection("custom")}
              className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
            >
              <svg
                className={`w-3 h-3 text-muted-foreground/60 transition-transform duration-200 ${expandedSection === "custom" ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Bookmark className="w-3.5 h-3.5 text-primary/70" />
              <span className="text-xs font-semibold text-foreground flex-1">Template Custom</span>
              <span className="text-[10px] rounded-full px-1.5 py-0.5 font-medium bg-muted text-muted-foreground">
                {savedSnippets.length}
              </span>
            </button>

            {expandedSection === "custom" && (
              <div className="pb-2">
                {/* Category filter */}
                {categories.length > 1 && (
                  <div className="px-2 py-1.5 flex gap-1 flex-wrap">
                    <button
                      onClick={() => setFilterCategory(null)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        !filterCategory
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Tutti
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat === filterCategory ? null : cat)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                          filterCategory === cat
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/60 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {savedSnippets.length === 0 ? (
                  <div className="px-3 py-6 text-center">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Nessun template salvato.
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      Clicca col tasto destro su un componente e seleziona &quot;Salva come template&quot;.
                    </p>
                    <button
                      onClick={handleImport}
                      className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                      Importa template
                    </button>
                  </div>
                ) : (
                  <div className="px-2 space-y-1.5">
                    {filteredSnippets.map((snippet) => (
                      <SnippetCard
                        key={snippet.id}
                        snippet={snippet}
                      />
                    ))}
                  </div>
                )}

                {/* Export/Import actions */}
                <div className="px-3 pt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {savedSnippets.length} template{savedSnippets.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleExportAll}
                      disabled={savedSnippets.length === 0}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                      title="Esporta tutti i template"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleImport}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Importa template da file"
                    >
                      <Upload className="w-3 h-3" />
                    </button>
                    <input
                      ref={snippetImportRef}
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={handleImportFile}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
