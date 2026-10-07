# Detection YOLO ONNX 추론

## 사용

1. Detection에서 이미지 데이터셋을 열고 Review 아래 **Inference** 탭을 선택합니다.
2. **Load** 버튼으로 Detection `.onnx` 파일을 선택합니다. 선택한 파일명과 모델의 채널 수, NCHW/NHWC 배치 순서, 입력 크기와 실제 실행 장치가 표시됩니다. 장치 배지는 모델 선택 전 `No model`, 로딩 중 `Loading…`, 로딩 후 `GPU · WebGPU` 또는 `CPU · WASM`을 명시합니다. GPU 사용이 가능하면 WebGPU를 우선 사용하며, 불가능하면 CPU/WASM으로 전환합니다. CPU로 전환한 이유는 장치 배지에 마우스를 올리면 확인할 수 있습니다.
3. Confidence와 NMS IoU를 설정하고 현재 이미지 또는 전체 이미지 추론을 실행합니다.
4. 완료하면 데이터셋 아래 `inference-<모델 파일명에서 .onnx 제외>` 폴더에 저장되고 결과 박스가 기존 캔버스에 표시됩니다. 예를 들어 `model_v1.onnx`는 `inference-model_v1`을 사용합니다. 같은 모델 파일명으로 재실행하면 같은 폴더에서 처리한 이미지의 라벨을 갱신하며, 나머지 이미지 라벨은 유지합니다. 모델 버전별로 파일명을 구분하면 결과도 별도 폴더에 저장됩니다.
5. **Active label folder**에서 원본 라벨과 추론 결과를 전환합니다. 폴더 버튼으로 다른 라벨 폴더도 연결할 수 있습니다. 등록 목록은 현재 세션에 유지됩니다. 재시작 후에는 저장된 결과 폴더를 다시 연결합니다.

전환 전에 수정한 라벨은 기존 활성 폴더에 저장됩니다. 저장에 실패하면 전환하지 않습니다. Auto save도 현재 활성 폴더에 저장하므로 결과를 수정해 검수할 수 있습니다. 원본 라벨을 추론 결과로 덮어쓰지 않습니다. Review 상태와 규칙도 라벨 소스별로 관리합니다.

결과 폴더에는 YOLO 정규화 좌표 `.txt`, `classes.yaml`, 실행 정보 `inference.json`이 저장됩니다. 검출이 없는 이미지는 빈 `.txt`를 저장합니다. 클래스 이름은 현재 클래스 목록을 사용하고, 없는 ID는 `class <ID>`로 표시합니다. 모델의 클래스 순서와 맞는 클래스 파일을 사용하세요. 모델 내부 클래스 이름 metadata는 자동으로 읽지 않습니다.

이전 버전의 반복 추론으로 클래스 이름에 중첩된 문자열 따옴표와 이스케이프가 저장된 경우, 클래스 파일을 다시 불러오면 누적된 문자열 표기를 해석하여 정상 이름으로 표시합니다. 같은 정리는 클래스 편집 저장과 추론 결과 저장에도 적용됩니다. `cell "A"`처럼 이름 내부에 포함된 따옴표는 유지합니다.

Inference 왼쪽의 **Classes**는 Files와 같은 설정을 사용합니다. 클래스 폴더 연결, 파일 선택·생성·편집, 검색과 표시 설정이 두 탭에서 공유됩니다.

## 입력과 출력

- 단일 이미지 입력, batch 1, float32 모델을 지원합니다. 모델 채널은 1 또는 3이어야 합니다.
- NCHW와 NHWC를 입력 shape에서 판별합니다. 고정 채널 크기가 없거나 배치 순서가 모호하면 오류로 안내합니다.
- 이미지 크기와 관계없이 종횡비를 유지해 모델 입력 크기로 축소/확대하고, 114 값으로 letterbox 패딩을 합니다. 회색조 모델은 RGB를 밝기 값으로 변환하고, 3채널 모델에는 RGB 순서로 전달합니다. 회색조 이미지도 같은 경로로 처리합니다. 입력은 0–1로 정규화합니다.
- 동적 공간 크기는 기본 640×640입니다. Advanced에서 변경한 후 모델을 다시 선택하세요. 고정 모델 크기가 우선합니다.
- YOLOv8+ raw `[1, 4+C, N]`, YOLOv5 raw `[1, N, 5+C]`, NMS/end-to-end `[1, N, 6]`의 픽셀 좌표 출력을 지원합니다. YOLOv5는 objectness×class score를 사용합니다. raw 출력에는 클래스별 NMS를 적용합니다. 최종 박스는 원본 좌표로 복원하고 이미지 경계로 잘라 최대 300개까지 저장합니다.
- Auto는 일반 raw 출력의 배치 방향을 기준으로 판별합니다. 6열 출력은 단일 클래스 YOLOv5와 NMS 결과를 구분할 수 없으므로 Output format을 직접 선택해야 합니다. 작은 prediction tensor도 모델에 맞는 명시적 형식을 선택하세요.
- float16, quantized 입력, 여러 입력/출력, segmentation/pose, 별도 external-data 파일, 커스텀 정규화/좌표 포맷은 지원 범위 밖입니다. float32 단일 파일 Detection 모델로 export하세요.

기존에 설치된 ONNX Runtime을 Worker에서 **GPU/WebGPU 우선, CPU/WASM 자동 대체** 방식으로 실행합니다. WebGPU 미지원, GPU 초기화 실패 또는 GPU 추론/결과 다운로드 오류가 발생하면 CPU 세션을 생성하고 같은 이미지를 다시 처리합니다. 이후 이미지도 CPU를 사용하며, 표시 장치 역시 CPU로 갱신됩니다. CPU에서도 실행에 실패하면 오류를 표시합니다. GPU 경로는 [ONNX Runtime WebGPU](https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html)를 사용합니다.

추론 중에는 이미지별 진행 상황과 Stop 버튼이 표시됩니다. Stop을 누르면 실행 중 Worker가 중단되며, 다시 실행하려면 모델을 다시 선택합니다. 완료된 부분 파일은 결과 폴더에 남습니다. 실패/중단된 폴더는 자동 활성화하지 않으며, 필요하면 직접 연결할 수 있습니다.

전체 추론에서 같은 기본 이름을 가진 이미지(예: `a.jpg`, `a.png`)가 있으면 두 이미지가 `a.txt`를 공유하므로 실행을 차단합니다. 이미지 이름을 구분한 후 다시 실행하세요.

## 검증

```powershell
npm run typecheck
npm run test:unit
npm run build
npx playwright test tests/e2e/inference.spec.ts tests/e2e/inference-electron.spec.ts tests/e2e/review-queue.spec.ts tests/e2e/label-folder-resolution.spec.ts --project=chromium
```

단위 테스트는 RGB/회색조 변환, 입력 배치, letterbox 좌표 복원, NMS, YOLOv5 objectness, 최종 xyxy 출력과 잘못된 출력 처리, GPU 우선 실행 및 CPU 자동 전환을 확인합니다. 브라우저 테스트는 작은 실제 ONNX 그래프를 실행하여 1ch/3ch·NCHW/NHWC·동적 입력, 결과 표시, 배치 추론, 수정 라벨 보존, Auto save, 폴더 전환, 새로고침, 모델 로딩 실패 후 복구, 테마를 확인합니다. WebGPU 부재와 GPU 실행 오류를 주입한 경우에는 실제 CPU/WASM 결과와 장치 표시 전환도 검증합니다. Electron 테스트는 프로덕션 preload와 `file://` Worker로 추론하고 실제 임시 폴더의 결과 파일과 원본 보존을 확인합니다.

테스트 모델은 일정한 prediction tensor를 반환하는 작은 ONNX 그래프입니다. 학습된 YOLO 모델의 검출 품질, 성능, 특수 export 호환성은 실제 사용할 모델과 이미지로 별도 확인해야 합니다.

2026-10-03에는 `C:\Git\ym_yolo`의 실제 학습 모델 3개를 추가 검증했습니다. 1ch/3ch 세포 모델의 test 30장 추론·저장·원본 복귀와 Python ONNX 참조 일치를 확인했습니다. 모델·지표·시간·결과 폴더는 [실제 모델 검증 보고서](DETECTION_INFERENCE_YM_YOLO_20261003_KO.md)에 있습니다.

2026-10-04에는 RTX 2080 SUPER에서 실제 1ch/3ch 모델의 GPU 실행과 CPU 자동 대체를 비교했습니다. 검출 결과와 실행 시간은 [GPU 검증 보고서](DETECTION_INFERENCE_GPU_20261004_KO.md)에 있습니다.

형식 참고: [Ultralytics ONNX export](https://docs.ultralytics.com/modes/export/), [ONNX Runtime input metadata](https://onnxruntime.ai/docs/api/js/interfaces/InferenceSession.TensorValueMetadata.html).
