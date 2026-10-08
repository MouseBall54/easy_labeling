import type { AppState } from "../app/state.js";
import { REFINE_SIDES, type RefineBoxInput, type RefineParams, type RefineRect, type RefineResult } from "../domain/refine/edge-refine.js";
import {
  createRefineSettings,
  parseRefineSettings,
  resolveRefineParams,
  serializeRefineSettings,
  REFINE_SETTINGS_FILE,
  type RefineSettingsDocument
} from "../domain/refine/settings.js";
import { extractVisibleRectSelection, getRectBounds } from "../features/canvas/arrange.js";
import { getColorForClass } from "../features/canvas/colors.js";
import { ensureAnnotationId, isRectObject, type FabricRectLike } from "../features/canvas/fabric-types.js";
import { createRefineService, type RefineService } from "../features/refine/refine-service.js";
import { getSubdirectoryHandle, isNotFoundError, readTextFileByName, writeTextFileByName } from "../platform/file-system-access.js";
import type { DirectoryHandleLike } from "../types/files.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import { createRefineEditor, type RefineEditor } from "./refine-editor.js";
import type { RefineLab, RefineLabCaseSource } from "./refine-lab.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";

export type RefineShortcut = "toggle" | "refineSelected" | "refineAll" | "nextReview" | "previousReview" | "approve";

/**
 * Global refine keys (detection workflow, any inspector tab). Physical key codes so they also work with the
 * Korean IME active. Kept clear of: A/D (images), Q, B, 0-9, Ctrl+*, Alt+Shift+L/R/T/D/H/V (arrange), Shift+1-3.
 */
export function resolveRefineShortcut(event: Pick<KeyboardEvent, "code" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey">): RefineShortcut | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  switch (event.code) {
    case "KeyR": return event.shiftKey ? null : "toggle";
    case "KeyE": return event.shiftKey ? "refineAll" : "refineSelected";
    case "KeyN": return event.shiftKey ? "previousReview" : "nextReview";
    case "KeyF": return event.shiftKey ? null : "approve";
    default: return null;
  }
}

export interface RefineController {
  bind(): void;
  runShortcut(action: RefineShortcut): void;
}

const PREVIEW_LIMIT = 50;
const WARN_COLOR = "#f0ad4e";
const SIDE_KEY = { L: "x0", R: "x1", T: "y0", B: "y1" } as const;

interface RefineRecord { result: RefineResult; reviewed: boolean }

export function createRefineController(input: {
  state: AppState;
  canvasController: RuntimeCanvasController;
  uiManager: RuntimeUiManager;
  documentRef: Document;
}): RefineController {
  const doc = input.documentRef;
  const windowRef = doc.defaultView!;
  const byId = <T extends HTMLElement>(id: string): T => {
    const element = doc.getElementById(id);
    if (!element) throw new Error(`Missing refine element #${id}`);
    return element as T;
  };
  const raw = input.canvasController.raw;
  const pane = byId<HTMLElement>("inspectorRefinePane");
  const overlay = byId<HTMLCanvasElement>("refineOverlayCanvas");
  const status = byId<HTMLElement>("refineStatus");
  const reviewCounter = byId<HTMLElement>("refineReviewCounter");

  let service: RefineService | null = null;
  let settings: RefineSettingsDocument = createRefineSettings();
  let settingsFolder: unknown = undefined;
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  const records = new Map<string, RefineRecord>();
  const manual = new Set<string>();
  let recordsImage: HTMLImageElement | null = null;
  let preview: { result: RefineResult; before: RefineRect }[] = [];
  let previewTimer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;
  let previewGeneration = 0;
  let busy = false;
  let applying = false;

  const isDetection = (): boolean => input.state.session.workflow === "detection";
  const paneOpen = (): boolean => !pane.hidden;
  const getService = (): RefineService => (service ??= createRefineService());
  const setStatus = (text: string): void => { status.textContent = text; };

  const syncImage = (): HTMLImageElement | null => {
    const image = input.state.session.currentImage;
    if (image !== recordsImage) {
      recordsImage = image;
      records.clear();
      manual.clear();
      preview = [];
    }
    return image;
  };

  // ---------------------------------------------------------------- boxes
  const rects = (): FabricRectLike[] => raw.getObjects("rect").filter(isRectObject);
  const visibleRects = (): FabricRectLike[] => rects().filter((rect) => rect.visible !== false);
  const toBox = (rect: FabricRectLike): RefineBoxInput => {
    rect.setCoords(); // cached corners lag behind during/just after a draw gesture
    const b = getRectBounds(rect);
    return { id: ensureAnnotationId(rect), classId: rect.labelClass ?? "0", x0: b.left, y0: b.top, x1: b.right, y1: b.bottom };
  };
  const sameRect = (a: RefineRect, b: RefineRect, eps = 0.01): boolean =>
    Math.abs(a.x0 - b.x0) < eps && Math.abs(a.y0 - b.y0) < eps && Math.abs(a.x1 - b.x1) < eps && Math.abs(a.y1 - b.y1) < eps;
  const selectedRects = (): FabricRectLike[] => extractVisibleRectSelection(raw.canvas.getActiveObject?.() ?? null);
  const paramsFor = (boxes: readonly RefineBoxInput[]): Record<string, RefineParams> => {
    const out: Record<string, RefineParams> = {};
    for (const box of boxes) out[box.classId] ??= resolveRefineParams(settings, box.classId);
    return out;
  };
  const classIds = (): string[] => {
    const ids = new Set<string>([...input.state.session.classNames.keys(), ...Object.keys(settings.classes)]);
    rects().forEach((rect) => ids.add(rect.labelClass ?? "0"));
    return [...ids].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
  };

  /** Flagged, not yet reviewed, and still at the refined geometry (a later hand edit counts as reviewed). */
  const reviewQueue = (): RefineBoxInput[] => {
    if (!records.size) return [];
    return visibleRects()
      .filter((rect) => { const record = records.get(ensureAnnotationId(rect)); return record?.result.flagged && !record.reviewed; })
      .map(toBox)
      .filter((box) => sameRect(records.get(box.id)!.result.box, box))
      .sort((a, b) => (a.y0 - b.y0) || (a.x0 - b.x0));
  };

  // ---------------------------------------------------------------- settings
  let editor: RefineEditor | null = null;
  const loadSettings = async (): Promise<void> => {
    const folder = input.state.session.imageFolderHandle;
    if (folder === settingsFolder) return;
    settingsFolder = folder;
    settings = createRefineSettings();
    if (folder) {
      try {
        const directory = await getSubdirectoryHandle(folder as unknown as DirectoryHandleLike, ".easy-labeling");
        settings = parseRefineSettings(await readTextFileByName(directory, REFINE_SETTINGS_FILE));
      } catch (error: unknown) {
        if (!isNotFoundError(error)) input.uiManager.notify("Refine settings were invalid; defaults are in use.", 5000);
      }
    }
    editor?.render();
  };
  const changeSettings = (next: RefineSettingsDocument): void => {
    settings = next;
    editor?.render();
    schedulePreview();
    clearTimeout(saveTimer);
    const folder = settingsFolder;
    if (!folder) return;
    saveTimer = setTimeout(() => {
      getSubdirectoryHandle(folder as DirectoryHandleLike, ".easy-labeling", { create: true })
        .then((directory) => writeTextFileByName(directory, REFINE_SETTINGS_FILE, serializeRefineSettings(settings)))
        .catch(() => input.uiManager.notify("Refine settings could not be saved.", 4000));
    }, 400);
  };

  // ---------------------------------------------------------------- run
  const setBusy = (value: boolean): void => {
    busy = value;
    pane.querySelectorAll<HTMLButtonElement>("[data-refine-run]").forEach((button) => { button.disabled = value; });
  };

  const run = async (targets: RefineBoxInput[], skipManual: boolean): Promise<void> => {
    const image = syncImage();
    if (!image || !isDetection()) return setStatus("Open an image in the Detection workflow first.");
    if (busy) return;
    await loadSettings();
    const candidates = skipManual ? targets.filter((box) => !manual.has(box.id)) : targets;
    const paramsByClass = paramsFor(candidates);
    const runnable = candidates.filter((box) => paramsByClass[box.classId].enabled);
    if (!runnable.length) return setStatus(targets.length ? "Nothing to refine: boxes are hand-edited or their class is off." : "No boxes to refine.");
    const started = performance.now();
    const token = ++generation;
    setBusy(true);
    setStatus(`Refining ${runnable.length} box${runnable.length === 1 ? "" : "es"}…`);
    try {
      const results = await getService().refine(image, runnable, paramsByClass, rects().map(toBox));
      if (token !== generation || image !== input.state.session.currentImage) return;
      // Skip boxes the user moved while the worker was busy.
      const now = new Map(rects().map(toBox).map((box) => [box.id, box]));
      const sent = new Map(runnable.map((box) => [box.id, box]));
      const fresh = results.filter((r) => { const current = now.get(r.id); const before = sent.get(r.id); return current && before && sameRect(current, before, 1e-6); });
      applying = true;
      try {
        raw.updateBoxGeometries?.(fresh.map((r) => ({ annotationId: r.id, x: r.box.x0, y: r.box.y0, width: r.box.x1 - r.box.x0, height: r.box.y1 - r.box.y0 })));
      } finally {
        applying = false;
      }
      fresh.forEach((result) => { records.set(result.id, { result, reviewed: false }); manual.delete(result.id); });
      const skipped = targets.length - fresh.length;
      const flagged = fresh.filter((r) => r.flagged).length;
      setStatus(`${fresh.length} refined in ${Math.round(performance.now() - started)} ms`
        + (skipped ? ` · ${skipped} skipped` : "") + ` · ${flagged} to review`);
      preview = [];
      renderReviewCounter();
      raw.canvas.requestRenderAll?.();
    } catch (error: unknown) {
      setStatus(`Refine failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  };

  const skipManualToggle = (): HTMLInputElement => byId<HTMLInputElement>("refineSkipManualToggle");
  const editedClassBoxes = (classes: readonly string[]): RefineBoxInput[] => {
    const boxes = visibleRects().map(toBox);
    return classes.length ? boxes.filter((box) => classes.includes(box.classId)) : boxes;
  };
  const refineSelected = (): void => {
    const boxes = selectedRects().map(toBox);
    if (!boxes.length) { setStatus("Select boxes to refine first."); return; }
    void run(boxes, false);
  };
  const refineClasses = (): void => {
    const targets = editor?.targets() ?? "default";
    void run(editedClassBoxes(targets === "default" ? [] : targets), skipManualToggle().checked);
  };
  const refineAll = (): void => { void run(visibleRects().map(toBox), skipManualToggle().checked); };

  // ---------------------------------------------------------------- review
  const renderReviewCounter = (): void => {
    const queue = reviewQueue();
    const current = selectedRects()[0];
    const index = current && queue.length ? queue.findIndex((box) => box.id === ensureAnnotationId(current)) : -1;
    reviewCounter.textContent = queue.length ? `${index >= 0 ? `${index + 1} / ` : ""}${queue.length} to review` : "0 to review";
  };
  const navigateReview = (direction: 1 | -1): void => {
    syncImage();
    const queue = reviewQueue();
    if (!queue.length) { renderReviewCounter(); setStatus("Nothing to review."); return; }
    const current = selectedRects()[0];
    const index = current ? queue.findIndex((box) => box.id === ensureAnnotationId(current)) : -1;
    const next = queue[index < 0 ? (direction > 0 ? 0 : queue.length - 1) : (index + direction + queue.length) % queue.length];
    const rect = rects().find((candidate) => ensureAnnotationId(candidate) === next.id);
    if (!rect) return;
    raw.setActiveSelection([rect], rect);
    raw.goToCoords((next.x0 + next.x1) / 2, (next.y0 + next.y1) / 2);
    renderReviewCounter();
  };
  const approve = (): void => {
    const selected = selectedRects();
    if (!selected.length) { setStatus("Select a flagged box to approve."); return; }
    selected.forEach((rect) => { const record = records.get(ensureAnnotationId(rect)); if (record) record.reviewed = true; });
    raw.canvas.requestRenderAll?.();
    navigateReview(1);
  };

  // ---------------------------------------------------------------- canvas preview (selected boxes, not applied)
  const schedulePreview = (): void => {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      const image = syncImage();
      const selected = paneOpen() && isDetection() ? selectedRects().map(toBox) : [];
      if (!image || !selected.length || selected.length > PREVIEW_LIMIT) {
        if (preview.length) { preview = []; raw.canvas.requestRenderAll?.(); }
        if (selected.length > PREVIEW_LIMIT) setStatus(`Preview shows up to ${PREVIEW_LIMIT} selected boxes.`);
        return;
      }
      const token = ++previewGeneration;
      void loadSettings()
        .then(() => getService().refine(image, selected, paramsFor(selected), rects().map(toBox)))
        .then((results) => {
          if (token !== previewGeneration) return;
          const before = new Map(selected.map((box) => [box.id, box]));
          preview = results.map((result) => ({ result, before: before.get(result.id)! }));
          const moved = preview.filter((p) => !sameRect(p.result.box, p.before, 0.05)).length;
          setStatus(`Preview: ${moved} of ${selected.length} selected would move · E applies`);
          raw.canvas.requestRenderAll?.();
        })
        .catch(() => undefined);
    }, 120);
  };

  // ---------------------------------------------------------------- overlay
  const drawOverlay = (): void => {
    const fabricCanvas = raw.canvas;
    const width = Math.max(1, Math.round(fabricCanvas.getWidth()));
    const height = Math.max(1, Math.round(fabricCanvas.getHeight()));
    const context = overlay.getContext("2d");
    if (!context) return;
    const active = isDetection() && input.state.session.currentImage === recordsImage && (records.size > 0 || preview.length > 0);
    if (!active) {
      if (overlay.width > 1) context.clearRect(0, 0, overlay.width, overlay.height);
      return;
    }
    if (overlay.width !== width || overlay.height !== height) {
      overlay.width = width;
      overlay.height = height;
      overlay.style.width = `${width}px`;
      overlay.style.height = `${height}px`;
    }
    // Fabric's wrapper is centred inside <main>; pin the overlay onto the actual canvas element.
    const host = overlay.offsetParent?.getBoundingClientRect();
    const target = doc.getElementById("canvas")?.getBoundingClientRect();
    if (host && target) {
      overlay.style.inset = "auto";
      overlay.style.left = `${target.left - host.left}px`;
      overlay.style.top = `${target.top - host.top}px`;
    }
    context.clearRect(0, 0, width, height);
    const v = fabricCanvas.viewportTransform;
    const sx = (x: number): number => v[0] * x + v[4];
    const sy = (y: number): number => v[3] * y + v[5];
    context.save();
    for (const box of reviewQueue()) {
      const weak = records.get(box.id)?.result.weakSides ?? [];
      const [x0, y0, x1, y1] = [sx(box.x0), sy(box.y0), sx(box.x1), sy(box.y1)];
      context.setLineDash([5, 4]);
      context.lineWidth = 1.5;
      context.strokeStyle = WARN_COLOR;
      context.strokeRect(x0 - 3, y0 - 3, x1 - x0 + 6, y1 - y0 + 6);
      context.setLineDash([]);
      context.lineWidth = 4;
      context.beginPath();
      for (const side of weak) {
        if (side === "L") { context.moveTo(x0, y0); context.lineTo(x0, y1); }
        if (side === "R") { context.moveTo(x1, y0); context.lineTo(x1, y1); }
        if (side === "T") { context.moveTo(x0, y0); context.lineTo(x1, y0); }
        if (side === "B") { context.moveTo(x0, y1); context.lineTo(x1, y1); }
      }
      context.stroke();
    }
    // Preview: the would-be result as a solid outline plus how far each side moves (outward positive).
    context.font = "600 11px system-ui, sans-serif";
    for (const { result, before } of preview) {
      const { x0, y0, x1, y1 } = result.box;
      context.lineWidth = 2;
      context.strokeStyle = result.flagged ? WARN_COLOR : getColorForClass(result.classId);
      context.strokeRect(sx(x0), sy(y0), sx(x1) - sx(x0), sy(y1) - sy(y0));
      for (const side of REFINE_SIDES) {
        const key = SIDE_KEY[side];
        const delta = (result.box[key] - before[key]) * (side === "L" || side === "T" ? -1 : 1);
        if (Math.abs(delta) < 0.5) continue;
        const text = `${delta > 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)}`;
        const tx = side === "L" ? sx(x0) - context.measureText(text).width - 6 : side === "R" ? sx(x1) + 6 : (sx(x0) + sx(x1)) / 2 - 12;
        const ty = side === "T" ? sy(y0) - 6 : side === "B" ? sy(y1) + 14 : (sy(y0) + sy(y1)) / 2 + 4;
        context.fillStyle = "rgba(0, 0, 0, 0.6)";
        context.fillRect(tx - 3, ty - 11, context.measureText(text).width + 6, 15);
        context.fillStyle = "#ffffff";
        context.fillText(text, tx, ty);
      }
    }
    context.restore();
  };

  // ---------------------------------------------------------------- lab
  let lab: RefineLab | null = null;
  const collectCases = (source: RefineLabCaseSource, classes: readonly string[]): RefineBoxInput[] => {
    if (source === "selection") return selectedRects().map(toBox);
    if (source === "classes") return editedClassBoxes(classes);
    return visibleRects().map(toBox);
  };
  const openLab = (): void => {
    if (!isDetection()) return;
    // The lab is loaded on first use to keep app start-up light.
    void Promise.all([loadSettings(), import("./refine-lab.js")]).then(([, { createRefineLab }]) => {
      lab ??= createRefineLab({
        documentRef: doc,
        windowRef,
        getImage: syncImage,
        getSettings: () => settings,
        saveSettings: changeSettings,
        refineOnCanvas: (ids) => {
          const wanted = new Set(ids);
          void run(rects().map(toBox).filter((box) => wanted.has(box.id)), false);
        },
        collectCases,
        allBoxes: () => rects().map(toBox),
        classIds,
        className: (classId) => input.state.session.classNames.get(classId),
        notify: (message) => input.uiManager.notify(message, 4000)
      });
      lab.open();
    });
  };

  const runShortcut = (action: RefineShortcut): void => {
    if (!isDetection()) return;
    switch (action) {
      case "toggle": input.uiManager.setInspectorTab(paneOpen() ? "annotation" : "refine"); break;
      case "refineSelected": refineSelected(); break;
      case "refineAll": refineAll(); break;
      case "nextReview": navigateReview(1); break;
      case "previousReview": navigateReview(-1); break;
      case "approve": approve(); break;
    }
  };

  return {
    bind(): void {
      editor = createRefineEditor({
        root: byId("refineEditor"),
        prefix: "refine",
        documentRef: doc,
        windowRef,
        store: {
          getDoc: () => settings,
          setDoc: changeSettings,
          classIds,
          className: (classId) => input.state.session.classNames.get(classId),
          notify: setStatus
        }
      });
      byId("refineSelectedBtn").addEventListener("click", refineSelected);
      byId("refineClassesBtn").addEventListener("click", refineClasses);
      byId("refineAllBtn").addEventListener("click", refineAll);
      byId("refinePrevReviewBtn").addEventListener("click", () => navigateReview(-1));
      byId("refineNextReviewBtn").addEventListener("click", () => navigateReview(1));
      byId("refineApproveBtn").addEventListener("click", approve);
      byId("openRefineLabBtn").addEventListener("click", openLab);
      byId("taskRefineBtn").addEventListener("click", () => runShortcut("toggle"));
      byId("inspectorRefineTabBtn").addEventListener("click", () => input.uiManager.setInspectorTab("refine"));

      const canvas = raw.canvas;
      canvas.on?.("after:render", drawOverlay);
      const onSelection = (): void => {
        if (records.size) renderReviewCounter();
        if (paneOpen() || preview.length) schedulePreview();
      };
      ["selection:created", "selection:updated", "selection:cleared", "object:modified"].forEach((name) => canvas.on?.(name, onSelection));
      // Refresh whenever the pane becomes visible (class list or dataset may have changed).
      new MutationObserver(() => {
        schedulePreview();
        if (!paneOpen()) return;
        syncImage();
        void loadSettings().then(() => { editor?.render(); renderReviewCounter(); });
      }).observe(pane, { attributes: true, attributeFilter: ["hidden"] });

      raw.subscribeHistory?.((entry) => {
        if (applying) return;
        syncImage();
        const before = new Map(entry.before.map((s) => [s.annotationId, s]));
        const created: string[] = [];
        for (const after of entry.after) {
          const prior = before.get(after.annotationId);
          before.delete(after.annotationId);
          if (!prior) created.push(after.annotationId);
          else if (prior.boundsLeft !== after.boundsLeft || prior.boundsTop !== after.boundsTop
            || prior.width * prior.scaleX !== after.width * after.scaleX || prior.height * prior.scaleY !== after.height * after.scaleY) {
            manual.add(after.annotationId);
          }
        }
        before.forEach((_, id) => { records.delete(id); manual.delete(id); });
        if (created.length === 1 && input.state.view.currentMode === "draw") {
          const rect = rects().find((candidate) => ensureAnnotationId(candidate) === created[0]);
          if (rect) {
            const box = toBox(rect);
            void loadSettings().then(() => {
              const params = resolveRefineParams(settings, box.classId);
              if (params.enabled && params.autoOnDraw) return run([box], false);
            });
          }
        }
      });
    },
    runShortcut
  };
}
