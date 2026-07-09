/**
 * Project file save / load utilities.
 *
 * Uses the native File System Access API (`showSaveFilePicker` /
 * `showOpenFilePicker`) when available so the user can choose the path
 * where the .json file is saved/loaded via the OS file dialog.
 *
 * Two save modes (like classic text editors):
 *  - saveProject()      → "Salva": overwrite the current file, or fall
 *                          back to Save As if no file is open yet.
 *  - saveProjectAs()    → "Salva con nome": always show the picker.
 *
 * The handle of the currently open file is kept in a module-level
 * variable (it cannot be serialised). The file *name* is also tracked
 * so the UI can display it; callers mirror it into the store for
 * reactivity.
 *
 * Falls back to a classic `<a download>` (save) / `<input type=file>`
 * (load) flow for browsers without the File System Access API.
 */
import { useEditorStore } from "@/store/editor-store";

export interface ProjectFile {
  version: number;
  savedAt: string;
  components: unknown;
  bootstrapTheme?: unknown;
  pages?: unknown;
  activePageId?: string;
  customCSS?: unknown;
  projectName?: string;
}

// ── Module-level state: the handle of the file currently being edited ──
// FileSystemFileHandle objects are not serialisable, so they live only
// for the duration of the page session. On reload the user must re-open
// or Save As.
let currentHandle: FileSystemFileHandle | null = null;

/** Returns whether a file is currently open (i.e. "Salva" can overwrite). */
export function hasCurrentFile(): boolean {
  return currentHandle !== null;
}

/** Returns the name of the currently open file, or null. */
export function getCurrentFileName(): string | null {
  return currentHandle?.name ?? null;
}

/** Build the serialisable project payload from the current store state. */
export function buildProjectPayload(): ProjectFile {
  useEditorStore.getState()._syncCurrentPage();
  const { components, bootstrapTheme, pages, activePageId, customCSS, projectName } =
    useEditorStore.getState();
  return {
    version: 2,
    savedAt: new Date().toISOString(),
    components,
    bootstrapTheme,
    pages,
    activePageId,
    customCSS,
    projectName,
  };
}

/** Strip the ".json" extension from a file name for display. */
export function displayNameForFile(fileName: string): string {
  return fileName.replace(/\.json$/i, "");
}

/** Whether the current browser supports the File System Access API. */
export function supportsFileSystemAccess(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as unknown as { showSaveFilePicker?: unknown })
      .showSaveFilePicker === "function" &&
    typeof (window as unknown as { showOpenFilePicker?: unknown })
      .showOpenFilePicker === "function"
  );
}

const JSON_FILE_TYPES = [
  {
    description: "Progetto Bootstrap Editor",
    accept: { "application/json": [".json"] },
  },
];

/**
 * "Salva": overwrite the current file. If no file is open yet (or the
 * browser doesn't support the File System Access API), behave like
 * Save As. Returns the file name on success, or null if cancelled.
 */
export async function saveProject(): Promise<string | null> {
  // If we have a handle, try to overwrite it directly (no dialog).
  if (currentHandle) {
    try {
      const json = JSON.stringify(buildProjectPayload(), null, 2);
      const writable = await currentHandle.createWritable();
      await writable.write(json);
      await writable.close();
      return currentHandle.name;
    } catch {
      // Permission may have been revoked; fall through to Save As.
      currentHandle = null;
    }
  }
  return saveProjectAs();
}

/**
 * "Salva con nome": always show the OS "Save As" dialog and write the
 * project JSON to the chosen path. Stores the new handle so subsequent
 * "Salva" calls overwrite it. Returns the file name, or null if cancelled.
 */
export async function saveProjectAs(): Promise<string | null> {
  const payload = buildProjectPayload();
  const json = JSON.stringify(payload, null, 2);

  // Default suggested name: current file name, else "progetto"
  const suggestedName = currentHandle?.name
    ? currentHandle.name
    : "progetto.json";

  if (supportsFileSystemAccess()) {
    const handle = await (
      window as unknown as {
        showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle>;
      }
    ).showSaveFilePicker({
      suggestedName,
      types: JSON_FILE_TYPES,
    });
    const writable = await handle.createWritable();
    await writable.write(json);
    await writable.close();
    currentHandle = handle;
    return handle.name;
  }

  // Fallback: download via <a> (no handle to retain)
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = suggestedName;
  a.click();
  URL.revokeObjectURL(url);
  return suggestedName;
}

/**
 * Apply a parsed project object to the editor store. Shared by both the
 * native file picker and the fallback input flows.
 *
 * Throws an Error with a human-readable Italian message on failure.
 */
export function applyProjectData(parsed: unknown): void {
  if (parsed === null || typeof parsed !== "object") {
    throw new Error("Il file non contiene un progetto valido");
  }

  const obj = parsed as Record<string, unknown>;

  // Legacy: raw array of components
  if (Array.isArray(parsed)) {
    useEditorStore.getState().importProject(parsed);
    return;
  }

  if (!obj.components || !Array.isArray(obj.components)) {
    throw new Error("Il file JSON non contiene componenti validi");
  }

  const isValid = (obj.components as Record<string, unknown>[]).every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof item.id === "string" &&
      typeof item.type === "string" &&
      typeof item.props === "object"
  );
  if (!isValid) {
    throw new Error("I componenti nel file JSON sono corrotti");
  }

  const stateUpdate: Record<string, unknown> = {
    components: obj.components,
    selectedId: null,
  };

  if (obj.bootstrapTheme) stateUpdate.bootstrapTheme = obj.bootstrapTheme;
  if (obj.customCSS !== undefined) stateUpdate.customCSS = obj.customCSS;
  if (typeof obj.projectName === "string" && obj.projectName.trim()) {
    stateUpdate.projectName = obj.projectName;
  }

  if (obj.pages && obj.activePageId) {
    stateUpdate.pages = obj.pages;
    stateUpdate.activePageId = obj.activePageId;
    const activePage = (obj.pages as { id: string }[]).find(
      (p) => p.id === obj.activePageId
    );
    if (activePage) {
      const ap = activePage as {
        components: unknown;
        history: unknown;
        historyIndex: number;
      };
      stateUpdate.components = ap.components;
      stateUpdate.history = ap.history || [[]];
      stateUpdate.historyIndex = ap.historyIndex ?? 0;
    } else {
      stateUpdate.history = [[]];
      stateUpdate.historyIndex = 0;
    }
  } else {
    const importedComps = obj.components;
    const singlePage = {
      id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: "Home",
      components: importedComps,
      history: [[]],
      historyIndex: 0,
    };
    stateUpdate.pages = [singlePage];
    stateUpdate.activePageId = singlePage.id;
  }

  useEditorStore.setState(stateUpdate);
  useEditorStore.getState().pushHistory();
}

/**
 * "Carica": open the OS "Open" dialog, read the chosen .json file,
 * load it into the editor and remember its handle (so "Salva" can
 * overwrite it later). Returns the file name, or null if cancelled.
 *
 * Throws an Error with an Italian message on failure.
 */
export async function loadProject(): Promise<string | null> {
  if (!supportsFileSystemAccess()) {
    // Caller must use the fallback <input type=file> path.
    throw new Error("FALLBACK_INPUT_REQUIRED");
  }

  const [handle] = await (
    window as unknown as {
      showOpenFilePicker: (opts: unknown) => Promise<FileSystemFileHandle[]>;
    }
  ).showOpenFilePicker({
    types: JSON_FILE_TYPES,
    multiple: false,
    excludeAcceptAllOption: true,
  });

  const file = await handle.getFile();
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Il file non è un JSON valido");
  }
  applyProjectData(parsed);

  // Remember the handle so "Salva" can overwrite this file.
  currentHandle = handle;
  return file.name;
}

/**
 * Fallback loader for browsers without the File System Access API.
 * Reads the file from a hidden `<input type=file>` change event.
 * Returns the file name. Throws on parse error.
 */
export function loadProjectFromFile(file: File): string {
  // Synchronous return of the name; parsing happens via FileReader.
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const parsed = JSON.parse(ev.target?.result as string);
      applyProjectData(parsed);
    } catch {
      // The caller shows a toast on failure; swallow here to avoid
      // unhandled rejection inside the FileReader callback.
    }
  };
  reader.readAsText(file);
  return file.name;
}

/** Reset the current file handle (e.g. on "Nuova pagina" / clear). */
export function clearCurrentFile(): void {
  currentHandle = null;
}
