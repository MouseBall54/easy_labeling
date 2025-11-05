# Easy Labeling TypeScript 마이그레이션 기능 점검 (2024-09-21)

## 개요
- 기준 소스: `public/` 하위의 기존 번들 자바스크립트와 `src/` 하위 TypeScript 마이그레이션 코드.
- 점검 목적: 현재 TypeScript 리팩토링에서 정상 동작하는 기능과 미구현/부분 구현 상태를 식별.
- 방법: 주요 모듈(`src/ui/UIManager.ts`, `src/controllers`, `src/services`, `src/models`, `src/main.ts`) 정적 분석 및 원본 기능 목록 대비.

## 구현 현황 요약
| 영역 | 기능 | 상태 | 근거 |
| --- | --- | --- | --- |
| 파일/폴더 | 이미지·라벨 폴더 선택 | 구현 | 버튼 이벤트에서 FileSystemService 호출 및 상태 갱신 (`src/ui/UIManager.ts:977-1039`) |
| 파일/폴더 | 클래스 폴더/파일 로드·편집 | 미구현 | 핸들 저장 외에 리스트/모달 연동 없음, `classFileSelect` 등 이벤트 부재 (`src/ui/UIManager.ts:1042-1047`, `src/ui/UIManager.ts:134-210`) |
| 이미지 탐색 | 이미지 리스트 렌더링 | 부분 구현 | 폴더 선택 시 목록 갱신 및 클릭 로드 동작 (`src/ui/UIManager.ts:641-723`), 단 검색·필터 반영 안 됨 |
| 이미지 탐색 | 검색/라벨 상태 필터 | 미구현 | UI 요소 존재하나 이벤트/필터 로직 없음 (`src/ui/UIManager.ts:140-152`, `src/ui/UIManager.ts:934-949`) |
| 이미지 탐색 | 하단 미리보기 바 | 미구현 | DOM 요소만 준비, 렌더/네비게이션 로직 없음 (`src/ui/UIManager.ts:186-207`, 전역에서 미사용) |
| 캔버스 | 캔버스 초기화·이미지 로드·줌/팬 | 구현 | Fabric 캔버스 생성, 리사이즈, 줌/팬 동작 (`src/controllers/CanvasController.ts:108-410`, `src/controllers/CanvasController.ts:780-862`) |
| 캔버스 | 박스 그리기/이동/삭제 | 부분 구현 | 그리기 및 변형은 가능 (`src/controllers/CanvasController.ts:440-705`, `src/controllers/CanvasController.ts:1240-1264`), 클래스 지정/라벨 리스트 연동 부재 |
| 라벨 관리 | 라벨 리스트·정렬·필터 | 미구현 | `updateLabelList` 정의되었으나 호출 경로 없음, 정렬/필터 버튼 이벤트 미연결 (`src/ui/UIManager.ts:727-823`, `src/ui/UIManager.ts:166-179`) |
| 라벨 관리 | 클래스 선택 모달/컨텍스트 메뉴 | 미구현 | 모달/컨텍스트 UI만 존재, 표시 트리거·저장 로직 없음 (`src/ui/UIManager.ts:186-221`, `src/controllers/EventManager.ts:328-420` 전용 이벤트 수신자 부재) |
| 라벨 관리 | 클래스 YAML 파싱 & 매핑 | 부분 구현 | FileSystemService에 파싱 로직 존재 (`src/services/FileSystemService.ts:189-370`), UI에서 호출되지 않음 |
| 데이터 저장 | 수동 저장 (Save Labels) | 구현 | 버튼이 YOLO 변환 후 저장 호출 (`src/ui/UIManager.ts:1112-1139`) |
| 데이터 저장 | 자동 저장 | 부분 구현 | 토글은 상태만 변경 (`src/ui/UIManager.ts:1073-1075`, `src/models/AppState.ts:321-333`), 캔버스 이벤트와 연동되지 않아 실질 동작 없음 |
| UX | 다크 모드, 패널 토글·리사이즈 | 구현 | 토글/스플리터 이벤트 구현 (`src/ui/UIManager.ts:628-708`, `src/ui/UIManager.ts:104-208`, `src/ui/UIManager.ts:1085-1104`) |
| UX | 이미지 좌표 입력, 줌 입력 | 구현 | 좌표/줌 입력 이벤트로 CanvasController 호출 (`src/ui/UIManager.ts:1142-1156`) |
| 입력 | 키보드 단축키 | 부분 구현 | EventManager에서 바인딩 (`src/controllers/EventManager.ts:80-266`), UI 반영/라벨 작업 관련 동작 미완 |
| 입력 | 드래그 & 드롭 | 부분 구현 | 이미지 로드까지만 수행, AppState/라벨 상태 미반영 (`src/controllers/EventManager.ts:427-479`) |
| 상태 연동 | 컴포넌트 간 이벤트 브리지 | 미구현 | `App.setupCrossReferences`가 비어 있고 (`src/main.ts:86-92`), AppState 이벤트 명 불일치 (`image:current-changed` vs `image:selected`, `src/models/AppState.ts:212-227`, `src/main.ts:103`) |

## 상세 분석

### 1. 파일/폴더 및 IO
- **이미지/라벨 폴더 선택**: UI 버튼이 `FileSystemService`의 `selectImageFolder`, `selectLabelFolder`를 호출하고 `AppState`를 업데이트한다 (`src/ui/UIManager.ts:977-1040`). 이미지 목록 렌더링과 기본 라벨 폴더 자동 탐색은 동작.
- **클래스 정보**: `selectClassInfoFolder` 호출로 핸들을 저장하지만 후속 동작이 없다 (`src/ui/UIManager.ts:1042-1047`). `FileSystemService`에 있는 `listClassFiles`, `loadClassFile`, `saveClassFile` 등은 UI에서 사용되지 않는다.

### 2. 이미지 리스트 & 탐색
- **리스트 표시**: `renderImageList`는 목록과 라벨 여부 뱃지를 표시한다 (`src/ui/UIManager.ts:641-680`).
- **검색/필터**: `imageSearchInput`, `showLabeledCheckbox`, `showUnlabeledCheckbox`는 DOM 매핑만 있고 이벤트가 없어 동작하지 않는다 (`src/ui/UIManager.ts:140-152`, `src/ui/UIManager.ts:934-949`).
- **미리보기 바**: DOM 요소만 존재하며, 프리뷰 이미지 생성·스크롤 로직이 빠져 있다 (`src/ui/UIManager.ts:186-207`).

### 3. 캔버스 & 어노테이션
- **기본 조작**: 캔버스 초기화, 이미지 로드, 줌/팬, 교차선 토글 등은 구현되어 있다 (`src/controllers/CanvasController.ts:108-410`, `src/controllers/CanvasController.ts:780-940`).
- **박스 편집**: 드로잉/수정/삭제는 가능하지만, 새 박스에 클래스가 기본값 0으로 고정되고 사용자 입력 경로가 없다 (`src/controllers/CanvasController.ts:440-609`). 클래스 변경을 위한 모달/컨텍스트 메뉴 연동이 누락되어 있다.
- **라벨 업데이트 이벤트**: `CanvasController`는 `object:added`, `object:modified` 등을 디스패치하지만 이를 수신해 UI를 갱신하는 코드가 없다 (`src/controllers/CanvasController.ts:574-607`).

### 4. 클래스·라벨 관리
- **라벨 리스트/정렬/필터**: `updateLabelList`가 정의되었지만 어떤 곳에서도 호출되지 않아 우측 라벨 패널이 비게 된다 (`src/ui/UIManager.ts:727-775`). 정렬 버튼/필터 버튼도 이벤트가 없음 (`src/ui/UIManager.ts:166-179`).
- **클래스 선택 워크플로**: `labelClassModal`, `class-selection-container`, 컨텍스트 메뉴 등 UI 스켈레톤은 존재하지만, 열기·저장·레이블 반영 로직이 구현되지 않았다 (`src/ui/UIManager.ts:186-221`, `src/controllers/EventManager.ts:328-420`).
- **YOLO 클래스 매핑**: `FileSystemService`가 `.yaml`을 파싱해 `ClassDefinition`을 제공할 준비는 되었으나 (`src/services/FileSystemService.ts:189-370`), `AppState`와 UI가 이를 사용하지 않아 클래스 이름 표시가 동작하지 않는다.

### 5. UX 및 부가 기능
- **토스트/알림**: `showSuccessToast`, `showErrorToast`는 버튼 액션에서 부분적으로 사용 중 (`src/ui/UIManager.ts:1112-1139`, `src/ui/UIManager.ts:1012-1013`).
- **자동 저장 토글**: 상태 플래그는 업데이트되나 (`src/models/AppState.ts:321-333`), 캔버스 이벤트와 연결되어 있지 않아 실질적인 자동 저장이 이루어지지 않는다.
- **다크 모드/패널 제어**: 정상 동작 (테마 토글 `src/ui/UIManager.ts:628-635`, 스플리터 `src/ui/UIManager.ts:700-835`).

### 6. 이벤트/상태 연동 문제
- **App 초기화**: `App.setupCrossReferences`가 구현되지 않아 UIManager, EventManager, CanvasController 간 교차 참조·구독 설정이 전혀 이루어지지 않는다 (`src/main.ts:86-92`).
- **이벤트 명 불일치**: `AppState.setCurrentImage`는 `image:current-changed` 이벤트를 발행하지만 `App.setupApplicationEvents`는 `image:selected`를 구독하고 있어 콜백이 실행되지 않는다 (`src/models/AppState.ts:212-227`, `src/main.ts:103`).
- **EventManager ↔ UI 연결**: 컨텍스트 메뉴, 단축키 결과 등 `EventManager`가 디스패치하는 이벤트를 UI가 수신하지 않는다 (`src/controllers/EventManager.ts:245-420`, `src/ui/UIManager.ts` 내 대응 핸들러 부재). 따라서 단축키로 이미지 전환 시 리스트 하이라이트가 바뀌지 않고, 컨텍스트 메뉴도 표시되지 않는다.

## 주요 리스크 및 추천 작업
1. **컴포넌트 연결 로직 구현**  
   - `App.setupCrossReferences`에서 UIManager ↔ EventManager ↔ CanvasController 간 이벤트 구독을 명시적으로 설정해야 함.  
   - 이벤트 명 통일 (`image:current-changed` → `image:selected` 등) 또는 양쪽 수정.

2. **라벨 워크플로 복구**  
   - 라벨 리스트 업데이트, 클래스 선택 모달, 컨텍스트 메뉴, 클래스 YAML 로딩을 우선 구현하여 기존 작업 흐름을 재현.

3. **검색/필터/미리보기 기능 이식**  
   - 이미지 검색·필터 UI 이벤트 추가 및 `renderImageList`에 필터 적용 로직 반영.  
   - 프리뷰 바 생성(썸네일 로딩, 좌우 이동) 구현.

4. **자동 저장 및 상태 동기화**  
   - `CanvasController`의 `object:added/object:modified` 이벤트에서 `AppState`와 `UIManager`를 업데이트하고, 자동 저장 플래그에 따라 `FileSystemService.saveLabels` 호출.

5. **테스트/검증 체계**  
   - 각 기능 구현 후 수동/자동 테스트 목록 작성 (예: 박스 추가→클래스 지정→저장→YOLO 파일 검증 등).

