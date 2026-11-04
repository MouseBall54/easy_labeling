import { normalizeReclassRule, reclassRuleOf, type ReclassRule } from "../domain/refine/reclass.js";
import type { RefineEditorStore } from "./refine-editor.js";

/**
 * The reclass rule in the Refine Lab. Reclass runs one rule (the editor's class chips pick its classes). Edits
 * go to the Lab draft (store.setDoc) like every other Lab setting, so cases re-judge live and nothing is saved
 * until Save. The rule is always on; with no saved rule the block shows the default one.
 */
const INSETS = [
  ["insetTop", "Centre inset top %", "height"],
  ["insetBottom", "Centre inset bottom %", "height"],
  ["insetLeft", "Centre inset left %", "width"],
  ["insetRight", "Centre inset right %", "width"]
] as const;

export function createReclassEditor(input: { root: HTMLElement; prefix: string; documentRef: Document; store: RefineEditorStore }): { render(): void } {
  const { root, prefix, documentRef: doc, store } = input;
  const rule = (): ReclassRule => reclassRuleOf(store.getDoc().reclass);
  const update = (patch: (rule: ReclassRule) => ReclassRule): void => store.setDoc({ ...store.getDoc(), reclass: [normalizeReclassRule(patch(structuredClone(rule())))] });
  const id = (field: string): string => `${prefix}Reclass0-${field}`;

  const element = <K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}): HTMLElementTagNameMap[K] =>
    Object.assign(doc.createElement(tag), props);
  const row = (label: HTMLElement, control: HTMLElement): HTMLElement => {
    const div = element("div", { className: "refine-field" });
    div.append(label, control, element("span"));
    return div;
  };
  const number = (field: string, min: number, max: number, step: number, title: string, onValue: (value: number) => void): HTMLInputElement => {
    const control = element("input", { type: "number", className: "form-control form-control-sm", id: id(field), title });
    Object.assign(control, { min: String(min), max: String(max), step: String(step) });
    // input (not change) so the cases re-judge while typing.
    control.addEventListener("input", () => { if (control.value !== "" && Number.isFinite(Number(control.value))) onValue(Number(control.value)); });
    return control;
  };
  const check = (field: string, text: string, onValue: (on: boolean) => void): HTMLLabelElement => {
    const box = element("input", { type: "checkbox", className: "form-check-input me-1", id: id(field) });
    box.addEventListener("change", () => onValue(box.checked));
    const label = element("label", { htmlFor: id(field) });
    label.append(box, text);
    return label;
  };
  const label = (field: string, text: string): HTMLLabelElement => element("label", { htmlFor: id(field), textContent: text });
  const classOption = (classId: string): HTMLOptionElement => {
    const name = store.className(classId);
    return new Option(name ? `${classId} ${name}` : classId, classId);
  };

  const block = element("div", { className: "refine-fields reclass-rule" });
  // A text field with suggestions: the target class may not have any box yet.
  const to = element("input", { type: "text", className: "form-control form-control-sm", id: id("to"), title: "Class id a matching box changes to" });
  const suggestions = element("datalist", { id: id("toClasses") });
  to.setAttribute("list", suggestions.id);
  to.addEventListener("input", () => { if (to.value.trim()) update((r) => ({ ...r, toClass: to.value.trim() })); });
  const combine = element("select", { className: "form-select form-select-sm", id: id("combine"), title: "AND: every check that is on must pass. OR: any one is enough." });
  combine.add(new Option("Any check (OR)", "or"));
  combine.add(new Option("Every check (AND)", "and"));
  combine.addEventListener("change", () => update((r) => ({ ...r, combine: combine.value === "and" ? "and" : "or" })));
  block.append(
    row(label("to", "Change to"), to),
    suggestions,
    row(label("combine", "Combine"), combine),
    ...INSETS.map(([field, text, span]) => row(label(field, text),
      number(field, 0, 90, 1, `Share of the box ${span} left out of the centre on this side (opposite sides together at most 90%)`, (v) => update((r) => ({ ...r, [field]: v / 100 }))))),
    row(check("meanOn", "Mean ≥", (on) => update((r) => ({ ...r, mean: { ...r.mean, enabled: on } }))),
      number("meanMin", 0, 255, 1, "Centre mean brightness (0-255) at or above which the box matches", (v) => update((r) => ({ ...r, mean: { ...r.mean, min: v } })))),
    row(check("brightOn", "Bright pixels ≥ %", (on) => update((r) => ({ ...r, bright: { ...r.bright, enabled: on } }))),
      number("brightRatio", 0, 100, 1, "Share of centre pixels at or above the bright level", (v) => update((r) => ({ ...r, bright: { ...r.bright, minRatio: v / 100 } })))),
    row(label("brightLevel", "Bright level"), number("brightLevel", 0, 255, 1, "A pixel this bright (0-255) or brighter counts as bright", (v) => update((r) => ({ ...r, bright: { ...r.bright, level: v } })))),
    row(check("shrinkOn", "Area shrinks ≥ %", (on) => update((r) => ({ ...r, shrink: { ...r.shrink, enabled: on } }))),
      number("shrinkRatio", 0, 99, 1, "Refined area (Edge settings) at least this much smaller than the box as loaded from the label file", (v) => update((r) => ({ ...r, shrink: { ...r.shrink, minRatio: v / 100 } }))))
  );
  root.replaceChildren(block);

  const get = <T extends HTMLElement>(field: string): T => block.querySelector<T>(`#${id(field)}`)!;
  const setValue = (control: HTMLInputElement | HTMLSelectElement, value: string): void => {
    if (doc.activeElement !== control && control.value !== value) control.value = value;
  };
  let listed = "";
  return {
    render() {
      const classIds = store.classIds();
      if (listed !== classIds.join(",")) {
        listed = classIds.join(",");
        suggestions.replaceChildren(...classIds.map(classOption));
      }
      const r = rule();
      setValue(to, r.toClass);
      setValue(combine, r.combine);
      for (const [field] of INSETS) setValue(get(field), String(Math.round(r[field] * 100)));
      get<HTMLInputElement>("meanOn").checked = r.mean.enabled;
      setValue(get("meanMin"), String(r.mean.min));
      get<HTMLInputElement>("brightOn").checked = r.bright.enabled;
      setValue(get("brightRatio"), String(Math.round(r.bright.minRatio * 100)));
      setValue(get("brightLevel"), String(r.bright.level));
      get<HTMLInputElement>("shrinkOn").checked = r.shrink.enabled;
      setValue(get("shrinkRatio"), String(Math.round(r.shrink.minRatio * 100)));
    }
  };
}
