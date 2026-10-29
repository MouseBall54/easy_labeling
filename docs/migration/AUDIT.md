# Rust 마이그레이션 감사

2026-10-29 · 기준 커밋 `34611885` (`main`) · 브랜치 `rust-migration`

표기: **확인** = 코드·커밋·문서에서 직접 봄, **추정** = 측정 필요. 이 문서의 어떤 항목도 "빨라진다"는 주장이 아니며, 수치는 [BENCH.md](BENCH.md)에 측정 후 기록한다.

## 현황

### 셸 3종이 같은 `dist/` 프론트엔드를 공유한다 (확인)

| 셸 | 위치 | 파일 I/O | Rust 사용 |
|---|---|---|---|
| 웹 (GitHub Pages) | `index.html` + `dist/` | File System Access API | 없음 |
| Electron | `electron/*.cjs` | preload가 `showDirectoryPicker`를 Node `fs`로 폴리필 | 없음 |
| Tauri 2 | `src-tauri/` | `src/platform/tauri-desktop.ts`가 Rust command(`src-tauri/src/main.rs`)를 창 전역으로 노출 | 파일·대화상자·프로필 라이브러리·업데이터 + **Refine 네이티브** |

- 프론트엔드: 번들러 없는 TS(`tsc` 1:1 → `dist/`), fabric.js 캔버스, 라이브러리는 `vendor/` 스크립트 전역.
- 배포: Tauri 설치파일은 `npm run release:tauri`로 서명 후 GitHub Release와 인앱 업데이트 피드(`latest.json`, `latest-yoloe.json`)를 올린다. Electron 설치파일은 `npm run electron:dist:win`(수동). YOLOE 변형은 버전을 한 minor 위로 쌍으로 관리한다.
- 결과적으로 **킷의 2단계(Electron → Tauri 2)는 이미 병행 배포 상태**이고, 킷의 1·2단계 중 refine 이식도 Tauri 한정으로 끝나 있다.

### 기존 Rust 코드 (확인)

| 크레이트 | 경로 | 내용 | 줄 수 |
|---|---|---|---:|
| `easy-labeling` (Tauri 앱) | `src-tauri/src/main.rs`, `native.rs` | 파일·대화상자·라이브러리·GPU 이름 command 15개, refine command 3개 | 768 |
| `easy-labeling-compute` | `src-tauri/compute/src/` | `gray.rs`(gray-filters.ts 포트), `preprocess.rs`(preprocessGray), `refine.rs`(edge-refine.ts), `bin/compute-cli.rs` | 1,244 |

- 워크스페이스 루트는 `src-tauri/Cargo.toml`이다(`members = ["compute"]`). 레포 루트에는 `Cargo.toml`이 없다.
- release 프로필: thin LTO, `opt-level = 3`. 커밋 메시지 기록상 fat LTO + codegen-units 1은 rustc 하나에 1.2GB 이상, 설치파일 하나에 약 25분이 걸려 쓰지 않는다. 킷의 `rust-perf` 권장(`lto = "fat"`)과 충돌하므로 그대로 따르지 않는다.
- 경계(확인, `native.rs`):
  - `refine_load_image`: gray 픽셀을 raw 바디로 1회 전송(헤더에 key/width/height). JSON·base64를 쓰지 않는다.
  - `refine_run`: 박스·클래스별 파라미터를 JSON으로 보낸다(박스 수백 개 규모). 결과도 JSON이다.
  - `refine_crop`: `tauri::ipc::Response`로 바이너리를 반환한다.
  - 상태: 전역 `Mutex<Option<RefineImage>>` 한 장과 처리본 캐시 1개.
- 동등성: `tests/unit/native/compute-parity.test.ts`가 `compute-cli`로 TS와 비교한다(전처리 비트 동일, refine 소수 9자리). CLI가 없으면 `describe.skipIf`로 건너뛴다. 이번 감사에서 release CLI를 빌드한 뒤 **25/25 통과**했다.

### 현재 Rust 상태의 결함 (확인, 이번 감사에서 실행)

| 검사 | 결과 |
|---|---|
| `cargo fmt --all -- --check` (src-tauri) | ❌ `compute-cli.rs` 등에서 diff 발생 |
| `cargo clippy -p easy-labeling-compute --all-targets -- -D warnings` | ❌ 오류 4개 (`needless_borrow`, `neg_cmp_op_on_partial_ord` 등) |
| `cargo test -p easy-labeling-compute` | ✅이지만 Rust 테스트가 **0개** |
| CI (`.github/workflows/ci.yml`) | Rust 단계 없음 → parity 테스트는 CI에서 항상 skip |
| 도구 | `rustc`/`cargo` 1.98.1 있음. `cargo-nextest`, `@napi-rs/cli`, `hyperfine`, `rust-analyzer` 없음. Tauri CLI는 npm `@tauri-apps/cli`로 충분 |

## 진행 상황

| 단계 | 상태 | 비고 |
|---|---|---|
| 0) 기반 정비 | **완료 (2026-10-29, `rust-migration` 브랜치, 미커밋)** | 아래 목록 참고 |
| 1) Processed 보기 전처리 네이티브 | **완료 (2026-10-29, 미커밋, v2.22.0)** | 4096×3072 무거운 설정에서 UI 정지 5.8s → 최대 0.2s. 결과는 TS와 바이트 단위로 동일. SharedBuffer 전송(D-006), 비동기 준비 단계(D-007) |
| 2) 폴더 Review 네이티브 | **완료 (2026-10-30, 미커밋, v2.23.0)** | 60장 × 5,000박스 TIFF: 26~28초 → 0.35초. 결과·이미지 상태가 TS와 동일. 라벨 박스 수 스캔도 네이티브(D-008). 확장 구조 정리(D-009) |
| 3) TIFF 8bit gray 디코드 네이티브 | 대기 | |

0단계에서 한 일:
- 크레이트 구조: `src-tauri/compute` → `crates/el-core`(패키지 `el-core`). 루트 워크스페이스(`Cargo.toml`, `Cargo.lock`)로 바꿨고 빌드 출력은 루트 `target/`이다. 바뀐 경로를 반영했다(parity 테스트, e2e 3개, 릴리스 스크립트, README, AGENTS.md, `.gitignore`, vite watch).
- 린트·포맷:
  - `rustfmt.toml`(폭 160, 기존 스타일 유지)을 추가했다.
  - clippy 오류 5개를 동작 변경 없이 고쳤다. NaN 의미는 그대로 두었다.
  - 워크스페이스 전체가 `cargo clippy -D warnings`와 `fmt --check`를 통과한다.
- 골든:
  - `scripts/migration/gen-golden.mjs`가 TS 출력으로 `crates/el-bench/fixtures/`를 만든다(전처리 19건, refine 17건, 576박스 포함). 다시 생성해도 바이트 단위로 같다.
  - `golden_preprocess`, `golden_refine`가 통과한다. 일부러 넣은 차이(픽셀 +0.002, 좌표 +2e-9, 배열 항목 추가)를 모두 잡아내는 것도 확인했다.
- CI: `.github/workflows/rust.yml`(Rust·대상 TS 경로가 바뀔 때만 실행)
  - 리눅스: fmt, clippy, 골든, fixture 재생성 diff, parity
  - 윈도우: Tauri 앱 clippy
- 벤치: `crates/el-bench/benches/core.rs`(criterion)와 `scripts/bench/core.mjs`(TS)가 같은 입력을 쓴다.
- 앱 확인: 새 경로의 `target/debug/Easy Labeling.exe`로 `tauri-desktop.spec.ts` 3/3이 통과했다(네이티브와 JS refine 결과 일치 포함).
- 킷 반영:
  - 스킬 `port-module`, `perf-baseline`, `rust-ts-bridge`, `rust-perf`와 에이전트 `rust-perf-reviewer`를 레포에 맞게 고쳐 넣었다.
  - `verify` 스킬에 Rust 단계를 추가했다.
  - 훅: `rust-fmt.mjs`를 추가했고, `target/` 편집을 차단하며, 버전 알림이 Rust 경로도 보게 했다.
  - 킷의 `migration-audit` 스킬은 이 문서로 대체했다. `tauri-shell` 스킬은 Electron 정리 단계에서 필요할 때 넣는다.

1단계에서 한 일:
- el-core에 `rgba_luma`(JS `toGrayscale`와 같은 f64 연산 순서)를 추가했다.
- Tauri command를 추가했다: `preprocess_view_load`, `preprocess_view_run`, `preprocess_view_run_shared`, `shared_buffer_open`.
- TS:
  - `src/features/segmentation/native-preprocessing.ts`: 브리지. 이미지당 1회 업로드하고, 공유 버퍼가 실패하면 raw로, 네이티브가 실패하면 TS로 돌아간다.
  - 워크플로의 `prepareSegmentationProcessedImage`.
  - 이벤트 핸들러: Q, Processed 버튼, 설정 적용.
- 동등성:
  - 골든 `golden_view`: 10건 바이트 동일.
  - CLI parity `processed view`: 11건 바이트 동일.
  - 앱 e2e: 4096×3072 화면 출력의 SHA-256이 TS 결과와 같다.
- 테스트:
  - 브리지 단위 8개.
  - 워크플로 통합 1개.
  - Q 경합 1개(대기 중 두 번 누르면 마지막 요청만 반영, 네이티브가 없으면 동기 유지).
  - 데스크톱 e2e 1개.
- 부수 효과: refine 이미지 업로드도 공유 버퍼로 옮겼다. raw 업로드는 12.6MB에 약 0.65s였다. 공유 버퍼로 바꾼 뒤의 refine 업로드는 직접 재지 않았고, 같은 경로의 50MB 측정이 0.13s다. 네이티브와 JS refine이 일치하는지는 데스크톱 e2e로 확인했다.

2단계에서 한 일:
- el-core:
  - `js.rs`: JS 의미론. `parseFloat`, trim 공백 집합, `Number#toString`, NaN을 전파하는 min/max.
  - `yolo.rs`: `parseYoloRows`.
  - `review.rs`: `inspectDetectionLabels`. 클래스를 정수로 바꾸고, 임계값이 0보다 크면 x 스윕으로 후보 쌍만 검사한다.
  - `image_info.rs`: 헤더로 크기를 읽는다. JPEG EXIF 회전은 반영하고, TIFF는 tiff.js처럼 회전을 무시한다. 확실하지 않으면 None.
  - `review_folder.rs`: 폴더 병렬 검사와 박스 수 스캔.
- src-tauri:
  - `jobs.rs`: 작업 진행률·취소 레지스트리.
  - `review.rs`: `review_folder`, `label_row_counts` command.
- TS:
  - `src/platform/native-bridge.ts`: 공통 브리지. 기존 전처리·refine도 이 모듈로 옮겼다.
  - `refreshReviewFindings`, `refreshImageWorkflowStatus` 연결. 네이티브가 `null`을 준 이미지와 오류는 TS 경로로 처리한다.
- 동등성:
  - 골든 `golden_review` 9건, `golden_js_semantics` 52건(비트 단위).
  - CLI 차분 테스트: 무작위 라벨 300개 × 설정 3종.
  - 앱 e2e: 네이티브와 TS의 결과·상태 JSON이 같다. EXIF JPEG, eXIf PNG 폴백, 저장 안 한 편집, BOM·CRLF 라벨 포함.
  - 일부러 구현을 틀리게 바꿔 골든이 실패하는 것도 확인했다.
- 테스트:
  - Rust: 단위 8개, jobs 1개.
  - TS: 브리지 단위 5개.
  - 데스크톱 e2e 3개(동등성, TIFF·PNG 성능, 앱 안 취소).

## 핫스팟 (예상 영향 큰 순)

| 순위 | 모듈(경로) | 현재 구현 | 의심 병목 | 이식 난이도 | 기대 효과 |
|---|---|---|---|---|---|
| 1 | Processed 보기·자동화 전처리: `src/features/segmentation/workflow.ts:503`, `src/bootstrap/automation-controller.ts:210` → `preprocessSegmentationImage` | TS, **메인 스레드 동기 실행** (확인) | 큰 필터(flatten σ, diffusion) 적용 시 UI 정지 (추정) | **하~중**: 같은 알고리즘의 Rust 포트가 이미 있다(`preprocess.rs`, 비트 동일). 다만 맞출 것이 셋이다. ① `toGrayscale`과 알파 보존, ② Original 모드의 채널별 톤 커브(gray 경로 아님), ③ 지금 동기 함수인 호출부를 비동기로 바꾸는 일(캐시·경합 처리) | Tauri에서 정지 시간 감소 (추정). 참고 수치: refine-on-Processed TS 684ms → Rust 141ms (`a95511dc`, 전처리 포함) |
| 2 | 폴더 전체 Review: `workers/review-worker.js` + `src/features/review/quality.ts`, 호출 `src/bootstrap/file-system-adapter.ts:731` | TS worker, 이미지마다 O(n²) 비교(코드 주석에 `ponytail` 표기) + TXT를 파일 하나씩 읽음 | 60장 × 5,000박스에서 2,964ms (확인: `docs/LABEL_LOADING_FAST_PATH_KO.md`) | **중**: 메시지·인덱스·순서가 바이트 단위로 같아야 한다 | Rust가 파일 읽기·파싱·검사를 rayon으로 병렬 처리하고 결과만 반환하면 큰 폭 단축 (추정) |
| 3 | TIFF 디코드: `src/features/images/image-decoder.ts` | tiff.js(Emscripten) → RGBA canvas → `toBlob` PNG 인코드 → objectURL → `img.decode()` (확인) | 8bit gray SEM이 RGBA로 4배 커지고 PNG 인코드·디코드를 한 번 더 함 (추정) | **중**: 압축 종류, 16bit, 멀티페이지, 색공간 동등성 | TIFF 데이터셋의 이미지 전환 단축 (추정). **실제 데이터 포맷 확인 필요** |
| 4 | 슈퍼픽셀: `src/features/segmentation/superpixels.ts` (277줄) | TS, 메인 스레드, 결과 캐시 있음 (확인) | 첫 계산 지연 (추정) | 중 | 측정 후 판단 |
| 5 | 템플릿 매칭: `workers/template-matching-worker.js` | OpenCV.js worker | 이전 네이티브 시도가 WebView2 IPC 때문에 더 느렸음 (확인: `a95511dc` 메시지) | 중 | 이미지가 Rust에 상주하게 된 뒤(3번 이후) 재측정. 그 전에는 보류 |
| 6 | ONNX(YOLO, YOLOE, EdgeSAM, SR): `workers/*-inference-worker.js` 등 | onnxruntime-web, WebGPU 우선 | 네이티브(ort+DirectML)는 패키징 부담이 크고 IPC로 이득이 상쇄됨 (확인: 같은 커밋 메시지) | 상 | 범위 밖 |
| 7 | 박스 상태·히트테스트·undo (킷 3단계): `src/features/canvas/*` | fabric 객체가 상태를 소유하고, undo는 전체 rect 스냅샷 | 5,000박스 Rect 생성 약 85ms, 캔버스 적용 약 177ms. 둘 다 **fabric 비용** (확인: 같은 문서) | 상 | Rust가 상태를 가져가도 렌더링은 fabric(JS)에 남고, 편집마다 IPC 왕복이 추가된다. 렌더러 교체 없이는 이득이 불확실하다 (추정) → **보류 권장** |
| 8 | YOLO 파싱·직렬화: `src/domain/yolo/yolo.ts` | TS | 5,000박스 1.8ms (확인: 같은 문서) | 하 | **이득 없음.** `toFixed(15)` 출력의 바이트 호환 위험만 있다 → **이식 제외 권장** |

참고: 이번 세션의 이미지 전환 지연 분석에서, CPU가 포화될 때 `URL.createObjectURL`과 `img.decode`가 브라우저 프로세스의 낮은 우선순위 스레드에 막혀 2~3초씩 멈추는 현상을 확인했다. 원인은 Chromium/Windows 스케줄링이다. JPG/PNG 디코드 자체는 브라우저 네이티브라서 Rust로 옮겨도 이득이 없을 것으로 보인다(추정). 대응은 TS 쪽(WebCodecs `ImageDecoder`)이 맞다.

## 권장 이식 순서

0. **기반 정비** (동작 변경 없음)
   - fmt/clippy 통과.
   - Rust 단위 테스트와 골든 fixture 추가.
   - CI에 Rust 단계 추가: fmt, clippy, test, CLI 빌드 후 parity 테스트 실행.
   - 벤치 크레이트(criterion)와 TS 벤치 스크립트.
   - 측정 시나리오: 현재 refine 기준값을 재측정해 BENCH.md 첫 행으로 둔다.
1. **Processed 보기 전처리를 Tauri에서 네이티브로**
   - 기존 `preprocess.rs`를 재사용하고 경계만 추가한다. TS 경로는 웹·Electron용으로 유지한다.
   - 측정 시나리오 `preprocess-view`: 2048×1536과 4096×3072, 기본 설정과 무거운 설정(flatten σ 200, diffusion 20). 메인 스레드 정지 시간(long task)과 결과가 비트 단위로 같은지를 본다.
2. **폴더 Review 네이티브**
   - 측정 시나리오 `review-folder`: 6장·60장 × 500·5,000박스. 결과 JSON이 TS와 완전히 같아야 한다.
3. **TIFF 디코드 네이티브** (TIFF 데이터가 실제로 쓰이는 경우에만)
   - 측정 시나리오 `load-tiff`: 8bit gray LZW·무압축, 2048×1536과 4096×3072. 전환 지연과 픽셀 동일성을 본다.
4. 3번 이후 재평가: 템플릿 매칭(이미지가 Rust에 상주하는 경우), 슈퍼픽셀.

## 위험 요소

- **TS 구현은 삭제할 수 없다.** 웹(GitHub Pages)과 Electron에는 Rust가 없다. 킷의 "한 릴리스 후 TS 삭제" 원칙은 Tauri 전용 경로에만 적용되고, TS 경로는 계속 유지·동기화해야 한다. 그래서 parity 테스트가 CI에서 실제로 돌아야 한다.
- **WebView2 IPC 비용.** 큰 데이터를 왕복시키는 이식은 이득이 상쇄된다(템플릿 매칭·ONNX 사례). 경계에서는 raw 바이너리를 쓰고, 상태는 Rust에 상주시키고, 결과만 보낸다.
- **바이트 호환.** Review 메시지, YOLO 문자열, 전처리 캐시 키는 기존과 동일해야 한다.
- **빌드 비용.** fat LTO는 메모리·시간 문제로 이미 배제했다. 크레이트 이동 시 `target/` 위치가 바뀌어 parity 테스트 경로, `.gitignore`, 릴리스 스크립트에 영향이 있다.
- **두 변형.** 일반/YOLOE 설치파일, 버전 쌍 규칙, `codex/yoloe26-gpu` 브랜치로의 cherry-pick 정책(`docs/DEVELOPMENT_VARIANTS_KO.md`).
- **킷과 레포 설정 충돌.**
  - 킷의 `CLAUDE.md`, `.claude/skills/verify`, `.claude/settings.json`이 레포의 기존 파일과 이름이 겹친다. 덮어쓰지 않고 병합해야 한다.
  - 킷 문서의 `ui/` 경로는 이 레포에 없다. 프론트엔드는 루트 `src/`다.
