# YOLOE-26 ONNX 시각 샘플 라벨링

YOLOE-26 탭은 샘플 영역을 보고 비슷한 대상을 다른 이미지에서 찾습니다. Detection에서는 박스, Segmentation에서는 마스크를 생성하고 기존 라벨과 별도의 결과 폴더를 사용합니다.

## Windows 설치와 실행

`release/yoloe26/Easy-Labeling-YOLOE26-Setup-<버전>-x64.exe` 한 파일을 실행해 설치한 뒤 시작 메뉴의 **Easy Labeling YOLOE-26**을 엽니다. 현재 소스의 YOLOE 빌드 버전은 **2.2.0**이며 새 설치파일은 빌드 명령으로 생성합니다. 별도 Python, PyTorch, uv, npm, CUDA Toolkit, 서비스 터미널, 모델 다운로드가 필요 없습니다. 설치 파일에 ONNX Runtime과 N/S/M/L 모델이 모두 포함됩니다. 이전 2.0.0 수동 셋업형 및 2.0.1 Python 포함형과 달리 **ONNX 버전은 Python을 실행하거나 로컬 HTTP 서버를 띄우지 않습니다.**

데이터셋을 연 뒤 **YOLOE-26 → Samples & settings**에서 샘플을 지정하고 **Find → Save**를 사용합니다. GPU를 사용할 수 있으면 WebGPU와 S, 없으면 CPU/WASM과 N이 기본입니다. N/S/M/L은 모두 선택할 수 있습니다. 실제 실행 장치를 **GPU · WebGPU** 또는 **CPU**로 표시하며 GPU 초기화·실행에 실패하면 같은 모델을 CPU로 실행합니다. GPU에는 WebGPU를 지원하는 그래픽 드라이버가 필요합니다.

## ONNX 구성

모델 크기마다 `encoder.onnx`와 `detector.onnx`가 있습니다. encoder는 이미지와 지정 영역 마스크를 받아 샘플 특징을 계산하고, detector는 대상 이미지와 그 특징을 받아 박스·점수·마스크 계수와 프로토타입을 반환합니다. 가변 샘플 수와 640/1024/2048 해상도를 지원합니다. 같은 ONNX 모델을 사용하므로 2048 전용 가중치 다운로드나 별도 모델 파일은 필요하지 않습니다. 일반 Ultralytics export처럼 샘플을 모델에 고정하지 않으므로 박스·폴리곤·브러시, 같은 이름의 여러 영역과 여러 기준 이미지를 계속 사용할 수 있습니다.

ONNX 및 가중치 데이터 파일은 `assets/models/yoloe26/`에서 **실제 파일로 Git 관리**합니다. 각 가중치 파일은 50MB 이하이며 LFS 포인터를 사용하지 않습니다. 설치 후에는 `resources/yoloe26/`의 로컬 파일만 읽습니다. 모델별 크기와 SHA256, 갱신 방법은 [YOLOE26_OFFLINE_MODELS_KO.md](YOLOE26_OFFLINE_MODELS_KO.md)를 참고하세요.

## 소스 실행과 설치 파일 빌드

모델이 포함된 체크아웃에서는 Python 없이 다음 명령으로 브라우저 개발 및 Windows 빌드를 합니다. npm 의존성은 개발 PC에서 먼저 준비합니다.

```powershell
cd C:\Git\easy_labeling
npm.cmd ci
npm.cmd start
# http://localhost:4173/ — YOLOE도 기본 ONNX 실행
npm.cmd run electron:dist:yoloe:win
```

## 모델을 교체하는 개발자만 필요한 내보내기

`.pt` 원본은 `runtime/yoloe/models/`에 두며 설치본에 포함하지 않습니다. 변환 도구는 개발 PC에서만 Python을 사용합니다. 고정 환경은 `runtime/yoloe/uv.lock`에 기록합니다.

```powershell
uv sync --project runtime/yoloe --locked --group export
npm.cmd run yoloe:prepare -- --model all
npm.cmd run yoloe:export:onnx -- --size all
npm.cmd run yoloe:models:record
npm.cmd run electron:dist:yoloe:win
```

내보내기 명령은 각 크기에서 640/1024/2048 해상도와 샘플 개수 1/2/3을 조합해 ONNX 출력을 PyTorch와 비교합니다. 기존 ONNX 가중치의 2048 지원만 검증하려면 `uv run --project runtime/yoloe --locked --group export python scripts/verify-yoloe-2048.py`를 실행합니다. 이 검증은 가중치를 다시 만들지 않고 모든 크기가 통과하면 manifest에 2048과 parity PASS를 기록합니다. 명령 종료 코드 0과 manifest의 parity PASS를 확인한 뒤 모델과 소스를 같은 커밋으로 갱신합니다. Python 구현을 비교 기준으로 사용할 개발자는 별도 `npm.cmd run yoloe:start`와 `http://localhost:4173/?yoloe=python`을 사용할 수 있습니다. 일반 버전 Inference와 YOLOE-26 설치형의 ONNX 실행에는 이 비교 서비스가 필요 없습니다.
## UI 사용

왼쪽 사이드바에는 실행 장치·모델·예시 개수와 **Samples & settings → Find → Save**만 표시됩니다. **Samples & settings**는 레이아웃·템플릿 설정처럼 별도 창을 엽니다. 창 왼쪽에서 기준 이미지와 대상 예시를 지정하고, 오른쪽에서 모델·해상도·결과 세트 이름·Confidence·IoU를 조절합니다. 값은 즉시 적용되며 **Done**으로 닫아도 현재 세션에 유지됩니다.

1. 데이터셋을 열고 **Detection** 또는 **Segmentation → YOLOE-26**을 선택합니다. 모델을 로컬 ONNX Runtime으로 실행하며 실제 장치를 `GPU · WebGPU` 또는 `CPU`로 표시합니다.
2. **Samples & settings**를 열고 **Reference image**에서 예시 이미지를 선택합니다. **Name the target**에 `sampleA`처럼 대상 이름을 입력하고 **Outline sample**을 누릅니다. 설정 창의 이미지에서 윤곽을 클릭해 점을 찍고, 3개 이상의 점으로 영역을 만든 뒤 **Enter**, 더블클릭 또는 **Finish outline**으로 마칩니다. **Backspace**는 마지막 점 취소, **Esc**는 현재 윤곽 취소입니다. 창을 닫으면 미완성 윤곽만 취소하고 완료한 예시는 유지합니다. 배경을 포함하지 않도록 대상의 실제 형상을 따라 지정합니다. 기준 이미지 선택과 예시 지정은 메인 이미지·원본 라벨·마스크·Undo 기록을 변경하지 않습니다.
3. 다음 이름은 `sampleB`, `sampleC` 순으로 제안합니다. 서로 다른 이름은 서로 다른 출력 클래스가 됩니다. 같은 대상의 다른 형태를 추가하려면 **Add another example to → sampleA**를 선택하고 **Outline sample**을 다시 누릅니다. **Reference image**에서 다른 이미지를 선택한 뒤에도 같은 방식으로 추가할 수 있습니다. 선택 목록에 `sampleA · 2 example(s)`처럼 누적 개수가 표시됩니다. 같은 이미지의 같은 클래스 영역은 합쳐 인코딩하고, 서로 다른 이미지의 특징은 각각 보관해 같은 출력 클래스 ID에 연결합니다. 썸네일은 선택한 마스크만 보여주며 마우스를 올리면 원본 이미지 이름을 확인할 수 있습니다. 잘못 만든 샘플은 행의 ×로 삭제합니다. 여러 이미지를 합쳐 최대 32개 예시를 지원합니다.
4. 창 안에서 **Run preview**를 누르면 **Reference image**에 선택된 이미지에 샘플을 적용합니다. Detection은 박스·이름·신뢰도, Segmentation은 실제 모델 마스크를 겹쳐 표시합니다. **Show results**로 결과를 켜고 끄며 원본 이미지와 비교합니다. 모델·해상도·임계값·샘플을 바꾸면 이전 미리보기를 제거하므로 다시 실행합니다. 메인 이미지는 그대로 유지되며 원본 라벨도 변경하지 않습니다. 메인 화면에서 찾으려면 **Done**으로 닫고 대상 이미지로 이동한 뒤 **Find in current image**를 누릅니다. 첫 실행에서 모델과 예시를 자동 등록하므로 별도 Register 버튼은 없습니다.
5. 저장 범위 **Current image / All images**를 선택하고 **Save results**를 누릅니다. Detection은 `inference-<모델>-<결과 세트>/*.txt`, Segmentation은 `inference-<모델>-<결과 세트>-masks/mask/*.png`에 저장합니다. 같은 이름은 처리한 이미지 결과를 갱신합니다. 다른 예시 구성을 별도로 보관하려면 설정에서 **Result set name**을 바꿉니다.
6. **Active label folder**로 원본과 결과를 전환하고 기존 편집·저장 기능으로 검수합니다. Segmentation에서는 Brush·Erase·Undo 등을 사용할 수 있습니다.

팝업 이미지 위에서 **Ctrl + 마우스 휠**로 포인터 위치를 기준으로 확대·축소합니다. **Ctrl + 왼쪽 드래그**, **가운데 버튼 드래그** 또는 캔버스에 포커스를 둔 **Space + 왼쪽 드래그**로 이동합니다. Polygon·Brush / Eraser·Box 입력 중에도 Ctrl을 누른 채 드래그하면 그리기 대신 이미지가 이동합니다. 샘플 입력 중에도 사용할 수 있으며 이동을 윤곽 점이나 샘플 박스로 기록하지 않습니다. 샘플 입력을 하지 않을 때는 왼쪽 드래그로도 이동합니다. **Fit image**는 전체 이미지 보기로 복귀합니다. 확대·이동은 표시만 바꾸고 예시·추론에는 원본 이미지 좌표·픽셀을 사용합니다.

**Sample shape → Brush / Eraser**를 고르고 **Paint sample**을 누르면 팝업에서 직접 마스크를 편집합니다. **Brush / Eraser** 버튼으로 즉시 전환하고 활성 버튼을 확인할 수 있습니다. **Radius (image px)** 슬라이더를 좌우로 드래그하면 반경과 px 값이 즉시 바뀝니다. 반경은 확대율과 무관한 원본 이미지 기준 반경(1–128px)입니다. **Auto fill closed regions**를 켜면 브러시로 폐곡선을 그린 뒤 마우스를 놓을 때 내부가 자동으로 채워집니다(기본값: 끔). 열린 선과 지우개에는 적용하지 않으며, 획과 자동 채움은 함께 취소됩니다. **Finish mask / Enter**로 확정하고 **Undo stroke / Ctrl+Z / Backspace**로 마지막 한 획을 취소합니다. **Esc / Cancel sample** 또는 창 닫기는 미완성 마스크를 버립니다. Detection과 Segmentation 모두 지원하며 메인 라벨과 Undo 기록은 변경하지 않습니다. 확정한 마스크는 최소 경계 영역으로 잘라 실제 픽셀을 전달하므로 지운 구멍과 떨어진 영역도 유지합니다. 폴리곤으로 근사하지 않습니다. 기본 **Polygon**과 **Box** 도구도 사용할 수 있습니다.

샘플 마스크는 찾을 대상의 특징을 지정하는 입력입니다. 추론 결과는 모델이 새로 예측하는 마스크이며, 샘플의 외곽선·홈·구멍을 그대로 복제하는 기능은 아닙니다. 팝업 확대는 화면 표시만 바꾸므로 모델 입력 해상도는 설정의 640/1024/2048에서 따로 선택합니다. 특히 큰 이미지의 작은 대상은 입력 축소와 1/8 해상도의 샘플 특징 마스크에서 세부 윤곽이 손실될 수 있습니다. 모델 크기나 신뢰도가 커져도 정확한 경계를 보장하지 않으므로 결과를 검토하고 보정해야 합니다. 산업 이미지에서 확인한 실제 경계 품질과 후처리 검증은 [마스크 경계 검증 기록](YOLOE26_MASK_BOUNDARY_VALIDATION_20261005_KO.md)을 참고하세요.

Detection 미리보기는 기본 라벨과 같은 클래스 색의 2px 실선과 20% 색 채움, 클래스 색 배경의 흰 글씨를 사용합니다. 글꼴은 Segoe UI이며 기존 라벨 글자 크기 설정을 따릅니다. 확대율과 무관하게 같은 크기로 유지하고, 겹치는 이름은 신뢰도가 높은 결과부터 표시하되 박스는 모두 표시합니다. Segmentation은 클래스 색 채움과 흰 경계, 어두운 배경의 이름·신뢰도를 표시합니다. 이 표시는 팝업과 메인 미리보기에 함께 적용됩니다.

기존 라벨은 **Samples & settings → Reference image**에서 이미지를 고른 뒤 Detection의 **Existing boxes**, Segmentation의 **Existing mask regions**에서 선택합니다. Ctrl/Shift로 여러 항목을 고른 뒤 **Add selected**를 누르면 클래스 이름·ID와 실제 영역을 함께 추가합니다. 다른 이미지로 바꿔 추가하면 여러 기준 이미지의 예시를 함께 활용합니다(최대 32개). 마스크는 연결된 영역별로 구분하고 구멍과 16비트 클래스 ID를 보존합니다. 현재 메인 이미지는 저장 전 편집도 반영하며 다른 이미지는 활성 라벨 폴더에서 기존 PNG·YOLO Segmentation·COCO·LabelMe 로더로 읽습니다. 원본 라벨은 변경하지 않습니다. 라벨이 없으면 활성 폴더와 이미지/라벨 파일 이름을 확인하세요. 메인 화면에서 선택한 라벨을 가져오는 **Use selected labels**도 계속 사용할 수 있습니다.

## 샘플과 설정 프리셋

팝업 오른쪽의 **Saved samples & settings**에서 저장·복원합니다. **Save**는 Windows의 기본 프리셋 폴더 `문서\Easy Labeling\YOLOE Presets`에 저장하고, 불러온 파일이 있으면 그 파일을 갱신합니다. **Save as…**는 다른 파일 이름이나 위치를 선택하며, 이후 Save는 새 위치를 갱신합니다. 기본 폴더의 파일은 목록에서 선택하고 다른 위치의 파일은 **Open…**으로 불러옵니다. Detection과 Segmentation 프리셋은 각 모드별로 구분합니다.

JSON에는 기준 이미지 PNG, 박스·폴리곤·픽셀 마스크, 클래스 이름·ID, 모델 크기, 입력 해상도, Confidence·IoU, 결과 세트 이름, 브러시 크기·자동 채움·선택 도구가 포함됩니다. 모델 가중치나 일시적인 추론 세션은 저장하지 않으며 불러온 뒤 첫 실행에서 특징을 다시 계산합니다. 기준 이미지가 포함되므로 원본 경로가 달라져도 샘플은 유지됩니다. 저장한 파일을 열기 전에는 실행할 데이터셋과 모드를 선택하세요.

웹 브라우저에서는 Save가 해당 브라우저의 로컬 저장소(OPFS)에 저장되며 Save as…는 JSON 다운로드입니다. 다운로드 위치는 브라우저 설정을 따르고 **Open…**으로 파일을 불러옵니다. 브라우저 사이트 데이터를 지우면 로컬 프리셋도 지워지므로 필요한 파일은 Save as…로 보관하세요.

## 전체 이미지 실행과 실행 장치

왼쪽 **Save results → All images → Run & save all (이미지 수)**를 누르면 등록된 샘플로 모든 데이터셋 이미지를 추론하고 별도 결과 폴더에 저장합니다. Labeled/Unlabeled·검색 필터로 일부가 보이지 않아도 전체 이미지가 대상입니다. 현재 이미지만 처리하려면 Current image를 선택합니다. 실행 중 사이드바에 완료 수/전체 수, 퍼센트, 파일 이름이 표시되고 공통 작업 패널에서 진행률과 취소를 확인합니다. 중단 시 이미 저장된 결과는 남습니다.

GPU를 사용하면 왼쪽에 실행 장치와 GPU 이름을 표시합니다. Windows는 WebGPU 어댑터의 제조사·장치 정보와 일치하는 장치명을 조회하며 여러 장치를 구분할 수 없으면 어댑터가 제공한 정보만 표시합니다. GPU가 없거나 실행 중 CPU로 전환되면 **GPU unavailable · Using CPU**로 표시합니다. 기본 CPU 모델은 N이며 저장한 프리셋의 모델은 불러올 때 유지합니다.

실제 재시작·파일 저장·RGB/그레이스케일 일괄 실행 결과와 재현 명령은 [프리셋 및 전체 실행 검증](YOLOE26_PRESETS_VALIDATION_20261006_KO.md)을 참고하세요.

메인 이미지의 **Edit**에서 Detection 박스(여러 개 선택 가능) 또는 Segmentation 마스크 영역을 선택한 뒤 팝업의 **Use selected boxes (N)** / **Use selected mask (1)**로 추가하는 경로도 유지합니다. 이 버튼은 선택한 메인 이미지와 Reference image가 같을 때 사용합니다. 다른 이미지의 마스크는 창을 닫고 메인에서 해당 이미지를 연 뒤 선택·추가합니다. 이미 추가한 샘플은 유지하며 총 32개까지 사용합니다. 마스크는 실제 픽셀과 구멍을 전달하고, 원본 박스·마스크는 수정하지 않습니다. 기존 클래스 이름으로 새 윤곽을 그리려면 **Use an existing class name**을 펼칩니다. 사각형 예시는 **Sample shape → Box**를 선택합니다.

새 샘플 이름에는 기존 클래스와 겹치지 않는 양수 ID를 할당합니다. 기존 이름과 동일하면 해당 ID를 사용합니다. Segmentation의 **0은 배경**, 대상 ID는 **1–65535**입니다. 같은 클래스의 인스턴스는 기존 편집기 방식의 semantic 마스크로 합쳐지고 클래스 간 겹침은 신뢰도가 높은 검출을 우선합니다. 결과의 `classes.yaml`과 `inference.json`에는 이름·ID·예시 좌표/마스크·모델·기준 이미지 해시·설정을 기록합니다. 예시는 현재 세션에서 사용하며 파일 기록은 재현 정보입니다. 자동 재불러오기는 제공하지 않습니다.

샘플 이름은 모델에 학습시키는 설명문이 아니라 **출력 클래스를 구분하는 이름**입니다. YOLOE는 선택한 픽셀의 시각 임베딩을 추출하여 다른 이미지의 대상과 비교합니다. 일반 사전학습 모델이 특정 산업의 물체를 반드시 이해하거나 예시를 추가할 때마다 정확도가 좋아지는 것은 아닙니다. 실제 데이터에서 검출 누락과 오검출을 확인한 후 활용해야 합니다.

## 동작 범위와 오류

- Detection은 모델을 Detection 구조로 로딩하여 박스만 계산합니다. Segmentation은 전체 Segmentation 가중치와 마스크 분기를 사용하며 원본 이미지 크기로 마스크를 복원합니다. 박스를 채워 가짜 마스크를 만들지 않습니다.
- RGB와 회색조 이미지를 지원합니다. 회색조는 RGB로 복제하고, 모델 내부 전처리로 입력 크기를 맞춥니다. 이미지당 최대 3,200만 픽셀, 최종 박스 300개를 지원합니다.
- WebGPU를 사용할 수 있으면 GPU로, 없으면 CPU/WASM으로 실행합니다. 결과에 `backend: webgpu/cpu`를 기록하며 GPU 실패 시 CPU로 전환합니다. 선택한 모델 크기는 유지합니다.
- 연결은 서비스 연결 확인이며 첫 Find/Save에서 실제 모델 로딩과 예시 인코딩을 수행합니다. 최초 실행은 초기화 때문에 시간이 더 걸립니다. Ultralytics 8.4.168의 마스크 입력·letterbox 제약은 프로젝트의 마스크 인코더에서 보완하며 설치 패키지는 수정하지 않습니다.
- 예시 등록은 현재 세션에 유지됩니다. 앱을 재시작하거나 모델·해상도를 변경하면 다음 찾기에서 다시 인코딩합니다. 데이터셋·Detection/Segmentation 모드를 변경하면 예시를 다시 지정합니다. 앱 창마다 독립적인 ONNX Worker와 샘플을 사용합니다.
- Stop은 UI 요청을 중단하고 추가 파일 저장을 막습니다. 이미 저장된 결과는 보존합니다. 현재 연산은 끝날 때까지 실행될 수 있으며 그동안 다른 요청에는 YOLOE busy를 표시합니다.
- 결과는 예시 기반 탐지이며 학습된 전용 모델과 같은 정확도를 보장하지 않습니다. 특히 세포·현미경 영상은 실제 데이터로 검수해야 합니다.

## 작은 대상의 정확도 조정

**Settings → Inference resolution → 1024 · Small targets**로 기준 이미지 인코딩과 추론 해상도를 함께 높일 수 있습니다. 기본값은 기존의 640 / Confidence 0.25입니다. 먼저 서로 다른 조명·크기·방향의 깨끗한 예시를 같은 이름으로 추가하고, 미검출이 많으면 Confidence를 0.10, 0.05 순으로 비교합니다. 낮은 임계값에서는 오검출도 검수해야 합니다. 예시 개수 증가와 특징 평균화가 항상 정확도를 높이지는 않습니다.

더 높은 해상도는 **Settings → Inference resolution → 2048 · Fine details**에서 선택합니다. Detection과 Segmentation의 기준 이미지 및 대상 이미지에 모두 적용되며 해상도를 바꾸면 샘플 특징을 다시 계산합니다. 입력 픽셀 수는 1024의 4배이므로 처리 시간과 메모리 사용이 증가할 수 있습니다. GPU와 CPU 모두 선택할 수 있으며 CPU에서는 N 모델부터 시험하는 것이 좋습니다. 실제 산업 이미지의 비교에서는 샘플 특징에 남는 정보가 증가했지만 작은 홈이 자동으로 복원되지는 않았습니다. 결과 비교를 통해 해상도를 선택하고 정밀 마스크는 검수하세요.

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
