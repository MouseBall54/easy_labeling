# 🚀 TypeScript 마이그레이션 로드맵

## 📋 전체 개요

**목표**: Easy Labeling JavaScript 코드를 TypeScript로 마이그레이션하여 타입 안전성과 개발 경험 향상

**현재 상태**: 단일 파일 (2,602줄) → 모듈화된 TypeScript 프로젝트
**예상 기간**: 15-25일 (3-5주)
**총 작업**: 9개 Phase, 45개 주요 Task

---

## 🎯 Phase 1: 기반 설정 (1-2일)

### 목표
개발 환경 구축 및 기본 디렉토리 구조 생성

### 📝 상세 작업 계획

#### 1.1 개발 도구 설치 및 설정
- [ ] **Node.js 개발 환경 구성**
  - package.json devDependencies 추가
  - TypeScript, Webpack/Vite 설치
  - ESLint, Prettier 설정

- [ ] **TypeScript 설정**
  ```json
  // tsconfig.json
  {
    "compilerOptions": {
      "target": "ES2020",
      "module": "ESNext",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    }
  }
  ```

#### 1.2 디렉토리 구조 생성
- [ ] **src/ 디렉토리 생성**
  ```
  mkdir -p src/{types,utils,models,services,controllers,ui,config}
  ```

- [ ] **빌드 설정**
  - Webpack 또는 Vite 설정 파일 생성
  - 개발 서버 구성
  - 빌드 스크립트 작성

#### 1.3 개발 환경 검증
- [ ] **기본 빌드 테스트**
  - Hello World TypeScript 파일 생성
  - 빌드 프로세스 검증
  - 개발 서버 실행 확인

### ✅ 완료 조건
- [x] TypeScript 빌드 환경 구축 완료
- [x] 기본 디렉토리 구조 생성
- [x] 개발 서버 정상 동작

---

## 🎯 Phase 2: 타입 정의 (2-3일)

### 목표
모든 데이터 구조와 인터페이스의 TypeScript 타입 정의

### 📝 상세 작업 계획

#### 2.1 핵심 타입 정의
- [ ] **src/types/index.ts 생성**
  ```typescript
  // 기본 타입들
  export type Mode = 'edit' | 'draw';
  export type LabelSortOrder = 'asc' | 'desc';
  
  // 파일 핸들 타입
  export interface FileSystemHandle {
    // File System Access API 타입
  }
  ```

#### 2.2 AppState 관련 타입
- [ ] **src/types/app-state.ts 생성**
  ```typescript
  export interface AppStateData {
    imageFolderHandle: FileSystemDirectoryHandle | null;
    labelFolderHandle: FileSystemDirectoryHandle | null;
    // ... 모든 상태 속성 타입 정의
  }
  ```

#### 2.3 캔버스 및 이벤트 타입
- [ ] **src/types/canvas.ts 생성**
  - Fabric.js 객체 타입 확장
  - 바운딩 박스 데이터 구조
  - 캔버스 이벤트 타입

#### 2.4 파일시스템 타입
- [ ] **src/types/file-system.ts 생성**
  - YOLO 포맷 데이터 구조
  - 이미지 파일 메타데이터
  - 클래스 파일 구조

### ✅ 완료 조건
- [x] 모든 주요 데이터 구조 타입 정의 완료
- [x] TypeScript 컴파일 에러 없음
- [x] 타입 추론 및 검사 정상 동작

---

## 🎯 Phase 3: 유틸리티 분리 (1일)

### 목표
공통 유틸리티 함수들을 별도 모듈로 분리

### 📝 상세 작업 계획

#### 3.1 알림 시스템 분리
- [ ] **src/utils/notifications.ts 생성**
  ```typescript
  export function showToast(message: string, duration: number = 3000): void {
    // showToast 함수 이전
  }
  ```

#### 3.2 색상 관리 분리
- [ ] **src/utils/color-palette.ts 생성**
  ```typescript
  export const colorPalette: string[] = [...];
  export function getColorForClass(labelClass: string): string {
    // 색상 할당 로직
  }
  ```

#### 3.3 유효성 검사 분리
- [ ] **src/utils/validation.ts 생성**
  ```typescript
  export function validateLabelClass(input: string | null): string | null {
    // 유효성 검사 로직
  }
  ```

#### 3.4 유틸리티 통합
- [ ] **src/utils/index.ts 생성**
  - 모든 유틸리티 함수 re-export
  - 타입 정의 포함

### ✅ 완료 조건
- [x] 4개 유틸리티 함수 모듈 분리 완료
- [x] 타입 안전성 확보
- [x] import/export 정상 동작

---

## 🎯 Phase 4: 모델 분리 (1-2일)

### 목표
AppState 클래스를 별도 모듈로 분리하고 타입 적용

### 📝 상세 작업 계획

#### 4.1 AppState 클래스 분리
- [ ] **src/models/AppState.ts 생성**
  ```typescript
  import { AppStateData, Mode } from '../types';
  
  export class AppState implements AppStateData {
    // 모든 속성에 타입 적용
    // 생성자 및 메서드 구현
  }
  ```

#### 4.2 상태 관리 메서드 추가
- [ ] **상태 변경 메서드 구현**
  - setState() 메서드 추가
  - 타입 안전한 상태 업데이트
  - 상태 변경 이벤트 시스템

#### 4.3 타입 검증
- [ ] **런타임 타입 검증**
  - 중요 상태 변경 시 타입 체크
  - 개발 모드에서 경고 메시지

### ✅ 완료 조건
- [x] AppState 클래스 타입 적용 완료
- [x] 상태 관리 메서드 구현
- [x] 타입 안전성 확보

---

## 🎯 Phase 5: 서비스 분리 (2-3일)

### 목표
FileSystem 클래스 분리 및 파일 I/O 로직 타입화

### 📝 상세 작업 계획

#### 5.1 FileSystem 서비스 분리
- [ ] **src/services/FileSystem.ts 생성**
  ```typescript
  export class FileSystem {
    constructor(
      private state: AppState,
      private uiManager: UIManager,
      private canvasController: CanvasController
    ) {}
    
    // 모든 메서드 타입 적용
  }
  ```

#### 5.2 파일 I/O 메서드 구현
- [ ] **폴더 선택 메서드**
  - selectImageFolder() 타입화
  - selectLabelFolder() 타입화
  - selectClassInfoFolder() 타입화

- [ ] **파일 읽기/쓰기 메서드**
  - loadImageFile() 타입화
  - saveLabels() 타입화
  - loadClassFile() 타입화

#### 5.3 에러 처리 강화
- [ ] **타입 안전한 에러 처리**
  - 파일 시스템 에러 타입 정의
  - try-catch 블록 개선
  - 사용자 친화적 에러 메시지

### ✅ 완료 조건
- [x] FileSystem 클래스 완전 타입화
- [x] 모든 파일 I/O 메서드 구현
- [x] 에러 처리 개선 완료

---

## 🎯 Phase 6: 컨트롤러 분리 (3-4일)

### 목표
CanvasController와 EventManager 클래스 분리

### 📝 상세 작업 계획

#### 6.1 CanvasController 분리
- [ ] **src/controllers/CanvasController.ts 생성**
  ```typescript
  export class CanvasController {
    private canvas: fabric.Canvas;
    
    constructor(
      private state: AppState,
      private uiManager: UIManager,
      private fileSystem: FileSystem
    ) {
      // Fabric.js 초기화
    }
  }
  ```

#### 6.2 캔버스 조작 메서드
- [ ] **바운딩 박스 관리**
  - drawRectangle() 타입화
  - editRectangle() 타입화
  - deleteRectangle() 타입화

- [ ] **줌/팬 컨트롤**
  - zoomIn(), zoomOut() 타입화
  - resetZoom() 타입화
  - panCanvas() 타입화

#### 6.3 EventManager 분리
- [ ] **src/controllers/EventManager.ts 생성**
  ```typescript
  export class EventManager {
    constructor(
      private state: AppState,
      private ui: UIManager,
      private fileSystem: FileSystem,
      private canvas: CanvasController
    ) {}
  }
  ```

#### 6.4 이벤트 핸들러 구현
- [ ] **키보드 이벤트**
  - setupKeyboardEvents() 타입화
  - 단축키 핸들러 타입 정의

- [ ] **마우스 이벤트**
  - 캔버스 마우스 이벤트 타입화
  - 드래그 앤 드롭 구현

### ✅ 완료 조건
- [x] 2개 컨트롤러 클래스 완전 분리
- [x] 모든 이벤트 핸들러 타입화
- [x] Fabric.js 타입 통합 완료

---

## 🎯 Phase 7: UI 분리 (2-3일)

### 목표
UIManager 클래스 분리 및 DOM 조작 타입화

### 📝 상세 작업 계획

#### 7.1 UIManager 분리
- [ ] **src/ui/UIManager.ts 생성**
  ```typescript
  export class UIManager {
    private elements: DOMElements;
    
    constructor(
      private state: AppState,
      private canvasController: CanvasController,
      private fileSystem: FileSystem
    ) {}
  }
  ```

#### 7.2 DOM 요소 타입 정의
- [ ] **DOM 요소 인터페이스**
  ```typescript
  interface DOMElements {
    selectImageFolderBtn: HTMLButtonElement;
    imageList: HTMLUListElement;
    // ... 모든 DOM 요소 타입 정의
  }
  ```

#### 7.3 UI 업데이트 메서드
- [ ] **리스트 렌더링**
  - updateImageList() 타입화
  - updateLabelList() 타입화
  - updateClassList() 타입화

- [ ] **모달창 관리**
  - showModal() 타입화
  - hideModal() 타입화
  - 부트스트랩 모달 타입 통합

### ✅ 완료 조건
- [x] UIManager 완전 타입화
- [x] 모든 DOM 조작 메서드 구현
- [x] Bootstrap 타입 통합 완료

---

## 🎯 Phase 8: 통합 및 테스트 (2-3일)

### 목표
모든 모듈을 통합하고 기능 테스트 수행

### 📝 상세 작업 계획

#### 8.1 메인 애플리케이션 구현
- [ ] **src/main.ts 생성**
  ```typescript
  import { App } from './App';
  
  document.addEventListener('DOMContentLoaded', () => {
    new App();
  });
  ```

- [ ] **App 클래스 분리**
  - 의존성 주입 구현
  - 초기화 로직 타입화

#### 8.2 모듈 통합
- [ ] **import/export 검증**
  - 모든 모듈 간 연결 확인
  - 순환 참조 해결
  - 타입 추론 정상 동작 확인

#### 8.3 기능 테스트
- [ ] **핵심 기능 검증**
  - 파일 로딩 테스트
  - 바운딩 박스 그리기 테스트
  - 저장/불러오기 테스트
  - UI 상호작용 테스트

#### 8.4 버그 수정
- [ ] **발견된 이슈 해결**
  - TypeScript 컴파일 에러 수정
  - 런타임 에러 해결
  - 성능 문제 개선

### ✅ 완료 조건
- [x] 모든 모듈 통합 완료
- [x] 기존 기능 100% 동작
- [x] 타입 에러 0개

---

## 🎯 Phase 9: 최적화 (1-2일)

### 목표
성능 최적화 및 개발 경험 개선

### 📝 상세 작업 계획

#### 9.1 번들 최적화
- [ ] **Webpack/Vite 최적화**
  - 코드 스플리팅 적용
  - Tree shaking 최적화
  - 번들 크기 분석 및 개선

#### 9.2 개발 도구 개선
- [ ] **개발 경험 향상**
  - Hot Module Replacement 설정
  - Source map 설정
  - 디버깅 도구 최적화

#### 9.3 성능 측정
- [ ] **성능 벤치마크**
  - 로딩 시간 측정
  - 메모리 사용량 분석
  - 렌더링 성능 검증

#### 9.4 문서화 완료
- [ ] **개발 문서 작성**
  - API 문서 생성
  - 사용법 가이드 업데이트
  - 기여자 가이드 작성

### ✅ 완료 조건
- [x] 성능 최적화 완료
- [x] 개발 도구 설정 완료
- [x] 문서화 완료

---

## 📊 전체 진행 상황 추적

### 진행률 계산 공식
```
Phase 진행률 = (완료된 Task 수 / 전체 Task 수) × 100
전체 진행률 = Σ(Phase 진행률 × 가중치) / Σ(가중치)
```

### Phase별 가중치
| Phase | 가중치 | 예상 일수 | 주요 Task 수 |
|-------|--------|-----------|--------------|
| Phase 1 | 10% | 1-2일 | 6개 |
| Phase 2 | 15% | 2-3일 | 8개 |
| Phase 3 | 10% | 1일 | 4개 |
| Phase 4 | 10% | 1-2일 | 3개 |
| Phase 5 | 15% | 2-3일 | 6개 |
| Phase 6 | 20% | 3-4일 | 8개 |
| Phase 7 | 15% | 2-3일 | 6개 |
| Phase 8 | 15% | 2-3일 | 4개 |
| Phase 9 | 5% | 1-2일 | 4개 |

### 현재 진행 상황
```
🔄 현재 Phase: 준비 단계
📈 전체 진행률: 0%
⏳ 예상 완료일: TBD
🎯 다음 마일스톤: Phase 1 시작
```

---

## 🚨 리스크 및 대응 방안

### 기술적 리스크
1. **Fabric.js 타입 정의 부족**
   - 대응: @types/fabric 설치 또는 커스텀 타입 정의

2. **File System Access API 타입 이슈**
   - 대응: 브라우저 호환성 타입 정의 추가

3. **순환 참조 문제**
   - 대응: 의존성 그래프 분석 및 인터페이스 분리

### 일정 리스크
1. **Phase 6 복잡도 높음**
   - 대응: Task 세분화 및 단계별 검증

2. **통합 테스트 시간 부족**
   - 대응: 각 Phase별 단위 테스트 강화

### 대응 전략
- **매일 진행 상황 체크**: 일일 체크리스트 작성
- **주간 마일스톤**: 주 단위 목표 설정
- **백업 계획**: 각 Phase별 롤백 가능한 커밋

---

**문서 버전**: v1.0
**최종 수정**: 2024-09-11
**다음 업데이트**: Phase 1 시작 시점