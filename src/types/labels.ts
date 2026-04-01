export type AppMode = "draw" | "edit";

export type WorkflowType = "detection" | "segmentation";

export type LabelSortOrder = "asc" | "desc";

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface ClassRow {
  id: string;
  name: string;
}
