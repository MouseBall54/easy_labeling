# 외부 AI 에이전트 연동 (MCP) 구현 계획: B안 (실행 중인 앱 조종)

작성: 2026-11-11 · 상태: 0~7단계 구현 완료 (PR #52) · 대상: `main`의 Easy Labeling만. YOLOE-26 앱(`track/yoloe26`)은 main 구현이 모두 끝난 뒤 따로 진행합니다([13장](#13-나중에-yoloe-26-앱)). 그때까지 `track/yoloe26`에 main을 병합하지 않아도 됩니다.

이 문서가 구현의 기준입니다. 단계를 마칠 때마다 [진행 기록](#10-진행-기록)에 상태와 검증 결과를 남기고, 결정이 바뀌면 [결정 사항](#2-결정-사항)을 고칩니다.

---

## 1. 목표와 범위

Claude Code, Claude Desktop, Codex, Cursor 같은 외부 AI 에이전트가 **실행 중인 Easy Labeling 데스크톱 앱**을 MCP 도구로 조종합니다. 사람은 같은 화면을 보면서 확인하고, 되돌리고, 직접 고칩니다.

- **로컬 전용**입니다. 마켓플레이스 등록, 원격 서버, 계정은 없습니다. 에이전트 설정에 실행 파일 경로 한 줄만 등록합니다.
- **앱이 하는 일을 앱의 코드로 합니다.** 박스 편집, Refine, Reclass, Review, 폴더 실행, 템플릿 매칭, 추론은 페이지에 이미 있는 경로를 호출합니다. 로직을 새로 만들거나 Rust로 옮기지 않으므로, 결과는 사람이 버튼을 눌렀을 때와 같습니다.
- **범위 밖**: 앱 없이 동작하는 헤드리스 모드(필요해지면 [11장](#11-나중에-헤드리스-대체-경로)), 웹(GitHub Pages) 빌드 연동, 원격 접속, 여러 에이전트 동시 접속.

## 2. 결정 사항

| ID | 결정 | 이유 |
|---|---|---|
| D1 | MCP 서버는 **Rust 별도 콘솔 실행 파일 `easy-labeling-mcp.exe`** (`crates/el-mcp`, 공식 Rust SDK `rmcp`)입니다. 에이전트는 이 파일을 stdio로 실행합니다 | 최종 사용자 PC에 Node가 없습니다. GUI 앱 exe(`windows_subsystem = "windows"`)를 stdio 서버로 겸용하면 클라이언트마다 stdio 상속이 다르고, 앱 단일 실행과 엉킵니다 |
| D2 | `el-mcp`는 **얇은 중계기**입니다. 도구 스키마 선언, 입력 검사, 앱으로 전달, 결과를 MCP 형식(텍스트/이미지)으로 바꾸기만 합니다. 앱 로직은 없습니다 | 로직이 한 곳(페이지)에만 있어야 결과가 앱과 같습니다 |
| D3 | `el-mcp` ↔ 앱은 **Windows named pipe** `\\.\pipe\easy-labeling-agent-<사용자 이름 해시>` 입니다(테스트는 `EASY_LABELING_AGENT_PIPE`로 바꿈) | 같은 PC의 같은 사용자만 쓸 수 있습니다. named pipe의 기본 DACL은 다른 일반 사용자에게 읽기만 주고, tokio는 원격 클라이언트를 기본으로 거부합니다(1단계에서 SDDL을 따로 두지 않기로 함). TCP 포트, 방화벽, 토큰이 없습니다. pipe 이름 공간은 PC 전체에서 하나이므로(원격 데스크톱 사용자끼리도 공유) 사용자를 이름에 넣습니다. tokio named pipe를 씁니다. tokio `net`은 이미 Tauri 의존성 트리에서 켜져 있어서, `src-tauri/Cargo.toml`에 `tokio` 한 줄만 추가하면 됩니다(0단계 확인) |
| D4 | 앱 안에서 Rust → 페이지는 `WebviewWindow::eval`로 `window.__easyLabelingAgent.dispatch(...)`를 부르고, 페이지 → Rust는 `invoke("agent_reply")`로 답합니다 | Tauri 이벤트 플러그인 없이 기존 `tauri-desktop.ts`의 `invoke` 경로만 씁니다 |
| D5 | 에이전트용 페이지 API(`src/features/agent/`)는 **테스트 API(`__easyLabelingTestApi`)와 분리**합니다 | 테스트 API는 테스트에 맞춰 자주 바뀌고 테스트용 시드 함수가 섞여 있습니다. 에이전트 API는 버전 관리되는 계약입니다 |
| D6 | 에이전트 호출은 **동기 대화상자(`confirm`/`alert`/`prompt`)를 절대 띄우지 않습니다.** 사람의 확인이 필요한 동작은 Rust 쪽 `rfd` 대화상자로 묻습니다 | WebView2의 동기 대화상자는 페이지 JS를 멈춥니다. eval로 보낸 요청이 그동안 응답하지 못하고, 사람이 없으면 영원히 멈춥니다 |
| D7 | **도구 호출 하나 = undo 한 단계**입니다. 에이전트 편집은 사람 편집과 같은 history에 쌓입니다 | 사람이 Ctrl+Z로 에이전트 작업을 한 번에 되돌릴 수 있습니다 |
| D8 | 결과를 바꾸는 큰 작업(폴더 실행, 클래스 재매핑, 폴더 열기)은 **`dryRun` 기본값 true** 이고, 실제 실행은 사람이 `rfd` 대화상자로 승인합니다. 캔버스 편집(박스 추가·수정·삭제)은 승인 없이 바로 적용되고 undo로 되돌립니다 | 파일 전체를 바꾸는 작업만 막고, 화면에서 보이는 편집은 빠르게 둡니다 |
| D9 | 앱이 꺼져 있으면 모든 도구는 `app_not_running` 오류를 돌려줍니다. `el-mcp`가 앱을 대신 띄우지 않습니다 | 사람이 지켜보는 것이 전제입니다. 띄우기 도구가 필요하면 나중에 `launch_app`을 추가합니다 |

## 3. 구조

```
 에이전트 (Claude Code / Desktop / Codex / Cursor)
        │  MCP: JSON-RPC over stdio
        ▼
 easy-labeling-mcp.exe              crates/el-mcp
   - 도구 스키마, 입력 검사, MCP 결과 변환(PNG → image content)
        │  named pipe (프레임: 헤더 JSON + 선택적 바이너리 본문)
        ▼
 Easy Labeling.exe                  src-tauri/src/agent.rs
   - pipe 서버, 요청 대기 테이블, 시간 초과, 취소
   - 승인 대화상자(rfd), 폴더 경로 → NativeEntry
        │  webview.eval("window.__easyLabelingAgent.dispatch(id, tool, args)")
        ▼
 페이지                              src/features/agent/agent-api.ts
   - 도구 → 어댑터/컨트롤러 호출, 직렬 실행 큐, "작업 중" 표시
   - invoke("agent_reply", { id, ok, result | error })  (큰 바이트는 shared buffer)
        ▼
 기존 코드: canvas-controller / file-system / ui-manager / refine·automation·inference 컨트롤러
```

### 3.1 pipe 프로토콜 (`el-mcp` ↔ `agent.rs`)

연결 하나에 요청 여러 개를 보낼 수 있습니다. 프레임 형식은 `u32 LE 헤더 길이 | 헤더 JSON | u32 LE 본문 길이 | 본문 바이트`이고, 본문은 이미지처럼 큰 바이트가 있을 때만 씁니다(없으면 길이 0).

| 방향 | 헤더 |
|---|---|
| mcp → app | `{ "type": "hello", "protocol": 1 }` → app: `{ "type": "hello", "protocol": 1, "appVersion": "3.3.0", "app": "easy-labeling" }` |
| mcp → app | `{ "type": "call", "id": "c17", "tool": "read_labels", "args": { ... } }` |
| app → mcp | `{ "type": "progress", "id": "c17", "done": 12, "total": 40, "message": "..." }` |
| app → mcp | `{ "type": "result", "id": "c17", "ok": true, "result": { ... }, "body": "image/png" \| null }` |
| app → mcp | `{ "type": "result", "id": "c17", "ok": false, "error": { "code": "busy", "message": "..." } }` |
| mcp → app | `{ "type": "cancel", "id": "c17" }` (MCP `notifications/cancelled`를 받았을 때) |

- `protocol` 버전이 다르면 `el-mcp`는 `version_mismatch` 오류를 돌려줍니다(앱과 MCP exe를 같은 설치 파일로 배포하므로 보통은 같음).
- 오류 코드: `app_not_running`, `version_mismatch`, `no_folder`, `no_image`, `busy`(사람이 편집 중이거나 대화상자가 떠 있음), `timeout`, `cancelled`, `declined`(사람이 승인 거절), `invalid_args`, `not_found`, `failed`.

### 3.2 앱 안 왕복 (`agent.rs` ↔ 페이지)

- 요청: `agent.rs`가 `id`별 `oneshot` 채널을 테이블에 넣고 `eval`로 dispatch를 부릅니다. 인자는 `serde_json`으로 만든 JSON 리터럴로만 넣습니다(문자열 이어 붙이기 금지, 스크립트 주입 방지).
- 응답: 페이지가 `invoke("agent_reply", { id, ok, result, error })`를 부릅니다. 이미지 같은 큰 바이트는 기존 `shared_buffer.rs` 업로드 경로로 보내고 id만 넘깁니다(실패하면 raw invoke 본문으로 대체). 픽셀은 JSON/base64로 Tauri 경계를 넘지 않습니다. MCP image content의 base64 변환은 `el-mcp`에서만 합니다.
- 진행률: 페이지가 `invoke("agent_progress", { id, done, total, message })`.
- 취소: `agent.rs`가 `eval`로 `window.__easyLabelingAgent.cancel(id)`를 부르고, 페이지는 해당 작업의 기존 중지 경로(폴더 실행의 Stop 등)를 호출합니다.
- 시간 초과: 도구별 기본값(읽기 10 s, 편집 30 s, 폴더 작업은 진행률이 오는 동안 무제한, 마지막 진행률 후 60 s). 페이지가 응답하지 않으면 `timeout`을 돌려주고 테이블에서 지웁니다. 오류 메시지에 "앱에 대화상자가 떠 있을 수 있음"을 넣습니다(Rust 쪽에서는 대화상자를 감지할 수 없음).
- **기한(deadline)**: 페이지 JS가 멈춰 있는 동안(동기 대화상자 등) 보낸 `eval`은 사라지지 않고, 대화상자가 닫힌 뒤 실행됩니다(0단계 확인). 그대로 두면 에이전트가 실패로 받은 편집이 나중에 적용됩니다. 그래서 `agent.rs`는 요청마다 `deadline`(epoch ms)을 넣고, 페이지 `dispatch`는 기한이 지난 요청을 **실행하지 않고 버립니다**. 기한이 지난 뒤 온 `agent_reply`도 Rust에서 버립니다.
- 페이지가 다시 로드되면(개발 중 새로고침 등) 대기 중인 요청은 모두 `failed`로 끝냅니다.

### 3.3 페이지 쪽 실행 규칙 (`agent-api.ts`)

- **직렬 큐**: 에이전트 요청은 한 번에 하나씩 실행합니다. 앞 요청이 끝나야 다음을 시작합니다.
- **사람과 겹칠 때**: 사람이 드래그 중이거나, 입력칸에 포커스가 있거나, 모달/대화상자가 열려 있거나, 기존 `runExclusive` 작업(폴더 로딩 등)이 진행 중이면 편집 도구는 `busy`를 돌려줍니다. 읽기 도구는 그대로 실행합니다. 에이전트는 `busy`를 받으면 잠시 뒤 다시 시도하도록 도구 설명에 적습니다.
- **작업 중 표시**: 요청이 실행되는 동안 화면 상단에 "Agent working…"과 Stop 버튼을 띄웁니다. Stop은 현재 작업을 취소하고, 사람이 다시 켤 때까지 이후 요청에 `declined`를 돌려줍니다(일시 정지 스위치).
- **지연 로딩**: 에이전트 코드(`src/bootstrap/agent-runtime.ts`)는 데스크톱 앱에서만, 첫 요청이 올 때 `import()`합니다(`main.import-smoke` 5 s 제한).

## 4. 도구 목록

공통 규칙:
- 좌표는 이미지 픽셀 단위 `{ x0, y0, x1, y1 }`입니다(앱 내부 기준과 같음). 박스는 `annotationId`로 가리킵니다. `read_labels`/`get_boxes`가 돌려준 id를 그대로 씁니다.
- 이미지는 이름(`"sample_001.tif"`)으로 가리킵니다. 생략하면 현재 이미지입니다.
- MCP tool annotation: 읽기 도구 `readOnlyHint: true`, 편집 도구 `destructiveHint: false` (undo 가능), 파일 일괄 변경 도구 `destructiveHint: true`.
- 결과는 에이전트가 읽기 쉽게 요약을 같이 돌려줍니다(예: `"summary": "12 boxes moved, 2 flagged"`).

### 4.1 상태와 탐색 (1단계)

| 도구 | 입력 | 출력 | 페이지 쪽 진입점 |
|---|---|---|---|
| `app_state` | – | `{ appVersion, app, folder?, labelFolder?, imageCount, currentImage?, workflow: "detection"\|"segmentation", selectedIds[], dirty, busy, agentPaused }` | `AppState`, `fileSystem`, `canvasController.getActiveObjects` |
| `open_folder` | `path` | `{ folder, labelFolder, labelFolderStatus, imageCount, classFile? }` | **사람 승인** (rfd) → `agent.rs`가 경로를 `NativeEntry`로 만들어 페이지에 전달 → `tauri-desktop.ts`에 추가할 `createDirectoryHandle` 노출 → `fileSystem.selectImageFolder(progress, Promise.resolve(handle))` |
| `list_images` | `offset?`, `limit? (기본 100)`, `filter? ("all"\|"labeled"\|"unlabeled"\|"flagged")` | `[{ name, boxCount?, status?, reviewIssues? }]`, `total` | 이미지 목록 상태, Review 결과(`refreshReviewFindings`의 저장값) |
| `go_to_image` | `image` 또는 `offset (+1/-1)` | `{ currentImage, width, height, boxCount }` | `fileSystem.loadImage` / `navigateImage` (현재 편집은 기존 자동 저장 규칙을 따름) |
| `get_classes` | – | `[{ id, name, color }]` | 클래스 파일 상태 (`state`의 클래스 맵, 색 오버라이드) |
| `get_boxes` | `image?` (현재 이미지만 가능), `ids?` | `{ width, height, boxes: [{ annotationId, classId, className, x0, y0, x1, y1, hidden, selected }] }` | `canvasController.getObjects` (저장 전 편집 포함) |
| `read_labels` | `image` (현재가 아닌 이미지) | `{ width?, height?, boxes: [{ index, classId, x0, y0, x1, y1 }] }` | `fileSystem.readDetectionLabels` (파일 기준; 현재 이미지면 `get_boxes`를 쓰라고 안내) |
| `capture_view` | `region? ("viewport"\|"image"\|{x0,y0,x1,y1})`, `maxSide? (기본 1280)`, `overlays? (기본 true)` | PNG (MCP image content) + `{ scale, offset }` | 캔버스(+ Refine 오버레이 캔버스) 합성 → `toBlob("image/png")` → shared buffer |

### 4.2 편집 (2단계)

모든 편집은 현재 이미지에 적용되고, 호출 하나가 undo 한 단계입니다(D7).

| 도구 | 입력 | 출력 | 페이지 쪽 진입점 |
|---|---|---|---|
| `add_boxes` | `boxes: [{ classId, x0, y0, x1, y1 }]`, `replaceExisting? (기본 false)` | 새 `annotationId[]` | `canvasController.applyDetectionBoxes(boxes, { replaceExisting })` |
| `update_boxes` | `updates: [{ annotationId, x0?, y0?, x1?, y1?, classId? }]` | 바뀐 개수 | 위치 `updateBoxGeometries`, 클래스 `updateBoxClasses`. 둘 다 있으면 history 한 단계로 묶음(`captureHistoryBaseline` / `commitHistoryFromBaseline`) |
| `delete_boxes` | `annotationIds[]` | 지운 개수 | `setActiveSelection` → `deleteSelection` |
| `select_boxes` | `annotationIds[]` 또는 `classId` 또는 `"all"`/`"none"` | 선택된 id | `setActiveSelection`, `selectLabelsByClass`, `selectAllLabels`, `discardActiveObject` |
| `undo` / `redo` | `steps? (기본 1)` | `{ canUndo, canRedo }` | `canvasController.undo/redo` |
| `save` | – | `{ saved, labelFile }` | `fileSystem.saveLabels()` |

입력 검사: 클래스 id는 `parseNonNegativeClassId`, 좌표는 유한한 수이고 `x0 < x1`, `y0 < y1`, 이미지 범위 안(벗어나면 `invalid_args`, 자르지 않음). 한 번에 최대 5000개(레이아웃 적용 최대치와 같음).

### 4.3 Refine, Reclass, Review (3단계)

| 도구 | 입력 | 출력 | 페이지 쪽 진입점 |
|---|---|---|---|
| `get_refine_settings` | – | 모드, Run with / Reclass with 선택, 프리셋 이름 목록, 기본값과 클래스별 변경 키 요약 | `refine-controller.ts`의 `loadSettings()` 결과 |
| `run_refine` | `scope: "selected"\|"all"\|{ classId }`, `preset? (생략=Run with 현재 선택)`, `keepHandEdited? (기본: 화면 설정)` | `{ moved, flagged, unchanged, changes: [{ annotationId, before, after, weakSides, areaChange }] }` | pane의 Apply Selected / All / Refine class와 같은 함수 |
| `run_reclass` | `scope` 위와 같음, `preset?` | `{ changed: [{ annotationId, from, to }] }` | `refine-controller.ts#reclass` |
| `review_queue` | `mode? ("edge"\|"reclass", 기본 화면 모드)` | 검수 대기 박스 목록과 이유 | `markTargets` / review 큐 |
| `approve` | `annotationIds[]` 또는 `"all"` | 남은 대기 수 | Approve / Approve all과 같은 함수 |
| `review_folder` | `settings?` | 이미지별 문제(중복, 범위 밖, 너무 작음 등) 요약 | `fileSystem.refreshReviewFindings` |
| `refine_folder` | `preset?` | 바뀐 박스 수, 바뀐 이미지 수, 백업 위치, 건너뛴 이미지 (dry run 없음, 3단계 결과 참고) | **사람 승인** 후 폴더 실행(`runFolder()`), `rewriteDetectionLabels` 백업 경로 그대로 |
| `reclass_folder` | 위와 같음 | 위와 같음 | Reclass 폴더 실행 |
| `remap_classes` | `rule` (`domain/class-remap.ts#ClassRemapRule`), `dryRun? (기본 true)` | 미리보기: 이미지별 바뀔 행 수 / 실행: 결과, 백업 위치 | **사람 승인** 후 `fileSystem.previewClassRemap` / `applyClassRemap` |

**필요한 리팩터링**: 지금 `RefineController`는 `bind()`와 `runShortcut()`만 공개하고, 실행 함수들은 버튼 핸들러 안에 있습니다. 기존 버튼 핸들러가 호출하는 함수를 그대로 꺼내 `RefineController`에 `apply(scope, options)`, `reclass(scope, options)`, `approve(ids)`, `reviewQueue()`, `runFolder(mode, { approved })` 형태로 공개합니다. 버튼도 이 함수를 부르게 바꿔서 경로가 하나로 유지되게 합니다. 폴더 실행 안의 `windowRef.confirm` 호출은 `confirm` 함수를 인자로 받게 바꿔서, 에이전트 경로에서는 `agent.rs`의 승인 결과를 넘깁니다(D6). 결과값(`changes` 등)은 지금 상태줄 문구로만 나가므로, 같은 숫자를 객체로도 돌려주게 합니다.

### 4.4 자동화와 추론 (4단계)

| 도구 | 입력 | 출력 | 페이지 쪽 진입점 |
|---|---|---|---|
| `list_templates` | – | 자동화 프리셋(출력 방식, 레이아웃, 클래스, 최소 점수)과 레이아웃 | `AutomationController.agent.library()` |
| `run_template_matching` | `preset`, `apply? (기본 false)` | 미리보기: 레이아웃 프리셋은 최고 매치, 여러 박스 프리셋은 후보 목록(점수 포함) / 적용: 새 annotationId | "Run on current image" 경로(`runPresetOnCurrentImage`) |
| `inference_status` | – | 로드된 모델, 장치(WebGPU/WASM), 패널 설정 | `bindInferenceControls(...).agent.status()` |
| `load_model` | `path` (.onnx) | 모델 설명 | 패널에서 파일을 고른 것과 같은 `loadModel` |
| `run_inference` | `allImages?`, `confidence?`, `iou?`, `maxDetections?` | 이미지 수, 검출 수, 결과 폴더 | 패널 버튼과 같은 `run` → `fileSystem.runDetectionInference` |

YOLOE 관련 도구는 이 계획에 넣지 않습니다([13장](#13-나중에-yoloe-26-앱)). `hello`의 `app` 값은 나중에 앱을 구분할 수 있게 지금부터 넣어 두되, main에서는 항상 `"easy-labeling"`입니다.

### 4.5 미정

세그멘테이션(AI Select, 마스크 조회·편집)은 Detection 도구가 안정된 뒤 따로 설계합니다.

## 5. 단계별 구현 계획

단계마다 PR 하나입니다. 단계를 마치면 [진행 기록](#10-진행-기록)을 갱신합니다.

### 0단계: 기술 검증 (spike, 코드는 버림)

목표: 구조의 위험 요소 세 가지를 실제로 확인합니다.
1. `rmcp`로 `ping` 도구 하나짜리 stdio 서버를 만들고, Claude Code(`claude mcp add`)와 Claude Desktop에서 호출합니다. 확인할 것: 크레이트 버전, 필요한 기능 플래그, progress 알림과 cancel 지원, image content 반환.
2. tokio named pipe로 콘솔 exe ↔ `tauri:dev` 앱 사이에 요청을 왕복시킵니다. 같은 사용자 ACL 설정 방법을 확인합니다.
3. `agent.rs` → `eval` → 페이지 → `invoke("agent_reply")` → pipe 응답까지 왕복 시간을 잽니다(목표: 읽기 도구 왕복 50 ms 미만). 페이지에 `confirm`이 떠 있을 때 어떻게 되는지(응답 없음 → timeout) 확인합니다.

산출물: 이 문서 D1, D3, D4 확정 또는 수정, 측정값 기록.

#### 0단계 결과 (2026-11-11, 완료)

검증 코드는 scratchpad의 별도 크레이트와 `src-tauri`에 잠깐 넣은 모듈로 만들었고, 측정 후 모두 되돌렸습니다(레포 변경 없음). **D1, D3, D4는 그대로 확정합니다.**

| 확인 항목 | 결과 |
|---|---|
| `rmcp` 버전과 기능 | `rmcp = "=3.9.0"`, features `["server", "transport-io", "macros", "schemars"]`. `#[tool_router]`/`#[tool]`/`#[tool_handler]` 매크로. 도구 인자로 `Parameters<T>`(입력, `schemars::JsonSchema`로 스키마 자동 생성), `RequestMetaObject`(progress token), `Peer<RoleServer>`(알림 보내기), `CancellationToken`(취소)을 받을 수 있음 |
| 프로토콜 협상 | 클라이언트가 `2025-06-18`을 보내면 그대로 쓰고, `2026-07-28`을 보내면 `2025-11-25`로 협상됨 |
| 도구 목록, 입력 스키마 | `tools/list`에 인자 스키마가 나옴 |
| image content | `ContentBlock::image(base64, "image/png")`로 반환됨 |
| progress 알림 | `notifications/progress`가 단계마다 옴 |
| cancel | `notifications/cancelled`를 받으면 도구의 `CancellationToken`이 즉시 취소되고, 서버는 응답을 보내지 않음(MCP 규격대로) |
| Claude Code 연결 | `claude -p --strict-mcp-config --mcp-config <json>`로 `ping` → `pong`, `image` 호출 성공(사용자 설정 변경 없이 확인). print 모드에서는 이미지가 화면 대신 파일 경로로 전달되었다는 응답이 있었음 → 1단계에서 대화형 세션과 실제 크기 이미지로 다시 확인 |
| 앱이 꺼져 있을 때 | pipe 연결이 즉시 실패(OS error 2/3, 약 1~2 ms) → `app_not_running` |
| 왕복 시간 (MCP 서버 → pipe → 앱 Rust → `eval` → 페이지 → `invoke` → pipe, 디버그 빌드) | 100회: 최소 1.3 ms, **중앙값 2.8 ms**, 최대 7.4 ms. 목표(50 ms 미만) 충족. 첫 호출 3.7 ms |
| 큰 응답 | 박스 5000개 JSON(약 370 KB)이 앱 안 왕복 17 ms |
| 페이지에 `confirm`이 떠 있을 때 | 요청이 시간 초과(5 s)로 끝남. 앱 Rust와 pipe는 계속 응답함. 대기 중이던 `eval`은 대화상자가 닫힌 뒤 실행됨 → 3.2의 **기한(deadline)** 규칙 추가 |
| 두 번째 앱 실행 | `first_pipe_instance(true)`라서 두 번째 앱은 pipe를 열지 못하고(오류 로그만), 먼저 실행된 앱이 연결을 받음 |

1단계에 반영할 것:
- 도구 실패는 `CallToolResult::error(...)`(`isError: true`)로 돌려줍니다. spike는 오류를 일반 텍스트(`isError: false`)로 돌려줬는데, 이러면 에이전트가 실패를 성공으로 읽을 수 있습니다.
- pipe 보안: tokio `ServerOptions`는 원격 클라이언트를 기본으로 거부합니다(`reject_remote_clients` 기본 true). 기본 DACL은 Everyone에 읽기만 허용해서 다른 사용자는 읽기/쓰기로 열 수 없지만, 1단계에서는 SDDL(현재 사용자만 허용)을 명시해 설정합니다(`windows-sys`는 이미 의존성 트리에 있음).
- 설치 방식: `bundle.externalBin` 사이드카로 정합니다. 파일 이름에 대상 triple(`easy-labeling-mcp-x86_64-pc-windows-msvc.exe`)이 필요하고, 서명 포함 여부는 5단계에서 확인합니다.
- `eval`에 넣는 값은 serde_json JSON 리터럴만 씁니다. spike는 식을 그대로 넣었지만 이건 측정용이었습니다.

### 1단계: 연결 기반 + 상태/탐색 도구

**Rust**
- `crates/el-mcp/` (새 크레이트, 바이너리 이름 `easy-labeling-mcp`): `rmcp` stdio 서버, 도구 스키마(serde + JSON Schema), pipe 클라이언트(호출마다 연결 시도, 실패하면 `app_not_running`), 프레임 코덱, `hello`/버전 확인, MCP progress·cancel 연결, PNG 본문 → image content.
- `src-tauri/src/agent.rs` (새 파일, `main.rs`에 등록): 앱 시작 시 pipe 서버 시작, 연결별 tokio 작업, 요청 테이블(`id` → oneshot), `eval` dispatch, `agent_reply`·`agent_progress` 명령, 시간 초과, 페이지 리로드 시 정리, `open_folder` 승인 대화상자(`rfd::MessageDialog`)와 경로 검사(존재하는 폴더, `dunce`로 정규화).
- `src-tauri/Cargo.toml`: `tokio = { version = "1", features = ["net", "io-util", "sync", "time"] }` 한 줄(트리에 이미 있는 버전이라 새로 받는 크레이트 없음, 0단계 확인).
- 페이지 dispatch의 기한 확인, `isError: true` 오류, pipe SDDL (0단계 결과 참고).
- 프레임 코덱은 `el-mcp`와 `src-tauri`가 같이 씁니다. 작은 모듈 하나라 `crates/el-core`에 넣지 않고, `crates/el-agent-protocol`(의존성 serde만)로 둡니다.

**페이지**
- `src/platform/tauri-desktop.ts`: `agent_reply`, `agent_progress` 호출 함수와, `open_folder`에 쓸 `createDirectoryHandle`을 window 전역으로 노출합니다(클래식 스크립트 유지).
- `src/features/agent/agent-api.ts` (새 파일): `window.__easyLabelingAgent = { dispatch, cancel }`, 직렬 큐, 도구 이름 → 핸들러 표, 오류 → 코드 변환.
- `src/bootstrap/agent-tools-state.ts`: 4.1 도구 구현.
- `src/features/agent/agent-indicator.ts`: "Agent working…" 표시와 Stop(일시 정지) 버튼. `index.html`에 자리, `css/`에 스타일(라이트/다크).
- `createApp.ts`: 데스크톱일 때만 첫 요청 시 `import()`로 연결합니다. 어댑터와 컨트롤러 참조를 넘기는 `connectAgent(deps)` 하나만 추가합니다.

**테스트**
- Rust: 프레임 코덱 단위 테스트, `el-mcp`의 `tools/list` 스키마 스냅샷 테스트.
- vitest: `agent-api.ts` 직렬 큐, `busy` 판정, 오류 변환(어댑터는 가짜 객체).
- 데스크톱 e2e `tests/e2e/agent-desktop.spec.ts` (새 파일): `tauri:dev` exe 실행 → 샘플 데이터셋 열기 → `easy-labeling-mcp.exe`를 자식 프로세스로 띄워 JSON-RPC(`initialize` → `tools/list` → `app_state` → `go_to_image` → `get_boxes` → `capture_view`) → 결과를 `__easyLabelingTestApi`로 확인. 앱을 끈 상태에서 `app_not_running` 확인.

**완료 조건**: Claude Code에서 "지금 열린 이미지의 박스 개수와 화면을 보여줘"가 동작합니다.

#### 1단계 결과 (2026-11-11, 완료)

계획과 달라진 점:
- **파일 위치**: 도구와 연결 코드는 어댑터를 쓰므로, 계층 규칙(features는 bootstrap을 import하지 않음)에 따라 `src/bootstrap/agent-runtime.ts`(연결, 사람 작업 중 판정, 작업 중 표시)와 `src/bootstrap/agent-tools-state.ts`(4.1 도구)에 두었습니다. DOM 없는 디스패처만 `src/features/agent/agent-api.ts`에 있습니다. 2~4단계 도구도 `src/bootstrap/agent-tools-*.ts`에 둡니다.
- **폴더 열기**: 버튼 경로(기본 클래스 정보, 자동화 라이브러리 준비 포함)를 그대로 쓰도록 `EventManager.openImageFolder(folder)`를 추가했습니다. 버튼과 같은 `runExclusive("open-dataset")`를 거치고, 끝나면 settle됩니다.
- **pipe 보안**: SDDL을 따로 두지 않았습니다(D3 참고). pipe 이름은 `USERDOMAIN\USERNAME`의 FNV 해시입니다.
- **`read_labels`**: 현재 이미지가 아니면 이미지 크기를 모르므로 정규화 좌표(0..1, `units: "normalized"`)로 돌려줍니다. 픽셀 좌표는 `get_boxes`가 줍니다.
- **`capture_view`**: 캔버스 화면(현재 확대 상태)만 캡처합니다. `#canvas-container` 안의 보이는 canvas 레이어를 합성하므로 Processed 보기, 박스, 태그, Refine 표시가 모두 들어갑니다. 결과에 캡처 픽셀 → 이미지 픽셀 변환(`imageFromCapture`)을 넣었습니다. 이미지 전체(원본 해상도) 캡처는 필요해지면 추가합니다.
- **작업 중 표시**: 화면 위쪽은 헤더나 캔버스 툴바를 가려서, 하단 상태 표시줄의 빈 칸 가운데에 두었습니다.
- **테스트 seam**: `EASY_LABELING_AGENT_PIPE`(앱과 MCP 서버 모두), `EASY_LABELING_TEST_AGENT_APPROVE=accept|decline`(폴더 승인 대화상자 대신). 데스크톱 e2e fixture(`tests/e2e/fixtures/tauri-app.ts`)는 앱마다 다른 pipe를 줘서, 테스트 앱이 실제 앱의 pipe를 차지하지 않습니다.
- **`tokio`**: `src-tauri`에는 `macros` 기능도 필요합니다(`tokio::select!`). 워크스페이스 전체 빌드에서는 `el-mcp` 쪽 기능이 합쳐져 가려졌다가 `tauri build`에서 드러났습니다.
- **CI**: `.github/workflows/rust.yml`의 Windows `desktop` 작업에 두 크레이트의 clippy와 테스트를 추가했습니다(named pipe가 Windows 전용이라 Linux `core` 작업에는 넣지 않음).

검증:
- typecheck, unit 620 통과(새 `tests/unit/features/agent/agent-api.test.ts` 6개: 직렬 실행, 기한 지난 요청 버림, busy와 일시 정지, Stop과 cancel, 오류 변환), build 통과.
- `cargo fmt`, `cargo clippy -p easy-labeling -p el-agent-protocol -p el-mcp --all-targets -- -D warnings`, `cargo test -p el-agent-protocol -p el-mcp`(4개) 통과.
- e2e: `agent-desktop` 2개, `tauri-desktop` 20개, `tauri-image-switch` 3개, `bootstrap-smoke` 3개, `folder-switch-autosave` 1개 통과. 캡처 이미지와 작업 중 표시(라이트/다크) 스크린샷을 확인했습니다.
- Claude Code(`claude -p`, haiku)로 별도 앱 인스턴스에서 폴더 열기 → 이미지 이동 → 클래스별 박스 개수 → `capture_view`까지 실행했고, 모델이 캡처 이미지를 직접 봤다고 답했습니다(0단계에서 남긴 확인 항목 해결).

### 2단계: 편집 도구

- `src/bootstrap/agent-tools-edit.ts`: 4.2 도구. 입력 검사와 history 한 단계 묶기.
- `update_boxes`에 위치와 클래스가 같이 있을 때 한 단계로 묶이는지 확인하고, 안 되면 `canvas-controller`에 위치+클래스 일괄 갱신 하나를 추가합니다(새 history 경로를 만들지 않고 기존 `updateBoxGeometries`를 확장).
- 사람과 겹칠 때 규칙(3.3) 구현: 드래그, 입력 포커스, 열린 모달, `runExclusive` 진행 여부 판정.
- 테스트: vitest(입력 검사, 범위 밖 거부, 5000개 제한), e2e(`add_boxes` → `undo` 한 번에 원상복구, `update_boxes` → 저장 파일 내용, 사람이 드래그 중일 때 `busy`).

**완료 조건**: 에이전트가 박스를 추가·수정·삭제하고, 사람이 Ctrl+Z 한 번으로 그 호출을 되돌립니다.

#### 2단계 결과 (2026-11-11, 완료)

구현:
- 도구 7개: `add_boxes`, `update_boxes`, `delete_boxes`, `select_boxes`, `undo`, `redo`, `save` (`src/bootstrap/agent-tools-edit.ts`, `crates/el-mcp`의 두 번째 router `edit_router`).
- **undo 한 단계**: `add_boxes`(`applyDetectionBoxes`), `delete_boxes`(`setActiveSelection` + `deleteSelection`), 위치만 또는 클래스만 바꾸는 `update_boxes`는 원래 한 단계입니다. 위치와 클래스를 같이 바꾸면 두 단계가 되므로, canvas에 `runAsOneHistoryStep(run)`을 추가했습니다(`history.withReplayMuted` 안에서 실행하고 baseline과 비교해 한 번만 push; 실행 중 오류가 나도 바뀐 만큼은 기록).
- **화면 동기화**: 에이전트 편집 뒤 라벨 목록, undo/redo 버튼, inspector가 따라오도록 `EventManager.syncAfterEdit()`를 추가했습니다(캔버스 자체 이벤트가 없는 편집용).
- **입력 검사**: 좌표는 유한한 수, `x0 < x1`, `y0 < y1`, 이미지 안(가장자리 포함)이어야 하고, 벗어나면 자르지 않고 `invalid_args`로 거절합니다(`applyDetectionBoxes`는 범위 밖 박스를 조용히 버리므로 먼저 검사). 클래스 id는 `parseNonNegativeClassId`(문자열 또는 숫자). 한 번에 최대 5000개. 없는 `annotationId`는 `not_found`. Segmentation 모드에서는 "Detection으로 전환" 오류.
- **사람과 겹칠 때**: 1단계의 판정(대화상자, 입력 포커스, 진행 중 작업)에 더해, 캔버스 위에서 마우스를 누르고 있는 동안(`pointerdown`~`pointerup`)도 `busy`입니다. 실제로 써 보니 이 정도로 충분해서 판정을 더 조정하지 않았습니다(12장 항목 해결).
- **좌표 기준**: `get_boxes`와 편집 도구 모두 박스의 바깥 경계(테두리 포함, 라벨 파일에 저장되는 값)를 씁니다. `add_boxes`로 넣은 좌표가 `get_boxes`에서 그대로 나옵니다.

발견한 것:
- `rmcp`의 `#[tool_handler]`는 기본으로 `Self::tool_router()`(첫 router만)를 씁니다. router를 둘 이상 합칠 때는 `#[tool_handler(router = self.tool_router)]`로 필드를 지정해야 합니다. 단위 테스트는 필드를 직접 읽어 통과했고, e2e에서 드러났습니다.

검증:
- unit 624 통과(새 테스트: `runAsOneHistoryStep` 1개, `tests/unit/bootstrap/agent-tools-edit.test.ts` 3개). `main.import-smoke`가 전체 실행 중 한 번 5 s를 넘겼고, 단독 실행 2.7 s로 통과, 전체 재실행에서도 통과(AGENTS.md의 알려진 부하 현상).
- Rust: fmt, clippy(`-D warnings`), `cargo test -p el-agent-protocol -p el-mcp` 통과.
- e2e: `agent-desktop` 3개(새 편집 테스트 포함, `--repeat-each=2`로 6회 통과), `alignment-history` 2개, `detection-bulk-operation` 1개, `bootstrap-smoke` 3개 통과. 편집 테스트는 추가 → 잘못된 입력 거절 → 위치+클래스 수정 후 undo 한 번으로 둘 다 복원 → 삭제/undo/redo → 선택 → 마우스 누른 동안 busy → 저장한 라벨 파일 행 수 → **사람의 Ctrl+Z로 에이전트 편집 되돌리기**까지 확인합니다.
- Claude Code(`claude -p`, haiku)로 별도 앱에서 추가 → 한 번의 `update_boxes`로 클래스와 오른쪽 경계 변경 → undo 한 번 → `get_boxes`로 원래 클래스와 좌표 복원 확인.

### 3단계: Refine, Reclass, Review, 폴더 작업

- `refine-controller.ts` 리팩터링(4.3의 "필요한 리팩터링"). 버튼 동작이 바뀌지 않는 것을 기존 `refine-edges` e2e 24개로 확인합니다.
- `src/bootstrap/agent-tools-refine.ts`: 4.3 도구.
- 폴더 작업(`refine_folder`, `reclass_folder`, `remap_classes`)의 승인: 페이지가 `invoke("agent_confirm", { message })`를 부르면 `agent.rs`가 `rfd` 대화상자로 묻고 결과를 돌려줍니다. 거절하면 `declined`.
- 진행률: 폴더 실행의 기존 진행 콜백을 `agent_progress`로 전달합니다. MCP cancel은 기존 Stop 경로로 연결합니다.
- 테스트: e2e에서 `refine-edges.spec.ts`의 합성 SEM 데이터셋(`openSemDataset`)을 재사용해, 버튼으로 한 결과와 도구로 한 결과(박스 좌표, 대기 목록)가 같은지 비교합니다. 데스크톱 e2e에서 `refine_folder` dry run → 승인 → 백업 폴더 생성 확인.

**완료 조건**: "Review 돌리고 문제 있는 이미지들 Refine한 뒤 화면 보여줘" 시나리오가 사람 승인 한 번으로 끝납니다.

#### 3단계 결과 (2026-11-11, 완료)

구현:
- 도구 9개: `get_refine_settings`, `run_refine`, `run_reclass`, `review_queue`, `approve`, `review_folder`, `refine_folder`, `reclass_folder`, `remap_classes` (`src/bootstrap/agent-tools-refine.ts`, `crates/el-mcp`의 세 번째 router `refine_router`). 도구는 모두 24개입니다.
- **`refine-controller.ts` 리팩터링**: 버튼이 부르던 `run`, `reclass`, `runFolder`가 상태줄 문구와 함께 결과 객체(`RefineRunOutcome`: 바뀐 박스의 before/after, 플래그, 백업 위치 등)를 돌려줍니다. 버튼 핸들러는 그대로이고 결과를 무시합니다. 함수를 새로 만들지 않고 기존 함수에 반환값만 더했으므로 경로가 하나로 유지됩니다. 그 위에 `RefineController.agent`(`RefineAgentApi`)가 범위(`selected`/`all`/클래스/annotationId 목록)와 프리셋을 받아 같은 함수를 부릅니다. `reviewQueue`는 모드를 인자로 받을 수 있게 했습니다.
- **프리셋**: 호출 하나 동안만 쓰는 override(`edgePresetOverride`/`reclassPresetOverride`)를 `runConfig`/`reclassConfig`가 읽습니다. 화면의 Run with 선택이나 설정 파일은 바뀌지 않습니다. MCP 인자에서 `preset`을 생략하면 화면의 선택, `""`면 클래스 설정(Lab 규칙), 이름이면 그 프리셋입니다. 없는 프리셋 이름과 없는 annotationId는 `not_found`입니다.
- **사람 승인**: `runFolder`의 `windowRef.confirm`을 인자로 받게 바꿨습니다(기본값은 그대로 `confirm`). 에이전트 경로는 새 Tauri 명령 `agent_confirm`(네이티브 대화상자, 테스트 seam은 `EASY_LABELING_TEST_AGENT_APPROVE`)을 넘깁니다. 클래스 재매핑도 같은 승인을 거칩니다.
- **클래스 재매핑**: 모달이 쓰는 `fileSystem.previewClassRemap` / `applyClassRemap`을 그대로 부릅니다. 기본은 dry run(미리보기만)이고, `dryRun: false`면 승인 후 적용합니다(백업 포함). 범위는 폴더 전체만 지원합니다(현재 이미지만 바꾸는 일은 `update_boxes`로 됨).
- **취소**: 폴더 작업 중 MCP 취소가 오면 화면의 작업 중지 버튼(`#cancelActiveOperationBtn`)을 누릅니다. 사람이 Stop을 누른 것과 같아서, 아무 파일도 쓰지 않고 끝납니다.
- **시간 제한**(`agent.rs`): 폴더 작업 4시간(승인 대기 포함), `run_refine`/`run_reclass` 300초.

계획과 달라진 점:
- **폴더 Refine/Reclass에는 dry run을 두지 않았습니다.** 지금의 폴더 실행은 계산과 쓰기가 한 번에 일어나서(`rewriteDetectionLabels`), dry run을 만들려면 별도 경로가 필요합니다. 대신 사람 승인 대화상자와 백업이 안전장치입니다. 미리 보고 싶으면 `run_refine`을 이미지 몇 장에 먼저 돌려 볼 수 있습니다.
- **Reclass 기본 규칙**: 새 폴더의 기본 규칙에도 검사가 켜져 있어서 `run_reclass`가 실제로 박스를 바꿉니다(e2e에서 확인). 에이전트가 쓰기 전에 `get_refine_settings`의 `reclassRule`을 읽도록 도구 설명을 두었습니다.
- 진행률(`agent_progress`)은 아직 폴더 작업에 연결하지 않았습니다. 화면의 작업 패널에는 그대로 보입니다. 필요하면 `rewriteDetectionLabels`의 진행 콜백을 이어 주면 됩니다.

검증:
- unit 627 통과(새 `tests/unit/bootstrap/agent-tools-refine.test.ts` 3개: 범위·재매핑 규칙 해석, 프리셋 전달과 결과 → 오류 코드 변환).
- Rust: fmt, clippy(`-D warnings`), `cargo test -p el-agent-protocol -p el-mcp` 통과.
- e2e: `refine-edges` 24개 통과(리팩터링 후 버튼 동작 그대로). `agent-desktop` 5개(`--repeat-each=2`로 10회 통과): 새 Refine 테스트는 합성 SEM PNG에서 박스 하나 Refine → before/after와 `get_boxes` 일치 → undo 한 번으로 복원, 클래스 Refine → 대기 목록 → 전체 승인, Reclass → reclass 대기 목록 → 승인 → undo로 클래스 복원, 없는 프리셋/박스는 `not_found`, `review_folder`, 재매핑 dry run(파일 그대로) → 적용(두 파일의 클래스 변경), 폴더 Refine(백업, 박스가 블록 경계로 줄어듦), 사람이 거절하면 `declined`. 데스크톱 `tauri-desktop`의 native refine, 폴더 Refine 2개도 통과.
- Claude Code(`claude -p`, haiku)로 별도 앱에서 완료 조건 시나리오 실행: 폴더 열기 → `review_folder`(0건) → `refine_folder`(307개 박스, 백업 위치 보고) → `capture_view`(이미지 확인). 승인은 seam으로 대신했습니다.

### 4단계: 자동화와 추론

- `automation-controller.ts`, `inference-controller.ts`에서 매칭/추론/적용 함수를 3단계와 같은 방식으로 공개합니다(버튼도 같은 함수 사용).
- `src/bootstrap/agent-tools-auto.ts`: 4.4 도구. 기본은 후보만 돌려주고, `apply: true`일 때 적용(undo 한 단계).
- 테스트: `automation-workflow`, `inference` e2e 회귀 확인, 도구 결과와 버튼 결과 비교.

#### 4단계 결과 (2026-11-11, 완료)

구현:
- 도구 5개: `list_templates`, `run_template_matching`, `inference_status`, `load_model`, `run_inference` (`src/bootstrap/agent-tools-auto.ts`, `crates/el-mcp`의 네 번째 router `auto_router`). 도구는 모두 29개입니다.
- **템플릿 매칭**: "Run on current image" 버튼이 부르던 `runSelectedPresetOnCurrentImage`를 프리셋을 인자로 받는 `runPresetOnCurrentImage(preset, operation, apply)`로 바꾸고, 버튼은 이제 화면에서 고른 프리셋으로 이 함수를 부릅니다. `apply: false`(에이전트 기본값)면 매칭만 하고 결과를 돌려줍니다. 레이아웃 프리셋은 최고 매치와 레이아웃 이름, 여러 박스 프리셋은 후보 목록입니다. `apply: true`는 버튼과 똑같이 적용합니다(undo 한 단계). 실행은 버튼과 같은 `runCancellableMatchingOperation`을 거치므로 작업 패널과 Stop이 그대로 보입니다.
- **추론**: `bindInferenceControls`가 `{ dispose, agent }`를 돌려줍니다. 모델 로드(`loadModel`)와 실행(`run`)은 패널의 변경·버튼 핸들러에 있던 코드를 꺼낸 함수입니다. 오류는 지금처럼 패널에 표시하고, 에이전트에게는 throw합니다. 실행 설정(confidence, IoU, max detections)은 호출 한 번에만 쓰고 패널 입력값은 바꾸지 않습니다.
- **모델 경로**(`agent.rs`의 `prepare`): 존재하는 `.onnx` 파일인지 Rust가 확인하고, 파일 항목으로 페이지에 넘깁니다(`easyLabelingAgentBridge.file`). 읽기만 하므로 승인 대화상자는 띄우지 않습니다.
- **모든 이미지 추론**은 사람이 허락해야 실행됩니다(`agent_confirm`). 현재 이미지 추론은 승인 없이 실행합니다.
- 시간 제한: `run_template_matching`·`load_model` 300초(첫 매칭은 OpenCV.js를 시작함), `run_inference` 4시간.

계획과 달라진 점:
- **추론은 후보를 돌려주지 않습니다.** 앱의 추론은 결과를 모델 전용 라벨 폴더(`inference-<모델>`)에 쓰고 그 폴더를 활성 라벨 세트로 바꾸는 방식이라, 원래 라벨은 건드리지 않습니다. 그래서 `apply` 인자 대신 이 동작을 도구 설명에 적었고, 결과는 이미지 수·검출 수·폴더 이름입니다. 결과 박스는 `get_boxes`로 읽습니다.
- **`threshold` 인자는 넣지 않았습니다.** 템플릿 매칭의 최소 점수는 프리셋에 저장된 값을 씁니다(버튼과 같은 결과를 위해). 바꾸려면 앱에서 프리셋을 고쳐 저장합니다.
- **폴더 전체 자동화(배치)는 넣지 않았습니다.** 앱의 배치 실행에는 별도 사전 점검과 dry run 화면이 있어서, 필요해지면 그 경로를 따로 공개합니다.

검증:
- unit 629 통과(새 `tests/unit/bootstrap/agent-tools-auto.test.ts` 2개: 미리보기/적용 전달, 오류 → `not_found`/`busy`, 모든 이미지 추론의 승인 거절, 임계값 검사). 전체 실행 중 무거운 테스트(5,000개 박스, import-smoke)가 5초를 넘긴 적이 두 번 있었고, 단독 실행과 전체 재실행에서 모두 통과했습니다(부하).
- Rust: fmt, clippy(`-D warnings`), `cargo test -p el-agent-protocol -p el-mcp` 통과.
- e2e: `agent-desktop` 6개(새 테스트: `open_folder`로 함께 로드된 샘플 자동화 프리셋 목록 → 레이아웃 프리셋 미리보기(점수 ≥ 0.85, 박스 그대로) → 적용 → undo로 복원 → 여러 박스 프리셋 후보 → 없는 프리셋 `not_found` → 잘못된 모델 경로 `invalid_args` → 모델 로드 → 현재 이미지 추론(검출 1개, `inference-local` 파일) → 모든 이미지 추론), `inference-desktop`, `tauri-desktop`의 ONNX 추론·템플릿 매칭·자동화 입력 3개, 웹 `automation-workflow`·`automation-view`·`sample-test-data`·`inference` 8개 통과.
- Claude Code(`claude -p`, haiku): 프리셋 목록 → 여러 박스 프리셋 미리보기(후보 1개) → 레이아웃 프리셋 적용(4개 추가) → undo(207개로 복원).

### 5단계: 배포와 문서

- 설치 파일: `easy-labeling-mcp.exe`를 Tauri `bundle.externalBin` 사이드카로 앱 옆에 설치합니다(0단계 결정). 서명 대상에 포함되는지 `release:tauri`로 확인합니다.
- 버전: 이 단계를 포함한 릴리스에서 minor를 올립니다(1~4단계도 앱에 표시(작업 중 표시)와 pipe 서버가 들어가므로, 각 단계를 릴리스할 때 AGENTS.md "Versioning"에 따라 올림).
- 문서: `docs/FEATURES_AND_OPTIONS_KO.md`에 "에이전트 연동" 장(등록 방법, 도구 목록, 승인과 Stop), README 링크.
- 에이전트용: `.claude/skills/agent-integration/SKILL.md`(도구 추가 절차: 스키마 → `el-mcp` → `agent-tools-*.ts` → e2e), AGENTS.md "Architecture"에 `el-mcp`, `agent.rs`, `features/agent/` 한 줄씩.

#### 5단계 결과 (2026-11-11, 완료)

설치 파일:
- `src-tauri/tauri.bundle.conf.json`(새 파일)이 `bundle.externalBin: ["binaries/easy-labeling-mcp"]`을 더하고, `beforeBuildCommand`에 `scripts/stage-mcp-sidecar.mjs`(새 파일)를 붙입니다. 이 스크립트는 `cargo build --release -p el-mcp` 후 `src-tauri/binaries/easy-labeling-mcp-<host triple>.exe`로 복사합니다(`.gitignore`에 추가).
- `tauri-build`는 debug 빌드에서도 `externalBin` 파일을 찾기 때문에, 기본 `tauri.conf.json`에는 넣지 않았습니다. 설치 파일을 만드는 명령만 이 설정을 더합니다: `tauri:dist:win`(`tauri build --config src-tauri/tauri.bundle.conf.json`), `release:tauri`(`--config tauri.bundle.conf.json --config tauri.release.conf.json`). 그래서 `tauri:dev`, `cargo clippy`, CI는 MCP 서버를 미리 빌드하지 않아도 됩니다(사이드카 파일을 치운 상태에서 `cargo check -p easy-labeling` 통과 확인).
- `npm run tauri:dist:win`으로 3.4.0 설치 파일(268.78 MiB)을 실제로 만들었습니다. 생성된 `target/release/nsis/x64/installer.nsi`에서 `File /oname=easy-labeling-mcp.exe`(설치)와 `Delete "$INSTDIR\easy-labeling-mcp.exe"`(제거)를 확인했고, 현재 사용자 설치라 위치는 `$LOCALAPPDATA\Easy Labeling\`입니다. 이 PC에 실제로 설치하지는 않았습니다(사용자 앱을 덮어쓰지 않기 위해).
- **서명**: `release:tauri`의 서명은 업데이트용 minisign 서명(설치 파일 전체)이라, 사이드카를 따로 서명할 필요가 없습니다. Authenticode 코드 서명은 지금 앱에도 없습니다.
- release 빌드의 `easy-labeling-mcp.exe`(약 3.8 MB)로 초기화, 도구 29개 목록, 앱이 없을 때 `app_not_running`을 확인했습니다.

문서:
- 사용 안내 `docs/AGENT_MCP_GUIDE_KO.md`(새 파일): 연결 방법(Claude Code, JSON 설정), 도구 29개, 사람이 지키는 장치(undo, 승인, 백업, Stop, busy, 접근 범위), 알아 둘 점, 오류 메시지별 조치. 기능 문서가 이미 길어서, 계획과 달리 별도 문서로 두고 `docs/FEATURES_AND_OPTIONS_KO.md` 16장과 `README.md`의 "AI 에이전트 연동(MCP)"에서 링크합니다.
- 에이전트용: `.claude/skills/agent-integration/SKILL.md`(새 skill: 호출 경로, 원칙, 도구 추가 4단계, seam과 검사), `CLAUDE.md` skill 표, `AGENTS.md` Architecture 한 줄과 데스크톱 spec 목록(`agent-desktop`), `tauri:dist:win` 설명, `testing-and-release` skill의 데스크톱 spec 목록과 패키징 줄.

버전: 1단계에서 올린 3.4.0을 그대로 씁니다(아직 배포 전). 5단계는 빌드 설정과 문서만 바꿨습니다.

### 6단계: Agent 패널과 여러 MCP 클라이언트 지원

목표: 사람이 앱 안에서 에이전트 연결을 **설정하고, 보고, 통제**하는 자리를 만듭니다. 그리고 Claude Code뿐 아니라 다른 MCP 클라이언트와 모델(Claude Desktop, Cursor, VS Code Copilot, Windsurf, Codex CLI, Gemini CLI, LM Studio의 로컬 모델 등)에서도 같은 서버가 문제없이 붙게 합니다.

**Agent 패널** (데스크톱 전용, 웹에서는 숨김)
- 위치: 왼쪽 작업 레일 하단(Theme 위)의 `Agent` 버튼과 상태 표시줄의 "Agent working…" 표시가 여는 **오른쪽 서랍 패널**입니다. 작업(task) 전환과 별개라서 Detection과 Segmentation 모두에서 열리고, 모달이 아니어서 열어 둔 채로 앱을 쓸 수 있습니다(사람 작업 중 판정에서 이 패널은 제외).
- **연결 상태**: pipe 대기 중인지(다른 앱이 차지했으면 그 사실), 마지막 호출 시각과 호출한 클라이언트 이름·버전(MCP `initialize`의 `clientInfo`를 `el-mcp`가 `hello`에 실어 보냄), 앱 버전과 프로토콜 버전. 패널이 열려 있는 동안 Rust 명령 `agent_status`를 2초마다 읽습니다.
- **MCP 서버 경로**: 앱 실행 파일 옆의 `easy-labeling-mcp.exe` 경로(없으면 경고)와 복사 버튼.
- **클라이언트 설정**: 클라이언트를 고르면 설정 파일 위치와 붙여 넣을 내용(명령, JSON, TOML)을 보여 주고 복사합니다. 내용은 DOM 없는 모듈 `src/features/agent/client-configs.ts`가 서버 경로로 만듭니다(단위 테스트). 앱이 다른 프로그램의 설정 파일을 직접 고치지는 않습니다.
- **권한**(이 PC에 저장, `localStorage`): 에이전트 허용(끄면 모든 호출 거절), 변경 허용(끄면 읽기만), 폴더 전체 변경(매번 묻기 / 막기), Stop·Resume.
- **활동 기록**: 최근 호출 200개(시각, 도구, 결과·오류 코드, 걸린 시간, 짧은 요약). 디스패처 한 곳에서 기록합니다. 메모리에만 두고 지우기 버튼을 둡니다.

**여러 클라이언트 호환**
- **입력 스키마 단순화**: 도구 목록을 내보낼 때 스키마를 가장 보수적인 형태로 바꿉니다. `$defs`/`$ref`는 펼쳐 넣고, `$schema`·`format`은 지우고, `"type": ["boolean", "null"]` 같은 배열 타입은 하나로 줄이고, 타입이 없는 값(클래스 id)에는 `string`을 붙입니다(서버는 숫자도 계속 받음). Gemini 계열이나 OpenAI 호환 클라이언트가 거부하는 형태를 피하기 위해서입니다. `el-mcp` 단위 테스트로 29개 도구 전체를 검사합니다.
- **긴 작업의 시간 초과**: 클라이언트마다 도구 시간 제한이 있습니다(예: Codex 기본 60초). 요청에 progress token이 있으면 `el-mcp`가 작업 중 15초마다 진행 알림을 보내 시간 제한을 늘리게 하고, 설정 예시에 클라이언트별 시간 제한 값(Codex `tool_timeout_sec`, Gemini `timeout`)을 넣습니다.
- **프로토콜 버전**: 오래된 클라이언트가 보내는 `2024-11-05`, `2025-03-26`도 협상되는지 확인합니다.
- **로컬 모델**: MCP는 클라이언트 기능이라, 도구 호출(tool calling)을 지원하는 모델과 MCP를 지원하는 클라이언트(LM Studio 등)면 같은 서버를 씁니다. 안내 문서에 적습니다.

검증: 단위 테스트(클라이언트 설정 생성, 스키마 단순화, 권한·활동 기록), 데스크톱 e2e(패널 열기, 상태에 클라이언트 이름 표시, 권한 끄면 `declined`, 활동 기록), 라이트/다크 스크린샷, 오래된 프로토콜 버전으로 초기화.

#### 6단계 결과 (2026-11-11, 완료)

구현:
- **Agent 패널** `src/bootstrap/agent-panel.ts`(새 파일), `index.html`의 `#agentPanel`과 레일 버튼 `#agentPanelBtn`(데스크톱에서만 보임), `css/style.css`. 상태 표시줄의 "Agent working…" 글자를 눌러도 열립니다. 패널을 처음 열 때 에이전트 런타임을 불러옵니다(첫 호출 전이라도). 패널 안의 입력은 사람 작업 중 판정에서 뺐습니다.
- **연결 상태**: Rust `agent_status` 명령(pipe 이름, 대기 여부, pipe 오류, 호출 수, 마지막 호출의 도구·클라이언트·시각, 앱·프로토콜 버전, `easy-labeling-mcp.exe` 경로와 존재 여부). `el-mcp`가 MCP `initialize`의 `clientInfo`(이름·버전)를 `hello`에 실어 보내고, `agent.rs`가 호출마다 기록합니다.
- **클라이언트 설정**: `src/features/agent/client-configs.ts`(새 파일)가 9가지(Claude Code, Claude Desktop, Cursor, VS Code Copilot, Windsurf, Codex CLI, Gemini CLI, LM Studio, 그 밖의 클라이언트)의 설정 위치와 붙여 넣을 내용을 서버 경로로 만듭니다. Codex에는 `tool_timeout_sec = 3600`, Gemini에는 `"timeout": 3600000`을 넣습니다. 마지막으로 고른 클라이언트를 기억합니다.
- **권한**: 디스패처에 `host.access()`(에이전트 끔: 모든 호출 거절 / 변경 끔: `changesApp` 도구 거절)와 `host.record()`(활동 기록)를 추가했습니다. 폴더 전체 변경 "Block"은 런타임의 `confirm` 래퍼가 대화상자 없이 `declined`로 끝냅니다. 설정은 `localStorage`(`easy-labeling:agent-access`)에 두고, 읽지 못하면 기본값(모두 허용, 매번 묻기)입니다.
- **스키마 단순화**: `el-mcp`의 `portable_schema()`가 29개 도구의 입력 스키마에서 `$ref`/`$defs`를 펼치고, `$schema`·`format`을 지우고, 배열 타입을 하나로 줄이고, 타입 없는 값(불리언 스키마 `true` 포함)에 `string`을 붙입니다. 클래스 id는 Rust에서 계속 `Value`라 숫자도 받습니다.
- **긴 작업**: progress token이 있으면 15초마다 진행 알림을 보냅니다(진행 값은 단조 증가, 앱이 보내는 진행과 같은 카운터).
- **프로토콜**: `2024-11-05`, `2025-03-26`, `2025-06-18` 초기화를 확인했습니다(최신 요청은 `2025-11-25`로 협상).

검증:
- unit 634 통과(새 테스트: `client-configs.test.ts` 2개, `agent-panel.test.ts` 3개, `agent-api.test.ts`에 권한·활동 기록 1개). `main.import-smoke`는 전체 실행에서 5초를 넘겼지만 단독 실행 3.2초로 통과했고, **변경 전 커밋(HEAD) worktree에서도 전체 실행 2회 모두 같은 실패**가 나서 이 PC의 부하로 판단했습니다.
- Rust: fmt, clippy(`-D warnings`), `cargo test -p el-agent-protocol -p el-mcp`(새 `schemas_are_plain_enough_for_every_client` 포함) 통과.
- e2e: `agent-desktop` 7개(새 패널 테스트: 대기 상태와 서버 경로, Codex·Claude Code 설정 내용, 호출 후 "Last call: app_state from e2e 0"과 활동 기록, 읽기 전용이면 편집 `declined`·읽기 성공, 폴더 변경 Block이면 재매핑 `declined`·파일 그대로, 에이전트 끔이면 읽기도 `declined`, 새로고침 후 설정 유지), 웹 `bootstrap-smoke`·`ui-consistency`·`ux-stage1`·`ux-stage2` 11개 통과. 패널 라이트/다크 스크린샷 확인.
- 추가 수정(같은 날): 앱 창 전체 스크린샷(라이트/다크)을 e2e에 더해 보니, 다크 테마에서 패널의 드롭다운이 흰 배경으로 남았습니다. 앱의 다크 입력 스타일이 `.modal`, `.control-panel` 안에만 걸려 있어서 같은 규칙에 `.agent-panel`을 더했고, 닫기 버튼은 밝은 필터를 따로 줬습니다. **OpenCode**를 클라이언트 목록에 추가했습니다(`opencode.json`의 `mcp` 블록: `"type": "local"`, `"command": [경로]`; 실제 OpenCode로 연결해 보지는 않음).
- 디버그 빌드(`tauri:dev`)가 콘솔 창과 함께 뜨는 것은 의도된 동작입니다(`#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]`). release 설치본에는 콘솔 창이 없습니다.
- 실행 중인 사용자 앱(PID 6128)이 `target/debug/easy-labeling.exe`를 잡고 있어서 `tauri:dev`가 그 파일을 바꾸지 못했습니다. e2e는 새로 빌드된 바이너리(`target/debug/deps/easy_labeling.exe`)를 `target/debug/easy-labeling-agent-test.exe`로 복사해 돌렸습니다.

### 7단계: 주요 기능을 에이전트가 잘 쓰게 보강

배경: 29개 도구를 앱의 주요 기능(레이아웃, 템플릿 매칭, Refine, Reclass, Review)과 대조했습니다. Refine·Reclass·Review·클래스 재매핑은 버튼과 같은 경로로 잘 연결되어 있었지만, (1) 박스가 수천 개인 SEM 이미지에서 `get_boxes`·`run_refine` 결과가 너무 커서(박스 5,000개면 약 370 KB) 에이전트 컨텍스트를 채우고, (2) 템플릿 매칭과 레이아웃은 저장된 프리셋 실행만 되고, (3) Refine·Reclass를 미리 볼 수 없고, (4) 캡처가 화면 전체뿐이고, (5) 검수 상태를 표시할 수 없었습니다.

| 순서 | 추가·변경 | 내용 |
|---|---|---|
| 1 | 결과 크기 제한 | `get_boxes`(기본 200개, `classId` 필터, `countsByClass`·`total` 항상 포함), `run_refine`·`run_reclass`(바뀐 박스 기본 100개, Refine은 검수 대상 먼저, Reclass는 `changesByClass`), `review_queue`(기본 100개). 공통 `offset`/`limit`(최대 5000, 0이면 개수만), `agent-api.ts#listPage` |
| 2 | `find_similar` | 박스 id나 영역을 템플릿으로 현재 이미지에서 비슷한 것 찾기. Template Matching Setup과 같은 엔진·기본 설정(회색조, 블러 13, 정확 모드). 기존 박스와 IoU 0.3 이상 겹치는 매치는 기본으로 뺌. 기본은 미리보기, `apply: true`면 한 undo 단계로 추가 |
| 3 | `apply_layout`, `save_layout` | 레이아웃을 지정한 위치(또는 저장된 위치)에 적용, 박스(id·선택·전체)를 레이아웃으로 저장(`overwrite`로 같은 이름 교체). 앱의 `captureBoxLayout`·`applyBoxLayout`·`persistLibrary` 그대로 |
| 4 | `dryRun` | `run_refine`·`run_reclass`에 추가. 같은 계산을 하고 박스는 그대로 둠(`refine-controller.ts`의 `run`·`reclass`에 `dryRun` 인자) |
| 5 | `capture_view` 확대 | `annotationId`(박스 + 크기의 절반 여백, 최소 16 px) 또는 `region`. Fabric `toCanvasElement`로 화면 밖에서 다시 그려서 사람 화면은 바뀌지 않음. 그 렌더에 맞춰 그려진 Refine 표시도 합성. 최대 8배 확대 |
| 6 | `set_review_status` | 이미지 목록의 Reviewed / Needs review 버튼과 같은 `setReviewImageStatus`. 기본은 현재 이미지, `images`로 여러 장 |

에이전트가 읽는 내용(도구 설명, 서버 `instructions`, 결과·오류 메시지)은 영어로 둡니다. 서버 `instructions`에 결과가 나뉘어 온다는 점과 권장 흐름(find_similar → run_refine dryRun → 적용 → review_queue·확대 캡처 → approve → save → set_review_status)을 적었습니다.

#### 7단계 결과 (2026-11-11, 완료)

구현:
- 페이지: `agent-tools-state.ts`(`get_boxes` 페이지·필터·개수, `capture_view` 확대), `agent-tools-refine.ts`(`pagedOutcome`, `dryRun`, `review_queue` 페이지, `set_review_status`), `agent-tools-auto.ts`(`find_similar`, `apply_layout`, `save_layout`), `automation-controller.ts`의 `AutomationAgentApi`에 `findSimilar`·`applyLayout`·`saveLayout`, `refine-controller.ts`의 `run`·`reclass`에 `dryRun`.
- 서버: `crates/el-mcp`에 도구 4개와 인자 추가(도구 33개), `portable_schema()`가 선택 구조체의 `anyOf: [$ref, null]`도 펼침(스키마 테스트가 잡아냄). `agent.rs`의 `find_similar` 시간 제한 300초.

검증:
- unit 639 통과(새 테스트: 결과 페이지·검수 대상 먼저·클래스 변경 개수, dry run이면 afterEdit 없음, 검수 상태, find_similar 인자·오류, 레이아웃 적용·저장).
- Rust: fmt, clippy(`-D warnings`), `cargo test -p el-agent-protocol -p el-mcp` 통과.
- e2e `agent-desktop` 8개 통과(새 테스트: 박스 페이지와 클래스별 개수, Refine·Reclass dry run 후 박스 그대로, 한 박스 확대 캡처, 8×8 격자에서 find_similar가 라벨 없는 블록 50개 이상을 찾고 적용·undo, 레이아웃 저장·96 px 아래 적용·undo, 검수 상태가 `review-state.json`에 기록). 확대 캡처 PNG를 열어 이미지·박스·클래스 태그가 보이는 것을 확인했습니다.
- 바뀐 컨트롤러의 기존 e2e(`refine-edges`, `automation-workflow`, `automation-view`, `layout-apply`, `layout-management`) 31개 중 30개 통과. 실패한 `refine-edges`의 "presets: the Run-with preset picked while another folder's settings show is the one E runs with"는 반복 실행에서 3번 중 2번 실패했고, **이번 dryRun 변경을 되돌린 상태에서도 4번 중 1번 실패**해서 이번 변경과 무관한 기존 불안정이었습니다. 원인은 테스트의 경쟁 상태입니다. 두 폴더가 같은 이미지(박스 2개)를 가져서, 폴더 B를 연 뒤의 대기 조건 "박스 2개"가 아직 화면에 남은 폴더 A의 박스로 바로 충족됐습니다. 그 박스를 선택한 직후 B의 이미지 로드가 끝나 박스가 새로 만들어지면서 선택이 사라졌고, E가 "Select boxes to refine first."로 끝났습니다(실패한 실행에서만 선택한 박스 id와 E 시점의 박스 id가 달랐음). 대기 조건을 "박스 id가 바뀔 때까지"로 고쳐 10회 반복 모두 통과, `refine-edges` 24개 통과를 확인했습니다. 앱 동작은 바꾸지 않았습니다.
- 실행 중인 사용자 앱과 MCP 서버가 `target/debug`의 exe를 잡고 있어서, 새로 빌드된 `target/debug/deps/`의 바이너리를 `easy-labeling-agent-test.exe`, `easy-labeling-mcp-test.exe`로 복사해 e2e를 돌렸습니다.

### 8단계: 전문가 수준의 Refine·레이아웃·템플릿 매칭 (숫자로 판단하고 폴더 단위로 빠르게)

배경: 7단계까지의 도구로는 에이전트가 **만들어 둔 설정을 실행하고 결과를 확인**할 수 있습니다. 전문가가 하는 일, 즉 데이터에 맞게 설정을 조정하고 재사용할 작업 흐름으로 만드는 일은 할 수 없습니다. 판단도 캡처를 눈으로 보는 데 기대고, 이미지마다 여러 번 호출해야 해서 폴더가 크면 느립니다. 원칙은 두 가지입니다.

- **판단은 숫자로, 그림은 이상치만**: 에이전트에게 분포·신뢰도·이상치를 주고, 캡처는 숫자가 이상하다고 가리킨 곳만 봅니다.
- **폴더 단위 한 번의 호출**: 폴더(또는 표본)를 한 번에 계산해 요약만 돌려주고, 본 결과를 그대로 적용합니다.

| 순서 | 추가 | 내용 |
|---|---|---|
| 8.1 | 폴더·표본 dry run + 요약 + `resultId` 적용 | `refine_folder`·`reclass_folder`에 `dryRun`(기본 true), `sample`(이미지 수, 고르게 뽑음) 또는 `images`. 결과는 요약(변별 이동 거리·면적 변화·신뢰도 분포, 검토 사유별 개수, 클래스별, 이상치 박스와 이미지 상위 N개)과 `resultId`. 적용은 `resultId`를 넘겨 다시 계산하지 않고 미리 본 텍스트를 그대로 쓰며, 그 사이 바뀐 파일이 있으면 거절합니다. 요약 계산은 DOM 없는 TS 모듈 하나(`domain/refine/folder-summary.ts`)가 맡고, 데스크톱의 Rust 폴더 실행은 요청할 때만 박스별 결과(움직였거나 검토 대상인 박스)를 함께 돌려줍니다. |
| 8.2 | 박스별 신뢰도 숫자 | `run_refine`·`review_queue`·dry run 이상치에 변별 신뢰도(`sideConf`), 전체 신뢰도(`conf`), 이유(약한 변, 면적, 크기 제한)를 붙입니다. Refine이 이미 계산하는 값입니다. |
| 8.3 | 집단 통계 검사 | 크기 이상치(클래스 중앙값에서 벗어난 너비·높이), 행·열 간격과 격자 이상(빠진 자리, 중복), 정렬 이상. 현재 이미지와 폴더 요약 모두. Refine·매칭·레이아웃 결과 확인에 공통으로 씁니다. |
| 8.4 | 매칭 점수 해석 | `find_similar`·템플릿 실행 결과에 점수 분포, 가장 큰 간격과 그 위치(임계값 근거), 예상 개수 대비 커버리지. |
| 8.5 | 설정 읽기·쓰기 | Refine의 클래스·프리셋별 전체 설정 보기와 일부 변경, 프리셋 저장(이전 설정을 보관해 한 번에 되돌리기). `find_similar`의 전체 설정(블러, 패딩, NMS, 검색 영역, 모드, 다른 이미지의 템플릿)과 템플릿 프리셋 저장(레이아웃 관계 포함). 레이아웃 상세(기준점, 박스)와 배치 미리보기, 매칭 위치 + 오프셋 배치. Preprocess 설정과 프리셋 선택. |
| 8.6 | 기준 라벨 비교 | 다른 라벨 폴더(정답)와 IoU로 맞춰 정밀도·재현율과 평균 경계 오차(px). 설정 조정의 최종 점수. |
| 8.7 | 모아 보기 | 이상치 박스 N개를 id를 붙인 격자 이미지 한 장으로, 전/후 박스를 한 crop에 겹쳐서. 캡처 N번보다 빠르고 토큰이 적습니다. |
| 8.8 | 폴더 단위 템플릿 배치 | 앱의 Automation 배치(사전 점검, dry run, 실패 재시도)를 같은 dry run·`resultId` 방식으로. |

에이전트의 작업 흐름은 다음과 같아집니다: 표본 dry run으로 지표 확인 → 진단 숫자로 원인을 추론해 설정 변경 → 같은 표본으로 비교 → 목표 지표(예: 검토 대상 2% 미만, 크기 이상치 0, 기준 대비 평균 오차 1 px 이하)를 만족하면 `resultId`로 적용(사람 승인) → 같은 지표로 다시 검사, 이상치만 모아 보기로 확인.

안전: 폴더 전체 쓰기는 지금처럼 사람 승인과 백업을 거칩니다. dry run은 파일을 쓰지 않습니다. 설정 쓰기(8.5)는 Undo가 없으므로 이전 설정을 보관하고, 프로필 프리셋 쓰기만 허용할지 승인을 받을지는 8.5에서 정합니다. 속도는 폴더 단위 도구와 이미지별 반복을 같은 데이터로 측정해 `docs/migration/BENCH.md`에 기록한 뒤에만 말합니다.

검증(단계마다): 요약·통계 모듈의 단위 테스트, 데스크톱 e2e(dry run이 파일을 바꾸지 않음, `resultId` 적용이 미리 본 텍스트와 같음, 그 사이 파일이 바뀌면 거절), 네이티브와 TS 경로의 요약이 같은지(`easyLabelingNativeOff`), Rust 변경이 있으면 golden·clippy.

#### 8.1 결과 (2026-11-11, 완료)

구현:
- **요약 모듈** `src/domain/refine/folder-summary.ts`(새 파일, DOM 없음): Edge는 전체·움직인·검토 대상 박스 수와 비율, 검토 사유별(약한 변 / 면적 변화 / 크기 제한)과 변별 개수, 움직인 박스의 최대 변 이동 거리(px) 중앙값·90%·최대, 면적 변화율 분포, 신뢰도 10%·중앙값, 클래스별 수치, 이상치 박스(검토 대상 먼저, 그다음 이동 거리 순, 전후 좌표와 이유 포함)와 검토 비율이 높은 이미지. Reclass는 클래스 변경 쌍별 개수와 변경 비율이 높은 이미지. `evenSample`로 표본을 목록 전체에 고르게 뽑습니다(같은 폴더면 늘 같은 표본).
- **파일 계층** `file-system-adapter.ts`: `rewriteDetectionLabels`에 `only`(이미지 일부)와 `dryRun`(백업·쓰기 없이 편집 내용을 `plan`으로 반환). 새 `commitLabelFilePlan(plan)`은 현재 편집을 저장한 뒤 폴더·이미지 목록·편집할 파일이 dry run 때와 같은지 확인하고, 같을 때만 기존과 같은 백업·쓰기 경로로 씁니다.
- **Refine 컨트롤러**: `runFolder`가 `dryRun`이면 승인 없이 계산만 하고, TS 경로와 Rust 경로 양쪽에서 박스별 결과를 모아 요약을 만듭니다. 결과는 `resultId`로 최근 5개까지 보관하고, `applyFolderPlan(resultId)`이 승인 후 그대로 씁니다(한 번 쓰면 지움).
- **Rust**: `refine_folder`에 `details` 요청을 더해, 요청할 때만 움직였거나 검토 대상인 박스의 전체 결과(`RefineResult`: 신뢰도, 변별 신뢰도, 약한 변, 면적 변화, 크기 제한)를 함께 돌려줍니다. 쓰기용 `changed_boxes`의 출력은 그대로라 golden 고정 데이터는 바꾸지 않았습니다.
- **도구**: `refine_folder`·`reclass_folder`의 기본이 dry run(`dryRun` 기본 true)이 되었고 `sample`, `images`, `resultId`, `outliers`를 받습니다. 서버 `instructions`에 폴더 작업은 표본 dry run → 요약으로 판단 → 이상치만 캡처 → `resultId`로 적용하라고 적었습니다.

검증:
- unit 644 통과(새 `folder-summary.test.ts` 4개: 분위수·표본, 움직임·검토 사유·클래스·이상치 집계, 빈 실행, Reclass 집계. `agent-tools-refine.test.ts`에 폴더 dry run 기본값·표본·이름·`resultId` 적용·오류 1개).
- Rust: fmt, clippy(`-D warnings`), `cargo test -p el-core -p el-bench -p el-mcp -p el-agent-protocol` 통과(golden 폴더 Refine 포함).
- e2e `agent-desktop` 8개: dry run이 파일을 바꾸지 않음, **네이티브와 TS 경로의 요약이 같음**(`easyLabelingNativeOff = ["refine-folder"]`), 1장 표본, `resultId` 적용이 미리 본 개수대로 쓰고 백업을 남김, 같은 `resultId`는 다시 쓸 수 없음, 적용 뒤 낡은 표본 dry run은 "changed since the dry run"으로 거절하고 파일을 그대로 둠. `tauri-desktop` 18개(기존 네이티브 폴더 Refine 비교 포함), `refine-edges` 24개 통과.
- 작업 도중 세션이 끊겨 링커가 쓰다 만 PDB·증분 캐시가 손상됐고, 해당 산출물만 지우고 다시 빌드했습니다(코드와 무관).

#### 8.2 결과 (2026-11-11, 완료)

- `run_refine`의 바뀐 박스, `review_queue`의 Edge 대상, 폴더 dry run의 이상치 박스에 `confidence`(전체, 0~1)와 `sideConfidence`(맞춘 변별 T/B/R/L, 0~1)를 붙였습니다. 낮을수록 경계를 확신하지 못한 것이고, 약한 변 판정(`weakSides`)은 변별 신뢰도가 Review below 미만인 변입니다. Refine이 이미 계산하던 값이라 계산은 늘지 않습니다.
- 도구 설명에 신뢰도를 적었습니다. 단위 테스트(이상치의 변별 신뢰도), e2e(`run_refine` 결과의 신뢰도 범위와 네 변) 통과.
- 남은 일: Lab의 경계 프로파일(후보 경계 위치와 강도) 자체를 내보내는 진단은 8.5(설정 조정)와 함께 다룹니다. 신뢰도만으로 원인을 좁히기 어려운 경우가 그때 필요합니다.

#### 8.3 결과 (2026-11-11, 완료)

- **집단 검사 모듈** `src/domain/refine/box-statistics.ts`(새 파일, DOM 없음): 클래스마다 따로, 4개 이상일 때만 판단합니다.
  - 크기 이상치: 너비·높이가 클래스 중앙값에서 MAD 기준 3.5배 이상, 그리고 15% 이상 벗어난 박스(거의 같은 크기의 클래스가 1 px 차이로 걸리지 않게).
  - 행·열: 중심이 중앙 높이(너비)의 절반 안에 드는 박스 3개 이상을 한 줄로 묶고, 줄 중심에서 클래스 높이(너비)의 20% 넘게 벗어난 박스를 `off-row`/`off-column`으로.
  - 간격: 이웃 간격의 아래쪽 절반 중앙값을 피치로 보고, 피치의 정수배(±25%)로 벌어진 자리는 놓친 위치(추정 중심 좌표, 격자에서 행·열에 같은 구멍이 나도 한 번만), 피치의 60% 미만은 `crowded`(중복 가능성). 박스가 붙어 있어 피치가 박스 크기의 절반보다 작으면 간격 검사는 하지 않습니다.
  - 값은 유효숫자 5자리로 돌려줘 픽셀과 정규화 좌표 모두 그대로 읽힙니다.
- **도구 `analyze_boxes`**(읽기 전용, 도구 34개): 기본은 현재 이미지(픽셀, `annotationId`, 저장 전 편집 포함), `sample`·`images`면 저장된 라벨 파일(정규화, `read_labels`와 같은 행 번호)을 읽어 이미지별 개수와 상위 5개 이상치. `classId`로 한 클래스만.
- **폴더 dry run 요약**에 `afterRefine`: Refine 결과로 바뀐 박스에 같은 검사를 돌린 개수와 문제가 많은 이미지.
- 서버 `instructions`에 find_similar·run_refine·apply_layout 뒤에 `analyze_boxes`로 숫자 확인을 권장.

검증: unit 648 통과(새 `box-statistics.test.ts` 4개: 고른 격자는 아무것도 걸리지 않음, 빠진 자리 하나를 한 번만 추정 중심과 함께, 큰 박스·행에서 벗어난 박스·촘촘한 추가 박스, 클래스 분리와 4개 미만 미판단). e2e `agent-desktop` 8개: `find_similar`로 8×8 격자를 채운 뒤 클래스 0 검사가 크기·정렬 문제 0, 빠진 자리 정확히 3개를 클래스 1 박스 중심(±4 px)에서 찾음, 두 이미지 라벨 파일 검사, 폴더 dry run 요약의 `afterRefine`.

## 6. 파일 목록 요약

| 새 파일 / 바뀌는 파일 | 단계 |
|---|---|
| `crates/el-mcp/` (Cargo.toml, `src/main.rs`, `src/tools.rs`, `src/pipe.rs`) | 1 |
| `crates/el-agent-protocol/` (프레임 코덱, 메시지 타입) | 1 |
| `Cargo.toml` (workspace members) | 1 |
| `src-tauri/src/agent.rs`, `src-tauri/src/main.rs` (명령 등록, setup에서 pipe 시작) | 1 |
| `src/platform/tauri-desktop.ts` | 1 |
| `src/features/agent/agent-api.ts`, `src/bootstrap/agent-runtime.ts`, `src/bootstrap/agent-tools-state.ts` | 1 |
| `src/app/createApp.ts`, `index.html`, `css/` | 1 |
| `src/bootstrap/agent-tools-edit.ts` | 2 |
| `src/bootstrap/refine-controller.ts` (실행 함수 공개, confirm 주입), `src/bootstrap/agent-tools-refine.ts` | 3 |
| `src/bootstrap/automation-controller.ts`, `inference-controller.ts`, `src/bootstrap/agent-tools-auto.ts` | 4 |
| `tests/e2e/agent-desktop.spec.ts`, `tests/unit/features/agent/*.test.ts` | 1~4 |
| `src-tauri/tauri.conf.json` (externalBin), 문서, skill | 5 |

## 7. 안전 규칙

- 접근: 같은 사용자만 pipe에 접근합니다(ACL). 원격 접속은 없습니다.
- 폴더 열기, 폴더 단위 쓰기(Refine/Reclass 폴더 실행, 클래스 재매핑)는 사람이 `rfd` 대화상자로 승인해야 합니다. 대화상자에는 무엇을 하는지(폴더, 이미지 수, dry run 결과 요약)를 적습니다.
- 파일 쓰기는 기존 경로(`saveLabels`, `rewriteDetectionLabels`, `applyClassRemap`)만 씁니다. 백업도 기존 방식 그대로입니다. 파일 삭제 도구는 만들지 않습니다.
- 사람이 Stop을 누르면 에이전트 요청을 모두 거절합니다(다시 켤 때까지).
- `eval`에 넣는 값은 `serde_json`이 만든 JSON 리터럴만 씁니다.
- 에이전트가 보낸 값은 기존 검증 함수(`parseNonNegativeClassId` 등)와 좌표 검사를 거칩니다.

## 8. 검증 방법 (단계 공통)

- `/verify`: typecheck, unit, build, Rust(fmt, clippy, test).
- 바뀐 영역의 기존 e2e(편집: `detection-bulk-operation`, `alignment-history`; Refine: `refine-edges`; 자동화: `automation-workflow`; 추론: `inference`)가 그대로 통과해야 합니다. 기존 버튼 동작이 바뀌지 않았다는 증거입니다.
- `npm run tauri:dev` 후 `agent-desktop.spec.ts`.
- UI(작업 중 표시)는 라이트/다크 스크린샷 확인.
- 단계 완료 조건의 시나리오를 Claude Code에서 직접 실행하고 결과를 진행 기록에 남깁니다.

## 9. 로컬 연결 방법

사용자용 자세한 안내는 [AGENT_MCP_GUIDE_KO.md](AGENT_MCP_GUIDE_KO.md)에 있습니다.

```bash
# 설치본 (현재 사용자 설치: %LOCALAPPDATA%\Easy Labeling\)
claude mcp add easy-labeling -- "%LOCALAPPDATA%\Easy Labeling\easy-labeling-mcp.exe"

# 개발 중 (cargo build -p el-mcp 결과)
claude mcp add easy-labeling -- "D:\GIT\easy_labeling\target\debug\easy-labeling-mcp.exe"
```

Claude Desktop, Cursor, Codex는 각 클라이언트의 MCP 설정 파일에 같은 실행 파일을 `command`로 등록합니다(인자 없음). 사용 전에 Easy Labeling 앱을 먼저 실행해 둡니다.

## 10. 진행 기록

| 단계 | 상태 | PR / 커밋 | 검증 | 남은 일 |
|---|---|---|---|---|
| 0 기술 검증 | 완료 (2026-11-11) | 없음 (spike 코드 버림) | rmcp 3.9.0 stdio: 도구 목록·이미지·진행률·취소 확인, Claude Code `-p` 호출 성공, 왕복 중앙값 2.8 ms (100회), confirm 중 timeout | Claude Code 대화형 세션에서 이미지 표시 확인 (1단계) |
| 1 연결 기반 + 상태/탐색 | 완료 (2026-11-11) | 미커밋, v3.4.0 | unit 620, Rust 4, e2e 29 (desktop 25 포함), Claude Code 실사용 확인 | 없음 |
| 2 편집 | 완료 (2026-11-11) | 미커밋, v3.4.0 (1단계와 같은 미배포 버전) | unit 624, Rust 4, e2e 9, Claude Code 편집 실사용 | 없음 |
| 3 Refine·Reclass·Review·폴더 | 완료 (2026-11-11) | 미커밋, v3.4.0 | unit 627, Rust 4, e2e 32 (refine-edges 24 포함), Claude Code 시나리오 | 폴더 작업 진행률 전달(선택) |
| 4 자동화·추론 | 완료 (2026-11-11) | 미커밋, v3.4.0 | unit 629, Rust 4, e2e 20, Claude Code 템플릿 매칭 | 폴더 단위 자동화 배치(선택) |
| 5 배포·문서 | 완료 (2026-11-11) | 미커밋, v3.4.0 | `tauri:dist:win`으로 사이드카 포함 설치 파일 생성(NSIS 스크립트 확인), 사이드카 없이 기본 빌드 통과, release MCP 서버 확인 | 커밋·PR·릴리스 |
| 6 Agent 패널·여러 클라이언트 | 완료 (2026-11-11) | 미커밋, v3.4.0 | unit 634, Rust 5, e2e 18, 패널 스크린샷, 오래된 프로토콜 초기화 | 실제 다른 클라이언트(Cursor, Gemini CLI, OpenCode 등)로 연결 시험 |
| 7 주요 기능 활용 보강 | 완료 (2026-11-11) | PR #52, v3.4.0 | unit 639, Rust 5, e2e 8(agent-desktop) + 31(refine·automation·layout), 확대 캡처 확인 | 8단계로 이어짐 |
| 8 전문가 수준 활용 (숫자 판단, 폴더 단위) | 진행 중 (2026-11-11~), 8.1~8.3 완료 | 8.1·8.2 PR #55, 8.3 미커밋, v3.4.0 | 8.1: unit 644, Rust 31, e2e 50 (agent-desktop 8, tauri-desktop 18, refine-edges 24). 8.2: unit 644, e2e agent-desktop 8. 8.3: unit 648, e2e agent-desktop 8 | 8.4~8.8 |

## 11. 나중에: 헤드리스 대체 경로

앱 없이 배치를 돌릴 필요가 생기면, `el-mcp`가 pipe 연결에 실패했을 때 직접 처리하는 경로를 추가합니다. 도구 이름과 입출력은 그대로이므로 에이전트 설정은 바뀌지 않습니다. 이때 필요한 작업(지금은 하지 않음):
- `refine-settings.json` 해석과 클래스별 설정 합치기(`domain/refine/settings.ts`), YOLO 행 쓰기(`label-file.ts#yoloRow`, JS `toFixed(15)`와 같은 결과), 클래스 파일 해석, 클래스 재매핑을 `el-core`로 이식(golden fixture, parity 테스트).
- 이미 Rust에 있는 것: `refine_folder`, `review_folder`, `label_commit`, `preprocess`, `image_info`.
- 앱에서만 되는 템플릿 매칭, 추론, JPEG 같은 이미지는 헤드리스에서 `skipped`로 돌려줍니다.

## 12. 위험과 미정 사항

- **동기 대화상자**: 사람이 띄운 `confirm`/`alert`가 열려 있는 동안 페이지 JS가 멈춥니다. 그동안 에이전트 요청은 `timeout`이 됩니다. 도구 설명에 "busy/timeout이면 사람에게 확인을 요청하라"고 적습니다.
- **컨트롤러 리팩터링 범위**(3~4단계): 실행 함수를 꺼내면서 버튼 동작이 바뀌지 않아야 합니다. 기존 e2e가 기준이고, 부족하면 리팩터링 전에 테스트를 먼저 추가합니다.
- **사람과 동시 편집**: 2단계에서 확인했습니다. 대화상자, 입력 포커스, 진행 중 작업, 캔버스 위 마우스 누름 동안 편집 도구가 `busy`를 돌려줍니다. 실제 사용에서 문제가 보이면 다시 조정합니다.
- **사이드카 exe 서명과 설치 크기**: 5단계에서 확인합니다.
- **`rmcp` 버전 변화**: `=3.9.0`으로 고정했습니다(0단계). 올릴 때는 협상되는 프로토콜 버전(현재 `2025-06-18` 그대로, 최신 요청 시 `2025-11-25`)을 다시 확인합니다.

## 13. 나중에: YOLOE-26 앱

main의 0~5단계가 모두 끝나고 안정된 뒤 진행합니다. 그 전에는 `track/yoloe26`에 이 작업을 병합하지 않습니다.
- `track/yoloe26`에 main을 병합하고(`git merge main`), YOLOE 앱에서 연결과 기존 도구가 동작하는지 확인합니다.
- pipe 이름: 두 앱을 동시에 실행하면 먼저 연 쪽이 pipe를 차지합니다. 앱별 이름(`easy-labeling-agent-yoloe-…`)으로 나누고, `el-mcp`가 어느 앱에 붙을지 정하는 방법(인자 또는 연결된 앱 우선)을 그때 정합니다.
- YOLOE 전용 인자(텍스트 프롬프트, 모델 선택)를 `run_inference`에 추가합니다. main의 도구 스키마는 바꾸지 않습니다.
- `release:yoloe`로 만든 설치 파일에 `easy-labeling-mcp.exe`가 들어가는지, 서명되는지 확인합니다.
