# 일반 버전과 YOLOE-26 GPU 버전

2026-10-04까지 개발한 Detection ONNX 추론을 공통 기준으로 두 버전을 분리합니다.

| 버전 | 브랜치 | 추론 및 셋업 |
|---|---|---|
| 일반 버전 | `main` | 기존 ONNX 추론. WebGPU 우선, CPU/WASM 자동 전환. Python·PyTorch·CUDA 셋업 불필요. |
| YOLOE-26 GPU 버전 | `codex/yoloe26-gpu` | 독립 YOLOE-26 탭의 시각 프롬프트 Detection 박스·Segmentation 마스크 추론. 로컬 Python·PyTorch·CUDA·YOLOE 모델 셋업을 별도로 준비. [셋업·사용법](YOLOE26_GPU_KO.md) |

GPU 브랜치는 일반 버전 기준 커밋 `0028c4e`에서 시작합니다. 이 기준 커밋에는 YOLOE 추론이나 추가 셋업이 없으며, GPU 브랜치에서 전용 UI와 추론 서비스를 추가합니다.

## 공통 기능 유지

이미지·라벨 입출력, Detection/Segmentation 편집, Classes, Review, 테마, 단축키, 기존 ONNX 추론은 두 버전의 공통 기능입니다.

- 공통 기능 변경은 `main`에 독립된 커밋으로 반영한 뒤 GPU 브랜치에도 `git cherry-pick <커밋>`으로 반영합니다.
- GPU 브랜치에서 발견한 공통 버그도 공통 수정과 YOLOE 변경을 별도 커밋으로 나누고, 공통 수정만 `main`에 반영합니다.
- YOLOE 추론·모델 관리·Python/CUDA 셋업 변경은 GPU 브랜치에서 관리합니다. 일반 버전으로 GPU 브랜치를 통째로 병합하지 않습니다.
- 공통 변경을 반영할 때 두 브랜치에서 타입 검사, 단위 테스트, 빌드 및 관련 E2E 테스트를 확인합니다.

## 기준 버전 검증 자료

- [ONNX 추론 사용 및 지원 범위](DETECTION_INFERENCE_KO.md)
- [실제 ym_yolo 모델 검증](DETECTION_INFERENCE_YM_YOLO_20261003_KO.md)
- [WebGPU와 CPU 자동 전환 검증](DETECTION_INFERENCE_GPU_20261004_KO.md)

검증 스크립트·지표·화면 캡처는 Git에 보관합니다. 큰 모델 파일과 복제 데이터셋은 `.gitignore`로 제외하여 로컬에 보관합니다. 실제 모델 검증을 다시 실행하려면 보고서에 기록된 원본 `C:\Git\ym_yolo` 자료로 모델과 검증 workspace를 준비해야 합니다.
