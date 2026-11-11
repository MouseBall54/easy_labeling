# Easy Labeling

Easy Labeling은 SEM/TEM 같은 이미지에 라벨을 다는 **로컬 이미지 주석 도구**입니다. 서버 없이 내 PC의 이미지 폴더를 직접 읽고 씁니다.

- **Detection**: YOLO 박스 그리기·편집, 정렬, 레이아웃, 클래스 일괄 변경
- **Refine**: 박스 변을 이미지 경계에 자동으로 맞추기(Edge)와 밝기 규칙으로 클래스 바꾸기(Reclass), 검토와 승인
- **Template matching**: 템플릿으로 비슷한 물체 찾기, 레이아웃 배치, 데이터셋 일괄 실행
- **Preprocess**: SEM/TEM용 필터(Destripe, Flatten, Denoise, CLAHE 등)로 만든 Processed 이미지
- **Review**: 라벨 품질 검사(중복, 작은 박스, 경계 밖, 필수 클래스)와 이미지별 검수 상태
- **Inference**: YOLO ONNX 모델 추론(GPU 우선, CPU 자동 전환)
- **Segmentation**: Brush/Erase/Polygon/Superpixel/AI Select(EdgeSAM)로 마스크 작업, YOLO-seg·COCO·LabelMe 내보내기
- **AI 에이전트 연동(MCP)**: Claude Code 같은 AI 에이전트가 열려 있는 앱을 조종(데스크톱 앱)

기능과 옵션, 단축키는 **[기능 및 옵션 안내](docs/FEATURES_AND_OPTIONS_KO.md)**에 있습니다.

## 사용하기

### 웹 버전

- 주소: **https://mouseball54.github.io/easy_labeling/**
- 설치 없이 실행합니다. 폴더를 직접 읽고 쓰기 위해 File System Access API가 필요하므로 **데스크톱 Chrome / Edge**를 권장합니다. 모바일과 일부 브라우저에서는 폴더를 열 수 없습니다.

### Windows 데스크톱 앱

- [Releases](https://github.com/MouseBall54/easy_labeling/releases/latest)에서 `EasyLabeling_<버전>_x64-setup.exe`를 받아 설치합니다. 앱, 샘플 데이터셋, WebView2 오프라인 설치본이 모두 들어 있어 인터넷 없이 설치·실행됩니다.
- 시작할 때 새 버전을 확인하고, 있으면 설치할지 묻습니다(저장하지 않은 변경이 있으면 한 번 더 묻습니다). 인터넷이 없으면 조용히 건너뜁니다.
- 웹 버전과 화면·기능이 같고, 다음이 더해집니다.
  - 프리셋·레이아웃·클래스 파일을 데이터셋과 상관없이 `문서\Easy Labeling\` 아래에 저장합니다.
  - Refine, Processed 이미지, Review 검사, 8bit 회색 TIFF 읽기, Superpixel을 Rust로 실행합니다. 결과는 웹 버전과 같고 더 빠르며, 큰 이미지에서도 화면이 멈추지 않습니다. 측정값은 [docs/migration/BENCH.md](docs/migration/BENCH.md)에 있습니다.
  - 저장하지 않은 채 창을 닫으면 확인합니다.
  - AI 에이전트 연동(아래).

### AI 에이전트 연동 (MCP, 데스크톱)

설치형 앱에는 MCP 서버 `easy-labeling-mcp.exe`가 함께 들어 있어, Claude Code·Claude Desktop·Codex·Cursor 같은 AI 에이전트가 열려 있는 앱 창을 도구로 조종할 수 있습니다. 박스 편집, Refine/Reclass와 검수, 템플릿 매칭과 레이아웃, YOLO 추론을 앱의 버튼과 같은 경로로 실행합니다. 에이전트의 호출 하나는 Undo 한 단계이고, 폴더 전체를 바꾸는 작업은 사람이 승인해야 하며, 하단의 Stop으로 언제든 멈춥니다.

- Claude Code 등록: `claude mcp add easy-labeling -- "%LOCALAPPDATA%\Easy Labeling\easy-labeling-mcp.exe"`
- 앱 왼쪽 레일의 **Agent** 버튼: 연결 상태, 에이전트 앱별 등록 내용 복사, 권한, 활동 기록
- 연결 방법, 도구 33개, 안전 장치: [docs/AGENT_MCP_GUIDE_KO.md](docs/AGENT_MCP_GUIDE_KO.md)

## 데이터 형식

| 대상 | 위치 |
| --- | --- |
| Detection 라벨 | `<이미지 폴더>/label/<이미지 이름>.txt` (YOLO) |
| Segmentation 마스크 | `<이미지 폴더>/mask/<이미지 이름>.png`, `.seg.json` (+ 고른 내보내기 형식) |
| 클래스 파일 | `.yaml` (`id: name` 줄) |
| 도구 설정 | `<이미지 폴더>/.easy-labeling/` (Refine 설정, 검수 상태, 웹 버전의 프리셋) |

## 개발

```bash
npm install          # Node.js 22.12 이상
npm start            # 빌드 후 http://127.0.0.1:4173
npm run dev          # 빌드 watch + 로컬 서버
npm run typecheck && npm run test:unit && npm run build
npx playwright test --project=chromium   # e2e
```

- 데스크톱 앱(Rust stable 필요): `npm run tauri:dev`(디버그 실행 파일 `target/debug/Easy Labeling.exe`), `npm run tauri:dist:win`(설치 파일 `target/release/bundle/nsis/`).
- MCP 서버: `cargo build -p el-mcp`. 데스크톱 e2e: `tests/e2e/tauri-desktop.spec.ts`, `tests/e2e/agent-desktop.spec.ts`(`npm run tauri:dev` 후).
- 구조와 작업 규칙: [AGENTS.md](AGENTS.md). TS → Rust 이식 기록: [docs/migration](docs/migration/AUDIT.md). GitHub Pages 배포: [GITHUB_PAGES_GUIDELINES.md](GITHUB_PAGES_GUIDELINES.md).

### 릴리스 (관리자)

릴리스는 **`main`에 합친 커밋에서만** 만듭니다. 설치된 앱은 `releases/latest`를 따라가므로, 다른 브랜치에서 릴리스하면 기존 사용자 전원이 합쳐지지 않은 빌드로 업데이트됩니다. `scripts/release-tauri.mjs`는 커밋이 push됐는지만 확인하고 브랜치는 확인하지 않습니다.

준비물: `gh auth login`으로 로그인한 GitHub CLI, 서명 키(아래 3번). 키에 비밀번호가 있으면 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`도 설정합니다.

1. `package.json` 버전을 올리고(AGENTS.md "Versioning") 커밋·push한 뒤, 전체 e2e(`npx playwright test --project=chromium`, 약 1시간)를 확인하고 PR로 `main`에 합칩니다. `main`을 받아 그 커밋에서 다음 단계를 실행합니다.
2. `npm run release:tauri`(`main`에서만): YOLOE-26 버전(`track/yoloe26` 브랜치)이 쓰는 `latest-yoloe.json`을 새 릴리스로 옮겨 올리고, 설치 파일을 서명해 빌드하고 `v<버전>` 릴리스와 업데이트 피드를 올립니다. `-- --draft`로 초안만 만들 수 있고(초안은 앱이 보지 못함), `-- --skip-build`는 이미 서명해 빌드한 설치 파일을 그대로 올립니다.
3. 서명 키는 `%USERPROFILE%\.tauri\easy-labeling-updater.key`(또는 `TAURI_SIGNING_PRIVATE_KEY`)를 씁니다. 같은 키가 GitHub Secret `TAURI_SIGNING_PRIVATE_KEY`에도 있습니다. **이 키를 잃으면 이미 설치된 앱은 더 이상 업데이트를 받을 수 없으니 따로 백업해 두세요.**
