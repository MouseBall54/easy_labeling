# EasyLabeling SR / 복원 모델 통합 구현 계획

- 작성일: 2026-09-12
- 최종 갱신일: 2026-09-13
- 상태: 완료
- 범위: CFSR x2/x4 및 tk_r_em 4종을 Working Image 생성 단계에 통합하고, Preprocessing / EdgeSAM / Superpixel 결과를 Original 좌표로 저장

## 1. 목표와 불변 조건

- 지원 모델은 `CFSR x2`, `CFSR x4`, `tk_r_em hrsem`, `hrtem`, `lrsem`, `lrtem`의 6종이다.
- 모든 모델 출력은 annotation 원본이 아니라 파생된 Working Image다.
- Canvas document, 최종 mask/region/polygon, 저장 파일 좌표와 해상도는 항상 Original Image 기준이다.
- Canvas View를 변경하면 EdgeSAM Input Source와 Superpixel Input Source가 같은 실제 이미지 source로 함께 이동한다.
- EdgeSAM과 Superpixel 입력을 직접 선택하면 Canvas View를 변경하지 않으며, 두 도구의 직접 선택은 서로 독립적이다.
- 좌표 및 mask 복원은 `working-image.ts`의 descriptor 기반 공통 변환만 사용한다. 호출부에 x2/x4 또는 모델별 역변환을 하드코딩하지 않는다.
- 모델 input/output name, dtype, shape는 ONNX metadata와 실제 샘플 추론으로 확인한 값만 사용한다.

## 2. 현재 관련 코드 구조

- `src/features/super-resolution/types.ts`: 모델 ID, worker 요청/응답, backend/status 계약.
- `src/features/super-resolution/service.ts`: Working Image cache와 worker lifecycle.
- `workers/super-resolution-worker.js`: local ONNX 로딩, 모델별 backend 정책, tensor 변환, tiled inference와 overlap blending.
- `src/features/segmentation/workflow.ts`: Original RGBA, ROI, AI, Processed cache와 View/EdgeSAM/Superpixel source 상태.
- `src/features/segmentation/working-image.ts`: Working descriptor와 Original↔Working 좌표 및 mask 복원.
- `src/bootstrap/event-manager-adapter.ts`, `index.html`: 모델 선택과 source UI 연결.
- `scripts/copy-offline-assets.mjs`, `package.json`: 브라우저 offline asset 복사 및 Electron package 포함.

## 3. 모델 파일 경로와 출처

| UI 모델 | 파일 경로 | upstream tag | 상태 |
| --- | --- | --- | --- |
| CFSR x2 | `resources/models/sr/cfsr_x2.onnx` | project existing | 있음 |
| CFSR x4 | `resources/models/sr/cfsr_x4.onnx` | project existing | 있음 |
| tk_r_em hrsem | `resources/models/sr/sfr_hrsem.onnx` | `sfr_hrsem` | 있음 |
| tk_r_em hrtem | `resources/models/sr/sfr_hrtem.onnx` | `sfr_hrtem` | 있음 |
| tk_r_em lrsem | `resources/models/sr/sfr_lrsem.onnx` | `sfr_lrsem` | 있음 |
| tk_r_em lrtem | `resources/models/sr/sfr_lrtem.onnx` | `sfr_lrtem` | 있음 |

tk_r_em 모델과 inference reference의 원본은 GPL-3.0-only인
`https://github.com/Ivanlh20/tk_r_em`이다. 모델 파일과 함께 upstream license 및 출처를 보존한다.

## 4. 실제 모델 입출력 규격

### CFSR x2 / x4

2026-09-13 ONNX Runtime metadata 확인 결과:

| 모델 | input | input dtype / shape | output | output dtype / metadata shape | 실제 출력 정책 |
| --- | --- | --- | --- | --- | --- |
| CFSR x2 | `modelInput` | `float32`, `[batch_size, 3, H, W]` | `modelOutput` | `float32`, `[batch_size, 3, H, W]` | 실제 inference는 input H/W의 2배 |
| CFSR x4 | `modelInput` | `float32`, `[batch_size, 3, H, W]` | `modelOutput` | `float32`, `[batch_size, 3, H, W]` | 실제 inference는 input H/W의 4배 |

metadata의 symbolic output shape만으로 배율을 추정하지 않고 실제 결과 tensor 크기로 검증한다.

### tk_r_em hrsem / hrtem / lrsem / lrtem

Upstream reference implementation은 입력을 `float32` grayscale NHWC `(N,H,W,1)`로 만들고,
홀수 H/W를 평균값으로 even padding한 다음 inference 후 원래 크기로 crop한다. 대형 이미지는
최소 128 px patch와 50% overlap, Butterworth window blending을 사용한다.

2026-09-13 ONNX Runtime metadata와 WASM 샘플 inference로 확인한 결과는 다음과 같다.

| 모델 | input name / dtype / shape | output name / dtype / shape | 샘플 입력→출력 | 판정 |
| --- | --- | --- | --- | --- |
| hrsem | `input_gen`, `float32`, `[N,H,W,1]` | `Identity:0`, `float32`, `[N,H,W,1]` | `[1,32,34,1]` → `[1,32,34,1]` | 동일 해상도 |
| hrtem | `input_gen`, `float32`, `[N,H,W,1]` | `Identity:0`, `float32`, `[N,H,W,1]` | `[1,32,34,1]` → `[1,32,34,1]` | 동일 해상도 |
| lrsem | `input_gen`, `float32`, `[N,H,W,1]` | `Identity:0`, `float32`, `[N,H,W,1]` | `[1,32,34,1]` → `[1,32,34,1]` | 동일 해상도 |
| lrtem | `input_gen`, `float32`, `[N,H,W,1]` | `Identity:0`, `float32`, `[N,H,W,1]` | `[1,32,34,1]` → `[1,32,34,1]` | 동일 해상도 |

실제 worker runtime에서는 홀수 크기 `65×49` 입력도 내부 even padding/crop을 거쳐 네 모델 모두
`65×49` RGBA Working Image로 복원되는 것을 확인했다.

## 5. 데이터 흐름

```text
Original Image / Original Coordinate
  ↓ 사용자가 선택한 모델 (Off이면 통과)
AI / Working Image
  ↓ 선택적 Preprocessing
Processed Working Image

View Source ─────────────── Original | AI | Processed
EdgeSAM Input Source ───── Original | AI | Processed
Superpixel Input Source ── Original | AI | Processed

EdgeSAM / Superpixel 결과
  ↓ WorkingImageDescriptor 기반 좌표·mask 복원
Original resolution / coordinate
  ↓
기존 Annotation Pipeline / 저장 형식
```

기존 CFSR ROI workflow는 유지하되 모델 종류와 실제 출력 크기를 descriptor에 기록한다. tk_r_em도
동일한 Working Image 계약을 사용하며, 동일 크기 출력이면 scale 1, 다른 크기 출력이면 실제
`outputWidth / originalRect.width`, `outputHeight / originalRect.height`를 공통 converter가 사용한다.

## 6. Source 및 Preprocessing 계약

- UI 명칭은 `Original`, `AI`, `Processed`로 통일한다.
- 내부 descriptor는 원본 전체/ROI 여부를 유지해 실제 픽셀 범위와 Original rect를 식별한다.
- Preprocessing source는 `Original` 또는 `AI`를 선택할 수 있다.
- `Processed`는 선택된 preprocessing source와 config에서 만들어진다.
- View source 변경은 AI Select와 Superpixel 입력도 같은 source로 동기화한다. `Processed`는 현재
  preprocessing source에 따라 `Original Processed` 또는 `Processed AI`로 해석한다.
- AI Select 또는 Superpixel 입력을 직접 바꾸면 해당 선택만 적용되고 Canvas View는 유지된다.
- AI 결과가 아직 없을 때 해당 source 선택은 거부하고 사용 가능한 Original로 되돌린다.

## 7. 좌표와 Mask 복원

`WorkingImageDescriptor`는 Working `width/height`, Original `originalWidth/originalHeight`, 필요한 경우
`originalRoi`, 실제 픽셀을 식별하는 `cacheKey`를 가진다.

```text
Screen → Canvas(Original document space) → Working Image → Original Image
Working Mask → descriptor의 실제 scale로 nearest-neighbor 복원
             → Original full-size mask의 해당 rect에 배치
             → 기존 segmentation annotation pipeline
```

CFSR x2/x4와 tk_r_em을 구분하는 문자열 분기로 좌표를 환산하지 않는다. 출력이 input과 같은
tk_r_em 모델은 descriptor scale이 1이 되어 변환 없이 저장되고, 출력 크기가 다르면 실제 크기 비율로
복원된다.

## 8. Cache 전략과 무효화

| 결과 | Cache key |
| --- | --- |
| AI | imageId + modelId + original rect |
| Processed | imageId + source descriptor key + preprocessingConfig |
| EdgeSAM embedding | imageId + actual input descriptor key + modelId + preprocessingConfig |
| Superpixel result | imageId + actual input descriptor key + modelId + preprocessingConfig + superpixelConfig |

무효화 규칙:

- 이미지 변경: 해당 image의 active descriptor/source를 교체한다.
- 모델 변경: AI/Processed/EdgeSAM/Superpixel active result를 새 key로 전환한다.
- preprocessing source/config 변경: Processed 및 이를 사용하는 algorithm cache를 전환한다.
- EdgeSAM/Superpixel input 변경: 해당 algorithm만 새 cache key를 사용한다.
- View 변경: inference cache를 무효화하지 않는다.

## 9. 단계별 구현 계획과 검증 상태

| 단계 | 작업 | 상태 | 검증 근거 / 남은 작업 |
| --- | --- | --- | --- |
| 1 | 기존 구조 분석 및 본 문서 갱신 | 완료 | 코드/worker/UI/cache/좌표 흐름 확인 |
| 2 | 6개 모델 파일 및 metadata 확인 | 완료 | 6종 metadata 및 실제 출력 크기 확인 |
| 3 | 모델 registry 및 6종 선택 UI | 완료 | 공통 registry, select와 quick picker 6종 |
| 4 | 모델별 Working Image 생성 | 완료 | NCHW RGB CFSR / NHWC grayscale tk_r_em adapter, even padding/crop |
| 5 | Original / AI / Processed View | 완료 | 사용자 UI 3종, 내부 descriptor가 Original ROI 범위 유지 |
| 6 | EdgeSAM Input Source 연결 | 완료 | 공통 Working descriptor/cache key 재사용 |
| 7 | Algorithm Input Source 연결 | 완료 | Canvas View 연동과 도구별 직접 선택 독립성 unit/E2E 검증 |
| 8 | Original 좌표/Mask 복원 통합 | 완료 | x2/x4 및 scale 1 ROI point/mask unit 검증 |
| 9 | cache / invalidation 정리 | 완료 | image+ROI+model key와 processed/algorithm 파생 key 사용 |
| 10 | Backend 품질/WASM/Packaging/Offline | 완료 | 6종 browser runtime, tk_r_em WebGPU device-limit 검증, 타일 경계 회귀, offline URL, Windows ASAR 자산 확인 |

## 10. 필수 검증 체크리스트

- [x] CFSR x2 로딩 및 실행
- [x] CFSR x4 로딩 및 실행
- [x] tk_r_em hrsem 로딩 및 실행
- [x] tk_r_em hrtem 로딩 및 실행
- [x] tk_r_em lrsem 로딩 및 실행
- [x] tk_r_em lrtem 로딩 및 실행
- [x] CFSR input/output name, dtype, metadata shape 확인
- [x] tk_r_em 4종 input/output name, dtype, shape 확인
- [x] 6종 샘플 inference의 실제 출력 해상도 확인
- [x] AI Select / Superpixel의 직접 선택이 서로와 Canvas View를 역변경하지 않음 확인
- [x] Canvas View 변경 시 AI Select / Superpixel source 동기화 확인
- [x] Original 및 AI의 Preprocessing 연계 확인
- [x] EdgeSAM 정상 동작
- [x] Superpixel 정상 동작
- [x] Working 결과의 Original 좌표 복원 확인
- [x] Mask 원본 크기 복원 확인
- [x] WebGPU 실행 또는 명시적 fallback 확인
- [x] WASM fallback 확인
- [x] tk_r_em whole/tiled 출력 유사도와 tile boundary artifact 확인
- [x] Offline 실행 및 Electron packaging asset 확인

검증하지 않은 항목은 완료 처리하지 않는다. 각 구현 단계가 끝날 때 이 문서의 실제 metadata,
샘플 크기, 테스트 명령, 결과와 해결한 이슈를 갱신한다.

## 11. 최종 검증 결과

2026-09-14 기준:

- `npm run test:unit`: 59 files, 365 tests 통과.
- `npm run typecheck`: 통과.
- `npm run build`: 통과.
- `npm run test:e2e`: Chromium 23개 중 22개 통과. 기존 Review Queue 저장 대기 1건은
  일시적으로 `Saving...`에서 timeout 후 동일 spec 단독 재실행에서 통과.
- `super-resolution-runtime.spec.ts`: CFSR 2종과 tk_r_em 4종 실제 worker inference 통과.
  - Electron 실제 GPU 환경에서 CFSR 2종과 tk_r_em 4종 모두 WebGPU로 실행했다.
  - tk_r_em은 WebGPU device가 compute stage당 storage buffer 10개를 요청하도록 초기화한다. 지원 한도가 낮은 GPU에서는 원인을 표시하고 WASM으로 fallback한다.
  - upstream 공개 실험 HR/LR SEM·TEM 패널을 모델별 192×128 입력으로 사용한 tiled WebGPU/WASM 비교 MAE는 `hrsem=0.000041`, `hrtem=0.000041`, `lrsem=0`, `lrtem=0`이고, 최대 차이는 모두 `1` 이하이며 경계 MAE는 `0`이다. 128·256·512px tileSize에서도 네 모델 모두 같은 결과 기준을 통과했다.
  - 홀수 65×49 GPU 입력은 upstream even padding/crop 후 네 모델 모두 원래 65×49 크기로 복원했고, 동일 Worker session의 반복 실행 결과 차이는 `0`이다. tk_r_em의 50% overlap은 upstream 계약으로 고정되며 separable Butterworth blending을 유지한다.
  - 진단용 `?backend=webgpu`와 강제 `?backend=wasm` 경로를 모두 유지한다.
  - tk_r_em tiled 결과와 whole-image WASM 결과의 MAE는 실제 이미지에서 `0.326`, 합성 회귀 입력에서 `0.5` 미만이다.
  - 실제 이미지의 tile boundary 불연속은 주변 baseline 이하로 확인했다.
- 홀수 입력 `65×49`에서 CFSR은 각각 `130×98`, `260×196`, tk_r_em은 네 모델 모두 `65×49` 출력.
- Vite offline URL에서 tk_r_em 4개 모델이 HTTP 200과 원본 byte 크기로 제공됨.
- `EASY_LABELING_SKIP_RCEDIT=1 npm run electron:pack`: Windows unpacked package 생성 통과.
- 생성된 `app.asar`에 worker, CFSR 2종, tk_r_em 요구 모델 4종, third-party notice 포함 확인.

## 12. 이슈 및 해결 내용

- 제공된 파일 중 요구 대상 `sfr_hrtem.onnx` 대신 추가 `sfr_hrstem.onnx`가 있었다. 요구된 hrtem은
  upstream 공식 파일로 보충했고, 사용자 제공 hrstem은 로컬에 보존하되 Git 및 패키징 대상에서 제외했다.
- CFSR metadata의 output symbolic shape는 배율을 표현하지 않으므로 실제 inference tensor 크기로 x2/x4를 검증했다.
- tk_r_em은 CFSR과 tensor layout이 달라 공통 변환을 강제하지 않고 NHWC grayscale adapter를 추가했다.
- tk_r_em의 홀수 H/W는 upstream 계약대로 평균값 even padding 후 inference하고 원래 크기로 crop한다.
- tk_r_em WebGPU의 줄무늬·격자 잡음은 모델의 NHWC 입출력 또는 stitch 자체 문제가 아니었다. Electron GPU device가 기본 `maxStorageBuffersPerShaderStage=8`로 생성됐지만 tk_r_em `Concat` 커널은 9~10개 buffer를 요구해 WebGPU validation 오류가 발생했다. adapter가 지원하는 10개 limit을 device 요청에 명시하자 tiled WebGPU 결과가 WASM tiled 결과와 최대 1/255 이내로 일치했다.
- tk_r_em은 이제 WebGPU 우선 정책을 사용한다. adapter가 compute stage당 storage buffer 10개를 지원하지 않으면 해당 사유를 status/UI tooltip에 남기고 WASM fallback한다. 기존 50% overlap 및 separable Butterworth window blending은 유지한다.
- 검증에는 합성 gradient/checkerboard, 번들 이미지, upstream 공개 실험 HR/LR SEM·TEM 패널을 사용했다. 사용자 데이터가 추가되면 같은 GPU/WASM 비교 기준으로 재검증한다.
- macOS에서 기본 Windows `afterPack`은 `rcedit` 실행을 위한 Wine이 없으면 실패한다. production 동작은
  유지하면서 자산 패키징 검증 시에만 `EASY_LABELING_SKIP_RCEDIT=1`로 metadata 후처리를 생략할 수 있게 했다.
- 기존 Automation E2E의 `Control+A`는 macOS Chrome에서 전체 선택으로 동작하지 않았다. OS별로
  `Meta+A`/`Control+A`를 선택하도록 수정해 동일한 입력 포커스 검증을 유지했다.
