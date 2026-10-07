# YOLO GPU 우선 실행 및 CPU 자동 전환 검증

2026-10-04, Windows / NVIDIA GeForce RTX 2080 SUPER 8GB / 드라이버 591.86 / ONNX Runtime Web 1.29.0에서 확인했습니다. EasyLabeling의 실제 Electron `file://` 화면, 프로덕션 preload와 inference Worker를 사용했습니다.

모델 로딩 시 GPU/WebGPU를 먼저 시도합니다. WebGPU 미지원 또는 GPU 초기화 실패 시 CPU/WASM으로 로딩합니다. GPU 추론이나 결과 다운로드가 실패하면 GPU 세션을 해제하고 같은 모델과 같은 이미지 입력으로 CPU에서 한 번 다시 실행합니다. 이후 이미지도 CPU에서 실행합니다. CPU까지 실패하면 오류를 표시합니다. 실제 장치와 CPU 전환 여부는 Inference 탭에 표시되고, 전환 원인은 장치 배지의 툴팁에서 확인할 수 있습니다. [ONNX Runtime WebGPU 공식 문서](https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html).

## 실제 모델 비교

`C:\Git\ym_yolo`의 실제 학습 모델에서 export한 다음 ONNX 파일을 사용했습니다.

- 1ch: `C:\Git\easy_labeling\output\ym-yolo-inference-20261003\models\cells_1ch_w0844\best.onnx`
- 3ch: `C:\Git\easy_labeling\output\ym-yolo-inference-20261003\models\cells_3ch\best.onnx`

각 모델의 test 이미지 `cell_0016.png`, `cell_0035.png`, `cell_0038.png`를 GPU와 CPU에서 각각 추론하고 실제 결과 라벨 파일을 저장했습니다. GPU 어댑터는 `nvidia / turing`으로 확인됐습니다. CPU 비교는 검증용 Worker에서 WebGPU를 비활성화하여 자동 대체 경로를 실행했습니다. 검증용 임시 Worker는 실행 후 삭제됩니다.

| 모델 | 이미지 수 | GPU / CPU 검출 수 | 최소 박스 IoU | 최대 좌표 차이 | GPU / CPU Worker 시간 중앙값 |
|---|---:|---:|---:|---:|---:|
| cells_1ch_w0844 | 3 | 195 / 195 | 0.99999719 | 0.000092 px | 92.9 / 1887.5 ms |
| cells_3ch | 3 | 196 / 196 | 0.99999744 | 0.000046 px | 121.1 / 2406.3 ms |

Worker 시간은 이미지 전처리, ONNX 실행, 결과 후처리를 포함하며 모델 로딩과 화면/폴더 갱신은 제외합니다. 모델별 3장만 사용한 확인용 수치입니다. GPU 첫 이미지에는 셰이더 준비 시간이 포함되어 1ch 1127.3ms, 3ch 262.1ms가 걸렸습니다. 검출 수 일치는 GPU/CPU 간 결과 비교이며, 학습 모델의 정확도 지표를 의미하지 않습니다. 원본 라벨은 모두 보존됐고 페이지 오류는 없었습니다.

## 자동 전환 검증

- 단위 테스트: GPU 성공(1ch/3ch), WebGPU 부재, GPU 초기화 실패, 추론 실패, 결과 다운로드 실패, GPU 해제 실패 후 CPU 재시도, CPU 오류 전달을 확인했습니다. 전체 388개 통과.
- 브라우저 테스트: WebGPU 부재 및 GPU 실행 오류를 주입하고 실제 WASM 추론 결과 저장과 `GPU → CPU` 화면 표시 전환을 확인했습니다.
- 기존 브라우저/Electron 테스트도 통과했습니다. 모델 파일명 유지, 같은 모델 결과 폴더 재사용, 원본/다른 이미지 라벨 보존, 1ch/3ch·NCHW/NHWC·동적 입력을 포함해 E2E 6개 검증했습니다.
- 타입 검사와 빌드 통과.

재현: `node output/gpu-inference-20261004/verify.mjs`

상세 입력, 결과 박스, 장치 상태, 측정 시간: [results.json](../output/gpu-inference-20261004/results.json). 화면 캡처와 검증 스크립트는 같은 폴더에 있습니다.
