# UI/UX 개선 계획

2026-09-16 디자인 감사([아티팩트](https://claude.ai/artifact/NDKYrQrFM4H7cRNgMfFMhw))에서
나온 8개 항목의 진행 상황을 추적합니다. 우선순위(High → Low) 순으로 진행.

추가로 2026-09-17에 순수 미감(배치·색조합) 관점의 시안 4건
([아티팩트](https://claude.ai/artifact/CWsQnjMsCgtmYZqtEue662))을 만들어 진행했습니다 —
"진척도 (addendum)" 섹션 참조.

## 진척도

- [x] **1. 토스트가 툴바를 가리는 문제 수정** — 완료. (`css/style.css`)
- [x] **2. 이미지 목록 썸네일 추가** — 완료. (`src/ui/image-thumbnails.ts`, `src/ui/renderers.ts`)
- [x] **3. Detection/Segmentation Classes 패널 정리** — 범위 축소해서 완료
      (아래 상세 기록 참조).
- [x] **4. 글자 크기 스케일 정리** — 완료(아래 상세 기록 참조, 실제로는
      11단계가 아니라 25단계였음).
- [x] **5. 모서리 둥글기 토큰 정리** — 완료.
- [x] **6. 이미지 목록 배지 툴팁/아이콘화** — 재확인 결과 이미 구현되어 있었음
      (아래 상세 기록 참조), 추가 작업 불필요.
- [x] **7. Annotations 목록 그룹 접힘/가상 스크롤** — 재확인 결과 이미 완전히
      구현되어 있었음(아래 상세 기록 참조), 추가 작업 불필요.
- [x] **8. X/Y 좌표 입력창** — 재확인 결과 이미 옆에 "X"/"Y" 텍스트 라벨이
      붙어 있어 문제 없음(아래 상세 기록 참조), 추가 작업 불필요.

## 진척도 (addendum, 2026-09-17 미감 시안 4건)

- [x] **A2. Save 버튼 색상 통일** — 완료. (`index.html`)
- [x] **A3. 다크/라이트 경계 완화** — 완료. (`css/style.css`)
- [x] **A4. 상단 툴바 이미지 내비게이션 밀도** — 완료. (`css/style.css`)
- [x] **A5. Open Dataset 버튼 그룹 결합** — 완료. (`css/style.css`)

### A2. Save 버튼 색상 통일 (완료, 2026-09-17)

`index.html`의 `#saveLabelsBtn` 클래스를 `btn btn-success`(초록)에서
`btn btn-primary`(파랑)로 변경. Open Dataset, 좌표 이동 핀 등 앱 전체의
주요 액션 색과 통일됨. 저장 완료 토스트 등 실제 "성공 상태" 표시에는
초록을 그대로 남겨서 의미 구분은 유지.

### A3. 다크/라이트 경계 완화 (완료, 2026-09-17)

다크 아이콘 레일(`.task-rail`)과 순백 패널(`.control-panel`)이 1px 선으로
바로 맞닿아 경계가 딱딱했던 문제. 전역 `--workbench-surface` 토큰은
30곳 넘게 쓰여서 건드리면 범위가 너무 커지므로, 경계에 실제로 맞닿는
`.dataset-panel`(좌측 패널)에만 스코프를 좁혀 수정:
`background: color-mix(in srgb, var(--workbench-surface) 97%, var(--workbench-charcoal) 3%)`로
아주 약하게 톤을 낮추고, `box-shadow: inset 6px 0 12px -10px rgba(0,0,0,.35)`로
경계 안쪽에 옅은 그림자를 추가.

### A4. 상단 툴바 이미지 내비게이션 밀도 (완료, 2026-09-17)

`.image-navigation`(`< 파일명 >` 영역)이 배경 없이 텍스트만 떠 있어
옆의 Draw/Automation/Edit 세그먼트 컨트롤과 시각적 무게감이 달랐던 문제.
`padding: 5px 14px; background: rgba(255,255,255,.06); border-radius: 999px;`
추가해 pill 형태로 묶음 — 다크 네브바의 기존 호버 톤(`rgba(255,255,255,.1)`)보다
옅은 값을 사용해 평상시엔 은은하게, 툴바의 다른 요소들을 압도하지 않게 함.

### A5. Open Dataset 버튼 그룹 결합 (완료, 2026-09-17)

`.dataset-actions`의 Open Dataset(주 버튼) + 새로고침/폴더전환(아이콘 버튼) 3개가
각각 독립된 사각형으로 따로 놀던 문제. `gap: 6px` → `0`으로 바꾸고 Bootstrap
`.btn-group` 관례대로 안쪽 모서리는 `border-radius: 0`, 안쪽 경계선은
`border-left: none`으로 겹치는 이중 테두리를 제거, 그룹 오른쪽 끝(`:last-child`)에만
`border-radius: var(--radius-sm)`를 남겨 하나의 결합된 컨트롤로 보이게 함.

**검증**: 4건 모두 `npm run build` 후 fresh vite 서버(`--port 4531`,
`node_modules/.vite` 삭제) + 실제 Chromium으로 라이트/다크 모드 양쪽 스크린샷
촬영해 확인. `npm run test:unit`(376개 전체 통과) + `npm run typecheck` 통과
(CSS/HTML만 변경이라 TS 영향 없음, 회귀 없음 확인 차원).

## 진척도 (addendum 2, 2026-09-17 좌측 탭 구성 검토)

Detection/Segmentation 양쪽에서 좌측 탭(task-rail) 버튼을 하나씩 클릭해가며 실제
Chromium으로 검토, 개선 필요 항목 4건 발견. 1·2번 먼저 진행.

- [x] **B1. Files ↔ Annotate/Mask 탭이 동일한 화면으로 보이는 문제** — 완료(제목·부제
      텍스트로 구분). (`src/bootstrap/ui-manager-adapter.ts`)
- [x] **B2. Review 탭 패널 제목이 "Files & Classes"로 고정되는 문제** — 완료.
      (`src/bootstrap/ui-manager-adapter.ts`)
- [x] **B3. Segmentation Files/Mask 탭 하단 빈 공간** — 완료. (`css/style.css`)
- [x] **B4. Segmentation에 Detection의 Review에 대응하는 워크플로우 부재** — 사용자
      확인 결과 현재 상태가 의도된 설계, 코드 변경 없음(아래 상세 기록 참조).

### B1·B2. 좌측 패널 제목/부제 로직 정리 (완료, 2026-09-17)

`ui-manager-adapter.ts`의 `leftPanelTitle` 갱신 로직이 `preprocessing` /
`segmentation-display` / `superpixel` / `detection-display` 4개 task만 개별
제목을 주고, 나머지(`files`, `annotate`, `segmentation`, `review`)는 전부
`else` 분기로 떨어져 "Files & Classes"로 고정돼 있었음. 실제로 스크린샷
픽셀 diff까지 떠보니 Files ↔ Annotate(Detection)/Mask(Segmentation) 탭은
콘텐츠가 100% 동일해서 클릭해도 아무 반응이 없는 것처럼 보였고, Review 탭은
콘텐츠(리뷰 큐)가 완전히 다른데도 제목만 "Files & Classes"에 dataset 상태
부제까지 그대로 남아 있었음.

`settingsOnlyTaskTitles`(제목 주고 부제 숨김: preprocessing/segmentation-display/
superpixel/detection-display/**review**)와 `browsingTaskTitles`(제목만 구분,
부제는 dataset 상태 유지: **annotate → "Annotate"**, **segmentation → "Mask"**)
두 개의 매핑 테이블로 정리해 기존 4개 분기 대신 하나의 룩업으로 통합.

Files/Annotate/Mask 탭의 실제 목록 콘텐츠(이미지 목록 + 클래스 목록)는 의도적으로
그대로 유지 — 세 탭 모두 "데이터셋을 훑어보는" 성격이 같아서 하나로 합치거나
콘텐츠를 억지로 다르게 만드는 것보다, 제목이 클릭을 정확히 반영하도록 하는 쪽이
더 안전한 수정이라고 판단함(탭 삭제·병합은 e2e 스펙과 테스트 픽스처에 걸쳐있어
범위가 커짐).

**검증**: `npm run typecheck` + `npm run test:unit`(376개) 통과, 기존 e2e
스펙(`workflow-switching.spec.ts`)이 확인하는 "Display Settings"/"Mask Display"/
"Superpixel Settings" 타이틀은 변경 없이 유지됨을 소스로 확인. 실제 Chromium으로
Detection 5탭 + Segmentation 5탭 전부 클릭해 제목·부제 텍스트를 로그로 캡처—
Files "Files & Classes", Annotate "Annotate", Mask "Mask", Review "Review"(부제
숨김)로 정확히 갱신됨을 확인.

### B3. Segmentation Files/Mask 탭 하단 빈 공간 (완료, 2026-09-17)

원인을 코드로 추적해보니, `.dataset-save-bar`(Auto save/Save 행)가 항상 화면
하단에 고정되는 건 다른 모든 탭과 동일한 의도된 구조(어느 탭에서도 스크롤 없이
Save에 바로 접근 가능해야 함)라 건드리면 안 됨. 실제 문제는 그 위의
`#segmentationFormatShortcut`("Format" 버튼)에 상단 구분선이 없어서, 콘텐츠가
짧은 Files/Mask 탭에서는 빈 공간이 "레이아웃이 깨진 것"처럼 보인다는 점.

`.dataset-save-bar`가 이미 갖고 있는 `border-top: 1px solid var(--workbench-border)`
패턴을 `#segmentationFormatShortcut`에도 동일하게 적용(`padding-top: 12px`
+ `border-top`)해서, "Format + Save"가 탭 콘텐츠와 분리된 고정 액션
영역이라는 게 시각적으로 명확해지도록 함. 스크롤 콘텐츠와 하단 고정
영역 사이의 flex 구조 자체는 건드리지 않음(다른 탭들의 스크롤 동작에
영향 없게 최소 범위로 수정).

**검증**: `npm run build` 후 fresh vite 서버 + 실제 Chromium으로 Segmentation
Files 탭 좌측 패널 스크린샷 재확인, `npm run test:unit`(376개) + `npm run
typecheck` 통과.

### B4. Segmentation Review 워크플로우 부재 (확인 완료, 2026-09-17)

Detection의 Review 탭(최소 박스 크기, 중복 IoU, 필수 클래스 등 품질 규칙 +
리뷰 큐)에 대응하는 기능이 Segmentation에는 없다는 점을 사용자에게 확인 요청.
사용자가 "현재는 의도된 설계로 두기"를 선택 — Detection의 Review 규칙은
박스 데이터 전용 로직이라 마스크에 그대로 옮길 수 없고, 실제 세그멘테이션
검수 수요가 생기면 그때 별도로 설계하기로 함. 코드 변경 없음.

## 항목별 상세 기록

작업 완료 시 이 아래에 날짜, 변경 내용, 검증 방법(스크린샷 등)을 추가.

### 7. Annotations 목록 그룹/가상 스크롤 재확인 (2026-09-16, 감사 내용 정정)

`ui-manager-adapter.ts:1326`의 `updateLabelList()`를 읽어보니 이미 다 구현돼
있었음: 클래스별 그룹핑, 접기/펼치기 토글, 전체 박스 수가 150개를 넘으면
**모든 그룹을 자동으로 접은 상태로 시작**, 펼쳤을 때도 그룹당 최대 80개만
렌더링하고 나머지는 "Show N more (M remaining)" 버튼으로 추가 로드 —
감사에서 제안했던 해법과 사실상 동일한 구조가 이미 있었음. 처음 감사할 때
샘플 데이터가 32개짜리 그룹 하나뿐이라 임계값(150개) 이하라 아무 완화
장치도 안 보였던 것뿐.

**실제 검증** (실제 Chromium, `seedDetectionBoxesForTest`로 박스 수를 늘려가며):
- 52개(기본 샘플): 그룹 전부 펼쳐짐, 개수 정확
- 500개(클래스당 100개)로 늘리면: 그룹 전부 자동 접힘, 개수도 100으로 정확히
  갱신
- 100개짜리 그룹을 펼치면: 정확히 80개만 렌더링 + "Show 20 more (20
  remaining)" 버튼 노출

중간에 테스트 스크립트 자체의 타이밍 경합(시딩 직후 안정화를 안 기다리고
바로 확인)으로 오래된 개수가 보이는 혼란이 있었으나, 초기 로드 렌더링이
안정화되길 기다린 후 확인하니 매번 일관되게 정확한 결과가 나옴 — 실제
앱의 문제가 아니라 제 검증 스크립트의 문제였음. 추가 작업 없음.

### 8. X/Y 좌표 입력창 재확인 (2026-09-16, 감사 내용 정정)

`index.html:52-53`를 보니 `<label class="toolbar-field"><span>X</span><input ...></label>`
구조로, 입력창 바로 왼쪽에 실제 "X"/"Y" 텍스트가 항상 보이게 붙어 있음
(스크린샷에서도 매번 "X [ ] Y [ ]"로 보였던 것이 이것). placeholder는
값이 비어있을 때만 보이고 입력 중엔 사라지는 반면, 이 라벨은 항상 고정으로
보여서 오히려 더 명확함. 항목 6과 마찬가지로 스크린샷만 보고 "빈 입력창
같다"고 잘못 판단했던 것 — 실제로는 처음부터 문제 없었음. 추가 작업 없음.

### 1. 토스트 겹침 수정 (완료, 2026-09-16)

`css/style.css`의 `#toast-container`를 `position:absolute; top:20px; right:20px`에서
`position:absolute; bottom:20px; right:20px`로 변경.

**처음 시도했다가 되돌린 방법**: `position:fixed`로 바꿔 뷰포트 기준 헤더 아래로
내렸더니, 이번엔 우측 Annotation Inspector 패널을 가리는 새 문제가 생겨서 롤백.
원인: `position:fixed`는 뷰포트 전체 기준이라 3단 레이아웃(좌/캔버스/우) 중
캔버스 칸에만 머물지 않음.

**최종 방법**: 캔버스 하단으로 이동. `#canvas-container` 내부에서
`position:absolute`를 유지하되 `top` 대신 `bottom`을 씀 — 그러면 (1) 캔버스
칸 안에만 위치해 좌우 패널을 가리지 않고, (2) 상단 Draw/Automation/Edit
툴바(디텍션 1행 vs 세그멘테이션 6버튼이 좁은 화면에서 2행으로 줄바꿈되는 것까지
포함)의 정확한 높이를 몰라도 되고, (3) 하단 상태바(`workspace-status-bar`)는
`#canvas-container` 바깥의 형제 요소라 자동으로 안 겹침.

**검증**: 디텍션/세그멘테이션 양쪽 탭에서 실제 Chromium 스크린샷으로 확인 —
툴바·좌우 패널·하단 상태바 어디와도 겹치지 않음. `npm run test:unit`(370개) 통과.

### 2. 이미지 목록 썸네일 추가 (완료, 2026-09-16)

`src/ui/image-thumbnails.ts` 신규 추가 — `IntersectionObserver` 기반 지연 로딩
썸네일 로더. 화면에 보이는(또는 200px 이내로 다가온) 행만 `createImageBitmap(file,
{resizeWidth:56, resizeHeight:56})`로 디코딩해 28×28 `<canvas>`에 직접
그림(`toDataURL` 경유 없음). TIFF는 의도적으로 제외 — tiff.js WASM 디코더가
느려서 스크롤 중 여러 TIFF를 한꺼번에 디코딩하면 이번 세션에서 고친
TIFF 성능 문제를 다시 불러올 위험이 있음(대신 일반 파일 아이콘 표시).
파일당 한 번만 디코딩하도록 캐싱.

**실제 앱에서 발견한 버그(유닛 테스트만으론 못 잡았던 것)**: 앱 초기화 중
`renderImageList()`가 이미지 목록 DOM을 4~5차례 통째로 새로 그리는데
(`innerHTML=""`로 기존 캔버스 전부 제거 후 재생성), 이전 렌더의 캔버스에서
시작된 디코딩이 아직 끝나지 않은 상태로 그 캔버스가 DOM에서 사라지면,
디코딩이 완료돼도 그 결과를 그릴 대상이 없어져 새로 생긴 같은 파일의
캔버스는 영원히 "pending" 상태로 멈춰버림 — 실제 브라우저로 검증하다가
발견(유닛 테스트는 이 "렌더 도중 교체" 시나리오를 안 다뤄서 못 잡음).
`waiters: Map<string, Set<canvas>>`로 같은 파일을 기다리는 모든 캔버스를
추적해 디코딩 완료 시 전부(연결된 것만) 그리도록 수정 — 회귀 테스트 추가.
곁들여 발견한 2차 문제: 교체되어 DOM에서 사라진 캔버스가
`IntersectionObserver`에 영원히 남아있는(메모리 누수) 것도 `observe()`
호출마다 정리하도록 처리.

**검증**: 유닛 테스트 6개(`tests/unit/ui/image-thumbnails.test.ts`, 버그
재현 케이스 포함) + 기존 `renderers.test.ts` 구조 변경 반영. 실제
Chromium에서 스크롤하며 17개 이미지 전부 "ready" 상태로 정상 디코딩되고
실제 썸네일 픽셀이 그려지는 것 확인. `npm run test:unit`(376개), typecheck 통과.

### 3. Classes 패널 정리 (완료, 2026-09-16 — 원래 제안에서 범위 축소)

원래 감사 제안은 "세그멘테이션에도 좌측에 스와치·이름·칠해진 비율·가시성
토글을 detection과 동일하게 표시"였음. 코드를 뜯어보니 세그멘테이션에는
이미 **우측 Mask Inspector**("Paint class" 선택 버튼들 + "Display filter" +
클래스별 가시성 체크박스)에 사실상 동일한 기능이 전부 구현돼 있었음
(`ui-manager-adapter.ts` 약 395~490줄). 좌측에 또 하나를 통째로 복제하면
같은 상태를 두 군데서 관리하게 돼 유지보수 부담만 커지고 실제 가치는
낮다고 판단해 범위를 줄임.

**실제로 한 것**: 좌측 "Classes" 섹션은 원래 detection 전용
(`renderLabelFilters`가 Fabric `rect` 객체 기반으로 만들어 세그멘테이션에서는
그냥 텅 빈 채로 남아있었음 — 감사에서 지적한 "빈 섹션" 문제의 진짜 원인).
세그멘테이션 모드일 때 그 빈 검색창+리스트를 숨기고, "클래스 칠하기·가시성
설정은 우측 Mask Inspector 패널에 있습니다"라는 안내 문구로 교체. "Load
Class Info Folder"/클래스 파일 선택 드롭다운은 두 워크플로우 모두에
적용되므로 그대로 유지.

**중간에 잡은 CSS 버그**: `.hidden` 속성만 토글하면 끝날 줄 알았는데,
`.class-filter-list`가 이미 `display:flex`를 선언하고 있어서 브라우저 기본
`[hidden] { display:none }` 규칙과 동일한 우선순위에서 작성자 스타일시트가
이겨버려 아무 효과가 없었음 — `[hidden]` 전용 오버라이드 규칙을 추가해서 해결.

**검증**: 실제 Chromium에서 detection/segmentation 양쪽 좌측 패널 스크린샷
비교, `dom-elements.test.ts`/`ui-manager-adapter.test.ts` 갱신,
`ui-consistency.spec.ts`/`workflow-switching.spec.ts`/`filter-visibility.spec.ts`/
`class-file-profile.spec.ts`/`sample-test-data.spec.ts` e2e 전부 통과 확인.
`npm run test:unit`(376개), typecheck 통과.

### 4. 글자 크기 스케일 정리 (완료, 2026-09-16)

`css/style.css`에 `--fs-badge`(11px) / `--fs-caption`(12px) / `--fs-body`(13px) /
`--fs-emphasis`(14px) / `--fs-section`(16px) / `--fs-title`(20px) 6단계 토큰을
`:root`에 정의. 실제로 세어보니 감사 때 대충 훑어본 "11단계"가 아니라 기본
스타일시트에서만 **25개의 서로 다른 값**(0.58rem~1.45rem)이 쓰이고 있었음 —
Python으로 중괄호 깊이를 추적해 `@media`/`@container` 안의 반응형 오버라이드
6곳은 건드리지 않고(의도적인 좁은 화면 대응이라 건드리면 위험), 기본
스타일시트의 109곳만 가장 가까운 토큰으로 스크립트 치환. 아주 작은 진행률
텍스트(`.automation-batch-progress .progress-bar`, 0.58rem) 1곳은 좁은
막대에 맞춰 의도적으로 작게 잡은 값이라 토큰화하지 않고 그대로 둠.

**검증**: 스크립트 치환 후 중괄호 개수 불변 확인(문법 안 깨짐), `npm run
test:unit`(376개) 통과, 명시적으로 글자 크기 하한을 검사하는
`ui-consistency.spec.ts`를 포함해 라이트/다크·양쪽 워크플로우 전체 화면을
실제 Chromium 스크린샷으로 확인 — 텍스트 잘림/줄바꿈 깨짐 없음.

### 5. 모서리 둥글기 토큰 정리 (완료, 2026-09-16)

`--radius-sm`(4px, 배지·입력·작은 버튼) / `--radius-md`(8px, 카드·패널·모달)
2단계 토큰 추가. 2px/3px/4px/0.25rem/0.3rem → `--radius-sm`, 5px/6px/7px/8px/0.5rem
→ `--radius-md`로 54곳 치환. 원(50%)·필(999px)·리셋(0)·`inherit`·비대칭
다중값(`0 2px 2px 0`) 15곳은 의미가 달라서 그대로 둠. 검증은 항목 4와 동일한
방식(중괄호 검사 + 유닛테스트 + 실제 스크린샷).

### 6. 이미지 목록 배지 재확인 (2026-09-16, 감사 내용 정정)

`src/ui/renderers.ts` 소스를 직접 확인해보니 애초에 문제가 아니었음 —
박스 개수 배지(`count.title = "${boxCount} detection boxes"`)와 리뷰
이슈 배지(`reviewBadge.title = "${finding.issues.length} review issues"`)
모두 이미 `title` 속성(호버 툴팁)이 붙어 있었음. 최초 감사에서 정적
스크린샷만 보고 "툴팁 없음"으로 잘못 판단한 것 — 호버 전용 요소는
스크린샷에 안 나타난다는 걸 간과함. 실제 코드를 안 보고 화면만 보고
단정하면 이런 오류가 생긴다는 교훈. 추가 작업 없음.
