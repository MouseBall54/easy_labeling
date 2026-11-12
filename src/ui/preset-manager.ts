// Desktop: the preset folder manager opened from a preset picker. Shows the kind's profile folder as a tree, moves
// preset files between subfolders (drag a file onto a folder, or Move to), creates folders, and picks the folder new
// presets are saved in. After a change it fires "easy-labeling:presets-changed" so each panel rereads its presets
// (their file names changed).
import {
  getPresetSaveFolder,
  openProfilePresetFolder,
  setPresetSaveFolder,
  type ProfilePresetKind,
  type ProfilePresetWindow
} from "../features/presets/profile-presets.js";

export const PRESETS_CHANGED_EVENT = "easy-labeling:presets-changed";

export const PRESET_KIND_LABELS: Record<ProfilePresetKind, string> = {
  preset: "Template matching presets",
  layout: "Layouts",
  refine: "Refine presets",
  reclass: "Reclass presets",
  preprocessing: "Preprocessing presets",
  segmentation: "Superpixel presets"
};

const TOP = "";

export async function openPresetManager(documentRef: Document, windowRef: Window & ProfilePresetWindow, kind: ProfilePresetKind): Promise<void> {
  const folder = await openProfilePresetFolder(windowRef, kind);
  if (!folder) return;
  const opener = documentRef.activeElement as HTMLElement | null;

  const backdrop = documentRef.createElement("div");
  backdrop.className = "modal-backdrop show";
  const modal = documentRef.createElement("div");
  modal.className = "modal show d-block preset-manager";
  modal.tabIndex = -1;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "presetManagerTitle");
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="presetManagerTitle"></h5>
          <button type="button" class="btn-close" data-action="close" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <label class="form-label small mb-1" for="presetManagerSaveFolder">Save new presets in</label>
          <select id="presetManagerSaveFolder" class="form-select form-select-sm mb-3"></select>
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="small text-muted flex-grow-1">Drag a preset onto a folder to move it.</span>
            <button type="button" class="btn btn-sm btn-outline-secondary" data-action="new-folder" title="Create a folder inside the selected one (a/b nests)"><i class="bi bi-folder-plus" aria-hidden="true"></i> New folder</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" data-action="rename-folder" title="Rename the selected folder"><i class="bi bi-pencil" aria-hidden="true"></i> Rename</button>
            <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete-folder" title="Remove the selected folder; its presets go to .trash in the profile folder"><i class="bi bi-trash" aria-hidden="true"></i> Delete</button>
          </div>
          <div class="preset-manager-tree" role="tree" aria-label="Preset folders"></div>
          <div class="input-group input-group-sm mt-2">
            <span class="input-group-text">Move selected to</span>
            <select class="form-select" data-role="move-target" aria-label="Folder to move the selected preset to"></select>
            <button type="button" class="btn btn-outline-primary" data-action="move">Move</button>
          </div>
          <div class="preset-manager-status small mt-2" role="status"></div>
        </div>
        <div class="modal-footer">
          <span class="small text-muted me-auto preset-manager-location"></span>
          <button type="button" class="btn btn-secondary btn-sm" data-action="close">Close</button>
        </div>
      </div>
    </div>`;
  documentRef.body.append(backdrop, modal);
  const query = <T extends HTMLElement>(selector: string) => modal.querySelector(selector) as T;
  query("#presetManagerTitle").textContent = PRESET_KIND_LABELS[kind];
  query(".preset-manager-location").textContent = `Documents / Easy Labeling / ${folder.name}`;
  const saveSelect = query<HTMLSelectElement>("#presetManagerSaveFolder");
  const moveSelect = query<HTMLSelectElement>("[data-role='move-target']");
  const tree = query<HTMLDivElement>(".preset-manager-tree");
  const status = query<HTMLDivElement>(".preset-manager-status");

  let selectedFile: string | null = null;
  let selectedFolder = TOP;

  const close = (): void => {
    documentRef.removeEventListener("keydown", onKey, true);
    modal.remove();
    backdrop.remove();
    opener?.focus?.();
  };
  const report = (message: string, error = false): void => {
    status.textContent = message;
    status.classList.toggle("text-danger", error);
  };

  const render = async (): Promise<void> => {
    const [folders, files] = await Promise.all([folder.folders(), folder.list()]);
    const fileNames = files.map((file) => file.fileName);
    if (selectedFile && !fileNames.includes(selectedFile)) selectedFile = null;
    if (selectedFolder && !folders.includes(selectedFolder)) selectedFolder = TOP;
    const saveFolder = getPresetSaveFolder(windowRef, kind);
    fillFolderOptions(saveSelect, folders, folders.includes(saveFolder) ? saveFolder : TOP);
    fillFolderOptions(moveSelect, folders, moveSelect.value && folders.includes(moveSelect.value) ? moveSelect.value : TOP);
    tree.replaceChildren(...treeRows(documentRef, folders, fileNames, selectedFile, selectedFolder));
    const folderChosen = !selectedFile && selectedFolder !== TOP;
    query<HTMLButtonElement>("[data-action='rename-folder']").disabled = !folderChosen;
    query<HTMLButtonElement>("[data-action='delete-folder']").disabled = !folderChosen;
  };

  /** Keeps the save folder pointing at the same place after `from` is renamed to `to` (null: removed). */
  const followSaveFolder = (from: string, to: string | null): void => {
    const current = getPresetSaveFolder(windowRef, kind);
    if (current !== from && !current.startsWith(`${from}/`)) return;
    setPresetSaveFolder(windowRef, kind, to === null ? TOP : to + current.slice(from.length));
  };
  const failed = (error: unknown): void => report(error instanceof Error ? error.message : String(error), true);

  const changed = async (message: string): Promise<void> => {
    report(message);
    await render();
    windowRef.dispatchEvent(new CustomEvent(PRESETS_CHANGED_EVENT, { detail: { kind } }));
  };

  const move = async (fileName: string, target: string): Promise<void> => {
    try {
      const moved = await folder.move(fileName, target);
      if (moved === fileName) return;
      selectedFile = moved;
      await changed(`Moved ${baseName(fileName)} to ${target || "the top folder"}.`);
    } catch (error: unknown) {
      report(error instanceof Error ? error.message : String(error), true);
    }
  };

  modal.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const action = target.closest<HTMLElement>("[data-action]")?.dataset.action;
    if (action === "close" || target === modal) return close();
    if (action === "new-folder") {
      const name = windowRef.prompt?.(`New folder in ${selectedFolder || "the top folder"} (a/b nests):`, "")?.trim();
      if (!name) return;
      void folder.createFolder(selectedFolder ? `${selectedFolder}/${name}` : name)
        .then((created) => { selectedFolder = created; return changed(`Created ${created}.`); })
        .catch((error: unknown) => report(error instanceof Error ? error.message : String(error), true));
      return;
    }
    if (action === "rename-folder" && selectedFolder) {
      const from = selectedFolder;
      const name = windowRef.prompt?.(`Rename folder "${from}" to:`, from.slice(from.lastIndexOf("/") + 1))?.trim();
      if (!name) return;
      void folder.renameFolder(from, name)
        .then((renamed) => {
          if (renamed === from) return;
          followSaveFolder(from, renamed);
          selectedFolder = renamed;
          return changed(`Renamed ${from} to ${renamed}.`);
        })
        .catch(failed);
      return;
    }
    if (action === "delete-folder" && selectedFolder) {
      const from = selectedFolder;
      if (!(windowRef.confirm?.(`Delete folder "${from}"? Its presets are moved to .trash in ${folder.name}.`) ?? false)) return;
      void folder.removeFolder(from)
        .then((count) => {
          followSaveFolder(from, null);
          selectedFolder = folderOf(from);
          return changed(count ? `Deleted ${from}; ${count} preset${count === 1 ? "" : "s"} moved to .trash.` : `Deleted ${from}.`);
        })
        .catch(failed);
      return;
    }
    if (action === "move") {
      if (!selectedFile) return report("Select a preset first.", true);
      void move(selectedFile, moveSelect.value);
      return;
    }
    const row = target.closest<HTMLElement>(".preset-manager-row");
    if (!row) return;
    if (row.dataset.file) {
      selectedFile = row.dataset.file;
      selectedFolder = folderOf(row.dataset.file);
    } else {
      selectedFile = null;
      selectedFolder = row.dataset.folder ?? TOP;
    }
    void render();
  });
  // On the document: a button that turns disabled after an action drops the focus out of the dialog.
  const onKey = (event: KeyboardEvent): void => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    close();
  };
  documentRef.addEventListener("keydown", onKey, true);
  saveSelect.addEventListener("change", () => {
    setPresetSaveFolder(windowRef, kind, saveSelect.value);
    report(`New presets go to ${saveSelect.value || "the top folder"}.`);
  });

  tree.addEventListener("dragstart", (event) => {
    const file = (event.target as HTMLElement).closest<HTMLElement>("[data-file]")?.dataset.file;
    if (file) event.dataTransfer?.setData("text/x-easy-labeling-preset", file);
  });
  tree.addEventListener("dragover", (event) => {
    const row = (event.target as HTMLElement).closest<HTMLElement>("[data-folder]");
    if (!row || !event.dataTransfer?.types.includes("text/x-easy-labeling-preset")) return;
    event.preventDefault();
    tree.querySelectorAll(".drop-target").forEach((item) => item.classList.remove("drop-target"));
    row.classList.add("drop-target");
  });
  tree.addEventListener("dragleave", (event) => (event.target as HTMLElement).closest(".drop-target")?.classList.remove("drop-target"));
  tree.addEventListener("drop", (event) => {
    const row = (event.target as HTMLElement).closest<HTMLElement>("[data-folder]");
    const file = event.dataTransfer?.getData("text/x-easy-labeling-preset");
    tree.querySelectorAll(".drop-target").forEach((item) => item.classList.remove("drop-target"));
    if (!row || !file) return;
    event.preventDefault();
    void move(file, row.dataset.folder ?? TOP);
  });

  await render();
  modal.focus();
}

function treeRows(documentRef: Document, folders: readonly string[], files: readonly string[], selectedFile: string | null, selectedFolder: string): HTMLElement[] {
  const rows: HTMLElement[] = [];
  const row = (label: string, depth: number, icon: string): HTMLDivElement => {
    const item = documentRef.createElement("div");
    item.className = "preset-manager-row";
    item.style.paddingLeft = `${0.5 + (depth * 1.2)}rem`;
    item.innerHTML = `<i class="bi ${icon}" aria-hidden="true"></i>`;
    item.append(documentRef.createTextNode(` ${label}`));
    rows.push(item);
    return item;
  };
  const top = row("Top folder", 0, "bi-folder2-open");
  top.dataset.folder = TOP;
  top.setAttribute("role", "treeitem");
  if (!selectedFile && selectedFolder === TOP) top.classList.add("selected");
  const walk = (path: string, depth: number): void => {
    for (const child of folders.filter((candidate) => folderOf(candidate) === path)) {
      const item = row(child.slice(child.lastIndexOf("/") + 1), depth, "bi-folder");
      item.dataset.folder = child;
      item.setAttribute("role", "treeitem");
      item.title = child;
      if (!selectedFile && selectedFolder === child) item.classList.add("selected");
      walk(child, depth + 1);
    }
    for (const file of files.filter((candidate) => folderOf(candidate) === path)) {
      const item = row(baseName(file).replace(/\.json$/i, ""), depth, "bi-file-earmark-text");
      item.dataset.file = file;
      item.draggable = true;
      item.title = file;
      item.setAttribute("role", "treeitem");
      if (file === selectedFile) item.classList.add("selected");
    }
  };
  walk(TOP, 1);
  return rows;
}

function fillFolderOptions(select: HTMLSelectElement, folders: readonly string[], selected: string): void {
  select.replaceChildren(new Option("Top folder", TOP), ...folders.map((path) => new Option(path.replace(/\//g, " / "), path)));
  select.value = selected;
}

const folderOf = (path: string): string => (path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : TOP);
const baseName = (path: string): string => path.slice(path.lastIndexOf("/") + 1);

