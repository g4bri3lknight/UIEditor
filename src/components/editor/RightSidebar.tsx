"use client";

import React, { useState, useCallback } from "react";
import { useEditorStore, isAutoManaged } from "@/store/editor-store";
import { getComponentByType } from "@/lib/editor/bootstrap-components";
import { PropertyDefinition, CanvasComponent } from "@/lib/editor/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Trash2, Copy, Info, ArrowUp, ArrowDown, Eye, EyeOff, Tag, Hash, Paintbrush, Search, Layers } from "lucide-react";
import { toast } from "sonner";

import { IconPicker } from "./IconPicker";
import { COMPONENT_PRESETS } from "@/lib/editor/component-presets";

// Unified input style matching select fields
const INPUT_CLASS = "w-full h-8 px-3 rounded-md border border-input bg-white dark:bg-neutral-800 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const SEARCH_INPUT_CLASS = "pl-8 h-8 text-xs bg-muted/80 border-0 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/20";
const LABEL_CLASS = "text-xs font-medium text-foreground/80";

// Reusable input with local state for immediate visual feedback
function ResponsiveInput({
  value,
  onChange,
  placeholder,
  className,
  type = "text",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}) {
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [focused, setFocused] = useState(false);

  // Sync from store when value changes externally (React-recommended pattern)
  if (value !== prevValue) {
    setPrevValue(value);
    if (!focused) {
      setLocalValue(value);
    }
  }

  const handleChange = useCallback((newVal: string) => {
    setLocalValue(newVal);
    onChange(newVal);
  }, [onChange]);

  return (
    <input
      type={type}
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); setLocalValue(value); }}
      placeholder={placeholder}
      className={className || INPUT_CLASS}
    />
  );
}

function PropertyField({
  prop,
  value,
  onChange,
}: {
  prop: PropertyDefinition;
  value: string | boolean | number;
  onChange: (val: string | boolean | number) => void;
}) {
  // Local state for text/textarea/number/color inputs to ensure immediate visual feedback.
  const strValue = String(value);
  const [localValue, setLocalValue] = useState(strValue);
  const [prevStrValue, setPrevStrValue] = useState(strValue);
  const [focused, setFocused] = useState(false);

  // Sync from store when value changes externally (React-recommended render-time pattern)
  if (strValue !== prevStrValue) {
    setPrevStrValue(strValue);
    if (!focused) {
      setLocalValue(strValue);
    }
  }

  const handleChange = useCallback((newVal: string) => {
    setLocalValue(newVal);
    if (prop.type === "number") {
      onChange(Number(newVal));
    } else {
      onChange(newVal);
    }
  }, [onChange, prop.type]);

  switch (prop.type) {
    case "boolean":
      return (
        <div className="flex items-center justify-between py-1">
          <Label className={`${LABEL_CLASS} cursor-pointer`} htmlFor={`prop-${prop.key}`}>
            {prop.label}
          </Label>
          <Switch
            id={`prop-${prop.key}`}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(checked)}
            className="scale-90"
          />
        </div>
      );

    case "select":
      return (
        <div className="space-y-1.5">
          <Label className={LABEL_CLASS}>
            {prop.label}
          </Label>
          <select
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            className={`${INPUT_CLASS} cursor-pointer`}
          >
            {prop.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-1.5">
          <Label className={LABEL_CLASS}>
            {prop.label}
          </Label>
          <textarea
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); setLocalValue(strValue); }}
            placeholder={prop.placeholder}
            rows={3}
            className={`${INPUT_CLASS} resize-y font-mono leading-relaxed py-2`}
          />
          {prop.description && (
            <p className="text-[10px] text-muted-foreground">{prop.description}</p>
          )}
        </div>
      );

    case "number":
      return (
        <div className="space-y-1.5">
          <Label className={LABEL_CLASS}>
            {prop.label}
          </Label>
          <input
            type="number"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); setLocalValue(strValue); }}
            className={INPUT_CLASS}
          />
        </div>
      );

    case "color":
      return (
        <div className="space-y-1.5">
          <Label className={LABEL_CLASS}>
            {prop.label}
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={String(value)}
              onChange={(e) => { onChange(e.target.value); setLocalValue(e.target.value); }}
              className="w-8 h-8 rounded border border-input cursor-pointer"
            />
            <input
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => { setFocused(false); setLocalValue(strValue); }}
              className={`${INPUT_CLASS} flex-1 font-mono`}
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-1.5">
          <Label className={LABEL_CLASS}>
            {prop.label}
          </Label>
          <input
            type="text"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); setLocalValue(strValue); }}
            placeholder={prop.placeholder}
            className={INPUT_CLASS}
          />
          {prop.description && (
            <p className="text-[10px] text-muted-foreground">{prop.description}</p>
          )}
        </div>
      );
  }
}

// Utility: find component in tree by ID (used for reactive lookups)
function findInTree(comps: CanvasComponent[], id: string): CanvasComponent | null {
  for (const c of comps) {
    if (c.id === id) return c;
    if (c.children) {
      const found = findInTree(c.children, id);
      if (found) return found;
    }
  }
  return null;
}

interface RightSidebarProps {
  width: number;
}

export function RightSidebar({ width }: RightSidebarProps) {
  // Use targeted selectors for reactivity — subscribe to values that affect rendering
  const selectedId = useEditorStore(s => s.selectedId);
  const selectedIds = useEditorStore(s => s.selectedIds);
  const hiddenComponents = useEditorStore(s => s.hiddenComponents);
  const customCSS = useEditorStore(s => s.customCSS);

  // Subscribe to components so we re-render when any component changes
  const components = useEditorStore(s => s.components);

  // Get actions from getState() — stable references, no subscriptions needed
  const updateComponentProps = useEditorStore(s => s.updateComponentProps);
  const updateComponentLabel = useEditorStore(s => s.updateComponentLabel);
  const removeComponent = useEditorStore(s => s.removeComponent);
  const duplicateComponent = useEditorStore(s => s.duplicateComponent);
  const selectComponent = useEditorStore(s => s.selectComponent);
  const moveUp = useEditorStore(s => s.moveUp);
  const moveDown = useEditorStore(s => s.moveDown);
  const toggleComponentVisibility = useEditorStore(s => s.toggleComponentVisibility);
  const setCustomCSS = useEditorStore(s => s.setCustomCSS);
  const removeSelectedComponents = useEditorStore(s => s.removeSelectedComponents);
  const duplicateSelectedComponents = useEditorStore(s => s.duplicateSelectedComponents);
  const copySelectedComponents = useEditorStore(s => s.copySelectedComponents);
  const clearSelection = useEditorStore(s => s.clearSelection);

  const [searchQuery, setSearchQuery] = useState("");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconPickerPropKey, setIconPickerPropKey] = useState<string>("");
  const [iconPickerValue, setIconPickerValue] = useState<string>("");

  // Multi-selection mode
  const multiSelectCount = selectedIds.length;
  const isMultiSelectMode = multiSelectCount > 1;

  // Find selected component directly from the reactive components array
  // This ensures we get the LATEST version after any prop update
  const selectedComponent = !isMultiSelectMode && selectedId ? findInTree(components, selectedId) ?? undefined : undefined;

  const componentDef = selectedComponent
    ? getComponentByType(selectedComponent.type)
    : null;

  const managed = selectedComponent ? isAutoManaged(selectedComponent.type) : false;

  const isHidden = selectedComponent ? hiddenComponents.includes(selectedComponent.id) : false;

  if (!selectedComponent || !componentDef) {
    // Multi-selection bulk actions panel
    if (isMultiSelectMode) {
      return (
        <div
          className="border-l ios-border-subtle ios-satin-sidebar flex flex-col h-full shrink-0 overflow-hidden"
          style={{ width: `${width}px` }}
        >
          <div className="p-3 border-b ios-border-subtle shrink-0">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                Selezione multipla
              </h2>
              <button
                onClick={() => { selectComponent(null); clearSelection(); }}
                className="p-1 rounded-md hover:bg-foreground/5 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-foreground/60" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-foreground">{multiSelectCount} componenti selezionati</span>
            </div>
          </div>

          {/* Multi-selection actions */}
          <div className="p-3 space-y-2">
            <p className="text-[11px] text-foreground/60 mb-2">
              Le azioni verranno applicate a tutti i componenti selezionati.
            </p>
            <button
              onClick={() => {
                duplicateSelectedComponents();
                toast.success(`${multiSelectCount} componenti duplicati`);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md border border-input ${INPUT_CLASS.split(' ').filter(c => !c.startsWith('w-') && !c.startsWith('h-')).join(' ')} hover:bg-muted transition-colors`}
            >
              <Copy className="w-3.5 h-3.5" />
              Duplica tutti ({multiSelectCount})
            </button>
            <button
              onClick={() => {
                copySelectedComponents();
                toast.success(`${multiSelectCount} componenti copiati`);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md border border-input ${INPUT_CLASS.split(' ').filter(c => !c.startsWith('w-') && !c.startsWith('h-')).join(' ')} hover:bg-muted transition-colors`}
            >
              <Copy className="w-3.5 h-3.5" />
              Copia tutti ({multiSelectCount})
              <span className="ml-auto text-[10px] text-foreground/50">Ctrl+C</span>
            </button>
            <button
              onClick={() => {
                removeSelectedComponents();
                toast.success(`${multiSelectCount} componenti eliminati`);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-destructive/30 bg-destructive/5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Elimina tutti ({multiSelectCount})
              <span className="ml-auto text-[10px] text-destructive/60">Del</span>
            </button>
          </div>

          {/* Selected items list */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-3">
              <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider mb-2">
                Componenti selezionati
              </p>
              <div className="space-y-1">
                {selectedIds.map(id => {
                  const comp = findInTree(components, id);
                  if (!comp) return null;
                  const def = getComponentByType(comp.type);
                  return (
                    <button
                      key={id}
                      onClick={() => selectComponent(id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors text-left"
                    >
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-normal shrink-0">
                        {def?.label || comp.type}
                      </Badge>
                      <span className="text-xs text-foreground truncate">{comp.label}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          useEditorStore.getState().removeFromSelection(id);
                        }}
                        className="ml-auto p-0.5 rounded hover:bg-foreground/10 transition-colors shrink-0"
                      >
                        <X className="w-3 h-3 text-foreground/50" />
                      </button>
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>

          {/* Shortcuts hint */}
          <div className="border-t border-border px-3 py-2 shrink-0">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-foreground/50">
              <span><kbd className="px-1 py-0.5 bg-muted rounded border border-border font-mono">Ctrl+Click</kbd> Aggiungi/Rimuovi</span>
              <span><kbd className="px-1 py-0.5 bg-muted rounded border border-border font-mono">Shift+Click</kbd> Estendi</span>
              <span><kbd className="px-1 py-0.5 bg-muted rounded border border-border font-mono">Ctrl+A</kbd> Seleziona tutto</span>
              <span><kbd className="px-1 py-0.5 bg-muted rounded border border-border font-mono">Esc</kbd> Deseleziona</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="border-l ios-border-subtle ios-satin-sidebar flex flex-col h-full shrink-0 overflow-hidden"
        style={{ width: `${width}px` }}
      >
        <div className="p-3 border-b ios-border-subtle">
          <h2 className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
            Proprietà
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 rounded-xl bg-muted/80 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <p className="text-sm text-foreground/60 text-center">
            Seleziona un componente sulla canvas per modificarne le proprietà
          </p>
        </div>
      </div>
    );
  }

  // Group properties
  const propGroups: Record<string, PropertyDefinition[]> = {};
  componentDef.properties.forEach((prop) => {
    const group = prop.group || "Generale";
    if (!propGroups[group]) propGroups[group] = [];
    propGroups[group].push(prop);
  });

  return (
    <div
      className="border-l ios-border-subtle ios-satin-sidebar flex flex-col h-full shrink-0 overflow-hidden"
      style={{ width: `${width}px` }}
    >
      {/* Header */}
      <div className="p-3 border-b ios-border-subtle shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
            Proprietà
          </h2>
          <button
            onClick={() => selectComponent(null)}
            className="p-1 rounded-md hover:bg-foreground/5 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-foreground/60" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] px-2 py-0 font-normal">
            {componentDef.label}
          </Badge>
          <span className="text-[10px] text-foreground/50">
            {componentDef.type}
          </span>
        </div>
      </div>

      {/* Variant Presets */}
      {COMPONENT_PRESETS[selectedComponent.type] && (
        <div className="px-3 py-2 border-b ios-border-subtle shrink-0">
          <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">
            Varianti rapide
          </p>
          <div className="flex flex-wrap gap-1">
            {COMPONENT_PRESETS[selectedComponent.type].map((preset) => {
              // Check if this preset matches the current props
              const isActive = Object.entries(preset.props).every(
                ([key, value]) => selectedComponent.props[key] === value
              );
              return (
                <button
                  key={preset.name}
                  onClick={() => {
                    updateComponentProps(selectedComponent.id, preset.props);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground/70 hover:bg-muted/90 hover:text-foreground"
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Auto-managed info for columns */}
      {managed && (
        <div className="mx-3 mt-2 flex items-start gap-2 px-2.5 py-2 rounded-md bg-muted/80 text-[11px] text-foreground/70">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-foreground/50" />
          <span>Questa colonna è gestita dalla Row genitore. Modifica il numero di colonne nelle proprietà della Row.</span>
        </div>
      )}

      {/* Actions — move buttons always visible, other actions only for non-managed */}
      <div className="flex items-center gap-1 px-3 py-2 border-b ios-border-subtle shrink-0">
        <button
          onClick={() => moveUp(selectedComponent.id)}
          className="p-1.5 rounded hover:bg-muted transition-colors"
          title="Sposta su"
        >
          <ArrowUp className="w-3.5 h-3.5 text-foreground/60" />
        </button>
        <button
          onClick={() => moveDown(selectedComponent.id)}
          className="p-1.5 rounded hover:bg-muted transition-colors"
          title="Sposta giù"
        >
          <ArrowDown className="w-3.5 h-3.5 text-foreground/60" />
        </button>
        {!managed && (
          <>
            <button
              onClick={() => duplicateComponent(selectedComponent.id)}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title="Duplica"
            >
              <Copy className="w-3.5 h-3.5 text-foreground/60" />
            </button>
            <div className="flex-1" />
            <button
              onClick={() => toggleComponentVisibility(selectedComponent.id)}
              className={`p-1.5 rounded transition-colors ${isHidden ? 'bg-muted text-foreground/60' : 'hover:bg-muted text-foreground/60'}`}
              title={isHidden ? 'Mostra componente' : 'Nascondi componente'}
            >
              {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => removeComponent(selectedComponent.id)}
              className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
              title="Elimina"
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </button>
          </>
        )}
      </div>

      {/* Property Fields */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-3">
          {/* Nome (rename label) */}
          <div className="space-y-1.5">
            <Label className={LABEL_CLASS}>Nome</Label>
            <ResponsiveInput
              value={selectedComponent.label}
              onChange={(val) => updateComponentLabel(selectedComponent.id, val)}
              className={INPUT_CLASS}
            />
          </div>

          <Separator />

          {/* Property Search — same style as component search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca proprietà..."
              className={SEARCH_INPUT_CLASS}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted transition-colors"
              >
                <X className="w-3 h-3 text-foreground/40" />
              </button>
            )}
          </div>

          {(() => {
            const filteredGroups = Object.entries(propGroups).map(([groupName, props]) => {
              const filteredProps = searchQuery.trim()
                ? props.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()) || p.key.toLowerCase().includes(searchQuery.toLowerCase()))
                : props;
              return { groupName, props: filteredProps };
            }).filter(g => g.props.length > 0);

            if (filteredGroups.length === 0) {
              return (
                <p className="text-xs text-foreground/50 text-center py-4">
                  Nessuna proprietà trovata
                </p>
              );
            }

            return filteredGroups.map(({ groupName, props }) => (
              <div key={groupName}>
                {Object.keys(propGroups).length > 1 && !searchQuery.trim() && (
                  <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider mb-2">
                    {groupName}
                  </p>
                )}
                <div className="space-y-2.5">
                  {props.map((prop) => (
                    prop.key === "iconLeft" ? (
                      <div key={prop.key} className="space-y-1.5">
                        <Label className={LABEL_CLASS}>
                          {prop.label}
                        </Label>
                        <button
                          type="button"
                          onClick={() => {
                            setIconPickerPropKey(prop.key);
                            setIconPickerValue(String(selectedComponent.props[prop.key] ?? ""));
                            setIconPickerOpen(true);
                          }}
                          className={`${INPUT_CLASS} flex items-center gap-2 cursor-pointer hover:bg-muted transition-colors`}
                        >
                          {selectedComponent.props[prop.key] ? (
                            <>
                              <i className={`bi-${String(selectedComponent.props[prop.key]).replace(/^bi-?/, '')}`} style={{ fontSize: "14px" }} />
                              <span className="flex-1 text-left font-mono truncate">{String(selectedComponent.props[prop.key])}</span>
                            </>
                          ) : (
                            <span className="text-foreground/40">Clicca per selezionare...</span>
                          )}
                        </button>
                      </div>
                    ) : (
                      <PropertyField
                        key={prop.key}
                        prop={prop}
                        value={selectedComponent.props[prop.key] ?? prop.defaultValue}
                        onChange={(val) =>
                          updateComponentProps(selectedComponent.id, {
                            [prop.key]: val,
                          })
                        }
                      />
                    )
                  ))}
                </div>
              </div>
            ));
          })()}

          {/* Avanzato (Advanced) */}
          <div>
            <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider mb-2">
              Avanzato
            </p>
            <div className="space-y-2.5">
              <div className="space-y-1.5">
                <Label className={`${LABEL_CLASS} flex items-center gap-1.5`}>
                  <Tag className="w-3 h-3" />
                  Classi CSS
                </Label>
                <ResponsiveInput
                  value={String(selectedComponent.props.customClass || "")}
                  onChange={(val) =>
                    updateComponentProps(selectedComponent.id, {
                      customClass: val,
                    })
                  }
                  placeholder="es. my-class custom-styling"
                  className={`${INPUT_CLASS} font-mono`}
                />
                <p className="text-[10px] text-foreground/50">Classi CSS aggiuntive per il componente</p>
              </div>
              <div className="space-y-1.5">
                <Label className={`${LABEL_CLASS} flex items-center gap-1.5`}>
                  <Hash className="w-3 h-3" />
                  ID HTML
                </Label>
                <ResponsiveInput
                  value={String(selectedComponent.props.customId || "")}
                  onChange={(val) =>
                    updateComponentProps(selectedComponent.id, {
                      customId: val,
                    })
                  }
                  placeholder="es. sezione-principale"
                  className={`${INPUT_CLASS} font-mono`}
                />
                <p className="text-[10px] text-foreground/50">Attributo id personalizzato per il componente</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      {/* CSS Personalizzato */}
      <div className="border-t ios-border-subtle px-3 py-3 shrink-0">
            <div className="flex items-center gap-1.5 mb-2">
              <Paintbrush className="w-3 h-3 text-foreground/60" />
              <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider">
                CSS Personalizzato
              </p>
            </div>
            <textarea
              value={customCSS}
              onChange={(e) => setCustomCSS(e.target.value)}
              placeholder={".mio-componente {\n  color: red;\n  font-size: 18px;\n}"}
              rows={4}
              className={`${INPUT_CLASS} resize-y font-mono leading-relaxed py-2`}
            />
            <p className="text-[10px] text-foreground/50 mt-1">Regole CSS personalizzate per l'anteprima e l'esportazione</p>
          </div>

      {/* Icon Picker Dialog */}
      <IconPicker
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        currentValue={iconPickerValue}
        onSelect={(iconName) => {
          if (selectedComponent && iconPickerPropKey) {
            updateComponentProps(selectedComponent.id, {
              [iconPickerPropKey]: iconName,
            });
          }
          setIconPickerOpen(false);
        }}
      />
    </div>
  );
}
