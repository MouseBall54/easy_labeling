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
    *   **Framework**: Express.js (`^5.1.0`)
    *   **Purpose**: The backend is minimal and only serves the static frontend files. There is no complex server-side logic.

## 3. File Structure

*   `server.js`: The Node.js/Express server entry point. Its sole responsibility is to serve the static files from the `public` directory.
*   `public/`: Contains all client-side assets.
    *   `index.html`: The main HTML file for the application structure.
    *   `css/style.css`: Custom styles for the application.
    *   `js/app.js`: The core of the application. It manages the UI, canvas, file system interactions, and application state.
*   `WORKLOG.md`: A manually maintained log of significant work items.
*   `GEMINI.md`: This file, containing the project context and a log of Gemini's activities.

## 4. Key Architectural Patterns & Conventions

*   **UI Layout**:
    *   The application uses a **three-panel layout** managed by Flexbox.
    *   **Left Panel (`#left-panel`)**: Contains file/folder selection, image list, and primary controls (save, zoom, mode).
    *   **Center Panel (`#canvas-container`)**: The main canvas area for image display and annotation.
    *   **Right Panel (`#right-panel`)**: Displays label filters and the list of labels for the current image.
    *   Both left and right panels are resizable using custom splitter elements (`#left-splitter`, `#right-splitter`).

*   **Client-Side Heavy**: Almost all logic (file reading, canvas drawing, label saving) is handled in the browser.

*   **State Management**: Application state is managed through a series of classes (`AppState`, `UIManager`, `FileSystem`, `CanvasController`) instantiated within the main `DOMContentLoaded` event listener in `public/js/app.js`.

*   **Event-Driven**: The application relies heavily on DOM events and Fabric.js canvas events (e.g., `mouse:down`, `object:modified`, `selection:created`) to trigger actions.

*   **YOLO Format**: Labels are saved in the YOLO format: `<class_id> <x_center> <y_center> <width> <height>`, with values normalized to the image dimensions and stored with high precision (15 decimal places).

*   **Auto-Save**: When enabled, saves the labels of the previous image automatically upon switching to a new one. This prevents data loss while avoiding interruptions during multi-selection tasks.

## 5. Key Features

This is a detailed list of features identified from the source code.

### 5.1. File and Folder Management
*   **Local File System Access**: Utilizes the File System Access API to directly open and manage local folders without file uploads.
*   **Folder Selection**:
    *   Select separate folders for images and YOLO `.txt` labels.
    *   Select a folder containing class definition files (e.g., `.yaml`, `.yml`).
*   **Image Support**:
    *   Loads standard formats (JPG, PNG, GIF) and TIFF (`.tif`, `.tiff`).
    *   The image list is sorted using natural sort order (e.g., `img2.jpg` before `img10.jpg`).
*   **Class Definition Management**:
    *   Load class names and IDs from `.yaml` or `.yml` files.
    *   A dropdown allows switching between multiple class files found in the selected folder.
    *   A built-in viewer modal displays the content of the selected class file.
    *   A feature to download a `custom-classes.yaml` template file.

### 5.2. Annotation Canvas (Main Workspace)
*   **Dual Modes**:
    *   **Edit Mode**: Select, move, resize, and delete bounding boxes. This is the default mode.
    *   **Draw Mode**: Create new bounding boxes.
    *   Switch between modes using UI buttons or the `Ctrl+Q` shortcut.
*   **Zoom & Pan**:
    *   Zoom with UI buttons or the mouse wheel.
    *   Pan the canvas by holding `Alt+Drag` or `Ctrl+Drag`.
    *   Reset zoom to fit the image to the view.
*   **Navigation**:
    *   "Go to Coordinates" feature to jump to a specific point on the image.
    *   The current mouse coordinates on the image are displayed in the navbar.
*   **Clipboard**:
    *   Copy (`Ctrl+C`) and paste (`Ctrl+V`) single or multiple bounding boxes.
    *   Pasted objects are positioned relative to the mouse cursor's location on the canvas.

### 5.3. Bounding Box and Label Handling
*   **Labeling**:
    *   When creating a box, a prompt appears to enter the class ID.
    *   Class IDs can be edited by double-clicking a box or selecting it and pressing `Ctrl+B`.
*   **On-Canvas Labels**:
    *   Class information (ID and name, if available) is displayed directly on the canvas above each box.
    *   This display can be toggled on/off.
    *   The font size for these labels is adjustable.
*   **Advanced Selection**:
    *   Select all boxes (`Ctrl+A`).
    *   Select all boxes of a specific class using a dropdown menu.
    *   Move selected boxes pixel by pixel with arrow keys (or 10px increments with `Shift`).
*   **Deletion**: Delete selected boxes using the `Delete` or `Backspace` key.

### 5.4. UI and Workflow
*   **Resizable Three-Panel Layout**: Left (files), Center (canvas), and Right (labels/filters) panels can be resized.
*   **Image List Filtering**:
    *   Filter images by filename.
    *   Filter images based on their labeled or unlabeled status.
*   **Label List (Right Panel)**:
    *   Displays a list of all annotations for the current image.
    *   **Synced Selection**: Selections on the canvas and in the list are synchronized.
    *   **Sorting**: Sort the label list by class ID (ascending/descending).
    *   **Multi-select**: Drag-to-select a range of items in the list.
    *   Quickly edit or delete labels with buttons on each list item.
*   **Label Filtering (Right Panel)**:
    *   Filter the visible boxes on the canvas and in the list by their class.
*   **Dark Mode**: A toggle switch to enable dark mode, with the preference saved in `localStorage`.
*   **Keyboard Shortcuts**: Extensive shortcuts for navigation (`A`/`D`), saving (`Ctrl+S`), mode switching (`Ctrl+Q`), selection, and clipboard actions.
*   **Toast Notifications**: Provides unobtrusive feedback for actions like saving or errors.


## 5. 작업 기록

### Gemini 어시스턴트의 역할
저의 역할은 이 프로젝트의 개발을 지원하는 것입니다. 저는 수행된 모든 작업을 문서화하기 위해 이 "작업 기록" 섹션을 유지하여 변경 및 결정 사항에 대한 명확한 내역을 보장합니다. 이 로그는 세션 중에 계속 업데이트됩니다.

### 2025년 7월 6일
*   **작업**: 이미지 폴더 로딩 성능 개선
*   **세부 정보**:
    *   `public/js/app.js`의 `listImageFiles` 함수 로직을 변경했습니다.
    *   기존에는 이미지 목록을 불러올 때 각 이미지 파일마다 레이블 파일(.txt)의 존재 여부를 개별적으로 확인하여, 이미지 수가 많을 경우 로딩 시간이 길어지는 문제가 있었습니다.
    *   개선된 로직에서는 레이블 폴더의 모든 `.txt` 파일 이름을 미리 한 번에 읽어와 `Set` 객체에 저장한 뒤, 메모리에서 빠르게 존재 여부를 확인하도록 수정했습니다.
    *   이로 인해 수백, 수천 번의 파일 시스템 접근이 단 한 번으로 줄어들어 이미지 폴더 초기 로딩 속도가 크게 향상되었습니다.
    *   더 이상 사용되지 않는 `checkLabelStatus` 함수를 코드에서 제거하여 정리했습니다.
*   **작업**: 이미지 미리보기 창 동작 수정
*   **세부 정보**:
    *   `public/css/style.css`에서 `#preview-bar`의 배경색 `rgba` 값을 `0.5`에서 `0.2`로 변경하여 더 투명하게 만들었습니다.
    *   `public/js/app.js`의 `init` 함수를 수정하여, 애플리케이션 시작 시에는 미리보기 창을 숨기고 이미지 폴더를 로드했을 때만 나타나도록 변경했습니다.
    *   `public/js/app.js`의 `EventManager`에서 미리보기 창의 `<` 및 `>` 버튼 이벤트 리스너를 `scrollPreview`에서 `navigateImage`로 변경하여, 키보드 `A`/`D` 키와 동일하게 이전/다음 이미지로 넘어가도록 기능을 수정했습니다.

### 2025년 7월 4일
*   **작업**: "이슈 레이블" 강조 및 필터 기능 제거
*   **세부 정보**:
    *   `public/index.html`에서 "Show Issue Filter" 토글을 제거했습니다.
    *   `public/js/app.js`에서 관련 로직을 모두 제거했습니다:
        *   `AppState`에서 `isIssueFilterVisible` 속성을 제거했습니다.
        *   `UIManager.getDOMElements`에서 토글을 제거했습니다.
        *   `UIManager.updateLabelList` 및 `UIManager.updateLabelFilters`에서 이슈 관련 로직을 제거했습니다.
        *   `CanvasController`에서 `highlightIssueBoxes` 메서드를 제거하고 `highlightSelection`으로 대체하여 선택된 객체만 강조하도록 했습니다.
        *   `EventManager`에서 관련 이벤트 리스너를 제거했습니다.
*   **작업**: "클래스 정보 폴더 로드" 및 "클래스 파일 뷰어" 기능 개선
*   **세부 정보**:
    *   "Load Class Info Folder" 버튼을 왼쪽 패널에서 오른쪽 "Labels" 패널 상단으로 이동시켰습니다.
    *   버튼의 색상을 `btn-info`에서 `btn-outline-primary`로 변경하여 UI의 다른 부분과 조화를 이루도록 했습니다.
    *   `public/index.html`의 오른쪽 패널에서 기존 "Load .yaml" 버튼을 제거했습니다.
    *   `public/index.html`에 클래스 파일을 선택할 수 있는 드롭다운 메뉴와 선택된 파일의 내용을 볼 수 있는 "View" 버튼을 추가했습니다.
    *   파일 내용을 표시하기 위해 `public/index.html`에 Bootstrap 모달을 추가했습니다.
    *   새로운 기능을 처리하도록 `public/js/app.js`를 수정했습니다:
        *   클래스 정보 폴더 핸들 및 파일 목록을 관리하도록 `AppState`를 업데이트했습니다.
        *   새 UI 요소(드롭다운, 보기 버튼, 모달)를 가져오고 클래스 파일 드롭다운을 렌더링하도록 `UIManager`를 업데이트했습니다.
        *   `FileSystem`의 `loadClassNames`를 `selectClassInfoFolder`, `listClassFiles`, `loadClassNamesFromFile`로 교체하여 디렉터리 선택 및 파일 처리를 처리하도록 했습니다.
        *   선택된 클래스 파일의 내용을 읽고 모달에 표시하는 `showClassFileContent` 메서드를 `FileSystem`에 추가했습니다.
        *   새 버튼과 드롭다운에 이벤트를 바인딩하도록 `EventManager`를 업데이트했습니다.
    *   이제 사용자는 `.yaml` 클래스 정의 파일이 포함된 폴더를 선택할 수 있으며, 이 파일들은 드롭다운에 나열됩니다. 드롭다운에서 파일을 선택하면 클래스 이름이 로드되어 레이블에 적용되고, "View" 버튼을 클릭하여 파일 내용을 확인할 수 있습니다.

### 2025년 7월 2일
*   **작업**: 붙여넣기 기능 수정
*   **세부 정보**:
    *   `public/js/app.js`의 `paste` 함수를 수정했습니다.
    *   이제 객체를 붙여넣을 때 마우스 커서가 이미지 영역 내에 있으면 해당 이미지 좌표에 붙여넣어지고, 그렇지 않으면 (0, 0) 위치에 붙여넣어집니다.
*   **작업**: 프로젝트 분석 및 정리
*   **세부 정보**:
    *   `package.json` 및 `package-lock.json`을 분석하여 `GEMINI.md`의 Express.js 버전을 `^5.1.0`으로 업데이트했습니다.
    *   중복되고 사용되지 않는 `js/app.js` 파일을 식별하고 삭제했습니다.
    *   프로젝트 구조를 명확히 하기 위해 `GEMINI.md`에 "File Structure" 섹션을 추가했습니다.
    *   `WORKLOG.md` 파일에 대한 참조를 추가했습니다.

### 2025년 7월 1일
*   **작업**: 프로젝트 분석 및 설정
*   **세부 정보**:
    *   세션을 초기화하고 프로젝트 파일 구조를 검토했습니다.
    *   `public/js/app.js`의 핵심 애플리케이션 로직, `server.js`의 서버 설정, `public/index.html`의 UI 구조를 분석했습니다.
    *   이 프로젝트가 파일 시스템 접근 API를 사용하는 클라이언트 측 중심의 웹 애플리케케이션임을 확인했습니다.
    *   요청에 따라 모든 향후 활동을 문서화하기 위해 `GEMINI.md`에 이 "작업 기록"을 설정했습니다.

### 2025년 7월 1일 (계속)
*   **작업**: 'Auto Save' 기능 수정
*   **세부 정보**:
    *   실시간 'Auto Save' 기능이 다중 선택을 방해하는 문제를 해결했습니다.
    *   `triggerAutoSave` 함수와 관련된 모든 호출을 `public/js/app.js`에서 제거했습니다.
    *   `loadImageAndLabels` 함수를 수정하여, 'Auto Save'가 활성화된 경우 이미지를 전환할 때만 이전 이미지의 레이블이 저장되도록 변경했습니다.
    *   이를 통해 사용자는 다중 선택이 풀리는 문제 없이 객체를 편집할 수 있으며, 작업 내용은 이미지 이동 시 안전하게 저장됩니다.
