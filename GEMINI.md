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