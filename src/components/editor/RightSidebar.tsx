"use client";

import React, { useState } from "react";
import { useEditorStore, isAutoManaged } from "@/store/editor-store";
import { getComponentByType } from "@/lib/editor/bootstrap-components";
import { PropertyDefinition } from "@/lib/editor/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Trash2, Copy, Info, ArrowUp, ArrowDown, Eye, EyeOff, Tag, Hash, Paintbrush, Search, Layers } from "lucide-react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { IconPicker } from "./IconPicker";
import { COMPONENT_PRESETS } from "@/lib/editor/component-presets";

function PropertyField({
  prop,
  value,
  onChange,
}: {
  prop: PropertyDefinition;
  value: string | boolean | number;
  onChange: (val: string | boolean | number) => void;
}) {
  switch (prop.type) {
    case "boolean":
      return (
        <div className="flex items-center justify-between py-1">
          <Label className="text-xs font-normal text-muted-foreground cursor-pointer" htmlFor={`prop-${prop.key}`}>
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
          <Label className="text-xs font-normal text-muted-foreground">
            {prop.label}
          </Label>
          <select
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
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
          <Label className="text-xs font-normal text-muted-foreground">
            {prop.label}
          </Label>
          <textarea
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={prop.placeholder}
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y font-mono leading-relaxed"
          />
          {prop.description && (
            <p className="text-[10px] text-muted-foreground/60">{prop.description}</p>
          )}
        </div>
      );

    case "number":
      return (
        <div className="space-y-1.5">
          <Label className="text-xs font-normal text-muted-foreground">
            {prop.label}
          </Label>
          <Input
            type="number"
            value={Number(value)}
            onChange={(e) => onChange(Number(e.target.value))}
            className="h-8 text-xs"
          />
        </div>
      );

    case "color":
      return (
        <div className="space-y-1.5">
          <Label className="text-xs font-normal text-muted-foreground">
            {prop.label}
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={String(value)}
              onChange={(e) => onChange(e.target.value)}
              className="w-8 h-8 rounded border border-input cursor-pointer"
            />
            <Input
              value={String(value)}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 text-xs flex-1 font-mono"
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-1.5">
          <Label className="text-xs font-normal text-muted-foreground">
            {prop.label}
          </Label>
          <Input
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={prop.placeholder}
            className="h-8 text-xs"
          />
          {prop.description && (
            <p className="text-[10px] text-muted-foreground/60">{prop.description}</p>
          )}
        </div>
      );
  }
}

interface RightSidebarProps {
  width: number;
}

export function RightSidebar({ width }: RightSidebarProps) {
  const {
    selectedId,
    selectedIds,
    updateComponentProps,
    updateComponentLabel,
    removeComponent,
    duplicateComponent,
    selectComponent,
    findComponent,
    getParentInfo,
    getAncestors,
    moveUp,
    moveDown,
    hiddenComponents,
    toggleComponentVisibility,
    customCSS,
    setCustomCSS,
    removeSelectedComponents,
    duplicateSelectedComponents,
    copySelectedComponents,
    clearSelection,
  } = useEditorStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconPickerPropKey, setIconPickerPropKey] = useState<string>("");
  const [iconPickerValue, setIconPickerValue] = useState<string>("");

  // Multi-selection mode
  const multiSelectCount = selectedIds.length;
  const isMultiSelectMode = multiSelectCount > 1;

  const selectedComponent = !isMultiSelectMode && selectedId ? findComponent(selectedId) ?? undefined : undefined;

  const componentDef = selectedComponent
    ? getComponentByType(selectedComponent.type)
    : null;

  const managed = selectedComponent ? isAutoManaged(selectedComponent.type) : false;

  const isHidden = selectedComponent ? hiddenComponents.includes(selectedComponent.id) : false;

  const ancestors = selectedComponent ? getAncestors(selectedComponent.id) : [];

  if (!selectedComponent || !componentDef) {
    // Multi-selection bulk actions panel
    if (isMultiSelectMode) {
      return (
        <div
          className="border-l border-border bg-card flex flex-col h-full shrink-0 overflow-hidden"
          style={{ width: `${width}px` }}
        >
          <div className="p-3 border-b border-border shrink-0">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Selezione multipla
              </h2>
              <button
                onClick={() => { selectComponent(null); clearSelection(); }}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">{multiSelectCount} componenti selezionati</span>
            </div>
          </div>

          {/* Multi-selection actions */}
          <div className="p-3 space-y-2">
            <p className="text-[10px] text-muted-foreground/70 mb-2">
              Le azioni verranno applicate a tutti i componenti selezionati.
            </p>
            <button
              onClick={() => {
                duplicateSelectedComponents();
                toast.success(`${multiSelectCount} componenti duplicati`);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-xs text-foreground hover:bg-muted/50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Duplica tutti ({multiSelectCount})
            </button>
            <button
              onClick={() => {
                copySelectedComponents();
                toast.success(`${multiSelectCount} componenti copiati`);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-xs text-foreground hover:bg-muted/50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Copia tutti ({multiSelectCount})
              <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+C</span>
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
              <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
                Componenti selezionati
              </p>
              <div className="space-y-1">
                {selectedIds.map(id => {
                  const comp = findComponent(id);
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
                        className="ml-auto p-0.5 rounded hover:bg-muted-foreground/10 transition-colors shrink-0"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>

          {/* Shortcuts hint */}
          <div className="border-t border-border px-3 py-2 shrink-0">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground/50">
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
        className="border-l border-border bg-card flex flex-col h-full shrink-0 overflow-hidden"
        style={{ width: `${width}px` }}
      >
        <div className="p-3 border-b border-border">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Proprietà
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground text-center">
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
      className="border-l border-border bg-card flex flex-col h-full shrink-0 overflow-hidden"
      style={{ width: `${width}px` }}
    >
      {/* Header */}
      <div className="p-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Proprietà
          </h2>
          <button
            onClick={() => selectComponent(null)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] px-2 py-0 font-normal">
            {componentDef.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground/50">
            {componentDef.type}
          </span>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {ancestors.length > 0 && (
        <div className="px-3 py-1.5 border-b border-border shrink-0">
          <Breadcrumb>
            <BreadcrumbList className="text-[10px] gap-1">
              {ancestors.map((ancestor) => (
                <React.Fragment key={ancestor.id}>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      asChild
                      className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <button
                        onClick={() => selectComponent(ancestor.id)}
                        title={ancestor.type}
                      >
                        {ancestor.label}
                      </button>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-[8px]" />
                </React.Fragment>
              ))}
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[10px] font-medium">
                  {selectedComponent.label}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}

      {/* Variant Presets */}
      {COMPONENT_PRESETS[selectedComponent.type] && (
        <div className="px-3 py-2 border-b border-border shrink-0">
          <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1.5">
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
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
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
        <div className="mx-3 mt-2 flex items-start gap-2 px-2.5 py-2 rounded-md bg-muted/60 text-[11px] text-muted-foreground">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
          <span>Questa colonna è gestita dalla Row genitore. Modifica il numero di colonne nelle proprietà della Row.</span>
        </div>
      )}

      {/* Actions — only for non-managed components */}
      {!managed && (
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border shrink-0">
          <button
            onClick={() => moveUp(selectedComponent.id)}
            className="p-1.5 rounded hover:bg-muted transition-colors"
            title="Sposta su"
          >
            <ArrowUp className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => moveDown(selectedComponent.id)}
            className="p-1.5 rounded hover:bg-muted transition-colors"
            title="Sposta giù"
          >
            <ArrowDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => duplicateComponent(selectedComponent.id)}
            className="p-1.5 rounded hover:bg-muted transition-colors"
            title="Duplica"
          >
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => toggleComponentVisibility(selectedComponent.id)}
            className={`p-1.5 rounded transition-colors ${isHidden ? 'bg-muted text-muted-foreground' : 'hover:bg-muted text-muted-foreground'}`}
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
        </div>
      )}

      {/* Property Fields */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-3">
          {/* Nome (rename label) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-muted-foreground">Nome</Label>
            <Input
              value={selectedComponent.label}
              onChange={(e) => updateComponentLabel(selectedComponent.id, e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <Separator />

          {/* Property Search */}
          <div className="space-y-1.5">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca proprietà..."
                className="h-8 text-xs pl-7 pr-7"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
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
                <p className="text-xs text-muted-foreground text-center py-4">
                  Nessuna proprietà trovata
                </p>
              );
            }

            return filteredGroups.map(({ groupName, props }) => (
              <div key={groupName}>
                {Object.keys(propGroups).length > 1 && !searchQuery.trim() && (
                  <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
                    {groupName}
                  </p>
                )}
                <div className="space-y-2.5">
                  {props.map((prop) => (
                    prop.key === "iconLeft" ? (
                      <div key={prop.key} className="space-y-1.5">
                        <Label className="text-xs font-normal text-muted-foreground">
                          {prop.label}
                        </Label>
                        <button
                          type="button"
                          onClick={() => {
                            setIconPickerPropKey(prop.key);
                            setIconPickerValue(String(selectedComponent.props[prop.key] ?? ""));
                            setIconPickerOpen(true);
                          }}
                          className="w-full flex items-center gap-2 h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          {selectedComponent.props[prop.key] ? (
                            <>
                              <i className={`bi-${String(selectedComponent.props[prop.key]).replace(/^bi-?/, '')}`} style={{ fontSize: "14px" }} />
                              <span className="flex-1 text-left font-mono truncate">{String(selectedComponent.props[prop.key])}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Clicca per selezionare...</span>
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
            <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
              Avanzato
            </p>
            <div className="space-y-2.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-normal text-muted-foreground flex items-center gap-1.5">
                  <Tag className="w-3 h-3" />
                  Classi CSS
                </Label>
                <Input
                  value={String(selectedComponent.props.customClass || "")}
                  onChange={(e) =>
                    updateComponentProps(selectedComponent.id, {
                      customClass: e.target.value,
                    })
                  }
                  placeholder="es. my-class custom-styling"
                  className="h-8 text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground/60">Classi CSS aggiuntive per il componente</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-normal text-muted-foreground flex items-center gap-1.5">
                  <Hash className="w-3 h-3" />
                  ID HTML
                </Label>
                <Input
                  value={String(selectedComponent.props.customId || "")}
                  onChange={(e) =>
                    updateComponentProps(selectedComponent.id, {
                      customId: e.target.value,
                    })
                  }
                  placeholder="es. sezione-principale"
                  className="h-8 text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground/60">Attributo id personalizzato per il componente</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      {/* CSS Personalizzato */}
      <div className="border-t border-border px-3 py-3 shrink-0">
            <div className="flex items-center gap-1.5 mb-2">
              <Paintbrush className="w-3 h-3 text-muted-foreground" />
              <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                CSS Personalizzato
              </p>
            </div>
            <textarea
              value={customCSS}
              onChange={(e) => setCustomCSS(e.target.value)}
              placeholder={".mio-componente {\n  color: red;\n  font-size: 18px;\n}"}
              rows={4}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y font-mono leading-relaxed"
            />
            <p className="text-[10px] text-muted-foreground/60 mt-1">Regole CSS personalizzate per l'anteprima e l'esportazione</p>
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
