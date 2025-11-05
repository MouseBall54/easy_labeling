# Easy Labeling TypeScript 마이그레이션 기능 점검 (2024-09-21)

## 개요
- 기준 소스: `public/` 하위의 기존 번들 자바스크립트와 `src/` 하위 TypeScript 마이그레이션 코드.
- 점검 목적: 현재 TypeScript 리팩토링에서 정상 동작하는 기능과 미구현/부분 구현 상태를 식별.
- 방법: 주요 모듈(`src/ui/UIManager.ts`, `src/controllers`, `src/services`, `src/models`, `src/main.ts`) 정적 분석 및 원본 기능 목록 대비.

## 구현 현황 요약
| 영역 | 기능 | 상태 | 근거 |
| --- | --- | --- | --- |
| 파일/폴더 | 이미지·라벨 폴더 선택 | 구현 | 버튼 이벤트에서 FileSystemService 호출 및 상태 갱신 (`src/ui/UIManager.ts:977-1039`) |
| 파일/폴더 | 클래스 폴더/파일 로드·편집 | 부분 구현 | 폴더 선택 시 리스트를 채우고 클래스 파일을 로드해 상태를 갱신 (`src/ui/UIManager.ts:1002-1058`), 편집/저장은 미구현 |
| 이미지 탐색 | 이미지 리스트 렌더링 | 부분 구현 | 폴더 선택 시 목록 갱신 및 클릭 로드 동작 (`src/ui/UIManager.ts:641-723`), 단 검색·필터 반영 안 됨 |
| 이미지 탐색 | 검색/라벨 상태 필터 | 미구현 | UI 요소 존재하나 이벤트/필터 로직 없음 (`src/ui/UIManager.ts:140-152`, `src/ui/UIManager.ts:934-949`) |
| 이미지 탐색 | 하단 미리보기 바 | 미구현 | DOM 요소만 준비, 렌더/네비게이션 로직 없음 (`src/ui/UIManager.ts:186-207`, 전역에서 미사용) |
| 캔버스 | 캔버스 초기화·이미지 로드·줌/팬 | 구현 | Fabric 캔버스 생성, 리사이즈, 줌/팬 동작 (`src/controllers/CanvasController.ts:108-410`, `src/controllers/CanvasController.ts:780-862`) |
| 캔버스 | 박스 그리기/이동/삭제 | 부분 구현 | 드로잉·수정·삭제 동작하며 생성 직후 클래스 지정 가능 (`src/controllers/CanvasController.ts:440-705`, `src/main.ts:86-134`), 세부 편집 UX는 추가 개선 필요 |
| 라벨 관리 | 라벨 리스트·정렬·필터 | 부분 구현 | 라벨 리스트/필터/드롭다운이 이벤트와 연동되어 갱신되지만 정렬·필터 토글 동작은 미구현 (`src/ui/UIManager.ts:731-823`, `src/ui/UIManager.ts:800-817`) |
| 라벨 관리 | 클래스 선택 모달/컨텍스트 메뉴 | 구현 | 바운딩 박스 생성·컨텍스트 메뉴에서 클래스 선택 모달 호출 및 저장 (`src/ui/UIManager.ts:953-1007`, `src/main.ts:86-146`) |
| 라벨 관리 | 클래스 YAML 파싱 & 매핑 | 구현 | 클래스 폴더 선택 시 YAML을 로드해 `AppState.classNames`와 UI 버튼/리스트 갱신 (`src/ui/UIManager.ts:900-1010`) |
| 데이터 저장 | 수동 저장 (Save Labels) | 구현 | 버튼이 YOLO 변환 후 저장 호출 (`src/ui/UIManager.ts:1112-1139`) |
| 데이터 저장 | 자동 저장 | 부분 구현 | 토글은 상태만 변경 (`src/ui/UIManager.ts:1073-1075`, `src/models/AppState.ts:321-333`), 캔버스 이벤트와 연동되지 않아 실질 동작 없음 |
| UX | 다크 모드, 패널 토글·리사이즈 | 구현 | 토글/스플리터 이벤트 구현 (`src/ui/UIManager.ts:628-708`, `src/ui/UIManager.ts:104-208`, `src/ui/UIManager.ts:1085-1104`) |
| UX | 이미지 좌표 입력, 줌 입력 | 구현 | 좌표/줌 입력 이벤트로 CanvasController 호출 (`src/ui/UIManager.ts:1142-1156`) |
| 입력 | 키보드 단축키 | 부분 구현 | EventManager에서 바인딩 (`src/controllers/EventManager.ts:80-266`), UI 반영/라벨 작업 관련 동작 미완 |
| 입력 | 드래그 & 드롭 | 부분 구현 | 이미지 로드까지만 수행, AppState/라벨 상태 미반영 (`src/controllers/EventManager.ts:427-479`) |
| 상태 연동 | 컴포넌트 간 이벤트 브리지 | 구현 | `App.setupCrossReferences`에서 Canvas/UI/EventManager 이벤트 연동 및 상태 반영 (`src/main.ts:86-148`, `src/main.ts:153-185`) |

## 상세 분석

### 1. 파일/폴더 및 IO
- **이미지/라벨 폴더 선택**: UI 버튼이 `FileSystemService`의 `selectImageFolder`, `selectLabelFolder`를 호출하고 `AppState`를 업데이트한다 (`src/ui/UIManager.ts:977-1040`). 이미지 목록 렌더링과 기본 라벨 폴더 자동 탐색은 동작.
- **클래스 정보**: 클래스 폴더 선택 시 `listClassFiles`로 드롭다운을 채우고 선택된 YAML을 로드해 상태/버튼을 갱신한다 (`src/ui/UIManager.ts:1002-1058`). 편집/저장 UI는 향후 보완 필요.

### 2. 이미지 리스트 & 탐색
- **리스트 표시**: `renderImageList`는 목록과 라벨 여부 뱃지를 표시한다 (`src/ui/UIManager.ts:641-680`).
- **검색/필터**: `imageSearchInput`, `showLabeledCheckbox`, `showUnlabeledCheckbox`는 DOM 매핑만 있고 이벤트가 없어 동작하지 않는다 (`src/ui/UIManager.ts:140-152`, `src/ui/UIManager.ts:934-949`).
- **미리보기 바**: DOM 요소만 존재하며, 프리뷰 이미지 생성·스크롤 로직이 빠져 있다 (`src/ui/UIManager.ts:186-207`).

### 3. 캔버스 & 어노테이션
- **기본 조작**: 캔버스 초기화, 이미지 로드, 줌/팬, 교차선 토글 등은 구현되어 있다 (`src/controllers/CanvasController.ts:108-410`, `src/controllers/CanvasController.ts:780-940`).
- **박스 편집**: 드로잉/수정/삭제는 동작하며, 드로잉 직후 클래스 지정 모달을 호출해 색상/라벨이 즉시 반영된다 (`src/controllers/CanvasController.ts:440-705`, `src/main.ts:86-134`).
- **라벨 업데이트 이벤트**: `object:*` 이벤트를 App이 수신해 라벨 리스트/필터/라벨 상태를 즉시 갱신한다 (`src/main.ts:86-134`, `src/ui/UIManager.ts:731-823`).

### 4. 클래스·라벨 관리
- **라벨 리스트/정렬/필터**: 라벨 리스트와 클래스 필터/드롭다운이 캔버스 이벤트와 연동되어 실시간으로 갱신되지만, 정렬·검색 토글은 미구현 상태 (추후 Phase 3 영역) (`src/ui/UIManager.ts:731-823`, `src/ui/UIManager.ts:934-949`).
- **클래스 선택 워크플로**: 새 바운딩 박스 및 컨텍스트 메뉴에서 클래스 선택 모달을 호출해 다중 라벨에 클래스 ID를 적용할 수 있다 (`src/ui/UIManager.ts:953-1007`, `src/main.ts:86-134`).
- **YOLO 클래스 매핑**: YAML 클래스 파일 로드 시 `AppState.classNames`를 채우고 캔버스 라벨/필터/빠른 선택 버튼에 반영한다 (`src/ui/UIManager.ts:900-1010`).

### 5. UX 및 부가 기능
- **토스트/알림**: `showSuccessToast`, `showErrorToast`는 버튼 액션에서 부분적으로 사용 중 (`src/ui/UIManager.ts:1112-1139`, `src/ui/UIManager.ts:1012-1013`).
- **자동 저장 토글**: 상태 플래그는 업데이트되나 (`src/models/AppState.ts:321-333`), 캔버스 이벤트와 연결되어 있지 않아 실질적인 자동 저장이 이루어지지 않는다.
- **다크 모드/패널 제어**: 정상 동작 (테마 토글 `src/ui/UIManager.ts:628-635`, 스플리터 `src/ui/UIManager.ts:700-835`).

### 6. 이벤트/상태 연동 문제
- **App 초기화**: `App.setupCrossReferences`에서 Canvas/UI/EventManager 이벤트를 상호 구독해 라벨·줌·좌표·컨텍스트 메뉴가 동기화된다 (`src/main.ts:86-148`).
- **이벤트 명 불일치**: `App.setupApplicationEvents`가 `image:current-changed`와 `image:label-status-changed`를 구독하도록 정리되어 이미지 전환/라벨 저장 후 UI가 갱신된다 (`src/main.ts:153-185`).
- **EventManager ↔ UI 연결**: 컨텍스트 메뉴, 좌표, 라벨 저장 이벤트가 UIManager로 연결되어 UI 메뉴·토스트·좌표 표시가 정상 작동한다 (`src/main.ts:128-148`).

## 주요 리스크 및 추천 작업
1. **탐색 UX 고도화**  
   - 이미지 검색·라벨 여부 필터·썸네일 프리뷰 바 등 탐색 관련 UI 이벤트를 구현하고 리스트 렌더링과 연동해야 함.

2. **자동 저장 및 라벨 상태 강화**  
   - `isAutoSaveEnabled` 플래그와 캔버스 변경 이벤트를 연결해 저장 루틴을 자동화하고, 저장 실패 시 복구 UX를 설계해야 함.

3. **클래스 편집 및 파일 관리**  
   - 클래스 YAML 편집/저장 UI를 확장하고, 여러 클래스 파일 간 전환·차이 비교/검증 기능을 제공할 필요가 있음.

4. **테스트/검증 체계**  
   - 주요 사용자 플로우에 대한 시나리오 테스트 및 회귀 체크리스트를 정리하고, 필요 시 자동화 스크립트를 도입해야 함.
