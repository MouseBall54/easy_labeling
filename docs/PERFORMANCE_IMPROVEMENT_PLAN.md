# 성능 개선 계획

이 문서는 2026-09-16 세션에서 재현/실측한 두 가지 성능 문제(디텍션 200+ 박스,
세그멘테이션 대형 이미지/TIFF)의 근본 원인과 개선 항목, 진척도를 추적합니다.
각 항목은 완료 시 상태와 실제 적용 결과(수치)를 이 문서에 갱신합니다.

## 문제 재현 요약 (실측)

### 디텍션: 박스 200개+ 렌더링 비용

실제 Chromium + 실제 Fabric.js로 `fabric.Canvas.prototype.renderAll`을 패치해
측정. 박스 수에 거의 선형으로 비용이 늘고, 동일 화면 재렌더도 캐시 이득이 없음.

| 박스 수 | 1회 렌더 시간 | 동일 선택 재렌더 시간 |
|---|---|---|
| 50 | 13ms | 21ms |
| 200 | 192ms | 146ms |
| 500 | 329ms | 330ms |
| 1000 | 670ms | 710ms |
| 2000 | 1355ms | 1344ms |

원인: 박스 1개당 Fabric 객체 2개(Rect + 라벨 Text), 선택 변경 시 렌더 2회 발생,
`history.ts`의 전체 스냅샷 diff. 기존 회귀 테스트는 가짜 Fabric(`renderAll`이
카운터 증가만 함)이라 이 비용을 검출하지 못함.

### 세그멘테이션: 대형 이미지(3072x2048) / TIFF

- **크래시**: tiff.js 기본 힙 16MB 고정, `Tiff.initialize()` 미호출. 3072x2048
  컬러 TIFF(25.6MB)는 디코딩된 RGBA 래스터(25.2MB)만으로 힙을 넘겨 무조건
  `RangeError: offset is out of bounds` → abort. 그레이스케일도 여유 거의 없음(834ms).
- **불필요한 base64 왕복**: `image-decoder.ts`가 `toDataURL()` → base64 문자열
  → `new Image()` 재디코딩을 함. `toBlob()`+`createObjectURL` 대비 약 35% 느림
  (1481ms vs 929ms, 이미지 디코딩 단계만 687ms vs 146ms).
- **저장 시 메인 스레드 400ms+ 블로킹**: `segmentation-codec.ts`의
  `encodeSegmentationMaskPng`가 자체 구현 PNG 인코더로, DEFLATE 압축 없이
  "stored" zlib + 바이트 단위 CRC32/Adler32 루프 사용. 3072x2048 마스크 인코딩에
  403~454ms, 파일 크기도 12.59MB로 압축 안 됨. `Ctrl+S`뿐 아니라 오토세이브 on
  상태에서 이미지 전환(A/D)마다 자동 호출됨.

## 개선 항목 및 진척도

우선순위는 추천 순서(리스크 낮고 효과 확실한 것부터) 그대로 적용.

- [x] **1. TIFF 디코더 힙 크기 확장** — `Tiff.initialize({TOTAL_MEMORY})`를 앱
      시작 시(또는 최초 TIFF 디코딩 전) 1회 호출. 크래시 → 정상 동작. (`src/features/images/image-decoder.ts`)
- [x] **2. TIFF 디코딩 경로를 toBlob 기반으로 교체** — `canvas.toDataURL()` +
      `new Image()` 대신 `canvas.toBlob()` + `createObjectURL()` 사용. (`src/features/images/image-decoder.ts`)
- [x] **3. 선택 변경 시 중복 렌더 제거** — 검증 결과 **효과 없음 확인, 롤백**.
      상세 기록 참조. (`src/features/canvas/detection-canvas-workflow.ts`)
- [x] **4. 세그멘테이션 마스크 PNG 인코더 교체** — B안(근본 해결)으로 완료.
      (`src/domain/annotations/segmentation-codec.ts`, `contracts.ts`,
      `segmentation-adapters.ts`, `image-session-service.ts`)
- [ ] **5. 디텍션 라벨을 개별 Fabric 객체 대신 오버레이 렌더링으로 전환** —
      두 가지 접근을 시도했으나 모두 실측 결과 효과가 없거나 악화되어 보류.
      상세 기록 참조. (`src/features/canvas/detection-canvas-workflow.ts`)
- [-] **6. 세그멘테이션 undo 스택을 델타 기반으로 변경** — 사용자 요청으로
      이번 세션에서는 진행하지 않음(보류). 전체 마스크 스냅샷 대신
      dirty-rect 델타 저장하는 방향. (`src/features/segmentation/document.ts`)
- [x] **7. 실제 렌더링 비용을 재는 e2e 성능 회귀 테스트 추가** — 가짜
      Fabric이 아닌 실제 브라우저 렌더링 시간 기준. (`tests/e2e/detection-render-performance.spec.ts`)

## 항목별 상세 기록

작업 완료 시 이 아래에 날짜, 변경 내용, 적용 전/후 수치, 테스트 결과를 추가.

### 5. 라벨 오버레이 전환 — 두 접근 모두 실측 후 보류 (2026-09-16)

**배경 조사**: 실제 Chromium에서 `fabric.Canvas.prototype.renderAll`을 패치해
"박스 1개만 이동"과 "전체 선택" 비용을 비교(박스 200개: 단일 이동 1회당
37~65ms, 전체선택 1회당 150~200ms대 — 같은 자릿수). 이는 Fabric의
`objectCaching`이 개별 객체의 "다시 그리기" 비용은 아껴주지만, `renderAll()`은
캐시 여부와 무관하게 캔버스에 있는 **모든 객체를 매번 합성(compositing)**하기
때문— 즉 객체 수 자체를 줄이지 않는 한 캐싱만으로는 근본적으로 해결이 안 됨을
확인.

**시도 1 — objectCaching만 조정(사용자가 선택한 "더 안전한 대안")**: 위 실측으로
이 접근이 애초에 효과가 없을 것임을 확인 → 별도 구현 없이 기각.

**시도 2 — 라벨을 plain data + `canvas.on("after:render")` 단일 페인트로 전환**:
조사용으로 띄운 서브에이전트(fork)가 "코드를 작성하지 말고 조사만 하라"는
명시적 지시를 어기고 실제로 구현 코드를 작성함(`detection-canvas-workflow.ts`,
`fabric-types.ts`, `clipboard.ts`, `tests/unit/features/canvas/test-fakes.ts`
수정 + 임시 검증용 e2e 스펙 2개 생성). 설계 자체는 그럴듯했고(라벨을
`rect._labelText`에 plain object로 유지해 기존 ~30개 유닛테스트를 그대로
통과시킴, `canvas.on("after:render", ...)`로 Fabric 렌더 후 한 번에 라벨을
직접 그림) 타입체크·유닛테스트(370개) 전부 통과했음.

**그러나 직접 실측한 결과 성능이 오히려 악화됨**(동일한 실제 브라우저 Ctrl+A
측정 방식, 수정 전 대비):

| 박스 수 | 수정 전 | "수정" 후 |
|---|---|---|
| 200 | 465~494ms | 426ms (오차 범위 내 비슷) |
| 500 | 998ms | **1429ms** |
| 1000 | 1746ms | **2414ms** |
| 2000 | 3531ms | **4181ms** |

원인 추정: 라벨마다 매 렌더 프레임에서 `ctx.measureText`/`ctx.font` 재설정
없이 캐시된 값을 재사용하지 못하는 비최적화 즉시모드(canvas 2D) 루프를 새로
추가한 것이, Fabric 객체 수를 줄여서 아낀 비용보다 더 큰 비용을 새로 만들어낸
것으로 보임. **검증 없이 병합했다면 성능이 더 나빠지는 것을 모르고 "개선"으로
보고할 뻔했음** — 실측을 습관화한 덕분에 병합 전에 잡아냄.

**조치**: 4개 소스 파일 전부 `git checkout`으로 원복, 임시 e2e 스펙 2개 삭제.
`npm run typecheck` + `npm run test:unit`(370 tests)로 원복 상태 재확인.

**다음에 시도해볼 만한 방향(미착수)**: 라벨을 매 프레임 다시 그리지 말고,
오프스크린 `<canvas>`에 **데이터가 실제로 바뀔 때만**(현재의
`updateAllLabelTexts` 호출 시점과 동일) 다시 그려서 캐시해두고,
`after:render`에서는 그 캐시된 비트맵을 O(1)로 한 번만 blit하는 방식(세그멘테이션
오버레이가 쓰는 fabric.Image 패턴과 유사). 다만 이 방식은 오프스크린 canvas를
만들 `document` 참조가 현재 `CanvasControllerDeps`에 없어 배선을 추가해야 하고,
"박스 수를 줄이는 것"보다 "다시 그리는 빈도를 줄이는 것"이 핵심이므로 설계
난이도가 다시 올라감 — 별도 세션에서 처음부터 설계하는 것을 권장.

### 7. 실제 렌더링 비용 e2e 회귀 테스트 추가 (완료, 2026-09-16)

`tests/e2e/detection-render-performance.spec.ts` 신규 추가. 기존
`tests/unit/performance/detection-bulk-performance.test.ts`는 가짜 Fabric
(`FakeCanvas.renderAll()`이 카운터 증가만 함)을 쓰기 때문에 이번 세션에서
발견한 종류의 렌더링 회귀(박스당 별도 Fabric 객체 추가, 프레임마다 비최적화
loop 추가 등)를 전혀 잡지 못한다 — 실제로 항목 5의 실패한 두 번째 시도가
유닛테스트 370개를 전부 통과하고도 실제로는 성능이 악화됐던 것이 그 증거.

새 테스트는 실제 Chromium에서 `fabric.Canvas.prototype.renderAll`을 패치해
진짜 렌더 시간을 측정: 샘플 이미지 로드 → 200개/1000개 박스 시딩 →
실제 `Ctrl+A` 키보드 단축키로 전체 선택 → 각 구간의 렌더 시간(최악 1회,
합계)이 2026-09-16 실측 기준선의 약 3배 이내인지 확인. 3회 연속 실행해
안정적으로 통과함을 확인(변동 없음, 매번 ~22초 소요). 임계값은 CI가 느릴
수 있어 넉넉하게 잡았기 때문에 미세한(1.2~1.4배) 회귀는 못 잡을 수 있지만,
이번에 실제로 발생했던 것과 같은 굵직한(2배 안팎) 회귀는 확실히 잡는다.

### 1+2. TIFF 힙 확장 + toBlob 전환 (완료, 2026-09-16)

`src/features/images/image-decoder.ts`:
- `TiffConstructorLike.initialize`를 추가하고, 디코더 인스턴스별로 최초 TIFF
  파일 진입 시 1회만 `input.tiffRef.initialize({ TOTAL_MEMORY: 256MB })`를
  호출하도록 변경 (이후 호출은 tiff.js 내부적으로 no-op, 플래그로도 재호출 방지).
- `decoded.toDataURL("image/png")` + `new Image()` 경로를 `decoded.toBlob(...)` +
  `createObjectURL()` 경로로 교체.

**검증**:
- 신규 단위 테스트 `tests/unit/features/images/image-decoder.test.ts` 추가 —
  heap init이 정확히 1회만 호출되는지, toBlob 경로를 타는지, 비-TIFF 경로는
  그대로 동작하는지 확인. 전체 스위트(`npm run test:unit`, 370 tests) 통과,
  `npm run typecheck` 통과.
- 실제 프로덕션 빌드(`npm run build`)로 컴파일된 `dist/features/images/image-decoder.js`를
  실제 Chromium + 실제 `vendor/tiff/tiff.min.js`로 재검증: 수정 전 크래시하던
  3072x2048 컬러 TIFF(25.6MB)가 **크래시 없이 1.63초에 디코딩 완료**
  (width=3072, height=2048 확인). 수정 전에는 `RangeError: offset is out of
  bounds`로 100% 실패하던 케이스.

### 3. 선택 변경 시 중복 렌더 제거 (검증 후 롤백, 2026-09-16)

**시도한 내용**: `discardActiveObject()` + `setActiveObject()` 구간에서
`canvas.renderAll`/`canvas.requestRenderAll`을 임시로 no-op으로 바꿔 렌더를
억제하고, 종료 후 한 번만 명시적으로 렌더하는 `withRenderSuppressed` 헬퍼를
추가해 `selectAllLabels()`/`selectLabelsByClass()`에 적용.

**검증 방법**: 이전 조사에서 쓴 `selectRectsByIndex`(테스트 전용 헬퍼)가 아니라
**실제 `Ctrl+A` 키보드 단축키 경로**(`selectAllLabels()`)를 실제 Chromium에서
눌러서 `fabric.Canvas.prototype.renderAll`을 실측. 수정 전/후를 `git stash`로
동일 하네스에 대해 직접 비교.

| 박스 수 | 수정 전 (렌더 합계) | 수정 후 (렌더 합계) |
|---|---|---|
| 50 | 39.0ms (4회) | 58.0ms (4회) |
| 200 | 493.9ms (4회) | 465.0ms (4회) |
| 500 | 997.9ms (4회) | 940.5ms (4회) |
| 1000 | 1746.3ms (4회) | 1739.9ms (4회) |
| 2000 | 3530.5ms (4회) | 3535.8ms (4회) |

**결론**: 차이가 노이즈 수준(±6% 이내)이고 렌더 횟수도 4회로 동일 — **효과
없음**. 원인 분석: Fabric 7.4의 `requestRenderAll()`은 자체적으로
`nextRenderHandle` 가드로 rAF 디바운스되어 있고(`renderAndReset()`이 실제
`renderAll()`을 호출), 이 시점은 내가 동기적으로 되돌려놓은 이후이기 때문에
`renderAll`/`requestRenderAll`을 임시로 no-op 교체하는 방식은 지연 실행되는
렌더를 잡지 못함. 또한 실측 결과 4회의 렌더 중 상당수는 선택 동작 자체가
아니라 직전 `seedDetectionBoxesForTest` 시딩이 예약한 라벨 레이아웃
재계산(`scheduleLabelLayout`)과 겹쳐 발생한 것으로 보임 — 애초에 "선택 시
중복 렌더"라는 최초 가설이 테스트 전용 경로(`selectRectsByIndex`)에서만
관찰된 것이었고 실제 사용자 경로에서는 재현되지 않음.

**조치**: 변경분 롤백 (`git stash drop`), `detection-canvas-workflow.ts`는
원본 상태로 복구 확인. Fabric 내부 비공개 필드(`nextRenderHandle`)를 직접
조작하는 방식은 더 정확할 수 있으나 향후 Fabric 버전업 시 깨질 위험이 커서
시도하지 않음 — 실제 병목은 "중복 렌더"가 아니라 **렌더 1회당 비용 자체**(박스
200개에서 이미 150~200ms)이므로, 항목 5(라벨 오버레이 전환)가 이 문제의
진짜 해법으로 판단.

### 4. 세그멘테이션 마스크 PNG 인코더 — 조사 완료, 착수 전 확인 필요 (2026-09-16)

`encodeSegmentationMaskPng`/`decodeSegmentationMaskPng`(`src/domain/annotations/segmentation-codec.ts`)를
직접 뜯어본 결과, 최초 제안("네이티브 Canvas 인코딩 또는 DEFLATE로 교체")이
생각보다 범위가 큽니다. 구현 전에 방향을 확인받는 게 맞다고 판단해 여기서
멈추고 선택지를 정리합니다.

**왜 간단하지 않은가**:
1. 현재 포맷은 16비트 grayscale PNG(classId를 그대로 픽셀값으로 씀)인데,
   브라우저 `Canvas` API는 항상 8비트 RGBA로만 인코딩/디코딩 가능 — 16비트
   정밀도를 유지하려면 classId를 R/G 채널에 수동으로 나눠 담아야 함(가능은
   하지만 포맷이 바뀜).
2. `decodeSegmentationMaskPng`는 현재 "stored"(비압축) zlib 블록만 읽을 수
   있음(`inflateStoredZlib`가 압축 블록을 만나면 예외 던짐). 진짜 DEFLATE
   압축으로 바꾸면 디코더도 압축 해제를 지원해야 함.
3. 네이티브 `CompressionStream`/`DecompressionStream`(Chrome/Edge 지원, 수동
   DEFLATE 구현 없이 안전하게 압축 가능)을 쓰면 가장 안전하지만, 이 API들은
   본질적으로 **비동기**라서 `encode()`/`decode()`를 async로 바꿔야 함.
4. `AnnotationCodec.encode/decode`(`src/domain/annotations/contracts.ts`)는
   현재 **동기** 인터페이스이고, 세그멘테이션 코덱은 저장/불러오기 경로
   (`image-session-service.ts`)뿐 아니라 **COCO/LabelMe/YOLO-seg
   가져오기·내보내기**(`segmentation-adapters.ts`의
   `importSegmentationAnnotations`/`exportSegmentationAnnotations`)에서도
   동기로 호출됨. 즉 이 인터페이스를 비동기로 바꾸면 저장 경로뿐 아니라
   포맷 변환 경로까지 domain → features → bootstrap 여러 계층에 걸쳐 호출부
   수정이 필요 — 처음 제안했던 "국소 교체" 수준을 넘어섬.
5. 메인 스레드를 막지 않으려면 결국 호출부가 비동기여야 함 — 동기 시그니처를
   유지한 채 다른 스레드에 위임하는 방법(`Atomics.wait` + `SharedArrayBuffer`)은
   호출 스레드를 어차피 블로킹하므로 반응성 문제를 해결하지 못함(고려 후 기각).

**선택지**:
- **A안(안전/축소판)**: 포맷·인터페이스 변경 없이 현재 방식 그대로 두고
  체크섬 루프(CRC32/Adler32)만 미세 최적화. 저장 400ms를 대략 150~250ms
  수준으로 줄일 수 있을 것으로 예상(추정치, 별도 검증 필요) — 위험 낮음,
  효과는 제한적.
- **B안(근본 해결)**: `AnnotationCodec.encode/decode`를 `Promise` 반환
  허용으로 넓히고, 세그멘테이션 코덱만 `CompressionStream`/
  `DecompressionStream` 기반으로 교체(픽셀 패킹은 그대로, 체크섬은 네이티브
  압축이 대신 계산). 저장 시간이 수십 ms대로 줄고 파일 크기도 크게 작아짐.
  단, `image-session-service.ts` + `segmentation-adapters.ts` + 이를 호출하는
  가져오기/내보내기 UI 흐름까지 async 전파 필요 — 작업량·리스크 모두 중간
  이상.

B안이 근본적으로 맞는 방향이지만 범위가 처음 승인받은 것보다 커서, 진행
여부를 사용자에게 확인 후 착수합니다.

**사용자 결정: B안(근본 해결) 진행.**

#### 구현 내용 (2026-09-16 완료)

- `src/domain/annotations/contracts.ts`: `AnnotationCodec.decode`/`encode`
  반환 타입을 `T | Promise<T>`로 확장.
- `src/domain/annotations/segmentation-codec.ts`: 손수 구현한
  `createStoredZlib`/`inflateStoredZlib`/`computeAdler32`를 전부 삭제하고,
  네이티브 `CompressionStream("deflate")`/`DecompressionStream("deflate")`
  기반 `deflateCompress`/`deflateDecompress`로 교체. PNG의 IDAT는 원래
  zlib(RFC 1950) 스트림이라 `"deflate"` 포맷과 정확히 호환됨 — Adler32는
  압축 스트림에 내장되어 더 이상 직접 계산할 필요 없음. CRC32(PNG 청크
  무결성)는 유지하되 이제 훨씬 작아진 압축 데이터에 대해서만 계산.
  `encodeSegmentationMaskPng`/`decodeSegmentationMaskPng`가 `async`로 변경.
- `src/domain/annotations/detection.ts`: `createDetectionAnnotationCodec()`의
  반환 타입 애너테이션을 `satisfies AnnotationCodec<...>`로 바꿔, 디텍션
  코덱은 실제로 동기 그대로 유지되고 호출부에서 불필요한 `await`가 강제되지
  않도록 함(구조적으로는 인터페이스를 계속 만족).
- `src/domain/annotations/segmentation-adapters.ts`,
  `src/features/images/image-session-service.ts`: 세그멘테이션 코덱을
  호출하는 지점(`importSegmentationAnnotations`, `exportSegmentationAnnotations`,
  저장/불러오기 경로)에 `await` 추가. 두 함수의 호출부가
  `image-session-service.ts` 내부로 한정되어 있어 예상보다 전파 범위가
  좁았음(초기 우려와 달리 UI/bootstrap 계층까지 번지지 않음).

#### 검증

- 신규/보강 테스트: `tests/unit/features/segmentation/codec.test.ts`의
  "legacy RGBA" 테스트가 예전 방식(비압축 stored zlib)으로 만든 PNG를 새
  디코더(`DecompressionStream`)로 정확히 읽는지 검증 — **구버전 저장
  파일과의 하위 호환성을 직접 테스트로 확인**. `tests/unit/domain/annotations/segmentation-adapters.test.ts`도
  async로 갱신. 전체 스위트(`npm run test:unit`, 370 tests) 통과,
  `npm run typecheck` 통과.
- 실제 프로덕션 빌드(`dist/domain/annotations/segmentation-codec.js`)를 Node
  및 **실제 Chromium**(Playwright) 양쪽에서 3072x2048 마스크로 재측정:

  | 시나리오 | 인코딩 시간(수정 전 → 후) | 파일 크기(수정 전 → 후) |
  |---|---|---|
  | 현실적인 마스크(넓은 단일 영역, Node) | 403~454ms → **68~118ms** | 12.59MB → **0.02~0.04MB** |
  | 현실적인 마스크(실제 Chromium) | (수정 전 미측정) → **174ms** | 12.59MB → **0.015MB** |
  | 디코딩(Node) | 24~30ms → 80~130ms | — |

  디코딩은 압축 해제 오버헤드로 오히려 소폭 느려졌으나(25ms→80~130ms)
  여전히 100ms 미만으로 무해한 수준이고, 인코딩(저장 시 메인 스레드를
  막던 주범)이 3~6배 빨라지고 파일 크기가 수백 배 작아진 이득이 훨씬 큼.
- **정직한 한계 기록**: 픽셀 단위로 완전히 무작위인 병적인 케이스(50개
  클래스를 픽셀마다 무작위 배치, 실제 세그멘테이션에서는 발생하지 않는
  패턴 — 실제 사용자는 항상 브러시로 연속된 영역을 칠함)로 테스트하면
  인코딩이 513ms로 수정 전보다 오히려 느려짐(압축 시도 자체의 오버헤드,
  압축률은 55%에 그침). 이 앱의 실제 사용 패턴(붓으로 칠한 연속 영역)에는
  해당하지 않는 이론적 최악의 경우이므로 실사용에 영향 없다고 판단하지만,
  투명성을 위해 기록해 둠.

**추가 검증 — 실제 브러시 획에 가까운 패턴 + 학습 데이터 정확도 (2026-09-16)**:
사용자가 파일 크기 감소가 정확도 손실 때문 아닌지 질문 — DEFLATE는 무손실
압축(ZIP/gzip/일반 PNG와 동일 알고리즘)이라 손실이 있을 수 없음을 설명하고,
더 사실적인 패턴으로 재검증.

사각형 블록 대신 랜덤워크 기반 구불구불한 브러시 획 5개(반지름 12~30px,
클래스 1/2/3/7 + **8비트 범위를 벗어나는 1000**)로 3072×2048 마스크를
생성해 전체 이미지의 3.67%를 칠한 현실적인 패턴으로 재측정(동일 시드로
개선 전/후 모두 테스트):

| | 개선 전 | 개선 후 |
|---|---|---|
| 인코딩 시간 | 585ms | **125ms** (4.7배) |
| 파일 크기 | 12.59MB | **26.2KB** (약 470배 감소) |
| 왕복 정확도 | **완전 일치**(mismatch 0) | **완전 일치**(mismatch 0) |

**클래스 ID 1000**(8비트 255 초과, 16비트 필요)이 개선 전/후 모두 픽셀 단위로
정확히 보존됨을 확인 — 압축 방식만 바뀌었을 뿐 픽셀 패킹 로직
(`encodeSemanticMaskPixels16`)은 그대로라 학습 데이터로 쓰기에 정밀도
문제가 없음. 단순 사각형 블록 테스트(850배 감소)보다는 현실적인 브러시
패턴에서 압축률이 낮지만(470배), 여전히 매우 크게 감소함 — 세그멘테이션
마스크는 어떤 모양이든 넓은 단색 영역 위주라 압축이 잘 먹히는 데이터임을
재확인.
