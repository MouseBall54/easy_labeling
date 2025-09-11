# 📊 Easy Labeling - 프로젝트 분석 및 TypeScript 마이그레이션 계획

## 🎯 프로젝트 개요

**Easy Labeling**은 이미지 객체 인식을 위한 바운딩 박스 라벨링 도구입니다.
YOLO 포맷을 지원하며, 웹 브라우저에서 동작하는 클라이언트 사이드 애플리케이션입니다.

### 🏗️ 현재 프로젝트 구조

```
easy_labeling/
├── server.js           # Express 서버 (정적 파일 제공) - 15줄
├── package.json        # 프로젝트 설정 및 의존성
└── public/
    ├── index.html      # 메인 HTML 파일 - 269줄
    ├── css/style.css   # 스타일시트 (다크모드 지원)
    └── js/app.js       # 메인 애플리케이션 로직 - 2,602줄 ⚠️
```

### 📈 파일 크기 분석
- **전체**: ~3,000줄
- **핵심 로직**: 2,602줄 (단일 파일)
- **HTML**: 269줄 (UI 구조)
- **서버**: 15줄 (정적 파일 서버)

---

## 🧩 애플리케이션 아키텍처 분석

### 핵심 기능
1. **📁 파일 관리**: 이미지/라벨 폴더 선택, 브라우징
2. **🎨 라벨링**: 바운딩 박스 그리기/편집, 클래스 할당
3. **🔍 시각화**: 캔버스 줌/팬, 라벨 표시/숨기기  
4. **💾 데이터 관리**: YOLO 포맷 저장/로드, 자동저장
5. **🎭 UI/UX**: 다크모드, 미리보기, 키보드 단축키

### 클래스 구조 (6개 주요 클래스)

#### 1. **AppState** - 전역 상태 관리
**역할**: 애플리케이션의 모든 상태 데이터 중앙 집중 관리
**위치**: `app.js:53-80`

```javascript
class AppState {
    // 파일 핸들링
    imageFolderHandle, labelFolderHandle, classInfoFolderHandle
    
    // 데이터 관리
    imageFiles[], classFiles[], imageLabelStatus: Map
    currentImageFile, selectedClassFile, classNames: Map
    
    // UI 상태
    currentMode: 'edit'|'draw', showLabelsOnCanvas: boolean
    labelFontSize, labelSortOrder, isAutoSaveEnabled
    
    // 캐싱 & 임시데이터
    previewImageCache: Map, _clipboard, saveTimeout
}
```

#### 2. **UIManager** - UI 컨트롤 및 DOM 관리
**역할**: DOM 요소 관리, 사용자 인터페이스 업데이트
**위치**: `app.js:87-815`

**핵심 책임**:
- DOM 요소 참조 관리 (`getDOMElements()`)
- 패널 토글/리사이즈 (좌측/우측/미리보기)
- 이미지/라벨 리스트 렌더링
- 모달창 관리 (클래스 선택, 파일 편집)
- 로딩 인디케이터, 토스트 메시지

#### 3. **FileSystem** - 파일 입출력 처리
**역할**: 브라우저 File System Access API를 이용한 파일 관리
**위치**: `app.js:816-1366`

**핵심 기능**:
- 폴더 선택 및 파일 목록화
- YOLO 포맷 라벨 파일 읽기/쓰기
- YAML 클래스 파일 파싱
- 이미지 파일 로딩 및 미리보기 생성

#### 4. **CanvasController** - 캔버스 및 그래픽 처리
**역할**: Fabric.js 기반 캔버스 조작 및 바운딩 박스 관리
**위치**: `app.js:1367-1950`

**핵심 기능**:
- 바운딩 박스 그리기/편집
- 캔버스 줌/팬 제어
- 라벨 표시/숨기기
- 십자선(Crosshair) 표시
- 객체 선택/삭제

#### 5. **EventManager** - 이벤트 처리 및 키보드 단축키
**역할**: 사용자 입력 이벤트 통합 관리
**위치**: `app.js:1951-2566`

**핵심 기능**:
- 키보드 단축키 (A/D: 이미지 전환, Ctrl+S: 저장)
- 마우스 이벤트 (클릭, 드래그, 우클릭 컨텍스트 메뉴)
- 다중 선택 및 배치 작업

#### 6. **App** - 메인 애플리케이션 클래스
**역할**: 전체 애플리케이션 초기화 및 의존성 주입
**위치**: `app.js:2567-2603`

**의존성 주입 패턴**:
```javascript
this.canvasController.uiManager = this.uiManager;
this.canvasController.fileSystem = this.fileSystem;
this.uiManager.fileSystem = this.fileSystem;
```

### 유틸리티 함수 (4개)
**위치**: `app.js:1-51`

1. **showToast()** - 알림 메시지 표시
2. **getColorForClass()** - 클래스별 색상 할당
3. **validateLabelClass()** - 라벨 클래스 유효성 검사
4. **colorPalette** - 30개 색상 팔레트

---

## 📋 현재 아키텍처 평가

### ✅ 장점
- **클래스 기반 모듈화**: 기능별로 명확히 분리
- **상태 중앙화**: AppState를 통한 일관된 상태 관리
- **의존성 주입**: 클래스 간 결합도 최소화
- **단일 파일**: 빠른 개발 및 디버깅 용이

### ⚠️ 개선 필요사항
- **파일 크기**: 2,602줄 → 유지보수성 저하
- **타입 안전성**: JavaScript → TypeScript 마이그레이션 필요
- **모듈 분리**: 각 클래스를 별도 파일로 분리
- **유틸리티 함수**: 재사용 가능한 함수들 모듈화
- **번들링**: 현대적 개발 도구 도입

---

## 🚀 TypeScript 마이그레이션 전략

### 목표 구조 (src/ 디렉토리)
```
src/
├── types/
│   ├── index.ts           # 모든 타입 정의 통합
│   ├── app-state.ts       # AppState 관련 타입
│   ├── file-system.ts     # 파일시스템 관련 타입
│   └── canvas.ts          # 캔버스 관련 타입
├── utils/
│   ├── index.ts           # 유틸리티 함수 통합
│   ├── color-palette.ts   # 색상 관리
│   ├── validation.ts      # 유효성 검사
│   └── notifications.ts   # 토스트 메시지
├── models/
│   └── AppState.ts        # 상태 관리 클래스
├── services/
│   └── FileSystem.ts      # 파일 입출력 서비스
├── controllers/
│   ├── CanvasController.ts # 캔버스 조작
│   └── EventManager.ts     # 이벤트 처리
├── ui/
│   └── UIManager.ts       # UI 관리
├── config/
│   ├── webpack.config.js  # 번들 설정
│   └── tsconfig.json      # TypeScript 설정
└── main.ts               # 엔트리 포인트
```

### 개발 도구 추가
```
├── dist/                 # 빌드 산출물
├── tests/               # 단위 테스트
├── .gitignore           # Git 무시 파일 업데이트
└── package.json         # 스크립트 및 devDependencies 추가
```

---

## 📅 단계별 마이그레이션 로드맵

### Phase 1: 기반 설정 (1-2일)
- [ ] TypeScript 및 개발 도구 설정
- [ ] 기본 디렉토리 구조 생성
- [ ] 빌드 시스템 구축 (Webpack/Vite)

### Phase 2: 타입 정의 (2-3일)
- [ ] 핵심 인터페이스 정의
- [ ] 상태 관리 타입 정의
- [ ] 이벤트 및 콜백 타입 정의

### Phase 3: 유틸리티 분리 (1일)
- [ ] 공통 함수 모듈화
- [ ] 색상 팔레트 분리
- [ ] 유효성 검사 함수 분리

### Phase 4: 모델 분리 (1-2일)
- [ ] AppState 클래스 분리
- [ ] 타입 적용 및 검증

### Phase 5: 서비스 분리 (2-3일)
- [ ] FileSystem 클래스 분리
- [ ] 파일 I/O 로직 타입화
- [ ] API 인터페이스 정의

### Phase 6: 컨트롤러 분리 (3-4일)
- [ ] CanvasController 분리
- [ ] EventManager 분리
- [ ] 의존성 주입 타입화

### Phase 7: UI 분리 (2-3일)
- [ ] UIManager 클래스 분리
- [ ] DOM 요소 타입 정의
- [ ] 이벤트 핸들러 타입화

### Phase 8: 통합 및 테스트 (2-3일)
- [ ] main.ts 구현
- [ ] 의존성 연결
- [ ] 기능 테스트 및 버그 수정

### Phase 9: 최적화 (1-2일)
- [ ] 번들 최적화
- [ ] 성능 측정 및 개선
- [ ] 문서화 완료

**총 예상 기간**: 15-25일 (약 3-5주)

---

## 📊 진행 상황 추적

### 진행률 계산
- **Phase 완료**: 완료된 Phase 수 / 9 * 100
- **Task 완료**: 완료된 Task 수 / 전체 Task 수 * 100
- **전체 진행률**: (Phase 가중치 + Task 완료율) / 2

### 체크리스트 템플릿
```markdown
## Phase X: [제목] - 진행률: X%

### ✅ 완료된 작업
- [x] Task 1
- [x] Task 2

### 🔄 진행 중인 작업
- [ ] Task 3 (50% 완료)

### ⏳ 대기 중인 작업
- [ ] Task 4
- [ ] Task 5

### 🚨 발견된 이슈
- Issue 1: 설명
- Issue 2: 설명

### 📝 다음 Phase 준비사항
- Prerequisite 1
- Prerequisite 2
```

---

## 🎯 성공 기준

### 기능적 요구사항
- [ ] 모든 기존 기능이 정상 작동
- [ ] 성능 저하 없음 (로딩 시간 동일 수준)
- [ ] 브라우저 호환성 유지

### 기술적 요구사항
- [ ] 100% TypeScript 적용
- [ ] ESLint 규칙 준수
- [ ] 모듈 분리 완료 (8개 파일)
- [ ] 타입 안전성 확보

### 개발 경험 개선
- [ ] Hot reload 지원
- [ ] 개발 서버 구축
- [ ] 자동화된 빌드 프로세스
- [ ] 단위 테스트 환경

---

## 📋 참고사항

### 주요 의존성
- **Fabric.js**: 캔버스 조작 라이브러리
- **Bootstrap**: UI 프레임워크
- **File System Access API**: 브라우저 파일 접근

### 브라우저 지원
- Chrome/Edge: File System Access API 지원
- Firefox/Safari: 제한적 지원 (폴백 필요 시)

### 백업 계획
- `.yoyo/` 폴더에 기존 버전 백업 존재
- 단계별 커밋으로 롤백 가능성 확보

---

**작성일**: 2024-09-11
**분석 대상**: Easy Labeling v1.0.0
**다음 업데이트**: 마이그레이션 시작 시점