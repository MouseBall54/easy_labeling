# Easy Labeling

Easy Labeling은 **로컬 이미지 주석(Annotation) 작업**을 위한 웹 도구입니다.  
현재는 단일 Detection 도구가 아니라, 아래 2개 워크플로우를 지원합니다.

- **Detection**: YOLO Bounding Box 작업
- **Segmentation**: 브러시 기반 마스크 작업

> 기본 문서 언어는 한국어입니다.

UI·UX 개선을 이어서 작업할 때는 [진행 기록](docs/UI_UX_PROGRESS_KO.md)과 [점검 보고서](docs/UI_UX_AUDIT_20261006_KO.md)를 먼저 확인하세요. 항목별 상태·검증·다음 단계와 변경 이력을 기록합니다.

## 바로 사용하기

- 서비스 URL: **https://mouseball54.github.io/easy_labeling/**
- 별도 설치 없이 브라우저에서 실행 가능
- 권장 브라우저: **Desktop Chrome / Edge** (File System Access API 필요)

## 로컬 실행

YOLOE-26 ONNX 버전의 사용법과 모델 갱신 방법은 [YOLOE-26 GPU/CPU 안내](docs/YOLOE26_GPU_KO.md)를 참고하세요. 일반 실행과 설치형 앱은 Python 서비스 없이 동작합니다.

- 의존성 설치: `npm install`
- 일반 실행: `npm start`
- 개발 모드(빌드 watch + 로컬 서버): `npm run dev`
- 접속 주소: `http://127.0.0.1:4173`

## Windows 설치형 앱(Electron)

개발 PC에 Node.js 22.12 이상을 준비하고, 프로젝트 루트에서 `npm ci`로 빌드 의존성을 설치합니다. 만들 설치 버전에 맞춰 아래 명령을 선택하세요.

| 설치 버전 | 설치파일 빌드 명령 | 출력 위치 | YOLOE-26 모델 |
| --- | --- | --- | --- |
| 일반 버전 (2.1.0) | `npm run electron:dist:win` | `release/` | 제외 |
| YOLOE-26 버전 (2.2.0) | `npm run electron:dist:yoloe:win` | `release/yoloe26/` | N/S/M/L ONNX 모델 모두 포함 |

현재 설정으로 빌드하면 YOLOE-26 설치파일 이름은 `Easy-Labeling-YOLOE26-Setup-2.2.0-x64.exe`입니다. 빌드 명령은 Git에 포함된 ONNX 모델을 검증하고 설치파일에 넣습니다. 모델 다운로드나 Python을 통한 변환은 필요하지 않습니다.

이번 소스 버전에는 Detection 다중 붙여넣기 위치·선택 묶음 수정, 클래스 색 편집·저장, 팝업 헤더 드래그 이동이 포함됩니다. 소스 검증과 새 설치파일 제작·검증은 별개이며 [진행 기록의 U24~U26](docs/UI_UX_PROGRESS_KO.md#추가-결함-u24--detection-다중-선택-붙여넣기)에 완료 기준과 결과를 기록했습니다.

설치 후에는 별도 Python, PyTorch, npm, CUDA Toolkit 설치나 모델 다운로드 없이 실행합니다. YOLOE-26은 GPU를 사용할 수 있으면 WebGPU로 실행하고, 사용할 수 없으면 CPU/WASM으로 실행합니다. 모델을 교체하기 위한 개발자용 내보내기 절차는 [YOLOE-26 안내](docs/YOLOE26_GPU_KO.md#모델을-교체하는-개발자만-필요한-내보내기)를 참고하세요.

- Electron 개발 실행: `npm run electron:dev`
- 일반 버전 Windows 실행 파일 디렉터리(설치 없이): `npm run electron:pack`

> 현재 설정은 `x64` 타깃, 무서명(Unsigned) 빌드입니다.
> 브라우저 `showDirectoryPicker`는 Electron preload 폴리필로 동작합니다.

---

## 핵심 동작 방식

### 1) 로컬 폴더 기반 작업

- 이미지 폴더를 기준으로 작업하며, 파일 업로드 서버가 없습니다.
- 브라우저에서 로컬 폴더를 직접 선택해 읽기/쓰기 합니다.
- 자동 저장(Auto Save) 또는 수동 저장(Ctrl+S) 지원

### 2) 2개 워크플로우 탭

- 상단 탭에서 `Detection / Segmentation` 전환
- 왼쪽 `Annotate`(Detection) / `Mask`(Segmentation)에서 데이터셋 열기, 라벨 폴더 연결, 클래스 파일 관리와 편집을 함께 진행합니다. 별도 Files 탭은 통합했습니다. `Labeled / Unlabeled`는 함께 켜거나 끌 수 있는 이미지 상태 필터입니다.

### 3) 공통 편의 기능

- 이미지 검색/상태 필터(라벨 있음/없음)
- 하단 이미지 미리보기 바(토글/이전/다음)
- 확대/축소, 팬(Alt/Ctrl+드래그), 좌표 이동
- 패널 접기/펼치기 및 분할선 리사이즈
- 다크 모드, 크로스헤어

---

## 워크플로우별 기능

## Detection

- YOLO Bounding Box 생성/수정/삭제
- 클래스 변경(`Ctrl+B`, 더블클릭, 컨텍스트 메뉴)
- 다중 선택, 클래스별 선택, 그룹 선택
- 클래스별 가시성 필터
- 복사/붙여넣기(`Ctrl+C`, `Ctrl+V`)
- 화살표 키 이동(1px), `Shift+화살표`(10px)
- 정렬/분배 도구(좌/우/상/하 정렬, 가로/세로 분배)
- Undo/Redo

### Detection 저장 형식

- `label/<image>.txt` (YOLO)

## Segmentation

- 브러시/지우개 기반 마스크 편집
- 브러시/지우개 크기 슬라이더 + 프리셋
- 마스크 오버레이 표시/숨김 + 투명도
- 클래스 필터(All/클래스별 단독 표시) + 클래스 가시성 토글
- Edit 모드에서 연결 영역(connected region) 선택
- 선택 영역 드래그 이동
- 선택 영역 클래스 변경
  - 버튼(`Change Class of Painted Region`)
  - 더블클릭(Edit 모드)
  - `Ctrl+B`
- Undo/Redo

### Segmentation 저장 형식

- `mask/<image>.png`
- `mask/<image>.seg.json`

### Segmentation 제한 사항(현재)

- Detection 전용 박스 기능(예: 박스 리스트 기반 다중 편집/정렬/복붙)은 동일하게 제공되지 않습니다.
- Segmentation 삭제는 `Delete` 키 중심이 아니라 **지우개 도구** 중심입니다.

## 클래스 파일(YAML) 기능

- 클래스 정보 폴더 로드(`.yaml`/`.yml`)
- 클래스 파일 선택 전환
- 클래스 파일 생성 / 편집 모달 지원

---

## 키보드/마우스 단축키

## 공통

- 이전/다음 이미지: `A` / `D`
- 저장: `Ctrl+S` (`Cmd+S`)
- 모드 전환(Draw/Edit): `Ctrl+Q` (`Cmd+Q`)
- Undo/Redo: `Ctrl+Z`, `Ctrl+Y`, `Ctrl+Shift+Z` (`Cmd` 대응)
- 확대/축소: 마우스 휠
- 팬: `Alt + Drag` 또는 `Ctrl + Drag`
- 선택 해제: `Esc`

## Detection 중심

- 전체 선택: `Ctrl+A` (`Cmd+A`)
- 복사/붙여넣기: `Ctrl+C` / `Ctrl+V`
- 클래스 변경: `Ctrl+B` 또는 더블클릭
- 삭제: `Delete` / `Backspace`
- 이동: 화살표(1px), `Shift+화살표`(10px)
- 정렬/분배: `Alt+Shift+L/R/T/D/H/V`

## Segmentation 중심

- 클래스 변경: `Ctrl+B` 또는 더블클릭(Edit 모드)
- 영역 이동: Edit 모드에서 영역 선택 후 드래그

---

## 디렉터리/배포 참고

- GitHub Pages 운영 가이드: [`GITHUB_PAGES_GUIDELINES.md`](./GITHUB_PAGES_GUIDELINES.md)
- GitHub Actions Pages 배포 워크플로우: `.github/workflows/deploy-pages.yml`

---

## 주의 사항

- 모바일 및 일부 브라우저에서는 File System Access API 제한으로 기능이 제한될 수 있습니다.
- 본 프로젝트는 로컬 파일 기반 툴이므로, 브라우저 권한 허용 및 지원 브라우저 사용이 중요합니다.
