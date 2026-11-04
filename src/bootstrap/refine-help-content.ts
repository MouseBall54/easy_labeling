import { DEFAULT_REFINE_PARAMS } from "../domain/refine/edge-refine.js";
import { createReclassRule } from "../domain/refine/reclass.js";
import { englishHelpTexts } from "./refine-help-en.js";
import { koreanHelpTexts } from "./refine-help-ko.js";

/**
 * Refine Lab guide: topics (static, trusted HTML) with drawn example images, and the keyword search over them,
 * in English and Korean. The texts live in refine-help-en.ts / refine-help-ko.ts (same topic ids); UI names stay
 * English in both. DOM-free so the search and the topic list are unit tested; refine-help.ts renders it.
 * Defaults are read from the domain so the text follows them.
 */
export type HelpLang = "en" | "ko";
export type HelpGroup = "start" | "edge" | "reclass" | "hints";
export const HELP_LANGS: { id: HelpLang; label: string }[] = [{ id: "en", label: "EN" }, { id: "ko", label: "한국어" }];
export const HELP_GROUP_IDS: readonly HelpGroup[] = ["start", "edge", "reclass", "hints"];

export interface HelpText { title: string; caption?: string; html: string }
export interface HelpTopic extends HelpText {
  id: string;
  group: HelpGroup;
  /** Extra search words in both languages (synonyms, setting names). */
  keywords: string[];
  /** Example image (inline SVG). */
  figure?: string;
}
/** What the text modules build their HTML with. */
export interface HelpKit {
  D: typeof DEFAULT_REFINE_PARAMS;
  R: ReturnType<typeof createReclassRule>;
  pct(share: number): string;
  link(id: string, text: string): string;
  tip(html: string): string;
  def(name: string, html: string, value?: string | number): string;
  keys(...keys: string[]): string;
}

/** Guide window strings. */
export const HELP_UI: Record<HelpLang, {
  title: string; search: string; searchLabel: string; close: string; all: string; groups: Record<HelpGroup, string>;
  sections: string; contents: string; language: string; results(count: number): string; empty(query: string): string;
}> = {
  en: {
    title: "Refine Lab guide", search: "Search: polarity, neighbour, inset, 극성, 이웃…", searchLabel: "Search the guide", close: "Close (Esc)", all: "All",
    groups: { start: "Start", edge: "Edge", reclass: "Reclass", hints: "Hints" }, sections: "Guide sections", contents: "Contents", language: "Guide language",
    results: (count) => `${count} result${count === 1 ? "" : "s"}`,
    empty: (query) => `No topic matches "${query}". Try one word, a setting name, or Hints.`
  },
  ko: {
    title: "Refine Lab 가이드", search: "검색: 극성, 이웃, inset, polarity…", searchLabel: "가이드 검색", close: "닫기 (Esc)", all: "전체",
    groups: { start: "시작", edge: "Edge", reclass: "Reclass", hints: "힌트" }, sections: "가이드 구역", contents: "목차", language: "가이드 언어",
    results: (count) => `결과 ${count}개`,
    empty: (query) => `"${query}"와 맞는 주제가 없습니다. 한 단어나 설정 이름으로 찾거나 힌트를 보세요.`
  }
};

// ---------------------------------------------------------------- drawing helpers (SVG strings)
/** Shared filters and markers: one hidden <svg> holds them for every figure. */
export const HELP_SVG_DEFS = `<svg class="rh-svg-defs" aria-hidden="true" focusable="false"><defs>
<filter id="rhGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1.4 0 0 0 -0.62"/></filter>
<filter id="rhSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>
<filter id="rhBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2"/></filter>
<marker id="rhArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#7d8790"/></marker>
<marker id="rhArrowAmber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#f0ad4e"/></marker>
</defs></svg>`;

const COLORS = { original: "#f2f2f2", result: "#4d94ff", band: "rgba(77,148,255,0.28)", amber: "#f0ad4e", reclass: "#e64980", area: "#dc3545", gold: "#ffd666", green: "#3ecf8e" };
const svg = (label: string, w: number, h: number, body: string): string =>
  `<svg class="rh-fig" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${body}</svg>`;
/** A grayscale micrograph panel: background, soft structures, grain. Clipped to its own box. */
const micro = (x: number, y: number, w: number, h: number, shapes: string, overlay = "", options: { bg?: string; grain?: number } = {}): string =>
  `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${options.bg ?? "#262626"}"/>${shapes}`
  + `<rect width="${w}" height="${h}" filter="url(#rhGrain)" opacity="${options.grain ?? 0.3}"/>${overlay}</svg>`;
const blob = (x: number, y: number, w: number, h: number, gray: number, rx = 6, filter = "rhSoft"): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="rgb(${gray},${gray},${gray})" filter="url(#${filter})"/>`;
const rect = (x: number, y: number, w: number, h: number, style: string): string => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${style}/>`;
const ORIGINAL = `fill="none" stroke="${COLORS.original}" stroke-width="1.4" stroke-dasharray="4 3"`;
const RESULT = `fill="none" stroke="${COLORS.result}" stroke-width="2"`;
const line = (x1: number, y1: number, x2: number, y2: number, style: string): string => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${style}/>`;
/** Label drawn over a micrograph (light text with a dark halo). */
const tag = (x: number, y: number, text: string, color = "#ffffff", anchor = "start"): string =>
  `<text class="rh-tag" x="${x}" y="${y}" fill="${color}" text-anchor="${anchor}">${text}</text>`;
/** Label on a plot or wireframe (theme text colour). */
const note = (x: number, y: number, text: string, anchor = "start", cls = "rh-note"): string =>
  `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${text}</text>`;
/** Plot curve of samples (0-1 range) inside a box. */
const curve = (samples: number[], x: number, y: number, w: number, h: number, cls: string): string => {
  const step = w / (samples.length - 1);
  return `<path class="${cls}" d="${samples.map((v, i) => `${i ? "L" : "M"}${(x + i * step).toFixed(1)} ${(y + h - v * h).toFixed(1)}`).join(" ")}"/>`;
};
const sample = (n: number, fn: (t: number) => number): number[] => Array.from({ length: n }, (_, i) => fn(i / (n - 1)));
const noise = (i: number): number => { const s = Math.sin(i * 12.9898) * 43758.5453; return s - Math.floor(s) - 0.5; };
const step = (t: number, at: number, soft: number): number => 1 / (1 + Math.exp((t - at) / soft));
const bump = (t: number, at: number, width: number): number => Math.exp(-(((t - at) / width) ** 2));
const plotFrame = (x: number, y: number, w: number, h: number, title: string): string =>
  `<rect class="rh-plot" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>${note(x + 6, y + 12, title, "start", "rh-note rh-strong")}`;
const vmark = (x: number, y1: number, y2: number, color: string, text: string, ty: number, anchor = "middle"): string =>
  `${line(x, y1, x, y2, `stroke="${color}" stroke-width="1.6" stroke-dasharray="3 2"`)}<text class="rh-note" x="${x}" y="${ty}" text-anchor="${anchor}" style="fill:${color}">${text}</text>`;
const arrow = (x1: number, y1: number, x2: number, y2: number, cls = "rh-arrow"): string =>
  `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${cls === "rh-arrow-amber" ? "rhArrowAmber" : "rhArrow"})"/>`;

// ---------------------------------------------------------------- figures
/** Every figure with its labels in one language (UI names stay English). */
function figures(lang: HelpLang) {
  const L = (en: string, ko: string): string => (lang === "ko" ? ko : en);
  return {
    quick: svg(L("Before and after: the dashed label box snaps to the particle edges", "전후: 점선 라벨 박스가 입자 경계에 맞춰짐"), 320, 150,
      micro(4, 4, 140, 130, blob(35, 30, 70, 72, 185), rect(26, 40, 84, 70, ORIGINAL) + tag(6, 124, L("label as drawn", "그린 라벨")))
      + arrow(150, 69, 170, 69) + note(160, 60, "E", "middle", "rh-note rh-strong")
      + micro(176, 4, 140, 130, blob(35, 30, 70, 72, 185), rect(26, 40, 84, 70, `${ORIGINAL} opacity="0.45"`) + rect(35, 30, 70, 72, RESULT) + tag(6, 124, L("refined to the edges", "경계에 맞춘 결과"), COLORS.result))),
    layout: svg(L("Refine Lab layout: cases, zoom view with profile, settings", "Refine Lab 화면 구성: Cases, 확대 보기와 프로파일, 설정"), 320, 150,
      `<rect class="rh-wire" x="4" y="4" width="312" height="142" rx="6"/>`
      + `<rect class="rh-wire" x="12" y="14" width="60" height="122" rx="4"/>${note(42, 30, "① Cases", "middle")}`
      + [0, 1, 2].map((i) => `<rect class="rh-wire-fill" x="${18 + (i % 2) * 26}" y="${38 + Math.floor(i / 2) * 26}" width="22" height="22" rx="2"/>`).join("")
      + `<rect class="rh-wire" x="80" y="14" width="140" height="74" rx="4"/>${note(150, 30, L("② Zoom view", "② 확대 보기"), "middle")}`
      + `<rect x="120" y="40" width="60" height="40" fill="none" stroke="${COLORS.result}" stroke-width="2"/><rect x="113" y="45" width="72" height="34" ${ORIGINAL} style="stroke:var(--workbench-text-muted)"/>`
      + `<rect class="rh-wire" x="80" y="94" width="140" height="26" rx="4"/>${note(150, 110, L("③ Profile of one side", "③ 한 변의 프로파일"), "middle")}`
      + `<rect class="rh-wire" x="80" y="124" width="140" height="12" rx="3"/>${note(150, 133, L("④ Readout", "④ 설명 줄"), "middle", "rh-note rh-small")}`
      + `<rect class="rh-wire" x="228" y="14" width="80" height="122" rx="4"/>${note(268, 30, L("⑤ Settings", "⑤ 설정"), "middle")}`
      + ["Mode", "Presets", "Classes", "Image", "Edges", "Edge rule"].map((text, i) => note(236, 50 + i * 14, text, "start", "rh-note rh-small")).join("")),
    criteria: svg(L("Edge criteria on a step edge and on a bright rim", "계단형 경계와 밝은 테두리에서의 Edge criterion"), 320, 170,
      plotFrame(4, 4, 152, 162, L("Step edge", "계단형 경계"))
      + curve(sample(60, (t) => 0.15 + 0.7 * step(t, 0.5, 0.06)), 12, 22, 136, 70, "rh-curve")
      + curve(sample(60, (t) => bump(t, 0.5, 0.1) * 0.95), 12, 100, 136, 52, "rh-curve-grad")
      + note(14, 50, L("inside", "안"), "start", "rh-note rh-small") + note(146, 88, L("outside", "밖"), "end", "rh-note rh-small")
      + vmark(80, 22, 152, COLORS.result, "Max gradient = 50% level", 162)
      + plotFrame(164, 4, 152, 162, L("Bright rim (band)", "밝은 테두리(띠)"))
      + curve(sample(60, (t) => 0.12 + 0.78 * bump(t, 0.5, 0.13)), 172, 22, 136, 120, "rh-curve")
      + vmark(240, 22, 142, "#c99700", "Band peak", 152)
      + vmark(262, 40, 142, COLORS.result, "Band outer 50%", 162)),
    polarity: svg(L("Polarity: a bright particle on a dark background and a dark pore in a bright matrix", "Polarity: 어두운 배경의 밝은 입자와 밝은 바탕의 어두운 기공"), 320, 140,
      micro(4, 4, 150, 112, blob(40, 26, 70, 60, 190), rect(40, 26, 70, 60, RESULT) + arrow(75, 56, 136, 56, "rh-arrow-amber"))
      + note(79, 132, L("Bright → dark (particle)", "Bright → dark (입자)"), "middle")
      + micro(166, 4, 150, 112, blob(40, 26, 70, 60, 45), rect(40, 26, 70, 60, RESULT) + arrow(75, 56, 136, 56, "rh-arrow-amber"), { bg: "#b4b4b4", grain: 0.2 })
      + note(241, 132, L("Dark → bright (pore, trench)", "Dark → bright (기공, 트렌치)"), "middle")),
    range: svg(L("Search range: a band inward and outward of the current edge", "탐색 범위: 현재 경계 안쪽과 바깥쪽의 띠"), 320, 150,
      micro(4, 4, 312, 120, blob(-20, 20, 175, 80, 185) + blob(232, 20, 120, 80, 170),
        rect(108, 10, 50, 100, `fill="${COLORS.band}"`)
        + line(133, 10, 133, 110, `stroke="${COLORS.original}" stroke-width="1.6" stroke-dasharray="4 3"`)
        + line(155, 10, 155, 110, `stroke="${COLORS.result}" stroke-width="2.4"`)
        + tag(120, 104, L("in", "안"), "#cfe2ff", "middle") + tag(146, 104, L("out", "밖"), "#cfe2ff", "middle")
        + tag(272, 64, L("next particle", "옆 입자"), "#ffffff", "middle") + tag(272, 104, L("not reached", "닿지 않음"), COLORS.amber, "middle"))
      + note(160, 138, L("band = inward + outward around the current edge (dashed)", "띠 = 현재 경계(점선) 기준 inward + outward"), "middle")),
    segments: svg(L("Segments along a side and how they are combined", "한 변의 세그먼트와 결합 방식"), 320, 150,
      micro(4, 4, 312, 142,
        `<path d="M30 58 L51 56 L93 62 L135 54 L177 66 L219 63 L261 60 L282 60 L282 140 L30 140 Z" fill="#b8b8b8" filter="url(#rhSoft)"/>` + blob(200, 84, 38, 20, 70, 6),
        rect(30, 28, 252, 110, ORIGINAL)
        + [0, 1, 2, 3, 4, 5].map((i) => line(30 + i * 42, 22, 30 + i * 42, 34, `stroke="#ffffff" stroke-width="1"`)).join("")
        + line(30, 54, 282, 54, `stroke="${COLORS.result}" stroke-width="1.4"`) + line(30, 60, 282, 60, `stroke="${COLORS.green}" stroke-width="1.4" stroke-dasharray="5 3"`)
        + [[51, 56, true], [93, 62, true], [135, 54, true], [177, 66, true], [219, 84, false], [261, 60, true]].map(([x, y, kept]) =>
          line((x as number) - 15, y as number, (x as number) + 15, y as number, `stroke="${kept ? COLORS.gold : "#9a9a9a"}" stroke-width="3"`)).join("")
        + tag(306, 50, "Outermost", COLORS.result, "end") + tag(306, 76, "Median", COLORS.green, "end")
        + tag(219, 120, L("debris: weak, dropped", "이물질: 약해서 제외"), "#d8d8d8", "middle") + tag(34, 20, L("6 segments, one edge each (gold)", "세그먼트 6개, 각자 경계 하나(금색)"), "#ffffff"))),
    smoothing: svg(L("Smoothing and gradient step on a noisy profile", "노이즈 많은 프로파일에서의 Smoothing σ와 Gradient step"), 320, 160,
      plotFrame(4, 4, 312, 74, L("Profile: raw (thin) and smoothed with σ (bold)", "프로파일: 원본(가는 선)과 σ로 매끄럽게 한 것(굵은 선)"))
      + curve(sample(90, (t) => 0.2 + 0.6 * step(t, 0.55, 0.05) + noise(t * 90) * 0.22), 12, 18, 296, 54, "rh-curve-thin")
      + curve(sample(90, (t) => 0.2 + 0.6 * step(t, 0.55, 0.07)), 12, 18, 296, 54, "rh-curve")
      + plotFrame(4, 82, 312, 74, L("Change over the gradient step: 1 px (thin) vs 4 px (bold)", "Gradient step 간격의 변화: 1 px(가는 선) vs 4 px(굵은 선)"))
      + curve(sample(90, (t) => Math.max(0, bump(t, 0.55, 0.08) * 0.5 + Math.abs(noise(t * 90 + 3)) * 0.6)), 12, 96, 296, 54, "rh-curve-thin")
      + curve(sample(90, (t) => bump(t, 0.55, 0.1) * 0.9), 12, 96, 296, 54, "rh-curve-grad")),
    near: svg(L("Prefer near the current edge: a weight around the current edge picks the nearby edge", "Prefer near the current edge: 현재 경계 주변 가중치가 가까운 경계를 고름"), 320, 140,
      plotFrame(4, 4, 312, 132, L("Edge score across the search band", "탐색 띠에서의 경계 점수"))
      + curve(sample(90, (t) => bump(t, 0.4, 0.05) * 0.55 + bump(t, 0.82, 0.05) * 0.9), 12, 22, 296, 90, "rh-curve-grad")
      + curve(sample(90, (t) => bump(t, 0.36, 0.25) * 0.95), 12, 22, 296, 90, "rh-curve-weight")
      + vmark(118, 22, 112, "#8a8a8a", L("current edge", "현재 경계"), 122)
      + vmark(130, 50, 112, COLORS.result, L("On: picks this", "On: 이것 선택"), 64, "start")
      + vmark(255, 26, 112, COLORS.amber, L("Off: strongest", "Off: 가장 강한 것"), 22)),
    sides: svg(L("Per-side rules: a side on the image border is turned off", "변별 규칙: 이미지 경계에 닿은 변은 끔"), 320, 150,
      micro(4, 4, 200, 142, blob(-10, 34, 120, 76, 185), rect(1, 34, 109, 76, RESULT)
        + line(1, 34, 1, 110, `stroke="#9a9a9a" stroke-width="3" stroke-dasharray="3 3"`)
        + tag(56, 28, "Top: Gradient", "#ffffff", "middle") + tag(56, 124, "Bottom: Inherit", "#ffffff", "middle")
        + tag(114, 76, "Right: 50% level", "#ffffff") + tag(6, 140, L("Left: Off (image border)", "Left: Off (이미지 경계)"), COLORS.amber))
      + `<rect class="rh-wire" x="216" y="30" width="96" height="84" rx="4"/>`
      + `<rect x="244" y="54" width="40" height="36" fill="none" class="rh-side-box"/>`
      + note(264, 48, "T", "middle") + note(264, 104, "B", "middle") + note(236, 76, "L", "middle") + note(292, 76, "R", "middle")
      + note(264, 128, L("Edges: click a side", "Edges: 변 클릭"), "middle", "rh-note rh-small")),
    pair: svg(L("Top and bottom as a pair: grow picks the halo edges, shrink the core edges", "Top + bottom as a pair: 확장은 후광, 축소는 코어 경계를 고름"), 320, 150,
      micro(4, 4, 312, 142, blob(40, 22, 140, 100, 110, 10, "rhBlur") + blob(60, 40, 100, 64, 200),
        line(30, 22, 190, 22, `stroke="${COLORS.result}" stroke-width="2"`) + line(30, 122, 190, 122, `stroke="${COLORS.result}" stroke-width="2"`)
        + line(30, 40, 190, 40, `stroke="${COLORS.green}" stroke-width="2" stroke-dasharray="5 3"`) + line(30, 104, 190, 104, `stroke="${COLORS.green}" stroke-width="2" stroke-dasharray="5 3"`)
        + rect(50, 30, 120, 84, ORIGINAL)
        + tag(196, 26, L("Prefer growing (halo)", "Prefer growing (후광)"), COLORS.result) + tag(196, 126, "Prefer growing", COLORS.result)
        + tag(196, 44, L("Prefer shrinking (core)", "Prefer shrinking (코어)"), COLORS.green) + tag(196, 108, "Prefer shrinking", COLORS.green)
        + tag(110, 76, L("dashed: label", "점선: 라벨"), "#ffffff", "middle"))),
    span: svg(L("Scan span: extensions scan past the box ends along a long structure", "Scan span: 긴 구조를 따라 박스 끝 너머까지 스캔"), 320, 140,
      micro(4, 4, 312, 112, blob(-10, 46, 340, 34, 180, 4),
        rect(110, 38, 100, 50, ORIGINAL)
        + rect(30, 38, 80, 16, `fill="${COLORS.band}" opacity="0.55"`) + rect(110, 38, 100, 16, `fill="${COLORS.band}"`) + rect(210, 38, 80, 16, `fill="${COLORS.band}" opacity="0.55"`)
        + tag(70, 32, "Extend before", "#cfe2ff", "middle") + tag(160, 32, L("box", "박스"), "#ffffff", "middle") + tag(250, 32, "Extend after", "#cfe2ff", "middle"))
      + note(160, 132, L("Top edge, Scan span: Box + outside", "위쪽 변, Scan span: Box + outside"), "middle")),
    surroundings: svg(L("Surroundings: box core, background ring and a neighbour box", "Surroundings: 박스 코어, background ring, 이웃 박스"), 320, 150,
      micro(4, 4, 312, 142, blob(40, 34, 110, 76, 185) + blob(212, 30, 80, 84, 175),
        rect(26, 20, 138, 104, `fill="none" stroke="${COLORS.amber}" stroke-width="7" opacity="0.45"`)
        + rect(37, 31, 116, 82, `fill="none" stroke="${COLORS.band}" stroke-width="10"`)
        + rect(68, 53, 54, 38, `fill="none" stroke="${COLORS.amber}" stroke-width="1.6" stroke-dasharray="1.5 2.5"`)
        + rect(40, 34, 110, 76, RESULT)
        + rect(212, 30, 80, 84, `fill="none" stroke="#bdbdbd" stroke-width="1.4" stroke-dasharray="5 3"`)
        + line(181, 14, 181, 130, `stroke="#ffffff" stroke-width="1" stroke-dasharray="2 3"`)
        + tag(95, 76, L("core", "코어"), COLORS.amber, "middle") + tag(95, 140, "Background ring", COLORS.amber, "middle")
        + tag(185, 14, L("stop halfway", "중간에서 멈춤"), "#ffffff") + tag(252, 128, L("neighbour", "이웃 박스"), "#d0d0d0", "middle"))),
    review: svg(L("Review marks: a pin on a weak box, a red frame on a large area change, other boxes dimmed", "검토 표시: 약한 박스의 핀, 면적이 크게 바뀐 박스의 빨간 테두리, 나머지는 흐리게"), 320, 150,
      micro(4, 4, 312, 142, blob(20, 40, 70, 64, 185) + blob(125, 40, 70, 64, 185) + blob(232, 44, 56, 54, 185),
        `<g opacity="0.3">${rect(20, 40, 70, 64, RESULT)}</g>`
        + rect(125, 40, 70, 64, RESULT) + `<circle cx="195" cy="40" r="7" fill="${COLORS.amber}"/>` + tag(195, 44, "!", "#000000", "middle")
        + `<path d="M150 112 l10 -6 l10 6" fill="none" stroke="${COLORS.amber}" stroke-width="2.4"/>` + tag(160, 128, L("weak side", "약한 변"), COLORS.amber, "middle")
        + rect(218, 30, 84, 82, `fill="none" stroke="${COLORS.area}" stroke-width="2.4"`) + `<circle cx="302" cy="30" r="7" fill="${COLORS.area}"/>` + tag(302, 34, "!", "#ffffff", "middle")
        + tag(260, 128, L("+62% area", "면적 +62%"), COLORS.area, "middle") + tag(55, 128, L("fine (dimmed)", "정상(흐리게)"), "#bdbdbd", "middle"))),
    image: svg(L("Original and processed image of the same particle", "같은 입자의 Original과 Processed 이미지"), 320, 140,
      micro(4, 4, 150, 112, blob(40, 26, 70, 60, 105), "", { bg: "#5a5a5a", grain: 0.65 }) + note(79, 132, L("Original: noisy, low contrast", "Original: 노이즈 많고 대비 낮음"), "middle")
      + micro(166, 4, 150, 112, blob(40, 26, 70, 60, 215), "", { bg: "#1c1c1c", grain: 0.12 }) + note(241, 132, L("Processed: denoised, stretched", "Processed: 노이즈 제거, 대비 확장"), "middle")),
    insets: svg(L("Reclass centre crop: four insets move each edge of the measured area", "Reclass 가운데 crop: inset 네 개로 측정 영역의 각 변을 따로 움직임"), 320, 160,
      micro(4, 4, 200, 152, blob(30, 20, 140, 112, 175) + blob(56, 40, 54, 30, 240, 12, "rhBlur") + blob(110, 74, 40, 40, 70, 10),
        rect(30, 20, 140, 112, RESULT)
        + rect(37, 31, 91, 56, `fill="rgba(230,73,128,0.12)" stroke="${COLORS.reclass}" stroke-width="1.8" stroke-dasharray="5 3"`)
        + `<circle cx="170" cy="20" r="7" fill="${COLORS.reclass}"/>`)
      + note(214, 30, "Centre inset", "start", "rh-note rh-strong")
      + note(214, 48, "top 10%", "start") + note(214, 64, "bottom 40%", "start") + note(214, 80, "left 5%", "start") + note(214, 96, "right 30%", "start")
      + note(214, 122, "mean 152 ≥ 120", "start") + note(214, 138, L("→ match (pin)", "→ 일치(핀)"), "start")),
    checks: svg(L("Reclass checks: a normal particle, a bright centre and a shrunken box", "Reclass 검사: 정상 입자, 밝은 가운데, 줄어든 박스"), 320, 150,
      micro(4, 4, 100, 112, blob(18, 22, 64, 64, 200) + blob(32, 36, 36, 36, 45, 14), rect(18, 22, 64, 64, RESULT) + rect(31, 35, 38, 38, `fill="none" stroke="${COLORS.reclass}" stroke-dasharray="4 3"`))
      + note(54, 132, L("normal: mean 60", "정상: mean 60"), "middle", "rh-note rh-small")
      + micro(110, 4, 100, 112, blob(18, 22, 64, 64, 200) + blob(32, 36, 36, 36, 170, 14), rect(18, 22, 64, 64, RESULT) + rect(31, 35, 38, 38, `fill="none" stroke="${COLORS.reclass}" stroke-dasharray="4 3"`) + `<circle cx="82" cy="22" r="7" fill="${COLORS.reclass}"/>`)
      + note(160, 132, L("bright centre → match", "밝은 가운데 → 일치"), "middle", "rh-note rh-small")
      + micro(216, 4, 100, 112, blob(34, 38, 32, 34, 195), rect(14, 18, 72, 74, ORIGINAL) + rect(34, 38, 32, 34, RESULT) + `<circle cx="86" cy="18" r="7" fill="${COLORS.reclass}"/>`)
      + note(266, 132, L("area −79% → match", "면적 −79% → 일치"), "middle", "rh-note rh-small")),
    flow: svg(L("From the Lab to the pane: presets, this image, the whole folder", "Lab에서 pane까지: 프리셋, 이 이미지, 폴더 전체"), 320, 120,
      [["Refine Lab", L("tune · save preset", "조정 · 프리셋 저장"), 8], ["Refine pane", "Run with / Reclass with", 114], ["Apply", L("image or whole folder", "이미지 또는 폴더 전체"), 220]].map(([title, sub, x]) =>
        `<rect class="rh-wire" x="${x}" y="30" width="92" height="56" rx="6"/>${note((x as number) + 46, 52, title as string, "middle", "rh-note rh-strong rh-small")}${note((x as number) + 46, 70, sub as string, "middle", "rh-note rh-small")}`).join("")
      + arrow(100, 58, 112, 58) + arrow(206, 58, 218, 58)
      + note(160, 110, L("Folder runs back up every label file they change", "폴더 실행은 바꾼 라벨 파일을 모두 백업"), "middle", "rh-note rh-small"))
  };
}
type FigureKey = keyof ReturnType<typeof figures>;

// ---------------------------------------------------------------- topics
/** Topic order, sections, figures and search words; the texts come from the language modules. */
const META: { id: string; group: HelpGroup; figure?: FigureKey; keywords: string[] }[] = [
  { id: "edge-quickstart", group: "start", figure: "quick", keywords: ["tutorial", "start", "edge", "quick", "튜토리얼", "시작", "경계 맞추기", "사용법"] },
  { id: "lab-layout", group: "start", figure: "layout", keywords: ["layout", "view", "zoom", "profile", "readout", "legend", "cases", "화면", "구성", "확대", "프로파일"] },
  { id: "edge-criterion", group: "edge", figure: "criteria", keywords: ["criterion", "max gradient", "gradient", "band", "flank", "peak", "50% contrast level", "threshold", "기준", "그래디언트", "밝은 띠", "임계"] },
  { id: "edge-polarity", group: "edge", figure: "polarity", keywords: ["polarity", "auto", "bright → dark", "dark → bright", "brightInside", "darkInside", "극성", "밝기 방향", "기공", "pore"] },
  { id: "edge-range", group: "edge", figure: "range", keywords: ["search", "range", "inward", "outward", "rangeIn", "rangeOut", "band", "탐색 범위", "안쪽", "바깥쪽", "범위"] },
  { id: "edge-segments", group: "edge", figure: "segments", keywords: ["segments", "combine", "outermost", "median", "comb", "corner inset", "inset", "세그먼트", "구간", "결합", "중앙값", "바깥"] },
  { id: "edge-smoothing", group: "edge", figure: "smoothing", keywords: ["sigma", "σ", "smoothing", "gradient step", "gradStep", "noise", "스무딩", "노이즈", "그래디언트 간격"] },
  { id: "edge-near", group: "edge", figure: "near", keywords: ["near", "nearWeight", "prefer near", "strongest", "weight", "가까운", "가중치", "근처"] },
  { id: "edge-sides", group: "edge", figure: "sides", keywords: ["side", "sides", "top", "bottom", "left", "right", "off", "inherit", "per side", "use for all sides", "clear side rules", "변", "한쪽", "상하좌우", "끄기"] },
  { id: "edge-pair", group: "edge", figure: "pair", keywords: ["pair", "pairTB", "pairLR", "grow", "shrink", "clearest", "nearest", "halo", "쌍", "확장", "축소", "후광"] },
  { id: "edge-span", group: "edge", figure: "span", keywords: ["scan span", "extend", "extension", "before", "after", "outside", "part", "strongest part", "together", "스캔", "연장", "선", "트렌치"] },
  { id: "edge-surroundings", group: "edge", figure: "surroundings", keywords: ["surroundings", "background ring", "contextRing", "core", "neighbour", "neighbor", "avoid", "stop halfway", "row", "column", "tolerance", "주변", "배경", "이웃", "겹침", "행", "열"] },
  { id: "edge-review", group: "edge", figure: "review", keywords: ["review", "flag", "confidence", "weak", "area", "growth", "shrink", "pin", "caret", "approve", "검토", "신뢰도", "면적", "플래그", "승인"] },
  { id: "edge-advanced", group: "edge", keywords: ["iterations", "auto", "on draw", "autoOnDraw", "advanced", "반복", "자동", "그리기"] },
  { id: "edge-image", group: "edge", figure: "image", keywords: ["image", "original", "processed", "preprocess", "processing", "denoise", "contrast", "이미지", "전처리", "원본", "대비"] },
  { id: "edge-classes", group: "edge", keywords: ["class", "classes", "chip", "default", "preset", "presets", "save", "import", "export", "run with", "클래스", "프리셋", "기본값", "저장"] },
  { id: "reclass-quickstart", group: "start", figure: "checks", keywords: ["tutorial", "reclass", "class", "defect", "튜토리얼", "재분류", "클래스 변경", "결함"] },
  { id: "reclass-crop", group: "reclass", figure: "insets", keywords: ["centre", "center", "crop", "inset", "top", "bottom", "left", "right", "가운데", "중앙", "영역", "상하좌우", "인셋"] },
  { id: "reclass-checks", group: "reclass", figure: "checks", keywords: ["mean", "bright", "bright pixels", "bright level", "shrink", "area", "and", "or", "combine", "평균", "밝은 픽셀", "면적", "축소", "조합"] },
  { id: "reclass-run", group: "reclass", keywords: ["find candidates", "candidate", "reclass selected", "reclass all", "dismiss", "reclass with", "후보", "찾기", "재분류", "무시"] },
  { id: "folder-run", group: "start", figure: "flow", keywords: ["folder", "all images", "batch", "preset", "backup", "run with", "reclass with", "폴더", "전체", "일괄", "백업"] },
  { id: "hints", group: "hints", keywords: ["hint", "hints", "troubleshoot", "problem", "wrong edge", "jumps", "noisy", "soft", "rim", "too many", "힌트", "문제", "해결", "잘못", "튐", "노이즈", "흐림"] },
  { id: "shortcuts", group: "hints", keywords: ["shortcut", "keys", "keyboard", "단축키", "키"] }
];
export const HELP_TOPIC_IDS: readonly string[] = META.map((topic) => topic.id);

function kit(lang: HelpLang): HelpKit {
  const words = lang === "ko" ? { hint: "힌트", value: "기본값" } : { hint: "Hint", value: "default" };
  return {
    D: DEFAULT_REFINE_PARAMS,
    R: createReclassRule(),
    pct: (share) => `${Math.round(share * 100)}%`,
    link: (id, text) => `<a href="#" data-topic="${id}">${text}</a>`,
    tip: (html) => `<div class="rh-tip"><strong>${words.hint}</strong> ${html}</div>`,
    def: (name, html, value) => `<dt>${name}${value === undefined ? "" : ` <span class="rh-default">${words.value} ${value}</span>`}</dt><dd>${html}</dd>`,
    keys: (...keys) => keys.map((key) => `<kbd>${key}</kbd>`).join(" ")
  };
}

const cache = new Map<HelpLang, HelpTopic[]>();
/** Every topic in one language, in guide order. A text missing from a language module throws (tests catch it). */
export function helpTopics(lang: HelpLang): HelpTopic[] {
  let topics = cache.get(lang);
  if (!topics) {
    const texts = (lang === "ko" ? koreanHelpTexts : englishHelpTexts)(kit(lang));
    const art = figures(lang);
    topics = META.map((meta) => {
      const text = texts[meta.id];
      if (!text) throw new Error(`Guide topic "${meta.id}" has no ${lang} text`);
      return { id: meta.id, group: meta.group, keywords: meta.keywords, figure: meta.figure ? art[meta.figure] : undefined, ...text };
    });
    cache.set(lang, topics);
  }
  return topics;
}

const plain = (html: string): string => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").toLowerCase();
const indexes = new WeakMap<HelpTopic, { title: string; keywords: string; text: string }>();
const indexOf = (topic: HelpTopic): { title: string; keywords: string; text: string } => {
  let entry = indexes.get(topic);
  if (!entry) {
    entry = { title: topic.title.toLowerCase(), keywords: topic.keywords.join(" ").toLowerCase(), text: plain(`${topic.html} ${topic.caption ?? ""}`) };
    indexes.set(topic, entry);
  }
  return entry;
};

/** Words of a query: lower case, split on spaces. */
export const helpQueryTerms = (query: string): string[] => query.toLowerCase().split(/\s+/).filter(Boolean);

/**
 * Topics matching every word of the query (title, keywords or text), best first: a title hit counts 3, a
 * keyword 2, the text 1. An empty query returns every topic in order.
 */
export function searchHelpTopics(query: string, topics: readonly HelpTopic[] = helpTopics("en")): HelpTopic[] {
  const terms = helpQueryTerms(query);
  if (!terms.length) return [...topics];
  const scored: { topic: HelpTopic; score: number; order: number }[] = [];
  topics.forEach((topic, order) => {
    const entry = indexOf(topic);
    let score = 0;
    for (const term of terms) {
      const hit = (entry.title.includes(term) ? 3 : 0) + (entry.keywords.includes(term) ? 2 : 0) + (entry.text.includes(term) ? 1 : 0);
      if (!hit) return;
      score += hit;
    }
    scored.push({ topic, score, order });
  });
  return scored.sort((a, b) => b.score - a.score || a.order - b.order).map((item) => item.topic);
}
