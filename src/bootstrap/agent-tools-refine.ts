/**
 * Agent tools for Refine, Reclass, Review and folder-wide label changes (stage 3 of docs/AGENT_MCP_PLAN_KO.md,
 * section 4.3). They call the pane's own actions (RefineAgentApi) and the file system's folder operations; a
 * folder-wide change runs only after the person allows it in a native dialog (`confirm`).
 */
import type { AppState } from "../app/state.js";
import type { ClassRemapRule } from "../domain/class-remap.js";
import { AgentToolError, listPage, optionalArg, type AgentTool, type AgentToolContext } from "../features/agent/agent-api.js";
import { evenSample } from "../domain/refine/folder-summary.js";
import { checkClassId } from "./agent-tools-edit.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";
import type { RefineAgentApi, RefineRunOutcome, RefineScope } from "./refine-controller.js";

export interface AgentRefineToolDeps {
  state: AppState;
  fileSystem: RuntimeFileSystem;
  documentRef: Document;
  refine(): RefineAgentApi | null;
  /** The person's answer in a native dialog. */
  confirm(message: string): Promise<boolean>;
  afterEdit(): void;
}

const LISTED_IMAGES = 200;
/** Changed boxes listed per run_refine / run_reclass / review_queue result unless `limit` says otherwise. */
const LISTED_BOXES = 100;

/**
 * Keeps a run's box list to one page: Refine lists flagged boxes first (the ones to look at), Reclass adds counts
 * per class change. The counts always cover every box.
 */
export function pagedOutcome(outcome: RefineRunOutcome, args: Record<string, unknown>): RefineRunOutcome {
  const key = Array.isArray(outcome.changes) ? "changes" : Array.isArray(outcome.changed) ? "changed" : null;
  if (!key) return outcome;
  let rows = outcome[key] as Array<Record<string, unknown>>;
  const extra: Record<string, unknown> = {};
  if (key === "changes") rows = [...rows.filter((row) => row.flagged), ...rows.filter((row) => !row.flagged)];
  else {
    const byChange: Record<string, number> = {};
    for (const row of rows) byChange[`${row.from}->${row.to}`] = (byChange[`${row.from}->${row.to}`] ?? 0) + 1;
    extra.changesByClass = byChange;
  }
  const page = listPage(rows, args, LISTED_BOXES);
  return { ...outcome, ...extra, [key]: page.items, listed: { total: page.total, offset: page.offset, truncated: page.truncated } };
}

/** `preset` argument: omitted/null = the pane's choice, "" = class settings / Lab rule, else a preset name. */
function presetArg(args: Record<string, unknown>): string | null | undefined {
  const preset = optionalArg(args, "preset", "string");
  return preset === undefined ? undefined : preset === "" ? null : preset;
}

function modeArg(args: Record<string, unknown>): "edge" | "reclass" | undefined {
  const mode = optionalArg(args, "mode", "string");
  if (mode !== undefined && mode !== "edge" && mode !== "reclass") throw new AgentToolError("invalid_args", "mode must be edge or reclass");
  return mode;
}

export function scopeArg(args: Record<string, unknown>): RefineScope {
  if (Array.isArray(args.annotationIds)) return { annotationIds: args.annotationIds.map(String) };
  if (args.classId !== undefined && args.classId !== null) return { classId: checkClassId(args.classId, "scope") };
  const scope = optionalArg(args, "scope", "string") ?? "all";
  if (scope !== "all" && scope !== "selected") throw new AgentToolError("invalid_args", "Give annotationIds, classId, or scope \"all\" / \"selected\".");
  return scope;
}

/** An outcome the pane reported as not done becomes the matching agent error. */
function settled(outcome: RefineRunOutcome): RefineRunOutcome {
  if (outcome.ok) return outcome;
  throw new AgentToolError(outcome.code ?? "failed", outcome.message);
}

/** A preset name or box id the pane does not know is not_found. */
async function presetErrors<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof Error && /^No (edge|reclass) preset named|^No box with annotationId/.test(error.message)) throw new AgentToolError("not_found", error.message);
    throw error;
  }
}

export function createAgentRefineTools(deps: AgentRefineToolDeps): Record<string, AgentTool> {
  const { state } = deps;
  const refine = (): RefineAgentApi => {
    if (state.session.workflow !== "detection") throw new AgentToolError("failed", "The app is in Segmentation; switch it to Detection for Refine.");
    const api = deps.refine();
    if (!api) throw new AgentToolError("failed", "Refine is not available in this window.");
    return api;
  };
  const requireImage = (): void => {
    if (!state.session.currentImageFile) throw new AgentToolError("no_image", "No image is shown. Use go_to_image first.");
  };
  const requireFolder = (): void => {
    if (!state.session.imageFiles.length) throw new AgentToolError("no_folder", "No folder is open. Use open_folder first.");
  };
  /** The person's Stop button on the running operation, pressed when the agent cancels. */
  const stopOnCancel = ({ signal }: AgentToolContext): void => {
    signal.addEventListener("abort", () => (deps.documentRef.getElementById("cancelActiveOperationBtn") as HTMLButtonElement | null)?.click(), { once: true });
  };
  const edited = (outcome: RefineRunOutcome): RefineRunOutcome => {
    deps.afterEdit();
    return outcome;
  };

  /** Which images a folder dry run covers: `images` by name, or an even `sample`; every image when neither is given. */
  const imagesArg = (args: Record<string, unknown>): number[] | undefined => {
    const files = state.session.imageFiles;
    if (Array.isArray(args.images)) {
      const names = args.images.map(String);
      const missing = names.filter((name) => !files.some((file) => file.name === name));
      if (missing.length) throw new AgentToolError("not_found", `No image named ${missing.slice(0, 5).join(", ")} in the open folder.`);
      return names.map((name) => files.findIndex((file) => file.name === name));
    }
    const sample = optionalArg(args, "sample", "number");
    if (sample === undefined) return undefined;
    if (!Number.isInteger(sample) || sample < 1) throw new AgentToolError("invalid_args", "sample must be a whole number of images, 1 or more.");
    return evenSample(files.length, sample);
  };
  const folderRun = (mode: "edge" | "reclass"): AgentTool => ({
    changesApp: true,
    async run(args, context) {
      requireFolder();
      const api = refine();
      stopOnCancel(context);
      const resultId = optionalArg(args, "resultId", "string");
      if (resultId !== undefined) {
        if (!resultId.startsWith(`${mode}-`)) throw new AgentToolError("invalid_args", `resultId ${resultId} is not a ${mode === "edge" ? "refine" : "reclass"}_folder dry run.`);
        return edited(settled(await api.applyFolderPlan(resultId, { confirm: deps.confirm })));
      }
      const dryRun = optionalArg(args, "dryRun", "boolean") ?? true;
      const only = imagesArg(args);
      if (!dryRun && only) throw new AgentToolError("invalid_args", "images and sample are for dry runs; apply one with its resultId.");
      const outliers = Math.min(100, Math.max(0, Math.floor(optionalArg(args, "outliers", "number") ?? 20)));
      const outcome = settled(await presetErrors(() => api.runFolder(mode, { preset: presetArg(args), confirm: deps.confirm, dryRun, only, outliers })));
      return dryRun ? outcome : edited(outcome);
    }
  });

  return {
    get_refine_settings: {
      changesApp: false,
      run: () => refine().settingsSummary()
    },
    run_refine: {
      changesApp: true,
      async run(args) {
        requireImage();
        const api = refine();
        const keep = optionalArg(args, "keepHandEdited", "boolean");
        const dryRun = optionalArg(args, "dryRun", "boolean") ?? false;
        const outcome = settled(await presetErrors(() => api.refine(scopeArg(args), { preset: presetArg(args), keepHandEdited: keep, dryRun })));
        return pagedOutcome(dryRun ? outcome : edited(outcome), args);
      }
    },
    run_reclass: {
      changesApp: true,
      async run(args) {
        requireImage();
        const api = refine();
        const keep = optionalArg(args, "keepHandEdited", "boolean");
        const dryRun = optionalArg(args, "dryRun", "boolean") ?? false;
        const outcome = settled(await presetErrors(() => api.reclass(scopeArg(args), { preset: presetArg(args), keepHandEdited: keep, dryRun })));
        return pagedOutcome(dryRun ? outcome : edited(outcome), args);
      }
    },
    review_queue: {
      changesApp: false,
      async run(args) {
        requireImage();
        const queue = refine().reviewQueue(modeArg(args));
        const page = listPage(queue.boxes, args, LISTED_BOXES);
        return { mode: queue.mode, total: page.total, offset: page.offset, truncated: page.truncated, boxes: page.items };
      }
    },
    approve: {
      changesApp: true,
      async run(args) {
        requireImage();
        const all = optionalArg(args, "all", "boolean") ?? false;
        if (!all && !Array.isArray(args.annotationIds)) throw new AgentToolError("invalid_args", "Give annotationIds or all: true.");
        return refine().approve(all ? "all" : (args.annotationIds as unknown[]).map(String), modeArg(args));
      }
    },
    review_folder: {
      changesApp: true,
      async run() {
        requireFolder();
        await deps.fileSystem.refreshReviewFindings({ all: true });
        const findings = [...state.session.reviewFindings].filter(([, finding]) => finding.issues.length > 0);
        const issuesByType: Record<string, number> = {};
        for (const [, finding] of findings) for (const issue of finding.issues) issuesByType[issue.type] = (issuesByType[issue.type] ?? 0) + 1;
        return {
          imagesChecked: state.session.imageFiles.length,
          imagesWithIssues: findings.length,
          issuesByType,
          images: findings.slice(0, LISTED_IMAGES).map(([name, finding]) => ({
            name,
            issues: finding.issues.map((issue) => ({ type: issue.type, severity: issue.severity, message: issue.message, boxIndexes: issue.rectIndexes }))
          })),
          truncated: findings.length > LISTED_IMAGES
        };
      }
    },
    set_review_status: {
      changesApp: true,
      async run(args) {
        requireFolder();
        const status = optionalArg(args, "status", "string");
        if (status !== "reviewed" && status !== "needs-review") throw new AgentToolError("invalid_args", "status must be reviewed or needs-review");
        const names = Array.isArray(args.images) ? args.images.map(String) : [state.session.currentImageFile?.name].filter((name): name is string => !!name);
        if (!names.length) throw new AgentToolError("no_image", "No image is shown; give images.");
        const missing = names.filter((name) => !state.session.imageFiles.some((file) => file.name === name));
        if (missing.length) throw new AgentToolError("not_found", `No image named ${missing.slice(0, 5).join(", ")} in the open folder.`);
        // The Reviewed / Needs review buttons' function, one review-state.json write per image.
        for (const name of names) await deps.fileSystem.setReviewImageStatus(name, status);
        const images = state.session.reviewState.images;
        return { status, images: names, reviewedInFolder: state.session.imageFiles.filter((file) => images[file.name]?.status === "reviewed").length, imageCount: state.session.imageFiles.length };
      }
    },
    refine_folder: folderRun("edge"),
    reclass_folder: folderRun("reclass"),
    remap_classes: {
      changesApp: true,
      async run(args, context) {
        requireFolder();
        const folder = state.session.labelFolderHandle;
        if (!folder) throw new AgentToolError("no_folder", "The open folder has no label folder.");
        const rule = remapRule(args);
        const dryRun = optionalArg(args, "dryRun", "boolean") ?? true;
        const plan = await deps.fileSystem.previewClassRemap(folder as unknown as FileSystemDirectoryHandle, rule, context.signal);
        if (!plan || context.signal.aborted) throw new AgentToolError("cancelled", "Cancelled.");
        const summary = { changedBoxes: plan.changedCount, changes: plan.changes, imagesChanged: plan.edits.length, imagesChecked: plan.fileNames.length };
        if (dryRun || !plan.changedCount) return { ...summary, applied: false };
        const allowed = await deps.confirm(`Change ${plan.changedCount.toLocaleString()} box class IDs in ${plan.edits.length} images of "${plan.folder.name}"?\n\nOriginal TXT files will be backed up. Current edits will be saved.`);
        if (!allowed) throw new AgentToolError("declined", "The person declined the class remap.");
        const backup = await deps.fileSystem.applyClassRemap(plan, context.signal);
        if (!backup) throw new AgentToolError("cancelled", "Stopped; no files changed.");
        deps.afterEdit();
        return { ...summary, applied: true, backupFolder: `${plan.folder.name}/${backup}` };
      }
    }
  };
}

export function remapRule(args: Record<string, unknown>): ClassRemapRule {
  const offset = optionalArg(args, "offset", "number");
  if (Array.isArray(args.mapping)) {
    if (offset !== undefined) throw new AgentToolError("invalid_args", "Give mapping or offset, not both.");
    const mapping = args.mapping.map((row, index) => {
      const entry = (row ?? {}) as Record<string, unknown>;
      return { from: checkClassId(entry.from, `mapping[${index}].from`), to: checkClassId(entry.to, `mapping[${index}].to`) };
    });
    if (!mapping.length) throw new AgentToolError("invalid_args", "mapping needs at least one row.");
    if (new Set(mapping.map((row) => row.from)).size !== mapping.length) throw new AgentToolError("invalid_args", "A class appears twice in mapping.from.");
    return { mode: "mapping", mapping };
  }
  if (offset === undefined || !Number.isSafeInteger(offset)) throw new AgentToolError("invalid_args", "Give mapping [{from, to}] or a whole-number offset.");
  return { mode: "offset", offset };
}
