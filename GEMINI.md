# Gemini Project Context: Easy Labeling

## 1. Project Overview

"Easy Labeling" is a web-based image annotation tool designed for creating object detection datasets. It allows users to load images from their local file system, draw bounding boxes around objects, assign class labels, and save the annotations in the YOLO text format.

The application is primarily a client-side tool that runs in modern web browsers (like Chrome and Edge) and uses the File System Access API to interact with local files directly, eliminating the need for file uploads.

## 2. Core Technologies

*   **Frontend**:
    *   **Framework/Libraries**: Vanilla JavaScript, [Fabric.js](https://fabricjs.com/) for canvas manipulation, [Bootstrap 5](https://getbootstrap.com/) for UI components.
    *   **APIs**: File System Access API is a core feature for local file handling.
    *   **File Support**: Standard images (JPG, PNG) and TIFF (`.tif`, `.tiff`) files via `tiff.js`.
*   **Backend**:
    *   **Runtime**: Node.js
    *   **Framework**: Express.js
    *   **Purpose**: The backend is minimal and only serves the static frontend files (`index.html`, `app.js`, `style.css`). There is no complex server-side logic.
*   **Development**:
    *   The main application logic is contained within `public/js/app.js`.
    *   The server entry point is `server.js`.

## 3. Key Architectural Patterns & Conventions

*   **UI Layout**:
    *   The application uses a **three-panel layout** managed by Flexbox.
    *   **Left Panel (`#left-panel`)**: Contains file/folder selection, image list, and primary controls (save, zoom, mode).
    *   **Center Panel (`#canvas-container`)**: The main canvas area for image display and annotation.
    *   **Right Panel (`#right-panel`)**: Displays label filters and the list of labels for the current image.
    *   Both left and right panels are resizable using custom splitter elements (`#left-splitter`, `#right-splitter`).

*   **Client-Side Heavy**: Almost all logic (file reading, canvas drawing, label saving) is handled in the browser.

*   **State Management**: Application state (e.g., selected folders, current image, labels) is managed using variables within the main `DOMContentLoaded` event listener scope in `app.js`.

*   **Event-Driven**: The application relies heavily on DOM events and Fabric.js canvas events (e.g., `mouse:down`, `object:modified`, `selection:created`) to trigger actions.

*   **Key UI Features**:
    *   **Synced Selections**: Selecting a bounding box on the canvas automatically highlights and scrolls to the corresponding item in the right-hand label list, and vice-versa.
    *   **Natural Sort**: The image file list is sorted using natural sort order (`localeCompare`), so `image2.jpg` comes before `image10.jpg`.
    *   **Navbar Info Display**: The top navigation bar shows the currently loaded image name and provides controls for coordinate-based navigation and zoom level display.

*   **YOLO Format**: Labels are saved in the YOLO format: `<class_id> <x_center> <y_center> <width> <height>`, with values normalized to the image dimensions and stored with high precision (10 decimal places).

*   **Auto-Save**: Changes to labels (creation, modification, deletion) trigger an automatic save to the corresponding `.txt` file if the feature is enabled.

## 4. 작업 기록

### Gemini 어시스턴트의 역할
저의 역할은 이 프로젝트의 개발을 지원하는 것입니다. 저는 수행된 모든 작업을 문서화하기 위해 이 "작업 기록" 섹션을 유지하여 변경 및 결정 사항에 대한 명확한 내역을 보장합니다. 이 로그는 세션 중에 계속 업데이트됩니다.

### 2025년 7월 1일
*   **작업**: 프로젝트 분석 및 설정
*   **세부 정보**:
    *   세션을 초기화하고 프로젝트 파일 구조를 검토했습니다.
    *   `public/js/app.js`의 핵심 애플리케이션 로직, `server.js`의 서버 설정, `public/index.html`의 UI 구조를 분석했습니다.
    *   이 프로젝트가 파일 시스템 접근 API를 사용하는 클라이언트 측 중심의 웹 애플리케이션임을 확인했습니다.
    *   요청에 따라 모든 향후 활동을 문서화하기 위해 `GEMINI.md`에 이 "작업 기록"을 설정했습니다.

### 2025년 7월 1일 (계속)
*   **작업**: 'Auto Save' 기능 수정
*   **세부 정보**:
    *   실시간 'Auto Save' 기능이 다중 선택을 방해하는 문제를 해결했습니다.
    *   `triggerAutoSave` 함수와 관련된 모든 호출을 `public/js/app.js`에서 제거했습니다.
    *   `loadImageAndLabels` 함수를 수정하여, 'Auto Save'가 활성화된 경우 이미지를 전환할 때만 이전 이미지의 레이블이 저장되도록 변경했습니다.
    *   이를 통해 사용자는 다중 선택이 풀리는 문제 없이 객체를 편집할 수 있으며, 작업 내용은 이미지 이동 시 안전하게 저장됩니다.
