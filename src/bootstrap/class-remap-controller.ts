import type { AppState } from "../app/state.js";
import { getCurrentDocumentStatus } from "../app/document-status.js";
import { summarizeClassRemap, type ClassRemapRule, type ClassRemapSummary } from "../domain/class-remap.js";
import { getColorForClass } from "../features/canvas/colors.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { ClassRemapPlan, RuntimeFileSystem } from "./file-system-adapter.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";

export function bindClassRemapControls(input: {
  state: AppState; documentRef: Document; canvasController: RuntimeCanvasController;
  fileSystem: RuntimeFileSystem; uiManager: RuntimeUiManager;
}): () => void {
  const { state, documentRef, canvasController, fileSystem, uiManager } = input;
  if (!documentRef.getElementById("openClassRemapBtn")) return () => {};
  const element = <T extends HTMLElement>(id: string) => documentRef.getElementById(id) as T;
  const windowRef = documentRef.defaultView!;
  const modalElement = element<HTMLElement>("classRemapModal");
  const modal = new windowRef.bootstrap.Modal(modalElement);
  const scope = element<HTMLSelectElement>("classRemapScope");
  const offsetMode = element<HTMLInputElement>("classRemapOffsetMode");
  const rows = element<HTMLElement>("classRemapRows");
  const counts = new Map<string, number>();
  const previewButton = element<HTMLButtonElement>("previewClassRemapBtn");
  const applyButton = element<HTMLButtonElement>("applyClassRemapBtn");
  const stopButton = element<HTMLButtonElement>("stopClassRemapBtn");
  const errorElement = element<HTMLElement>("classRemapError");
  let summary: ClassRemapSummary | null = null;
  let folderPlan: ClassRemapPlan | null = null;
  let rule: ClassRemapRule | null = null;
  let revision: number | undefined;
  let imageName: string | undefined;
  let folder: FileSystemDirectoryHandle | null = null;
  let request = 0;
  let busy = false;
  let controller: AbortController | null = null;
  const invalidate = () => {
    request++;
    summary = null; folderPlan = null; rule = null;
    applyButton.disabled = true;
    element<HTMLElement>("classRemapPreview").hidden = true;
    errorElement.hidden = true;
  };
  const updateFields = () => {
    element<HTMLElement>("classRemapOffsetFields").hidden = !offsetMode.checked;
    element<HTMLElement>("classRemapMappingFields").hidden = offsetMode.checked;
    element<HTMLElement>("classRemapTarget").textContent = scope.value === "folder"
      ? `${state.session.labelFolderHandle?.name ?? "No label folder"} · ${state.session.imageFiles.length} images. Current edits are included; original TXT files are backed up before saving.`
      : `${state.session.currentImageFile?.name ?? "No image"} · All boxes, including hidden classes. Undo is available; use Save to write the result.`;
  };
  const setBusy = (value: boolean) => {
    busy = value;
    modalElement.setAttribute("aria-busy", String(value));
    modalElement.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>("input, select, button").forEach((control) => {
      if (control !== stopButton) control.disabled = value;
    });
    stopButton.hidden = !value;
    stopButton.disabled = false;
    applyButton.disabled = value || !summary?.changedCount;
  };
  const reportError = (error: unknown) => {
    invalidate();
    errorElement.textContent = error instanceof Error ? error.message : String(error);
    errorElement.hidden = false;
  };
  const updateCount = (row: HTMLTableRowElement) => {
    const value = row.querySelector<HTMLInputElement>('[data-remap="from"]')!.value.trim();
    row.querySelector<HTMLElement>('[data-remap="count"]')!.textContent = (value ? counts.get(String(Number(value))) ?? 0 : 0).toLocaleString();
  };
  const classCell = (value: string, inputLabel?: string, field?: string) => {
    const cell = documentRef.createElement("td");
    cell.innerHTML = '<div class="class-remap-class"><span class="class-remap-swatch" aria-hidden="true"></span><span class="class-remap-name"></span></div>';
    const identity = cell.firstElementChild!;
    const id = documentRef.createElement(inputLabel ? "input" : "span");
    id.className = "class-remap-id";
    identity.prepend(id);
    const update = (value: string) => {
      const valid = /^\d+$/.test(value) && Number.isSafeInteger(Number(value));
      const classId = String(Number(value));
      const name = cell.querySelector<HTMLElement>(".class-remap-name")!;
      name.textContent = valid ? state.session.classNames.get(classId) ?? "Unnamed class" : "Enter an ID";
      name.title = name.textContent;
      const swatch = cell.querySelector<HTMLElement>(".class-remap-swatch")!;
      swatch.hidden = !valid;
      swatch.style.backgroundColor = valid ? getColorForClass(classId) : "";
      swatch.title = valid ? `Class color: ${getColorForClass(classId)}` : "";
    };
    if (id instanceof windowRef.HTMLInputElement) {
      id.type = "number"; id.min = "0"; id.step = "1"; id.value = value;
      id.classList.add("form-control", "form-control-sm");
      id.setAttribute("aria-label", inputLabel!);
      id.dataset.remap = field;
      id.addEventListener("input", () => update(id.value.trim()));
    } else id.textContent = value;
    update(value);
    return cell;
  };
  const addRow = (classId = "") => {
    const row = documentRef.createElement("tr");
    row.innerHTML = '<td class="class-remap-count-cell"><span class="class-remap-count"><strong data-remap="count"></strong><span>boxes</span></span></td><td class="class-remap-action"><button type="button" class="btn btn-outline-secondary btn-sm" aria-label="Remove mapping" title="Remove this mapping row"><i class="bi bi-trash3" aria-hidden="true"></i> Remove</button></td>';
    row.prepend(classCell(classId, "Original class ID", "from"), classCell(classId, "New class ID", "to"));
    row.querySelector<HTMLInputElement>('[data-remap="from"]')!.addEventListener("input", () => updateCount(row));
    updateCount(row);
    row.querySelector("button")!.addEventListener("click", () => { row.remove(); invalidate(); });
    rows.append(row);
    invalidate();
  };
  const readRule = (): ClassRemapRule => {
    if (offsetMode.checked) {
      const value = element<HTMLInputElement>("classRemapOffset").value.trim();
      if (!/^[+-]?\d+$/.test(value)) throw new Error("Enter a whole-number offset, such as 3 or -3.");
      return { mode: "offset", offset: Number(value) };
    }
    return { mode: "mapping", mapping: [...rows.querySelectorAll("tr")].map((row) => ({
      from: row.querySelector<HTMLInputElement>('[data-remap="from"]')!.value,
      to: row.querySelector<HTMLInputElement>('[data-remap="to"]')!.value
    })) };
  };
  element<HTMLButtonElement>("openClassRemapBtn").addEventListener("click", () => {
    if (state.session.workflow !== "detection" || !state.session.currentImage) return;
    counts.clear();
    for (const rect of canvasController.raw.getObjects("rect")) {
      const classId = String(Number(rect.labelClass ?? "0"));
      counts.set(classId, (counts.get(classId) ?? 0) + 1);
    }
    rows.replaceChildren();
    for (const classId of [...counts.keys()].sort((a, b) => Number(a) - Number(b))) addRow(classId);
    element<HTMLInputElement>("classRemapMappingMode").checked = true;
    invalidate(); updateFields(); modal.show();
  });
  element<HTMLButtonElement>("addClassRemapRowBtn").addEventListener("click", () => addRow());
  modalElement.addEventListener("input", invalidate);
  modalElement.addEventListener("change", () => { invalidate(); updateFields(); });
  modalElement.addEventListener("hidden.bs.modal", () => { controller?.abort(); invalidate(); });
  stopButton.addEventListener("click", () => { controller?.abort(); stopButton.disabled = true; });
  previewButton.addEventListener("click", () => {
    if (busy) return;
    invalidate();
    const currentRequest = request;
    controller = new AbortController();
    const signal = controller.signal;
    setBusy(true);
    void (async () => {
      try {
        const candidate = readRule();
        revision = getCurrentDocumentStatus(state)?.revision;
        imageName = state.session.currentImageFile?.name;
        folder = state.session.labelFolderHandle;
        let result: ClassRemapSummary;
        let plan: ClassRemapPlan | null = null;
        if (scope.value === "folder") {
          if (!folder) throw new Error("Connect a Detection label folder first.");
          plan = await fileSystem.previewClassRemap(folder, candidate, signal);
          if (!plan || signal.aborted) return;
          result = plan;
        } else result = summarizeClassRemap(canvasController.raw.getObjects("rect").map((rect) => rect.labelClass ?? "0"), candidate);
        if (request !== currentRequest || signal.aborted) return;
        summary = result; rule = candidate; folderPlan = plan;
        element<HTMLElement>("classRemapSummary").textContent = `${result.changedCount.toLocaleString()} boxes will change${plan ? ` in ${plan.edits.length} images · ${plan.fileNames.length} images checked` : " in the current image"}.`;
        const previewRows = element<HTMLElement>("classRemapPreviewRows");
        previewRows.replaceChildren();
        for (const change of result.changes) {
          const row = documentRef.createElement("tr");
          row.append(classCell(change.from), classCell(change.to));
          const count = documentRef.createElement("td");
          count.className = "class-remap-count-cell";
          count.textContent = change.count.toLocaleString(); row.append(count);
          previewRows.append(row);
        }
        element<HTMLElement>("classRemapPreview").hidden = false;
      } catch (error) { reportError(error); }
      finally { controller = null; setBusy(false); }
    })();
  });
  applyButton.addEventListener("click", () => {
    if (busy || !summary?.changedCount || !rule) return;
    if (state.session.workflow !== "detection" || state.session.currentImageFile?.name !== imageName
      || state.session.labelFolderHandle !== folder || getCurrentDocumentStatus(state)?.revision !== revision) {
      reportError(new Error("Labels changed since preview. Preview again.")); return;
    }
    const plan = folderPlan;
    const currentRule = rule;
    const changedCount = summary.changedCount;
    if (plan && !windowRef.confirm(`Change ${changedCount.toLocaleString()} box class IDs in ${plan.edits.length} images of "${plan.folder.name}"?\n\nOriginal TXT files will be backed up. Current edits will be saved. Other label folders and Layout presets stay unchanged.`)) return;
    controller = new AbortController();
    const signal = controller.signal;
    setBusy(true);
    void (async () => {
      try {
        let message: string;
        if (plan) {
          const backup = await fileSystem.applyClassRemap(plan, signal);
          if (!backup || signal.aborted) { invalidate(); return; }
          message = `${changedCount.toLocaleString()} box class IDs saved. Originals: ${plan.folder.name}/${backup}`;
        } else {
          canvasController.raw.remapLabelClasses!(currentRule);
          windowRef.dispatchEvent(new Event("easy-labeling:history-change"));
          message = `${changedCount.toLocaleString()} box class IDs changed. Undo is available; use Save to write the result.`;
        }
        controller = null;
        modal.hide();
        uiManager.notify(message, 8000);
      } catch (error) { reportError(error); }
      finally { controller = null; setBusy(false); }
    })();
  });
  const events = ["easy-labeling:document-status-change", "easy-labeling:history-reset", "easy-labeling:workflow-change"];
  const contextChanged = (event: Event) => {
    if (event.type === "easy-labeling:history-reset" || state.session.workflow !== "detection"
      || state.session.currentImageFile?.name !== imageName || state.session.labelFolderHandle !== folder
      || getCurrentDocumentStatus(state)?.revision !== revision) invalidate();
    updateFields();
  };
  events.forEach((event) => windowRef.addEventListener(event, contextChanged));
  return () => { controller?.abort(); events.forEach((event) => windowRef.removeEventListener(event, contextChanged)); modal.dispose?.(); };
}
