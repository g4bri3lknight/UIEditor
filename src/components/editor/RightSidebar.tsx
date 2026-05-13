"use client";

import React from "react";
import { useEditorStore, isAutoManaged } from "@/store/editor-store";
import { getComponentByType } from "@/lib/editor/bootstrap-components";
import { PropertyDefinition } from "@/lib/editor/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Trash2, Copy, Info } from "lucide-react";

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
    updateComponentProps,
    removeComponent,
    duplicateComponent,
    selectComponent,
    findComponent,
    getParentInfo,
  } = useEditorStore();

  const selectedComponent = selectedId ? findComponent(selectedId) ?? undefined : undefined;

  const componentDef = selectedComponent
    ? getComponentByType(selectedComponent.type)
    : null;

  const managed = selectedComponent ? isAutoManaged(selectedComponent.type) : false;

  if (!selectedComponent || !componentDef) {
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
            onClick={() => duplicateComponent(selectedComponent.id)}
            className="p-1.5 rounded hover:bg-muted transition-colors"
            title="Duplica"
          >
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <div className="flex-1" />
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
          {Object.entries(propGroups).map(([groupName, props]) => (
            <div key={groupName}>
              {Object.keys(propGroups).length > 1 && (
                <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
                  {groupName}
                </p>
              )}
              <div className="space-y-2.5">
                {props.map((prop) => (
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
                ))}
              </div>
              {Object.entries(propGroups).indexOf([groupName, props] as any) <
                Object.entries(propGroups).length - 1 && (
                <Separator className="my-3" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
