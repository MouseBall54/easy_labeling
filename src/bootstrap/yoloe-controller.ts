import type { AppState } from "../app/state.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";
import { isRectObject } from "../features/canvas/fabric-types.js";
import { imagePng, selectedVisualExamples, maskRegionExample, decodeYoloeMask, requestYoloe, inferYoloe, type VisualExample, type YoloeProfile, type YoloeStatus, type YoloeResult } from "../features/inference/yoloe.js";
import type { Detection } from "../features/inference/yolo.js";
import { getColorForClass } from "../features/canvas/colors.js";
import { installModalFocusManagement } from "../ui/modal-focus.js";
import { parseYoloRows } from "../domain/yolo/yolo.js";
import { normalizeClassName } from "../domain/class-files.js";

export function bindYoloeControls(input: { state: AppState; documentRef: Document; canvasController: RuntimeCanvasController; fileSystem: RuntimeFileSystem; uiManager: RuntimeUiManager }): () => void {
  const { state, documentRef, canvasController, fileSystem, uiManager } = input;
  if (!documentRef.getElementById("yoloeInferenceControls")) return () => {};
  const el = <T extends HTMLElement>(id: string): T => documentRef.getElementById(id) as T;
  const modelSelect = el<HTMLSelectElement>("yoloeModelSelect");
  const nameInput = el<HTMLInputElement>("yoloeProfileName");
  const sampleName = el<HTMLInputElement>("yoloeSampleName");
  const shape = el<HTMLSelectElement>("yoloePromptShape");
  const badge = el<HTMLElement>("yoloeBackendBadge");
  const status = el<HTMLElement>("yoloeRunStatus");
  const overlay = el<HTMLCanvasElement>("yoloePreviewCanvas");
  const mainCanvasParent = overlay.parentElement!;
  const setupElement = el("yoloeSetupModal");
  const setupModal = new documentRef.defaultView!.bootstrap.Modal(setupElement);
  installModalFocusManagement(documentRef, ["yoloeSetupModal"]);
  const referenceSelect = el<HTMLSelectElement>("yoloeReferenceSelect");
  const existingBoxSelect = el<HTMLSelectElement>("yoloeExistingBoxSelect");
  let existingBoxes: VisualExample[] = [];
  let setupOpen = false;
  let sampleImage: HTMLImageElement | null = null;
  let sampleImageName = "";
  let sampleTransform: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0];
  let sampleZoom = 1, samplePanX = 0, samplePanY = 0;
  let spaceHeld = false;
  let pan: { pointerId: number; x: number; y: number } | null = null;
  let connected = false, busy = false;
  let backend: "cuda" | "cpu" | null = null;
  let readyModels: string[] = [];
  let connectionAttempted = false;
  let profile: YoloeProfile | null = null;
  let sourceFolder: FileSystemDirectoryHandle | null = null;
  let referenceName = "";
  let preview: { image: HTMLImageElement; boxes: Detection[]; maskCanvas: HTMLCanvasElement | null } | null = null;
  let examples: (VisualExample & { sourceImage: HTMLImageElement; sourceName: string })[] = [];
  let referenceImage: HTMLImageElement | null = null;
  let workflow = state.session.workflow;
  let drawing = false;
  let start: { x: number; y: number } | null = null;
  let end: { x: number; y: number } | null = null;
  let outline: [number, number][] = [];
  let operationController: AbortController | null = null;
  const sync = (): void => {
    const hasImage = Boolean((setupOpen ? sampleImage : state.session.currentImage) && state.session.imageFolderHandle);
    el("yoloeInferenceControls").dataset.busy = String(busy);
    if (workflow !== state.session.workflow || sourceFolder && sourceFolder !== state.session.imageFolderHandle) {
      workflow = state.session.workflow;
      profile = null; sourceFolder = null;
      examples = []; referenceImage = null; drawing = false; outline = []; start = end = null;
      sampleImage = state.session.currentImage; sampleImageName = state.session.currentImageFile?.name ?? "";
      overlay.style.pointerEvents = "none"; overlay.style.cursor = "";
      el("drawYoloeExampleBtn").textContent = shape.value === "box" ? "Draw sample box" : "Outline sample";
      el("drawYoloeExampleBtn").setAttribute("aria-pressed", "false");
      el("yoloeExampleList").replaceChildren();
      status.hidden = true;
      clearPreview();
    }
    el("yoloeOutputBadge").textContent = workflow === "segmentation" ? "Segmentation · Masks" : "Detection · Boxes";
    const summary = `${modelSelect.value || "YOLOE-26"} · ${examples.length} sample(s) · ${new Set(examples.map((e) => e.sourceName)).size} image(s)`;
    el("yoloeSummary").textContent = summary;
    el("yoloeSetupSummary").textContent = `${workflow === "segmentation" ? "Masks" : "Boxes"} · ${backend === "cuda" ? "GPU / CUDA" : backend === "cpu" ? "CPU" : "Disconnected"} · ${summary}`;
    el("yoloeSamplesEmpty").hidden = Boolean(examples.length);
    el<HTMLButtonElement>("openYoloeSetupBtn").disabled = busy;
    const imagesSignature = JSON.stringify(state.session.imageFiles.map((file) => file.name));
    if (referenceSelect.dataset.images !== imagesSignature) {
      referenceSelect.replaceChildren(...state.session.imageFiles.map((file) => new Option(file.name, file.name)));
      if (!state.session.imageFiles.length) referenceSelect.append(new Option("Open a dataset first", ""));
      referenceSelect.dataset.images = imagesSignature;
    }
    referenceSelect.value = sampleImageName;
    referenceSelect.disabled = busy || drawing || !state.session.imageFiles.length;
    overlay.parentElement!.dataset.yoloeDrawing = String(drawing);
    overlay.setAttribute("aria-hidden", String(!setupOpen && !drawing));
    overlay.tabIndex = setupOpen ? 0 : -1;
    overlay.style.pointerEvents = setupOpen || drawing ? "auto" : "none";
    overlay.style.cursor = pan ? "grabbing" : spaceHeld || !drawing ? "grab" : "crosshair";
    el<HTMLButtonElement>("fitYoloeSampleBtn").disabled = !sampleImage;
    el("yoloeDrawingToolbar").hidden = !drawing;
    el("yoloeDrawingTitle").textContent = `${shape.value === "box" ? "Sample box" : "Sample outline"} · ${sampleName.value}`;
    el("yoloeCanvasDrawingHint").textContent = shape.value === "box"
      ? "Drag around the target · Esc: cancel"
      : `${outline.length} points · Click the outline · Enter: finish · Backspace: undo · Esc: cancel`;
    el("drawYoloeExampleBtn").classList.toggle("btn-primary", drawing);
    el("drawYoloeExampleBtn").classList.toggle("btn-outline-primary", !drawing);
    const classes = el<HTMLSelectElement>("yoloeExampleClass");
    const choices = [...state.session.classNames].filter(([id]) => /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && (workflow === "detection" || Number(id) > 0 && Number(id) <= 65535));
    const signature = JSON.stringify(choices);
    if (classes.dataset.choices !== signature) {
      const previous = classes.value;
      classes.replaceChildren(...choices.map(([id, name]) => new Option(`${id}: ${name}`, id)));
      if (choices.some(([id]) => id === previous)) classes.value = previous;
      classes.dataset.choices = signature;
    }
    classes.disabled = busy || drawing;
    sampleName.disabled = busy || drawing;
    const targets = el<HTMLSelectElement>("yoloeExistingTarget");
    const counts = new Map<string, number>();
    for (const example of examples) counts.set(example.name, (counts.get(example.name) ?? 0) + 1);
    const targetSignature = JSON.stringify([...counts]);
    if (targets.dataset.targets !== targetSignature) {
      targets.replaceChildren(new Option("New target", ""), ...[...counts].map(([name, count]) => new Option(`${name} · ${count} example(s)`, name)));
      targets.dataset.targets = targetSignature;
    }
    targets.value = counts.has(sampleName.value) ? sampleName.value : "";
    targets.disabled = busy || drawing;
    el("yoloeTargetChoice").hidden = !examples.length;
    el<HTMLSelectElement>("yoloeImageSize").disabled = busy || drawing;
    shape.disabled = busy || drawing;
    el<HTMLButtonElement>("drawYoloeExampleBtn").disabled = busy || !hasImage;
    el<HTMLButtonElement>("finishYoloeSampleBtn").disabled = !drawing || outline.length < 3;
    el("finishYoloeSampleBtn").hidden = !drawing || shape.value === "box";
    el("yoloeDrawingHint").hidden = !drawing || shape.value === "box";
    const selectedCount = workflow === "segmentation"
      ? canvasController.raw.getSelectedSegmentationRegion?.() ? 1 : 0
      : canvasController.raw.canvas.getActiveObjects().filter(isRectObject).length;
    const selectedButton = el<HTMLButtonElement>("addYoloeSelectedBtn");
    const sameImage = sampleImageName === state.session.currentImageFile?.name;
    selectedButton.textContent = `Use selected ${workflow === "segmentation" ? "mask" : "boxes"} (${selectedCount})`;
    selectedButton.disabled = busy || drawing || !hasImage || !sameImage || !selectedCount;
    selectedButton.title = !sameImage ? "Choose the current main image to use its selected labels."
      : !selectedCount ? "Select existing labels in Edit mode on the main canvas, then open Samples & settings."
      : "Add the selected labels as samples with their existing class names and IDs. Original labels stay unchanged.";
    el("yoloeExistingBoxes").hidden = workflow !== "detection";
    existingBoxSelect.disabled = busy || drawing || !existingBoxes.length;
    el<HTMLButtonElement>("addYoloeExistingBtn").disabled = busy || drawing || !existingBoxes[Number(existingBoxSelect.value)] || existingBoxSelect.value === "";
    el<HTMLButtonElement>("clearYoloeExamplesBtn").disabled = busy;
    el("clearYoloeExamplesBtn").hidden = !examples.length;
    el<HTMLButtonElement>("connectYoloeBtn").disabled = busy;
    modelSelect.disabled = busy || drawing || !connected;
    nameInput.disabled = busy;
    el<HTMLSelectElement>("yoloeSaveScope").disabled = busy || drawing;
    for (const id of ["previewYoloeBtn", "previewYoloeSampleBtn", "saveYoloeCurrentBtn"]) el<HTMLButtonElement>(id).disabled = busy || drawing || !examples.length || !hasImage;
    for (const button of el("yoloeExampleList").querySelectorAll<HTMLButtonElement>("button")) button.disabled = busy || drawing;
    for (const id of ["taskInferenceBtn", "taskYoloeBtn"]) el<HTMLButtonElement>(id).disabled = busy || el<HTMLInputElement>("inferenceModelInput").disabled;
    for (const id of ["detectionWorkflowTab", "segmentationWorkflowTab"]) el<HTMLInputElement>(id).disabled = busy;
  };
  const clearPreview = (): void => {
    preview = null;
    el("yoloeSampleResultToggle").hidden = true;
    overlay.hidden = !setupOpen && !drawing;
  };
  const drawPreview = (): void => {
    if (!setupOpen && preview && preview.image !== state.session.currentImage) clearPreview();
    if (drawing && referenceImage !== (setupOpen ? sampleImage : state.session.currentImage)) stopDrawing();
    const canvas = canvasController.raw.canvas;
    const parent = canvas.upperCanvasEl?.getBoundingClientRect?.();
    const container = overlay.parentElement!.getBoundingClientRect();
    overlay.style.inset = "auto";
    overlay.style.left = setupOpen ? "0" : `${(parent?.left ?? container.left) - container.left}px`;
    overlay.style.top = setupOpen ? "0" : `${(parent?.top ?? container.top) - container.top}px`;
    overlay.width = Math.max(1, Math.round(setupOpen ? container.width : canvas.width));
    overlay.height = Math.max(1, Math.round(setupOpen ? container.height : canvas.height));
    overlay.style.width = `${overlay.width}px`; overlay.style.height = `${overlay.height}px`;
    const active = documentRef.querySelector(".app-workspace")?.getAttribute("data-active-task") === "yoloe";
    if (!active && drawing) stopDrawing();
    overlay.hidden = !active || !setupOpen && !preview && !drawing;
    const context = overlay.getContext("2d")!;
    let zoom = canvas.getZoom();
    if (setupOpen) {
      el("yoloeSampleEmpty").hidden = Boolean(sampleImage);
      if (!sampleImage) { el("yoloeSampleZoom").textContent = ""; return; }
      overlay.dataset.referenceWidth = String(sampleImage.naturalWidth);
      overlay.dataset.referenceHeight = String(sampleImage.naturalHeight);
      zoom = Math.min(overlay.width / sampleImage.naturalWidth, overlay.height / sampleImage.naturalHeight) * sampleZoom;
      sampleTransform = [zoom, 0, 0, zoom, (overlay.width - sampleImage.naturalWidth * zoom) / 2 + samplePanX, (overlay.height - sampleImage.naturalHeight * zoom) / 2 + samplePanY];
      el("yoloeSampleZoom").textContent = `${Math.round(zoom * 100)}%`;
      context.setTransform(...sampleTransform);
      context.drawImage(sampleImage, 0, 0);
      const chosen = existingBoxSelect.value === "" ? null : existingBoxes[Number(existingBoxSelect.value)];
      if (workflow === "detection" && chosen) {
        const [x1, y1, x2, y2] = chosen.box;
        const color = getColorForClass(String(chosen.classId));
        context.fillStyle = `${color}33`; context.strokeStyle = "#ffffff"; context.lineWidth = 4 / zoom;
        context.fillRect(x1, y1, x2 - x1, y2 - y1); context.strokeRect(x1, y1, x2 - x1, y2 - y1);
        context.strokeStyle = color; context.lineWidth = 2 / zoom; context.strokeRect(x1, y1, x2 - x1, y2 - y1);
      }
      context.lineWidth = 2 / zoom;
      for (const example of examples.filter((e) => e.sourceName === sampleImageName)) {
        context.strokeStyle = getColorForClass(String(example.classId));
        const [x1, y1, x2, y2] = example.box;
        if (example.polygon) {
          context.beginPath(); context.moveTo(...example.polygon[0]!);
          for (const point of example.polygon.slice(1)) context.lineTo(...point);
          context.closePath(); context.stroke();
        } else context.strokeRect(x1, y1, x2 - x1, y2 - y1);
      }
    } else context.setTransform(...canvas.viewportTransform);
    const visiblePreview = setupOpen ? preview?.image === sampleImage && el<HTMLInputElement>("yoloeShowSampleResults").checked ? preview : null : preview;
    el("yoloeSampleResultToggle").hidden = preview?.image !== sampleImage;
    if (visiblePreview?.maskCanvas) {
      context.drawImage(visiblePreview.maskCanvas, 0, 0);
    }
    for (const box of visiblePreview?.maskCanvas ? [] : visiblePreview?.boxes ?? []) {
      const color = getColorForClass(String(box.classId));
      context.fillStyle = `${color}33`; context.strokeStyle = color; context.lineWidth = 2 / zoom;
      context.fillRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
      context.strokeRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
    }
    context.save(); context.resetTransform();
    const detection = workflow === "detection";
    const fontSize = detection ? state.view.labelFontSize : 13;
    const labelHeight = detection ? fontSize + 7 : 22;
    context.font = detection ? `600 ${fontSize}px 'Segoe UI', sans-serif` : "600 13px sans-serif";
    context.textBaseline = "top";
    const labels: { x: number; y: number; width: number }[] = [];
    const transform = setupOpen ? sampleTransform : canvas.viewportTransform;
    // At most 300 results: keep higher-confidence badges when screen-space labels overlap.
    for (const box of [...visiblePreview?.boxes ?? []].sort((a, b) => b.confidence - a.confidence)) {
      const left = box.left * transform[0] + transform[4], top = box.top * transform[3] + transform[5];
      if (left > overlay.width || top > overlay.height || box.right * transform[0] + transform[4] < 0 || box.bottom * transform[3] + transform[5] < 0) continue;
      const text = `${profile?.classes[String(box.classId)] ?? box.classId} ${(box.confidence * 100).toFixed(0)}%`;
      const width = Math.min(overlay.width, Math.ceil(context.measureText(text).width) + (detection ? 10 : 16));
      const x = Math.max(0, Math.min(overlay.width - width, left));
      const y = Math.max(0, Math.min(overlay.height - labelHeight, top - labelHeight - (detection ? 3 : 2)));
      if (labels.some((label) => x < label.x + label.width + 2 && x + width + 2 > label.x && y < label.y + labelHeight + 2 && y + labelHeight + 2 > label.y)) continue;
      labels.push({ x, y, width });
      context.fillStyle = detection ? getColorForClass(String(box.classId)) : "#111827";
      context.fillRect(x, y, width, labelHeight);
      if (!detection) { context.fillStyle = getColorForClass(String(box.classId)); context.fillRect(x, y, 4, labelHeight); }
      context.fillStyle = "#ffffff";
      context.fillText(text, x + (detection ? 5 : 9), y + (detection ? 3 : 4), Math.max(1, width - (detection ? 10 : 14)));
    }
    context.restore();
    context.strokeStyle = "#17a2b8"; context.fillStyle = "#17a2b8";
    context.lineWidth = 2 / zoom; context.setLineDash([6 / zoom, 3 / zoom]);
    if (drawing && shape.value === "mask" && outline.length) {
      context.beginPath(); context.moveTo(...outline[0]!);
      for (const point of outline.slice(1)) context.lineTo(...point);
      if (end) context.lineTo(end.x, end.y);
      context.closePath(); context.globalAlpha = 0.3; context.fill(); context.globalAlpha = 1; context.stroke();
      for (const point of outline) { context.beginPath(); context.arc(...point, 3 / zoom, 0, Math.PI * 2); context.fill(); }
    } else if (drawing && start && end) context.strokeRect(Math.min(start.x, end.x), Math.min(start.y, end.y), Math.abs(end.x - start.x), Math.abs(end.y - start.y));
  };
  const message = (target: HTMLElement, text: string): void => {
    target.hidden = false; target.textContent = text;
    if (target === status) el("yoloeSetupStatus").textContent = text;
  };
  const work = async (title: string, action: (signal: AbortSignal) => Promise<void>): Promise<void> => {
    if (busy) return;
    busy = true; sync();
    const operation = uiManager.beginOperation({ title, detail: `YOLOE-26 · ${backend === "cuda" ? "GPU / CUDA" : backend === "cpu" ? "CPU" : "Connecting"}`, cancellable: true });
    operationController = new AbortController();
    const controller = operationController;
    const cancel = (): void => controller.abort(new Error("YOLOE operation stopped."));
    operation.signal.addEventListener("abort", cancel, { once: true });
    try { await action(controller.signal); }
    catch (error) { message(status, error instanceof Error ? error.message : String(error)); }
    finally { operation.signal.removeEventListener("abort", cancel); operation.finish(); operationController = null; busy = false; sync(); }
  };
  const parameters = (): [number, number] => {
    const values: [number, number] = [el<HTMLInputElement>("yoloeConfidenceInput").valueAsNumber, el<HTMLInputElement>("yoloeIouInput").valueAsNumber];
    if (!values.every((x) => Number.isFinite(x) && x >= 0 && x <= 1)) throw new Error("Confidence and IoU must be between 0 and 1.");
    return values;
  };
  el("openYoloeSetupBtn").addEventListener("click", () => setupModal.show());
  const fitSample = (): void => { sampleZoom = 1; samplePanX = samplePanY = 0; drawPreview(); };
  el("fitYoloeSampleBtn").addEventListener("click", fitSample);
  el("yoloeShowSampleResults").addEventListener("change", drawPreview);
  const loadExistingBoxes = async (): Promise<void> => {
    existingBoxes = [];
    existingBoxSelect.replaceChildren(new Option("Loading labels…", "")); sync();
    if (workflow !== "detection" || !sampleImage) return;
    const width = sampleImage.naturalWidth, height = sampleImage.naturalHeight;
    if (sampleImageName === state.session.currentImageFile?.name) {
      // Include unsaved edits on the current main image.
      existingBoxes = canvasController.raw.canvas.getObjects().filter(isRectObject).flatMap((rect) => selectedVisualExamples([rect], width, height, state.session.classNames));
    } else {
      const text = await fileSystem.readDetectionLabels(sampleImageName);
      existingBoxes = parseYoloRows(text.split("\n").map((line) => line.trim().split(/\s+/).join(" ")).join("\n"), width, height).map((row) => {
        const box: VisualExample["box"] = [Math.max(0, row.rectLeft), Math.max(0, row.rectTop), Math.min(width, row.rectLeft + row.rectWidth), Math.min(height, row.rectTop + row.rectHeight)];
        if (!/^\d+$/.test(row.labelClass) || !Number.isSafeInteger(Number(row.labelClass)) || !box.every(Number.isFinite) || box[2] <= box[0] || box[3] <= box[1]) throw new Error(`Invalid Detection label in ${sampleImageName}.`);
        return { classId: Number(row.labelClass), name: normalizeClassName(state.session.classNames.get(row.labelClass) ?? `class ${row.labelClass}`), box };
      });
    }
    existingBoxSelect.replaceChildren(new Option(existingBoxes.length ? `Choose a box (${existingBoxes.length})` : "No boxes in the active label folder", ""), ...existingBoxes.map((box, index) => new Option(`#${index + 1} · ${box.classId}: ${box.name} · ${Math.round(box.box[2] - box.box[0])}×${Math.round(box.box[3] - box.box[1])}`, String(index))));
    sync(); drawPreview();
  };
  setupElement.addEventListener("shown.bs.modal", () => {
    setupOpen = true;
    sampleImageName = state.session.currentImageFile?.name ?? "";
    sampleImage = examples.find((e) => e.sourceName === sampleImageName)?.sourceImage ?? state.session.currentImage;
    el("yoloeSampleStage").append(overlay);
    el("yoloeSetupStatus").textContent = status.hidden ? "Changes apply immediately." : status.textContent;
    sync(); fitSample();
    void work("Loading existing labels", loadExistingBoxes);
  });
  setupElement.addEventListener("hidden.bs.modal", () => {
    setupOpen = false; spaceHeld = false; pan = null; stopDrawing();
    mainCanvasParent.append(overlay);
    drawPreview();
  });
  referenceSelect.addEventListener("change", () => {
    const file = state.session.imageFiles.find((entry) => entry.name === referenceSelect.value);
    if (!file) return;
    const folder = state.session.imageFolderHandle;
    void work("Loading reference image", async (signal) => {
      const image = examples.find((e) => e.sourceName === file.name)?.sourceImage
        ?? (file.name === state.session.currentImageFile?.name ? state.session.currentImage : null)
        ?? await fileSystem.decodeImageForAutomation(file);
      signal.throwIfAborted();
      if (!setupOpen || folder !== state.session.imageFolderHandle) return;
      sampleImage = image; sampleImageName = file.name; clearPreview();
      await loadExistingBoxes();
      sync(); fitSample();
    });
  });
  const sampleResize = new ResizeObserver(() => { if (setupOpen) drawPreview(); });
  sampleResize.observe(el("yoloeSampleStage"));
  const renderExamples = (): void => {
    const list = el("yoloeExampleList"); list.replaceChildren();
    for (const example of examples) {
      const row = documentRef.createElement("div");
      row.style.borderLeft = `3px solid ${getColorForClass(String(example.classId))}`;
      const thumb = documentRef.createElement("canvas"); thumb.width = thumb.height = 44;
      const [x1, y1, x2, y2] = example.box;
      const scale = Math.min(44 / (x2 - x1), 44 / (y2 - y1));
      const w = (x2 - x1) * scale, h = (y2 - y1) * scale;
      const context = thumb.getContext("2d")!;
      context.save();
      if (example.polygon) {
        context.beginPath();
        example.polygon.forEach(([x, y], index) => context[index ? "lineTo" : "moveTo"]((44 - w) / 2 + (x - x1) * scale, (44 - h) / 2 + (y - y1) * scale));
        context.closePath(); context.clip();
      }
      context.drawImage(example.sourceImage, x1, y1, x2 - x1, y2 - y1, (44 - w) / 2, (44 - h) / 2, w, h); context.restore();
      if (example.mask) {
        const cutout = documentRef.createElement("canvas"); cutout.width = example.mask.width; cutout.height = example.mask.height;
        const ctx = cutout.getContext("2d")!, pixels = ctx.createImageData(cutout.width, cutout.height);
        const mask = decodeYoloeMask(example.mask).mask;
        for (let i = 0; i < mask.length; i++) pixels.data.set([0, 0, 0, mask[i] ? 255 : 0], i * 4);
        ctx.putImageData(pixels, 0, 0); context.globalCompositeOperation = "destination-in";
        context.drawImage(cutout, (44 - w) / 2, (44 - h) / 2, w, h); context.globalCompositeOperation = "source-over";
      }
      const label = documentRef.createElement("span"); label.textContent = example.name; label.title = `${example.sourceName} · Class ${example.classId}`;
      const remove = documentRef.createElement("button"); remove.type = "button"; remove.className = "btn btn-sm btn-outline-secondary";
      remove.innerHTML = '<i class="bi bi-x" aria-hidden="true"></i>'; remove.setAttribute("aria-label", `Remove sample ${example.name}`);
      remove.addEventListener("click", () => { examples.splice(examples.indexOf(example), 1); profile = null; clearPreview(); if (!examples.length) referenceImage = null; renderExamples(); });
      row.append(thumb, label, remove); list.append(row);
    }
    sync(); drawPreview();
  };
  const useReference = (): void => {
    referenceImage = setupOpen ? sampleImage : state.session.currentImage;
    referenceName = setupOpen ? sampleImageName : state.session.currentImageFile!.name;
    sourceFolder = state.session.imageFolderHandle;
  };
  const addExamples = (added: VisualExample[]): void => {
    if (examples.length + added.length > 32) throw new Error("Use at most 32 samples.");
    if (workflow === "segmentation" && added.some((e) => !Number.isInteger(e.classId) || e.classId < 1 || e.classId > 65535)) throw new Error("Segmentation class IDs must be 1–65535; 0 is background.");
    useReference(); examples.push(...added.map((example) => ({ ...example, sourceImage: referenceImage!, sourceName: referenceName }))); profile = null; clearPreview(); renderExamples();
    message(status, `${referenceName} · ${examples.length} sample(s) · Ready to find`);
  };
  const selectedExamples = (): VisualExample[] => workflow === "segmentation"
    ? maskRegionExample(canvasController.raw.getSelectedSegmentationRegion?.() ?? null, state.session.classNames, state.session.currentImage!.naturalWidth)
    : selectedVisualExamples([...new Set(canvasController.raw.canvas.getActiveObjects().filter(isRectObject))], state.session.currentImage!.naturalWidth, state.session.currentImage!.naturalHeight, state.session.classNames);
  const stopDrawing = (): void => {
    drawing = false; start = end = null; outline = []; overlay.style.pointerEvents = "none"; overlay.style.cursor = "";
    el("drawYoloeExampleBtn").textContent = shape.value === "box" ? "Draw sample box" : "Outline sample";
    el("drawYoloeExampleBtn").setAttribute("aria-pressed", "false");
    sync();
  };
  el("drawYoloeExampleBtn").addEventListener("click", () => {
    if (drawing) { stopDrawing(); drawPreview(); return; }
    try {
      if (!sampleName.value.trim()) throw new Error("Name the sample first.");
      useReference(); clearPreview(); drawing = true; start = end = null; outline = [];
      overlay.style.pointerEvents = "auto"; overlay.style.cursor = "crosshair";
      el("drawYoloeExampleBtn").textContent = "Cancel sample";
      el("drawYoloeExampleBtn").setAttribute("aria-pressed", "true");
      message(status, shape.value === "box" ? "Drag around the sample." : "Click the target outline, then Enter to finish.");
      sync(); drawPreview();
      overlay.scrollIntoView({ block: "nearest", inline: "nearest" });
      overlay.focus({ preventScroll: true });
    } catch (error) { message(status, String(error instanceof Error ? error.message : error)); }
  });
  const pointer = (event: PointerEvent): { x: number; y: number } => {
    const bounds = overlay.getBoundingClientRect();
    const [a, b, c, d, tx, ty] = setupOpen ? sampleTransform : canvasController.raw.canvas.viewportTransform;
    const x = (event.clientX - bounds.left) * overlay.width / bounds.width - tx;
    const y = (event.clientY - bounds.top) * overlay.height / bounds.height - ty;
    const det = a * d - b * c;
    return { x: Math.max(0, Math.min(referenceImage!.naturalWidth, (d * x - c * y) / det)), y: Math.max(0, Math.min(referenceImage!.naturalHeight, (a * y - b * x) / det)) };
  };
  overlay.addEventListener("wheel", (event) => {
    if (!setupOpen || !sampleImage || !event.ctrlKey) return;
    event.preventDefault(); event.stopPropagation();
    const bounds = overlay.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * overlay.width / bounds.width;
    const y = (event.clientY - bounds.top) * overlay.height / bounds.height;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? overlay.height : 1);
    const next = Math.max(0.25, Math.min(16, sampleZoom * Math.exp(-delta * 0.0015)));
    const ratio = next / sampleZoom;
    samplePanX = (x - overlay.width / 2) * (1 - ratio) + samplePanX * ratio;
    samplePanY = (y - overlay.height / 2) * (1 - ratio) + samplePanY * ratio;
    sampleZoom = next; drawPreview();
  }, { passive: false });
  overlay.addEventListener("pointerdown", (event) => {
    if (setupOpen && sampleImage && (event.button === 1 || event.button === 0 && (spaceHeld || !drawing))) {
      pan = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      overlay.setPointerCapture(event.pointerId); overlay.focus({ preventScroll: true });
      event.preventDefault(); sync(); return;
    }
    if (!drawing || event.button !== 0) return;
    if (shape.value === "mask") {
      if (outline.length >= 512) { message(status, "Use at most 512 outline points."); return; }
      const point = pointer(event), last = outline.at(-1);
      if (!last || Math.hypot(point.x - last[0], point.y - last[1]) > 0.5) outline.push([point.x, point.y]);
      end = point; event.preventDefault(); sync(); drawPreview(); return;
    }
    start = end = pointer(event); overlay.setPointerCapture(event.pointerId); event.preventDefault(); drawPreview();
  });
  overlay.addEventListener("pointermove", (event) => {
    if (pan?.pointerId === event.pointerId) {
      const bounds = overlay.getBoundingClientRect();
      samplePanX += (event.clientX - pan.x) * overlay.width / bounds.width;
      samplePanY += (event.clientY - pan.y) * overlay.height / bounds.height;
      pan.x = event.clientX; pan.y = event.clientY; drawPreview(); return;
    }
    if (drawing && !spaceHeld && (start || outline.length)) { end = pointer(event); drawPreview(); }
  });
  const finishSample = (box: VisualExample["box"], polygon?: VisualExample["polygon"]): void => {
    try {
      const name = sampleName.value.trim();
      const repeatTarget = examples.some((e) => e.name === name);
      const existing = examples.find((e) => e.name === name)?.classId ?? [...state.session.classNames].find(([id, label]) => label === name && (workflow === "detection" || Number(id) > 0))?.[0];
      const used = new Set([...state.session.classNames.keys(), ...examples.map((e) => String(e.classId))]);
      let next = 1; while (used.has(String(next))) next++;
      if (next > 65535) throw new Error("No sample class ID is available.");
      const classId = existing === undefined ? next : Number(existing);
      addExamples([{ classId, name, box, ...(polygon ? { polygon } : {}) }]);
      let index = 0;
      while (examples.some((e) => e.name === `sample${index < 26 ? String.fromCharCode(65 + index) : index + 1}`)) index++;
      if (!repeatTarget) sampleName.value = `sample${index < 26 ? String.fromCharCode(65 + index) : index + 1}`;
    } catch (error) { message(status, error instanceof Error ? error.message : String(error)); }
    stopDrawing(); drawPreview();
  };
  const finishOutline = (): void => {
    if (!drawing || shape.value !== "mask" || outline.length < 3) return;
    const area = outline.reduce((sum, a, i) => { const b = outline[(i + 1) % outline.length]!; return sum + a[0] * b[1] - b[0] * a[1]; }, 0);
    if (Math.abs(area) < 2) { message(status, "Outline an area of the target before finishing."); return; }
    const xs = outline.map(([x]) => x), ys = outline.map(([, y]) => y);
    finishSample([Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], [...outline]);
  };
  overlay.addEventListener("dblclick", (event) => { if (event.button === 0 && !spaceHeld) finishOutline(); });
  el("finishYoloeSampleBtn").addEventListener("click", finishOutline);
  const keys = (event: KeyboardEvent): void => {
    if (setupOpen && event.code === "Space" && event.target === overlay) {
      event.preventDefault(); event.stopImmediatePropagation(); spaceHeld = true; sync(); return;
    }
    if (!drawing || event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
    if (!["Enter", "Escape", "Backspace"].includes(event.key)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (event.key === "Enter") finishOutline();
    else if (event.key === "Escape") { stopDrawing(); drawPreview(); }
    else { outline.pop(); sync(); drawPreview(); }
  };
  documentRef.addEventListener("keydown", keys, true);
  const releaseSpace = (): void => { spaceHeld = false; pan = null; sync(); };
  const keyup = (event: KeyboardEvent): void => { if (event.code === "Space" && spaceHeld) { spaceHeld = false; sync(); } };
  documentRef.addEventListener("keyup", keyup, true);
  documentRef.defaultView?.addEventListener("blur", releaseSpace);
  overlay.addEventListener("pointerup", (event) => {
    if (pan?.pointerId === event.pointerId) {
      overlay.releasePointerCapture(event.pointerId); pan = null; sync(); return;
    }
    if (!drawing || shape.value === "mask" || !start) return;
    end = pointer(event);
    const box: VisualExample["box"] = [Math.min(start.x, end.x), Math.min(start.y, end.y), Math.max(start.x, end.x), Math.max(start.y, end.y)];
    overlay.releasePointerCapture(event.pointerId);
    if (box[2] - box[0] >= 1 && box[3] - box[1] >= 1) finishSample(box); else stopDrawing();
    drawPreview();
  });
  overlay.addEventListener("pointercancel", () => { if (pan) { pan = null; sync(); } else stopDrawing(); drawPreview(); });
  el("addYoloeSelectedBtn").addEventListener("click", () => { try { addExamples(selectedExamples()); } catch (error) { message(status, error instanceof Error ? error.message : String(error)); } });
  existingBoxSelect.addEventListener("change", () => { sync(); drawPreview(); });
  el("addYoloeExistingBtn").addEventListener("click", () => {
    const box = existingBoxSelect.value === "" ? null : existingBoxes[Number(existingBoxSelect.value)];
    if (!box) return;
    try { addExamples([box]); } catch (error) { message(status, error instanceof Error ? error.message : String(error)); }
  });
  el("clearYoloeExamplesBtn").addEventListener("click", () => { stopDrawing(); examples = []; profile = null; referenceImage = null; clearPreview(); renderExamples(); status.hidden = true; });
  const connect = async (signal: AbortSignal): Promise<void> => {
    const previous = modelSelect.value;
    const previousBackend = backend;
    connected = false; profile = null; clearPreview();
    backend = null;
    badge.textContent = "Disconnected";
    el("yoloeConnectionStatus").hidden = true;
    modelSelect.replaceChildren(new Option("Connect first", ""));
    const result = await requestYoloe<YoloeStatus>("status", undefined, AbortSignal.any([signal, AbortSignal.timeout(5000)]));
    signal.throwIfAborted();
    if (result.version !== 5) throw new Error("Restart npm run yoloe:start to enable model selection and CPU inference.");
    backend = result.cuda ? "cuda" : "cpu";
    badge.textContent = result.cuda ? "GPU · CUDA" : "CPU";
    badge.title = result.gpu ?? "CUDA unavailable · Running on CPU";
    const info = el("yoloeConnectionStatus");
    message(info, result.cuda ? result.gpu! : "CPU · n is the default model");
    readyModels = result.models;
    modelSelect.replaceChildren(...["n", "s", "m", "l"].map((size) => {
      const name = `yoloe-26${size}-seg`;
      return new Option(`${size.toUpperCase()} · ${name}${readyModels.includes(name) ? "" : " · Not prepared"}`, name);
    }));
    modelSelect.value = result.cuda
      ? [previous, "yoloe-26s-seg", "yoloe-26n-seg", "yoloe-26m-seg", "yoloe-26l-seg"].find((name) => readyModels.includes(name)) ?? "yoloe-26s-seg"
      : previousBackend === "cpu" && readyModels.includes(previous) ? previous : "yoloe-26n-seg";
    connected = true;
    if (!readyModels.includes(modelSelect.value)) message(status, `Run npm.cmd run yoloe:prepare -- --model ${modelSelect.value}, then reconnect.`);
    else status.hidden = true;
  };
  el("connectYoloeBtn").addEventListener("click", () => { connectionAttempted = true; void work("Connecting YOLOE", connect); });
  sampleName.addEventListener("input", sync);
  el<HTMLSelectElement>("yoloeExistingTarget").addEventListener("change", () => {
    sampleName.value = el<HTMLSelectElement>("yoloeExistingTarget").value;
    if (!sampleName.value) {
      let index = 0;
      while (examples.some((e) => e.name === `sample${index < 26 ? String.fromCharCode(65 + index) : index + 1}`)) index++;
      sampleName.value = `sample${index < 26 ? String.fromCharCode(65 + index) : index + 1}`;
    }
    sync();
  });
  el("yoloeImageSize").addEventListener("change", () => { profile = null; clearPreview(); drawPreview(); });
  shape.addEventListener("change", stopDrawing);
  el<HTMLSelectElement>("yoloeExampleClass").addEventListener("change", () => {
    sampleName.value = state.session.classNames.get(el<HTMLSelectElement>("yoloeExampleClass").value) ?? "sampleA";
  });
  modelSelect.addEventListener("change", () => {
    profile = null; clearPreview(); sync(); drawPreview();
    if (!readyModels.includes(modelSelect.value)) message(status, `Run npm.cmd run yoloe:prepare -- --model ${modelSelect.value}, then reconnect.`);
    else status.hidden = true;
  });
  nameInput.addEventListener("input", () => { clearPreview(); drawPreview(); });
  for (const id of ["yoloeConfidenceInput", "yoloeIouInput"]) el(id).addEventListener("input", () => { clearPreview(); drawPreview(); });
  const prepare = async (signal: AbortSignal): Promise<YoloeProfile> => {
    if (!connected) await connect(signal);
    if (!readyModels.includes(modelSelect.value)) throw new Error(`Run npm.cmd run yoloe:prepare -- --model ${modelSelect.value}, then reconnect.`);
    if (profile) return profile;
    if (!examples.length) throw new Error("Outline a sample first.");
    const source = state.session.imageFolderHandle;
    profile = null; clearPreview();
    const references = [...new Set(examples.map((e) => e.sourceImage))].map((image) => ({
      image: imagePng(image, documentRef),
      examples: examples.filter((e) => e.sourceImage === image).map(({ sourceImage, sourceName, ...example }) => example)
    }));
    const result = await requestYoloe<YoloeProfile>("prepare", { model: modelSelect.value, workflow, references, imgsz: Number(el<HTMLSelectElement>("yoloeImageSize").value) }, signal);
    signal.throwIfAborted();
    if (source !== state.session.imageFolderHandle) throw new Error("Dataset changed. Register the examples again.");
    profile = result; sourceFolder = source;
    renderExamples();
    return result;
  };
  const runPreview = (inSetup: boolean): void => { void work("YOLOE preview", async (signal) => {
    const image = inSetup ? sampleImage! : state.session.currentImage!;
    const imageName = inSetup ? sampleImageName : state.session.currentImageFile!.name;
    const currentProfile = await prepare(signal);
    clearPreview(); drawPreview();
    const [confidence, iou] = parameters();
    const prediction = await inferYoloe(image, documentRef, currentProfile, confidence, iou, signal);
    signal.throwIfAborted();
    if (inSetup ? image !== sampleImage : image !== state.session.currentImage) throw new Error("Image changed. Preview the current image again.");
    let maskCanvas: HTMLCanvasElement | null = null;
    if (prediction.mask) {
      maskCanvas = documentRef.createElement("canvas"); maskCanvas.width = prediction.mask.width; maskCanvas.height = prediction.mask.height;
      const context = maskCanvas.getContext("2d")!, pixels = context.createImageData(maskCanvas.width, maskCanvas.height);
      const colors = new Map<number, number[]>();
      for (let i = 0; i < prediction.mask.mask.length; i++) {
        const id = prediction.mask.mask[i]!;
        if (!id) continue;
        if (!colors.has(id)) colors.set(id, getColorForClass(String(id)).slice(1).match(/../g)!.map((c) => Number.parseInt(c, 16)));
        const x = i % maskCanvas.width, mask = prediction.mask.mask;
        const boundary = x === 0 || x === maskCanvas.width - 1 || i < maskCanvas.width || i >= mask.length - maskCanvas.width
          || mask[i - 1] !== id || mask[i + 1] !== id || mask[i - maskCanvas.width] !== id || mask[i + maskCanvas.width] !== id;
        pixels.data.set(boundary ? [255, 255, 255, 255] : [...colors.get(id)!, 160], i * 4);
      }
      context.putImageData(pixels, 0, 0);
    }
    preview = { image, boxes: prediction.detections, maskCanvas };
    el<HTMLInputElement>("yoloeShowSampleResults").checked = true; drawPreview();
    message(status, `Preview · ${prediction.detections.length} ${prediction.mask ? "mask instance(s)" : "detection(s)"} · ${imageName} · labels unchanged`);
  }); };
  el("previewYoloeBtn").addEventListener("click", () => runPreview(false));
  el("previewYoloeSampleBtn").addEventListener("click", () => runPreview(true));
  const save = async (allImages: boolean): Promise<void> => {
    if (busy) return;
    let currentProfile: YoloeProfile | null = null;
    await work("Preparing samples", async (signal) => { currentProfile = await prepare(signal); });
    if (!currentProfile) return;
    const preparedProfile = currentProfile as YoloeProfile;
    try {
      const target = nameInput.value.trim();
      if (!/^[\p{L}\p{N}_-]{1,64}$/u.test(target)) throw new Error("Target set name: use 1–64 letters, numbers, underscores or hyphens.");
      const [confidence, iou] = parameters();
      busy = true; clearPreview(); sync();
      message(status, "Running YOLOE inference…");
      const options = { allImages, modelName: `${preparedProfile.model}-${target}`,
        classNames: new Map(Object.entries(preparedProfile.classes)),
        metadata: { engine: "yoloe26", workflow, checkpoint: `${preparedProfile.model}.pt`, backend: preparedProfile.backend, gpu: preparedProfile.gpu, targetSet: target,
          referenceImage: referenceName, referenceSha256: preparedProfile.referenceSha256, exampleCount: preparedProfile.exampleCount,
          referenceImages: [...new Set(examples.map((e) => e.sourceName))],
          samples: examples.map(({ sourceImage, sourceName, ...example }) => ({ ...example, referenceImage: sourceName })),
          imgsz: preparedProfile.imgsz, confidence, iou },
      };
      const infer = (image: HTMLImageElement, signal?: AbortSignal): Promise<YoloeResult> => inferYoloe(image, documentRef, preparedProfile, confidence, iou, signal);
      const result = workflow === "segmentation"
        ? await fileSystem.runSegmentationInference({ ...options, infer })
        : await fileSystem.runDetectionInference({ ...options, infer: async (image, signal) => (await infer(image, signal)).detections });
      message(status, result ? `${result.imageCount} image(s) · ${result.detectionCount} detection(s). Active: ${result.folderName}` : "Stopped. Completed results remain on disk.");
    } catch (error) { message(status, error instanceof Error ? error.message : String(error)); }
    finally { busy = false; sync(); }
  };
  el("saveYoloeCurrentBtn").addEventListener("click", () => { void save(el<HTMLSelectElement>("yoloeSaveScope").value === "all"); });
  canvasController.raw.canvas.on?.("after:render", drawPreview);
  const refresh = (): void => {
    sync(); drawPreview();
    if (!busy && !connectionAttempted && documentRef.querySelector(".app-workspace")?.getAttribute("data-active-task") === "yoloe") {
      connectionAttempted = true; void work("Connecting YOLOE", connect);
    }
  };
  const events = ["easy-labeling:document-status-change", "easy-labeling:image-change", "easy-labeling:label-source-change", "easy-labeling:workflow-change"];
  for (const event of events) documentRef.defaultView?.addEventListener(event, refresh);
  const observer = new MutationObserver(refresh);
  const workspace = documentRef.querySelector(".app-workspace");
  if (workspace) observer.observe(workspace, { attributes: true, attributeFilter: ["data-active-task"] });
  sync();
  return () => { operationController?.abort(); observer.disconnect(); sampleResize.disconnect(); setupModal.dispose?.(); documentRef.removeEventListener("keydown", keys, true); documentRef.removeEventListener("keyup", keyup, true); documentRef.defaultView?.removeEventListener("blur", releaseSpace); for (const event of events) documentRef.defaultView?.removeEventListener(event, refresh); clearPreview(); };
}
