import { MAX_MARGIN, MIN_MARGIN, normalizeRecenterRule, type RecenterRule } from "../domain/refine/recenter.js";
import type { RefineEditorStore } from "./refine-editor.js";

/**
 * The recenter rule in the Refine Lab (the editor's class chips pick its classes). Edits go to the Lab draft
 * (store.setDoc), so the cases re-judge live and nothing is saved until Save.
 */
const MARGINS = [
  ["marginTop", "Margin top %", "height"],
  ["marginBottom", "Margin bottom %", "height"],
  ["marginLeft", "Margin left %", "width"],
  ["marginRight", "Margin right %", "width"]
] as const;

export function createRecenterEditor(input: { root: HTMLElement; prefix: string; documentRef: Document; store: RefineEditorStore }): { render(): void } {
  const { root, prefix, documentRef: doc, store } = input;
  const rule = (): RecenterRule => store.getDoc().recenter;
  const update = (patch: (rule: RecenterRule) => RecenterRule): void => store.setDoc({ ...store.getDoc(), recenter: normalizeRecenterRule(patch(structuredClone(rule()))) });
  const id = (field: string): string => `${prefix}Recenter-${field}`;

  const element = <K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}): HTMLElementTagNameMap[K] =>
    Object.assign(doc.createElement(tag), props);
  const row = (field: string, text: string, control: HTMLElement): HTMLElement => {
    const div = element("div", { className: "refine-field" });
    div.append(element("label", { htmlFor: id(field), textContent: text }), control, element("span"));
    return div;
  };
  const number = (field: string, min: number, max: number, step: number, title: string, onValue: (value: number) => void): HTMLInputElement => {
    const control = element("input", { type: "number", className: "form-control form-control-sm", id: id(field), title });
    Object.assign(control, { min: String(min), max: String(max), step: String(step) });
    control.addEventListener("input", () => { if (control.value !== "" && Number.isFinite(Number(control.value))) onValue(Number(control.value)); });
    return control;
  };
  const select = (field: string, title: string, options: [string, string][], onValue: (value: string) => void): HTMLSelectElement => {
    const control = element("select", { className: "form-select form-select-sm", id: id(field), title });
    options.forEach(([value, text]) => control.add(new Option(text, value)));
    control.addEventListener("change", () => onValue(control.value));
    return control;
  };

  const block = element("div", { className: "refine-fields recenter-rule" });
  block.append(
    row("side", "Target", select("side", "Bright: pixels at or above the level are the target. Dark: pixels at or below it.",
      [["bright", "Bright (≥ level)"], ["dark", "Dark (≤ level)"]], (value) => update((r) => ({ ...r, target: { ...r.target, dark: value === "dark" } })))),
    row("level", "Level", number("level", 0, 255, 1, "Gray level (0-255) that splits target pixels from the rest", (v) => update((r) => ({ ...r, target: { ...r.target, level: v } })))),
    row("axis", "Move", select("axis", "Axes the box moves on; its size never changes",
      [["both", "Both axes"], ["x", "Horizontal only"], ["y", "Vertical only"]], (value) => update((r) => ({ ...r, axis: value as RecenterRule["axis"] })))),
    row("component", "Pixels", select("component", "Nearest group: only the connected target pixels nearest the box centre count, so a neighbour inside the region does not pull the box. All: every target pixel in the region counts.",
      [["nearest", "Nearest group"], ["all", "All in region"]], (value) => update((r) => ({ ...r, component: value === "all" ? "all" : "nearest" })))),
    ...MARGINS.map(([field, text, span]) => row(field, text, number(field, MIN_MARGIN * 100, MAX_MARGIN * 100, 5,
      `Share of the box ${span} the region reaches past this side (negative: stays inside the box)`, (v) => update((r) => ({ ...r, [field]: v / 100 }))))),
    row("minRatio", "Min target %", number("minRatio", 0, 100, 1, "Counted pixels must be at least this share of the region, or the box stays", (v) => update((r) => ({ ...r, minRatio: v / 100 })))),
    row("minPixels", "Min pixels", number("minPixels", 1, 1_000_000, 1, "Counted pixels must be at least this many, or the box stays", (v) => update((r) => ({ ...r, minPixels: v })))),
    row("maxShift", "Max shift %", number("maxShift", 0, 500, 5, "Largest move as a share of the box width (horizontal) or height (vertical); a larger one leaves the box where it is", (v) => update((r) => ({ ...r, maxShift: v / 100 }))))
  );
  root.replaceChildren(block);

  const get = <T extends HTMLInputElement | HTMLSelectElement>(field: string): T => block.querySelector<T>(`#${id(field)}`)!;
  const setValue = (control: HTMLInputElement | HTMLSelectElement, value: string): void => {
    if (doc.activeElement !== control && control.value !== value) control.value = value;
  };
  const pct = (share: number): string => String(Math.round(share * 100));
  return {
    render() {
      const r = rule();
      setValue(get("side"), r.target.dark ? "dark" : "bright");
      setValue(get("level"), String(r.target.level));
      setValue(get("axis"), r.axis);
      setValue(get("component"), r.component);
      for (const [field] of MARGINS) setValue(get(field), pct(r[field]));
      setValue(get("minRatio"), pct(r.minRatio));
      setValue(get("minPixels"), String(r.minPixels));
      setValue(get("maxShift"), pct(r.maxShift));
    }
  };
}
