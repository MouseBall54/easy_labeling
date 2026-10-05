# YOLOE-26 ONNX 모델의 Git 관리와 오프라인 사용

`assets/models/yoloe26/`의 N/S/M/L ONNX 및 가중치 데이터 파일 자체를 Git에 저장합니다. LFS 포인터나 다운로드 링크로 대체하지 않습니다. 각 모델 폴더에는 `encoder.onnx`, `detector.onnx`, 두 그래프에서 사용하는 `.data` 파일과 크기·SHA256·변환 검증 결과를 기록한 `manifest.json`이 있습니다. 큰 가중치는 파일당 50MB 이하로 나누고 함께 버전 관리합니다. ONNX 그래프만 복사하고 `.data`를 빠뜨리면 실행할 수 없습니다.

| 모델 | ONNX 그래프 + 두 단계 FP32 가중치 합계 (MB) |
|---|---:|
| N | 23.39 |
| S | 85.93 |
| M | 193.95 |
| L | 229.23 |
| 합계 | 532.50 |

1 MB는 1,000,000 bytes입니다. 샘플 특징 추출과 추론의 두 그래프를 포함하므로 일반적인 고정 클래스 YOLO ONNX 파일 한 개의 크기와 다릅니다. 두 그래프는 새 샘플을 지정할 때 다시 변환하지 않아도 되는 가변 시각 프롬프트 구성입니다.

모델 갱신은 변환을 수행하는 개발 PC에서 진행합니다. 원본 `.pt`는 `runtime/yoloe/models/`에 두고 다음 명령으로 원하는 크기 또는 전체를 내보냅니다.

```powershell
cd C:\Git\easy_labeling
# 개발 PC에서만 Python 변환 의존성 준비
uv sync --project runtime/yoloe --locked --group export
npm.cmd run yoloe:export:onnx -- --size all
npm.cmd run yoloe:models:record
git add assets/models/yoloe26 scripts/export-yoloe-onnx.py runtime/yoloe/pyproject.toml runtime/yoloe/uv.lock
git commit -m "Update YOLOE-26 ONNX models"
```

`--size n`, `s`, `m`, `l`로 개별 크기를 갱신할 수 있습니다. 변환 명령은 manifest를 갱신하고 PyTorch와 ONNX의 수치 비교가 실패하면 종료합니다. `yoloe:models:record` 및 설치 파일 빌드는 파일별 크기와 SHA256이 manifest와 맞는지 검증하여 일부 가중치만 바뀐 상태로 배포하는 것을 막습니다. `.pt`, 가상 환경 및 다른 연구용 모델은 Git에서 제외합니다.

모델이 포함된 체크아웃을 오프라인 환경으로 전달하면 모델 다운로드가 필요 없습니다. 일반 사용자는 **Easy-Labeling-YOLOE26-Setup-2.1.0-x64.exe** 하나로 설치합니다. Python·PyTorch·CUDA Toolkit·서비스 설정 없이 앱 내부의 ONNX Runtime에서 실행합니다. 소스 개발 PC의 npm 의존성은 별도로 준비해야 합니다. 상세 사용 방법은 [YOLOE26_GPU_KO.md](YOLOE26_GPU_KO.md)를 참고하세요.
