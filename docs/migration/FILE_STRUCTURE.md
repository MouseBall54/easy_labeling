# 📁 파일 구조 재구성 계획

## 🎯 목표 구조

TypeScript 마이그레이션을 위한 체계적인 파일 구조 재정리

---

## 📊 현재 구조 → 목표 구조

### 현재 구조 (Before)
```
easy_labeling/
├── server.js           # 15줄
├── package.json
└── public/
    ├── index.html      # 269줄
    ├── css/style.css
    └── js/app.js       # 2,602줄 ⚠️
```

### 목표 구조 (After)
```
easy_labeling/
├── server.js           # 서버 유지
├── package.json        # 개발 도구 추가
├── tsconfig.json       # TypeScript 설정
├── webpack.config.js   # 빌드 설정
├── .eslintrc.js        # 린트 설정
├── .gitignore          # 업데이트
├── public/             # 정적 파일 (빌드 결과)
│   ├── index.html
│   ├── css/
│   └── js/
├── src/                # TypeScript 소스 📁
│   ├── types/          # 타입 정의
│   ├── utils/          # 유틸리티
│   ├── models/         # 데이터 모델
│   ├── services/       # 서비스
│   ├── controllers/    # 컨트롤러
│   ├── ui/             # UI 관리
│   └── main.ts         # 엔트리 포인트
├── dist/               # 빌드 산출물
├── tests/              # 테스트 파일
└── docs/               # 문서
```

---

## 📋 상세 파일 분해 계획

### 1. 타입 정의 (src/types/)

#### `types/index.ts` - 메인 타입 export
```typescript
// 모든 타입을 중앙에서 관리
export * from './app-state';
export * from './canvas';
export * from './file-system';
export * from './ui';

// 기본 타입 정의
export type Mode = 'edit' | 'draw';
export type LabelSortOrder = 'asc' | 'desc';
export type FileType = 'image' | 'label' | 'class';
```

#### `types/app-state.ts` - 상태 관리 타입
```typescript
export interface AppStateConfig {
  imageFolderHandle: FileSystemDirectoryHandle | null;
  labelFolderHandle: FileSystemDirectoryHandle | null;
  classInfoFolderHandle: FileSystemDirectoryHandle | null;
  imageFiles: ImageFile[];
  classFiles: ClassFile[];
  selectedClassFile: ClassFile | null;
  imageLabelStatus: Map<string, boolean>;
  currentImageFile: ImageFile | null;
  currentImage: HTMLImageElement | null;
  currentMode: Mode;
  isAutoSaveEnabled: boolean;
  showLabelsOnCanvas: boolean;
  labelFontSize: number;
  saveTimeout: NodeJS.Timeout | null;
  currentLoadToken: number;
  _clipboard: any;
  lastMousePosition: Point;
  classNames: Map<string, string>;
  labelSortOrder: LabelSortOrder;
  previewImageCache: Map<string, string>;
  isPreviewBarHidden: boolean;
  isCrosshairVisible: boolean;
  contextTarget: any;
  collapsedLabelGroups: Set<string>;
}

export interface Point {
  x: number;
  y: number;
}

export interface ImageFile {
  name: string;
  handle: FileSystemFileHandle;
  path: string;
}

export interface ClassFile {
  name: string;
  content: ClassDefinition[];
}

export interface ClassDefinition {
  id: number;
  name: string;
  color?: string;
}
```

#### `types/canvas.ts` - 캔버스 관련 타입
```typescript
import { fabric } from 'fabric';

export interface BoundingBox {
  id: string;
  classId: number;
  className?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  isDrawing: boolean;
  startPoint: Point | null;
  currentRect: fabric.Rect | null;
  activeLabelText: fabric.Text | null;
  crosshairX: fabric.Line | null;
  crosshairY: fabric.Line | null;
}

export interface DrawingOptions {
  strokeWidth: number;
  stroke: string;
  fill: string;
  opacity: number;
}
```

#### `types/file-system.ts` - 파일 시스템 타입
```typescript
export interface YOLOLabel {
  classId: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface ImageMetadata {
  filename: string;
  width: number;
  height: number;
  size: number;
  lastModified: Date;
  hasLabels: boolean;
}

export interface ClassInfo {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

export interface SaveResult {
  success: boolean;
  message: string;
  savedFiles?: string[];
}
```

#### `types/ui.ts` - UI 관련 타입
```typescript
export interface DOMElements {
  // 버튼 요소들
  selectImageFolderBtn: HTMLButtonElement;
  selectLabelFolderBtn: HTMLButtonElement;
  loadClassInfoFolderBtn: HTMLButtonElement;
  saveLabelsBtn: HTMLButtonElement;
  downloadClassesBtn: HTMLButtonElement;
  
  // 입력 요소들
  imageSearchInput: HTMLInputElement;
  labelFontSizeSlider: HTMLInputElement;
  zoomInput: HTMLInputElement;
  coordXInput: HTMLInputElement;
  coordYInput: HTMLInputElement;
  
  // 선택 요소들
  classFileSelect: HTMLSelectElement;
  selectByClassDropdown: HTMLSelectElement;
  
  // 리스트 요소들
  imageList: HTMLUListElement;
  labelList: HTMLUListElement;
  labelFilters: HTMLDivElement;
  
  // 캔버스 관련
  canvasContainer: HTMLDivElement;
  
  // 패널 요소들
  leftPanel: HTMLDivElement;
  rightPanel: HTMLDivElement;
  bottomPanel: HTMLDivElement;
  
  // 기타 UI 요소들
  [key: string]: HTMLElement;
}

export interface ToastOptions {
  message: string;
  duration?: number;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface ModalOptions {
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}
```

### 2. 유틸리티 함수 (src/utils/)

#### `utils/index.ts` - 유틸리티 통합
```typescript
export * from './notifications';
export * from './color-palette';
export * from './validation';
export * from './file-helpers';
export * from './canvas-helpers';
```

#### `utils/notifications.ts` - 알림 시스템
```typescript
export function showToast(message: string, duration: number = 3000): void {
  // 기존 showToast 로직
}

export function showConfirmDialog(options: ModalOptions): Promise<boolean> {
  // 확인 대화상자
}

export function showErrorMessage(error: Error): void {
  // 에러 메시지 표시
}
```

#### `utils/color-palette.ts` - 색상 관리
```typescript
export const colorPalette: readonly string[] = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8',
  // ... 30개 색상
] as const;

export function getColorForClass(labelClass: string): string {
  const classNumber = parseInt(labelClass, 10);
  return isNaN(classNumber) || classNumber < 0 
    ? '#000000' 
    : colorPalette[classNumber % colorPalette.length];
}

export function generateRandomColor(): string {
  // 랜덤 색상 생성
}
```

#### `utils/validation.ts` - 유효성 검사
```typescript
export function validateLabelClass(input: string | null): string | null {
  // 기존 검증 로직
}

export function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/bmp'];
  return allowedTypes.includes(file.type);
}

export function validateYOLOFormat(content: string): boolean {
  // YOLO 포맷 검증
}
```

#### `utils/file-helpers.ts` - 파일 처리 도우미
```typescript
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'tif'];
  return imageExtensions.includes(getFileExtension(filename));
}

export function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}
```

#### `utils/canvas-helpers.ts` - 캔버스 도우미
```typescript
export function convertToYOLOFormat(
  bbox: BoundingBox, 
  imageWidth: number, 
  imageHeight: number
): YOLOLabel {
  // 바운딩 박스를 YOLO 포맷으로 변환
}

export function convertFromYOLOFormat(
  yolo: YOLOLabel,
  imageWidth: number,
  imageHeight: number
): BoundingBox {
  // YOLO 포맷에서 바운딩 박스로 변환
}

export function calculateDistance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
```

### 3. 데이터 모델 (src/models/)

#### `models/AppState.ts` - 상태 관리 클래스
```typescript
import { AppStateConfig } from '../types';

export class AppState implements AppStateConfig {
  // 모든 속성 구현
  
  constructor() {
    // 초기화
  }
  
  // 상태 업데이트 메서드들
  public setState(newState: Partial<AppStateConfig>): void {
    Object.assign(this, newState);
  }
  
  public reset(): void {
    // 상태 초기화
  }
  
  // 게터/세터 메서드들
  public getCurrentImage(): ImageFile | null {
    return this.currentImageFile;
  }
  
  public setCurrentImage(image: ImageFile | null): void {
    this.currentImageFile = image;
  }
}
```

### 4. 서비스 (src/services/)

#### `services/FileSystem.ts` - 파일 시스템 서비스
```typescript
export class FileSystem {
  constructor(
    private state: AppState,
    private uiManager: UIManager,
    private canvasController: CanvasController
  ) {}
  
  // 모든 파일 I/O 메서드들
  public async selectImageFolder(): Promise<void> {
    // 구현
  }
  
  public async saveLabels(): Promise<SaveResult> {
    // 구현
  }
  
  // ... 기타 메서드들
}
```

### 5. 컨트롤러 (src/controllers/)

#### `controllers/CanvasController.ts` - 캔버스 컨트롤러
```typescript
export class CanvasController {
  private canvas: fabric.Canvas;
  private state: CanvasState;
  
  constructor(
    private appState: AppState,
    private uiManager: UIManager,
    private fileSystem: FileSystem
  ) {}
  
  // 모든 캔버스 메서드들
}
```

#### `controllers/EventManager.ts` - 이벤트 매니저
```typescript
export class EventManager {
  constructor(
    private state: AppState,
    private ui: UIManager,
    private fileSystem: FileSystem,
    private canvas: CanvasController
  ) {}
  
  // 모든 이벤트 핸들러들
}
```

### 6. UI 관리 (src/ui/)

#### `ui/UIManager.ts` - UI 매니저
```typescript
export class UIManager {
  private elements: DOMElements;
  
  constructor(
    private state: AppState,
    private canvasController: CanvasController,
    private fileSystem: FileSystem
  ) {}
  
  // 모든 UI 메서드들
}
```

### 7. 메인 엔트리 (src/)

#### `main.ts` - 애플리케이션 엔트리 포인트
```typescript
import { App } from './App';

// 브라우저 호환성 체크
if (!('showDirectoryPicker' in window)) {
  console.error('File System Access API not supported');
}

// 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
  try {
    new App();
  } catch (error) {
    console.error('Failed to start application:', error);
  }
});
```

#### `App.ts` - 메인 애플리케이션 클래스
```typescript
export class App {
  private state: AppState;
  private canvasController: CanvasController;
  private uiManager: UIManager;
  private fileSystem: FileSystem;
  private eventManager: EventManager;
  
  constructor() {
    this.initializeApplication();
  }
  
  private initializeApplication(): void {
    // 의존성 주입 및 초기화
  }
}
```

---

## 🔄 마이그레이션 순서

### 1단계: 디렉토리 생성
```bash
mkdir -p src/{types,utils,models,services,controllers,ui}
mkdir -p {dist,tests,docs}
```

### 2단계: 파일 분리 순서
1. **types/** - 모든 타입 정의 먼저
2. **utils/** - 독립적인 유틸리티 함수
3. **models/** - 데이터 모델 (AppState)
4. **services/** - 비즈니스 로직 (FileSystem)
5. **controllers/** - 컨트롤러 (Canvas, Event)
6. **ui/** - UI 관리 (UIManager)
7. **main.ts** - 최종 통합

### 3단계: 기존 파일 처리
- `public/js/app.js` → 분해 후 삭제
- `public/index.html` → 빌드 결과물로 대체
- `public/css/style.css` → 유지 (필요시 SCSS 전환)

---

## 📝 체크리스트

### 준비 작업
- [ ] 백업 생성 (현재 코드)
- [ ] Git 브랜치 생성 (`feature/typescript-migration`)
- [ ] 개발 환경 설정

### 파일 생성
- [ ] 17개 TypeScript 파일 생성
- [ ] 설정 파일 생성 (tsconfig.json, webpack.config.js)
- [ ] 패키지 설정 업데이트

### 검증
- [ ] 타입 체크 통과
- [ ] 빌드 성공
- [ ] 기능 테스트 통과

---

**최종 목표**: 2,602줄 단일 파일 → 17개 모듈 파일로 체계적 분리

이 구조를 통해 유지보수성, 가독성, 재사용성이 크게 개선될 것입니다.