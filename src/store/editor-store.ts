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

// ── Theme Configuration ──
export interface BootstrapTheme {
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  dangerColor: string;
  warningColor: string;
  infoColor: string;
  fontFamily: string;
  borderRadius: string;
  bodyBg: string;
  bodyColor: string;
}

export const DEFAULT_THEME: BootstrapTheme = {
  primaryColor: "#0d6efd",
  secondaryColor: "#6c757d",
  successColor: "#198754",
  dangerColor: "#dc3545",
  warningColor: "#ffc107",
  infoColor: "#0dcaf0",
  fontFamily: "system-ui, -apple-system, sans-serif",
  borderRadius: "0.375rem",
  bodyBg: "#ffffff",
  bodyColor: "#212529",
};

// ── Multi-page Support ──
export interface EditorPage {
  id: string;
  name: string;
  components: CanvasComponent[];
  history: CanvasComponent[][];
  historyIndex: number;
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
  // For non-row types with children, recurse — but avoid creating a new
  // children array reference if nothing changed (important for React.memo).
  // Leaf nodes with empty children arrays are returned as-is to preserve
  // reference equality and prevent unnecessary re-renders.
  if (comp.children && comp.children.length > 0) {
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
  // Active page working state (top-level for backward compatibility)
  components: CanvasComponent[];
  selectedId: string | null;
  history: CanvasComponent[][];
  historyIndex: number;
  clipboard: CanvasComponent | null;
  hiddenComponents: string[];
  customCSS: string;
  setCustomCSS: (css: string) => void;

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
  getAncestors: (id: string) => CanvasComponent[];
  getSelectedComponent: () => CanvasComponent | null;
  copyComponent: (id: string) => void;
  pasteComponent: (parentId?: string | null, index?: number) => void;
  importProject: (data: CanvasComponent[]) => boolean;
  loadTemplate: (components: CanvasComponent[]) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  toggleComponentVisibility: (id: string) => void;
  collapsedComponents: string[];
  toggleComponentCollapsed: (id: string) => void;

  // ── Custom Theme ──
  bootstrapTheme: BootstrapTheme;
  updateTheme: (theme: Partial<BootstrapTheme>) => void;
  resetTheme: () => void;

  // ── Canvas Grid Overlay (FEAT-6) ──
  showGrid: boolean;
  toggleGrid: () => void;

  // ── Multi-selection (FEAT-7) ──
  selectedIds: string[];
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  toggleInSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  removeSelectedComponents: () => void;
  duplicateSelectedComponents: () => void;
  copySelectedComponents: () => void;

  // ── Multi-page Support ──
  pages: EditorPage[];
  activePageId: string;
  addPage: (name?: string) => void;
  deletePage: (id: string) => void;
  renamePage: (id: string, newName: string) => void;
  switchPage: (id: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  _syncCurrentPage: () => void;

  // ── Saved Snippets (reusable templates) ──
  savedSnippets: SavedSnippet[];
  _schemaVersion: number;
  _hydrated: boolean;
  _lastSavedAt: number | null;
  _isDirty: boolean;
  saveSnippet: (name: string, componentIds: string[], category?: string) => void;
  deleteSnippet: (id: string) => void;
  renameSnippet: (id: string, newName: string) => void;
  updateSnippetCategory: (id: string, newCategory: string) => void;
  insertSnippet: (snippetId: string, parentId?: string | null, index?: number, slot?: string) => void;
  exportSnippets: (snippetIds?: string[]) => string;
  importSnippets: (jsonString: string) => number;
}

// ── History size limit ──
const MAX_HISTORY = 100;

// ── Debounce timer for property update history pushes ──
let propHistoryTimer: ReturnType<typeof setTimeout> | null = null;

// ── Schema version for persistence migrations ──
// Increment this when the persisted state shape changes.
// Add a corresponding migration in `runMigrations` below.
const SCHEMA_VERSION = 3;

type PersistedState = Record<string, any>;

/**
 * Run migrations on persisted state to bring it up to the current schema.
 * Each migration function receives the state and returns the migrated state.
 */
function runMigrations(state: PersistedState): PersistedState {
  const version = state._schemaVersion ?? 1;

  // v1 → v2: hiddenComponents was a Set<string> (not JSON-serializable).
  // If it's stored as an object (from Set), convert to array.
  if (version < 2) {
    if (state.hiddenComponents && !Array.isArray(state.hiddenComponents)) {
      try {
        // A serialized Set becomes an object like { "0": "id1", "1": "id2" } or null
        state.hiddenComponents = Object.values(state.hiddenComponents);
      } catch {
        state.hiddenComponents = [];
      }
    }
    if (!Array.isArray(state.hiddenComponents)) {
      state.hiddenComponents = [];
    }
  }

  // v2 → v3: Ensure savedSnippets have category and components fields.
  if (version < 3) {
    if (Array.isArray(state.savedSnippets)) {
      state.savedSnippets = state.savedSnippets.map((s: PersistedState) => ({
        ...s,
        category: s.category || "Generale",
        components: Array.isArray(s.components) ? s.components : [],
      }));
    }
  }

  // Mark as migrated
  state._schemaVersion = SCHEMA_VERSION;
  return state;
}

// ── Store ──
export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
  components: [],
  selectedId: null,
  history: [[]],
  historyIndex: 0,
  clipboard: null,
  hiddenComponents: [],
  collapsedComponents: [],
  customCSS: "",
  setCustomCSS: (css) => set({ customCSS: css }),

  // ── Custom Theme ──
  bootstrapTheme: { ...DEFAULT_THEME },
  updateTheme: (partial) => {
    set(s => ({
      bootstrapTheme: { ...s.bootstrapTheme, ...partial },
    }));
  },
  resetTheme: () => {
    set({ bootstrapTheme: { ...DEFAULT_THEME } });
  },

  // ── Canvas Grid Overlay (FEAT-6) ──
  showGrid: false,
  toggleGrid: () => set(s => ({ showGrid: !s.showGrid })),

  // ── Multi-selection (FEAT-7) ──
  selectedIds: [],
  addToSelection: (id) => set(s => {
    if (s.selectedIds.includes(id)) return s;
    return { selectedIds: [...s.selectedIds, id] };
  }),
  removeFromSelection: (id) => set(s => ({
    selectedIds: s.selectedIds.filter(x => x !== id),
  })),
  toggleInSelection: (id) => set(s => {
    if (s.selectedIds.includes(id)) {
      return { selectedIds: s.selectedIds.filter(x => x !== id) };
    }
    return { selectedIds: [...s.selectedIds, id] };
  }),
  clearSelection: () => set({ selectedIds: [] }),
  selectAll: () => {
    const { components } = get();
    // Collect all non-auto-managed IDs from the tree
    const allIds: string[] = [];
    const collectIds = (comps: CanvasComponent[]) => {
      for (const c of comps) {
        if (!isAutoManaged(c.type)) {
          allIds.push(c.id);
        }
        if (c.children) collectIds(c.children);
      }
    };
    collectIds(components);
    set({ selectedIds: allIds, selectedId: null });
  },
  removeSelectedComponents: () => {
    const { selectedIds } = get();
    if (selectedIds.length === 0) return;
    set(s => {
      let newComps = s.components;
      for (const id of selectedIds) {
        newComps = removeFromTree(newComps, id);
      }
      return {
        components: newComps,
        selectedIds: [],
        selectedId: s.selectedId && selectedIds.includes(s.selectedId) ? null : s.selectedId,
      };
    });
    get().pushHistory();
  },
  duplicateSelectedComponents: () => {
    const { selectedIds, components } = get();
    if (selectedIds.length === 0) return;
    // Duplicate each selected component and insert after original
    const clones: { comp: CanvasComponent; afterId: string }[] = [];
    for (const id of selectedIds) {
      const comp = findInTree(components, id);
      if (!comp || isAutoManaged(comp.type)) continue;
      const clone = deepCloneWithNewIds(comp);
      clones.push({ comp: clone, afterId: id });
    }
    if (clones.length === 0) return;
    set(s => {
      let newComps = s.components;
      const newSelectedIds: string[] = [];
      for (const { comp, afterId } of clones) {
        const parentInfo = get().getParentInfo(afterId);
        if (parentInfo) {
          newComps = addToTree(newComps, parentInfo.parent?.id ?? null, comp, parentInfo.index + 1);
        } else {
          const rootIndex = newComps.findIndex(c => c.id === afterId);
          newComps = addToTree(newComps, null, comp, rootIndex >= 0 ? rootIndex + 1 : undefined);
        }
        newSelectedIds.push(comp.id);
      }
      return { components: newComps, selectedIds: newSelectedIds };
    });
    get().pushHistory();
  },
  copySelectedComponents: () => {
    const { selectedIds, components } = get();
    if (selectedIds.length === 0) return;
    // Store all selected components as an array in clipboard
    const copied = selectedIds
      .map(id => findInTree(components, id))
      .filter((c): c is CanvasComponent => c !== null && !isAutoManaged(c.type))
      .map(c => deepCloneWithNewIds(c));
    // Use the first component as clipboard for backward compatibility
    // and also store the full array via a separate mechanism
    if (copied.length > 0) {
      set({ clipboard: copied[0] });
    }
    // Store multi-clipboard in a global ref for paste operation
    (get() as any)._multiClipboard = copied;
  },

  // ── Multi-page Support ──
  pages: [] as EditorPage[],
  activePageId: "",

  _syncCurrentPage: () => {
    const state = get();
    if (!state.activePageId) return;
    set(s => ({
      pages: s.pages.map(p =>
        p.id === s.activePageId
          ? { ...p, components: s.components, history: s.history, historyIndex: s.historyIndex }
          : p
      ),
    }));
  },

  switchPage: (id) => {
    const state = get();
    if (id === state.activePageId) return;
    // Save current page first
    if (state.activePageId) {
      state._syncCurrentPage();
    }
    // Load new page
    const page = get().pages.find(p => p.id === id);
    if (page) {
      set({
        activePageId: id,
        components: page.components,
        history: page.history,
        historyIndex: page.historyIndex,
        selectedId: null,
        selectedIds: [],
      });
    }
  },

  addPage: (name) => {
    const state = get();
    // Sync current page first
    if (state.activePageId) {
      state._syncCurrentPage();
    }
    const newPage: EditorPage = {
      id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name || `Pagina ${state.pages.length + 1}`,
      components: [],
      history: [[]],
      historyIndex: 0,
    };
    set(s => ({
      pages: [...s.pages, newPage],
      activePageId: newPage.id,
      components: newPage.components,
      history: newPage.history,
      historyIndex: newPage.historyIndex,
      selectedId: null,
      selectedIds: [],
    }));
  },

  deletePage: (id) => {
    const state = get();
    if (state.pages.length <= 1) return;
    const idx = state.pages.findIndex(p => p.id === id);
    if (idx === -1) return;
    const newPages = state.pages.filter(p => p.id !== id);
    if (id === state.activePageId) {
      const switchIdx = Math.min(idx, newPages.length - 1);
      const page = newPages[switchIdx];
      set({
        pages: newPages,
        activePageId: page.id,
        components: page.components,
        history: page.history,
        historyIndex: page.historyIndex,
        selectedId: null,
        selectedIds: [],
      });
    } else {
      set({ pages: newPages });
    }
  },

  renamePage: (id, newName) => {
    set(s => ({
      pages: s.pages.map(p => p.id === id ? { ...p, name: newName } : p),
    }));
  },

  reorderPages: (fromIndex, toIndex) => {
    set(s => {
      const arr = [...s.pages];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return { pages: arr };
    });
  },

  // ── Saved Snippets ──
  savedSnippets: [],
  _schemaVersion: SCHEMA_VERSION,
  _hydrated: false,
  _lastSavedAt: null,
  _isDirty: false,

  pushHistory: () => {
    set(s => {
      const snapshot = structuredClone(s.components) as CanvasComponent[];
      const newHistory = s.history.slice(0, s.historyIndex + 1);
      newHistory.push(snapshot);
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      const newIdx = newHistory.length - 1;
      return { history: newHistory, historyIndex: newIdx, _isDirty: true };
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
      slot: slot || undefined,
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
      return {
        components: newComps,
        selectedId: s.selectedId === id ? null : s.selectedId,
        selectedIds: s.selectedIds.filter(x => x !== id),
      };
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
      clone.slot = slot;
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

  selectComponent: (id) => set({ selectedId: id, selectedIds: id ? [id] : [] }),

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
    // Debounce history push for property updates to improve responsiveness.
    // Instead of pushing history on every keystroke (which triggers expensive
    // structuredClone), we delay the push so rapid edits are batched.
    if (!propHistoryTimer) {
      propHistoryTimer = setTimeout(() => {
        propHistoryTimer = null;
        useEditorStore.getState().pushHistory();
      }, 400);
    }
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
    // Debounce history push for label updates (same as prop updates)
    if (!propHistoryTimer) {
      propHistoryTimer = setTimeout(() => {
        propHistoryTimer = null;
        useEditorStore.getState().pushHistory();
      }, 400);
    }
  },

  clearCanvas: () => {
    set({ components: [], selectedId: null, selectedIds: [] });
    get().pushHistory();
  },

  undo: () => {
    set(s => {
      if (s.historyIndex <= 0) return s;
      const newIdx = s.historyIndex - 1;
      return { components: structuredClone(s.history[newIdx]), historyIndex: newIdx };
    });
  },

  redo: () => {
    set(s => {
      if (s.historyIndex >= s.history.length - 1) return s;
      const newIdx = s.historyIndex + 1;
      return { components: structuredClone(s.history[newIdx]), historyIndex: newIdx };
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

  getAncestors: (id) => {
    const ancestors: CanvasComponent[] = [];
    const search = (comps: CanvasComponent[], path: CanvasComponent[]): boolean => {
      for (const c of comps) {
        if (c.id === id) {
          ancestors.push(...path);
          return true;
        }
        if (c.children) {
          if (search(c.children, [...path, c])) return true;
        }
      }
      return false;
    };
    search(get().components, []);
    return ancestors;
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
    set({ components: data, selectedId: null, selectedIds: [] });
    get().pushHistory();
    return true;
  },

  loadTemplate: (components) => {
    set({ components, selectedId: null, selectedIds: [] });
    get().pushHistory();
  },

  moveUp: (id) => {
    const info = get().getParentInfo(id);
    if (!info || info.index === 0) return;
    const fromIdx = info.index;
    const toIdx = info.index - 1;

    set(s => {
      // Find the parent array (root or nested) and swap the two items
      const swapInTree = (comps: CanvasComponent[]): CanvasComponent[] => {
        // Check if the target is a direct child of this array
        const foundIdx = comps.findIndex(c => c.id === id);
        if (foundIdx !== -1 && toIdx >= 0 && toIdx < comps.length) {
          const newArr = [...comps];
          [newArr[fromIdx], newArr[toIdx]] = [newArr[toIdx], newArr[fromIdx]];
          // Update column labels if parent is a row
          return newArr.map((c, i) => {
            if (c.type === "col") {
              return { ...c, label: `Column ${i + 1}` };
            }
            return c;
          });
        }
        // Recurse into children
        return comps.map(c => {
          if (c.children) {
            const childIdx = c.children.findIndex(ch => ch.id === id);
            if (childIdx !== -1 && toIdx >= 0 && toIdx < c.children.length) {
              const newChildren = [...c.children];
              [newChildren[fromIdx], newChildren[toIdx]] = [newChildren[toIdx], newChildren[fromIdx]];
              // Update column labels if parent is a row
              return {
                ...c,
                children: c.type === "row"
                  ? newChildren.map((ch, i) => ({ ...ch, label: `Column ${i + 1}` }))
                  : newChildren,
              };
            }
            const updatedChildren = swapInTree(c.children);
            return updatedChildren === c.children ? c : { ...c, children: updatedChildren };
          }
          return c;
        });
      };

      return { components: swapInTree(s.components) };
    });
    get().pushHistory();
    get()._syncCurrentPage();
  },

  moveDown: (id) => {
    const info = get().getParentInfo(id);
    if (!info) return;
    const siblings = info.parent ? (info.parent.children || []) : get().components;
    if (info.index >= siblings.length - 1) return;
    const fromIdx = info.index;
    const toIdx = info.index + 1;

    set(s => {
      const swapInTree = (comps: CanvasComponent[]): CanvasComponent[] => {
        const foundIdx = comps.findIndex(c => c.id === id);
        if (foundIdx !== -1 && toIdx >= 0 && toIdx < comps.length) {
          const newArr = [...comps];
          [newArr[fromIdx], newArr[toIdx]] = [newArr[toIdx], newArr[fromIdx]];
          return newArr.map((c, i) => {
            if (c.type === "col") {
              return { ...c, label: `Column ${i + 1}` };
            }
            return c;
          });
        }
        return comps.map(c => {
          if (c.children) {
            const childIdx = c.children.findIndex(ch => ch.id === id);
            if (childIdx !== -1 && toIdx >= 0 && toIdx < c.children.length) {
              const newChildren = [...c.children];
              [newChildren[fromIdx], newChildren[toIdx]] = [newChildren[toIdx], newChildren[fromIdx]];
              return {
                ...c,
                children: c.type === "row"
                  ? newChildren.map((ch, i) => ({ ...ch, label: `Column ${i + 1}` }))
                  : newChildren,
              };
            }
            const updatedChildren = swapInTree(c.children);
            return updatedChildren === c.children ? c : { ...c, children: updatedChildren };
          }
          return c;
        });
      };

      return { components: swapInTree(s.components) };
    });
    get().pushHistory();
    get()._syncCurrentPage();
  },

  toggleComponentVisibility: (id) => {
    set(s => {
      const arr = s.hiddenComponents;
      if (arr.includes(id)) {
        return { hiddenComponents: arr.filter(x => x !== id) };
      } else {
        return { hiddenComponents: [...arr, id] };
      }
    });
  },

  toggleComponentCollapsed: (id) => set(s => {
    const arr = s.collapsedComponents;
    if (arr.includes(id)) {
      return { collapsedComponents: arr.filter(x => x !== id) };
    } else {
      return { collapsedComponents: [...arr, id] };
    }
  }),

  // ── Saved Snippets ──
  saveSnippet: (name, componentIds, category) => {
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
      category: category || "Generale",
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

  updateSnippetCategory: (id, newCategory) => {
    const newSnippets = get().savedSnippets.map(s =>
      s.id === id ? { ...s, category: newCategory, updatedAt: Date.now() } : s
    );
    set({ savedSnippets: newSnippets });
  },

  exportSnippets: (snippetIds) => {
    const snippets = snippetIds
      ? get().savedSnippets.filter(s => snippetIds.includes(s.id))
      : get().savedSnippets;
    return JSON.stringify(snippets, null, 2);
  },

  importSnippets: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) return 0;
      const valid = parsed.filter((s: any) => s.id && s.name && Array.isArray(s.components));
      if (valid.length === 0) return 0;
      // Ensure each snippet has a category
      const withCategory = valid.map((s: any) => ({
        ...s,
        category: s.category || "Importati",
        id: `snippet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // Generate fresh IDs to avoid conflicts
      }));
      set({ savedSnippets: [...get().savedSnippets, ...withCategory] });
      return withCategory.length;
    } catch {
      return 0;
    }
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
      partialize: (state) => ({
        savedSnippets: state.savedSnippets,
        bootstrapTheme: state.bootstrapTheme,
        pages: state.pages,
        activePageId: state.activePageId,
        components: state.components,
        history: state.history,
        historyIndex: state.historyIndex,
        hiddenComponents: state.hiddenComponents,
        collapsedComponents: state.collapsedComponents,
        customCSS: state.customCSS,
        _schemaVersion: state._schemaVersion,
        showGrid: state.showGrid,
      }),
      onRehydrateStorage: () => (state) => {
        try {
          if (state) {
            // Run schema migrations on the persisted state
            runMigrations(state as unknown as PersistedState);

            // If pages exist from persistence, load the active page's data
            if (state.pages?.length > 0 && state.activePageId) {
              const activePage = state.pages.find(p => p.id === state.activePageId);
              if (activePage) {
                // Direct mutation — useEditorStore is not yet assigned during
                // synchronous rehydration (Turbopack). The persist middleware
                // will merge these changes into the store after the callback.
                state.components = activePage.components;
                state.history = activePage.history;
                state.historyIndex = activePage.historyIndex;
              }
            } else {
              // First-time hydration: create a default "Home" page from current components
              const defaultPage: EditorPage = {
                id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                name: "Home",
                components: state.components,
                history: state.history,
                historyIndex: state.historyIndex,
              };
              state.pages = [defaultPage];
              state.activePageId = defaultPage.id;
            }
            // Mark as freshly loaded (not dirty)
            state._isDirty = false;
            state._lastSavedAt = Date.now();
          }
        } catch (err) {
          console.error("[editor-store] Rehydration error:", err);
        } finally {
          // Always mark as hydrated so the UI doesn't get stuck on "Caricamento..."
          if (state) {
            state._hydrated = true;
          }
        }
      },
    }
  )
);

// ── Auto-save indicator: mark as saved after persist writes ──
// The persist middleware writes to localStorage asynchronously.
// We subscribe to changes and, after a short debounce, mark the store as saved.
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
useEditorStore.subscribe((state, prevState) => {
  // Only react to dirty changes (skip selection-only changes)
  if (state._isDirty && !prevState._isDirty) {
    // The persist middleware will auto-save; after it writes, mark as saved
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      useEditorStore.setState({ _isDirty: false, _lastSavedAt: Date.now() });
    }, 600);
  }
});
