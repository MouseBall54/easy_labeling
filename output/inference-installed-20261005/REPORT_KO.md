# 설치된 Inference 탭 ONNX 검증 — 2026-10-05

설치된 **Easy Labeling YOLOE-26 2.1.0** 프로그램의 일반 **Inference** 탭에서 Detection ONNX 파일을 직접 선택해 실제 추론했습니다. 앱의 main/preload/Worker와 ONNX Runtime을 그대로 사용했습니다. Python 실행 경로나 모델 서버를 사용하지 않았고 HTTP/HTTPS 요청은 차단했습니다. 네이티브 데이터셋 선택 대화상자의 반환 경로만 검증용 복사본으로 지정했습니다.

## 결과

| 모델 | 장치 | 이미지 실행 수 | 검출 | 배치 완료 시간 | 결과 |
|---|---|---:|---:|---:|---|
| smoke_1ch | gpu | 4 | 0 | 1.93s | PASS |
| cells_1ch_w0844 | gpu | 30 | 2342 | 4.95s | PASS |
| cells_3ch | gpu | 30 | 2345 | 4.99s | PASS |
| smoke_1ch | cpu | 4 | 0 | 0.43s | PASS |
| cells_1ch_w0844 | cpu | 30 | 2342 | 48.25s | PASS |
| cells_3ch | cpu | 30 | 2345 | 64.41s | PASS |

총 배치 실행은 128회(각 장치 64회), 고유 이미지는 34장입니다. 두 세포 모델에 같은 합성 세포 test 30장을 사용했습니다. 이외 두 세포 모델의 현재 이미지 재실행도 각 장치에서 확인했습니다. 시간은 한 번의 측정으로 이미지 디코딩·추론·저장·표시를 포함합니다. 실제 산업 촬영 데이터에 대한 정확도 평가가 아닙니다.

- ONNX 파일 선택 후 파일명 표시 및 모델 준비: PASS
- 1ch/3ch 입력 구조 자동 판별 및 회색조 이미지의 3ch 모델 입력 처리: PASS
- GPU · WebGPU / CPU · WASM 실제 실행 및 장치 표시: PASS
- 배치 추론, 현재 이미지 추론, 결과 박스 캔버스 표시: PASS
- 이미지별 YOLO TXT 저장 개수와 실제 검출 개수 일치: PASS
- `inference-best` 폴더 재사용, 원본 라벨 폴더 복귀 및 SHA256 보존: PASS
- Renderer 오류 / HTTP·HTTPS 요청: 0 / 0

CPU 검사는 같은 Windows PC에서 `--disable-gpu --disable-software-rasterizer`를 사용해 실제 CPU/WASM 연산으로 진행했습니다. 별도 GPU 없는 물리 PC 검사는 아닙니다.

기존 smoke 모델은 1 epoch 실행 확인용으로 Confidence 0.25에서 검출 0개가 정상이며 빈 TXT 저장을 확인했습니다. 세포 모델의 검출 수는 GPU와 CPU 모두 1ch 2,342개, 3ch 2,345개였습니다.

## 모델 및 비교 기준

직접 선택한 ONNX 경로:

- `C:\Git\easy_labeling\output\ym-yolo-inference-20261003\models\smoke_1ch\best.onnx`
- `C:\Git\easy_labeling\output\ym-yolo-inference-20261003\models\cells_1ch_w0844\best.onnx`
- `C:\Git\easy_labeling\output\ym-yolo-inference-20261003\models\cells_3ch\best.onnx`

원본은 `C:\Git\ym_yolo`의 Detection 학습/내보내기 결과입니다. 모든 모델의 현재 SHA256이 2026-10-03 검증 당시 값과 일치함을 확인했습니다. Confidence 0.25, 클래스별 NMS IoU 0.45를 사용했습니다.

이번 실제 앱 결과를 2026-10-03에 독립 Python ONNX Runtime/Ultralytics 구현으로 생성해 보존한 참조 결과와 비교했습니다. 이번 실행에서는 Python을 다시 실행하지 않았습니다. 모든 이미지에서 클래스별 검출 수가 일치하며, 최소 대응 IoU는 0.999991 이상입니다. 현재 테스트는 실행 경로·호환성·표시·저장 검증입니다.

## 증거와 재현

- [실제 Worker 예측·UI 검사·파일 저장 결과](results.json)
- [1ch GPU 추론 화면](cells_1ch_w0844-gpu.png)
- [3ch GPU 추론 화면](cells_3ch-gpu.png)
- [1ch CPU 추론 화면](cells_1ch_w0844-cpu.png)
- [3ch CPU 추론 화면](cells_3ch-cpu.png)

```powershell
cd C:\Git\easy_labeling
node output/inference-installed-20261005/verify.mjs
```

검증용 데이터 복사본 경로는 `results.json`의 `workspace`에 있습니다. 재실행 시 새 복사본을 사용합니다. 앱 코드 수정은 필요하지 않았습니다.
