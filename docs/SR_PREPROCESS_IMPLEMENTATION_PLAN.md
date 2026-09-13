# ROI 기반 CFSR x2/x4 및 Algorithm Input 구현 계획

- 작성일: 2026-09-12
- 최종 갱신일: 2026-09-13
- 상태: 완료
- 범위: Segmentation의 ROI 기반 CFSR x2/x4, source별 preprocessing, EdgeSAM/Superpixel 독립 입력, Original 좌표 저장

## 1. 목표와 불변 조건

- Canvas, segmentation document, 최종 mask/region/polygon 저장 좌표는 항상 Original Image 기준이다.
- CFSR은 전체 이미지가 아니라 사용자가 Original 좌표로 Drag한 ROI crop에만 실행한다.
- SR 결과의 고해상도 픽셀은 별도 Fabric image layer로 보존하고, Original 좌표의 같은 ROI 위치에 배치한다. Canvas 확대 시 x2/x4 원본 픽셀 밀도를 그대로 사용한다.
- View source, EdgeSAM input, Superpixel input은 서로 독립된 상태다.
- 좌표 및 mask 복원은 `working-image.ts`의 공통 변환 함수만 사용하며 호출부에 `/2`, `/4`를 직접 작성하지 않는다.

기존의 full-image SR 구현과 검증 기록은 이 설계로 대체한다. full-image SR 결과를 Fabric base image로 직접 넣는 방식은 더 이상 현재 동작 계약이 아니다.

## 2. 현재 구조와 변경 지점

- `src/features/segmentation/workflow.ts`
  - Original RGBA와 ROI를 보관한다.
  - `image key + ROI + CFSR mode`별 SR ROI cache를 관리한다.
  - Original Processed와 SR ROI Processed를 서로 다른 cache key로 관리한다.
  - Original base image 위에 실제 고해상도 SR ROI layer를 배치한다. annotation/mask layer는 그 위에 유지한다.
- `src/features/segmentation/working-image.ts`
  - Original, Original Processed, SR ROI, SR ROI Processed descriptor를 표현한다.
  - Original↔Working point/rect 변환과 Working mask→Original full-size mask 복원을 담당한다.
- `src/features/super-resolution/*`, `workers/super-resolution-worker.js`
  - local CFSR x2/x4 ONNX 실행, tile 처리, WebGPU 우선 및 WASM fallback을 담당한다.
- `src/bootstrap/event-manager-adapter.ts`
  - SR ROI 선택 gesture, x2/x4 picker, 각 source UI 상태를 연결한다.

## 3. 데이터 흐름

```text
Original Image / Original Coordinate
  ↓ 사용자가 ROI Drag
Original ROI Crop
  ↓ CFSR x2 또는 x4
High-resolution SR ROI ───────────────┐
  ├─ SR ROI Algorithm Input           │ cache
  └─ Preprocessing → SR ROI Processed │
                                      │
Original Image ───────────────────────┤
  └─ Preprocessing → Original Processed

View
  Original 크기 canvas
  ├─ ROI 밖: Original
  └─ ROI 안: 고해상도 SR ROI 또는 SR ROI Processed layer
      ├─ x2 적용 직후 ROI 중심 200% 확대
      ├─ x4 적용 직후 ROI 중심 400% 확대
      └─ Hold Original 비교 / Full image 복귀

EdgeSAM/Superpixel 결과
  Working ROI 좌표/Mask
  ↓ 공통 converter
Original ROI 위치
  ↓ full-size Original mask
기존 Annotation Pipeline / 저장 형식
```

## 4. 상태 및 Cache 계약

### Algorithm Input

EdgeSAM과 Superpixel이 각각 다음 네 값을 독립 보관한다.

1. `original` — Original
2. `original-processed` — Original Processed
3. `sr-roi` — SR ROI
4. `sr-roi-processed` — SR ROI Processed

한 도구의 source 변경은 다른 도구의 source를 변경하지 않는다. SR ROI source는 ROI와 활성 CFSR 결과가 모두 있을 때만 선택할 수 있다.

### Cache

| 결과 | Cache key | 무효화/분리 기준 |
| --- | --- | --- |
| SR ROI | image id + ROI 좌표/크기 + CFSR mode | 이미지 또는 ROI 변경 시 별도 key |
| Processed | base descriptor key + preprocessing config | Original과 SR ROI를 별도 보관 |
| EdgeSAM embedding | 실제 선택 input descriptor key | EdgeSAM input 변경 시 준비 |
| Superpixel | 실제 선택 input descriptor key + settings | Superpixel input/settings 변경 시 재계산 |

## 5. 좌표와 Mask 계약

`WorkingImageDescriptor`는 다음을 가진다.

- Working pixel `width`, `height`
- full Original `originalWidth`, `originalHeight`
- ROI source일 때 `originalRoi: { x, y, width, height }`
- 실제 픽셀을 식별하는 `cacheKey`

예를 들어 Original ROI가 `(x=100, y=150, width=300, height=200)`이고 CFSR x2라면 Working ROI는 `600×400`이다. Working `(200,100)`은 ROI 내부 Original `(100,50)`, full Original `(200,200)`으로 복원한다. 배율은 descriptor의 실제 크기로 계산한다.

Working mask는 Original ROI 크기로 nearest-neighbor 복원한 뒤 full Original 크기의 빈 mask에서 ROI 위치에만 기록한다. ROI 밖은 변경하지 않는다. Superpixel label map도 같은 원칙으로 full Original grid에 복원하고 ROI 밖은 선택 불가 값으로 둔다.

## 6. 단계별 계획 및 진척도

| 단계 | 작업 | 상태 | 현재 검증 근거 |
| --- | --- | --- | --- |
| 1 | SR ROI 선택 및 정확한 RGBA crop | 완료 | `(1,1,2,2)` ROI가 원본 pixel index `[5,6,9,10]`만 SR service에 전달되는 unit |
| 2 | ROI에만 CFSR x2/x4 적용 및 cache | 완료 | 2×2 ROI→x2 4×4, x4 8×8 service input/output 계약; 300×200→600×400 descriptor unit |
| 3 | Original 좌표를 유지한 고해상도 SR ROI layer preview | 완료 | unit에서 natural x2/x4 source 크기와 0.5/0.25 배치 scale 검증; E2E에서 Original base 크기 및 annotation 편집 좌표 유지 |
| 4 | Algorithm Input 4종 및 도구별 독립 상태 | 완료 | UI option E2E와 EdgeSAM/Superpixel source 독립 workflow unit |
| 5 | EdgeSAM/Superpixel의 SR ROI 입력 | 완료 | EdgeSAM prompt의 ROI Working 변환, Superpixel ROI 밖 선택 거부 workflow unit |
| 6 | SR mask/region을 Original에 복원 | 완료 | SR ROI mask가 full Original mask의 ROI 위치에만 기록되고 기존 Original document에 적용되는 unit/E2E |
| 7 | 전체 회귀 및 배포 자산 검증 | 완료 | typecheck/build, unit 59 files·357 tests, Chromium E2E 22 tests, diff 검사 통과 |
| 8 | SR 효과 가시화 및 즉시 비교 | 완료 | E2E에서 x2 자동 200% focus, Hold Original press/release, 기존 상단 Fit to screen 복귀, Original→SR 해상도 표시 검증 |
| 9 | ROI 조작·상태 UI 분리 및 Reset ROI | 완료 | Select/Reset 조작 행과 상태 정보 행 분리, Focus/Hold 2열 배치, workflow reset의 annotation/history 보존 unit 및 900px overflow E2E 검증 |

## 7. UI 사용자 흐름

```text
SR ROI 클릭
  ↓ ROI가 없으면
Original image에서 ROI Drag
  ↓
x2 또는 x4 선택
  ↓
선택 ROI만 CFSR 실행 및 cache
  ↓
Original 위 고해상도 SR ROI layer + ROI 자동 확대
  ↓
Hold Original로 전/후 즉시 비교 또는 Full image로 복귀
  ↓
필요 시 Processing Input을 SR ROI로 선택
  ↓
EdgeSAM 또는 Superpixel의 Algorithm Input 4종 중 독립 선택
  ↓
결과를 Original 좌표로 복원하여 기존 형식으로 저장
```

Canvas View의 `Original / SR ROI / Processed`는 한 행에 표시한다. ROI 재선택 시 기존 annotation 좌표와 document 크기는 유지하고, 활성 SR/source 상태만 안전하게 Original로 되돌린다.

## 8. 완료 체크리스트

- [x] SR 적용 후 확대 결과의 좌상단 일부만 보이는 문제 제거
- [x] Canvas와 annotation의 Original 크기/좌표 유지
- [x] SR ROI를 사전 축소 합성하지 않고 실제 x2/x4 해상도 layer로 표시
- [x] x2 200% / x4 400% ROI 자동 focus
- [x] Hold Original press-and-hold 비교 및 기존 상단 Fit to screen 복귀
- [x] Original ROI와 CFSR 결과 해상도 수치 표시
- [x] SR 전용 Full image 중복 버튼 제거 및 기존 상단 Fit to screen 유지
- [x] Select ROI / Reset ROI 조작 행과 ROI·해상도 상태 행 분리
- [x] Reset ROI 시 SR 파생 상태만 초기화하고 annotation/mask/history 보존
- [x] ROI Drag 및 실제 crop 좌표 일치
- [x] ROI에만 CFSR x2/x4 실행 및 ROI/mode cache
- [x] Original Processed와 SR ROI Processed 분리
- [x] EdgeSAM 입력 4종과 독립 상태
- [x] Superpixel 입력 4종과 독립 상태
- [x] EdgeSAM/Superpixel 결과의 ROI 범위 제한
- [x] SR ROI mask/region의 Original 좌표 복원
- [x] 기존 segmentation document 및 저장 형식 유지
- [x] 전체 unit/E2E, typecheck, build, diff 검사 최종 통과

완료 표시는 실제 코드와 해당 범위를 직접 증명하는 검증이 모두 통과한 경우에만 갱신한다.
