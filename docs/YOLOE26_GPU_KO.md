# YOLOE-26 GPU 시각 프롬프트 라벨링

이 기능은 `codex/yoloe26-gpu` 버전의 독립 **YOLOE-26** 탭에서 제공합니다. 일반 ONNX 기능은 **Inference** 탭에서 사용합니다. YOLOE는 예시 이미지의 영역을 이용하여 비슷한 대상을 다른 이미지에서 찾습니다. 상단 Detection 모드에서는 박스, Segmentation 모드에서는 실제 모델 마스크를 생성합니다. 원본 라벨과 별도의 결과 폴더를 사용합니다.

## Windows 셋업

NVIDIA CUDA GPU와 CUDA 13.0 PyTorch를 지원하는 NVIDIA 드라이버가 필요합니다. 이 프로젝트는 Python 3.11, PyTorch 2.11.0+cu130, torchvision 0.26.0, Ultralytics 8.4.168을 사용합니다. 의존성은 `runtime/yoloe/uv.lock`에 고정되어 있습니다. 일반 ONNX 추론은 이 셋업 없이 실행 가능합니다.

```powershell
cd C:\Git\easy_labeling
git switch codex/yoloe26-gpu
# uv가 없는 경우 한 번 설치하고 새 터미널을 엽니다.
winget install --id astral-sh.uv -e
npm install
npm run yoloe:setup
npm run yoloe:prepare
npm run yoloe:check
```

`yoloe:setup`은 프로젝트의 `runtime/yoloe/.venv`에 전용 환경을 만들고 실제 CUDA 행렬 연산을 검사합니다. 모델은 `runtime/yoloe/models/yoloe-26s-seg.pt`에 다운로드합니다. 다른 모델 크기가 필요하면 `npm run yoloe:prepare -- --model yoloe-26m-seg`처럼 실행합니다. n/s/m/l/x를 지원하며, UI에는 준비된 모델만 표시됩니다. 초기 설치와 모델 준비에는 인터넷이 필요합니다. 시각 프롬프트에는 CLIP 텍스트 인코더가 필요하지 않습니다.

## 실행

첫 번째 터미널에서 GPU 서비스를 실행하고 유지합니다.

```powershell
cd C:\Git\easy_labeling
npm run yoloe:start
```

두 번째 터미널에서 앱을 실행합니다.

```powershell
cd C:\Git\easy_labeling
npm start
# 브라우저: http://localhost:4173/
# 또는 Electron 실행:
npm run electron:dev
```

서비스는 이 컴퓨터의 `127.0.0.1:8766`에서만 수신합니다. 로컬 4173 브라우저와 Electron의 file:// 화면을 지원합니다. 이미지는 해당 로컬 서비스로 PNG 픽셀을 전달하며 외부 서버에 전송하지 않습니다. GPU 서비스 종료는 해당 터미널에서 Ctrl+C입니다. 설치형 앱을 사용할 때도 GPU 서비스는 이 프로젝트 폴더에서 별도로 실행합니다.

## UI 사용

기본 화면에는 **이름 → 영역 지정 → 찾기 → 저장**만 표시됩니다. 모델, 결과 세트 이름, Confidence·IoU, 기존 라벨 가져오기는 **Settings & existing labels** 안에 있습니다.

1. 데이터셋을 열고 **Detection** 또는 **Segmentation → YOLOE-26**을 선택합니다. GPU 서비스에 자동 연결하며 `GPU · CUDA`를 표시합니다. 서비스가 꺼져 있으면 안내에 따라 `npm run yoloe:start`를 실행한 뒤 설정에서 **Reconnect GPU**를 누릅니다.
2. **Name the target**에 `sampleA`처럼 대상 이름을 입력하고 **Outline sample**을 누릅니다. 대상의 윤곽을 클릭해 마스크를 지정하고 **Enter**, 더블클릭 또는 **Finish outline**으로 마칩니다. **Backspace**는 마지막 점 취소, **Esc**는 현재 윤곽 취소입니다. 배경을 포함하지 않도록 대상의 실제 형상을 따라 지정합니다. 임시 샘플은 원본 라벨·마스크·Undo 기록을 변경하지 않습니다.
3. 다음 이름은 `sampleB`, `sampleC` 순으로 제안합니다. 서로 다른 이름은 서로 다른 출력 클래스가 됩니다. 같은 대상의 다른 형태를 추가하려면 기존 이름을 다시 입력합니다. 같은 이름의 여러 예시는 하나의 클래스 프롬프트로 합쳐집니다. 썸네일은 선택한 마스크만 보여줍니다. 잘못 만든 샘플은 행의 ×로 삭제합니다. 예시는 한 기준 이미지에서 최대 32개이며, 다른 기준 이미지로 바꾸려면 설정의 **Clear samples**를 사용합니다.
4. 다른 이미지로 이동한 뒤 **Find in current image**를 누릅니다. 첫 찾기에서 모델과 예시를 자동 등록하므로 별도 Register 버튼은 없습니다. Detection은 박스, Segmentation은 실제 모델 마스크를 미리 표시합니다. 미리보기는 원본을 변경하지 않습니다.
5. 저장 범위 **Current image / All images**를 선택하고 **Save results**를 누릅니다. Detection은 `inference-<모델>-<결과 세트>/*.txt`, Segmentation은 `inference-<모델>-<결과 세트>-masks/mask/*.png`에 저장합니다. 같은 이름은 처리한 이미지 결과를 갱신합니다. 다른 예시 구성을 별도로 보관하려면 설정에서 **Result set name**을 바꿉니다.
6. **Active label folder**로 원본과 결과를 전환하고 기존 편집·저장 기능으로 검수합니다. Segmentation에서는 Brush·Erase·Undo 등을 사용할 수 있습니다.

정밀한 브러시 마스크를 예시로 쓰려면 기존 Segmentation 편집 기능으로 마스크를 만들고 Edit에서 해당 영역을 선택한 뒤 설정의 **Use selected labels**를 누릅니다. 이 경로는 선택한 영역의 실제 픽셀과 구멍을 전달하며 경계 박스로 대체하지 않습니다. Detection에서는 선택한 기존 박스들을 가져옵니다. 사각형 예시가 필요하면 설정의 **Sample shape → Box**를 선택합니다.

새 샘플 이름에는 기존 클래스와 겹치지 않는 양수 ID를 할당합니다. 기존 이름과 동일하면 해당 ID를 사용합니다. Segmentation의 **0은 배경**, 대상 ID는 **1–65535**입니다. 같은 클래스의 인스턴스는 기존 편집기 방식의 semantic 마스크로 합쳐지고 클래스 간 겹침은 신뢰도가 높은 검출을 우선합니다. 결과의 `classes.yaml`과 `inference.json`에는 이름·ID·예시 좌표/마스크·모델·기준 이미지 해시·설정을 기록합니다. 예시는 현재 세션에서 사용하며 파일 기록은 재현 정보입니다. 자동 재불러오기는 제공하지 않습니다.

샘플 이름은 모델에 학습시키는 설명문이 아니라 **출력 클래스를 구분하는 이름**입니다. YOLOE는 선택한 픽셀의 시각 임베딩을 추출하여 다른 이미지의 대상과 비교합니다. 일반 사전학습 모델이 특정 산업의 물체를 반드시 이해하거나 예시를 추가할 때마다 정확도가 좋아지는 것은 아닙니다. 실제 데이터에서 검출 누락과 오검출을 확인한 후 활용해야 합니다.

## 동작 범위와 오류

- Detection은 모델을 Detection 구조로 로딩하여 박스만 계산합니다. Segmentation은 전체 Segmentation 가중치와 마스크 분기를 사용하며 원본 이미지 크기로 마스크를 복원합니다. 박스를 채워 가짜 마스크를 만들지 않습니다.
- RGB와 회색조 이미지를 지원합니다. 회색조는 RGB로 복제하고, 모델 내부 전처리로 입력 크기를 맞춥니다. 이미지당 최대 3,200만 픽셀, 최종 박스 300개를 지원합니다.
- 실제 NVIDIA CUDA GPU가 필요하며 YOLOE에서 CPU로 조용히 대체하지 않습니다. CUDA가 없으면 준비 상태와 오류를 명시합니다. CPU 작업이 필요하면 ONNX 모드를 사용합니다.
- GPU 연결은 서비스 연결 확인이며 첫 Find/Save에서 실제 모델 로딩과 예시 인코딩을 수행합니다. 최초 실행은 CUDA 초기화 때문에 시간이 더 걸립니다. Ultralytics 8.4.168의 마스크 입력·letterbox 제약은 프로젝트의 마스크 인코더에서 보완하며 설치 패키지는 수정하지 않습니다.
- 예시 등록은 현재 세션에 유지됩니다. 앱·GPU 서비스를 재시작하거나 모델을 변경하면 다음 찾기에서 다시 인코딩합니다. 데이터셋·Detection/Segmentation 모드를 변경하면 예시를 다시 지정합니다. GPU 서비스 API v3를 사용하므로 이전 서비스를 켜둔 상태라면 Ctrl+C 후 `npm run yoloe:start`로 다시 실행합니다. 다른 창이 서비스의 예시를 바꾸면 이전 창의 추론은 오류로 중단하여 잘못된 클래스 결과를 저장하지 않습니다.
- Stop은 UI 요청을 중단하고 추가 파일 저장을 막습니다. 이미 저장된 결과는 보존합니다. 현재 CUDA 연산은 끝날 때까지 실행될 수 있으며 그동안 다른 요청에는 GPU busy를 표시합니다.
- 결과는 예시 기반 탐지이며 학습된 전용 모델과 같은 정확도를 보장하지 않습니다. 특히 세포·현미경 영상은 실제 데이터로 검수해야 합니다.

## 검사 명령

```powershell
npm run yoloe:check
npm run yoloe:test
npm run typecheck
npm run test:unit
npm run build
npx playwright test tests/e2e/yoloe.spec.ts tests/e2e/inference.spec.ts tests/e2e/inference-electron.spec.ts --project=chromium
# GPU 서비스와 모델이 준비된 상태에서 실제 Electron 검증:
node scripts/verify-yoloe.mjs
# 기존 세포 데이터에서 Detection / Segmentation 품질 확인:
uv run --project runtime/yoloe --locked python scripts/verify-yoloe-cells.py
uv run --project runtime/yoloe --locked python scripts/verify-yoloe-cells.py --workflow segmentation
# 실제 마스크 픽셀을 예시로 사용한 동일 데이터 비교:
uv run --project runtime/yoloe --locked python scripts/verify-yoloe-cells.py --prompt mask
uv run --project runtime/yoloe --locked python scripts/verify-yoloe-cells.py --workflow segmentation --prompt mask
```

참고: [Ultralytics 시각 프롬프트](https://docs.ultralytics.com/models/yoloe#predict-usage), [PyTorch 설치](https://pytorch.org/get-started/locally/).

실제 셋업·UI·회색조·원본 보존·합성 세포 성능 결과는 [2026-10-04 검증 보고서](YOLOE26_VALIDATION_20261004_KO.md)에 있습니다.
