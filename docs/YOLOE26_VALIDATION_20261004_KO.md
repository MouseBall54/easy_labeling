# YOLOE-26 GPU 구현 검증 — 2026-10-04

브랜치 `codex/yoloe26-gpu`, 일반 버전 기준 `0028c4e`에 시각 프롬프트 Detection 라벨링을 추가했습니다. NVIDIA GeForce RTX 2080 SUPER, Python 3.11.13, PyTorch 2.11.0+cu130, Ultralytics 8.4.168에서 확인했습니다.

## 프로젝트 셋업

- `npm run yoloe:setup`: 프로젝트 전용 `.venv` 생성 및 실제 CUDA 행렬 연산 PASS.
- `npm run yoloe:prepare`: 공식 `yoloe-26s-seg.pt` 다운로드 PASS.
- 모델 SHA-256: `48f24206bc8680d60cbbfa296b0140da849669b9515058b72f5a945142df0654`.
- `npm run yoloe:start`: localhost GPU 서비스 실행 PASS.
- 모델을 Detection 구조로 로딩한 실제 추론이며, 가짜 prediction tensor나 UI 주입 결과가 아닙니다.

## 자동 검사

- TypeScript 타입 검사·빌드 PASS, 단위 테스트 64개 파일 / 392개 검사 PASS.
- Python 백엔드 단위 테스트 3개 PASS: 예시 클래스 매핑·잘못된 좌표, 회색조 변환, CUDA 요구·만료된 예시 차단.
- 관련 E2E 12개 PASS: YOLOE 준비 오류·Stop·미리보기·저장, 기존 ONNX 1ch/3ch·NCHW/NHWC·CPU 전환·파일 선택, Electron 저장, Classes, 라벨 폴더, Review.
- 새 GPU setup 영역 때문에 기존 ONNX 테스트의 summary 선택자가 겹친 문제를 수정하고 관련 7개를 재실행하여 PASS. 나머지 5개도 통과했습니다.
- YOLOE E2E의 준비 오류·UI 흐름은 응답 fixture로 검사했습니다. 실제 GPU·모델 결과는 아래 별도 Electron 검사로 검증했습니다.
- Ultralytics 설정·캐시는 프로젝트의 `runtime/yoloe/.state`에 보관하며 모델·가상환경과 함께 Git에서 제외합니다.

## 실제 Electron UI 검증

Ultralytics 패키지의 bus/zidane 예제 이미지를 검증 workspace로 복사했습니다. bus 이미지는 RGB PNG와 1ch 회색조 PNG로 준비했습니다. 기준 이미지에서 사람(ID 5)과 버스(ID 12)를 함께 예시로 등록했습니다.

| 입력 | 색상 | 검출 박스 |
|---|---|---:|
| 기준 bus 이미지 | RGB | 4 |
| bus 이미지 | 회색조 | 5 |
| 별도 zidane 이미지 | RGB | 2 |

위 검출 수는 동작 검증이며 정확도 지표가 아닙니다. 예시 선택용 원본 라벨은 완전한 정답 주석이 아닙니다.

- 프로덕션 Electron preload와 `file://` UI에서 로컬 GPU 서비스에 요청.
- 현재 이미지 미리보기로 원본 박스·파일·라벨 폴더가 변경되지 않음.
- 예시의 실제 클래스 ID 5·12가 결과 `.txt`와 클래스 파일에 유지됨.
- 회색조와 RGB 모두 추론·정규화 좌표 저장 성공.
- Auto save를 켠 상태에서도 원본 라벨 보존, 원본 폴더 복귀 성공.
- 전체 실행 후 현재 이미지 재실행으로 같은 결과 폴더 재사용.
- Review 전환 성공, 페이지 오류 없음.
- 밝은·어두운 테마의 썸네일, GPU 표시, 미리보기 캔버스 확인.

재현: GPU 서비스를 실행한 상태에서 `node scripts/verify-yoloe.mjs`.

증거: [results.json](../output/yoloe-validation/results.json), [밝은 테마](../output/yoloe-validation/preview-light.png), [어두운 테마](../output/yoloe-validation/preview-dark.png).

## 합성 세포 데이터 검출 품질

`C:\Git\ym_yolo\datasets\synthetic_cells`의 test 이미지 3장으로 별도 측정했습니다. 첫 이미지의 정답 박스 3개를 같은 클래스 `cell`의 시각 프롬프트로 사용했습니다. 기준 이미지 자체도 3장 측정에 포함됩니다. Confidence 0.25, NMS IoU 0.45, 정답 대응 IoU 0.50에서의 단일 확인이며 mAP 또는 전체 test 성능이 아닙니다.

| 이미지 | 정답 | 검출 | TP | FP | FN |
|---|---:|---:|---:|---:|---:|
| cell_0016.png (기준 이미지) | 57 | 14 | 14 | 0 | 43 |
| cell_0035.png | 80 | 5 | 5 | 0 | 75 |
| cell_0038.png | 58 | 5 | 5 | 0 | 53 |
| 합계 | 195 | 24 | 24 | 0 | 171 |

Precision 100%, Recall 12.31%입니다. 별도 두 이미지의 Recall은 10/138 = 7.25%입니다. 일반 YOLOE-26 사전학습 모델과 이 예시 구성에서는 미검출이 많습니다. 기능은 정상 동작하지만, 앞서 학습한 세포 전용 YOLO 모델의 정확도를 대신할 수 있다는 근거는 없습니다. 세포 자동 라벨링에는 예시 구성·추론 설정 추가 평가 또는 전용 학습이 필요합니다.

재현: `uv run --project runtime/yoloe --locked python scripts/verify-yoloe-cells.py`.

증거: [cells.json](../output/yoloe-validation/cells.json). 원본 모델·데이터셋은 수정하지 않았습니다.
