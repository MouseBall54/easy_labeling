# Rust 마이그레이션 결정 기록

새 결정은 아래에 추가하고, 이전 결정은 지우지 않는다. 바뀐 결정은 새 항목에서 이전 번호를 참조한다.

형식: `## D-번호 제목` · 날짜 · 상태(제안/승인/보류/폐기) · 배경 · 결정 · 근거 · 영향

## 이전에 내려진 결정 (기존 커밋에서 옮겨 적음)

### D-000a Tauri 2 셸을 Electron과 병행 배포
- 상태: 승인 (`312205fb`, PR #33 `f8c9b03d`)
- 결정: 같은 `dist/`를 Tauri 2(WebView2)로도 배포하고, GitHub Release와 인앱 업데이트를 제공한다.

### D-000b Refine과 그 전처리만 네이티브, 템플릿 매칭·ONNX는 JS 유지
- 상태: 승인 (`a95511dc`)
- 근거: 2048×1536, 600박스 기준 repeat refine 158ms → 33ms, Processed 이미지 기준 684ms → 141ms. 템플릿 매칭과 ONNX의 네이티브 포트는 WebView2 IPC 때문에 더 느렸다.

### D-000c 프론트엔드를 WebView2 가상 호스트로 디스크에서 직접 제공
- 상태: 승인 (`bfa792b4`)
- 근거: Tauri asset 프로토콜이 창 스레드에서 약 25MB/s로 동작해 IPC를 막았다(OpenCV.js 822ms → 122ms, ORT wasm 965ms → 103ms).

### D-000d release 프로필은 thin LTO
- 상태: 승인 (`src-tauri/Cargo.toml` 주석)
- 근거: fat LTO + codegen-units 1은 rustc 하나에 1.2GB 이상, 설치파일 하나에 약 25분이 걸렸다.

## 이번 마이그레이션에서 결정할 항목

### D-001 크레이트 구조
- 상태: **승인 — B안** (2026-10-29, 사용자 선택)
- 결정: 루트 `Cargo.toml` 워크스페이스 + `crates/el-core`(`src-tauri/compute` 이동·개명) + `crates/el-bench` + `src-tauri` 멤버. `el-node`는 만들지 않는다(D-002).

| 안 | 구조 | 장점 | 단점 |
|---|---|---|---|
| A. 현 위치 유지 | `src-tauri/compute`를 코어로 쓰고 같은 워크스페이스에 `src-tauri/bench` 추가 | 파일 이동 0, 빌드·릴리스 경로 불변 | 킷 문서의 `crates/el-core` 경로와 다름. 코어가 셸 폴더 안에 있음 |
| B. 루트 워크스페이스 | 루트 `Cargo.toml` + `crates/el-core`(compute 이동·개명) + `crates/el-bench` + `src-tauri` 멤버 | 코어와 셸이 분리되고 킷 구조와 일치. Electron이나 CLI에서도 재사용하기 쉬움 | `target/`이 루트로 이동 → parity 테스트·`.gitignore`·릴리스 스크립트·AGENTS.md 수정, 첫 빌드 재컴파일 |
| C. B + `crates/el-node` | B에 napi-rs 바인딩을 더해 Electron에서도 Rust 사용 | Electron 사용자도 네이티브 속도 | Electron ABI 빌드와 prebuild 관리. Tauri가 이미 같은 역할을 하므로 중복 |

### D-002 Electron 셸의 향후
- 상태: **승인 — Tauri로 일원화 예정** (2026-10-29, 사용자 선택)
- 결정: 네이티브 경로는 Tauri에만 둔다. Electron과 웹(GitHub Pages)은 TS 경로를 유지한다. Electron 제거는 별도 결정으로, 제거 전 사용자 확인을 받는다.
- 영향: napi-rs(`el-node`)는 만들지 않는다. TS 구현은 웹 때문에 계속 유지하므로 parity 테스트를 CI에서 돌린다.

### D-003 킷 3단계(라벨 상태를 Rust Document로 이동) 보류
- 상태: 승인 (2026-10-29, 진행 순서 승인에 포함)
- 근거: 측정된 비용은 fabric 객체 생성·렌더링이다. 파싱 1.8ms 대비 Rect 생성 85ms와 캔버스 적용 177ms(`docs/LABEL_LOADING_FAST_PATH_KO.md`). 상태를 Rust로 옮겨도 렌더링은 JS에 남고, 편집마다 IPC가 추가된다. 렌더러 교체(킷 3단계 선택 항목)와 함께가 아니면 하지 않는다.

### D-004 YOLO 파싱·직렬화 이식 제외
- 상태: 승인 (2026-10-29, 진행 순서 승인에 포함)
- 근거: 5,000박스 파싱 1.8ms로 이식 이득이 없고, `toFixed(15)` 출력의 바이트 호환 위험만 생긴다.

### D-006 큰 픽셀 데이터는 WebView2 SharedBuffer로 주고받는다
- 상태: 승인 (2026-10-29, 1단계 구현 중 측정으로 결정)
- 배경:
  - raw invoke 바디(JS→Rust)는 약 17MB/s였다. 50MB RGBA에 약 3초가 걸렸다.
  - wry가 바디를 1KB씩 읽는 것이 원인으로 보여 4MB로 키워 봤지만 그대로였다. 병목은 WebView2의 요청 바디 전달 자체다.
  - 그 결과 4096×3072 Processed 첫 전환이 5.9초로 TS보다 느렸다.
- 결정:
  - `src-tauri/src/shared_buffer.rs`: Rust가 `CreateSharedBuffer`로 공유 메모리를 만들어 `PostSharedBufferToScript`로 페이지에 보낸다.
    - 업로드는 페이지가 그 메모리에 직접 쓴다.
    - 다운로드는 Rust가 채워서 보낸다.
  - COM 객체는 창 스레드(`with_webview`)에서만 다룬다.
  - 런타임이 지원하지 않거나 10초 안에 버퍼가 오지 않으면 raw 경로로 돌아간다.
  - 페이지가 버린 업로드 버퍼는 최대 4개만 남긴다.
- 근거: 50MB 업로드가 약 3초에서 0.13초로 줄었다.
- 영향:
  - Windows(WebView2) 전용 `unsafe` 코드가 생겼다(`SAFETY` 주석 있음).
  - refine 이미지 업로드(`refine_load_image`)도 같은 경로를 쓴다.
  - 이후 단계(TIFF 디코드 결과 등)도 이 경로를 기본으로 쓴다.

### D-007 Processed 보기: 동기 API는 그대로, 비동기 준비 단계를 앞에 둔다
- 상태: 승인 (2026-10-29)
- 배경: `ensureProcessedImage`와 보기·설정 setter는 동기 함수이고 호출부가 많다. 전부 비동기로 바꾸면 영향 범위가 크다.
- 결정:
  - `prepareSegmentationProcessedImage(config?)`가 네이티브로 계산해 캐시를 채우고, 이어지는 동기 호출은 그 캐시를 먼저 쓴다.
  - 기다릴 것이 없으면 `null`을 돌려준다. 그러면 웹·Electron에서는 이전과 똑같이 동기로 동작한다.
  - 보기 전환과 설정 적용은 번호표(ticket) 방식으로 마지막 요청만 반영한다.
  - 네이티브 오류가 나면 TS로 계산한다.
- 남은 일: 자동화(템플릿 매칭)의 Processed 입력(`automation-controller.ts:210`)과 슈퍼픽셀·EdgeSAM의 processed 입력은 보기가 Original일 때 여전히 TS로 동기 계산한다.

### D-005 이식 순서와 데이터 포맷
- 상태: 승인 (2026-10-29, 사용자 선택)
- 실제 데이터: TIFF 8bit gray, JPG/PNG. 16bit TIFF는 대상이 아니다.
- 순서:
  - 0) 기반 정비(구조 이동, fmt/clippy, Rust 테스트·골든, CI, 벤치)
  - 1) Processed 보기 전처리 네이티브
  - 2) 폴더 Review 네이티브
  - 3) TIFF 8bit gray 디코드 네이티브
- 각 단계는 측정 → 이식 → 동등성 → 교체 순으로 진행한다.
