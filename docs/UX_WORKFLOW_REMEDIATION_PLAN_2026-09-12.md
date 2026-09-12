# UX 작업 흐름 개선 계획 및 진척도

- 작성일: 2026-09-12
- 범위: Segmentation 기본 클래스/숫자키, Detection Algorithm Input, Detection 좌우 패널과 도구 상태 모델
- 현재 단계: I-01~I-08 구현 및 검증 완료
- 코드 변경: 있음

## 1. 목적

이번 작업은 네 가지 현상을 개별 패치로만 처리하지 않고, 사용자가 보고 있는 작업공간과 실제 활성 도구가 일관되게 연결되도록 정리하는 것을 목표로 한다. 특히 Detection 패널 문제는 하나의 `activeTask`가 왼쪽 작업공간, 오른쪽 Inspector, 상단 도구를 동시에 표현하는 현재 구조를 먼저 분리한 뒤 개선한다.

## 2. 상태 표기

| 상태 | 의미 |
| --- | --- |
| `확인 완료` | 현재 UI와 코드에서 현상을 재현하고 원인을 좁힘 |
| `결정 대기` | 구현 계약을 사용자와 확정해야 함 |
| `계획 완료` | 구현 순서와 검증 기준을 작성함 |
| `진행 중` | 코드 또는 테스트 수정 중 |
| `검증 대기` | 구현 완료 후 자동/수동 검증 전 |
| `완료` | 수용 기준과 회귀 검증을 모두 통과함 |
| `보류` | 외부 조건 또는 별도 결정이 필요함 |

## 3. 현상 확인 결과

### I-01. Segmentation 진입 시 클래스 1이 보이지만 그리기 도구가 비활성화됨

- 상태: `확인 완료` / 결정 `D-01 A 확정` / 구현 `미착수`
- 재현:
  1. 샘플 데이터를 연다.
  2. Detection에서 Segmentation으로 전환한다.
  3. 클래스 `1` 버튼은 선택된 것처럼 보이지만 Brush, Polygon, Superpixel, AI Select가 비활성화된다.
  4. 안내문은 `Choose a paint class before drawing.`으로 표시된다.
- 원인:
  - `src/features/segmentation/workflow.ts`는 새 이미지마다 `hasExplicitPaintClassSelection`을 `false`로 초기화한다.
  - 문서의 `activeClassId` 기본값은 이미 `"1"`이지만, 명시 선택 여부가 별도 플래그이므로 UI는 계속 선택 필요 상태로 판단한다.
  - `src/bootstrap/ui-manager-adapter.ts`가 `requiresClassSelection`을 기준으로 가산형 도구를 비활성화한다.
- 문제 성격: 내부 상태와 화면 표현이 충돌한다. 클래스 1이 활성처럼 보이는데 실제 입력은 막혀 있어 사용자가 고장으로 오해할 수 있다.
- 권장 방향: 사용 가능한 양수 클래스 중 `1`을 우선 기본 Paint 클래스로 확정한다. `1`이 없으면 첫 번째 양수 클래스를 사용하고, 양수 클래스가 하나도 없을 때만 기존 선택 안내와 비활성 상태를 유지한다. 배경 클래스 `0`은 Paint 기본값으로 사용하지 않는다.

### I-02. Segmentation 숫자키가 선택 도구를 Brush로 바꿈

- 상태: `확인 완료` / 결정 `D-02 A 확정` / 구현 `미착수`
- 재현:
  1. Segmentation에서 클래스 1을 선택한다.
  2. Polygon을 선택한다.
  3. 숫자키 `2`를 누른다.
  4. 활성 클래스가 2로 바뀌는 동시에 도구가 Brush로 바뀐다.
- 원인:
  - `src/bootstrap/event-manager-adapter.ts`의 숫자키 처리에서 `setSegmentationActiveClass(event.key)` 직후 `setSegmentationTool("brush")`를 호출한다.
- 권장 방향:
  - `1`~`9`: 클래스만 바꾸고 현재 도구는 유지한다.
  - `0`: 기존 단축키 계약대로 Erase로 전환한다.
  - 주 키보드의 숫자열과 숫자패드 `Numpad0`~`Numpad9`를 같은 규칙으로 처리한다.
  - 숫자패드는 `KeyboardEvent.key`, `code`, `location`을 기준으로 숫자를 정규화하되, Num Lock이 꺼져 탐색키로 동작하는 경우에는 단축키로 가로채지 않는다.
  - 입력 필드, 모달, Ctrl/Alt/Meta 조합에서는 기존 키보드 보호 규칙을 유지한다.

### I-03. Detection Algorithm Input과 Template Matching Setup의 적용 범위가 불명확함

- 상태: `확인 완료` / 결정 `D-03 A 확정` / 구현 `미착수`
- 재현:
  1. Detection > Preprocess에서 Algorithm Input을 `Processed`로 바꾼다.
  2. Automation > Template Matching Setup을 연다.
  3. 모달의 기준 이미지, ROI 작업공간, preprocessing preview에는 전역 Algorithm Input 상태가 표시되지 않고 원본 기준으로 보인다.
- 코드 확인:
  - `src/bootstrap/automation-controller.ts`의 `prepareAutomationImageData`는 Algorithm Input이 `processed`이면 공용 이미지 전처리를 적용한다.
  - 현재 이미지 실행, 저장 프리셋 실행, Batch 실행 경로에는 이 함수가 연결되어 있다.
  - 반면 Template Matching Setup의 `workspace.setImage(...)`와 `workspace.renderPreviews(...)`는 원본 이미지 및 템플릿 자체 전처리만 사용한다.
- 결론: Algorithm Input이 실행 엔진에 전혀 적용되지 않는 문제라기보다, **실제 실행 파이프라인과 Setup 미리보기/ROI 작업공간이 서로 다른 입력을 보여주는 일관성 문제**다.
- 권장 계약:
  1. Algorithm Input은 Automation 전체의 기본 입력 소스를 결정한다.
  2. `Processed`이면 공용 전처리를 기준 이미지, ROI 추출, Setup preview, 현재 이미지 실행, 프리셋 실행, Batch에 동일하게 적용한다.
  3. Template Matching 고유 preprocessing은 기본 입력 소스 뒤에 정확히 한 번 적용한다.
  4. Setup에 `Base input: Original/Processed` 상태를 명시하고, 입력 소스나 공용 전처리 설정이 바뀌면 ROI/preview와 match cache를 갱신한다.

### I-04. Detection의 왼쪽 탭, 상단 도구, 오른쪽 Inspector가 한 상태로 뒤섞임

- 상태: `확인 완료` / 결정 `D-04 A 확정` / 구현 `미착수`
- 재현:
  - Draw 또는 Edit를 누르면 왼쪽 `Annotate`가 강제로 활성화되고 오른쪽 Annotation Inspector가 열린다.
  - Automation을 누르면 오른쪽 Automation Workspace가 열리지만 왼쪽 레일에는 대응 항목이 없어 모든 왼쪽 탭이 비활성처럼 보인다.
  - Files, Display, Preprocess, Review는 항목별로 왼쪽 또는 오른쪽 패널을 서로 다르게 움직인다.
- 원인:
  - `src/bootstrap/ui-manager-adapter.ts`의 단일 `activeTask`가 왼쪽 작업공간, 오른쪽 Inspector, 도구 선택, 모바일 패널 포커스를 동시에 제어한다.
  - `src/bootstrap/event-manager-adapter.ts`는 Draw/Edit에서 `annotate`, Automation에서 `automate`를 같은 상태 축에 기록한다.
- 문제 성격: CSS 조정이 아니라 정보 구조와 상태 모델의 결합 문제다. 부분 수정 시 다른 탭, 모바일 패널, Inspector 복원 동작이 회귀할 가능성이 높다.
- 권장 상태 모델:
  - `workflow`: detection / segmentation
  - `leftWorkspace`: files / annotate / display / preprocessing / review 등
  - `activeTool`: draw / edit / automation 또는 segmentation 도구
  - `rightInspector`: annotation / transform / automation
  - `panelVisibility`: 좌우 접힘과 compact 화면 표시 상태
- 권장 상호작용: 왼쪽 레일은 왼쪽 작업공간만, 상단 도구는 캔버스 도구만 제어한다. Draw/Edit/Automation을 바꿔도 현재 왼쪽 탭을 보존하고, 오른쪽 Inspector만 도구에 맞게 연동한다.

#### 현재 Detection 왼쪽 레일과 오른쪽 작업공간 결합 현황

아래 표는 구현 전 반드시 테스트와 실제 화면에서 다시 고정해야 할 현행 기준이다. `이상적인 동작`이 아니라 현재 코드가 만드는 결합을 정리한 것이다.

| 왼쪽 레일 선택 | 왼쪽 패널의 현재 내용 | 오른쪽 패널의 현재 반응 | 현재 결합 문제 |
| --- | --- | --- | --- |
| Files | Files & Classes | 오른쪽 패널을 닫음 | 왼쪽 작업공간 선택이 Inspector 표시 여부까지 변경함 |
| Annotate | Files & Classes | Annotation 또는 직전 Transform Inspector를 열음 | Files와 왼쪽 내용은 같지만 오른쪽 상태로만 구분됨 |
| Display | Detection Display Settings | Annotation 또는 직전 Transform Inspector를 열음 | 왼쪽 Display 선택과 무관한 Inspector가 함께 노출될 수 있음 |
| Preprocess | Image Preprocessing | 오른쪽 패널을 닫고 Inspector를 비활성 맥락으로 표시 | 왼쪽 작업공간 전환이 도구 Inspector를 강제로 닫음 |
| Review | Files & Classes 및 Review 대기열 제어 | Annotation pane 안에 Review Inspector/품질 제어를 표시 | Review 작업공간과 Annotation Inspector가 같은 pane을 공유함 |

추가 결합:

- 오른쪽 Annotation/Transform 탭을 누르면 `activeTask=annotate`가 되어 왼쪽 Annotate가 활성화된다.
- 상단 Draw/Edit를 누르면 `activeTask=annotate`가 되어 사용자가 보고 있던 Display, Preprocess, Review 등의 왼쪽 맥락을 덮어쓴다.
- 상단 Automation을 누르면 `activeTask=automate`가 되지만 왼쪽 레일에는 Automation 항목이 없어 활성 왼쪽 탭이 사라진다.
- 따라서 Phase 3 시작 전, 왼쪽 레일 각각에 대해 현재 오른쪽 기능과 D-04 A 적용 후의 기대 오른쪽 기능을 나란히 정리한 `현재/목표 상태 매트릭스`를 테스트 기준으로 작성해야 한다.

### I-05. Review와 Automation의 상태 표현을 D-04 A 계약에 맞게 마무리

- 상태: `완료` / 결정 `D-04 A 유지` / 구현 `완료`
- 확인된 잔여 현상:
  - Review를 선택해도 품질 규칙·검토 상태·검토 완료 제어가 오른쪽 Annotation pane의 `Review Inspector`에 남아 있다. 이는 왼쪽 레일=왼쪽 작업공간 규칙과 맞지 않는다.
  - Automation은 오른쪽 Inspector를 열지만 상단 Automation 버튼의 활성 상태가 명시되지 않아, 마지막 Draw/Edit 선택과 Automation Inspector가 동시에 유효한 상황을 식별할 수 없다.
- 목표 상태 매트릭스:

| 왼쪽 작업공간 | 오른쪽 Inspector | 상단 상태 | 수용 기준 |
| --- | --- | --- | --- |
| Review | Annotation | 마지막 Draw/Edit 유지 | Review queue, 상태, 이슈, 완료/재검토, 품질 규칙은 모두 왼쪽에만 존재한다. 오른쪽은 Annotation Inspector다. |
| Review | Transform | 마지막 Draw/Edit 유지 | 왼쪽 Review는 유지하고, 오른쪽은 Transform Inspector다. |
| Review | Automation | 마지막 Draw/Edit + Automation 동시 표시 | 왼쪽 Review는 유지하고, 오른쪽은 Automation Workspace다. Automation은 별도 강조와 `aria-pressed=true`로 식별된다. |
| Files/Annotate/Display/Preprocess | Automation | 마지막 Draw/Edit + Automation 동시 표시 | 왼쪽 선택은 보존되고 오른쪽만 Automation Workspace로 바뀐다. |
| 모든 왼쪽 작업공간 | Draw/Edit 또는 Annotation/Transform Inspector | 해당 Draw/Edit만 표시 | Automation 활성 표시는 해제된다. |

- 구현 계약:
  1. Review 제어 DOM을 왼쪽 `detectionReviewWorkspace`로 물리적으로 옮긴다. 오른쪽 Inspector DOM에는 Review 제어를 남기지 않는다.
  2. Review 선택은 필터와 대기열을 열되, `setInspectorTab("annotation")`을 호출하지 않는다. 이미 열려 있던 Inspector 종류와 제목을 보존한다.
  3. Automation Inspector가 활성일 때 `#taskAutomateBtn`에는 `active`, `aria-pressed="true"`, 작업공간의 `data-active-tool="automation"`을 설정한다. Draw/Edit radio 선택은 그대로 유지한다.
  4. Annotation/Transform 또는 직접 Draw/Edit를 선택하면 Automation의 활성 표시는 해제한다.
  5. Automation의 시각 강조는 Draw/Edit의 선택색과 구별하고, 윤곽선·아이콘·텍스트·ARIA 상태를 함께 사용해 색상만으로 구분하지 않는다.

### I-06. Processed Automation Input에서 Template Matching Setup이 열리지 않음

- 상태: `완료`
- 재현 증거: 2026-09-12 로컬 브라우저에서 Preprocess > Automation input=`Processed` > Template Matching Setup을 실행하면 모달 대신 `Failed to execute 'putImageData' on 'CanvasRenderingContext2D': parameter 1 is not of type 'ImageData'.` 알림이 표시됐다.
- 확인된 원인: `preprocessSegmentationImage`는 `Uint8ClampedArray`를 반환하는데 `prepareAutomationImageData`가 객체 리터럴을 `ImageData`로 단언했다. `createAutomationWorkspaceImage`가 이 값을 `putImageData`에 전달해 런타임 타입 검증에서 실패한다.
- 영향 범위: Processed Setup 기준 이미지/ROI/preview 초기화. 현재 실행·프리셋·Batch도 같은 변환 함수를 쓰므로 실제 `ImageData` 계약을 통일해 회귀를 방지해야 한다.
- 수정: 반환 데이터를 새 `Uint8ClampedArray`로 정규화한 실제 `ImageData` 인스턴스로 생성했다. Setup과 실행 경로는 기존의 단일 변환 함수를 계속 공유한다.

### I-07. Layout ghost preview가 작업 맥락을 떠난 뒤 캔버스에 남음

- 상태: `완료`
- 조사 가설: `layoutGhostCanvas`는 Fabric canvas와 별도 overlay이며, `showSelectedLayoutPreview`는 Automation 진입 시 `layoutGhostVisible=true`로 렌더한다. Apply·template 결과 적용·일부 selection 변경만 clear하지만 Inspector/왼쪽 작업공간 전환·이미지 전환·workflow 전환의 공통 clear 경로가 없다.
- 영향 범위: 실제 annotation 수와 무관하게 ghost box가 보이며, 사용자는 잔상을 실제 라벨로 오인할 수 있다.
- 수정: Automation Inspector 진입은 ghost를 자동 표시하지 않고 명시적 레이아웃 재선택만 표시하도록 바꿨다. 비-Automation 작업공간/Draw·Edit 전환과 공통 이미지 변경 이벤트에서 ghost canvas와 안내 상태를 함께 clear한다.

### I-08. Preprocess에서 Review로 전환할 때 왼쪽 Review 작업공간이 보이지 않음

- 상태: `완료` / 구현 `현행 구현 확인`
- 조사 가설: `detectionReviewWorkspace`는 `detectionLeftWorkspace`의 자식인데 Preprocess 선택 시 부모를 hidden으로 만든다. Review 전환 시 자식은 unhide하지만, 부모 workspace의 hidden 상태를 Review에 맞춰 되돌리지 않아 Review가 계속 가려질 수 있다.
- 영향 범위: Preprocess → Review 전환 및 compact 화면의 Review 진입.
- 재현 결과: 최신 빌드에서 Preprocess → Review 전환을 실제 브라우저로 확인했다. `taskReviewBtn`이 활성화되고 `detectionLeftWorkspace`와 `detectionReviewWorkspace`가 함께 표시되며, Automation Inspector는 보존됐다. 현행 `syncWorkflowPanels`/`syncWorkspaceState`가 이미 이 상태를 보장하므로 추가 코드 변경은 필요하지 않았다.

## 4. 구현 전 결정 사항

### D-01. 빈 Segmentation 문서의 기본 Paint 클래스

- `A` 권장: 클래스 1 우선, 없으면 첫 양수 클래스, 양수 클래스가 없을 때만 선택 요구
- `B`: 클래스 1이 있을 때만 자동 선택하고, 없으면 항상 선택 요구
- `C`: 현재처럼 매 이미지에서 명시 선택 요구
- 현재 상태: `A 확정 (2026-09-12)`

### D-02. 숫자키 0의 의미

- `A` 권장: 주 키보드와 숫자패드의 1~9는 현재 도구 유지, 0만 Erase 전환 유지
- `B`: 0도 도구를 유지하고 클래스/배경 선택만 변경
- 현재 상태: `A 확정 (2026-09-12)` — 숫자패드 숫자 입력도 포함한다.

### D-03. Algorithm Input의 Template Matching Setup 적용 범위

- `A` 권장: Setup, ROI, preview, 현재 실행, 프리셋, Batch가 같은 기본 입력 소스를 사용
- `B`: 실행 단계만 적용하고 Setup은 원본 유지. 대신 명칭과 안내를 실행 전용으로 명확히 제한
- 현재 상태: `A 확정 (2026-09-12)`

### D-04. Detection 탐색 구조

- `A` 권장: 왼쪽 레일=작업공간, 상단=도구, 오른쪽=도구/선택 Inspector. 도구 변경 시 왼쪽 탭 유지
- `B`: Automation을 왼쪽 레일의 독립 작업공간으로 옮기고 상단 도구에서 제거
- 현재 상태: `A 확정 (2026-09-12)` — 구현 전에 왼쪽 레일 선택별 현재/목표 오른쪽 작업공간 매트릭스를 먼저 확정한다.

## 5. 단계별 작업 계획

### Phase 0. 계약 고정 및 회귀 기준 작성

- 상태: `완료`
- 작업:
  - D-01 A, D-02 A, D-03 A, D-04 A를 확정된 계약으로 사용한다.
  - 위 현행 결합표를 실제 화면과 코드로 재검증한다.
  - Detection의 모든 왼쪽 레일 × Draw/Edit/Automation 조합에 대해 `현재 상태`와 `목표 상태`를 분리한 매트릭스를 테스트 문서/테스트 케이스로 만든다.
  - 현행 동작을 재현하는 최소 실패 테스트를 먼저 추가한다.
- 완료 기준:
  - 각 결정이 이 문서의 결정 기록에 확정됨으로 표시된다. 현재 충족됨.
  - 왼쪽 레일 선택 시 오른쪽에 나타나는 기능, Inspector 탭, 패널 열림/닫힘, 도구 유지 여부가 현재/목표 상태로 구분되어 기록된다.
  - 네 현상 모두 자동 테스트에서 기존 구현의 실패를 재현한다.

### Phase 1. Segmentation 기본 클래스와 숫자키 수정

- 상태: `완료`
- 주요 대상:
  - `src/features/segmentation/workflow.ts`
  - `src/bootstrap/event-manager-adapter.ts`
  - `src/bootstrap/ui-manager-adapter.ts`
  - `tests/unit/features/segmentation/workflow.test.ts`
  - `tests/unit/bootstrap/event-manager-adapter.test.ts`
  - `tests/e2e/segmentation-draw.spec.ts`
- 작업:
  1. 새 이미지/빈 마스크에서 결정된 규칙에 따라 기본 Paint 클래스를 해석한다.
  2. 화면의 활성 클래스와 `requiresClassSelection`을 하나의 진실 원천으로 맞춘다.
  3. 주 키보드와 숫자패드의 1~9 클래스 단축키에서 Brush 강제 전환을 제거한다.
  4. 클래스 파일 없음, 클래스 1 없음, 이미지 전환, 저장 마스크 복원 케이스를 확인한다.
- 완료 기준:
  - 유효한 기본 클래스가 있으면 Segmentation 전환 직후 가산형 도구가 사용 가능하다.
  - Polygon/AI Select/Superpixel/Edit/Erase 상태에서 주 키보드 또는 숫자패드의 1~9를 눌러도 도구가 바뀌지 않는다.
  - 0의 동작은 D-02 계약과 일치한다.

### Phase 2. Algorithm Input 파이프라인 통일

- 상태: `완료`
- 주요 대상:
  - `src/bootstrap/automation-controller.ts`
  - `src/bootstrap/automation-batch-controller.ts`
  - `src/features/automation/template-workspace.ts`
  - 관련 unit/E2E 테스트
- 작업:
  1. 기본 입력 변환과 Template Matching preprocessing의 적용 순서를 순수 함수 수준으로 정의한다.
  2. Setup 이미지와 ROI 추출이 실행 엔진과 같은 기본 입력을 사용하게 한다.
  3. Setup에 현재 기본 입력 상태를 표시한다.
  4. 입력 소스/공용 전처리 변경 시 preview, ROI 표시, match 결과와 cache를 무효화한다.
  5. 현재 실행, 저장 프리셋, Batch가 동일 계약을 공유하는지 검증한다.
- 완료 기준:
  - Setup에서 사용자가 보는 픽셀과 실행 엔진이 받는 기본 입력이 일치한다.
  - 공용 전처리와 템플릿 전처리가 순서대로 각각 한 번만 적용된다.
  - 기존 Automation preset 파일은 마이그레이션 없이 열린다.

### Phase 3. Detection 패널 상태 모델 분리

- 상태: `완료`
- 주요 대상:
  - `src/bootstrap/ui-manager-adapter.ts`
  - `src/bootstrap/event-manager-adapter.ts`
  - `src/app/state.ts` 또는 별도 UI 상태 타입
  - `tests/unit/bootstrap/ui-manager-adapter.test.ts`
  - `tests/unit/bootstrap/event-manager-adapter.test.ts`
  - `tests/e2e/workflow-switching.spec.ts`
- 작업:
  1. Files, Annotate, Display, Preprocess, Review 각각을 선택했을 때의 왼쪽 내용, 오른쪽 기능, Inspector 탭, 패널 표시 상태, 활성 도구를 현행 매트릭스로 고정한다.
  2. 각 왼쪽 레일 × Draw/Edit/Automation 조합의 D-04 A 목표 매트릭스를 작성하고 테스트 이름과 연결한다.
  3. `activeTask`의 역할을 왼쪽 작업공간, 도구, Inspector 상태로 분리한다.
  4. 기존 공개 메서드는 필요하면 얇은 호환 계층으로 유지해 변경 범위를 통제한다.
  5. Draw/Edit/Automation 전환이 왼쪽 작업공간을 덮어쓰지 않게 한다.
  6. Files/Display/Preprocess/Review 전환이 현재 도구와 Inspector 복원 규칙을 따르게 한다.
  7. Detection↔Segmentation 전환과 compact 화면의 패널 포커스를 검증한다.
- 완료 기준:
  - 항상 정확히 하나의 왼쪽 작업공간 상태가 식별된다.
  - Automation 선택 시 왼쪽 탭이 모두 비활성으로 보이지 않는다.
  - 왼쪽 탭과 상단 도구가 서로의 상태를 의도 없이 변경하지 않는다.
  - 오른쪽 Inspector는 명시된 규칙에 따라 예측 가능하게 갱신된다.

### Phase 4. 통합 검증 및 문서 종료

- 상태: `완료`
- 자동 검증:
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run build`
  - `npm run test:e2e`
- 수동 검증:
  1. 빈 작업공간과 샘플 데이터에서 Detection↔Segmentation 전환
  2. Segmentation 기본 클래스, 모든 도구, 숫자키 0~9
  3. Algorithm Input Original/Processed 각각에서 Setup/현재 실행/Batch 비교
  4. Detection의 모든 왼쪽 탭 × Draw/Edit/Automation 조합
  5. 데스크톱 폭과 390px compact 화면
- 완료 기준:
  - 신규 수용 테스트 통과
  - 기존 unit/E2E 회귀 없음
  - 이 문서의 진척표와 검증 결과를 실제 결과로 갱신

## 6. 진척도 체크표

| ID | 작업 | 조사 | 결정 | 구현 | Unit | E2E | 수동 | 최종 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| I-01 | 기본 Paint 클래스 | 완료 | A 확정 | 완료 | 통과 | 통과 | 별도 탭 확인 | 완료 |
| I-02 | 숫자키가 도구를 변경 | 완료 | A 확정 | 완료 | 통과 | 통과 | 단위 시뮬레이션 확인 | 완료 |
| I-03 | Algorithm Input 적용 일관성 | 완료 | A 확정 | 완료 | 통과 | 통과 | Base input 표시 확인 | 완료 |
| I-04 | Detection 패널/도구 상태 분리 | 완료 | A 확정 | 완료 | 통과 | 통과 | 데스크톱 흐름 확인 | 완료 |
| I-05 | Review 좌측 배치 및 Automation 중첩 활성 표시 | 완료 | D-04 A 유지 | 완료 | 통과 | 통과 | 390px 확인 | 완료 |
| I-06 | Processed Template Setup ImageData 오류 | 완료 | 실제 ImageData 계약 | 완료 | 통과 | 통과 | 브라우저 오류 재현/해소 | 완료 |
| I-07 | Layout ghost preview 잔상 | 완료 | 명시적 레이아웃 선택만 표시 | 완료 | 통과 | 통과 | 캔버스 레이어 확인 | 완료 |
| I-08 | Preprocess → Review workspace visibility | 완료 | D-04 A 유지 | 현행 구현 확인 | 통과 | 통과 | 브라우저 전환 확인 | 완료 |

전체 진행률은 구현 항목 기준 `8/8`이다. 2026-09-12 최종 검증에서 `npm run typecheck`, `npm run test:unit`(57 files / 349 tests), `npm run build`, `npm run test:e2e`(Chromium 21 / 21)를 통과했다.

## 8. 구현 및 검증 기록 (2026-09-12)

### Phase 1 결과

- `CanvasControllerDeps.getSegmentationClassIds`를 추가해 Segmentation 워크플로가 현재 클래스 파일을 기준으로 기본 Paint 클래스를 해석하도록 했다.
- 새 빈 마스크는 클래스 `1`을 우선 선택하고, 없으면 첫 양수 클래스를 선택한다. 양수 클래스가 없을 때만 기존 선택 요구 상태를 유지한다.
- 저장된 빈 마스크를 다시 열 때도 같은 기본 클래스 규칙을 적용한다.
- 주 키보드와 Num Lock이 켜진 숫자패드의 `0`~`9`를 정규화했다. `1`~`9`는 클래스만 바꾸고 도구를 유지하며, `0`만 Erase로 전환한다. Num Lock이 꺼진 숫자패드 탐색키는 가로채지 않는다.

### Phase 2 결과

- Template Matching Setup은 Algorithm Input이 `Processed`일 때 공용 전처리 결과를 기준 이미지/ROI 작업공간으로 사용한다.
- 모달 제목 아래에 `Base input: Original/Processed` 상태를 추가했다.
- Algorithm Input 변경 중 Setup이 열려 있으면 기준 이미지, ROI 표시, preview를 다시 만들고 이전 match 결과를 무효화한다.
- 기존 현재 실행, 프리셋 실행, Batch 실행 경로는 동일한 `prepareAutomationImageData`를 계속 사용한다. Template Matching 고유 preprocessing은 그 뒤의 단계로 유지했다.

### Phase 3 결과

- 상단 Draw/Edit/Automation 및 Inspector 탭은 더 이상 왼쪽 레일의 선택을 덮어쓰지 않는다.
- `setActiveTask("automate")`는 호환성을 위해 남기되, 왼쪽 레일 상태를 바꾸지 않고 Automation Inspector만 연다.
- 왼쪽 Files/Annotate/Display/Preprocess/Review 선택은 왼쪽 작업공간을 결정하며, 상단 도구는 오른쪽 Inspector를 결정한다.
- Review가 활성인 상태에서도 Automation을 누르면 Automation Inspector가 우선 표시된다.

### I-05 결과

- Review 상태, 이슈 목록, 검토 완료/재검토, 품질 규칙 제어를 왼쪽 `detectionReviewWorkspace`로 옮겼다. 오른쪽 Inspector DOM에는 Review 제어가 남아 있지 않다.
- Review 진입은 큐와 필터만 갱신하고 현재 Annotation/Transform/Automation Inspector를 강제 전환하지 않는다.
- Automation Inspector가 열리면 마지막 Draw/Edit 라디오 선택을 유지하면서 Automation 버튼에도 활성 클래스, `aria-pressed="true"`, `data-active-tool="automation"`을 설정한다. Automation은 보라색 윤곽선·아이콘·굵은 텍스트로 별도 식별된다.
- 직접 Draw/Edit 또는 Annotation/Transform Inspector를 선택하면 Automation 활성 표시는 해제된다.
- Review의 왼쪽 배치와 Inspector 보존은 데스크톱 및 800px/390px E2E에서 확인했다.
- Unit은 Review가 Automation Inspector와 Edit 상태를 보존하고 Annotation Inspector 선택 시 Automation 표시를 해제하는 상태 전환을 확인한다. E2E는 Display·Preprocess·Review 각각에서 Automation을 선택해도 왼쪽 레일 선택이 유지됨을 확인한다.
- 수정 파일: `index.html`, `css/style.css`, `src/bootstrap/ui-manager-adapter.ts`, `tests/unit/bootstrap/ui-manager-adapter.test.ts`, `tests/e2e/review-queue.spec.ts`, `tests/e2e/automation-workflow.spec.ts`, `tests/e2e/workflow-switching.spec.ts` 및 D-04 A에 맞춰 갱신된 회귀 기대값.
- 검증 결과: typecheck 통과, Unit `56 files / 348 tests` 통과, build 통과, Chromium E2E `21 / 21` 통과. I-05 관련 신규 실패는 없다.

### 수동 확인 기록

- 별도 로컬 검증 탭에서 샘플 데이터를 열고 Segmentation 기본 클래스가 `Painting: 1`로 표시되는 것을 확인했다.
- 같은 탭에서 Template Matching Setup의 `Base input: Original` 표시를 확인했다.
- 390px compact 화면은 Chromium E2E에서 Preprocess/Annotate 및 Inspector 패널 전환을 검증해 통과했다.

### I-06~I-08 결과

- I-06: Processed 입력에서 발생한 브라우저 오류를 재현했다. 전처리 결과를 구조 단언한 객체가 아닌 새 버퍼를 가진 실제 `ImageData`로 만들도록 변경했으며, Unit의 복사·크기 계약과 Processed Template Matching Setup E2E 모달 열기를 통과했다.
- I-07: 잔상은 저장된 annotation이 아니라 별도 `layoutGhostCanvas` overlay였다. Automation 진입 자체는 preview를 표시하지 않으며, 명시적 레이아웃 선택만 preview를 표시한다. 좌측 작업공간·Draw/Edit 전환과 이미지 변경은 overlay와 안내 상태를 함께 지운다. E2E는 Automation 진입 시 `preview hidden` 상태를 확인한다.
- I-08: 최신 로컬 브라우저에서 Preprocess → Review를 수동 재현한 결과 Review 좌측 작업공간과 Review 상태가 표시되고 Automation Inspector가 유지됐다. D-04 A의 `syncWorkflowPanels` 및 `syncWorkspaceState` 계약이 이미 이를 충족하므로 변경 없이 현행 구현을 수용했다. Unit은 Preprocessing → Review 상태 전환을, 기존 E2E는 Review 좌측 워크스페이스를 검증한다.
- 수정 파일: `src/bootstrap/automation-controller.ts`, `src/bootstrap/event-manager-adapter.ts`, `src/bootstrap/file-system-adapter.ts`, `tests/unit/bootstrap/automation-controller-image-data.test.ts`, `tests/unit/bootstrap/ui-manager-adapter.test.ts`, `tests/e2e/sample-test-data.spec.ts`, 본 문서.
- 최종 검증: typecheck 통과, Unit `57 files / 349 tests` 통과, build 통과, Chromium E2E `21 / 21` 통과. 신규 실패 없음.
- 남은 위험: 브라우저 주석의 I-08 화면은 최신 로컬 빌드에서 재현되지 않았다. 이후 동일 증상이 다시 보고되면 해당 빌드 식별자와 `activeTask`·workspace `hidden` 상태를 함께 수집해 버전 차이 또는 비동기 전환 경합 여부를 먼저 확인한다.

## 7. 작업 기록 규칙

- 구현을 시작할 때 해당 항목을 `진행 중`으로 바꾼다.
- 각 Phase 종료 시 수정 파일, 실행한 명령, 통과/실패 수, 남은 위험을 이 문서에 기록한다.
- 테스트 실패는 `기존 실패`, `신규 회귀`, `환경 실패`로 구분하고 근거 없이 기존 실패로 분류하지 않는다.
- 추가 현상은 `I-05`부터 등록하고, 재현과 수용 기준을 작성한 뒤 우선순위를 정한다.
- 완료는 코드 작성이 아니라 수용 기준 및 관련 회귀 검증 통과를 의미한다.
