# 일반 버전과 YOLOE-26 버전

두 버전은 같은 브랜치(`main`)의 같은 코드에서 설치 설정만 바꿔 만듭니다.

| 버전 | 설치파일 명령 | 설정 | 차이 |
|---|---|---|---|
| 일반 버전 | `npm run tauri:dist:win` | `src-tauri/tauri.conf.json` | YOLOE-26 모델 없음 |
| YOLOE-26 버전 | `npm run tauri:dist:yoloe:win` | `src-tauri/tauri.yoloe.conf.json`이 위 설정을 덮어씀 | 이름·식별자(`com.easylabeling.yoloe26`)·업데이트 피드(`latest-yoloe.json`)가 다르고, N/S/M/L ONNX 모델(`assets/models/yoloe26/`)을 설치파일에 넣음 |

- YOLOE-26 추론은 ONNX(WebGPU 우선, CPU/WASM 자동 전환)로 앱 안에서 실행합니다. Python·PyTorch·CUDA 셋업은 필요 없습니다. 내장 모델 읽기(`read_yoloe_model`)는 YOLOE 식별자로 빌드한 앱에서만 허용합니다. [셋업·사용법](YOLOE26_GPU_KO.md)
- 버전은 쌍으로 관리합니다. YOLOE 버전은 `package.json`보다 minor가 하나 높고 patch가 같습니다(2.27.1 → 2.28.1). `tests/unit/release/version-pairing.test.ts`가 확인합니다.
- `npm run release:tauri`가 두 설치파일을 함께 빌드·서명하고 GitHub Release에 올립니다.

예전에는 YOLOE-26을 `codex/yoloe26-gpu` 브랜치에서 따로 개발하고 공통 수정을 cherry-pick했습니다. 그 브랜치는 현재 코드에 모두 합쳐졌으므로 더 이상 쓰지 않습니다.

## 기준 버전 검증 자료

- [ONNX 추론 사용 및 지원 범위](DETECTION_INFERENCE_KO.md)
- [실제 ym_yolo 모델 검증](DETECTION_INFERENCE_YM_YOLO_20261003_KO.md)
- [WebGPU와 CPU 자동 전환 검증](DETECTION_INFERENCE_GPU_20261004_KO.md)

검증 스크립트·지표·화면 캡처는 Git에 보관합니다. 큰 모델 파일과 복제 데이터셋은 `.gitignore`로 제외하여 로컬에 보관합니다. 실제 모델 검증을 다시 실행하려면 보고서에 기록된 원본 `C:\Git\ym_yolo` 자료로 모델과 검증 workspace를 준비해야 합니다.
