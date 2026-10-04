# YOLOE-26 GPU 시각 프롬프트 라벨링

이 기능은 `codex/yoloe26-gpu` 버전에서 제공합니다. 일반 ONNX 기능은 그대로 사용할 수 있습니다. YOLOE는 예시 이미지의 박스를 이용하여 비슷한 대상을 다른 이미지에서 찾아 Detection 라벨을 생성합니다. 원본 라벨과 별도의 결과 폴더를 사용합니다.

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

1. Detection에서 데이터셋을 열고 **Inference → YOLOE-26 → Connect GPU**를 선택합니다. `GPU · CUDA` 배지와 실제 GPU 이름을 확인합니다.
2. 모델과 **Target set** 이름을 정합니다. 이름에는 문자·숫자·`_`·`-`를 사용할 수 있습니다.
3. 기준 이미지에서 대상에 박스를 그리고 Classes를 지정합니다. Edit 모드에서 예시 박스를 선택한 뒤 **Register selected boxes**를 누릅니다. 한 이미지의 1–32개 박스를 사용할 수 있습니다. 같은 클래스의 여러 예시와 서로 다른 클래스의 예시를 함께 등록할 수 있습니다. 썸네일과 클래스 이름이 왼쪽에 표시됩니다.
4. 다른 이미지로 이동하여 **Preview current image**를 누릅니다. 청록색 점선은 임시 미리보기이며 기존 라벨·Undo·파일은 변경하지 않습니다. Clear preview, 이미지 이동, 모드 전환으로 미리보기를 숨길 수 있습니다.
5. **Infer and save current** 또는 **Infer all images**로 저장합니다. 결과는 `inference-<모델 이름>-<Target set>`에 저장됩니다. 예: `inference-yoloe-26s-seg-cells_v1`. 같은 이름으로 재실행하면 처리한 이미지의 결과만 갱신합니다. 다른 예시 구성을 별도로 보관하려면 Target set을 바꿉니다.
6. 기존 **Active label folder**, Classes, Review, 편집·저장 기능으로 결과를 검토합니다. 원본 폴더로 돌아가 원본 라벨을 확인할 수 있습니다.

임시 모델 클래스는 등록한 기존 클래스 ID로 변환됩니다. 예를 들어 예시 클래스 ID 5와 12를 사용하면 결과도 5와 12로 저장합니다. 결과 폴더에는 `.txt`, `classes.yaml`, 모델·GPU·대상 세트·예시 이미지 해시·추론 설정을 기록한 `inference.json`이 생성됩니다.

## 동작 범위와 오류

- 현재는 Detection 박스만 생성합니다. 모델의 Segmentation 가중치를 Detection 구조로 로딩하여 마스크 분기를 사용하지 않습니다.
- RGB와 회색조 이미지를 지원합니다. 회색조는 RGB로 복제하고, 모델 내부 전처리로 입력 크기를 맞춥니다. 이미지당 최대 3,200만 픽셀, 최종 박스 300개를 지원합니다.
- 실제 NVIDIA CUDA GPU가 필요하며 YOLOE에서 CPU로 조용히 대체하지 않습니다. CUDA가 없으면 준비 상태와 오류를 명시합니다. CPU 작업이 필요하면 ONNX 모드를 사용합니다.
- GPU 연결은 서비스 연결 확인이고, Register 단계에서 실제 모델 로딩과 예시 인코딩을 수행합니다. 첫 등록은 모델 준비와 CUDA 초기화 때문에 시간이 더 걸립니다.
- 예시 등록은 현재 세션에 유지됩니다. 앱·GPU 서비스를 재시작하거나 모델·데이터셋을 변경하면 다시 등록합니다. 다른 창이 서비스의 예시를 바꾸면 이전 창의 추론은 오류로 중단하여 잘못된 클래스 결과를 저장하지 않습니다.
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
```

참고: [Ultralytics 시각 프롬프트](https://docs.ultralytics.com/models/yoloe#predict-usage), [PyTorch 설치](https://pytorch.org/get-started/locally/).

실제 셋업·UI·회색조·원본 보존·합성 세포 성능 결과는 [2026-10-04 검증 보고서](YOLOE26_VALIDATION_20261004_KO.md)에 있습니다.
