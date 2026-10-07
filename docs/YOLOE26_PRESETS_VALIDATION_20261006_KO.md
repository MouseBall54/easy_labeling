# YOLOE-26 기존 라벨·프리셋·전체 이미지 실행 검증

2026-10-06, Windows / NVIDIA GeForce RTX 2080 SUPER에서 확인했다. 기능 동작 검증이며 산업 도메인의 정확도 평가가 아니다.

## 점검 및 변경

| 기능 | 점검 전 | 적용 후 |
| --- | --- | --- |
| Detection 기존 라벨 | 팝업에서 박스를 하나씩 추가 가능 | Ctrl/Shift 다중 선택 후 Add selected로 일괄 추가 |
| Segmentation 기존 라벨 | 메인에서 선택한 영역 한 개만 추가 가능 | 팝업에서 연결된 마스크 영역 여러 개 선택·추가, 다른 기준 이미지도 지원 |
| 전체 이미지 실행 | All images + Save results로 가능, 공통 진행률 존재 | Run & save all (N)로 의미 명시, 사이드바에도 완료 수·퍼센트·파일 이름 표시 |
| 샘플·설정 재사용 | 세션 종료 시 소실 | 기준 PNG와 샘플·설정 JSON 저장, 기본 폴더 목록·Open·Save as 지원 |
| 실행 장치 | GPU/CPU 배지, GPU 정보는 설정/툴팁 위주 | 사이드바에 GPU 이름 또는 GPU unavailable · Using CPU 안내 |

현재 이미지의 저장 전 편집을 포함하고, 다른 이미지의 마스크는 기존 PNG/YOLO Segmentation/COCO/LabelMe 로더를 독립된 읽기 상태로 재사용한다. 선택한 마스크는 폴리곤으로 근사하지 않고 실제 픽셀 RLE로 전달한다. 원본 라벨과 메인 이미지 선택을 변경하지 않는다.

기본 Windows 프리셋 경로는 시스템 문서 폴더 아래 `Easy Labeling\YOLOE Presets`다. 첫 Save는 기본 폴더에 기록하고, 불러온 파일 또는 Save as로 저장한 파일은 다음 Save에서 갱신한다. Save as만 파일 저장 대화상자를 연다. Detection/Segmentation 프리셋은 구분하며 모드 변경 시 이전 파일의 저장 경로를 해제해 다른 모드의 프리셋을 덮어쓰지 않는다. 브라우저 기본 저장은 OPFS이고 Save as는 JSON 다운로드다.

## 실제 Windows 앱 / ONNX 실행

- 실행파일: `release/yoloe26-presets/win-unpacked/Easy Labeling YOLOE-26.exe`.
- 입력: `tests/e2e/fixtures/yoloe-visual/`의 기준 이미지, 그레이스케일 대상, RGB 대상 3장. 크기는 810×1080, 810×1080, 1280×720이다.
- 기능 검증을 위해 별도 복사본에 person(5)·bus(12) 박스와 픽셀 마스크를 마련했다. 마스크에는 지운 구멍이 있다. 이 마스크는 기능 검증용 예시이며 정교한 정답 마스크가 아니다.
- 각 모드에서 첫 이미지 라벨 2개와 다른 이미지 라벨 1개를 선택해 샘플 3개를 등록했다.
- 기본 Save가 대화상자 없이 기록되는지, Save as가 다른 경로에 기록되는지, 이후 Save가 새 경로를 갱신하는지, Open으로 외부 JSON을 읽는지 확인했다.
- 앱 프로세스를 종료하고 재실행한 뒤 기본 폴더 목록에서 복원했다. 기준 이미지 2장·예시 3개·1024 해상도·Confidence 0.2가 유지됐고 모델 특징은 다시 계산됐다.
- 실제 S/1024 WebGPU로 전체 3장을 실행했다. 진행률은 두 모드 모두 0/3→1/3→2/3→3/3 및 0→33→67→100%로 확인했다.
- 실행 장치와 결과 메타데이터 모두 `NVIDIA GeForce RTX 2080 SUPER` / `webgpu`로 일치했다.

| 이미지 | Detection 박스 수 | Segmentation 전경 픽셀 수 |
| --- | ---: | ---: |
| 0-reference.png | 5 | 202,435 |
| 1-target-gray.png | 6 | 246,215 |
| 2-target-rgb.png | 2 | 0 |
| 합계 | 13 | 448,650 |

Segmentation은 총 후보 3개를 반환했고 최종 전경 클래스는 12였다. RGB 대상은 빈 마스크를 반환했다. 빈 결과도 원본 크기의 유효한 PNG로 저장됐으나 이 예시가 RGB 대상의 분할에 성공했다는 뜻은 아니다. 박스 검출과 마스크 샘플의 전이 성능은 별도로 검수해야 한다. 각 출력 파일 존재·크기·RLE/PNG 유효성 및 원본 TXT/PNG 바이트 보존을 확인했다.

GPU를 비활성화한 새 프로세스에서도 CPU/N 기본 선택과 짧은 CPU 안내를 확인했다. 저장된 Segmentation 프리셋을 불러온 후 N/1024 CPU 미리보기를 실행해 마스크 후보 1개를 반환했다.

실제 앱 검증은 별도 사용자 데이터·문서·데이터셋 디렉터리에서 진행했다. Python 실행 경로와 외부 HTTP 통신을 차단했으며 요청 수 0개, 페이지 오류 0개였다. 파일/폴더 대화상자만 자동 선택으로 바꾸고 앱의 저장 IPC·프리셋·추론 worker·모델·후처리는 그대로 사용했다.

## 자동 검사와 재현

TypeScript 검사와 빌드, 관련 단위 테스트 20개가 통과했다. 총 17개 UI 시나리오를 관련 묶음으로 실행해 통과했다. UI 검증은 mock 서비스 기반으로 다중 라벨, 여러 기준 이미지, OPFS Save·다운로드·페이지 재시작 후 복원, 다른 모드 프리셋 덮어쓰기 방지, 잘못된 JSON 거부, 17장 전체 실행, 원본 라벨 보존, CPU 기본 모델, 취소, 좁은 화면, 기존 확대·팬·브러시·1024/2048 동작을 확인한다. 실제 모델 실행의 근거는 위 Windows 앱 실행이며 UI mock 결과와 구분한다.

```powershell
npm.cmd run typecheck
npm.cmd run build
npx.cmd vitest run tests/unit/features/inference/yoloe.test.ts tests/unit/features/inference/yoloe-presets.test.ts tests/unit/features/inference/yoloe-onnx.test.ts tests/unit/bootstrap/file-system-adapter.test.ts
npx.cmd playwright test tests/e2e/yoloe.spec.ts --project=chromium
npx.cmd electron-builder --config electron-builder.yoloe.cjs --win --x64 --dir --config.directories.output=release/yoloe26-presets
node scripts/verify-yoloe-presets.mjs
```

별도 설치 경로를 시험하려면 마지막 명령에 EXE의 절대 경로를 인수로 전달한다. 검증 스크립트는 이 PC의 NVIDIA GPU를 기준으로 확인한다. JSON 결과·샘플 프리셋·TXT·PNG·화면 캡처는 로컬 `output/yoloe-presets-validation/`에 남긴다. 이 디렉터리와 빌드 산출물은 Git 배포 자산이 아니다.
