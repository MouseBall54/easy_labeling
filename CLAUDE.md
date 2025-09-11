# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Easy Labeling is a web-based image annotation tool for creating object detection datasets. It's a client-side application that uses the File System Access API to work with local files, allowing users to draw bounding boxes, assign class labels, and save annotations in YOLO format.

## Development Commands

```bash
# Start the development server
node server.js

# Access the application
# Navigate to http://localhost:3000 in your browser

# Install dependencies
npm install
```

Note: The project currently has minimal npm scripts. The application runs as a static file server with a single JavaScript file.

## Architecture Overview

### Current Structure (Pre-TypeScript Migration)
The codebase is currently a **monolithic JavaScript application** with all logic contained in a single 2,602-line file (`public/js/app.js`). This represents a significant technical debt that the project is planning to address through TypeScript migration.

**Key Components:**
- **Server**: Simple Express static file server (`server.js` - 15 lines)
- **Frontend**: Single-page application with 6 main classes in `public/js/app.js`
- **UI**: Bootstrap-based responsive interface with dark mode support
- **Storage**: Browser File System Access API for local file management

### Core Class Architecture

The application follows a class-based architecture with dependency injection:

1. **AppState** (`app.js:53-80`)
   - Central state management for all application data
   - Manages file handles, image lists, UI state, and caching
   - Uses Maps for efficient data lookups (imageLabelStatus, classNames, previewImageCache)

2. **UIManager** (`app.js:87-815`)  
   - DOM manipulation and UI updates
   - Manages collapsible panels, modal windows, and Bootstrap components
   - Handles image/label list rendering and user interaction feedback

3. **FileSystem** (`app.js:816-1366`)
   - File I/O operations using File System Access API
   - YOLO format parsing and generation
   - YAML class file processing
   - Image loading with TIFF support via tiff.js

4. **CanvasController** (`app.js:1367-1950`)
   - Fabric.js canvas management
   - Bounding box drawing, editing, and manipulation
   - Zoom/pan controls and coordinate system management
   - Label visualization with dynamic font sizing

5. **EventManager** (`app.js:1951-2566`)
   - Keyboard shortcuts and mouse event handling
   - Context menu management
   - Multi-selection and batch operations

6. **App** (`app.js:2567-2603`)
   - Application bootstrapping and dependency injection
   - Cross-references between components are established after instantiation

### Key Technical Details

**Browser Dependencies:**
- Requires File System Access API (Chrome/Edge)
- Uses Fabric.js for canvas manipulation
- Bootstrap 5 for UI components
- Custom TIFF support via tiff.js CDN

**Data Flow:**
- File System Access API → FileSystem class → AppState → UI updates
- Canvas interactions → CanvasController → AppState → FileSystem (for auto-save)
- User actions → EventManager → appropriate controller → state updates

**Storage Format:**
- YOLO format text files (normalized coordinates)
- Optional YAML class definition files
- Local browser storage for UI preferences

## Migration Documentation

The project includes comprehensive TypeScript migration documentation in `docs/migration/`:

**Essential Reading Order:**
1. `docs/migration/ANALYSIS.md` - Current architecture analysis and migration rationale
2. `docs/migration/MIGRATION_ROADMAP.md` - 9-phase migration plan with 49 detailed tasks
3. `docs/migration/FILE_STRUCTURE.md` - Target TypeScript structure (17 modules)
4. `docs/migration/PROGRESS_TRACKER.md` - Real-time progress tracking template

**Migration Overview:**
- **Goal**: Transform 2,602-line monolithic JS into modular TypeScript
- **Phases**: 9 phases from environment setup to optimization
- **Timeline**: 15-25 days estimated
- **Structure**: src/ directory with types/, utils/, models/, services/, controllers/, ui/

**Key Migration Principles:**
- Preserve all existing functionality
- Maintain File System Access API integration
- Keep Fabric.js canvas system intact
- Implement proper TypeScript types for all data structures
- Establish modern build pipeline (Webpack/Vite)

## Development Workflow

**Current State:** The application works as a simple static file server. Changes to `public/js/app.js` require browser refresh.

**Future State (Post-Migration):** Will include TypeScript compilation, hot module replacement, and modern development tooling.

**File System Requirements:**
- Must use File System Access API for local file operations
- No file uploads - direct folder access only
- Supports JPG, PNG, TIFF image formats
- Generates YOLO format annotation files

## Critical Dependencies

**Runtime Dependencies:**
- Fabric.js 5.3.1 - Canvas manipulation (loaded via CDN)
- Bootstrap 5.3.3 - UI framework (loaded via CDN)
- tiff.js - TIFF image support (loaded via CDN)

**Browser APIs:**
- File System Access API (Chrome/Edge exclusive)
- Canvas API via Fabric.js
- Local Storage for preferences

## Important Constraints

- **Browser Limitation**: Only works in Chrome/Edge due to File System Access API
- **Local-First**: No server-side processing or cloud storage
- **Single-File Architecture**: Current codebase requires careful refactoring approach
- **Dependency Injection**: Components have circular dependencies that need careful untangling during migration

When working with this codebase, always consider the File System Access API limitations and the interconnected nature of the current class structure.