# Easy Labeling

"Easy Labeling" is a web-based image annotation tool designed for creating object detection datasets. It allows users to load images from their local file system, draw bounding boxes around objects, assign class labels, and save the annotations in the YOLO text format.

The application is a pure client-side tool that runs in modern web browsers (like Chrome and Edge) and uses the File System Access API to interact with local files directly, eliminating the need for file uploads.

## How to Use

**No installation required!**

Simply open the application in your web browser by visiting the following URL:

**[https://mouseball54.github.io/easy_labeling/](https://mouseball54.github.io/easy_labeling/)**

### Basic Usage Guide

1.  **Load Folders**:
    -   Click **Load Image Folder** and select your image directory.
    -   Click **Load Label Folder** to select your annotations folder. (This may be found automatically if it's a subfolder named `label`).
    -   (Optional) Click **Load Class Info Folder** and select a folder with `.yaml` files for class names.
2.  **Annotate**:
    -   Select an image from the list on the left.
    -   Switch to **Draw Mode** (`Ctrl+Q` or `Right-Click` on the canvas) and drag to create a box. Enter a class ID when prompted.
    -   Switch to **Edit Mode** (`Ctrl+Q` or `Right-Click` on the canvas) to select, move, resize, or delete boxes.
3.  **Navigate & Save**:
    -   Use the `A` and `D` keys to cycle through images.
    -   Enable **Auto Save** for convenience or press `Ctrl+S` to save manually.

## Key Features

### 1. File and Folder Management

-   **Local-First Approach**: Works directly with your local folders.
    -   **Load Image Folder**: Load images from your computer. The tool supports `.jpg`, `.png`, `.gif`, and `.tiff`/`.tif` formats.
    -   **Load Label Folder**: Specify a folder to save YOLO `.txt` annotation files. If a subfolder named `label` exists in the image folder, it's loaded automatically. If it doesn't exist, the application will offer to create it for you.
-   **Class Definition Files**:
    -   **Load Class Info Folder**: Load class definitions from `.yaml` or `.yml` files. This allows you to see descriptive names (e.g., "person", "car") instead of just numeric IDs.
    -   **Class File Switcher**: A dropdown menu appears if multiple `.yaml` files are found, letting you switch between them.
    -   **Class File Creator/Editor**: Create new `.yaml` class files or edit existing ones directly within the application. A modal editor allows you to add, modify, or delete class ID and name pairs.
    -   **Download Template**: Download a `custom-classes.yaml` template to get started.
-   **Auto-Save**: Toggle the "Auto Save" feature to automatically save labels for the previous image when you navigate to a new one, preventing data loss.
-   **Manual Save**: Save the current labels at any time with the "Save Labels" button (`Ctrl+S`).

### 2. Annotation Canvas & Tools

-   **Dual Annotation Modes**:
    -   **Edit Mode** (Default, `Ctrl+Q`): Select, move, resize, and delete bounding boxes.
    -   **Draw Mode** (`Ctrl+Q`): Create new bounding boxes by clicking and dragging.
-   **Zoom & Pan**:
    -   **Zoom**: Use the zoom buttons or the **mouse wheel**. You can also enter a specific zoom percentage.
    -   **Pan**: Hold `Alt` or `Ctrl` and drag the mouse to pan the image.
    -   **Reset Zoom**: Fit the image perfectly to the canvas view.
-   **Coordinate Navigation**:
    -   **Go to Coordinates**: Instantly jump to a specific `(X, Y)` coordinate on the image.
    -   **Live Coordinate Display**: The coordinate inputs in the top bar update in real-time to show your mouse's current position on the image.
-   **Crosshair**: Toggle a full-canvas crosshair to help with precise alignment.
-   **Clipboard**:
    -   **Copy**: Copy selected boxes (`Ctrl+C`).
    -   **Paste**: Paste copied boxes at the cursor's location (`Ctrl+V`).
-   **Labeling**:
    -   When creating a box, a modal appears to enter the class ID. You can type an ID or click a pre-defined class button.
    -   Change a box's label by double-clicking it, pressing `Ctrl+B`, or using the context menu.

### 3. Bounding Box & Label Interaction

-   **On-Canvas Labels**:
    -   Class information (ID and name) is displayed directly above each box.
    -   **Toggle Visibility**: Show or hide these on-canvas labels.
    -   **Adjust Font Size**: Use the slider to make the labels larger or smaller.
-   **Advanced Selection**:
    -   **Select All**: Select all boxes on the image (`Ctrl+A`).
    -   **Select by Class**: Use the dropdown in the right panel to select all boxes of a specific class.
    -   **Group Selection**: Click the checkmark icon in a label group header to select all boxes of that class.
-   **Pixel-Perfect Movement**:
    -   Move selected boxes by 1 pixel using the **Arrow Keys**.
    -   Move by 10 pixels with `Shift` + **Arrow Keys**.
-   **Deletion**:
    -   Delete selected boxes using the `Delete` or `Backspace` key.
    -   Delete individual boxes from the label list or via the context menu.
-   **Context Menu**: 
    -   **On a Bounding Box**: **Right-click** a box to open a menu to change its label or delete it.
    -   **On Canvas**: **Right-click** on any empty area of the canvas to quickly switch between **Edit Mode** and **Draw Mode**.

### 4. UI and Workflow

-   **Resizable & Collapsible Panels**: Drag the splitters to resize the left and right panels, or click the collapse buttons (`<<` / `>>`) to hide them completely for a larger workspace.
-   **Image List Filtering**:
    -   **Search**: Filter the image list by filename.
    -   **Status Filter**: Show only labeled, only unlabeled, or all images.
-   **Image Preview Bar**:
    -   A scrollable thumbnail bar at the bottom shows previews of nearby images for quick navigation.
    -   This bar can be hidden and shown to save space.
-   **Label List (Right Panel)**:
    -   Displays a list of all annotations, grouped by class.
    -   **Synced Selection**: Selections on the canvas and in the list are synchronized.
    -   **Sorting**: Sort the label groups by class ID (ascending/descending).
    -   **Multi-select**: Click and drag to select a range of items in the list.
-   **Label Filtering (Right Panel)**:
    -   Filter the visible boxes on the canvas by class. Click the "All" button or individual class buttons to toggle visibility.
-   **Dark Mode**: A toggle switch to enable dark mode. Your preference is saved locally.

## Controls (Keyboard & Mouse)

| Action                      | Control (Keyboard / Mouse)     |
| --------------------------- | ------------------------------ |
| **Navigation**              |                                |
| Next/Previous Image         | `D` / `A`                      |
| Pan Image                   | `Alt` + `Drag` or `Ctrl` + `Drag`|
| Zoom In/Out                 | `Mouse Wheel`                  |
| **Mode & Saving**           |                                |
| Switch Draw/Edit Mode       | `Ctrl + Q` or `Right-Click` on Canvas |
| Save Labels                 | `Ctrl + S`                     |
| **Selection & Clipboard**   |                                |
| Select All Boxes            | `Ctrl + A`                     |
| Copy Selection              | `Ctrl + C`                     |
| Paste Selection             | `Ctrl + V`                     |
| **Box Manipulation**        |                                |
| Change Label(s)             | `Ctrl + B` or `Double-Click` on Box |
| Open Context Menu           | `Right-Click` on Box           |
| Delete Selection            | `Delete` or `Backspace`        |
| Move 1px                    | `Arrow Keys`                   |
| Move 10px                   | `Shift` + `Arrow Keys`         |
| **General**                 |                                |
| Discard Selection           | `Escape`                       |

## For Local Development

If you want to run the application locally or contribute to the development, follow these steps.

### Prerequisites

-   [Node.js](https://nodejs.org/) (LTS version recommended)
-   A modern web browser that supports the File System Access API (e.g., Google Chrome, Microsoft Edge).

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/MouseBall54/easy_labeling.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd easy_labeling
    ```
3.  Install the required dependencies:
    ```bash
    npm install
    ```

### Running Locally

1.  Start the local development server:
    ```bash
    npm start
    ```
2.  Your web browser will automatically open the application.