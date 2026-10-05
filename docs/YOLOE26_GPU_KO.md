# YOLOE-26 GPU/CPU 시각 프롬프트 라벨링

이 기능은 `codex/yoloe26-gpu` 버전의 독립 **YOLOE-26** 탭에서 제공합니다. 일반 ONNX 기능은 **Inference** 탭에서 사용합니다. YOLOE는 예시 이미지의 영역을 이용하여 비슷한 대상을 다른 이미지에서 찾습니다. 상단 Detection 모드에서는 박스, Segmentation 모드에서는 실제 모델 마스크를 생성합니다. 원본 라벨과 별도의 결과 폴더를 사용합니다.

## Windows 셋업

CUDA가 사용 가능하면 NVIDIA GPU로, 없으면 CPU로 실행합니다. GPU 실행에는 CUDA 13.0 PyTorch를 지원하는 NVIDIA 드라이버가 필요합니다. 이 프로젝트는 Python 3.11, PyTorch 2.11.0+cu130, torchvision 0.26.0, Ultralytics 8.4.168을 사용합니다. 고정된 PyTorch 패키지는 GPU 없는 Windows에서도 CPU 연산을 지원하며 별도 CUDA Toolkit 설치는 필요하지 않습니다. 의존성은 `runtime/yoloe/uv.lock`에 고정되어 있습니다. 일반 ONNX 추론은 이 셋업 없이 실행 가능합니다.

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

`yoloe:setup`은 프로젝트의 `runtime/yoloe/.venv`에 전용 환경을 만들고 실제 GPU 또는 CPU 행렬 연산을 검사합니다. `yoloe:prepare`는 GPU 환경에서 s, CPU 환경에서 n을 기본으로 다운로드합니다. 모델 파일은 `runtime/yoloe/models/`에 저장합니다. UI의 **Settings → Model**에서 N/S/M/L을 선택합니다. GPU 초기 선택은 준비된 s를 우선하며, CPU 초기 선택은 n입니다. CPU에서도 다른 크기를 직접 선택할 수 있고 재연결 시 선택을 유지합니다. 준비되지 않은 모델은 **Not prepared**로 표시하고 정확한 준비 명령을 안내합니다.

```powershell
# n/s/m/l을 모두 준비
npm.cmd run yoloe:prepare -- --model all
# 필요한 크기만 준비
npm.cmd run yoloe:prepare -- --model yoloe-26n-seg
npm.cmd run yoloe:prepare -- --model yoloe-26s-seg
npm.cmd run yoloe:prepare -- --model yoloe-26m-seg
npm.cmd run yoloe:prepare -- --model yoloe-26l-seg
```

PowerShell에서 `--model` 전달 시 npm.ps1이 인수를 제거하는 환경을 피하려고 `npm.cmd`를 사용합니다. 모델 준비 후 **Reconnect**를 누릅니다. 초기 설치와 모델 준비에는 인터넷이 필요합니다. 시각 프롬프트에는 CLIP 텍스트 인코더가 필요하지 않습니다.

## 실행

첫 번째 터미널에서 YOLOE 서비스를 실행하고 유지합니다.

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

서비스는 이 컴퓨터의 `127.0.0.1:8766`에서만 수신합니다. 로컬 4173 브라우저와 Electron의 file:// 화면을 지원합니다. 이미지는 해당 로컬 서비스로 PNG 픽셀을 전달하며 외부 서버에 전송하지 않습니다. 서비스 종료는 해당 터미널에서 Ctrl+C입니다. 설치형 앱을 사용할 때도 YOLOE 서비스는 이 프로젝트 폴더에서 별도로 실행합니다.

## UI 사용

왼쪽 사이드바에는 실행 장치·모델·예시 개수와 **Samples & settings → Find → Save**만 표시됩니다. **Samples & settings**는 레이아웃·템플릿 설정처럼 별도 창을 엽니다. 창 왼쪽에서 기준 이미지와 대상 예시를 지정하고, 오른쪽에서 모델·해상도·결과 세트 이름·Confidence·IoU를 조절합니다. 값은 즉시 적용되며 **Done**으로 닫아도 현재 세션에 유지됩니다.

1. 데이터셋을 열고 **Detection** 또는 **Segmentation → YOLOE-26**을 선택합니다. 로컬 서비스에 자동 연결하며 실제 실행 장치를 `GPU · CUDA` 또는 `CPU`로 표시합니다. 서비스가 꺼져 있으면 안내에 따라 `npm run yoloe:start`를 실행한 뒤 설정에서 **Reconnect**를 누릅니다.
2. **Samples & settings**를 열고 **Reference image**에서 예시 이미지를 선택합니다. **Name the target**에 `sampleA`처럼 대상 이름을 입력하고 **Outline sample**을 누릅니다. 설정 창의 이미지에서 윤곽을 클릭해 점을 찍고, 3개 이상의 점으로 영역을 만든 뒤 **Enter**, 더블클릭 또는 **Finish outline**으로 마칩니다. **Backspace**는 마지막 점 취소, **Esc**는 현재 윤곽 취소입니다. 창을 닫으면 미완성 윤곽만 취소하고 완료한 예시는 유지합니다. 배경을 포함하지 않도록 대상의 실제 형상을 따라 지정합니다. 기준 이미지 선택과 예시 지정은 메인 이미지·원본 라벨·마스크·Undo 기록을 변경하지 않습니다.
3. 다음 이름은 `sampleB`, `sampleC` 순으로 제안합니다. 서로 다른 이름은 서로 다른 출력 클래스가 됩니다. 같은 대상의 다른 형태를 추가하려면 **Add another example to → sampleA**를 선택하고 **Outline sample**을 다시 누릅니다. **Reference image**에서 다른 이미지를 선택한 뒤에도 같은 방식으로 추가할 수 있습니다. 선택 목록에 `sampleA · 2 example(s)`처럼 누적 개수가 표시됩니다. 같은 이미지의 같은 클래스 영역은 합쳐 인코딩하고, 서로 다른 이미지의 특징은 각각 보관해 같은 출력 클래스 ID에 연결합니다. 썸네일은 선택한 마스크만 보여주며 마우스를 올리면 원본 이미지 이름을 확인할 수 있습니다. 잘못 만든 샘플은 행의 ×로 삭제합니다. 여러 이미지를 합쳐 최대 32개 예시를 지원합니다.
4. 창 안에서 **Run preview**를 누르면 **Reference image**에 선택된 이미지에 샘플을 적용합니다. Detection은 박스·이름·신뢰도, Segmentation은 실제 모델 마스크를 겹쳐 표시합니다. **Show results**로 결과를 켜고 끄며 원본 이미지와 비교합니다. 모델·해상도·임계값·샘플을 바꾸면 이전 미리보기를 제거하므로 다시 실행합니다. 메인 이미지는 그대로 유지되며 원본 라벨도 변경하지 않습니다. 메인 화면에서 찾으려면 **Done**으로 닫고 대상 이미지로 이동한 뒤 **Find in current image**를 누릅니다. 첫 실행에서 모델과 예시를 자동 등록하므로 별도 Register 버튼은 없습니다.
5. 저장 범위 **Current image / All images**를 선택하고 **Save results**를 누릅니다. Detection은 `inference-<모델>-<결과 세트>/*.txt`, Segmentation은 `inference-<모델>-<결과 세트>-masks/mask/*.png`에 저장합니다. 같은 이름은 처리한 이미지 결과를 갱신합니다. 다른 예시 구성을 별도로 보관하려면 설정에서 **Result set name**을 바꿉니다.
6. **Active label folder**로 원본과 결과를 전환하고 기존 편집·저장 기능으로 검수합니다. Segmentation에서는 Brush·Erase·Undo 등을 사용할 수 있습니다.

팝업 이미지 위에서 **Ctrl + 마우스 휠**로 포인터 위치를 기준으로 확대·축소합니다. **Ctrl + 왼쪽 드래그**, **가운데 버튼 드래그** 또는 캔버스에 포커스를 둔 **Space + 왼쪽 드래그**로 이동합니다. Polygon·Brush / Eraser·Box 입력 중에도 Ctrl을 누른 채 드래그하면 그리기 대신 이미지가 이동합니다. 샘플 입력 중에도 사용할 수 있으며 이동을 윤곽 점이나 샘플 박스로 기록하지 않습니다. 샘플 입력을 하지 않을 때는 왼쪽 드래그로도 이동합니다. **Fit image**는 전체 이미지 보기로 복귀합니다. 확대·이동은 표시만 바꾸고 예시·추론에는 원본 이미지 좌표·픽셀을 사용합니다.

**Sample shape → Brush / Eraser**를 고르고 **Paint sample**을 누르면 팝업에서 직접 마스크를 편집합니다. **Brush / Eraser** 버튼으로 즉시 전환하고 활성 버튼을 확인할 수 있습니다. **Radius (image px)** 슬라이더를 좌우로 드래그하면 반경과 px 값이 즉시 바뀝니다. 반경은 확대율과 무관한 원본 이미지 기준 반경(1–128px)입니다. **Auto fill closed regions**를 켜면 브러시로 폐곡선을 그린 뒤 마우스를 놓을 때 내부가 자동으로 채워집니다(기본값: 끔). 열린 선과 지우개에는 적용하지 않으며, 획과 자동 채움은 함께 취소됩니다. **Finish mask / Enter**로 확정하고 **Undo stroke / Ctrl+Z / Backspace**로 마지막 한 획을 취소합니다. **Esc / Cancel sample** 또는 창 닫기는 미완성 마스크를 버립니다. Detection과 Segmentation 모두 지원하며 메인 라벨과 Undo 기록은 변경하지 않습니다. 확정한 마스크는 최소 경계 영역으로 잘라 실제 픽셀을 전달하므로 지운 구멍과 떨어진 영역도 유지합니다. 폴리곤으로 근사하지 않습니다. 기본 **Polygon**과 **Box** 도구도 사용할 수 있습니다.

Detection 미리보기는 기본 라벨과 같은 클래스 색의 2px 실선과 20% 색 채움, 클래스 색 배경의 흰 글씨를 사용합니다. 글꼴은 Segoe UI이며 기존 라벨 글자 크기 설정을 따릅니다. 확대율과 무관하게 같은 크기로 유지하고, 겹치는 이름은 신뢰도가 높은 결과부터 표시하되 박스는 모두 표시합니다. Segmentation은 클래스 색 채움과 흰 경계, 어두운 배경의 이름·신뢰도를 표시합니다. 이 표시는 팝업과 메인 미리보기에 함께 적용됩니다.

Detection 기존 라벨은 **Samples & settings → Reference image**에서 이미지를 고른 뒤 **Existing boxes · Reference image**에서 박스를 선택하고 **Add sample**을 누르면 됩니다. 선택한 박스는 이미지 위에 강조되며 기존 클래스 이름·ID로 추가됩니다. 메인 이미지에서 미리 선택할 필요가 없고, 다른 이미지의 박스도 팝업 안에서 추가할 수 있습니다. 현재 메인 이미지는 저장 전 편집도 반영하고, 다른 이미지는 **Active label folder**의 TXT를 읽습니다. 라벨이 없다면 폴더 선택과 이미지/TXT 파일의 기본 이름이 일치하는지 확인합니다.

메인 이미지의 **Edit**에서 Detection 박스(여러 개 선택 가능) 또는 Segmentation 마스크 영역을 선택한 뒤 팝업의 **Use selected boxes (N)** / **Use selected mask (1)**로 추가하는 경로도 유지합니다. 이 버튼은 선택한 메인 이미지와 Reference image가 같을 때 사용합니다. 다른 이미지의 마스크는 창을 닫고 메인에서 해당 이미지를 연 뒤 선택·추가합니다. 이미 추가한 샘플은 유지하며 총 32개까지 사용합니다. 마스크는 실제 픽셀과 구멍을 전달하고, 원본 박스·마스크는 수정하지 않습니다. 기존 클래스 이름으로 새 윤곽을 그리려면 **Use an existing class name**을 펼칩니다. 사각형 예시는 **Sample shape → Box**를 선택합니다.

새 샘플 이름에는 기존 클래스와 겹치지 않는 양수 ID를 할당합니다. 기존 이름과 동일하면 해당 ID를 사용합니다. Segmentation의 **0은 배경**, 대상 ID는 **1–65535**입니다. 같은 클래스의 인스턴스는 기존 편집기 방식의 semantic 마스크로 합쳐지고 클래스 간 겹침은 신뢰도가 높은 검출을 우선합니다. 결과의 `classes.yaml`과 `inference.json`에는 이름·ID·예시 좌표/마스크·모델·기준 이미지 해시·설정을 기록합니다. 예시는 현재 세션에서 사용하며 파일 기록은 재현 정보입니다. 자동 재불러오기는 제공하지 않습니다.

샘플 이름은 모델에 학습시키는 설명문이 아니라 **출력 클래스를 구분하는 이름**입니다. YOLOE는 선택한 픽셀의 시각 임베딩을 추출하여 다른 이미지의 대상과 비교합니다. 일반 사전학습 모델이 특정 산업의 물체를 반드시 이해하거나 예시를 추가할 때마다 정확도가 좋아지는 것은 아닙니다. 실제 데이터에서 검출 누락과 오검출을 확인한 후 활용해야 합니다.

## 동작 범위와 오류

- Detection은 모델을 Detection 구조로 로딩하여 박스만 계산합니다. Segmentation은 전체 Segmentation 가중치와 마스크 분기를 사용하며 원본 이미지 크기로 마스크를 복원합니다. 박스를 채워 가짜 마스크를 만들지 않습니다.
- RGB와 회색조 이미지를 지원합니다. 회색조는 RGB로 복제하고, 모델 내부 전처리로 입력 크기를 맞춥니다. 이미지당 최대 3,200만 픽셀, 최종 박스 300개를 지원합니다.
- CUDA가 사용 가능하면 GPU로 실행하며, CUDA가 없으면 CPU와 n 모델을 기본으로 사용합니다. 예시 인코딩과 실제 추론 모두 같은 장치를 사용하고 결과 메타데이터에 `backend: cuda/cpu`를 기록합니다. GPU 메모리 부족은 오류로 표시하며 선택한 모델을 임의로 다른 크기로 바꾸지 않습니다.
- 연결은 서비스 연결 확인이며 첫 Find/Save에서 실제 모델 로딩과 예시 인코딩을 수행합니다. 최초 실행은 초기화 때문에 시간이 더 걸립니다. Ultralytics 8.4.168의 마스크 입력·letterbox 제약은 프로젝트의 마스크 인코더에서 보완하며 설치 패키지는 수정하지 않습니다.
- 예시 등록은 현재 세션에 유지됩니다. 앱·YOLOE 서비스를 재시작하거나 모델·해상도를 변경하면 다음 찾기에서 다시 인코딩합니다. 데이터셋·Detection/Segmentation 모드를 변경하면 예시를 다시 지정합니다. 서비스 API v5를 사용하므로 이전 서비스를 켜둔 상태라면 Ctrl+C 후 `npm run yoloe:start`로 다시 실행합니다. 다른 창이 서비스의 예시를 바꾸면 이전 창의 추론은 오류로 중단하여 잘못된 클래스 결과를 저장하지 않습니다.
- Stop은 UI 요청을 중단하고 추가 파일 저장을 막습니다. 이미 저장된 결과는 보존합니다. 현재 연산은 끝날 때까지 실행될 수 있으며 그동안 다른 요청에는 YOLOE busy를 표시합니다.
- 결과는 예시 기반 탐지이며 학습된 전용 모델과 같은 정확도를 보장하지 않습니다. 특히 세포·현미경 영상은 실제 데이터로 검수해야 합니다.

## 작은 대상의 정확도 조정

**Settings → Inference resolution → 1024 · Small targets**로 기준 이미지 인코딩과 추론 해상도를 함께 높일 수 있습니다. 기본값은 기존의 640 / Confidence 0.25입니다. 먼저 서로 다른 조명·크기·방향의 깨끗한 예시를 같은 이름으로 추가하고, 미검출이 많으면 Confidence를 0.10, 0.05 순으로 비교합니다. 낮은 임계값에서는 오검출도 검수해야 합니다. 예시 개수 증가와 특징 평균화가 항상 정확도를 높이지는 않습니다.

합성 세포 3장의 제한된 비교에서 같은 마스크 예시 3개로 640 / 0.25는 2/195 검출(Recall 1.03%, 픽셀 IoU 1.73%), 1024 / 0.05는 189/195(96.92%, 91.04%)였습니다. 기준 이미지가 포함된 설정 비교이며 산업 데이터의 보편적 성능이 아닙니다. 자세한 경계와 다중 이미지 결과는 [검증 보고서](YOLOE26_VALIDATION_20261004_KO.md)를 참조하세요. 도메인별 검수 이미지로 Precision·Recall·마스크 IoU를 비교하고, 한계가 남으면 해당 도메인으로 Detection/Segmentation을 학습해야 합니다.

## 검사 명령

```powershell
npm run yoloe:check
npm run yoloe:test
# 실제 n/s/m/l GPU 및 n CPU 모델, 두 모드 검사 (준비된 모델과 기존 synthetic_cells 데이터 필요)
uv run --project runtime/yoloe --locked python scripts/verify-yoloe-models.py
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
