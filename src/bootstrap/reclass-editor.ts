import { createReclassRule, normalizeReclassRule, type ReclassRule } from "../domain/refine/reclass.js";
import type { RefineEditorStore } from "./refine-editor.js";

/**
 * Reclass rules in the Refine Lab: one block per rule, checked from the first. Edits go to the Lab draft
 * (store.setDoc) like every other Lab setting, so cases re-judge live and nothing is saved until Save.
 * One rule is selected at a time; the editor's class chips edit that rule's classes (fromClasses).
 */
export interface ReclassEditor {
  render(): void;
  /** Index of the selected rule, or -1 when there are none. */
  selected(): number;
  onSelect(listener: () => void): void;
}

export function createReclassEditor(input: { root: HTMLElement; prefix: string; documentRef: Document; store: RefineEditorStore }): ReclassEditor {
  const { root, prefix, documentRef: doc, store } = input;
  let selectedIndex = 0;
  const selectListeners: (() => void)[] = [];
  const selected = (): number => Math.min(selectedIndex, rules().length - 1);
  const select = (index: number): void => {
    if (index === selected()) return;
    selectedIndex = index;
    render();
    selectListeners.forEach((listener) => listener());
  };
  const rules = (): ReclassRule[] => store.getDoc().reclass;
  const commit = (next: ReclassRule[]): void => store.setDoc({ ...store.getDoc(), reclass: next.map(normalizeReclassRule) });
  const update = (index: number, patch: (rule: ReclassRule) => ReclassRule): void => commit(rules().map((rule, i) => (i === index ? patch(structuredClone(rule)) : rule)));
  const id = (index: number, field: string): string => `${prefix}Reclass${index}-${field}`;

  const element = <K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}): HTMLElementTagNameMap[K] =>
    Object.assign(doc.createElement(tag), props);
  const row = (label: HTMLElement, control: HTMLElement): HTMLElement => {
    const div = element("div", { className: "refine-field" });
    div.append(label, control, element("span"));
    return div;
  };
  const number = (index: number, field: string, min: number, max: number, step: number, title: string, onValue: (value: number) => void): HTMLInputElement => {
    const control = element("input", { type: "number", className: "form-control form-control-sm", id: id(index, field), title });
    Object.assign(control, { min: String(min), max: String(max), step: String(step) });
    // input (not change) so the cases re-judge while typing.
    control.addEventListener("input", () => { if (control.value !== "" && Number.isFinite(Number(control.value))) onValue(Number(control.value)); });
    return control;
  };
  const check = (index: number, field: string, text: string, onValue: (on: boolean) => void): HTMLLabelElement => {
    const box = element("input", { type: "checkbox", className: "form-check-input me-1", id: id(index, field) });
    box.addEventListener("change", () => onValue(box.checked));
    const label = element("label", { htmlFor: id(index, field) });
    label.append(box, text);
    return label;
  };
  const classOption = (classId: string): HTMLOptionElement => {
    const name = store.className(classId);
    return new Option(name ? `${classId} ${name}` : classId, classId);
  };

  /** Rule count and listed classes: what the blocks are built from. */
  const shapeOf = (): string => `${rules().length}|${store.classIds().join(",")}`;
  const fromText = (rule: ReclassRule): string => (rule.fromClasses.length
    ? `From ${rule.fromClasses.map((classId) => { const name = store.className(classId); return name ? `${classId} ${name}` : classId; }).join(", ")}`
    : "From every class");
  /** Builds the blocks; rebuilt only when their shape changes, so typing keeps focus. */
  let shape = "";
  const build = (): void => {
    const list = rules();
    const classIds = store.classIds();
    shape = shapeOf();
    root.replaceChildren();
    list.forEach((_, index) => {
      const block = element("div", { className: "refine-fields reclass-rule" });
      block.dataset.index = String(index);
      // Any click inside a rule (its fields too) makes it the rule the class chips edit.
      block.addEventListener("click", () => select(index));
      block.addEventListener("focusin", () => select(index));
      const head = element("div", { className: "section-heading-row" });
      head.append(check(index, "enabled", `Rule ${index + 1}`, (on) => update(index, (rule) => ({ ...rule, enabled: on }))));
      const tools = element("div", { className: "compact-icon-group" });
      const tool = (act: string, icon: string, title: string, run: () => void): void => {
        const button = element("button", { type: "button", className: "panel-icon-button", title, innerHTML: `<i class="bi ${icon}" aria-hidden="true"></i>` });
        button.dataset.act = act;
        button.setAttribute("aria-label", title);
        button.addEventListener("click", run);
        tools.append(button);
      };
      const move = (by: number): void => {
        const next = [...rules()];
        const [rule] = next.splice(index, 1);
        next.splice(Math.max(0, Math.min(next.length, index + by)), 0, rule);
        commit(next);
      };
      tool("reclassUp", "bi-arrow-up", "Check this rule earlier", () => move(-1));
      tool("reclassDown", "bi-arrow-down", "Check this rule later", () => move(1));
      tool("reclassDelete", "bi-trash", "Delete this rule", () => commit(rules().filter((__, i) => i !== index)));
      head.append(tools);
      const from = element("p", { className: "refine-hint reclass-from mb-1", id: id(index, "fromText") });

      // A text field with suggestions: the target class may not have any box yet.
      const to = element("input", { type: "text", className: "form-control form-control-sm", id: id(index, "to"), title: "Class id a matching box changes to" });
      const suggestions = element("datalist", { id: id(index, "toClasses") });
      classIds.forEach((classId) => suggestions.append(classOption(classId)));
      to.setAttribute("list", suggestions.id);
      to.addEventListener("input", () => { if (to.value.trim()) update(index, (rule) => ({ ...rule, toClass: to.value.trim() })); });
      const combine = element("select", { className: "form-select form-select-sm", id: id(index, "combine"), title: "AND: every check that is on must pass. OR: any one is enough." });
      combine.add(new Option("Any check (OR)", "or"));
      combine.add(new Option("Every check (AND)", "and"));
      combine.addEventListener("change", () => update(index, (rule) => ({ ...rule, combine: combine.value === "and" ? "and" : "or" })));
      const label = (field: string, text: string): HTMLLabelElement => element("label", { htmlFor: id(index, field), textContent: text });

      block.append(
        head,
        from,
        row(label("to", "Change to"), to),
        suggestions,
        row(label("combine", "Combine"), combine),
        row(label("crop", "Centre crop %"), number(index, "crop", 10, 100, 5, "Share of the box width and height measured, around its centre", (v) => update(index, (rule) => ({ ...rule, crop: v / 100 })))),
        row(check(index, "meanOn", "Mean ≥", (on) => update(index, (rule) => ({ ...rule, mean: { ...rule.mean, enabled: on } }))),
          number(index, "meanMin", 0, 255, 1, "Centre mean brightness (0-255) at or above which the box matches", (v) => update(index, (rule) => ({ ...rule, mean: { ...rule.mean, min: v } })))),
        row(check(index, "brightOn", "Bright pixels ≥ %", (on) => update(index, (rule) => ({ ...rule, bright: { ...rule.bright, enabled: on } }))),
          number(index, "brightRatio", 0, 100, 1, "Share of centre pixels at or above the bright level", (v) => update(index, (rule) => ({ ...rule, bright: { ...rule.bright, minRatio: v / 100 } })))),
        row(label("brightLevel", "Bright level"), number(index, "brightLevel", 0, 255, 1, "A pixel this bright (0-255) or brighter counts as bright", (v) => update(index, (rule) => ({ ...rule, bright: { ...rule.bright, level: v } })))),
        row(check(index, "shrinkOn", "Area shrinks ≥ %", (on) => update(index, (rule) => ({ ...rule, shrink: { ...rule.shrink, enabled: on } }))),
          number(index, "shrinkRatio", 0, 99, 1, "Refined area at least this much smaller than the box as loaded from the label file", (v) => update(index, (rule) => ({ ...rule, shrink: { ...rule.shrink, minRatio: v / 100 } }))))
      );
      root.append(block);
    });
    const add = element("button", { type: "button", className: "btn btn-outline-secondary btn-sm mt-2", textContent: "Add rule", title: "Add a rule; rules are checked from the first" });
    add.dataset.act = "addReclassRule";
    add.addEventListener("click", () => {
      commit([...rules(), createReclassRule()]);
      select(rules().length - 1);
    });
    root.append(add);
  };

  const setValue = (control: HTMLInputElement | HTMLSelectElement | null, value: string): void => {
    if (control && doc.activeElement !== control && control.value !== value) control.value = value;
  };
  const sync = (): void => {
    rules().forEach((rule, index) => {
      const get = <T extends HTMLElement>(field: string): T | null => root.querySelector<T>(`#${id(index, field)}`);
      get<HTMLInputElement>("enabled")!.checked = rule.enabled;
      get("fromText")!.textContent = fromText(rule);
      root.querySelector<HTMLElement>(`.reclass-rule[data-index="${index}"]`)!.classList.toggle("is-selected", index === selected());
      setValue(get("to"), rule.toClass);
      setValue(get("combine"), rule.combine);
      setValue(get("crop"), String(Math.round(rule.crop * 100)));
      get<HTMLInputElement>("meanOn")!.checked = rule.mean.enabled;
      setValue(get("meanMin"), String(rule.mean.min));
      get<HTMLInputElement>("brightOn")!.checked = rule.bright.enabled;
      setValue(get("brightRatio"), String(Math.round(rule.bright.minRatio * 100)));
      setValue(get("brightLevel"), String(rule.bright.level));
      get<HTMLInputElement>("shrinkOn")!.checked = rule.shrink.enabled;
      setValue(get("shrinkRatio"), String(Math.round(rule.shrink.minRatio * 100)));
    });
  };

  function render(): void {
    if (shape !== shapeOf()) build();
    sync();
  }
  return {
    render,
    selected,
    onSelect(listener) { selectListeners.push(listener); }
  };
}
