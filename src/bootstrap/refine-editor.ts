// Refine settings editor (class chips, presets, per-side rules, parameters). Mounted twice: the Refine
// inspector pane edits the live settings, the Refine Lab edits a draft that is only saved on demand.
import { REFINE_SIDE_RULE_KEYS, REFINE_SIDES, sideParams, type RefineParams, type RefineSide } from "../domain/refine/edge-refine.js";
import {
  applyRefinePreset,
  createRefineSettings,
  deleteRefinePreset,
  importRefinePresets,
  refineOverriddenKeys,
  resetRefineSettings,
  resolveRefineParams,
  saveRefinePreset,
  serializeRefinePresets,
  sideHasOwnRule,
  updateRefineSettings,
  type RefineParamsPatch,
  type RefineSettingsDocument
} from "../domain/refine/settings.js";
import { getColorForClass } from "../features/canvas/colors.js";

export interface RefineEditorStore {
  getDoc(): RefineSettingsDocument;
  setDoc(doc: RefineSettingsDocument): void;
  classIds(): string[];
  className(classId: string): string | undefined;
  notify(message: string): void;
}

/** "all" edits the rule every side shares; a side edits that side's own rule only. */
export type RefineEditScope = "all" | RefineSide;

export interface RefineEditor {
  render(): void;
  scope(): RefineEditScope;
  setScope(scope: RefineEditScope): void;
  onScopeChange(listener: (scope: RefineEditScope) => void): void;
  /** "default" or the selected class ids, sorted. */
  targets(): "default" | string[];
  setTargets(classIds: readonly string[]): void;
  onTargetsChange(listener: () => void): void;
}

type FieldKey = Exclude<keyof RefineParams, "sides">;
interface FieldSpec {
  key: FieldKey;
  label: string;
  title?: string;
  type: "bool" | "select" | "int" | "num" | "pct";
  group: "rule" | "context" | "advanced";
  /** Can be set for a single side. */
  perSide?: boolean;
  options?: [string, string][];
  min?: number;
  max?: number;
  step?: number;
}

export const REFINE_CRITERION_LABELS: Record<string, string> = {
  grad: "Max gradient", flank: "Bright band outer 50%", peak: "Bright band centre", thr: "50% contrast level"
};
const FIELDS: FieldSpec[] = [
  { key: "enabled", label: "Refine this class", type: "bool", group: "rule" },
  { key: "crit", label: "Edge criterion", type: "select", group: "rule", perSide: true, options: Object.entries(REFINE_CRITERION_LABELS) },
  {
    key: "polarity", label: "Edge polarity", type: "select", group: "rule", perSide: true,
    title: "Brightness change crossing the edge, from inside the box to outside. Auto reads it from the background ring.",
    options: [["auto", "Auto (detect)"], ["brightInside", "Bright → dark"], ["darkInside", "Dark → bright"]]
  },
  { key: "comb", label: "Combine segments", type: "select", group: "rule", perSide: true, options: [["outer", "Outermost"], ["median", "Median"]] },
  { key: "rangeIn", label: "Search inward (px)", type: "int", group: "rule", perSide: true, min: 1, max: 80, step: 1 },
  { key: "rangeOut", label: "Search outward (px)", type: "int", group: "rule", perSide: true, min: 1, max: 80, step: 1 },
  { key: "sigma", label: "Smoothing σ", type: "num", group: "rule", perSide: true, min: 0, max: 6, step: 0.2 },
  { key: "contextRing", label: "Background ring (px)", title: "0 turns surrounding brightness off", type: "int", group: "context", min: 0, max: 40, step: 1 },
  { key: "avoidNeighbors", label: "Stop halfway to neighbours", type: "bool", group: "context" },
  { key: "peerTolerance", label: "Row/column tolerance (px)", title: "0 turns row/column alignment flags off", type: "num", group: "context", min: 0, max: 50, step: 0.5 },
  { key: "segments", label: "Segments per side", type: "int", group: "advanced", perSide: true, min: 1, max: 30, step: 1 },
  { key: "inset", label: "Corner inset (%)", type: "pct", group: "advanced", perSide: true, min: 0, max: 40, step: 1 },
  { key: "iterations", label: "Iterations", type: "int", group: "advanced", min: 1, max: 4, step: 1 },
  { key: "reviewBelow", label: "Flag below confidence", type: "num", group: "advanced", min: 0, max: 1, step: 0.05 },
  { key: "autoOnDraw", label: "Refine new boxes on draw", type: "bool", group: "advanced" }
];
const SIDE_OPTIONS: [string, string][] = [["inherit", "Inherit"], ["grad", "Gradient"], ["flank", "Band 50%"], ["peak", "Band peak"], ["thr", "50% level"], ["off", "Off"]];
const SIDE_NAMES: Record<RefineSide, string> = { T: "Top", L: "Left", R: "Right", B: "Bottom" };
const RESET_ICON = '<i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>';

function markup(prefix: string): string {
  const slot = (side: RefineSide): string => `
    <div class="refine-side-slot" data-side="${side}">
      <label class="refine-side-label" for="${prefix}Side${side}">${SIDE_NAMES[side]}</label>
      <select id="${prefix}Side${side}" class="form-select form-select-sm"></select>
      <button type="button" class="panel-icon-button refine-field-reset" title="Use the default value" aria-label="${SIDE_NAMES[side]} edge: use the default value">${RESET_ICON}</button>
    </div>`;
  return `
    <section class="inspector-section">
      <div class="section-heading-row">
        <h3>Classes</h3>
        <div class="compact-icon-group" role="group" aria-label="Class selection">
          <button type="button" class="panel-icon-button" data-act="all" title="Edit all classes together" aria-label="Edit all classes together"><i class="bi bi-check2-all" aria-hidden="true"></i></button>
          <button type="button" class="panel-icon-button" data-act="reset" title="Reset the edited classes (or the default) to initial values" aria-label="Reset edited settings">${RESET_ICON}</button>
        </div>
      </div>
      <div class="refine-class-chips" data-ref="chips" role="group" aria-label="Classes to edit"></div>
      <p class="refine-hint" data-ref="hint"></p>
    </section>
    <section class="inspector-section">
      <div class="section-heading-row">
        <h3>Presets</h3>
        <div class="compact-icon-group" role="group" aria-label="Preset files">
          <button type="button" class="panel-icon-button" data-act="export" title="Save presets to a file" aria-label="Save presets to a file"><i class="bi bi-download" aria-hidden="true"></i></button>
          <button type="button" class="panel-icon-button" data-act="import" title="Load presets from a file" aria-label="Load presets from a file"><i class="bi bi-upload" aria-hidden="true"></i></button>
        </div>
      </div>
      <div class="input-group input-group-sm">
        <select class="form-select" data-ref="presetSelect" aria-label="Refine preset"></select>
        <button type="button" class="btn btn-outline-primary" data-act="applyPreset" title="Apply to the edited classes (or the default)">Apply</button>
        <button type="button" class="btn btn-outline-danger" data-act="deletePreset" title="Delete the chosen preset" aria-label="Delete the chosen preset"><i class="bi bi-trash" aria-hidden="true"></i></button>
      </div>
      <div class="input-group input-group-sm mt-1">
        <input type="text" class="form-control" data-ref="presetName" placeholder="Preset name" aria-label="New preset name" maxlength="60">
        <button type="button" class="btn btn-outline-secondary" data-act="savePreset" title="Save the edited values as a preset">Save</button>
      </div>
      <input type="file" accept=".json,application/json" data-ref="presetFile" hidden>
    </section>
    <section class="inspector-section">
      <div class="section-heading-row"><h3>Edges</h3><span class="section-value">Click a side to edit it alone</span></div>
      <div class="refine-side-editor">
        <div class="refine-side-box" data-ref="sideBox" title="Click a side to edit its own rule; click the centre for all sides"></div>
        ${(["T", "L", "R", "B"] as RefineSide[]).map(slot).join("")}
      </div>
    </section>
    <section class="inspector-section">
      <div class="section-heading-row"><h3>Edge rule</h3></div>
      <div class="refine-scope" role="group" aria-label="Sides this rule applies to" data-ref="scope">
        <button type="button" data-scope="all" title="Rule shared by every side">All sides</button>
        ${(["T", "L", "R", "B"] as RefineSide[]).map((side) => `<button type="button" data-scope="${side}" title="${SIDE_NAMES[side]} edge only">${SIDE_NAMES[side]}</button>`).join("")}
      </div>
      <div class="refine-scope-hint" data-ref="scopeHint">
        <span data-ref="scopeText"></span>
        <button type="button" class="btn btn-link btn-sm" data-act="sideToAll" title="Make every side use this side's rule">Use for all sides</button>
        <button type="button" class="btn btn-link btn-sm" data-act="clearSides" title="Remove every side's own rule">Clear side rules</button>
      </div>
      <div class="refine-fields" data-group="rule"></div>
    </section>
    <details class="inspector-section advanced-disclosure refine-details" data-ref="contextDetails" open>
      <summary>Surroundings</summary>
      <div class="refine-fields" data-group="context"></div>
    </details>
    <details class="inspector-section advanced-disclosure refine-details">
      <summary>Advanced</summary>
      <div class="refine-fields" data-group="advanced"></div>
    </details>`;
}

export function createRefineEditor(input: {
  root: HTMLElement;
  prefix: string;
  documentRef: Document;
  windowRef: Window;
  store: RefineEditorStore;
}): RefineEditor {
  const { root, prefix, documentRef: doc, windowRef, store } = input;
  root.innerHTML = markup(prefix);
  const ref = <T extends HTMLElement>(name: string): T => root.querySelector<T>(`[data-ref="${name}"]`)!;
  let selected = new Set<string>(); // empty = editing the default
  let scope: RefineEditScope = "all";
  const targetListeners: (() => void)[] = [];
  const scopeListeners: ((scope: RefineEditScope) => void)[] = [];
  const setScope = (next: RefineEditScope): void => {
    if (next === scope) return;
    scope = next;
    render();
    scopeListeners.forEach((listener) => listener(scope));
  };
  /** Value as the edited scope sees it (a side resolves its own rule over the class rule). */
  const valueOf = (p: RefineParams, key: FieldKey): unknown => (scope === "all" ? p[key] : sideParams(p, scope)[key]);

  const targets = (): "default" | string[] => selected.size ? [...selected].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b)) : "default";
  const editedParams = (): RefineParams[] => {
    const t = targets();
    const docNow = store.getDoc();
    return t === "default" ? [docNow.default] : t.map((classId) => resolveRefineParams(docNow, classId));
  };
  const setDoc = (next: RefineSettingsDocument): void => store.setDoc(next);
  const commit = (patch: RefineParamsPatch): void => setDoc(updateRefineSettings(store.getDoc(), targets(), patch));
  const commitField = (key: FieldKey, value: unknown): void => {
    if (scope === "all") commit({ [key]: value } as RefineParamsPatch);
    else if (key === "crit") commit({ sides: { [scope]: value } } as RefineParamsPatch);
    else commit({ sideRules: { [scope]: { [key]: value } } } as RefineParamsPatch);
  };
  const resetKeyFor = (key: FieldKey): string => (scope === "all" ? key : key === "crit" ? `sides.${scope}` : `sideRules.${scope}.${key}`);
  /** Whether the edited target holds its own value for this field in the current scope. */
  const isOverridden = (key: FieldKey): boolean => {
    const docNow = store.getDoc();
    const t = targets();
    if (scope === "all") return t !== "default" && t.some((classId) => key in (docNow.classes[classId] ?? {}));
    const side = scope;
    const patches = t === "default" ? [docNow.default] : t.map((classId) => docNow.classes[classId] ?? {});
    return patches.some((patch) => key === "crit"
      ? patch.sides?.[side] !== undefined && patch.sides[side] !== "inherit" && patch.sides[side] !== "off"
      : (patch.sideRules?.[side] as Record<string, unknown> | undefined)?.[key] !== undefined);
  };
  const targetsChanged = (): void => { render(); targetListeners.forEach((listener) => listener()); };

  // ---------------------------------------------------------------- classes
  const renderChips = (): void => {
    const docNow = store.getDoc();
    const ids = store.classIds();
    for (const classId of selected) if (!ids.includes(classId)) selected.delete(classId);
    const fragment = doc.createDocumentFragment();
    const chip = (classId: string | null, label: string): HTMLButtonElement => {
      const button = doc.createElement("button");
      button.type = "button";
      button.className = "refine-class-chip";
      button.dataset.classId = classId ?? "";
      button.setAttribute("aria-pressed", String(classId === null ? selected.size === 0 : selected.has(classId)));
      if (classId === null) {
        button.title = "Values every class uses unless it overrides them";
      } else {
        const swatch = doc.createElement("span");
        swatch.className = "refine-class-swatch";
        swatch.style.background = getColorForClass(classId);
        button.appendChild(swatch);
        const overridden = refineOverriddenKeys(docNow, classId);
        button.classList.toggle("is-off", !resolveRefineParams(docNow, classId).enabled);
        button.classList.toggle("has-override", overridden.length > 0);
        button.title = overridden.length ? `Own settings: ${overridden.join(", ")}` : "Follows the default";
      }
      button.append(label);
      return button;
    };
    fragment.appendChild(chip(null, "Default"));
    for (const classId of ids) {
      const name = store.className(classId);
      fragment.appendChild(chip(classId, name ? `${classId} ${name}` : classId));
    }
    ref("chips").replaceChildren(fragment);
    const t = targets();
    ref("hint").textContent = t === "default"
      ? "Editing the default for every class without its own value."
      : `Editing class ${t.join(", ")}${t.length > 1 ? " together; differing values show as mixed" : ""}.`;
  };

  // ---------------------------------------------------------------- presets
  const renderPresets = (): void => {
    const select = ref<HTMLSelectElement>("presetSelect");
    const previous = select.value;
    const presets = store.getDoc().presets;
    select.replaceChildren(new Option(presets.length ? "Choose preset…" : "No presets yet", ""), ...presets.map((preset) => new Option(preset.name, preset.name)));
    select.value = presets.some((preset) => preset.name === previous) ? previous : "";
  };
  const exportPresets = async (): Promise<void> => {
    const presets = store.getDoc().presets;
    if (!presets.length) { store.notify("Save a preset first."); return; }
    const contents = serializeRefinePresets(presets);
    if (windowRef.saveEasyLabelingLibraryFile) {
      const result = await windowRef.saveEasyLabelingLibraryFile({ kind: "refine", suggestedName: "refine-presets.json", contents });
      if (result) store.notify(`Saved to ${result.filePath}`);
      return;
    }
    const link = doc.createElement("a");
    link.href = URL.createObjectURL(new Blob([contents], { type: "application/json" }));
    link.download = "refine-presets.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };
  const importPresetText = (text: string): void => {
    const { doc: next, count } = importRefinePresets(store.getDoc(), text);
    setDoc(next);
    store.notify(`Loaded ${count} preset${count === 1 ? "" : "s"}.`);
  };

  // ---------------------------------------------------------------- fields
  const fieldControls: { spec: FieldSpec; row: HTMLElement; control: HTMLInputElement | HTMLSelectElement }[] = [];
  for (const spec of FIELDS) {
    const row = doc.createElement("div");
    row.className = "refine-field";
    const label = doc.createElement("label");
    label.htmlFor = `${prefix}Field-${spec.key}`;
    label.textContent = spec.label;
    if (spec.title) label.title = spec.title;
    let control: HTMLInputElement | HTMLSelectElement;
    if (spec.type === "select") {
      const select = doc.createElement("select");
      select.className = "form-select form-select-sm";
      const mixed = new Option("Mixed", "__mixed");
      mixed.disabled = true;
      select.add(mixed);
      spec.options?.forEach(([value, text]) => select.add(new Option(text, value)));
      select.addEventListener("change", () => { if (select.value !== "__mixed") commitField(spec.key, select.value); });
      control = select;
    } else if (spec.type === "bool") {
      const box = doc.createElement("input");
      box.type = "checkbox";
      box.className = "form-check-input";
      box.addEventListener("change", () => commitField(spec.key, box.checked));
      control = box;
    } else {
      const number = doc.createElement("input");
      number.type = "number";
      number.className = "form-control form-control-sm";
      number.min = String(spec.min);
      number.max = String(spec.max);
      number.step = String(spec.step);
      // input (not change) so the previews follow while typing or using the spinner.
      number.addEventListener("input", () => {
        if (number.value === "" || !Number.isFinite(Number(number.value))) return;
        const value = Number(number.value);
        commitField(spec.key, spec.type === "pct" ? value / 100 : value);
      });
      number.addEventListener("change", () => syncFields(true));
      control = number;
    }
    control.id = `${prefix}Field-${spec.key}`;
    if (spec.title) control.title = spec.title;
    const reset = doc.createElement("button");
    reset.type = "button";
    reset.className = "panel-icon-button refine-field-reset";
    reset.title = "Use the default value";
    reset.setAttribute("aria-label", `${spec.label}: use the default value`);
    reset.innerHTML = RESET_ICON;
    reset.addEventListener("click", () => setDoc(resetRefineSettings(store.getDoc(), targets(), [resetKeyFor(spec.key)])));
    if (spec.perSide) row.dataset.perSide = "";
    row.append(label, control, reset);
    root.querySelector(`[data-group="${spec.group}"]`)!.appendChild(row);
    fieldControls.push({ spec, row, control });
  }

  const syncFields = (force = false): void => {
    const params = editedParams();
    const t = targets();
    const docNow = store.getDoc();
    for (const { spec, row, control } of fieldControls) {
      row.hidden = scope !== "all" && !spec.perSide;
      row.classList.toggle("is-overridden", isOverridden(spec.key));
      const values = params.map((p) => valueOf(p, spec.key));
      const mixed = values.some((value) => value !== values[0]);
      if (control instanceof HTMLSelectElement) control.value = mixed ? "__mixed" : String(values[0]);
      else if (control.type === "checkbox") { control.indeterminate = mixed; control.checked = !mixed && Boolean(values[0]); }
      else if (force || doc.activeElement !== control) {
        control.placeholder = mixed ? "Mixed" : "";
        control.value = mixed ? "" : String(spec.type === "pct" ? Math.round(Number(values[0]) * 100) : values[0]);
      }
    }
    const sideBox = ref("sideBox");
    sideBox.dataset.scope = scope;
    ref("contextDetails").hidden = scope !== "all";
    ref("scope").querySelectorAll<HTMLButtonElement>("[data-scope]").forEach((button) => {
      const value = button.dataset.scope as RefineEditScope;
      button.setAttribute("aria-pressed", String(value === scope));
      button.classList.toggle("has-override", value !== "all" && sideHasOwnRule(docNow, t, value));
    });
    const anySideRule = REFINE_SIDES.some((side) => sideHasOwnRule(docNow, t, side));
    const sideOff = scope !== "all" && params.every((p) => p.sides[scope as RefineSide] === "off");
    ref("scopeText").textContent = scope === "all"
      ? (anySideRule ? "Shared by all sides; dotted sides keep their own values." : "Shared by all sides.")
      : `${SIDE_NAMES[scope]} edge only${sideOff ? " (this side is off)" : ""}. Other values follow All sides.`;
    root.querySelector<HTMLElement>('[data-act="sideToAll"]')!.hidden = scope === "all";
    root.querySelector<HTMLElement>('[data-act="clearSides"]')!.hidden = scope !== "all" || !anySideRule;
    sideBox.dataset.polarity = params.every((p) => p.polarity === params[0].polarity) ? params[0].polarity : "mixed";
    for (const side of REFINE_SIDES) {
      const select = root.querySelector<HTMLSelectElement>(`#${prefix}Side${side}`)!;
      const values = params.map((p) => p.sides[side]);
      const mixed = values.some((value) => value !== values[0]);
      select.value = mixed ? "__mixed" : values[0];
      sideBox.dataset[`side${side}`] = mixed ? "mixed" : values[0] === "off" ? "off" : "on";
      select.closest(".refine-side-slot")?.classList.toggle("is-overridden",
        t !== "default" && t.some((classId) => docNow.classes[classId]?.sides?.[side] !== undefined));
    }
  };

  for (const side of REFINE_SIDES) {
    const select = root.querySelector<HTMLSelectElement>(`#${prefix}Side${side}`)!;
    const mixed = new Option("Mixed", "__mixed");
    mixed.disabled = true;
    select.add(mixed);
    SIDE_OPTIONS.forEach(([value, text]) => select.add(new Option(text, value)));
    select.addEventListener("change", () => { if (select.value !== "__mixed") commit({ sides: { [side]: select.value } } as RefineParamsPatch); });
    select.closest(".refine-side-slot")?.querySelector(".refine-field-reset")?.addEventListener("click", () => {
      const t = targets();
      if (t !== "default") setDoc(resetRefineSettings(store.getDoc(), t, [`sides.${side}`]));
    });
  }
  // Clicking near an edge of the diagram edits that side alone; the centre goes back to all sides.
  ref("sideBox").addEventListener("click", (event) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const fx = (event.clientX - rect.left) / rect.width;
    const fy = (event.clientY - rect.top) / rect.height;
    const distances: [RefineSide, number][] = [["L", fx], ["R", 1 - fx], ["T", fy], ["B", 1 - fy]];
    const [side, distance] = distances.sort((a, b) => a[1] - b[1])[0];
    setScope(distance > 0.3 ? "all" : side);
  });
  ref("scope").addEventListener("click", (event) => {
    const value = (event.target as HTMLElement).closest<HTMLElement>("[data-scope]")?.dataset.scope as RefineEditScope | undefined;
    if (value) setScope(value);
  });

  ref("chips").addEventListener("click", (event) => {
    const chip = (event.target as HTMLElement).closest<HTMLElement>(".refine-class-chip");
    if (!chip) return;
    const classId = chip.dataset.classId ?? "";
    if (!classId) selected = new Set();
    else if (selected.has(classId)) selected.delete(classId);
    else selected.add(classId);
    targetsChanged();
  });
  root.addEventListener("click", (event) => {
    const action = (event.target as HTMLElement).closest<HTMLElement>("[data-act]")?.dataset.act;
    const t = targets();
    const presetName = ref<HTMLSelectElement>("presetSelect").value;
    try {
      if (action === "all") { selected = new Set(store.classIds()); targetsChanged(); }
      else if (action === "sideToAll" && scope !== "all") {
        const side = scope;
        const source = sideParams(editedParams()[0], side);
        const values = Object.fromEntries(REFINE_SIDE_RULE_KEYS.map((key) => [key, source[key]]));
        // Sides with their own criterion go back to the shared one; sides that are off stay off.
        const docNow = store.getDoc();
        const patches = t === "default" ? [docNow.default] : t.map((classId) => docNow.classes[classId] ?? {});
        const ownCriterion = REFINE_SIDES.filter((s) => patches.some((patch) => { const mode = patch.sides?.[s]; return mode !== undefined && mode !== "inherit" && mode !== "off"; }));
        let next = updateRefineSettings(docNow, t, { ...values, crit: source.crit } as RefineParamsPatch);
        next = resetRefineSettings(next, t, ["sideRules", ...ownCriterion.map((s) => `sides.${s}`)]);
        if (t !== "default") {
          for (const classId of t) {
            const resolved = resolveRefineParams(next, classId).sides;
            const stillOwn = REFINE_SIDES.filter((s) => resolved[s] !== "inherit" && resolved[s] !== "off");
            if (stillOwn.length) next = updateRefineSettings(next, [classId], { sides: Object.fromEntries(stillOwn.map((s) => [s, "inherit"])) } as RefineParamsPatch);
          }
        }
        // Side rules a class still inherits from the default are pinned to the same values.
        if (t !== "default") {
          for (const classId of t) {
            const inherited = resolveRefineParams(next, classId).sideRules;
            for (const s of REFINE_SIDES) {
              const keys = Object.keys(inherited[s]);
              if (keys.length) next = updateRefineSettings(next, [classId], { sideRules: { [s]: Object.fromEntries(keys.map((key) => [key, values[key]])) } } as RefineParamsPatch);
            }
          }
        }
        setDoc(next);
        setScope("all");
        store.notify(`${SIDE_NAMES[side]} edge rule now applies to every side.`);
      } else if (action === "clearSides") {
        const docNow = store.getDoc();
        const patches = t === "default" ? [docNow.default] : t.map((classId) => docNow.classes[classId] ?? {});
        const sideKeys = REFINE_SIDES.filter((s) => patches.some((patch) => { const mode = patch.sides?.[s]; return mode !== undefined && mode !== "inherit" && mode !== "off"; })).map((s) => `sides.${s}`);
        setDoc(resetRefineSettings(docNow, t, ["sideRules", ...sideKeys]));
      }
      else if (action === "reset") setDoc(t === "default" ? { ...store.getDoc(), default: createRefineSettings().default } : resetRefineSettings(store.getDoc(), t));
      else if (action === "applyPreset") {
        if (!presetName) { store.notify("Choose a preset to apply."); return; }
        setDoc(applyRefinePreset(store.getDoc(), presetName, t));
        store.notify(`Applied "${presetName}" to ${t === "default" ? "the default" : `class ${t.join(", ")}`}.`);
      } else if (action === "deletePreset") {
        if (presetName) setDoc(deleteRefinePreset(store.getDoc(), presetName));
      } else if (action === "savePreset") {
        const nameInput = ref<HTMLInputElement>("presetName");
        const name = nameInput.value.trim() || presetName;
        if (!name) { store.notify("Type a preset name."); nameInput.focus(); return; }
        setDoc(saveRefinePreset(store.getDoc(), name, editedParams()[0]));
        nameInput.value = "";
        ref<HTMLSelectElement>("presetSelect").value = name;
        store.notify(`Saved preset "${name}"${Array.isArray(t) && t.length > 1 ? ` from class ${t[0]}` : ""}.`);
      } else if (action === "export") void exportPresets().catch((error: unknown) => store.notify(error instanceof Error ? error.message : "Unable to save presets"));
      else if (action === "import") {
        if (!windowRef.openEasyLabelingLibraryFile) { ref<HTMLInputElement>("presetFile").click(); return; }
        void windowRef.openEasyLabelingLibraryFile("refine")
          .then((file) => { if (file) importPresetText(file.contents); })
          .catch((error: unknown) => store.notify(error instanceof Error ? error.message : "Unable to load presets"));
      }
    } catch (error: unknown) {
      store.notify(error instanceof Error ? error.message : String(error));
    }
  });
  ref<HTMLInputElement>("presetFile").addEventListener("change", (event) => {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    fileInput.value = "";
    file?.text().then(importPresetText).catch((error: unknown) => store.notify(error instanceof Error ? error.message : "Unable to load presets"));
  });

  function render(): void {
    renderChips();
    renderPresets();
    syncFields();
  }

  render();
  return {
    render,
    scope: () => scope,
    setScope,
    onScopeChange(listener) { scopeListeners.push(listener); },
    targets,
    setTargets(classIds) { selected = new Set(classIds); targetsChanged(); },
    onTargetsChange(listener) { targetListeners.push(listener); }
  };
}
