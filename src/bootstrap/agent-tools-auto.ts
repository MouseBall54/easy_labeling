/**
 * Agent tools for template matching presets and YOLO inference (stage 4 of docs/AGENT_MCP_PLAN_KO.md, section 4.4).
 * They run what the Automation and Inference panels run (AutomationAgentApi, InferenceAgentApi).
 */
import type { AppState } from "../app/state.js";
import { AgentToolError, listPage, optionalArg, type AgentTool } from "../features/agent/agent-api.js";
import { getRectBounds } from "../features/canvas/arrange.js";
import { ensureAnnotationId, isRectObject } from "../features/canvas/fabric-types.js";
import { checkBox, checkClassId, type PixelBox } from "./agent-tools-edit.js";
import type { AutomationAgentApi } from "./automation-controller.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { InferenceAgentApi } from "./inference-controller.js";

export interface AgentAutoToolDeps {
  state: AppState;
  canvasController: RuntimeCanvasController;
  automation(): AutomationAgentApi | null;
  inference(): InferenceAgentApi | null;
  /** The file a load_model entry names (Rust checked it is an existing .onnx file). */
  file(entry: { path: string; name: string; directory: boolean }): { getFile(): Promise<File> };
  /** The person's answer in a native dialog. */
  confirm(message: string): Promise<boolean>;
  afterEdit(): void;
}

/** Template sides find_similar accepts: below this OpenCV finds noise, above it a match is the whole image. */
const SIMILAR_SIDE = { min: 4, max: 1024 };
const LISTED_CANDIDATES = 100;

/** Panel errors as agent errors: a missing preset is not_found, a busy panel busy, the rest failed. */
async function panelErrors<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof AgentToolError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    if (/^No (automation preset|layout) named|^No box with/.test(message)) throw new AgentToolError("not_found", message);
    if (/already exists$|^Select at least one box|has no boxes to save$/.test(message)) throw new AgentToolError("invalid_args", message);
    if (/is busy\.$/.test(message)) throw new AgentToolError("busy", message);
    throw new AgentToolError("failed", message);
  }
}

function unitArg(args: Record<string, unknown>, name: string): number | undefined {
  const value = optionalArg(args, name, "number");
  if (value !== undefined && (value < 0 || value > 1)) throw new AgentToolError("invalid_args", `${name} must be between 0 and 1.`);
  return value;
}

export function createAgentAutoTools(deps: AgentAutoToolDeps): Record<string, AgentTool> {
  const { state } = deps;
  const requireDetectionImage = (): void => {
    if (state.session.workflow !== "detection") throw new AgentToolError("failed", "The app is in Segmentation; switch it to Detection.");
    if (!state.session.imageFolderHandle) throw new AgentToolError("no_folder", "No folder is open. Use open_folder first.");
    if (!state.session.currentImageFile) throw new AgentToolError("no_image", "No image is shown. Use go_to_image first.");
  };
  const automation = (): AutomationAgentApi => {
    const api = deps.automation();
    if (!api) throw new AgentToolError("failed", "Template automation is not available in this window.");
    return api;
  };
  const inference = (): InferenceAgentApi => {
    const api = deps.inference();
    if (!api) throw new AgentToolError("failed", "Inference is not available in this window.");
    return api;
  };

  const imageSize = (): { width: number; height: number } => {
    requireDetectionImage();
    const image = state.session.currentImage;
    if (!image) throw new AgentToolError("no_image", "No image is shown. Use go_to_image first.");
    return { width: image.width, height: image.height };
  };
  const boxById = (id: string): { classId: string; box: PixelBox } => {
    const rect = deps.canvasController.raw.getObjects("rect").filter(isRectObject).find((candidate) => ensureAnnotationId(candidate) === id);
    if (!rect) throw new AgentToolError("not_found", `No box with annotationId ${id} on the current image.`);
    rect.setCoords();
    const bounds = getRectBounds(rect);
    return { classId: String(rect.labelClass ?? "0"), box: { x0: bounds.left, y0: bounds.top, x1: bounds.right, y1: bounds.bottom } };
  };

  return {
    find_similar: {
      changesApp: true,
      async run(args) {
        const size = imageSize();
        const id = optionalArg(args, "annotationId", "string");
        const region = optionalArg(args, "region", "object") as PixelBox | undefined;
        if ((id === undefined) === (region === undefined)) throw new AgentToolError("invalid_args", "Give annotationId or region (one of them).");
        const source = id !== undefined ? boxById(id) : { classId: undefined, box: checkBox(region!, size, "region") };
        const roi = {
          x: Math.round(source.box.x0), y: Math.round(source.box.y0),
          width: Math.round(source.box.x1 - source.box.x0), height: Math.round(source.box.y1 - source.box.y0)
        };
        if (Math.min(roi.width, roi.height) < SIMILAR_SIDE.min || Math.max(roi.width, roi.height) > SIMILAR_SIDE.max) {
          throw new AgentToolError("invalid_args", `The template must be ${SIMILAR_SIDE.min} to ${SIMILAR_SIDE.max} px on each side.`);
        }
        const classArg = args.classId ?? source.classId;
        if (classArg === undefined || classArg === null) throw new AgentToolError("invalid_args", "classId is required with region.");
        const minimumScore = unitArg(args, "minScore") ?? 0.8;
        const maximumDetections = Math.min(5000, Math.max(1, Math.floor(optionalArg(args, "maxMatches", "number") ?? 300)));
        const apply = optionalArg(args, "apply", "boolean") ?? false;
        const api = automation();
        const outcome = await panelErrors(() => api.findSimilar({
          roi, classId: checkClassId(classArg, "find_similar"), minimumScore, maximumDetections,
          skipOverlapping: optionalArg(args, "skipOverlapping", "boolean") ?? true, apply
        }));
        if (outcome.applied) deps.afterEdit();
        const page = listPage(outcome.candidates, args, LISTED_CANDIDATES);
        return { ...outcome, template: roi, found: page.total, candidates: page.items, offset: page.offset, truncated: page.truncated };
      }
    },
    apply_layout: {
      changesApp: true,
      async run(args) {
        imageSize();
        const name = optionalArg(args, "layout", "string");
        if (!name) throw new AgentToolError("invalid_args", "layout is required (see list_templates).");
        const x = optionalArg(args, "x", "number");
        const y = optionalArg(args, "y", "number");
        if ((x === undefined) !== (y === undefined)) throw new AgentToolError("invalid_args", "Give both x and y, or neither.");
        const api = automation();
        const result = await panelErrors(async () => api.applyLayout(name, {
          anchor: x === undefined ? undefined : { x, y: y! },
          replaceExisting: optionalArg(args, "replaceExisting", "boolean") ?? false
        }));
        deps.afterEdit();
        const page = listPage(result.annotationIds, args, 500);
        return { ...result, applied: page.total, annotationIds: page.items, truncated: page.truncated };
      }
    },
    save_layout: {
      changesApp: true,
      async run(args) {
        imageSize();
        const name = optionalArg(args, "name", "string");
        if (!name?.trim()) throw new AgentToolError("invalid_args", "name is required.");
        const scope = optionalArg(args, "scope", "string") ?? "selected";
        if (scope !== "selected" && scope !== "all") throw new AgentToolError("invalid_args", "scope must be selected or all.");
        const boxes = Array.isArray(args.annotationIds) ? args.annotationIds.map(String) : scope;
        const api = automation();
        return panelErrors(() => api.saveLayout(name, { boxes, overwrite: optionalArg(args, "overwrite", "boolean") ?? false }));
      }
    },
    list_templates: {
      changesApp: false,
      run: async () => automation().library()
    },
    run_template_matching: {
      changesApp: true,
      async run(args) {
        requireDetectionImage();
        const preset = optionalArg(args, "preset", "string");
        if (!preset) throw new AgentToolError("invalid_args", "preset is required (see list_templates).");
        const apply = optionalArg(args, "apply", "boolean") ?? false;
        const api = automation();
        const outcome = await panelErrors(() => api.runPreset(preset, { apply }));
        if (outcome.applied) deps.afterEdit();
        return outcome;
      }
    },
    inference_status: {
      changesApp: false,
      run: async () => inference().status()
    },
    load_model: {
      changesApp: true,
      async run(args) {
        const entry = args.entry as { path: string; name: string; directory: boolean } | undefined;
        if (!entry?.path) throw new AgentToolError("invalid_args", "path is required");
        const api = inference();
        const file = await deps.file(entry).getFile();
        return panelErrors(() => api.loadModel(file));
      }
    },
    run_inference: {
      changesApp: true,
      async run(args) {
        requireDetectionImage();
        const api = inference();
        const allImages = optionalArg(args, "allImages", "boolean") ?? false;
        const confidence = unitArg(args, "confidence");
        const iou = unitArg(args, "iou");
        const maxDetections = optionalArg(args, "maxDetections", "number");
        const model = api.status().model;
        if (!model) throw new AgentToolError("failed", "Load an ONNX model first (load_model).");
        if (allImages) {
          const count = state.session.imageFiles.length;
          const allowed = await deps.confirm(`Run ${model} on all ${count} images? Results go into the model's own label folder (inference-…), which becomes the active label set; the current labels stay as they are.`);
          if (!allowed) throw new AgentToolError("declined", "The person declined the inference run.");
        }
        const result = await panelErrors(() => api.run({ allImages, confidence, iou, maxDetections }));
        deps.afterEdit();
        return result;
      }
    }
  };
}
