# AI 에이전트 연동 (MCP) 사용 안내

Easy Labeling 데스크톱 앱(Windows 설치형)은 Claude Code, Claude Desktop, Codex, Cursor 같은 AI 에이전트가 **지금 열려 있는 앱 창**을 조종할 수 있게 MCP(Model Context Protocol) 서버를 함께 설치합니다. 에이전트가 한 작업은 화면에 그대로 보이고, 사람이 언제든 되돌리거나 멈출 수 있습니다.

- 로컬 전용입니다. 인터넷, 계정, 마켓플레이스 등록이 필요 없습니다.
- 웹 버전(GitHub Pages)에서는 쓸 수 없습니다.
- 구현 계획과 진행 기록: [AGENT_MCP_PLAN_KO.md](AGENT_MCP_PLAN_KO.md)

## 1. 연결하기

설치 폴더에 `easy-labeling-mcp.exe`가 `Easy Labeling.exe` 옆에 함께 들어 있습니다(기본 위치 `%LOCALAPPDATA%\Easy Labeling\`). 에이전트 앱에 이 파일을 MCP 서버로 한 번 등록합니다. 서버는 어느 클라이언트에서나 같습니다: **stdio(로컬 명령), 인자 없음**.

**가장 쉬운 방법: 앱의 MCP 패널**

왼쪽 작업 레일 아래쪽의 **MCP** 버튼을 누르면 화면 오른쪽에 MCP 패널이 붙어 열립니다(캔버스가 그만큼 좁아질 뿐 가려지지 않습니다). **Connect**에서 쓰는 에이전트 앱을 고르면, 붙여 넣을 내용이 이 PC의 실제 경로로 채워지고 그 아래에 넣을 위치가 나옵니다. 상자 오른쪽 위 복사 아이콘으로 복사해 붙여 넣으면 됩니다. 위치에 마우스를 올리면 앱별 참고 사항이 보입니다.

| 에이전트 앱 | 넣는 곳 | 형식 |
|---|---|---|
| Claude Code | 터미널에서 `claude mcp add ...` 실행 | 명령 |
| Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` (Settings > Developer > Edit Config) | JSON `mcpServers` |
| Cursor | `%USERPROFILE%\.cursor\mcp.json` | JSON `mcpServers` |
| VS Code (GitHub Copilot) | Command Palette > MCP: Open User Configuration (또는 작업 폴더의 `.vscode\mcp.json`) | JSON `servers` (`"type": "stdio"`) |
| Windsurf | `%USERPROFILE%\.codeium\windsurf\mcp_config.json` | JSON `mcpServers` |
| Codex CLI | `%USERPROFILE%\.codex\config.toml` | TOML `[mcp_servers.easy-labeling]`, `tool_timeout_sec = 3600` |
| Gemini CLI | `%USERPROFILE%\.gemini\settings.json` | JSON `mcpServers`, `"timeout": 3600000` |
| OpenCode | `%USERPROFILE%\.config\opencode\opencode.json`(전체) 또는 프로젝트의 `opencode.json` | JSON `mcp` (`"type": "local"`, `"command": [경로]`) |
| LM Studio (로컬 모델) | Program 탭 > Install > Edit mcp.json | JSON `mcpServers` |
| 그 밖의 MCP 클라이언트 | 클라이언트의 MCP 서버 설정 | 이름 `easy-labeling`, stdio, 명령 = 서버 경로 |

- **시간 제한**: 폴더 전체 Refine이나 전체 이미지 추론은 몇 분 걸릴 수 있습니다. Codex(기본 60초)와 Gemini CLI는 설정 예시의 시간 제한 값을 그대로 쓰세요. 서버는 긴 작업 중 15초마다 진행 알림을 보내서, 진행 알림으로 시간 제한을 늘리는 클라이언트에서는 끊기지 않습니다.
- **로컬 모델**: MCP는 클라이언트 기능이라 모델 회사와 상관없이 씁니다. 도구 호출(tool calling)을 지원하는 모델을 MCP를 지원하는 클라이언트(LM Studio 등)에서 고르면 됩니다. 작은 모델은 도구 44개 중 필요한 것을 고르는 데 서툴 수 있으니, 처음에는 "app_state를 불러서 알려줘"처럼 도구 이름을 짚어 시켜 보세요.
- **호환성**: 도구 입력 형식은 Gemini 계열이나 OpenAI 호환 클라이언트도 받아들이는 단순한 JSON Schema로만 내보냅니다. 오래된 MCP 버전(`2024-11-05`)을 쓰는 클라이언트도 연결됩니다.

직접 입력하는 예:

**Claude Code**

```bash
claude mcp add easy-labeling -- "%LOCALAPPDATA%\Easy Labeling\easy-labeling-mcp.exe"
```

(`%LOCALAPPDATA%`가 펼쳐지지 않는 셸에서는 `C:\Users\<사용자>\AppData\Local\Easy Labeling\easy-labeling-mcp.exe`처럼 전체 경로를 씁니다.)

**Claude Desktop, Cursor, Codex 등** — 각 앱의 MCP 설정 파일에 다음처럼 등록합니다(경로의 `\`는 JSON에서 `\\`로 씁니다).

```json
{
  "mcpServers": {
    "easy-labeling": {
      "command": "C:\\Users\\<사용자>\\AppData\\Local\\Easy Labeling\\easy-labeling-mcp.exe"
    }
  }
}
```

사용할 때는 **Easy Labeling 앱을 먼저 실행해 둡니다.** 앱이 꺼져 있으면 모든 도구가 `app_not_running`을 돌려주고, 에이전트가 앱을 대신 띄우지 않습니다. 앱 버전과 MCP 서버 버전이 다르면 `version_mismatch`가 나오니, 같은 설치 파일로 설치된 것을 씁니다.

### 1.1 에이전트 스킬 설치 (권장)

MCP 연결만으로도 도구는 쓸 수 있지만, 어떤 순서로 쓰면 정확하고 빠른지(측정으로 확인한 방법)를 에이전트에게 알려 주는 스킬을 함께 두면 결과가 좋아집니다. 스킬은 저장소의 [`docs/agent-skills/easy-labeling-mcp/`](agent-skills/easy-labeling-mcp/) 폴더입니다(`SKILL.md`와 근거 수치 `MEASUREMENTS.md`, 에이전트가 읽도록 영어). 저장소가 없으면 GitHub의 `MouseBall54/easy_labeling` 저장소에서 이 폴더를 내려받습니다.

| 에이전트 앱 | 설치 방법 |
|---|---|
| Claude Code | 폴더를 통째로 `%USERPROFILE%\.claude\skills\easy-labeling-mcp\`에 복사합니다(모든 프로젝트에서 사용). 한 프로젝트에서만 쓰려면 그 프로젝트의 `.claude\skills\easy-labeling-mcp\`에 둡니다. Claude Code를 다시 시작하면 Easy Labeling 작업을 시킬 때 스킬을 스스로 불러옵니다. |
| Claude Desktop, claude.ai | `easy-labeling-mcp` 폴더를 zip으로 묶어 Settings > Capabilities의 Skills에서 업로드합니다(스킬 기능이 켜진 계정). |
| Codex CLI | 폴더를 `%USERPROFILE%\.codex\skills\easy-labeling-mcp\`에 복사합니다(스킬을 지원하는 버전). |
| 그 밖의 클라이언트 | 스킬을 지원하지 않으면 `SKILL.md`의 본문을 그 앱의 지침 칸(시스템 프롬프트, 규칙 파일, `AGENTS.md` 등)에 붙여 넣습니다. |

PowerShell로 Claude Code에 설치하는 예(저장소를 받아 둔 경우):

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills" | Out-Null
Copy-Item -Recurse -Force "<저장소>\docs\agent-skills\easy-labeling-mcp" "$env:USERPROFILE\.claude\skills\"
```

앱을 업데이트해 도구가 바뀌면 스킬도 같은 버전의 폴더로 다시 복사합니다.

## 2. 에이전트가 할 수 있는 일 (도구 44개)

| 분류 | 도구 | 하는 일 |
|---|---|---|
| 상태·탐색 | `app_state`, `open_folder`, `list_images`, `go_to_image`, `get_classes` | 앱 상태 확인, 폴더 열기(**사람 승인**), 이미지 목록과 이동, 클래스 목록 |
| 박스 읽기 | `get_boxes`, `read_labels`, `capture_view`, `analyze_boxes`, `compare_labels` | 현재 이미지의 박스(저장 전 편집 포함, 픽셀 좌표, 한 번에 200개씩 나눠 받고 클래스별 개수는 항상 포함), 다른 이미지의 라벨 파일(정규화 좌표), 화면 캡처(PNG) 또는 박스 하나·영역을 확대한 캡처(사람 화면은 그대로), 집단 검사(클래스마다 크기가 비슷한 박스끼리 묶어 크기 이상치, 행·열에서 벗어난 박스, 너무 촘촘한 박스, 간격이 건너뛴 빈자리 = 놓친 물체와 그 추정 위치·크기. 클래스와 상관없이 크기가 비슷하면서 겹치는 박스 = 중복 의심. 현재 이미지 또는 `sample`·`images`로 저장된 라벨 파일), 기준 라벨(정답) 비교(이미지 폴더 안의 다른 라벨 폴더와 IoU로 짝지어 정밀도·재현율·F1, 경계 오차 px, 변별 치우침, 클래스 혼동, 놓친·남는 박스. 현재 이미지는 저장 전 편집 포함) |
| 박스 편집 | `add_boxes`, `update_boxes`, `delete_boxes`, `select_boxes`, `undo`, `redo`, `save` | 추가·이동·크기·클래스 변경·삭제·선택, 되돌리기, 저장(`undo`·`redo`·`save`는 Segmentation에서도 마스크에 동작) |
| 세그멘테이션 | `set_workflow`, `get_regions`, `compare_masks`, `paint_mask`, `edit_regions`, `segment_ai`, `boxes_to_masks`, `analyze_masks`, `clean_masks` | Detection·Segmentation 전환(툴바 탭과 같음), 현재 이미지 마스크를 숫자로 읽기(클래스별 픽셀 수, 연결 영역의 면적·경계 상자·중심·영역 안의 한 점. 저장 전 편집 포함), 정답 마스크와 비교(이미지 폴더 안의 다른 마스크 폴더: 클래스별 IoU·Dice, 경계 F1(허용 2 px), 경계가 평균 몇 px 바깥/안쪽인지, 놓친·남는·클래스 오류 영역), 모양으로 칠하기·지우기(사각형·원·다각형·굵은 선 여러 개를 한 번에, 배경에만 칠하기 선택), 영역 통째로 지우기·클래스 바꾸기(영역 안의 점으로, 또는 클래스와 면적 범위로: 예를 들어 30 px 이하 잡티 한 번에). 편집은 호출마다 실행 취소 한 단계. AI Select(EdgeSAM)를 점·박스 프롬프트 여러 개로 한 번에(박스 안으로 자르기, 가장 큰 조각만, 경계를 이미지 밝기 경계로 몇 px 다듬기 `snapPx`; 결과마다 모델 점수·픽셀 수·경계가 실제 엣지 위에 있는 정도 `edgeFit`. 기본은 미리보기, 고른 결과만 적용), Detection 박스를 마스크로(박스마다 AI Select를 박스 안으로 제한해 실행, 박스 클래스 그대로 또는 지정 클래스, 박스를 얼마나 채웠는지 `fill`, 점수 낮은 박스 목록), 마스크 검사(잡티, 한 영역 안의 구멍, 가는 다리로 붙은 두 영역, 경계가 이미지 엣지에서 벗어난 영역, 영역 경계 상자로 본 크기 이상치·줄 이탈·빠진 자리), 정리(잡티 제거, 구멍 채우기, 가는 다리 끊기, AI 없이 경계를 밝기 경계로 다듬기; 기본은 미리보기). 검사·정리는 `scope: "folder"`·`sample`·`images`로 저장된 마스크 파일에도(정리는 **사람 승인**, 바뀌는 마스크 PNG를 `mask/.easy-labeling/clean-masks-…`에 백업) |
| Refine·검수 | `get_refine_settings`, `run_refine`, `run_reclass`, `review_queue`, `approve`, `review_folder`, `set_review_status` | Refine pane과 같은 동작(`dryRun`이면 바뀔 결과만 보고 적용하지 않음), 검수 대기 목록과 승인, 폴더 전체 라벨 검사, 이미지별 Reviewed / Needs review 표시 |
| 폴더 전체 변경 | `refine_folder`, `reclass_folder`, `remap_classes` | 모든 이미지의 라벨 파일 변경(**사람 승인**, 원본 백업). 셋 다 기본이 미리보기(dry run)입니다. `refine_folder`·`reclass_folder`의 dry run은 파일을 쓰지 않고 숫자 요약(움직인·검토 대상 박스 수, 이동 거리·면적 변화·신뢰도 분포, 클래스별, 먼저 볼 이상치 박스와 이미지)과 `resultId`를 돌려주며, `sample`(예: 20장)이나 `images`로 일부만 볼 수 있습니다. `resultId`로 적용하면 미리 본 결과를 그대로 쓰고, 그 사이 바뀐 파일이 있으면 거절합니다 |
| 템플릿 매칭·레이아웃 | `find_similar`, `list_templates`, `run_template_matching`, `apply_layout`, `save_layout` | 박스 하나(또는 영역)와 비슷한 것을 현재 이미지에서 찾기(기본은 미리보기, 이미 박스가 있는 곳은 건너뜀), 저장된 자동화 프리셋 실행, 레이아웃을 지정한 위치에 적용, 박스를 레이아웃으로 저장 |
| 추론 | `inference_status`, `load_model`, `run_inference` | ONNX 모델 로드와 YOLO 추론(모든 이미지는 **사람 승인**) |

**아직 할 수 없는 일**: Refine Lab·Preprocess 설정 편집, Segmentation 마스크 작업, 템플릿 프리셋 만들기와 매칭 세부 설정(`find_similar`는 Template Matching Setup의 기본값을 씀), 라벨 폴더 탭 전환, 파일 삭제. 이런 일은 앱에서 직접 합니다.

## 3. 작업별 명령 예시

에이전트에게는 평소 말로 시키면 됩니다. 도구 이름을 몰라도 되고, 클래스는 번호나 이름으로 말하면 됩니다.

### 3.1 시작: 상황 파악

> Easy Labeling 상태 알려줘. 그리고 `D:\data\wafer_A` 폴더 열어줘.

> 라벨 없는 이미지가 몇 장인지, 앞에서 10개만 이름 알려줘.

> 지금 이미지에 클래스별로 박스가 몇 개인지만 알려줘. 목록은 필요 없어.

### 3.2 박스 하나로 새 이미지 라벨링

> 클래스 2 박스 하나를 템플릿으로 비슷한 걸 찾아서 먼저 미리 보여줘. 몇 개 찾았는지랑 점수 범위만.

> 점수 0.85 이상으로 다시 찾아서 이번엔 박스로 추가해줘.

> 추가된 것 중 아무거나 3개 확대 캡처해서 제대로 잡혔는지 보여줘.

### 3.3 Refine으로 경계 맞추기 (보고 나서 적용)

> 방금 추가한 박스들 Refine 하면 어떻게 바뀌는지 dryRun으로 보여줘. 검토 대상이 몇 개인지도.

> 괜찮으면 적용해줘. 그 다음 검토 대상 박스들을 하나씩 확대 캡처해서 보여줘.

> 괜찮은 건 승인하고, 이상한 건 원래 위치로 되돌려줘.

### 3.4 Reclass로 클래스 바꾸기

> Reclass 규칙이 지금 뭔지 먼저 알려줘.

> 클래스 1 박스에 Reclass 적용하면 몇 개가 어떤 클래스로 바뀌는지 dryRun으로 보여줘.

### 3.5 레이아웃 재사용

> 지금 선택한 박스들을 "한 줄 셀" 레이아웃으로 저장해줘.

> 그 레이아웃을 지금 위치에서 아래로 96px 옮긴 자리에 하나 더 놓아줘.

> 저장된 템플릿 프리셋 목록 보여주고, "Sample Pink Anchor + Layout" 프리셋(샘플 데이터셋) 결과를 미리보기로만 확인해줘.

### 3.6 폴더 전체 품질 점검과 수정

> 폴더 전체 Review 돌려서 문제 있는 이미지와 문제 종류를 정리해줘.

> 중복 박스 문제가 있는 이미지로 가서, 겹치는 박스 확대 캡처해서 보여주고 중복이면 하나 지워줘.

> 끝난 이미지는 저장하고 Reviewed로 표시해줘.

### 3.7 여러 이미지 반복 처리

> 다음 이미지로 넘어가면서 10장 동안 이렇게 해줘: 클래스 0 박스 하나로 비슷한 것 찾기(0.85 이상) → 추가 → Refine → 검토 대상 수 기록 → 저장. 끝나면 이미지별 결과를 표로 정리해줘.

### 3.8 폴더 전체 변경 (승인 창이 뜸)

> 클래스 3을 1로 바꾸면 폴더 전체에서 몇 개가 바뀌는지 먼저 알려줘.

> 좋아, 적용해줘.

승인 창에서 허락하면 실행되고, 원본 TXT는 백업됩니다.

폴더 전체 Refine·Reclass는 먼저 dry run(파일을 쓰지 않는 미리보기)으로 숫자 요약을 받고, 괜찮으면 그 결과를 그대로 적용합니다.

> 20장만 골라서 "Tight" 프리셋으로 Refine dry run 해줘. 검토 대상 비율, 이동 거리 분포, 이상치 박스 상위 5개만 알려줘.

> 이상치 박스 3개만 확대 캡처해서 보여줘.

> 괜찮네. 이번엔 폴더 전체로 dry run 해 보고, 요약이 비슷하면 그 결과로 적용해줘.

적용은 dry run이 돌려준 `resultId`로 하므로 미리 본 결과가 그대로 쓰입니다. 그 사이 라벨 파일이 바뀌었으면 거절되니 dry run을 다시 하면 됩니다.

> 지금 이미지의 클래스 0 박스 중에 크기가 튀거나 줄에서 벗어난 것, 빠진 자리가 있는지 숫자로 알려줘.

> 빠진 자리에 박스를 추가하고 그 박스들만 Refine한 뒤, 겹치는 중복은 확대 캡처로 확인하고 지워줘.

> Segmentation에서 영역마다 경계 상자를 조금 넓혀 AI Select로 다시 그려줘. snapPx 3으로 경계를 다듬고, edgeFit 1.5 이상인 것만 원래 영역과 바꿔. 전후로 `mask_gt` 점수 비교해줘.

> 이 이미지의 박스 라벨을 마스크로 바꿔줘. snapPx 3으로 하고, 점수 낮은 박스 5개는 확대 캡처로 보여줘.

> 마스크 검사해서 붙어 버린 영역은 끊고, 잡티는 지우고, 구멍은 채워줘. 바꾸기 전에 몇 개가 바뀌는지 먼저 알려줘.

세그멘테이션을 시킬 때 알아 두면 좋은 점(측정 결과):

- 이미 영역이 있으면 AI로 다시 그리기보다 `clean_masks`의 `snapPx`(밝기 경계로 다듬기)가 더 정확하고 훨씬 빠릅니다. AI는 새 영역을 만들 때(박스 → 마스크, 놓친 자리) 씁니다.
- 막대·패드처럼 같은 모양이 빽빽이 반복되면 점 하나로는 무엇을 원하는지 모호합니다(점을 찍은 막대 대신 막대 열 전체를 잡은 일이 있었습니다). 물체 하나를 감싸는 박스로 시키고, 결과 픽셀 수가 예상 크기와 맞는지 확인하게 하세요. `edgeFit`은 너무 크게 잡은 영역을 걸러내지 못합니다.
- 경계가 부드러운 TEM 입자는 `edgeFit`이 낮게 나옵니다(1.1~1.3). 이런 이미지에서는 `minEdgeFit`을 낮추거나 쓰지 않습니다.
- 이름은 같고 확장자만 다른 이미지(예: `a.jpg`와 `a.png`)는 라벨 파일과 마스크 파일을 함께 씁니다. 한 폴더에 두지 마세요. avif·webp 이미지는 앱이 열지 않습니다.

AI Select는 프롬프트 하나에 약 0.15초가 걸립니다(이 PC, WebGPU). 영역이 수백 개인 이미지는 1~2분 걸리니 한 번 호출에 프롬프트를 모아 보내게 하세요(이미지 인코딩은 한 번만 합니다).

박스 id(`annotationId`)는 이미지를 열 때마다 새로 매겨집니다. 에이전트는 이미지를 옮긴 뒤 `get_boxes`로 다시 읽습니다.

### 3.8b 정답 마스크와 비교하기

검수를 끝낸 마스크를 이미지 폴더 안의 다른 폴더(예: `mask_gt`, 파일 이름은 `<이미지 이름>.png`)에 두면 에이전트가 그 폴더를 정답으로 점수를 매깁니다.

> Segmentation으로 바꾸고 `mask_gt`를 정답으로 지금 마스크 점수 매겨줘. IoU, 경계 F1, 경계가 바깥으로 퍼졌는지, 놓친 영역 큰 것 5개 알려줘.

`outwardPx`가 +1이면 마스크가 정답보다 평균 1 px 바깥까지 칠해졌다는 뜻이고, -이면 안쪽으로 모자랍니다. 연습용 데이터: `npm run build` 뒤 `node scripts/bench/make-mask-reference-dataset.mjs <폴더>`는 샘플 SEM 이미지 두 장(영역 1205개)에 정답 `mask_gt`와 일부러 망가뜨린 `mask`(영역마다 ±3 px 팽창·침식, 5% 삭제, 3% 클래스 오류, 잡티)를 만듭니다.

### 3.8a 정답 라벨과 비교해 설정 맞추기

검수를 끝낸 라벨을 이미지 폴더 안의 다른 폴더(예: `label_gt`)에 두면, 에이전트가 그 폴더를 정답으로 점수를 매깁니다. 설정을 바꿀 때마다 점수가 올랐는지 숫자로 확인할 수 있습니다.

> `label_gt`를 정답으로 지금 라벨 점수 매겨줘. F1, 경계 오차, 어느 변이 치우쳤는지, 놓친 박스 상위 5개 알려줘.

> 20장 표본으로 Refine dry run 결과를 적용한 것과 안 한 것 중 어느 쪽이 `label_gt`에 더 가까운지 비교해줘.

변별 치우침(`edgeBiasPx`)이 +2이면 라벨이 정답보다 그 변에서 2 px 바깥에 있다는 뜻입니다. 현재 이미지는 저장하지 않은 편집까지 점수에 들어가고, 다른 이미지는 저장된 파일로 계산합니다.

연습용 데이터: `node scripts/bench/make-reference-dataset.mjs <폴더>`는 샘플의 SEM 이미지 두 장(박스 1203개)에 정답 `label_gt`와, 같은 라벨을 일부러 망가뜨린 `label`(경계 ±3 px, 5% 삭제, 3% 클래스 오류, 2% 중복)을 만듭니다. 에이전트에게 `label`을 고치게 하고 `compare_labels`로 점수를 확인합니다.

### 3.9 YOLO 추론

> `D:\models\cell_v3.onnx` 모델 로드해서 지금 이미지만 추론해줘. 검출 수랑 화면 캡처 보여줘.

결과는 새 라벨 폴더 `inference-<모델 이름>`에 저장되고 그 폴더가 활성 라벨 폴더가 됩니다. 원래 라벨로 돌아가려면 라벨 폴더 탭을 직접 바꿉니다(`Ctrl+1`).

## 4. 편하게 쓰는 요령

- **먼저 보여 달라고 하기**: "먼저 보여줘", "dryRun으로"라고 하면 적용 전에 결과를 확인합니다. `find_similar`, `run_template_matching`, `remap_classes`는 기본이 미리보기입니다.
- **목록 대신 개수와 확대**: 박스가 수천 개인 이미지에서는 "개수만", "확대 캡처해서"가 전체 목록보다 빠르고 정확합니다.
- **눈으로 확인시키기**: "캡처해서 보여줘"라고 하면 에이전트도 화면을 보고 판단하므로 결과가 좋아집니다.
- **마음 놓고 되돌리기**: "방금 거 되돌려" 또는 `Ctrl+Z`로 호출 하나씩 되돌립니다. 폴더 전체 변경은 백업으로만 되돌립니다.
- **안전하게 탐색하기**: 왼쪽 레일의 **MCP** 패널에서 "Allow changes"를 끄면 읽기만 합니다. 바로 멈추려면 하단 **Stop**을 누릅니다.
- **작업 중에는 앱을 건드리지 않기**: 입력칸에 입력 중이거나 대화상자가 열려 있으면 에이전트의 변경이 기다립니다(`busy`).

## 5. 사람이 지키는 장치

MCP 패널의 **Permissions**에서 바로 바꿀 수 있습니다(이 PC에 저장되어 다시 켜도 유지).

- **Allow MCP calls**: 끄면 에이전트 호출을 모두 거절합니다(읽기 포함).
- **Allow changes**: 끄면 읽기만 허용합니다(상태, 박스, 캡처). 편집·Refine·자동화는 거절합니다.
- **Live view**(기본 꺼짐): 에이전트가 만드는 과정을 지켜봅니다. Detection에서는 도구가 추가한 박스가 만든 순서대로 하나씩 나타나고(박스당 0.03초, 최대 2초), Segmentation에서는 AI Select·박스 → 마스크가 영역을 찾는 대로 마스크에 그려집니다. 미리보기 실행이면 계산 중에만 보이고 끝나면 사라집니다. 결과와 실행 취소는 꺼져 있을 때와 같고, 박스를 보여 주는 시간만큼 호출이 늦게 끝납니다.
- **Folder-wide changes**: "Ask"(기본, 승인 창) 또는 "Block"(묻지 않고 거절).
- 패널 위쪽의 **Stop / Resume**: 상태 표시줄의 Stop과 같습니다.

패널 제목 아래 한 줄에 연결 상태와 마지막 호출(보낸 에이전트 앱, 도구, 시각)이 보입니다. 마우스를 올리면 앱 버전, 호출 수, 서버 경로가 나옵니다. **Activity**에는 최근 호출 200개(시각, 도구, 결과, 걸린 시간)가 한 줄씩 남고, 줄에 마우스를 올리면 결과 요약이 보입니다.

- **되돌리기**: 에이전트의 도구 호출 하나는 undo 한 단계입니다. 사람 편집과 같은 기록에 쌓이므로 Ctrl+Z로 되돌릴 수 있습니다.
- **승인 대화상자**: 폴더 열기, 폴더 전체 Refine/Reclass, 클래스 재매핑 적용, 모든 이미지 추론은 앱이 띄우는 Windows 대화상자에서 허락해야 실행됩니다. 거절하면 에이전트는 `declined`를 받습니다.
- **백업**: 폴더 전체를 바꾸는 작업은 앱의 기존 기능과 같이 원본 라벨을 `label/.easy-labeling/` 아래에 백업합니다. 파일을 지우는 도구는 없습니다.
- **작업 중 표시와 Stop**: 에이전트가 일하는 동안 하단 상태 표시줄 가운데에 "Agent working…"이 뜹니다. **Stop**을 누르면 진행 중인 호출을 취소하고, **Resume**을 누를 때까지 앱을 바꾸는 호출을 모두 거절합니다(읽기는 계속 됩니다).
- **사람이 작업 중일 때**: 대화상자가 열려 있거나, 입력칸에 입력 중이거나, 캔버스에서 마우스를 누르고 있거나, 다른 작업이 진행 중이면 앱을 바꾸는 호출은 `busy`를 받고 기다립니다.
- **접근 범위**: 같은 PC의 같은 Windows 사용자만 연결할 수 있습니다(named pipe). 네트워크로는 열리지 않습니다.

## 6. 알아 둘 점

- **긴 결과**: 박스가 수천 개인 이미지에서 결과가 에이전트의 대화창을 채우지 않도록 `get_boxes`, `run_refine`, `run_reclass`, `review_queue`, `find_similar`, `apply_layout`은 목록을 나눠서 돌려줍니다(`offset`/`limit`). 개수(전체, 클래스별, 검수 대상)는 항상 전체 기준입니다. Refine 결과는 검수 대상 박스를 앞에 둡니다.
- **find_similar 설정**: Template Matching Setup의 기본값(회색조, 블러 13, 정확 모드, 최소 점수 0.8)으로 찾습니다. 세부 설정을 바꾸려면 앱에서 프리셋을 저장하고 `run_template_matching`을 씁니다.
- **좌표**: 박스 좌표는 이미지 픽셀 `{x0, y0, x1, y1}`(테두리 포함, 라벨 파일에 저장되는 값)입니다. `read_labels`만 정규화 좌표(0~1)입니다.
- **추론 결과 위치**: `run_inference`는 결과를 모델 전용 라벨 폴더(`inference-<모델 이름>`)에 쓰고 그 폴더를 활성 라벨 세트로 바꿉니다. 원래 라벨은 바뀌지 않습니다.
- **Reclass 규칙**: 새 폴더의 기본 규칙에도 검사가 켜져 있어서 `run_reclass`가 실제로 클래스를 바꿀 수 있습니다. 에이전트가 `get_refine_settings`로 규칙을 먼저 확인하도록 안내되어 있습니다.
- **시간 초과**: 앱에 대화상자(사람이 연 확인 창 등)가 떠 있는 동안에는 앱이 응답하지 못해 `timeout`이 납니다. 대화상자를 닫고 다시 시키면 됩니다. 시간이 지난 요청은 나중에 실행되지 않고 버려집니다.
- **두 개의 앱**: Easy Labeling을 두 개 띄우면 먼저 실행한 창에만 연결됩니다.

## 7. 문제가 생기면

| 메시지 | 원인과 조치 |
|---|---|
| `app_not_running` | 앱이 꺼져 있거나 에이전트 기능이 없는 이전 버전입니다. 앱을 실행하거나 업데이트합니다. MCP 패널 제목 아래 줄이 "Waiting for an MCP client"(초록 점)인지 확인합니다. |
| `version_mismatch` | 앱과 `easy-labeling-mcp.exe`의 버전이 다릅니다. 등록한 경로가 지금 설치된 앱 폴더인지 확인합니다. |
| `busy` | 사람이 앱에서 작업 중입니다. 잠시 뒤 다시 시도합니다. |
| `declined` | 승인 대화상자에서 거절했거나, Stop으로 멈췄거나, MCP 패널의 Permissions에서 막았습니다. 메시지에 어느 것인지 나옵니다. |
| `timeout` | 앱에 대화상자가 떠 있을 가능성이 큽니다. 창을 확인합니다. |
| `no_folder`, `no_image` | 폴더나 이미지가 열려 있지 않습니다. |
