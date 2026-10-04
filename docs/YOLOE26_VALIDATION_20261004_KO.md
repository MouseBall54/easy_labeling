# YOLOE-26 GPU 구현 검증 — 2026-10-04

브랜치 `codex/yoloe26-gpu`, 일반 버전 기준 `0028c4e`에 독립 YOLOE-26 탭과 시각 프롬프트 Detection 박스·Segmentation 마스크 라벨링을 추가했습니다. NVIDIA GeForce RTX 2080 SUPER, Python 3.11.13, PyTorch 2.11.0+cu130, Ultralytics 8.4.168에서 확인했습니다.

## 프로젝트 셋업

- `npm run yoloe:setup`: 프로젝트 전용 `.venv` 생성 및 실제 CUDA 행렬 연산 PASS.
- `npm run yoloe:prepare`: 공식 `yoloe-26s-seg.pt` 다운로드 PASS.
- 모델 SHA-256: `48f24206bc8680d60cbbfa296b0140da849669b9515058b72f5a945142df0654`.
- `npm run yoloe:start`: localhost GPU 서비스 실행 PASS.
- Detection은 Detection 구조, Segmentation은 전체 마스크 분기를 사용한 실제 추론입니다. 가짜 prediction tensor나 UI 주입 결과가 아닙니다.

## 자동 검사

- TypeScript 타입 검사·빌드 PASS, 단위 테스트 64개 파일 / 394개 검사 PASS. 마스크 RLE의 잘못된 길이·16-bit ID, 마스크 결과 소스의 저장·로드·원본 보존을 검사했습니다.
- Python 백엔드 단위 테스트 6개 PASS: 예시 클래스 매핑·잘못된 좌표, 회색조 변환, CUDA 요구·만료된 예시 차단, 마스크 겹침의 신뢰도 우선·빈 검출, 예시 마스크 형상·픽셀 보존, 비정사각 마스크 letterbox.
- 관련 E2E 15개 PASS: 독립 YOLOE 탭·Detection/Segmentation 모드 유지·예시 그리기·마스크 미리보기·소스 복귀·Stop, 기존 ONNX 1ch/3ch·NCHW/NHWC·CPU 전환·파일 선택, Electron 저장, Classes, 라벨 폴더, 기존 Segmentation 그리기·워크플로 전환.
- YOLOE E2E의 준비 오류·UI 흐름은 응답 fixture로 검사했습니다. 실제 GPU·모델 결과는 아래 별도 Electron 검사로 검증했습니다.
- Ultralytics 설정·캐시는 프로젝트의 `runtime/yoloe/.state`에 보관하며 모델·가상환경과 함께 Git에서 제외합니다.

## 실제 Electron UI 검증

Ultralytics 패키지의 bus/zidane 예제 이미지를 검증 workspace로 복사했습니다. bus 이미지는 RGB PNG와 1ch 회색조 PNG로 준비했습니다. 기준 이미지에서 사람(ID 5)과 버스(ID 12)를 함께 예시로 등록했습니다.

| 입력 | 색상 | Detection 박스 |
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

Segmentation은 별도의 원본 PNG 마스크를 준비한 후 UI에서 사람·버스의 다각형 예시 마스크를 직접 지정했습니다. 이번 UI 단순화 이후 실행 결과입니다. 원본 마스크의 작은 영역은 파일 보존 검사용이며, 예제 이미지의 완전한 정답 마스크가 아닙니다.

Segmentation 전체 실행은 3장에 총 10개 인스턴스 마스크를 생성했습니다. 회색조 bus 이미지 미리보기에서는 5개 인스턴스를 확인했습니다.

- 독립 YOLOE-26 탭이 두 모드에서 표시되고, 모드 변경 시 예시·프로필을 초기화.
- 다각형 예시 마스크 지정과 반투명 결과 미리보기 모두 원본 마스크를 변경하지 않음.
- 모델 마스크를 원본 해상도로 복원하여 16-bit 단일 채널 PNG로 저장. 클래스는 배경 0, 사람 5, 버스 12.
- `inference-yoloe-26s-seg-acceptance_v1-masks/mask`에서 재실행 시 같은 소스를 재사용.
- 원본과 결과 마스크 소스 전환, 데이터셋 Refresh 후 결과 소스 유지.
- 원본 Detection `.txt`와 Segmentation `.png` 파일을 바이트 비교해 보존 확인.
- 결과 마스크의 Brush 수정 → Undo → Redo → Save PASS. 저장된 결과 PNG의 수정 픽셀 ID 5와 원본 PNG 보존을 다시 확인했습니다.

| 마스크 파일 | 해상도 | 사람 픽셀(ID 5) | 버스 픽셀(ID 12) |
|---|---|---:|---:|
| 0-reference.png | 810×1080 | 99,155 | 263,600 |
| 1-target-gray.png | 810×1080 | 109,938 | 265,864 |
| 2-target-rgb.png | 1280×720 | 171,090 | 0 |

이 픽셀 수는 실제 마스크 출력 확인용이며 Segmentation 정확도 지표가 아닙니다. 모델의 인스턴스 마스크를 앱의 semantic 클래스 마스크로 합치며, 겹침은 신뢰도가 높은 검출을 우선합니다.

표는 수동 편집 전 모델 출력을 기록합니다. 검증 workspace의 `1-target-gray.png` 결과 마스크에는 마지막 Brush·저장 검사를 위한 작은 수동 편집 영역이 포함됩니다.

재현: GPU 서비스를 실행한 상태에서 `node scripts/verify-yoloe.mjs`.

증거: [results.json](../output/yoloe-validation/results.json), [Detection 밝은 테마](../output/yoloe-validation/preview-light.png), [Detection 어두운 테마](../output/yoloe-validation/preview-dark.png), [마스크 밝은 테마](../output/yoloe-validation/mask-preview-light.png), [마스크 어두운 테마](../output/yoloe-validation/mask-preview-dark.png).

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

## 합성 세포 Segmentation 품질

같은 test 3장의 기존 `masks/test` 정답 마스크로 전경 픽셀 IoU를 측정했습니다. 예시 박스 3개·Confidence 0.25·NMS IoU 0.45는 같고, Segmentation은 배경 0을 보존하기 위해 대상 클래스 ID 1을 사용했습니다. 모델의 마스크 출력과 원본 정답 크기·클래스 값이 일치하는지 확인했습니다.

| 이미지 | 픽셀 TP | 픽셀 FP | 픽셀 FN | 전경 IoU |
|---|---:|---:|---:|---:|
| cell_0016.png (기준 이미지) | 29,282 | 2,885 | 48,945 | 36.10% |
| cell_0035.png | 9,869 | 957 | 87,742 | 10.01% |
| cell_0038.png | 9,730 | 1,172 | 59,631 | 13.79% |
| 합계 | 48,881 | 5,014 | 196,318 | 19.54% |

합계 IoU는 전체 픽셀의 TP/(TP+FP+FN)이며 이미지 IoU의 단순 평균이 아닙니다. 기준 이미지를 제외한 두 이미지의 합계 IoU는 11.59%입니다. 이 제한된 확인은 전체 test 성능이나 인스턴스 mask mAP가 아니며, 세포 전용 학습 모델을 대체할 품질로 볼 수 없습니다.

재현: `uv run --project runtime/yoloe --locked python scripts/verify-yoloe-cells.py --workflow segmentation`.

증거: [cells-masks.json](../output/yoloe-validation/cells-masks.json). 원본 데이터셋·정답·모델 파일은 변경하지 않았습니다.

## 마스크 샘플 입력과 UI 단순화 추가 검증

이전 측정은 경계 박스 예시 입력이었습니다. 이번 변경은 `sampleA/B/C` 같은 이름으로 지정한 다각형 또는 기존 선택 영역의 실제 픽셀을 입력합니다. 기본 UI는 Outline sample, Find in current image, Save results의 세 버튼이며 GPU 연결과 예시 인코딩은 자동입니다. 같은 이름의 예시는 같은 출력 클래스 ID를 사용하고, 서로 다른 이름은 구분합니다. 기존 모델·박스·라벨 가져오기·추론 설정은 접힌 Settings 안에서 유지합니다.

Ultralytics 8.4.168은 마스크를 처리하는 내부 predictor가 있으나 상위 predict 함수는 박스를 요구하고, 마스크 letterbox도 2-D 픽셀을 image 코드로 전달하면 실패합니다. 프로젝트의 `MaskPromptPredictor`에서 바이너리 마스크를 가장 가까운 픽셀 보간으로 resize/pad하여 visual prompt embedding을 추출한 후 기존 Detection/Segmentation 모델 추론에 적용했습니다. 설치 패키지를 수정하거나 별도 라이브러리를 추가하지 않았습니다.

동일한 합성 세포 3장에서 첫 기준 이미지의 정답 마스크 연결 영역 3개를 추출하여 시각 예시로 사용했습니다. 이름은 모두 cell이며 class ID는 Detection 0 / Segmentation 1입니다. Confidence 0.25, NMS IoU 0.45와 정답 박스 대응 IoU 0.5는 기존 측정과 같습니다. 참조 이미지 포함 결과이며 실제 산업 데이터의 일반 성능으로 해석할 수 없습니다.

| 입력 예시 | Detection TP / 정답 | Recall | Segmentation 합계 전경 픽셀 IoU |
|---|---:|---:|---:|
| 기존 박스 예시 3개 | 24 / 195 | 12.31% | 19.54% |
| 실제 마스크 예시 3개 | 2 / 195 | 1.03% | 1.73% |

마스크 예시 실행의 검출은 참조 이미지에서만 2개였고 별도 두 이미지에서는 0개였습니다. Segmentation 전경 TP 4,243, FP 399, FN 240,956이며 합계 IoU는 4,243 / 245,598입니다. 실제 픽셀을 전달한다는 사실이 해당 도메인의 정확도 개선을 보장하지 않습니다. 이번 사전학습 모델·샘플 구성으로는 세포를 전문적으로 자동 라벨링할 품질에 도달하지 않았습니다. 도메인 데이터로 예시 구성·임계값을 평가하고 필요시 전용 학습을 해야 합니다.

증거: [마스크 예시 Detection](../output/yoloe-validation/cells-mask-prompts-detection.json), [마스크 예시 Segmentation](../output/yoloe-validation/cells-mask-prompts-segmentation.json).

재현:

```powershell
uv run --project runtime/yoloe --locked python scripts/verify-yoloe-cells.py --prompt mask
uv run --project runtime/yoloe --locked python scripts/verify-yoloe-cells.py --workflow segmentation --prompt mask
```

자동 UI 테스트는 모의 GPU 응답으로 sampleA/B/C 이름과 ID 구분, 같은 이름 재사용, 윤곽 마스크 전달, 샘플 삭제·취소, 두 모드 저장과 원본 복귀, 접힌 기본 설정, 연결 오류와 구형 API 감지를 검증합니다. 실제 모델 품질은 위 별도의 GPU 실행 JSON으로 확인합니다.

최종 검사: TypeScript 타입 검사·빌드, 단위 테스트 394개, Python 백엔드 테스트 6개, 관련 E2E 15개 PASS. 실제 Electron/CUDA 검증은 별도로 PASS했으며 다각형 예시 마스크·RGB/회색조·원본 보존·결과 소스 전환·Refresh·Brush/Undo/Redo/Save를 확인했습니다. UI 샘플 이름 입력에는 네이티브 datalist 팝업을 사용하지 않아 Electron에서도 동일한 테마의 단순 입력을 유지합니다.
