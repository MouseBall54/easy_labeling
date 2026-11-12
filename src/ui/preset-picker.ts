// Tree picker over a preset <select>: a button shaped like the select opens a menu with a search box, favourites,
// recent choices and the presets grouped by profile subfolder (an option's data-folder). The <select> stays the
// source of truth: the picker sets its value and fires "change", and redraws when the app changes its options or
// value, so the code that fills and reads the select is unchanged. The select stays in the page, visually hidden.
import { buildPresetRows, folderAncestors, pushRecent, type PresetEntry, type PresetRow } from "../domain/presets/preset-tree.js";
import type { ProfilePresetKind } from "../features/presets/profile-presets.js";

/** The preset selects that get a picker, with the key their favourites and recent choices are kept under. */
export const PRESET_PICKER_SELECTS = [
  ["segmentationPreprocessPresetSelect", "preprocessing"],
  ["segmentationToolPresetSelect", "segmentation"],
  ["refineRunPresetSelect", "refine"],
  ["refineReclassPresetSelect", "reclass"],
  ["boxLayoutSelect", "layout"],
  ["templateLayoutSelect", "layout"],
  ["automationPresetSelect", "preset"],
  ["templatePresetSelect", "preset"]
] as const;

const STORAGE_PREFIX = "easyLabeling.presetPicker.";

interface PickerMemory {
  favorites: string[];
  recent: string[];
  expanded: string[];
}

export function attachPresetPickers(documentRef: Document, windowRef: Window): void {
  for (const [id, key] of PRESET_PICKER_SELECTS) {
    const select = documentRef.getElementById(id);
    if (select instanceof HTMLSelectElement && !select.dataset.presetPicker) attachPresetPicker(select, key, documentRef, windowRef);
  }
}

function attachPresetPicker(select: HTMLSelectElement, key: ProfilePresetKind, documentRef: Document, windowRef: Window): void {
  select.dataset.presetPicker = key;
  select.classList.add("preset-picker-native");
  select.tabIndex = -1;
  select.setAttribute("aria-hidden", "true");

  const button = documentRef.createElement("button");
  button.type = "button";
  button.className = `${[...select.classList].filter((name) => name.startsWith("form-select") || name === "mb-2").join(" ")} preset-picker-button`;
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");
  const label = select.getAttribute("aria-label");
  if (label) button.setAttribute("aria-label", label);
  const text = documentRef.createElement("span");
  text.className = "preset-picker-label";
  const folderText = documentRef.createElement("span");
  folderText.className = "preset-picker-folder";
  button.append(text, folderText);
  select.after(button);

  const memory = readMemory(windowRef, key);
  let menu: HTMLDivElement | null = null;
  let search: HTMLInputElement | null = null;
  let list: HTMLDivElement | null = null;
  let rows: PresetRow[] = [];
  let active = -1;
  let query = "";
  const expanded = new Set(memory.expanded);

  const entries = (): PresetEntry[] => [...select.options].map((option) => ({
    value: option.value,
    label: option.text,
    folder: option.dataset.folder ?? "",
    title: option.title || undefined
  }));

  const syncButton = (): void => {
    const option = select.selectedOptions[0];
    text.textContent = option?.text ?? "";
    const folder = option?.dataset.folder ?? "";
    folderText.textContent = folder ? folder.replace(/\//g, " / ") : "";
    button.disabled = select.disabled;
    button.title = select.title || option?.title || (folder ? `${folder}/${option?.text ?? ""}` : "");
  };

  const choose = (value: string): void => {
    if (value) {
      memory.recent = pushRecent(memory.recent, value);
      writeMemory(windowRef, key, memory);
    }
    close();
    button.focus();
    if (select.value === value) return;
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const render = (): void => {
    if (!list) return;
    rows = buildPresetRows(entries(), { query, expanded, favorites: memory.favorites, recent: memory.recent });
    const pickable = rows.flatMap((row, index) => (row.kind === "heading" ? [] : [index]));
    if (!pickable.includes(active)) {
      const selected = rows.findIndex((row) => row.kind === "preset" && row.entry.value === select.value && !row.showFolder);
      active = selected >= 0 ? selected : pickable[0] ?? -1;
    }
    list.replaceChildren(...rows.map((row, index) => renderRow(row, index)));
    list.querySelector(".active")?.scrollIntoView?.({ block: "nearest" });
  };

  const renderRow = (row: PresetRow, index: number): HTMLElement => {
    const item = documentRef.createElement("div");
    if (row.kind === "heading") {
      item.className = "preset-picker-heading";
      item.textContent = row.label;
      return item;
    }
    item.className = `preset-picker-row${index === active ? " active" : ""}`;
    item.style.paddingLeft = `${0.6 + (row.depth * 1.1)}rem`;
    item.dataset.index = String(index);
    if (row.kind === "folder") {
      item.classList.add("preset-picker-folder-row");
      item.setAttribute("role", "treeitem");
      item.setAttribute("aria-expanded", String(row.expanded));
      item.innerHTML = `<i class="bi ${row.expanded ? "bi-folder2-open" : "bi-folder"}" aria-hidden="true"></i>`;
      item.append(documentRef.createTextNode(` ${row.label}`));
      return item;
    }
    const chosen = row.entry.value === select.value;
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", String(chosen));
    if (chosen) item.classList.add("chosen");
    if (row.entry.title) item.title = row.entry.title;
    const name = documentRef.createElement("span");
    name.className = "preset-picker-name";
    name.textContent = row.entry.label;
    item.append(name);
    if (row.showFolder && row.entry.folder) {
      const where = documentRef.createElement("span");
      where.className = "preset-picker-path";
      where.textContent = row.entry.folder.replace(/\//g, " / ");
      item.append(where);
    }
    if (row.entry.value) {
      const star = documentRef.createElement("button");
      star.type = "button";
      star.tabIndex = -1;
      star.className = `preset-picker-star${row.favorite ? " on" : ""}`;
      star.title = row.favorite ? "Remove from favorites" : "Add to favorites";
      star.innerHTML = `<i class="bi ${row.favorite ? "bi-star-fill" : "bi-star"}" aria-hidden="true"></i>`;
      star.dataset.favorite = row.entry.value;
      item.append(star);
    }
    return item;
  };

  const activate = (index: number): void => {
    const row = rows[index];
    if (!row || row.kind === "heading") return;
    active = index;
    if (row.kind === "folder") {
      toggleFolder(row.path, !row.expanded);
      return;
    }
    choose(row.entry.value);
  };

  const toggleFolder = (path: string, open: boolean): void => {
    if (open) expanded.add(path);
    else expanded.delete(path);
    memory.expanded = [...expanded];
    writeMemory(windowRef, key, memory);
    render();
  };

  const move = (step: number): void => {
    const pickable = rows.flatMap((row, index) => (row.kind === "heading" ? [] : [index]));
    if (!pickable.length) return;
    const at = pickable.indexOf(active);
    active = pickable[Math.max(0, Math.min(pickable.length - 1, at < 0 ? 0 : at + step))]!;
    render();
  };

  const onKey = (event: KeyboardEvent): void => {
    const row = rows[active];
    if (event.key === "ArrowDown" || event.key === "ArrowUp") move(event.key === "ArrowDown" ? 1 : -1);
    else if (event.key === "Enter") activate(active);
    else if (event.key === "Escape") { close(); button.focus(); }
    else if (row?.kind === "folder" && !query && (event.key === "ArrowRight" || event.key === "ArrowLeft")) toggleFolder(row.path, event.key === "ArrowRight");
    else return;
    event.preventDefault();
    event.stopPropagation();
  };

  const position = (): void => {
    if (!menu) return;
    const rect = button.getBoundingClientRect();
    const width = Math.max(rect.width, 260);
    const below = windowRef.innerHeight - rect.bottom;
    menu.style.width = `${width}px`;
    menu.style.left = `${Math.max(8, Math.min(rect.left, windowRef.innerWidth - width - 8))}px`;
    if (below < 240 && rect.top > below) {
      menu.style.top = "";
      menu.style.bottom = `${windowRef.innerHeight - rect.top + 2}px`;
      menu.style.maxHeight = `${Math.min(420, rect.top - 8)}px`;
    } else {
      menu.style.bottom = "";
      menu.style.top = `${rect.bottom + 2}px`;
      menu.style.maxHeight = `${Math.min(420, below - 8)}px`;
    }
  };

  const onOutside = (event: Event): void => {
    if (menu && !menu.contains(event.target as Node) && !button.contains(event.target as Node)) close();
  };
  const onViewportChange = (event: Event): void => {
    if (menu && !menu.contains(event.target as Node)) close();
  };

  const open = (): void => {
    if (menu || select.disabled) return;
    // Another picker of the same kind may have changed the shared favourites.
    Object.assign(memory, readMemory(windowRef, key));
    memory.expanded.forEach((path) => expanded.add(path));
    // Some selects refresh their options on pointerdown (preprocessing presets rescan the profile folder).
    select.dispatchEvent(new Event("pointerdown"));
    query = "";
    active = -1;
    folderAncestors(select.selectedOptions[0]?.dataset.folder ?? "").forEach((path) => expanded.add(path));
    menu = documentRef.createElement("div");
    // Not .dropdown-menu: Bootstrap's keyboard handler would treat it as one of its dropdowns.
    menu.className = "preset-picker-menu";
    search = documentRef.createElement("input");
    search.type = "search";
    search.className = "form-control form-control-sm preset-picker-search";
    search.placeholder = "Search presets";
    search.setAttribute("aria-label", "Search presets");
    list = documentRef.createElement("div");
    list.className = "preset-picker-list";
    list.setAttribute("role", "tree");
    menu.append(search, list);
    // Desktop: the profile folder can be organised (move presets, folders, where new ones are saved).
    if (typeof (windowRef as { getEasyLabelingProfileDirectory?: unknown }).getEasyLabelingProfileDirectory === "function") {
      const manage = documentRef.createElement("button");
      manage.type = "button";
      manage.className = "btn btn-sm btn-link preset-picker-manage";
      manage.innerHTML = `<i class="bi bi-folder2" aria-hidden="true"></i> Manage folders…`;
      manage.title = "Move presets between folders, create folders and choose where new presets are saved";
      manage.addEventListener("click", () => {
        close();
        // Loaded on first use, like the Refine Lab.
        void import("./preset-manager.js").then(({ openPresetManager }) => openPresetManager(documentRef, windowRef, key));
      });
      menu.append(manage);
    }
    documentRef.body.append(menu);
    position();
    render();
    search.focus();
    search.addEventListener("input", () => { query = search?.value ?? ""; active = -1; render(); });
    menu.addEventListener("keydown", onKey);
    // Clicks in the list keep the focus in the search box, so the keys keep working after a row redraws.
    list.addEventListener("pointerdown", (event) => event.preventDefault());
    list.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const star = target.closest<HTMLElement>(".preset-picker-star");
      if (star?.dataset.favorite) {
        const value = star.dataset.favorite;
        memory.favorites = memory.favorites.includes(value) ? memory.favorites.filter((item) => item !== value) : [...memory.favorites, value];
        writeMemory(windowRef, key, memory);
        render();
        return;
      }
      const row = target.closest<HTMLElement>(".preset-picker-row");
      if (row?.dataset.index) activate(Number(row.dataset.index));
    });
    documentRef.addEventListener("pointerdown", onOutside, true);
    windowRef.addEventListener("resize", onViewportChange);
    documentRef.addEventListener("scroll", onViewportChange, true);
    button.setAttribute("aria-expanded", "true");
  };

  function close(): void {
    if (!menu) return;
    menu.remove();
    menu = null;
    search = null;
    list = null;
    documentRef.removeEventListener("pointerdown", onOutside, true);
    windowRef.removeEventListener("resize", onViewportChange);
    documentRef.removeEventListener("scroll", onViewportChange, true);
    button.setAttribute("aria-expanded", "false");
  }

  button.addEventListener("click", () => (menu ? close() : open()));
  button.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      // Arrow keys would otherwise reach the canvas shortcuts and move boxes.
      event.preventDefault();
      event.stopPropagation();
      open();
    }
  });

  // The app fills the select and sets its value directly; follow both.
  new MutationObserver(() => { syncButton(); render(); }).observe(select, { childList: true, subtree: true, characterData: true, attributes: true });
  select.addEventListener("change", syncButton);
  // The app focuses the select (Automate opens on the preset); the visible control is the button.
  select.addEventListener("focus", () => button.focus());
  for (const property of ["value", "selectedIndex"] as const) {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, property);
    if (!descriptor?.set || !descriptor.get) continue;
    Object.defineProperty(select, property, {
      configurable: true,
      get() { return descriptor.get!.call(this); },
      set(next) { descriptor.set!.call(this, next); syncButton(); }
    });
  }
  syncButton();
}

function readMemory(windowRef: Window, key: string): PickerMemory {
  try {
    const stored = JSON.parse(windowRef.localStorage?.getItem(STORAGE_PREFIX + key) ?? "{}") as Partial<PickerMemory>;
    const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
    return { favorites: strings(stored.favorites), recent: strings(stored.recent), expanded: strings(stored.expanded) };
  } catch {
    return { favorites: [], recent: [], expanded: [] };
  }
}

function writeMemory(windowRef: Window, key: string, memory: PickerMemory): void {
  try { windowRef.localStorage?.setItem(STORAGE_PREFIX + key, JSON.stringify(memory)); } catch { /* storage unavailable: nothing remembered */ }
}
