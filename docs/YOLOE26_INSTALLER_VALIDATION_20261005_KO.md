# YOLOE-26 ONNX Windows 설치형 검증 — 2026-10-05

**최종 배포는 2.1.0 ONNX 독립형입니다.** 설치 EXE 하나에 ONNX Runtime과 N/S/M/L의 가변 시각 프롬프트 모델을 포함합니다. 앱 실행에 Python, PyTorch, uv, CUDA Toolkit, 모델 다운로드, 로컬 HTTP 서비스가 필요 없습니다. 이전 2.0.0 수동 셋업형 및 2.0.1 Python 포함형은 이 배포와 다릅니다.

## 배포 파일

- 파일: `release/yoloe26/Easy-Labeling-YOLOE26-Setup-2.1.0-x64.exe`
- 크기: **714,792,781 bytes (714.79 MB)**
- SHA256: `85CDDBFA8D9F283EA9CE2B322729ABF95E83B15B4B507DD9CB630136921F9088`
- 서명: `NotSigned`
- 실제 사용자 설치 경로: `%LOCALAPPDATA%\Programs\Easy Labeling YOLOE-26`
- 환경: Windows 11 Pro 10.0.26200, NVIDIA GeForce RTX 2080 SUPER

NSIS 설치를 실제로 실행해 종료 코드 0을 확인했습니다. 설치된 `resources/`에 Python 실행 파일과 `.pt`가 없으며 이전 Python 런타임도 제거됐습니다. 실행 중 자식 프로세스 목록은 앱의 Electron 프로세스만 포함했습니다. 앱의 PATH를 System32로 제한하고 PYTHONHOME/PYTHONPATH를 존재하지 않는 경로로 설정한 상태에서 검증했습니다. HTTP/HTTPS 요청은 로컬 주소까지 차단한 상태로 추론·저장했습니다. 예측 응답을 모의 데이터로 바꾸지 않았습니다.

## 구현과 모델 관리

각 크기는 `encoder.onnx`와 `detector.onnx`를 사용합니다. encoder는 기준 이미지와 영역 마스크에서 특징을 추출하고 detector는 대상 이미지와 특징을 받아 박스·클래스 점수·마스크 계수와 프로토타입을 생성합니다. 샘플을 모델에 고정하지 않으므로 새 샘플, 같은 이름의 추가 예시, 다른 이미지의 예시를 계속 등록할 수 있습니다. 브러시·지우개 마스크의 구멍과 폴리곤도 유지합니다.

실행 장치는 **GPU · WebGPU** 또는 **CPU**로 표시합니다. GPU 초기화·실행 실패 시 동일 모델을 CPU/WASM으로 실행하고 표시·저장 메타데이터를 갱신합니다. GPU가 없으면 N이 기본입니다. WebGPU 그래프의 일부 shape 연산은 ONNX Runtime의 정책에 따라 CPU에 배치될 수 있습니다.

ONNX와 외부 가중치 `.data`를 `assets/models/yoloe26/`에 실제 Git 파일로 관리합니다. LFS 포인터가 아니며 모델 파일의 SHA256을 manifest에 기록했습니다. 최대 개별 파일 크기는 49,946,624 bytes입니다. 모델 갱신·빌드 시 manifest와 모든 데이터 파일의 크기 및 SHA256을 검사합니다. 모델의 두 단계 그래프·FP32 가중치 합계는 N 23.39MB, S 85.93MB, M 193.95MB, L 229.23MB입니다.

## 실제 설치 앱 검사

| 항목 | 결과 |
|---|---|
| Windows NSIS 설치/업데이트 및 설치된 EXE 시작 | PASS |
| Python·`.pt` 없는 설치 폴더 / Python 자식 프로세스 없음 | PASS / PASS |
| HTTP 서비스·모델 다운로드 없이 ONNX 실행 | PASS |
| GPU S 기본 / GPU 비활성화 시 CPU N 기본 | PASS / PASS |
| 설치된 샘플 17장 Detection 객체 수와 Segmentation 경계 | PASS, 두 모드 모두 17/17 |
| 팝업 Ctrl+휠 확대, 팬, 두 모드 결과 미리보기 | PASS |
| RGB 및 회색조 입력, 박스 TXT 및 16-bit 마스크 PNG 저장 | PASS |
| 원본 박스·마스크 보존, 결과 폴더 전환·새로고침·같은 폴더 재사용 | PASS |
| 생성 마스크의 브러시 편집·Undo/Redo·파일 저장 | PASS |
| Renderer pageerror 및 HTTP/HTTPS 요청 | 0 / 0 |
| 브라우저 기본 ONNX 경로, N/CPU 단일 클래스 추론 | PASS, 3개 검출 |

CPU 검사는 동일 GPU 장착 PC에서 Electron의 `--disable-gpu --disable-software-rasterizer`로 GPU와 소프트웨어 GPU를 비활성화해 실제 CPU/WASM 연산을 실행했습니다. GPU가 없는 별도 물리 PC를 검사한 것은 아닙니다. 네이티브 데이터셋 선택 대화상자만 테스트 폴더 반환으로 바꾸고 나머지는 설치된 main/preload, 파일 핸들 및 실제 ONNX 모델을 사용했습니다. Worker 메시지는 관찰만 했습니다.

테스트 이미지 3장은 RGB 기준 이미지, 동일 장면의 회색조 이미지, 다른 RGB 장면입니다. Confidence 0.25, IoU 0.45, 해상도 640에서 다음 결과를 파일로 저장했습니다.

| 경로 | 기준 RGB | 대상 회색조 | 다른 RGB | 합계 |
|---|---:|---:|---:|---:|
| GPU S / Detection | 4 | 4 | 2 | 10 |
| GPU S / Segmentation instances | 4 | 4 | 2 | 10 |
| CPU N / Detection | 4 | 4 | 0 | 8 |
| CPU N / Segmentation instances | 4 | 4 | 0 | 8 |

마스크는 810×1080, 810×1080, 1280×720 원본 크기이며 클래스 0(배경), 5(person), 12(bus)만 저장됐습니다. N이 다른 장면을 검출하지 못한 경우도 실제 결과 그대로 빈 라벨/배경 마스크로 저장했습니다. 이번 검사는 실행·호환성·저장 검증이며 산업 데이터의 정확도나 mAP를 보증하는 측정은 아닙니다.

## N/S/M/L과 가변 예시 검사

모든 크기에서 PyTorch와 ONNX의 수치 비교를 수행했습니다. 각 크기마다 640/예시 1개, 640/3개, 1024/2개에서 embedding·prediction·prototype 비교가 PASS입니다. 허용 오차는 embedding 절대 2e-5/상대 2e-4, prediction/prototype 절대 0.02/상대 2e-4입니다. 내보내기 도구와 의존성은 소스 및 `uv.lock`에 포함합니다.

설치된 앱에서는 RGB·회색조 두 기준 이미지에 예시 3개를 등록했습니다. 같은 person 클래스의 폴리곤과 구멍 있는 브러시 마스크, bus 박스를 함께 사용했으며 embedding의 클래스 ID는 `[5,12,5]`입니다.

| 모델 | 해상도 | Detection | Segmentation | 실행 |
|---|---:|---:|---:|---|
| N | 640 | 4 | 4 | WebGPU |
| S | 640 | 4 | 4 | WebGPU |
| M | 1024 | 6 | 6 | WebGPU |
| L | 1024 | 5 | 5 | WebGPU |

TypeScript typecheck와 ONNX/YOLOE 단위 검사 6개가 통과했습니다. 기존 샘플·편집 UI 회귀 검사 13개도 통과했으며 이 검사는 명시적인 Python 비교 경로에 모의 응답을 제공했습니다. 위 실제 ONNX 검증과 구분합니다.

## 재현 명령과 증거

```powershell
cd C:\Git\easy_labeling
npm.cmd run electron:dist:yoloe:win
$installedExe = "$env:LOCALAPPDATA\Programs\Easy Labeling YOLOE-26\Easy Labeling YOLOE-26.exe"
node scripts/verify-yoloe-onnx.mjs $installedExe
node scripts/verify-yoloe-onnx-models.mjs $installedExe
$env:YOLOE_TEST_CPU = '1'
node scripts/verify-yoloe-onnx.mjs $installedExe
Remove-Item Env:YOLOE_TEST_CPU
```

- [최종 설치 EXE GPU 재검사](../output/yoloe-onnx-validation/probe.json)
- [최종 설치 EXE CPU 재검사](../output/yoloe-onnx-validation/probe-cpu.json)
- [최종 설치 파일 정보](../output/yoloe-onnx-validation/installer.json)
- [설치 GPU 전체 UI 결과 및 자식 프로세스](../output/yoloe-onnx-validation/results.json)
- [설치 CPU 전체 UI 결과 및 자식 프로세스](../output/yoloe-onnx-validation/cpu/results.json)
- [N/S/M/L·두 이미지·브러시 구멍·같은 클래스 결과](../output/yoloe-onnx-validation/models.json)
- [브라우저 기본 ONNX 실행 결과](../output/yoloe-onnx-validation/browser.json)
- [샘플/설정 팝업의 실제 마스크 미리보기](../output/yoloe-onnx-validation/popup-segmentation-preview.png)
- [설치 안내](YOLOE26_GPU_KO.md), [오프라인 모델 갱신 및 Git 관리](YOLOE26_OFFLINE_MODELS_KO.md)

공식 YOLOE 일반 export는 프롬프트를 고정하므로 이 구현은 원본 모듈을 두 그래프로 내보내고 특징을 입력으로 전달합니다. [Ultralytics YOLOE export 설명](https://docs.ultralytics.com/models/yoloe/#export-usage), [ONNX Runtime WebGPU 설명](https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html).
