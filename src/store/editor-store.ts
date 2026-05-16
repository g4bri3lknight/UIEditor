// Bootstrap GUI Editor - Editor Store (Zustand with undo/redo)
"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CanvasComponent, SavedSnippet } from "@/lib/editor/types";
import { getComponentByType } from "@/lib/editor/bootstrap-components";

// ── Container types that can accept children ──
export const CONTAINER_TYPES = new Set([
  "container", "row", "col", "card", "modal", "offcanvas",
  "table", "table-row", "table-cell", "tab-content", "accordion", "collapse",
]);

export function isContainer(type: string): boolean {
  return CONTAINER_TYPES.has(type);
}

export function isAutoManaged(type: string): boolean {
  return type === "col" || type === "table-row" || type === "table-cell";
}

// ── Types that support slotted children (header/body/footer or dynamic tabs) ──
export const SLOTTED_TYPES = new Set(["card", "modal", "offcanvas", "tab-content", "accordion", "collapse"]);

export function isSlottedType(type: string): boolean {
  return SLOTTED_TYPES.has(type);
}

// For tab-content: extract tab labels from the items property
export function getTabSlots(itemsProp: unknown): string[] {
  const raw = String(itemsProp || "");
  if (!raw) return ["tab-0"];
  const lines = raw.split("\n").filter(Boolean);
  return lines.map((_, i) => `tab-${i}`);
}

// For accordion: extract accordion item slots from the items property
export function getAccordionSlots(itemsProp: unknown): string[] {
  const raw = String(itemsProp || "");
  if (!raw) return ["acc-0"];
  const lines = raw.split("\n").filter(Boolean);
  return lines.map((_, i) => `acc-${i}`);
}



// ── ID generation ──
let idCounter = 0;
function generateId(): string {
  return `comp-${Date.now()}-${++idCounter}`;
}

// ── Deep clone a component tree with new IDs ──
function deepCloneWithNewIds(comp: CanvasComponent): CanvasComponent {
  return {
    ...comp,
    id: generateId(),
    props: { ...comp.props },
    children: comp.children?.map(deepCloneWithNewIds),
  };
}

// ── Find a component in the tree ──
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

// ── Remove from tree ──
function removeFromTree(comps: CanvasComponent[], id: string): CanvasComponent[] {
  return comps
    .filter(c => c.id !== id)
    .map(c => c.children ? { ...c, children: removeFromTree(c.children, id) } : c);
}

// ── Add to tree ──
function addToTree(
  comps: CanvasComponent[],
  parentId: string | null,
  comp: CanvasComponent,
  index?: number
): CanvasComponent[] {
  if (parentId === null) {
    if (index !== undefined) {
      const arr = [...comps];
      arr.splice(index, 0, comp);
      return arr;
    }
    return [...comps, comp];
  }
  return comps.map(c => {
    if (c.id === parentId) {
      const children = c.children ? [...c.children] : [];
      if (index !== undefined) {
        children.splice(index, 0, comp);
      } else {
        children.push(comp);
      }
      return { ...c, children };
    }
    if (c.children) {
      return { ...c, children: addToTree(c.children, parentId, comp, index) };
    }
    return c;
  });
}

// ── Sync row columns ──
function syncRowChildren(comp: CanvasComponent): CanvasComponent {
  if (comp.type === "row" && comp.children) {
    const targetCols = Number(comp.props.cols) || 3;
    const currentCols = comp.children.length;
    let children = [...comp.children];

    if (currentCols < targetCols) {
      for (let i = currentCols; i < targetCols; i++) {
        children.push({
          id: generateId(),
          type: "col",
          label: `Column ${i + 1}`,
          props: { size: "auto", bgColor: "transparent", textColor: "dark", padding: "3", textAlign: "start" },
          children: [],
        });
      }
    } else if (currentCols > targetCols) {
      children = children.slice(0, targetCols);
    }

    return {
      ...comp,
      children: children.map((c, i) => ({
        ...c,
        label: `Column ${i + 1}`,
        props: { ...c.props },
      })),
    };
  }
  if (comp.children) {
    return { ...comp, children: comp.children.map(syncRowChildren) };
  }
  return comp;
}

// ── Sync table structure (rows and cells) ──
function syncTableStructure(comp: CanvasComponent): CanvasComponent {
  if (comp.type === "table") {
    const headers = String(comp.props.headers || "")
      .split("|")
      .map(h => h.trim())
      .filter(Boolean);
    const numCols = Math.max(headers.length, 1);
    const numRows = Number(comp.props.numRows) || 3;

    let rows = comp.children ? [...comp.children] : [];

    // Sync row count
    while (rows.length < numRows) {
      const cells = Array.from({ length: numCols }, () => ({
        id: generateId(),
        type: "table-cell",
        label: "Cell",
        props: { text: "" },
        children: [],
      }));
      rows.push({
        id: generateId(),
        type: "table-row",
        label: `Row ${rows.length + 1}`,
        props: {},
        children: cells,
      });
    }
    if (rows.length > numRows) {
      rows = rows.slice(0, numRows);
    }

    // Sync cell count for each row
    rows = rows.map((row, ri) => {
      let cells = row.children ? [...row.children] : [];
      while (cells.length < numCols) {
        cells.push({
          id: generateId(),
          type: "table-cell",
          label: "Cell",
          props: { text: "" },
          children: [],
        });
      }
      if (cells.length > numCols) {
        cells = cells.slice(0, numCols);
      }
      return { ...row, label: `Row ${ri + 1}`, children: cells };
    });

    return { ...comp, children: rows };
  }
  // Recurse into children for nested tables
  if (comp.children) {
    return { ...comp, children: comp.children.map(syncTableStructure) };
  }
  return comp;
}

// ── Store interface ──
interface EditorState {
  components: CanvasComponent[];
  selectedId: string | null;
  history: CanvasComponent[][];
  historyIndex: number;
  clipboard: CanvasComponent | null;
  hiddenComponents: Set<string>;

  addComponent: (type: string, parentId?: string | null, index?: number, slot?: string) => void;
  removeComponent: (id: string) => void;
  moveComponent: (fromIndex: number, toIndex: number) => void;
  moveComponentInTree: (compId: string, newParentId: string | null, index?: number, slot?: string) => void;
  duplicateComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  updateComponentProps: (id: string, props: Record<string, string | boolean | number>) => void;
  updateComponentLabel: (id: string, newLabel: string) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  findComponent: (id: string) => CanvasComponent | null;
  getParentInfo: (id: string) => { parent: CanvasComponent | null; index: number } | null;
  getSelectedComponent: () => CanvasComponent | null;
  copyComponent: (id: string) => void;
  pasteComponent: (parentId?: string | null, index?: number) => void;
  importProject: (data: CanvasComponent[]) => boolean;
  loadTemplate: (components: CanvasComponent[]) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  toggleComponentVisibility: (id: string) => void;

  // ── Saved Snippets (reusable templates) ──
  savedSnippets: SavedSnippet[];
  _hydrated: boolean;
  saveSnippet: (name: string, componentIds: string[]) => void;
  deleteSnippet: (id: string) => void;
  renameSnippet: (id: string, newName: string) => void;
  insertSnippet: (snippetId: string, parentId?: string | null, index?: number, slot?: string) => void;
}

// ── History size limit ──
const MAX_HISTORY = 100;

// ── Store ──
export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
  components: [],
  selectedId: null,
  history: [[]],
  historyIndex: 0,
  clipboard: null,
  hiddenComponents: new Set<string>(),
  savedSnippets: [],
  _hydrated: false,

  pushHistory: () => {
    set(s => {
      const snapshot = JSON.parse(JSON.stringify(s.components)) as CanvasComponent[];
      const newHistory = s.history.slice(0, s.historyIndex + 1);
      newHistory.push(snapshot);
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      const newIdx = newHistory.length - 1;
      return { history: newHistory, historyIndex: newIdx };
    });
  },

  addComponent: (type, parentId = null, index, slot) => {
    const def = getComponentByType(type);
    if (!def) return;

    const comp: CanvasComponent = {
      id: generateId(),
      type,
      label: def.label,
      props: {},
      children: undefined,
      slot: slot ? (slot as "header" | "body" | "footer") : undefined,
    };

    // Initialize default props
    for (const prop of def.properties) {
      comp.props[prop.key] = prop.defaultValue;
    }

    if (type === "row") {
      const cols = Number(comp.props.cols) || 3;
      comp.children = Array.from({ length: cols }, (_, i) => ({
        id: generateId(),
        type: "col",
        label: `Column ${i + 1}`,
        props: { size: "auto", bgColor: "transparent", textColor: "dark", padding: "3", textAlign: "start" },
        children: [],
      }));
    }

    if (type === "table") {
      const headers = String(comp.props.headers || "")
        .split("|")
        .map(h => h.trim())
        .filter(Boolean);
      const numCols = Math.max(headers.length, 1);
      const numRows = Number(comp.props.numRows) || 3;
      comp.children = Array.from({ length: numRows }, (_, ri) => ({
        id: generateId(),
        type: "table-row",
        label: `Row ${ri + 1}`,
        props: {},
        children: Array.from({ length: numCols }, () => ({
          id: generateId(),
          type: "table-cell",
          label: "Cell",
          props: { text: "" },
          children: [],
        })),
      }));
    }

    set(s => {
      const newComps = addToTree(s.components, parentId, comp, index);
      return { components: newComps, selectedId: comp.id };
    });
    get().pushHistory();
  },

  removeComponent: (id) => {
    const comp = findInTree(get().components, id);
    if (!comp || isAutoManaged(comp.type)) return;
    set(s => {
      const newComps = removeFromTree(s.components, id);
      return { components: newComps, selectedId: s.selectedId === id ? null : s.selectedId };
    });
    get().pushHistory();
  },

  moveComponent: (fromIndex, toIndex) => {
    set(s => {
      const arr = [...s.components];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return { components: arr };
    });
    get().pushHistory();
  },

  moveComponentInTree: (compId, newParentId, index, slot) => {
    const comp = findInTree(get().components, compId);
    if (!comp) return;

    // Self-drop prevention: if same parent and same effective position, skip
    const info = get().getParentInfo(compId);
    const currentParentId = info?.parent?.id ?? null;
    if (currentParentId === newParentId && info !== null) {
      const siblings = currentParentId
        ? findInTree(get().components, currentParentId)?.children ?? []
        : get().components;
      const currentIdx = siblings.findIndex(c => c.id === compId);
      const targetIdx = index !== undefined ? index : siblings.length - 1;
      if (currentIdx === targetIdx) return;
    }

    const clone = deepCloneWithNewIds(comp);
    // Keep original ID for move (not copy)
    clone.id = compId;
    clone.children = comp.children;
    // Update slot if specified (e.g. moving to a different tab pane)
    if (slot !== undefined) {
      clone.slot = slot as CanvasComponent["slot"];
    }

    set(s => {
      let newComps = removeFromTree(s.components, compId);
      newComps = addToTree(newComps, newParentId, clone, index);
      return { components: newComps };
    });
    get().pushHistory();
  },

  duplicateComponent: (id) => {
    const comp = findInTree(get().components, id);
    if (!comp || isAutoManaged(comp.type)) return;
    const clone = deepCloneWithNewIds(comp);
    // Find parent and position to insert clone next to the original
    const parentInfo = get().getParentInfo(id);
    set(s => {
      let newComps: CanvasComponent[];
      if (parentInfo) {
        newComps = addToTree(s.components, parentInfo.parent?.id ?? null, clone, parentInfo.index + 1);
      } else {
        // Root level — find index and insert after
        const rootIndex = s.components.findIndex(c => c.id === id);
        newComps = addToTree(s.components, null, clone, rootIndex >= 0 ? rootIndex + 1 : undefined);
      }
      return { components: newComps, selectedId: clone.id };
    });
    get().pushHistory();
  },

  selectComponent: (id) => set({ selectedId: id }),

  updateComponentProps: (id, props) => {
    set(s => {
      const updateInTree = (comps: CanvasComponent[]): CanvasComponent[] =>
        comps.map(c => {
          if (c.id === id) {
            const updated = { ...c, props: { ...c.props, ...props } };
            let synced = syncRowChildren(updated);
            synced = syncTableStructure(synced);
            return synced;
          }
          if (c.children) return { ...c, children: updateInTree(c.children) };
          return c;
        });
      return { components: updateInTree(s.components) };
    });
    get().pushHistory();
  },

  updateComponentLabel: (id, newLabel) => {
    set(s => {
      const updateInTree = (comps: CanvasComponent[]): CanvasComponent[] =>
        comps.map(c => {
          if (c.id === id) {
            return { ...c, label: newLabel };
          }
          if (c.children) return { ...c, children: updateInTree(c.children) };
          return c;
        });
      return { components: updateInTree(s.components) };
    });
    get().pushHistory();
  },

  clearCanvas: () => {
    set({ components: [], selectedId: null });
    get().pushHistory();
  },

  undo: () => {
    set(s => {
      if (s.historyIndex <= 0) return s;
      const newIdx = s.historyIndex - 1;
      return { components: JSON.parse(JSON.stringify(s.history[newIdx])), historyIndex: newIdx };
    });
  },

  redo: () => {
    set(s => {
      if (s.historyIndex >= s.history.length - 1) return s;
      const newIdx = s.historyIndex + 1;
      return { components: JSON.parse(JSON.stringify(s.history[newIdx])), historyIndex: newIdx };
    });
  },

  findComponent: (id) => findInTree(get().components, id),

  getParentInfo: (id) => {
    const search = (comps: CanvasComponent[], parent: CanvasComponent | null): { parent: CanvasComponent | null; index: number } | null => {
      for (let i = 0; i < comps.length; i++) {
        if (comps[i].id === id) return { parent, index: i };
        if (comps[i].children) {
          const found = search(comps[i].children!, comps[i]);
          if (found) return found;
        }
      }
      return null;
    };
    return search(get().components, null);
  },

  getSelectedComponent: () => {
    const { selectedId, components } = get();
    if (!selectedId) return null;
    return findInTree(components, selectedId);
  },

  copyComponent: (id) => {
    const comp = findInTree(get().components, id);
    if (!comp || isAutoManaged(comp.type)) return;
    set({ clipboard: deepCloneWithNewIds(comp) });
  },

  pasteComponent: (parentId, index) => {
    const { clipboard } = get();
    if (!clipboard) return;
    const clone = deepCloneWithNewIds(clipboard);
    set(s => {
      const newComps = addToTree(s.components, parentId ?? null, clone, index);
      return { components: newComps, selectedId: clone.id };
    });
    get().pushHistory();
  },

  importProject: (data) => {
    if (!Array.isArray(data)) return false;
    if (data.length === 0) return false;
    // Basic validation: each item must have id, type, props
    const isValid = data.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.type === "string" &&
        typeof item.props === "object"
    );
    if (!isValid) return false;
    set({ components: data, selectedId: null });
    get().pushHistory();
    return true;
  },

  loadTemplate: (components) => {
    set({ components, selectedId: null });
    get().pushHistory();
  },

  moveUp: (id) => {
    const info = get().getParentInfo(id);
    if (!info || info.index === 0) return;
    const parentId = info.parent?.id ?? null;
    get().moveComponentInTree(id, parentId, info.index - 1);
  },

  moveDown: (id) => {
    const info = get().getParentInfo(id);
    if (!info || info.index === undefined) return;
    const parentId = info.parent?.id ?? null;
    const siblings = info.parent ? info.parent.children! : get().components;
    if (info.index >= siblings.length - 1) return;
    get().moveComponentInTree(id, parentId, info.index + 2);
  },

  toggleComponentVisibility: (id) => {
    set(s => {
      const next = new Set(s.hiddenComponents);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { hiddenComponents: next };
    });
  },

  // ── Saved Snippets ──
  saveSnippet: (name, componentIds) => {
    const { components, savedSnippets } = get();
    // Extract the specified components from the canvas tree (deep clone with new IDs)
    const snippetComponents = componentIds
      .map(id => findInTree(components, id))
      .filter((c): c is CanvasComponent => c !== null)
      .map(c => deepCloneWithNewIds(c));

    if (snippetComponents.length === 0) return;

    // For single component, use its label as a suggestion if name is empty
    const snippetName = name || snippetComponents.map(c => c.label).join(", ");

    const snippet: SavedSnippet = {
      id: `snippet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: snippetName,
      components: snippetComponents,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const newSnippets = [...savedSnippets, snippet];
    set({ savedSnippets: newSnippets });
  },

  deleteSnippet: (id) => {
    const newSnippets = get().savedSnippets.filter(s => s.id !== id);
    set({ savedSnippets: newSnippets });
  },

  renameSnippet: (id, newName) => {
    const newSnippets = get().savedSnippets.map(s =>
      s.id === id ? { ...s, name: newName, updatedAt: Date.now() } : s
    );
    set({ savedSnippets: newSnippets });
  },

  insertSnippet: (snippetId, parentId, index, slot) => {
    const snippet = get().savedSnippets.find(s => s.id === snippetId);
    if (!snippet) return;

    const now = Date.now();
    // Deep clone with fresh IDs for each component
    const cloned = snippet.components.map(comp => {
      const freshClone = deepCloneWithNewIds(comp);
      return freshClone;
    });

    // Insert all components (they go to the same parent/index)
    set(s => {
      let newComps = [...s.components];
      for (let i = 0; i < cloned.length; i++) {
        newComps = addToTree(newComps, parentId, cloned[i], index !== undefined ? index + i : undefined);
      }
      return { components: newComps, selectedId: cloned[0].id };
    });
    get().pushHistory();
  },
}),
    {
      name: "bootstrap-editor-saved-snippets",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ savedSnippets: state.savedSnippets }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrated = true;
          useEditorStore.setState({ _hydrated: true });
        }
      },
    }
  )
);
