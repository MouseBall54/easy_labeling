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

## 여러 기준 이미지의 동일 이름 예시와 정확도 조정

API v4에서는 한 기준 이미지 제한을 제거했습니다. UI에서 **Add another example to → sampleA**를 선택하고 다른 이미지의 영역을 추가하면, 같은 이름·클래스 ID로 예시가 누적됩니다. 썸네일은 각 원본 이미지를 사용하며 결과 메타데이터에 예시별 이미지 이름과 입력 해상도를 기록합니다. 총 32개 제한과 데이터셋·워크플로 변경 시 초기화는 유지합니다.

같은 이미지 안의 같은 클래스는 기존처럼 영역을 합쳐 인코딩합니다. 서로 다른 이미지의 클래스 특징은 평균하지 않고 각각 보관합니다. 모델 내부 특징 인덱스를 원래 클래스 ID로 되돌린 뒤 같은 출력 클래스의 중복 검출을 NMS로 제거하며, 동일한 인덱스로 마스크도 선택합니다. 클래스 ID 0은 Detection에서만 허용하고 Segmentation 배경 규칙은 유지합니다.

실제 합성 세포 데이터에서 예시별 특징 평균화·독립 유지, 해상도, 임계값을 비교했습니다. 아래는 `yoloe-26s-seg` 마스크 예시 3개의 결과입니다. 기준 이미지 `cell_0016.png`가 포함된 3장 / 195개 대상의 설정 비교입니다. mAP나 독립적인 산업 데이터 성능이 아닙니다.

| 인코딩 | 해상도 | Confidence | 박스 Recall | 마스크 전경 IoU |
|---|---:|---:|---:|---:|
| 같은 이미지의 클래스 영역 합치기 | 640 | 0.25 | 1.03% | 1.73% |
| 같은 이미지의 클래스 영역 합치기 | 640 | 0.05 | 71.79% | 69.07% |
| 같은 이미지의 클래스 영역 합치기 | 1024 | 0.25 | 44.62% | 51.61% |
| 같은 이미지의 클래스 영역 합치기 | 1024 | 0.05 | 96.92% | 91.04% |
| 각 예시 특징 평균 | 640 | 0.05 | 50.77% | 53.11% |
| 각 예시 특징 독립 유지 | 640 | 0.05 | 46.15% | 48.05% |

이 결과 때문에 같은 이미지의 기존 처리 방식은 유지했습니다. 효과가 컸던 변경은 해상도와 Confidence입니다. 1024를 UI 설정으로 제공하고 기본값 640 / 0.25는 유지합니다. 0.05는 이 데이터에서 효과가 있었지만 실제 산업 이미지에서는 배경·유사 불량에 대한 오검출을 별도로 확인해야 합니다.

두 기준 이미지 `cell_0016.png`, `cell_0035.png`에서 각각 동일 이름 `cell` 예시 3개씩, 총 6개를 등록하여 실제 localhost CUDA API도 검사했습니다. 1024 / 0.05에서 Detection과 Segmentation 모두 190/195개(TP 190, FP 0, FN 5)를 찾았습니다. 두 기준 이미지가 평가에 포함됩니다. 예시로 쓰지 않은 `cell_0038.png` 한 장은 58/58 검출, Segmentation 전경 IoU 91.75%였습니다. 이는 한 장의 제한된 확인이며, 예시 추가만으로 일반적인 정확도가 보장된다는 근거는 아닙니다.

자동 검사는 다중 이미지의 동일 이름·ID와 다른 대상 구분, 해상도 전달, 삭제·취소·원본 보존·두 모드 저장을 E2E로 확인합니다. Python 검사 8개에는 이미지 간 이름·ID 불일치, 총 예시 제한, 해상도 검증, 원래 클래스 기준 중복 제거를 포함합니다.

재현:

```powershell
uv run --project runtime/yoloe --locked python scripts/benchmark-yoloe-prompts.py
uv run --project runtime/yoloe --locked python scripts/verify-yoloe-cells.py --prompt mask --imgsz 1024 --confidence 0.05 --reference-count 2
uv run --project runtime/yoloe --locked python scripts/verify-yoloe-cells.py --workflow segmentation --prompt mask --imgsz 1024 --confidence 0.05 --reference-count 2
```

증거: [설정 비교](../output/yoloe-validation/prompt-calibration.json), [다중 이미지 Detection](../output/yoloe-validation/cells-detection-mask-1024-conf0.05-refs2.json), [다중 이미지 Segmentation](../output/yoloe-validation/cells-segmentation-mask-1024-conf0.05-refs2.json), [한 기준 이미지 Segmentation API](../output/yoloe-validation/cells-segmentation-mask-1024-conf0.05-refs1.json).

다음 개선 순서는 실제 도메인 검수 이미지 분리 → 조명·방향·크기의 대표 예시 → 해상도·Confidence 비교 → 큰 원본의 타일 추론 평가 → 필요 시 도메인 학습입니다. 큰 모델·타일 추론·추가 학습은 이번 변경에 구현하거나 측정하지 않았습니다. [Ultralytics 추론 인자](https://docs.ultralytics.com/modes/predict/)와 [YOLOE 학습 안내](https://docs.ultralytics.com/models/yoloe/)를 기준으로, 검수 데이터에서 Precision·Recall·IoU와 GPU 자원 사용을 함께 비교해야 합니다.

## n/s/m/l 선택과 GPU 없는 환경의 CPU 실행

후속 변경(API v5)은 **Settings → Model**에 N/S/M/L을 제공합니다. GPU 초기 선택은 준비된 s를 우선하고 CPU 초기 선택은 n입니다. 다른 크기를 직접 선택하면 다음 찾기에서 해당 모델로 예시를 다시 인코딩합니다. 준비되지 않은 모델은 준비 명령을 안내하며 임의로 다른 모델을 사용하지 않습니다. CUDA가 없으면 실제 CPU에서 실행하며 배지와 저장 메타데이터에도 CPU를 기록합니다. 기존 CUDA 전용 제한을 제거했습니다.

공식 n/s/m/l 체크포인트를 프로젝트의 `runtime/yoloe/models/`에 모두 준비했습니다. 기존 `synthetic_cells/images/test/cell_0016.png`의 한 영역을 마스크 예시로 사용해 입력 해상도 640, Confidence 0.05에서 실제 모델 실행을 검사했습니다.

| 모델 | CUDA Detection | CUDA Segmentation | CPU Detection | CPU Segmentation |
|---|---|---|---|---|
| n | PASS | PASS | PASS | PASS |
| s | PASS | PASS | 미측정 | 미측정 |
| m | PASS | PASS | 미측정 | 미측정 |
| l | PASS | PASS | 미측정 | 미측정 |

모델 예측기의 실제 텐서 장치와 응답의 backend가 일치하는지 검사했습니다. Detection은 박스와 원래 클래스 ID를, Segmentation은 원본 크기의 실제 마스크와 완전한 픽셀 run을 확인했습니다. CPU 검사는 GPU가 있는 이 컴퓨터에서 CUDA 가용성 검사를 false로 설정하여 GPU 없는 경로를 실행했습니다. 실제 모델 연산과 텐서는 CPU였으며 GPU 없는 별도 컴퓨터의 설치 검증을 의미하지 않습니다. CPU 요청에서 모델을 생략했을 때 n을 사용하는 것도 확인했습니다.

이 검사는 실행 호환성 확인입니다. 초기 실행 한 장과 한 예시의 검출 개수·시간으로 크기별 정확도나 성능 순위를 판단하지 않습니다. 큰 모델의 품질·VRAM·처리시간 비교는 별도 도메인 검증이 필요합니다.

Python 테스트 8개, UI E2E 6개, 타입 검사와 빌드 PASS. E2E에는 두 모드에서 CPU 기본 n 선택, 네 크기 선택과 예시 재인코딩, 결과 저장, 누락 모델 명령과 구형 API 오류를 포함합니다. API v4 이하 서비스는 재시작해야 합니다.

```powershell
npm.cmd run yoloe:prepare -- --model all
uv run --project runtime/yoloe --locked python scripts/verify-yoloe-models.py
npm run yoloe:test
npx playwright test tests/e2e/yoloe.spec.ts --project=chromium
```

실제 실행 증거: [크기별 GPU/CPU 검사](../output/yoloe-validation/model-sizes-cpu-gpu.json). 설치·실행과 개별 모델 준비 명령은 [셋업 안내](YOLOE26_GPU_KO.md)를 참고하세요.

## Samples & settings 팝업 적용 검증

왼쪽 YOLOE-26 패널에는 실행 장치·모델·예시 개수, **Samples & settings**, **Find in current image**, 저장 범위·**Save results**만 유지했습니다. 예시 이미지 선택·윤곽 지정·같은 이름의 예시 추가와 모델·해상도·Confidence·NMS·결과 이름은 기존 Layout/Template Matching 설정과 같은 Bootstrap 팝업으로 옮겼습니다. 새 런타임이나 의존성을 추가하지 않았습니다.

팝업의 기준 이미지 선택은 메인 이미지와 원본 라벨을 변경하지 않습니다. **Done** 이후 같은 작업 세션에서 설정과 완료한 예시를 유지하며, 닫을 때 미완성 윤곽만 취소합니다. 연속 예시 입력 시 그릴 이미지가 자동으로 보이도록 스크롤합니다. 팝업이 열린 동안 메인 이미지 이동·편집 단축키를 차단하고, 닫으면 설정 버튼으로 키보드 포커스를 돌려줍니다. 데이터셋·워크플로 변경 시 예시 초기화 규칙은 유지합니다.

검사 결과: 타입 검사·빌드 PASS, 단위 테스트 **394개 PASS**, YOLOE UI E2E **7개 PASS**. 두 모드의 다중 이미지 예시, 기존 선택 라벨 가져오기, 설정 유지, 닫기·취소·포커스 복귀, CPU 기본 n과 모델 전환, 팝업의 좁은 화면 배치·어두운 테마를 검사했습니다. 좁은 화면 검사는 열린 팝업의 배치 확인이며 프로그램 전체의 모바일 지원 검증은 아닙니다.

`node scripts/verify-yoloe.mjs`로 실제 Electron·API v5·RTX 2080 SUPER CUDA 흐름도 PASS했습니다. RGB/회색조 3장에서 Detection은 4/5/2개 박스를 저장했고, Segmentation은 원본 해상도 마스크를 저장했습니다. 원본 파일 보존, 결과 폴더 전환·새로고침, Brush/Undo/Redo/Save도 확인했습니다. 이 결과는 팝업 변경 후 실행·저장 호환성 확인이며 산업 도메인 정확도 평가가 아닙니다.

라이브 브라우저에서도 sampleA 윤곽 입력과 팝업 재열기 후 예시 유지, 밝은/어두운 테마를 직접 확인했습니다. 증거: [실제 Electron 실행 JSON](../output/yoloe-validation/results.json), [설정 팝업](../output/yoloe-validation/yoloe-setup-popup.png), [어두운 테마](../output/yoloe-validation/yoloe-setup-popup-dark.png).

### 팝업 확대·이동과 모델 미리보기 보완

Ctrl+휠은 포인터 위치를 기준으로 확대·축소하며 가운데 드래그와 Space+드래그로 이미지 이동을 지원합니다. 윤곽 입력을 하지 않을 때는 왼쪽 드래그도 이동합니다. 이미지·완료한 예시·진행 중 윤곽·모델 결과가 같은 좌표 변환을 사용합니다. Fit image로 전체 보기로 돌아갈 수 있고 기준 이미지 변경·팝업 재열기는 전체 보기에서 시작합니다.

Run preview는 팝업에 선택된 기준 이미지의 원본 픽셀을 기존 YOLOE 서비스에 전달합니다. Detection은 박스·이름·신뢰도, Segmentation은 원본 크기의 모델 마스크를 표시합니다. Show results를 끄면 이미지와 예시를 볼 수 있으며 샘플·추론 설정 변경 시 이전 결과를 제거합니다. 메인 이미지·기존 라벨·마스크는 그대로 유지합니다.

타입 검사·빌드 PASS, YOLOE E2E **9개 PASS**. 추가된 두 검사는 실제 Ctrl+휠·가운데 드래그·Space+드래그 입력, 이동 중 윤곽 점 미추가, 확대·이동 후 예시의 원본 좌표 오차 1픽셀 미만, Fit 복귀, 다른 이미지의 팝업 추론 요청 크기, 결과 픽셀 표시·숨김·설정 변경 시 제거, 두 모드의 메인 라벨 보존을 확인했습니다.

실제 Electron·RTX 2080 SUPER CUDA 검사도 PASS했습니다. RGB 기준 예시를 유지한 채 팝업에서 회색조 대상 이미지로 변경하고 확대·이동 후 모델 미리보기와 결과 토글을 두 모드에서 검사했습니다. 기존 박스·마스크 저장·원본 보존·결과 전환 검사도 통과했습니다. [실행 JSON](../output/yoloe-validation/results.json)의 `popupdetectionZoomPanPreview`, `popupsegmentationZoomPanPreview`와 [Detection 팝업](../output/yoloe-validation/popup-detection-preview.png), [Segmentation 팝업](../output/yoloe-validation/popup-segmentation-preview.png)에 증거를 남겼습니다.

### 미리보기 가독성 개선

이미지에 묻히던 청록 점선과 배경 없는 글씨를 교체했습니다. Detection은 기존 라벨의 스타일에 맞춰 클래스 색 2px 실선과 20% 채움, 클래스 색 배경의 흰 글씨를 사용합니다. Segoe UI와 기존 라벨 글자 크기 설정을 따르며 크기는 화면 기준으로 유지합니다. 겹치는 이름은 신뢰도가 높은 결과부터 표시하며, 박스와 실제 결과 개수는 줄이지 않습니다. Segmentation은 클래스 색 채움과 흰 경계, 어두운 배경의 이름 배지를 사용합니다. 팝업·메인 미리보기에 함께 적용했으며 저장 데이터는 변경하지 않았습니다.

타입 검사·빌드 PASS, 관련 E2E 두 모드 **2개 PASS**. 실제 렌더링 픽셀에서 Detection의 클래스 색 배경, Segmentation의 어두운 배경과 흰 글씨를 확인하고 결과 토글·설정 변경·좌표·원본 보존 검사를 유지했습니다. 실제 Electron/CUDA 검증도 두 모드 PASS했으며 밝은/어두운 테마 미리보기와 저장 결과를 갱신했습니다. 증거는 위 실행 JSON과 팝업 이미지입니다.
