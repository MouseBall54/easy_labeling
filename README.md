# Easy Labeling

"Easy Labeling" is a web-based image annotation tool designed for creating object detection datasets. It allows users to load images from their local file system, draw bounding boxes around objects, assign class labels, and save the annotations in the YOLO text format.

The application is primarily a client-side tool that runs in modern web browsers (like Chrome and Edge) and uses the File System Access API to interact with local files directly, eliminating the need for file uploads.

## Features

-   **Local First**: Utilizes the File System Access API to work directly with your local image and label folders. No uploads required.
-   **Comprehensive Annotation Tools**:
    -   Draw, edit, move, resize, and delete bounding boxes.
    -   Dual modes for drawing and editing (`Ctrl+Q` to switch).
    -   Fine-grained control with zoom, pan, and the ability to go to specific coordinates.
    -   On-canvas class labels that can be toggled and resized.
-   **Efficient Workflow & UI**:
    -   **Collapsible & Resizable Panels**: Collapse the side panels to maximize your workspace and focus on the image.
    -   **Image Preview Bar**: A scrollable thumbnail bar at the bottom for quick navigation between nearby images.
    -   **Synced Selection**: Selections on the canvas and in the label list are always in sync.
    -   **Live Mouse Coordinates**: The current coordinates of your mouse on the image are displayed in the coordinate input fields, allowing for precise adjustments.
    -   Filter images by labeled/unlabeled status and filter annotations by class.
    -   Extensive keyboard shortcuts for navigation (`A`/`D`), clipboard (`Ctrl+C`/`V`), selection (`Ctrl+A`), and more.
-   **Advanced Label Management**:
    -   Load class names from `.yaml` files to see friendly names instead of just IDs.
    -   Switch between different class definition files on the fly and view their content in a built-in modal.
    -   Select all boxes of a specific class or change the class for multiple boxes at once.
-   **Flexible Configuration**:
    -   Supports standard image formats (JPG, PNG) plus TIFF (`.tif`, `.tiff`).
    -   Auto-save feature to prevent data loss.
    *   Persistent dark mode.

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
