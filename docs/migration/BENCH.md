# Rust 마이그레이션 벤치 기록

규칙(`perf-baseline`):
- 이식 **전에** 기준값을 잡는다.
- 같은 fixture를 쓴다.
- Rust는 `--release`, TS는 빌드된 `dist/`로 잰다.
- 경계(IPC) 포함 시간과 순수 Rust 시간을 나눠 적는다.
- 기존 행은 지우지 않는다.

| 날짜 | 시나리오 | 입력 | 구현 | 중앙값 | p95 | peak RSS | 커밋 | 비고 |
|---|---|---|---|---:|---:|---:|---|---|
| 2026-10-29 | refine-500 | 2048×1536 합성, 500박스, 기본 파라미터 | TS (Node 24, dist) | 133.8ms | 184.5ms | - | 34611885+작업트리 | 순수 함수, 1스레드 |
| 2026-10-29 | refine-500 | 같음 | Rust el-core (release) | 10.1ms | 14.9ms | - | 같음 | 순수 함수, rayon 6스레드, IPC 제외 |
| 2026-10-29 | refine-1000 | 2048×1536 합성, 1,000박스 | TS | 239.2ms | 311.1ms | - | 같음 | |
| 2026-10-29 | refine-1000 | 같음 | Rust | 18.2ms | 22.0ms | - | 같음 | |
| 2026-10-29 | refine-500 | 4096×3072 합성, 500박스 | TS | 149.3ms | 185.8ms | - | 같음 | |
| 2026-10-29 | refine-500 | 같음 | Rust | 11.7ms | 17.1ms | - | 같음 | |
| 2026-10-29 | refine-1000 | 4096×3072 합성, 1,000박스 | TS | 274.1ms | 332.2ms | - | 같음 | |
| 2026-10-29 | refine-1000 | 같음 | Rust | 21.2ms | 27.4ms | - | 같음 | |
| 2026-10-29 | preprocess-view (typical) | 2048×1536, median + CLAHE 2 | TS | 358.6ms | 527.7ms | - | 같음 | 앱에서는 **메인 스레드 동기 실행** → 그대로 화면 정지 |
| 2026-10-29 | preprocess-view (typical) | 같음 | Rust | 64.9ms | 77.0ms | - | 같음 | |
| 2026-10-29 | preprocess-view (heavy) | 2048×1536, flatten σ200 + diffusion 20 | TS | 1,566.4ms | 1,666.2ms | - | 같음 | 메인 스레드 |
| 2026-10-29 | preprocess-view (heavy) | 같음 | Rust | 234.0ms | 281.4ms | - | 같음 | |
| 2026-10-29 | preprocess-view (typical) | 4096×3072 | TS | 1,414.0ms | 1,467.2ms | - | 같음 | 메인 스레드 |
| 2026-10-29 | preprocess-view (typical) | 같음 | Rust | 259.6ms | 310.6ms | - | 같음 | |
| 2026-10-29 | preprocess-view (heavy) | 4096×3072 | TS | 4,991.7ms | 5,051.8ms | - | 같음 | 메인 스레드 |
| 2026-10-29 | preprocess-view (heavy) | 같음 | Rust | 941.3ms | 1,063.0ms | - | 같음 | |

| 2026-10-29 | preprocess-view (default edge-blend) | 2048×1536 | TS | 122.0ms | 408.8ms | - | 1단계 작업트리 | 15회 |
| 2026-10-29 | preprocess-view (default edge-blend) | 같음 | Rust | 55.4ms | 63.5ms | - | 같음 | |
| 2026-10-29 | preprocess-view (default edge-blend) | 4096×3072 | TS | 413.1ms | 586.7ms | - | 같음 | 15회 |
| 2026-10-29 | preprocess-view (default edge-blend) | 같음 | Rust | 210.0ms | 298.6ms | - | 같음 | |

### 앱 안 측정 (Tauri 디버그 exe, IPC 포함)

| 날짜 | 시나리오 | 입력 | 구현 | 값 | 비고 |
|---|---|---|---|---:|---|
| 2026-10-29 | JS→Rust 업로드, raw invoke 바디 | 50MB RGBA | Tauri IPC | 2,770~3,250ms (3회) | 약 17MB/s. wry의 1KB 바디 읽기를 4MB로 키워도 그대로였다 → 병목은 WebView2의 요청 바디 전달 |
| 2026-10-29 | JS→Rust 업로드, raw invoke 바디 | 12.6MB gray | Tauri IPC (기존 refine 경로) | 607~818ms | |
| 2026-10-29 | Rust→JS 바이너리 응답 | 12.6MB | `Response` | 227~442ms | 약 30~55MB/s |
| 2026-10-29 | JS→Rust 업로드, **WebView2 SharedBuffer** | 50MB RGBA | `shared_buffer.rs` | **118~145ms** | 3회. 약 23배 |
| 2026-10-29 | Processed 첫 전환 (Q), 기본 설정 | 4096×3072 gray PNG | 네이티브 | 중앙값 1,252ms (1,004~1,300, 5회), UI 최대 정지 중앙값 311ms | `tauri-desktop.spec.ts`. 원본 픽셀 추출 약 290ms 포함 |
| 2026-10-29 | 같음 | 같음 | TS (같은 페이지에서 직접) | 전처리만 중앙값 753ms(733~894) **전부 UI 정지** + 공통 픽셀 추출·캔버스 쓰기 약 370ms | |
| 2026-10-29 | 설정 변경: flatten σ200 + diffusion 20 | 4096×3072 | 네이티브 | 중앙값 1,543ms (1,402~1,826), UI 최대 정지 중앙값 202ms | 업로드 없음 |
| 2026-10-29 | 같음 | 같음 | TS | 중앙값 5,793ms (5,679~6,004) **전부 UI 정지** | |
| 2026-10-29 | 첫 전환 구간 분해 | 4096×3072, 기본 설정 | 네이티브 | 픽셀 추출 290 / 업로드+luma 236 / 처리+다운로드 414 / RGBA 조립 약 120(이후 32비트 쓰기로 개선) / 캔버스 쓰기 79ms | 일회성 측정 |

측정 조건 (2026-10-29):
- 장비: i5-8600K 6코어/6스레드, Windows 10.
- 측정 중 다른 프로세스의 CPU 사용 약 20~30%(svchost, docker 등)가 있었다. 절대값은 그만큼 보수적이고, TS와 Rust는 같은 조건에서 연달아 쟀다.
- 입력: `node scripts/migration/gen-golden.mjs --bench`.
- Rust: `cargo bench -p el-bench --bench core`. 중앙값과 p95는 criterion `sample.json`의 반복당 시간으로 계산했다.
- TS: `node scripts/bench/core.mjs --runs 30`. 워밍업 3회 후 30회 측정했다.
- 모두 IPC를 뺀 순수 계산 시간이다. 앱 안에서의 시간(IPC 포함)은 각 단계에서 따로 잰다.

요약:
- refine은 순수 계산 기준 **약 12~13배** 빠르다(2048×1536, 500박스: 134ms → 10ms). Tauri 앱에서는 이미 Rust 경로를 쓰고 있다.
- `tests/e2e/tauri-desktop.spec.ts`가 출력하는 "native N ms, js M ms"는 비교 근거로 쓰지 않는다. 박스 40개를 1회만 돌리고, 먼저 도는 네이티브 쪽이 worker 생성·이미지 업로드·스레드풀 초기화를 떠안는 동등성 테스트의 로그이기 때문이다(2026-10-29 실행: native 506ms, js 330ms).
- Processed 보기 전처리는 **약 5~7배** 빠르다. 사용자가 체감하는 지점은 "4096×3072 heavy 설정에서 화면 정지 약 5.0초 → 약 0.9초(백그라운드)"이다. 1단계 이식의 근거.
- 1단계 결과(앱 안): 4096×3072에서 무거운 설정 적용 시 **UI 정지 약 5.8초 → 최대 0.2초**, 결과 표시까지 약 1.5초.
- 기본 설정의 첫 전환은 결과 표시까지의 시간이 TS와 비슷하다(약 1.1~1.3초). 차이는 UI가 그동안 멈추지 않는다는 점이다(최대 0.3초).
- 처음 구현은 raw IPC 업로드 때문에 첫 전환이 5.9초로 오히려 느렸다. SharedBuffer로 바꿔 해결했다(D-006).

## 이전 기록 (재측정 아님, 출처의 측정값을 옮겨 적음)

아래 값은 이번 마이그레이션의 측정 조건(같은 fixture, 30회 이상, p95)과 다르다. 비교 기준으로 쓰기 전에 0단계에서 다시 측정한다.

| 출처 날짜 | 시나리오 | 입력 | 구현 | 값 | 출처 |
|---|---|---|---|---:|---|
| 2026-10-13 | refine 반복 실행 | 2048×1536, 600박스 | TS worker | 158ms | `a95511dc` 커밋 메시지 |
| 2026-10-13 | refine 반복 실행 | 2048×1536, 600박스 | Rust (Tauri) | 33ms | 같음 |
| 2026-10-13 | refine on Processed | 2048×1536, 600박스 | TS worker | 684ms | 같음 |
| 2026-10-13 | refine on Processed | 2048×1536, 600박스 | Rust (Tauri) | 141ms | 같음 |
| 2026-10-07 | 현재 라벨 로딩(파싱) | 5,000박스 | TS | 1.8ms | `docs/LABEL_LOADING_FAST_PATH_KO.md` |
| 2026-10-07 | Rect 생성·초기 글자 배치 | 5,000박스 | TS(fabric) | 84.5ms | 같음 |
| 2026-10-07 | 캔버스 적용·UI 갱신 | 5,000박스 | TS(fabric) | 176.7ms | 같음 |
| 2026-10-07 | 폴더 전체 Review | 60장 × 5,000박스 | TS worker | 2,964.4ms | 같음 |
| 2026-10-29 | 이미지 전환(Detection, 약 300박스) | 샘플 이미지, 평상시 부하 | TS(Electron) | 평균 289ms | 이번 세션 측정 (EdgeSAM 게이팅 후, 105회) |
