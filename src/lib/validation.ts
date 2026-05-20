import { z } from "zod";

/**
 * Zod schemas per validare dati persistenti in localStorage
 * Previene type confusion e data corruption da migrazione
 */

// Schema per CanvasComponent
export const CanvasComponentSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    props: z.record(z.any()).optional(),
    children: z.array(CanvasComponentSchema).optional().default([]),
    slots: z.record(z.array(CanvasComponentSchema)).optional(),
  })
);

// Schema per SavedProject
export const SavedProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  components: z.array(CanvasComponentSchema).default([]),
  customCSS: z.string().default(""),
  bootstrapTheme: z.record(z.string()).optional(),
  hiddenComponents: z.array(z.string()).optional().default([]),
  selectedId: z.string().optional().nullable(),
  timestamp: z.number().optional(),
});

// Schema per PersistedState da localStorage
export const PersistedStateSchema = z.object({
  _schemaVersion: z.number().optional().default(3),
  projects: z.array(SavedProjectSchema).optional().default([]),
  currentProjectId: z.string().optional().nullable(),
  customCSS: z.string().optional().default(""),
  bootstrapTheme: z.record(z.string()).optional(),
  hiddenComponents: z.array(z.string()).optional().default([]),
  selectedId: z.string().optional().nullable(),
});

export type PersistedState = z.infer<typeof PersistedStateSchema>;
export type SavedProject = z.infer<typeof SavedProjectSchema>;
export type CanvasComponent = z.infer<typeof CanvasComponentSchema>;

/**
 * Valida e ripara dati non validi da localStorage
 */
export function validatePersistedState(data: unknown): PersistedState {
  try {
    return PersistedStateSchema.parse(data);
  } catch (error) {
    console.warn("Invalid persisted state, using defaults:", error);
    return PersistedStateSchema.parse({});
  }
}

export function validateSavedProject(data: unknown): SavedProject {
  try {
    return SavedProjectSchema.parse(data);
  } catch (error) {
    console.warn("Invalid saved project, using defaults:", error);
    return SavedProjectSchema.parse({
      id: "invalid",
      name: "Invalid Project",
    });
  }
}
