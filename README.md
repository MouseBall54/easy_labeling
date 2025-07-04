# Easy Labeling

"Easy Labeling" is a web-based image annotation tool designed for creating object detection datasets. It allows users to load images from their local file system, draw bounding boxes around objects, assign class labels, and save the annotations in the YOLO text format.

The application is primarily a client-side tool that runs in modern web browsers (like Chrome and Edge) and uses the File System Access API to interact with local files directly, eliminating the need for file uploads.

## Features

-   **Local File System Access**: Directly open and save to your local image and label folders without uploading files to a server.
-   **YOLO Format Support**: Annotations are saved in the widely-used YOLO `.txt` format.
-   **Multiple Image Format Support**: Works with standard formats (JPG, PNG, GIF) and TIFF (`.tif`, `.tiff`).
-   **Interactive Canvas**:
    -   Draw, edit, move, and resize bounding boxes.
    -   Zoom and pan for precise annotations.
    -   "Go to Coordinates" feature to navigate to specific points in an image.
-   **Efficient Workflow**:
    -   Auto-save functionality.
    -   Keyboard shortcuts for navigation (`A`/`D`), copy/paste (`Ctrl+C`/`Ctrl+V`), select all (`Ctrl+A`), and class changes (`Ctrl+B`).
    -   Synced selection between the canvas and the label list.
    -   Class-based filtering of labels.
-   **Enhanced Paste Functionality**: Pasted objects are now clamped within image boundaries and positioned relative to the mouse cursor.

## Prerequisites

-   [Node.js](https://nodejs.org/) (LTS version recommended)
-   A modern web browser that supports the File System Access API (e.g., Google Chrome, Microsoft Edge).

## Installation

1.  Clone the repository or download the source code.
2.  Open a terminal in the project's root directory.
3.  Install the required dependencies:
    ```bash
    npm install
    ```

## How to Run

1.  Start the server from the project's root directory:
    ```bash
    node server.js
    ```
2.  Open your web browser and navigate to `http://localhost:3000`.

## How to Use

1.  **Select Image Folder**: Click the "Select Image Folder" button and choose the directory containing your images. The file list will appear on the left panel.
2.  **Select Label Folder**: Click the "Select Label Folder" button and choose the directory where you want to save the annotation `.txt` files.
3.  **Annotate**:
    -   Click on an image from the list to load it onto the canvas.
    -   **Draw Mode**: Click and drag on the canvas to create a new bounding box. You will be prompted to enter a class ID.
    -   **Edit Mode**: Select, move, resize, or delete existing bounding boxes.
4.  **Saving**:
    -   **Manual Save**: Click the "Save Labels" button.
    -   **Auto-Save**: Enable the "Auto Save" toggle to automatically save any changes.
5.  **Navigation**:
    -   Use the `A` and `D` keys to move to the previous or next image in the list.
    -   Use the mouse wheel to zoom and `Alt`+`Drag` (or `Ctrl`+`Drag`) to pan the canvas.
