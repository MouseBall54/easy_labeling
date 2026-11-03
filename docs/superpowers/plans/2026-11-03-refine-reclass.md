# Refine Reclass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Detection 박스 중 결함 후보(가운데 평균 밝기, 밝은 픽셀 비율, 불러온 크기 대비 Refine 면적 감소)를 찾아 C안 표시(나머지 흐리게 + 핀 + 태그)로 보여 주고, 사용자가 확인한 뒤 클래스를 바꾸게 한다. Refine Lab에서 규칙을 테스트할 수 있다.

**Architecture:** 판정은 순수 함수(`src/domain/refine/reclass.ts`)이고 규칙은 `refine-settings.json`의 `reclass` 배열이다. 캔버스 판정은 후보 박스들을 감싸는 영역을 기존 `RefineService.crop` 한 번으로 받아 TS로 계산하므로, 웹과 데스크톱(네이티브 refine) 모두 Rust 변경이 없다. 면적 감소는 기존 `refine()`을 계산만 해서 쓴다. 표시 배치는 순수 함수(`src/bootstrap/refine-marks.ts`)로 분리하고, Refine 검토 표시도 같은 체계로 교체한다.

**Tech Stack:** TypeScript (no bundler), fabric.js canvas, vitest, Playwright (chromium).

**Spec:** `docs/superpowers/specs/2026-11-03-refine-reclass-design.md`

## Global Constraints

- 자동 클래스 변경 없음: 후보 표시 → 사용자가 Reclass selected / Reclass all candidates.
- 이미지 한 장 단위. 박스 위치는 판정 때문에 움직이지 않는다.
- 면적 감소 기준 = 이미지를 열 때 `.txt`에서 불러온 박스 크기(`rect.originalYolo`). 새로 그린 박스는 지금 크기.
- 옛 `refine-settings.json`과 프리셋 파일은 그대로 읽힌다(`reclass` 없음 → `[]`, 프리셋에 없음 → 적용 시 현재 규칙 유지).
- 흐리게 처리는 YOLO 저장 결과와 undo history에 남지 않는다.
- 표시 시작값: 핀 지름 12px(화면 기준), 흰 테두리 1.5px, 흐린 박스 불투명도 0.3, 약한 변 화살표는 화면 박스 24px 미만에서 생략.
- 색: Refine 검토 `#f0ad4e`, 면적 플래그 `#dc3545`, reclass `#e64980`.
- 새 단축키 없음. N / Shift+N / F를 Refine 검토와 reclass 후보가 공유한다.
- UI 문자열은 영어, 사용자 문서는 한국어(AGENTS.md).
- Verification은 AGENTS.md를 따른다: typecheck, test:unit, build, `refine-edges` e2e, 라이트/다크 스크린샷.
- 버전: 새 기능이므로 minor. 작업 트리의 2.32.0(review 스위치, Edges 순서)이 아직 릴리스 전이면 그 버전에 포함하고, 이미 릴리스됐으면 `npm version 2.33.0 --no-git-tag-version`과 YOLOE `2.34.0`.

## Review Focus

1. 이미지 가장자리에 걸치거나 아주 작은 박스(crop 0.1이 1px 미만): crop은 최소 1×1 픽셀로 잘라내고 이미지 안으로 clamp한다. NaN이 나오면 안 된다. → Task 1 테스트.
2. `toClass`가 박스의 현재 클래스와 같은 규칙: 후보를 만들지 않는다(바꿀 것이 없음). → Task 1 테스트.
3. Find 도중 이미지 전환, 또는 Find를 연속으로 누름: 늦게 도착한 결과는 버리고, 새 이미지에 옛 후보를 표시하지 않는다. → Task 5 e2e.
4. 잘못된 `reclass` 항목(배열 아님, 숫자 범위 밖, 문자열 숫자): 무시하거나 범위로 자르며 파일 전체는 계속 읽힌다. → Task 2 테스트.
5. 켜진 규칙이 없거나 규칙 안의 판정이 모두 꺼짐: Find는 표시 없이 "No reclass rule is on." 상태 문구를 보여 준다. → Task 1(판정 없음 → 불일치), Task 5(문구).

---

### Task 0: 이전 변경 정리와 작업 브랜치

**Files:** 없음(git만).

- [ ] **Step 1:** 현재 `main` 작업 트리의 미커밋 변경(review marks 스위치, Edges / Edge rule 순서, 2.32.0 bump, 설계 문서)을 확인한다: `git status --short`. 예상 파일: `index.html`, `src/bootstrap/refine-controller.ts`, `src/bootstrap/refine-editor.ts`, `tests/e2e/refine-edges.spec.ts`, `package.json`, `package-lock.json`, `src-tauri/tauri.yoloe.conf.json`, `docs/superpowers/specs/2026-11-03-refine-reclass-design.md`, 이 계획 파일.
- [ ] **Step 2:** `git switch -c feat/refine-reclass`.
- [ ] **Step 3:** 두 커밋으로 나눈다. (a) 코드 변경 + 버전: "Toggle Refine review marks and order sides top, bottom, left, right (v2.32.0)". (b) spec + plan 문서: "Design and plan Refine reclass". 사용자 승인을 받은 커밋만 진행한다(CLAUDE.md: 요청할 때만 커밋).

### Task 1: 판정 도메인 (`reclass.ts`)

**Files:**
- Create: `src/domain/refine/reclass.ts`
- Test: `tests/unit/domain/reclass.test.ts`

**Interfaces:**
- Consumes: `GrayImage`, `RefineRect` from `edge-refine.ts`.
- Produces:
  ```ts
  export interface ReclassRule {
    enabled: boolean;
    fromClasses: string[];            // [] = every class
    toClass: string;
    combine: "and" | "or";
    crop: number;                     // 0.1..1, centre crop fraction of width and height
    mean: { enabled: boolean; min: number };                      // 0..255
    bright: { enabled: boolean; level: number; minRatio: number }; // level 0..255, minRatio 0..1
    shrink: { enabled: boolean; minRatio: number };               // 0..0.99
  }
  export interface ReclassBox { id: string; classId: string; box: RefineRect }  // box in the coordinates of `img`
  export interface ReclassStats { mean: number; brightRatio: number; areaChange: number | null }
  export interface ReclassMatch extends ReclassStats { id: string; ruleIndex: number; toClass: string }
  export function createReclassRule(): ReclassRule;
  export function normalizeReclassRule(value: unknown): ReclassRule;
  export function normalizeReclassRules(value: unknown): ReclassRule[];
  export function centreCrop(box: RefineRect, crop: number, bounds: { width: number; height: number }): RefineRect; // integer px, ≥1×1, clamped
  export function measureReclass(img: GrayImage, box: RefineRect, rule: Pick<ReclassRule, "crop" | "bright">): { mean: number; brightRatio: number };
  export function ruleApplies(rule: ReclassRule, classId: string): boolean;   // enabled, class in fromClasses (or []), toClass !== classId, ≥1 judgment on
  export function judgeReclass(rule: ReclassRule, stats: ReclassStats): boolean;
  export function evaluateReclass(img: GrayImage, boxes: readonly ReclassBox[], rules: readonly ReclassRule[], areaChange: ReadonlyMap<string, number | null>): ReclassMatch[];
  export function describeReclassRule(rule: ReclassRule, className: (id: string) => string | undefined): string;
  ```
- 판정 의미: mean `stats.mean >= mean.min`, bright `brightRatio >= bright.minRatio`(밝은 픽셀 = `value >= bright.level`), shrink `areaChange !== null && -areaChange >= shrink.minRatio`. `combine: "and"`이면 켜진 판정이 모두 참, `"or"`이면 하나라도 참. 켜진 판정이 없으면 false.
- `evaluateReclass`: 박스마다 `rules`를 순서대로 보고 `ruleApplies`이고 `judgeReclass`가 참인 첫 규칙으로 match를 만든다. 측정은 규칙의 `crop`과 `bright.level`로 한다.

- [ ] **Step 1: Write the failing tests** (`tests/unit/domain/reclass.test.ts`, 10×10 회색 이미지를 만드는 헬퍼 사용)
  - `createReclassRule()`가 이 기본값과 같다 [설계 판단]: `{ enabled: true, fromClasses: [], toClass: "0", combine: "or", crop: 0.5, mean: { enabled: true, min: 128 }, bright: { enabled: false, level: 160, minRatio: 0.2 }, shrink: { enabled: false, minRatio: 0.3 } }`.
  - `normalizeReclassRule({ crop: 5, mean: { enabled: true, min: "300" }, bright: { minRatio: -1 }, combine: "x" })`가 crop 1, mean.min 255, bright.minRatio 0, combine `"or"`으로 정리된다. `normalizeReclassRules("nope")`는 `[]`.
  - `centreCrop({x0:0,y0:0,x1:10,y1:10}, 0.5, {width:10,height:10})`은 `{x0:3,y0:3,x1:8,y1:8}`. 가장자리 밖 박스 `{x0:-4,y0:-4,x1:2,y1:2}`은 clamp되어 폭과 높이가 1 이상이다. `crop 0.1`인 2×2 박스도 1×1.
  - 가운데 4×4가 200이고 나머지가 50인 이미지에서 `measureReclass(img, {0,0,10,10}, {crop:0.4, bright:{level:160}})`가 mean 200, brightRatio 1이다. crop 1이면 mean `(16*200+84*50)/100 = 74`, brightRatio `0.16`.
  - `judgeReclass`: mean만 켬 + `min` 경계값(같으면 참). and/or 각각 한 판정만 참일 때 and=false, or=true. 판정이 모두 꺼지면 false. shrink는 `areaChange: null`이면 false, `-0.31`과 `minRatio 0.3`이면 참.
  - `evaluateReclass`: 두 규칙이 모두 맞으면 `ruleIndex` 0. `fromClasses: ["1"]`이면 class "0" 박스는 건너뛴다. `toClass`가 박스 클래스와 같으면 match 없음(Review Focus 2).
  - `describeReclassRule(rule, (id) => id === "0" ? "unfilled" : undefined)`가 `"all classes → 0 unfilled · mean ≥ 128"`. bright와 shrink를 켜고 and이면 `"… · mean ≥ 128 AND bright ≥ 20% AND area −30%"`(연결어는 `combine.toUpperCase()`).
- [ ] **Step 2:** `npx vitest run tests/unit/domain/reclass.test.ts` → FAIL(module not found).
- [ ] **Step 3:** `reclass.ts` 구현. DOM-free(worker에서 import될 수 있다). 숫자 정리는 `edge-refine.ts`의 `num`/limit 방식과 같게: 문자열 숫자 허용, 범위로 자르기, NaN이면 기본값.
- [ ] **Step 4:** 같은 명령 → PASS.
- [ ] **Step 5: Commit** `git add src/domain/refine/reclass.ts tests/unit/domain/reclass.test.ts && git commit -m "Add Refine reclass rules and judgment"`

### Task 2: 설정 문서와 프리셋

**Files:**
- Modify: `src/domain/refine/settings.ts` (`RefineSettingsDocument`, `RefinePreset`, `createRefineSettings`, `parseRefineSettings`, `parsePresetList`, `saveRefinePreset`, `applyRefinePreset`)
- Modify: `saveRefinePreset` 호출부(`src/bootstrap/refine-editor.ts`, `src/bootstrap/refine-lab.ts`; `grep -n saveRefinePreset src`로 확인)
- Test: `tests/unit/domain/refine.test.ts`(settings 테스트가 있는 곳; 없으면 그 파일의 settings describe 옆에 추가)

**Interfaces:**
- Consumes: `ReclassRule`, `normalizeReclassRules` (Task 1).
- Produces: `RefineSettingsDocument.reclass: ReclassRule[]`; `RefinePreset.reclass?: ReclassRule[]`; `saveRefinePreset(doc, name, params, image?, reclass?: readonly ReclassRule[])`. `applyRefinePreset`는 `preset.reclass`가 있으면 `doc.reclass`를 그 복사본으로 바꾸고, 없으면 그대로 둔다.

- [ ] **Step 1: Write the failing tests**
  - `parseRefineSettings('{"default":{}}').reclass`는 `[]`(옛 파일).
  - `reclass: [{ toClass: "0", crop: 9 }, "bad"]`이 들어간 파일은 규칙 1개(crop 1)로 읽히고, 나머지 필드는 그대로 읽힌다(Review Focus 4).
  - `serializeRefineSettings` → `parseRefineSettings` 왕복으로 `reclass`가 보존된다.
  - `saveRefinePreset(doc, "p", params, undefined, [rule])` 후 `applyRefinePreset(other, "p", "default")`는 `other.reclass`를 `[rule]`로 바꾼다. `reclass`가 없는 프리셋을 적용하면 `doc.reclass`는 그대로다.
  - 프리셋 파일 왕복(`serializeRefinePresets` → `parseRefinePresetFiles`)에서 `reclass`가 보존된다.
- [ ] **Step 2:** `npx vitest run tests/unit/domain/refine.test.ts` → 새 테스트 FAIL.
- [ ] **Step 3:** 구현. 호출부는 Lab에서 프리셋을 저장할 때 `draft.reclass`를 넘긴다.
- [ ] **Step 4:** 같은 명령과 `npm run typecheck` → PASS.
- [ ] **Step 5: Commit** "Store reclass rules in refine settings and presets"

### Task 3: 여러 박스의 클래스를 한 번의 undo로 바꾸기

**Files:**
- Modify: `src/features/canvas/detection-canvas-workflow.ts`(`updateBoxGeometries` 옆에 추가), `src/features/canvas/canvas-controller-types.ts:127` 근처
- Test: `tests/unit/features/canvas/canvas-controller.test.ts`

**Interfaces:**
- Produces: `updateBoxClasses?(updates: readonly { annotationId: string; classId: string }[]): number`: 바뀐 박스 수를 돌려준다. 하나의 history entry로 처리하고, 색, 라벨 텍스트, `originalYolo = null`은 `setSelectedLabelClass`와 같게 처리한다. 선택은 보존하고, 바뀐 것이 없으면 history를 남기지 않는다.

- [ ] **Step 1: Write the failing test** `"updateBoxClasses relabels several boxes as one undo step"`: 박스 3개 중 2개를 `"5"`로 바꾸면 반환값 2, `getLabelsAsYolo()`의 해당 줄이 `5 `로 시작한다. `undo()` 한 번에 원래 클래스로 돌아간다. 같은 클래스로 바꾸면 반환값 0이고 history 길이가 그대로다.
- [ ] **Step 2:** `npx vitest run tests/unit/features/canvas/canvas-controller.test.ts -t updateBoxClasses` → FAIL.
- [ ] **Step 3:** 구현. `setSelectedLabelClass`의 박스별 처리 블록을 공유 함수로 빼서 두 곳이 같이 쓴다.
- [ ] **Step 4:** 같은 명령 → PASS.
- [ ] **Step 5: Commit** "Relabel many boxes in one undo step"

### Task 4: C안 표시 체계 (Refine 검토 표시 교체)

**Files:**
- Create: `src/bootstrap/refine-marks.ts`
- Modify: `src/bootstrap/refine-controller.ts:423-517`(`drawOverlay`)
- Test: `tests/unit/bootstrap/refine-marks.test.ts`, `tests/e2e/refine-edges.spec.ts`(기존 area-flag 테스트)

**Interfaces:**
- Produces:
  ```ts
  export const PIN_DIAMETER = 12, DIM_OPACITY = 0.3, CARET_MIN_SIZE = 24;
  export const REVIEW_COLOR = "#f0ad4e", AREA_COLOR = "#dc3545", RECLASS_COLOR = "#e64980";
  export interface MarkTarget {
    id: string; screen: RefineRect;          // screen px
    review?: { weakSides: RefineSide[]; areaChange: number | null };  // areaChange set only when areaFlagged
    reclass?: { toClass: string; label: string };                    // label e.g. "→ 0 unfilled"
    focused: boolean;                                                // selected or current N target
  }
  export interface MarkLayout {
    pins: { x: number; y: number; color: string; text: string }[];   // reclass pin left of review pin
    carets: { side: RefineSide; x: number; y: number }[];
    tags: { x: number; y: number; color: string; text: string }[];
  }
  export function layoutMarks(target: MarkTarget, measure: (text: string) => number): MarkLayout;
  export function drawMarks(context: CanvasRenderingContext2D, layout: MarkLayout): void;
  ```
- 규칙: 핀 중심은 박스 오른쪽 위 모서리이고, 둘이면 reclass 핀이 `PIN_DIAMETER + 2`만큼 왼쪽에 놓인다. review 핀 글자는 `"!"`(면적 플래그면 `AREA_COLOR`), reclass 핀 글자는 `toClass`. 화면 박스의 짧은 변이 `CARET_MIN_SIZE` 미만이면 caret이 없다. 태그는 `focused`이거나 화면 박스 폭이 `measure(text) + 8` 이상일 때만 박스 아래에 그린다. 면적 태그 글자는 기존 `areaText`.

- [ ] **Step 1: Write the failing tests** (`refine-marks.test.ts`, `measure = (t) => t.length * 6`)
  - 30×30 박스에 review + reclass: pin 2개(reclass x가 review x보다 `PIN_DIAMETER + 2` 작음), caret 있음, 태그 0개(`focused: false`, 폭 30 < 태그 폭).
  - 같은 박스에 `focused: true`면 태그 1개(`"→ 0 unfilled"`).
  - 20×20 박스는 caret 0개. 200×100 박스는 focus 없이도 태그가 있다.
  - 면적 플래그 review: 핀 색 `AREA_COLOR`, 태그 `"−42% area"`.
- [ ] **Step 2:** `npx vitest run tests/unit/bootstrap/refine-marks.test.ts` → FAIL.
- [ ] **Step 3:** `refine-marks.ts` 구현. 핀은 원(흰 테두리 1.5px)과 굵은 11px 글자, 태그는 색 배경의 둥근 사각형에 흰 글자.
- [ ] **Step 4:** `drawOverlay`의 review 루프(노란 점선, 4px 변, 빨간 프레임)를 `layoutMarks` + `drawMarks`로 교체한다. preview 그리기(would-be box, 변별 delta)는 그대로 둔다. 흐리게 처리: 표시 대상 id 집합이 비어 있지 않고 "Show review marks"가 켜져 있으면, 표시 대상이 아닌 rect의 `opacity`를 `DIM_OPACITY`로, 나머지는 1로 맞춘다. 값이 바뀐 경우에만 `requestRenderAll()`을 호출한다(`after:render` 안에서 무한 렌더 방지). 표시가 꺼지거나 대상이 없어지면 모두 1로 되돌린다. 박스 라벨 텍스트가 별도 객체이면 같은 불투명도를 준다(`annotation-label-renderer.ts` 확인).
- [ ] **Step 5:** 기존 e2e `"boxes whose area changes past the limit are outlined red…"`를 새 표시에 맞춘다. `redPixels` 색은 그대로(`#dc3545` = 220,53,69)이고, 핀만 있으면 기준이 `> 50`에서 `> 30`으로 바뀔 수 있다. 실제 값을 측정해 핀 하나 면적(약 80px) 기준으로 정하고, 테스트 이름에서 "outlined"를 "pinned"로 바꾼다. 흐리게 처리를 확인하는 단계를 추가한다: 플래그가 없는 박스의 `opacity`가 0.3이고, 스위치를 끄면 1이며, `getLabelsAsYolo()`는 흐리게 처리 전후가 같다(테스트 API에 opacity 조회가 없으면 `__easyLabelingTestApi.getRectOpacities()`를 추가).
- [ ] **Step 6:** `npx vitest run tests/unit/bootstrap/refine-marks.test.ts`, `npm run build`, `npx playwright test tests/e2e/refine-edges.spec.ts --project=chromium` → PASS.
- [ ] **Step 7: Commit** "Mark boxes to review with pins and dim the rest"

### Task 5: 사이드 탭 Reclass 섹션과 후보 흐름

**Files:**
- Modify: `index.html`(Refine pane에서 Settings 섹션 위에 Reclass 섹션), `src/bootstrap/refine-controller.ts`, `src/main.ts`(테스트 API가 필요하면)
- Test: `tests/e2e/refine-edges.spec.ts`

**Interfaces:**
- Consumes: Task 1 `evaluateReclass`, `describeReclassRule`, `ruleApplies`; Task 2 `settings.reclass`; Task 3 `updateBoxClasses`; Task 4 `MarkTarget.reclass`.
- DOM ids: `#refineReclassSummary`, `#refineFindReclassBtn`(`data-refine-run`), `#refineReclassCounter`("0 candidates"), `#refineReclassSelectedBtn`, `#refineReclassAllBtn`.
- Controller 상태:
  - `loadedBoxes: Map<string, RefineRect>`: 박스 id별로 처음 본 `.txt` 크기. `originalYolo`(문자열 정규화 좌표) × 이미지 크기로 만든다. 다음 시점에 아직 없는 id만 채운다: `syncImage()`(살아 있는 rect 중 `originalYolo`가 있는 것), history listener 맨 앞(`entry.before`의 `originalYolo`, `applying` 검사보다 먼저). 이미지가 바뀌면 비운다.
  - `candidates: Map<string, { match: ReclassMatch; signature: string }>`, `dismissed: Map<string, string>`(id → signature). signature는 `"${classId}|${x0}|${y0}|${x1}|${y1}"`(소수 둘째 자리 반올림)이다.
- `findCandidates(): Promise<void>` 흐름:
  1. 설정의 켜진 규칙이 없으면 상태 문구 `"No reclass rule is on."`.
  2. `ruleApplies`가 하나라도 참인 visible 박스를 대상으로 한다.
  3. shrink가 켜진 규칙이 있으면 해당 박스에 `getService().refine(...)`(geometry 적용 없음). `areaChange = resultArea / baseArea − 1`이고 `baseArea`는 `loadedBoxes` 값이 있으면 그것, 없으면 현재 박스. Refine이 꺼진 클래스는 `null`.
  4. 대상 박스들의 합집합 사각형을 `getService().crop(image, union, imageInput(settings.imageSource, settings.processing))`으로 한 번 받고, 박스를 crop 좌표로 옮겨 `evaluateReclass`를 호출한다.
  5. generation token과 이미지 일치를 확인하고(Review Focus 3), `dismissed`의 signature와 같은 박스는 뺀다.
  6. 상태 `"${n} reclass candidate(s) in ${ms} ms"`.
- 검토 queue: 기존 `reviewQueue()`를 Refine 플래그 박스 ∪ 후보(id 중복 제거, 위→아래, 왼→오른 정렬)로 바꾼다. 카운터 두 개를 같이 갱신한다.
- `approve()`(F): 선택 박스의 Refine record를 `reviewed`로 하고, 후보면 `dismissed`에 signature를 넣고 후보에서 뺀다.
- Reclass selected / all: 후보 중 선택된 것(또는 전부)을 `updateBoxClasses`로 한 번에 처리하고 후보에서 뺀다. 상태 `"${n} boxes → class ${to}"`(여러 to면 `"${n} boxes reclassed"`).
- 손으로 수정: history listener(`applying` 아님)에서 geometry나 `labelClass`가 바뀐 id와 삭제된 id를 `candidates`와 `dismissed`에서 뺀다.
- 요약 줄: 규칙이 하나면 `describeReclassRule`, 여럿이면 `"${n} rules"`, 없으면 `"No rules · set them up in Refine Lab"`.

- [ ] **Step 1: Write the failing e2e** `"reclass: finds candidates by brightness and loaded-size shrink, then relabels in one undo step"`
  - `openSemDataset(page, extra)`에 선택 인자 `extra: { rect: Geometry; gray: number }[]`를 추가해 TRUTH 다음에 칠한다. 이 테스트는 `{ rect: {left:30,top:45,right:50,bottom:75}, gray: 40 }`로 box 0의 가운데를 어둡게 만든다.
  - `openSemDataset`에 선택 인자 `settings?: object`도 추가해 mock 폴더의 `.easy-labeling/refine-settings.json`으로 넣는다. 이 테스트는 `{"default":{},"reclass":[{"toClass":"1","crop":0.5,"mean":{"enabled":true,"min":120}}]}`를 쓴다. 규칙 변경도 같은 방식으로 파일을 다시 쓰고 이미지를 다시 연다(또는 테스트 API로 설정을 다시 읽게 한다).
  - Find candidates → `#refineReclassCounter`가 "1 candidate", 후보는 box 1(가운데가 밝음, mean 180)이다.
  - N → F: 카운터 0. Find를 다시 눌러도 0(dismissed 기억).
  - 규칙을 shrink(`minRatio 0.03`, mean off)로 바꾸고, Refine all(Shift+E) 후 Find → box 1이 후보다(불러온 49×52 대비 40×60, −5.8%). 즉 Refine 적용 후에도 기준이 유지된다.
  - Reclass all candidates → `getLabelsAsYolo()`에서 box 1 줄이 `1 `로 시작하고, Ctrl+Z 한 번에 `0 `으로 돌아온다.
  - 이미지 전환 경합(Review Focus 3): Find 직후 바로 다음 이미지로 넘어가는 동작은 이 데이터셋에 이미지가 하나라서 재현하기 어렵다. 대신 Find를 두 번 연속 클릭해도 후보가 1개인지 확인한다.
  - 켜진 규칙이 없을 때 Find하면 `#refineStatus`가 "No reclass rule is on."(Review Focus 5).
- [ ] **Step 2:** `npm run build && npx playwright test tests/e2e/refine-edges.spec.ts --project=chromium -g reclass` → FAIL.
- [ ] **Step 3:** `index.html` 섹션과 controller를 구현한다. 버튼은 기존 `btn-sm` 스타일과 툴팁 규칙을 따르고, 단축키는 없다.
- [ ] **Step 4:** 같은 명령 → PASS. 이어서 spec 전체 실행 → PASS.
- [ ] **Step 5: Commit** "Find reclass candidates and relabel them from the Refine pane"

### Task 6: Refine Lab에서 규칙 편집과 테스트

**Files:**
- Create: `src/bootstrap/reclass-editor.ts`
- Modify: `src/bootstrap/refine-editor.ts`(markup에 `<details class="inspector-section advanced-disclosure refine-details" data-ref="reclassDetails"><summary>Reclass</summary><div data-ref="reclassRoot"></div></details>`를 Edges 섹션 위에 추가하고 마운트), `src/bootstrap/refine-lab.ts`(`LabResult`, `compute`, `drawCase`, `renderCases`, 입력에 `loadedBox`), `src/bootstrap/refine-controller.ts`(Lab 생성 시 `loadedBox: (id) => loadedBoxes.get(id) ?? null` 전달)
- Test: `tests/e2e/refine-edges.spec.ts`

**Interfaces:**
- `createReclassEditor(input: { root: HTMLElement; prefix: string; documentRef: Document; store: RefineEditorStore }): { render(): void }`: `store.getDoc().reclass`를 편집하고 `store.setDoc({ ...doc, reclass })`로 반영한다(Lab draft 원칙).
- 규칙 하나의 필드 id(prefix `refineLab`, i = 규칙 index): `${prefix}Reclass${i}-enabled`, `-from`(class 다중 선택; 비우면 All), `-to`(select), `-combine`(AND/OR 토글), `-crop`(%), `-meanOn`, `-meanMin`, `-brightOn`, `-brightLevel`, `-brightRatio`(%), `-shrinkOn`, `-shrinkRatio`(%). 버튼: `Add rule`, 규칙별 삭제와 위/아래 이동.
- `LabResult.reclass: ReclassMatch | null`과 `LabResult.reclassStats: ReclassStats | null`(규칙이 이 케이스를 검사하지 않으면 null).
- `compute(c)`: `ruleApplies`가 참인 규칙이 있으면 `c.img`/`c.local`로 측정한다. areaChange는 `result`(이미 계산된 `refineBox`)의 면적 ÷ `loadedBox(c.id)`(없으면 `c.box`)의 면적 − 1이고, refine이 꺼져 있으면 null.

- [ ] **Step 1: Write the failing e2e** `"refine lab: tunes a reclass rule and shows which cases match"`
  - Task 5와 같은 장면에서 Lab을 열고 Reclass 펼치기 → Add rule → to `1`, mean on, min 120.
  - 케이스 목록 요약에 `"1 of 2 match"`. box 1 케이스에 마젠타 핀(픽셀 색 확인)과 수치 줄 `mean 180`.
  - min을 200으로 → `"0 of 2 match"`.
  - Save settings → 설정 파일 `reclass[0].mean.min === 200`.
- [ ] **Step 2:** build + 해당 테스트 → FAIL.
- [ ] **Step 3:** `reclass-editor.ts`를 구현하고, Lab 그리기를 추가한다.
  - 상세 줌 뷰: 가운데 crop을 마젠타 점선 사각형으로, bright가 켜져 있으면 crop 안의 `≥ level` 픽셀을 `rgba(230,73,128,0.35)`로 덮는다.
  - 케이스 썸네일: match면 `layoutMarks`의 핀.
  - 수치 줄: `mean 142 · bright 23% · area −31%`. 기준을 넘은 값은 `RECLASS_COLOR`로 칠한다.
  - 요약: `fromClasses`에 맞는 케이스만 세서 `"N of M match"`.
- [ ] **Step 4:** PASS. spec 전체 실행 → PASS.
- [ ] **Step 5: Commit** "Edit and test reclass rules in Refine Lab"

### Task 7: 밀집 화면 확인, 문서, 버전, 전체 검증

**Files:**
- Modify: `tests/e2e/refine-edges.spec.ts`, `.claude/skills/refine-edges/SKILL.md`(Reclass 절 추가: 파일, 판정, 기준 면적, 표시 체계), `docs/` 사용자 문서 중 Refine 설명이 있는 한국어 문서(`grep -rl "Refine" docs/*.md`로 찾아 Reclass 사용법 한 절), 버전 파일(Global Constraints)

- [ ] **Step 1: e2e** `"reclass: pins stay readable on a 3072×2048 image with 700 boxes"`: `openSemDataset` 변형으로 3072×2048 이미지에 28×25 격자 박스 700개를 만들고, 그중 30개 가운데를 밝게 칠한다. Find → 카운터 "30 candidates". 상태 문구의 ms 값을 기록해 테스트 출력에 남긴다(spec 목표는 800개 1초 이내다. CI 부하를 고려해 assert는 3000ms 미만으로 두고, 1초를 넘으면 보고한다). 흐린 박스 불투명도 0.3을 확인한다. 전체 맞춤 줌에서 태그가 0개 그려졌는지(focus 없음) 확인한다. 테스트 API로 마지막 `MarkLayout` 목록 길이를 노출하거나 overlay 마젠타 픽셀 수로 판단한다. N 한 번 후 태그 1개. 라이트와 다크에서 `test-results/reclass-dense-light.png`, `-dark.png`를 찍는다.
- [ ] **Step 2:** 스크린샷을 직접 열어 핀이 이웃 박스를 가리지 않는지, 다크 테마에서 흰 테두리가 보이는지 확인한다. 문제가 있으면 `refine-marks.ts` 상수만 조정하고 Task 4 단위 테스트를 갱신한다.
- [ ] **Step 3:** 스킬 문서와 사용자 문서, 버전을 갱신한다.
- [ ] **Step 4: Verify**: `/verify` 스킬을 따른다. `npm run typecheck`, `npm run test:unit`(`main.import-smoke`/`canvas-controller` 5초 타임아웃은 단독 재실행으로 확인), `npm run build`, `npx playwright test tests/e2e/refine-edges.spec.ts --project=chromium` 모두 PASS. 데스크톱(Tauri) 경로는 crop만 쓰므로 `npm run tauri:dev` 후 `tests/e2e/tauri-desktop.spec.ts`의 refine 관련 테스트가 PASS하는지 확인한다(exe가 없으면 skip된 것으로 보고하고 통과로 보지 않는다).
- [ ] **Step 5: Commit** "Document Refine reclass and check dense images (v2.3x.0)"
