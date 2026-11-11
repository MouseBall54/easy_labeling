# AI 에이전트 연동 (MCP) 사용 안내

Easy Labeling 데스크톱 앱(Windows 설치형)은 Claude Code, Claude Desktop, Codex, Cursor 같은 AI 에이전트가 **지금 열려 있는 앱 창**을 조종할 수 있게 MCP(Model Context Protocol) 서버를 함께 설치합니다. 에이전트가 한 작업은 화면에 그대로 보이고, 사람이 언제든 되돌리거나 멈출 수 있습니다.

- 로컬 전용입니다. 인터넷, 계정, 마켓플레이스 등록이 필요 없습니다.
- 웹 버전(GitHub Pages)에서는 쓸 수 없습니다.
- 구현 계획과 진행 기록: [AGENT_MCP_PLAN_KO.md](AGENT_MCP_PLAN_KO.md)

## 1. 연결하기

설치 폴더에 `easy-labeling-mcp.exe`가 `Easy Labeling.exe` 옆에 함께 들어 있습니다(기본 위치 `%LOCALAPPDATA%\Easy Labeling\`). 에이전트 앱에 이 파일을 MCP 서버로 한 번 등록합니다. 서버는 어느 클라이언트에서나 같습니다: **stdio(로컬 명령), 인자 없음**.

**가장 쉬운 방법: 앱의 Agent 패널**

왼쪽 작업 레일 아래쪽의 **Agent** 버튼을 누르면 오른쪽에 Agent 패널이 열립니다. "Connect an agent"에서 쓰는 에이전트 앱을 고르면, 설정을 넣을 위치와 붙여 넣을 내용이 이 PC의 실제 경로로 채워져 나옵니다. **Copy**로 복사해 붙여 넣으면 됩니다.

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
- **로컬 모델**: MCP는 클라이언트 기능이라 모델 회사와 상관없이 씁니다. 도구 호출(tool calling)을 지원하는 모델을 MCP를 지원하는 클라이언트(LM Studio 등)에서 고르면 됩니다. 작은 모델은 도구 33개 중 필요한 것을 고르는 데 서툴 수 있으니, 처음에는 "app_state를 불러서 알려줘"처럼 도구 이름을 짚어 시켜 보세요.
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

## 2. 에이전트가 할 수 있는 일 (도구 33개)

| 분류 | 도구 | 하는 일 |
|---|---|---|
| 상태·탐색 | `app_state`, `open_folder`, `list_images`, `go_to_image`, `get_classes` | 앱 상태 확인, 폴더 열기(**사람 승인**), 이미지 목록과 이동, 클래스 목록 |
| 박스 읽기 | `get_boxes`, `read_labels`, `capture_view` | 현재 이미지의 박스(저장 전 편집 포함, 픽셀 좌표, 한 번에 200개씩 나눠 받고 클래스별 개수는 항상 포함), 다른 이미지의 라벨 파일(정규화 좌표), 화면 캡처(PNG) 또는 박스 하나·영역을 확대한 캡처(사람 화면은 그대로) |
| 박스 편집 | `add_boxes`, `update_boxes`, `delete_boxes`, `select_boxes`, `undo`, `redo`, `save` | 추가·이동·크기·클래스 변경·삭제·선택, 되돌리기, 저장 |
| Refine·검수 | `get_refine_settings`, `run_refine`, `run_reclass`, `review_queue`, `approve`, `review_folder`, `set_review_status` | Refine pane과 같은 동작(`dryRun`이면 바뀔 결과만 보고 적용하지 않음), 검수 대기 목록과 승인, 폴더 전체 라벨 검사, 이미지별 Reviewed / Needs review 표시 |
| 폴더 전체 변경 | `refine_folder`, `reclass_folder`, `remap_classes` | 모든 이미지의 라벨 파일 변경(**사람 승인**, 원본 백업). `remap_classes`는 기본이 미리보기 |
| 템플릿 매칭·레이아웃 | `find_similar`, `list_templates`, `run_template_matching`, `apply_layout`, `save_layout` | 박스 하나(또는 영역)와 비슷한 것을 현재 이미지에서 찾기(기본은 미리보기, 이미 박스가 있는 곳은 건너뜀), 저장된 자동화 프리셋 실행, 레이아웃을 지정한 위치에 적용, 박스를 레이아웃으로 저장 |
| 추론 | `inference_status`, `load_model`, `run_inference` | ONNX 모델 로드와 YOLO 추론(모든 이미지는 **사람 승인**) |

에이전트에게는 평소 말로 시키면 됩니다. 예:

- "지금 이미지의 박스 수와 화면을 보여줘"
- "클래스 2 박스만 Refine하고, 검수 대상이 있으면 하나씩 보여줘"
- "폴더 전체를 Review하고 문제 있는 이미지 목록을 정리해줘"
- "클래스 3을 1로 바꾸면 몇 개가 바뀌는지 먼저 알려줘"
- "이 박스와 비슷한 것을 모두 찾아서 박스로 추가하고, Refine하면 어떻게 바뀌는지 먼저 보여줘"
- "선택한 박스들을 '한 줄' 레이아웃으로 저장하고, 아래쪽 96 px 위치에 하나 더 놓아줘"

## 3. 사람이 지키는 장치

Agent 패널의 **Permissions**에서 바로 바꿀 수 있습니다(이 PC에 저장되어 다시 켜도 유지).

- **Allow AI agents**: 끄면 에이전트 호출을 모두 거절합니다(읽기 포함).
- **Allow changes**: 끄면 읽기만 허용합니다(상태, 박스, 캡처). 편집·Refine·자동화는 거절합니다.
- **Folder-wide changes**: "Ask me each time"(기본, 승인 창) 또는 "Block"(묻지 않고 거절).
- **Stop agent / Resume agent**: 상태 표시줄의 Stop과 같습니다.

패널의 **Connection**에는 연결 상태, 마지막 호출과 그 호출을 보낸 에이전트 앱의 이름·버전이 보이고, **Activity**에는 최근 호출 200개(시각, 도구, 결과, 걸린 시간)가 남습니다.

- **되돌리기**: 에이전트의 도구 호출 하나는 undo 한 단계입니다. 사람 편집과 같은 기록에 쌓이므로 Ctrl+Z로 되돌릴 수 있습니다.
- **승인 대화상자**: 폴더 열기, 폴더 전체 Refine/Reclass, 클래스 재매핑 적용, 모든 이미지 추론은 앱이 띄우는 Windows 대화상자에서 허락해야 실행됩니다. 거절하면 에이전트는 `declined`를 받습니다.
- **백업**: 폴더 전체를 바꾸는 작업은 앱의 기존 기능과 같이 원본 라벨을 `label/.easy-labeling/` 아래에 백업합니다. 파일을 지우는 도구는 없습니다.
- **작업 중 표시와 Stop**: 에이전트가 일하는 동안 하단 상태 표시줄 가운데에 "Agent working…"이 뜹니다. **Stop**을 누르면 진행 중인 호출을 취소하고, **Resume**을 누를 때까지 앱을 바꾸는 호출을 모두 거절합니다(읽기는 계속 됩니다).
- **사람이 작업 중일 때**: 대화상자가 열려 있거나, 입력칸에 입력 중이거나, 캔버스에서 마우스를 누르고 있거나, 다른 작업이 진행 중이면 앱을 바꾸는 호출은 `busy`를 받고 기다립니다.
- **접근 범위**: 같은 PC의 같은 Windows 사용자만 연결할 수 있습니다(named pipe). 네트워크로는 열리지 않습니다.

## 4. 알아 둘 점

- **긴 결과**: 박스가 수천 개인 이미지에서 결과가 에이전트의 대화창을 채우지 않도록 `get_boxes`, `run_refine`, `run_reclass`, `review_queue`, `find_similar`, `apply_layout`은 목록을 나눠서 돌려줍니다(`offset`/`limit`). 개수(전체, 클래스별, 검수 대상)는 항상 전체 기준입니다. Refine 결과는 검수 대상 박스를 앞에 둡니다.
- **find_similar 설정**: Template Matching Setup의 기본값(회색조, 블러 13, 정확 모드, 최소 점수 0.8)으로 찾습니다. 세부 설정을 바꾸려면 앱에서 프리셋을 저장하고 `run_template_matching`을 씁니다.
- **좌표**: 박스 좌표는 이미지 픽셀 `{x0, y0, x1, y1}`(테두리 포함, 라벨 파일에 저장되는 값)입니다. `read_labels`만 정규화 좌표(0~1)입니다.
- **추론 결과 위치**: `run_inference`는 결과를 모델 전용 라벨 폴더(`inference-<모델 이름>`)에 쓰고 그 폴더를 활성 라벨 세트로 바꿉니다. 원래 라벨은 바뀌지 않습니다.
- **Reclass 규칙**: 새 폴더의 기본 규칙에도 검사가 켜져 있어서 `run_reclass`가 실제로 클래스를 바꿀 수 있습니다. 에이전트가 `get_refine_settings`로 규칙을 먼저 확인하도록 안내되어 있습니다.
- **시간 초과**: 앱에 대화상자(사람이 연 확인 창 등)가 떠 있는 동안에는 앱이 응답하지 못해 `timeout`이 납니다. 대화상자를 닫고 다시 시키면 됩니다. 시간이 지난 요청은 나중에 실행되지 않고 버려집니다.
- **두 개의 앱**: Easy Labeling을 두 개 띄우면 먼저 실행한 창에만 연결됩니다.

## 5. 문제가 생기면

| 메시지 | 원인과 조치 |
|---|---|
| `app_not_running` | 앱이 꺼져 있거나 에이전트 기능이 없는 이전 버전입니다. 앱을 실행하거나 업데이트합니다. Agent 패널의 Connection이 "Waiting for agents"인지 확인합니다. |
| `version_mismatch` | 앱과 `easy-labeling-mcp.exe`의 버전이 다릅니다. 등록한 경로가 지금 설치된 앱 폴더인지 확인합니다. |
| `busy` | 사람이 앱에서 작업 중입니다. 잠시 뒤 다시 시도합니다. |
| `declined` | 승인 대화상자에서 거절했거나, Stop으로 멈췄거나, Agent 패널의 Permissions에서 막았습니다. 메시지에 어느 것인지 나옵니다. |
| `timeout` | 앱에 대화상자가 떠 있을 가능성이 큽니다. 창을 확인합니다. |
| `no_folder`, `no_image` | 폴더나 이미지가 열려 있지 않습니다. |
