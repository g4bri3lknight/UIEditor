// Bootstrap GUI Editor - Zustand Store (Tree-based)
import { create } from "zustand";
import { CanvasComponent } from "@/lib/editor/types";
import { getComponentByType } from "@/lib/editor/bootstrap-components";

function generateId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getDefaultProps(type: string): Record<string, string | boolean | number> {
  const def = getComponentByType(type);
  if (!def) return {};
  const props: Record<string, string | boolean | number> = {};
  for (const p of def.properties) {
    props[p.key] = p.defaultValue;
  }
  return props;
}

function createCol(): CanvasComponent {
  return {
    id: generateId(),
    type: "col",
    label: "Column",
    props: { bgColor: "light", padding: "3", textColor: "dark" },
    children: [],
  };
}

function newComponent(type: string): CanvasComponent {
  const def = getComponentByType(type);
  const comp: CanvasComponent = {
    id: generateId(),
    type,
    label: def?.label || type,
    props: getDefaultProps(type),
    children: isContainer(type) ? [] : undefined,
  };

  // Auto-create columns for rows
  if (type === "row") {
    const numCols = Number(comp.props.cols) || 3;
    comp.children = Array.from({ length: numCols }, () => createCol());
  }

  return comp;
}

// Layout types that can hold children
export const CONTAINER_TYPES = new Set(["container", "row", "col"]);

export function isContainer(type: string): boolean {
  return CONTAINER_TYPES.has(type);
}

// Auto-managed types cannot be independently dragged or deleted
export function isAutoManaged(type: string): boolean {
  return type === "col";
}

// ── Recursive tree helpers ──

function deepClone(components: CanvasComponent[]): CanvasComponent[] {
  return JSON.parse(JSON.stringify(components));
}

function removeById(list: CanvasComponent[], id: string): CanvasComponent[] {
  return list
    .filter((c) => c.id !== id)
    .map((c) => (c.children ? { ...c, children: removeById(c.children, id) } : c));
}

function updatePropsById(
  list: CanvasComponent[],
  id: string,
  props: Record<string, string | boolean | number>
): CanvasComponent[] {
  return list.map((c) => {
    if (c.id === id) return { ...c, props: { ...c.props, ...props } };
    if (c.children) return { ...c, children: updatePropsById(c.children, id, props) };
    return c;
  });
}

function findById(list: CanvasComponent[], id: string): CanvasComponent | null {
  for (const c of list) {
    if (c.id === id) return c;
    if (c.children) {
      const found = findById(c.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findParentList(list: CanvasComponent[], id: string): { parentList: CanvasComponent[]; index: number } | null {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return { parentList: list, index: i };
    if (list[i].children) {
      const result = findParentList(list[i].children!, id);
      if (result) return result;
    }
  }
  return null;
}

function findParentInfo(list: CanvasComponent[], id: string, parentPath: string[] = []): { parentId: string | null; index: number; siblings: CanvasComponent[] } | null {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return {
        parentId: parentPath.length > 0 ? parentPath[parentPath.length - 1] : null,
        index: i,
        siblings: list,
      };
    }
    if (list[i].children) {
      const result = findParentInfo(list[i].children!, id, [...parentPath, list[i].id]);
      if (result) return result;
    }
  }
  return null;
}

function insertChild(
  list: CanvasComponent[],
  parentId: string | null,
  child: CanvasComponent,
  index?: number
): CanvasComponent[] {
  // Insert at root
  if (parentId === null) {
    if (index !== undefined && index >= 0) {
      const updated = [...list];
      updated.splice(index, 0, child);
      return updated;
    }
    return [...list, child];
  }
  // Insert inside a parent container
  return list.map((c) => {
    if (c.id === parentId) {
      const children = c.children ? [...c.children] : [];
      if (index !== undefined && index >= 0) {
        children.splice(index, 0, child);
      } else {
        children.push(child);
      }
      return { ...c, children };
    }
    if (c.children) {
      return { ...c, children: insertChild(c.children, parentId, child, index) };
    }
    return c;
  });
}

function duplicateWithNewIds(comp: CanvasComponent): CanvasComponent {
  return {
    ...comp,
    id: generateId(),
    children: comp.children?.map(duplicateWithNewIds),
  };
}

function collectContainerIds(list: CanvasComponent[]): string[] {
  const ids: string[] = [];
  for (const c of list) {
    if (isContainer(c.type)) ids.push(c.id);
    if (c.children) ids.push(...collectContainerIds(c.children));
  }
  return ids;
}

// ── Sync row children to match cols count ──
function syncRowChildrenById(list: CanvasComponent[], targetId: string): CanvasComponent[] {
  return list.map((c) => {
    if (c.id === targetId && c.type === "row") {
      const targetCount = Number(c.props.cols) || 3;
      const current = c.children || [];

      let newChildren: CanvasComponent[];
      if (current.length <= targetCount) {
        newChildren = [...current];
        for (let i = current.length; i < targetCount; i++) {
          newChildren.push(createCol());
        }
      } else {
        newChildren = current.slice(0, targetCount);
      }

      return { ...c, children: newChildren };
    }
    if (c.children) {
      return { ...c, children: syncRowChildrenById(c.children, targetId) };
    }
    return c;
  });
}

// ── Store ──

interface ParentInfo {
  parentId: string | null;
  index: number;
  siblings: CanvasComponent[];
}

interface EditorState {
  components: CanvasComponent[];
  selectedId: string | null;
  history: CanvasComponent[][];
  historyIndex: number;

  addComponent: (type: string, parentId?: string | null, index?: number) => string;
  removeComponent: (id: string) => void;
  moveComponent: (fromIndex: number, toIndex: number) => void;
  moveComponentInTree: (compId: string, newParentId: string | null, index?: number) => void;
  duplicateComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  updateComponentProps: (id: string, props: Partial<Record<string, string | boolean | number>>) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  getSelectedComponent: () => CanvasComponent | undefined;
  getContainerIds: () => string[];
  findComponent: (id: string) => CanvasComponent | null;
  getParentInfo: (id: string) => ParentInfo | null;
}

export const useEditorStore = create<EditorState>((set, get) => {
  const pushHistory = () => {
    const { components, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(deepClone(components));
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  };

  return {
    components: [],
    selectedId: null,
    history: [[]],
    historyIndex: 0,

    addComponent: (type, parentId = null, index) => {
      pushHistory();
      const comp = newComponent(type);
      const { components } = get();
      const updated = insertChild(components, parentId, comp, index);
      set({ components: updated, selectedId: comp.id });
      return comp.id;
    },

    removeComponent: (id) => {
      // Don't allow removing auto-managed components
      const comp = findById(get().components, id);
      if (comp && isAutoManaged(comp.type)) return;

      pushHistory();
      const { components, selectedId } = get();
      set({
        components: removeById(components, id),
        selectedId: selectedId === id ? null : selectedId,
      });
    },

    moveComponent: (fromIndex, toIndex) => {
      pushHistory();
      const { components } = get();
      const updated = [...components];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      set({ components: updated });
    },

    moveComponentInTree: (compId, newParentId, index) => {
      // Don't allow moving auto-managed components
      const comp = findById(get().components, compId);
      if (comp && isAutoManaged(comp.type)) return;

      pushHistory();
      const { components } = get();
      const flatList = removeById(components, compId);
      const removed = findById(components, compId);
      if (!removed) return;
      const updated = insertChild(flatList, newParentId, removed, index);
      set({ components: updated });
    },

    duplicateComponent: (id) => {
      const comp = findById(get().components, id);
      if (comp && isAutoManaged(comp.type)) return;

      pushHistory();
      const { components } = get();
      const deepCopy = deepClone(components);
      const result = findParentList(deepCopy, id);
      if (!result) return;
      const { parentList, index } = result;
      const dup = duplicateWithNewIds(parentList[index]);
      parentList.splice(index + 1, 0, dup);
      set({ components: deepCopy, selectedId: dup.id });
    },

    selectComponent: (id) => {
      set({ selectedId: id });
    },

    updateComponentProps: (id, props) => {
      pushHistory();
      const { components } = get();
      let updated = updatePropsById(components, id, props);

      // If updating a row's columns count, sync children
      if (props.cols !== undefined) {
        updated = syncRowChildrenById(updated, id);
      }

      set({ components: updated });
    },

    clearCanvas: () => {
      pushHistory();
      set({ components: [], selectedId: null });
    },

    undo: () => {
      const { historyIndex, history } = get();
      if (historyIndex > 0) {
        set({
          historyIndex: historyIndex - 1,
          components: deepClone(history[historyIndex - 1]),
        });
      }
    },

    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex < history.length - 1) {
        set({
          historyIndex: historyIndex + 1,
          components: deepClone(history[historyIndex + 1]),
        });
      }
    },

    pushHistory,

    getSelectedComponent: () => {
      const { components, selectedId } = get();
      if (!selectedId) return undefined;
      return findById(components, selectedId) || undefined;
    },

    getContainerIds: () => {
      const { components } = get();
      return collectContainerIds(components);
    },

    findComponent: (id) => {
      const { components } = get();
      return findById(components, id);
    },

    getParentInfo: (id) => {
      const { components } = get();
      return findParentInfo(components, id);
    },
  };
});
