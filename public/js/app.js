// =================================================================================
// Utility Functions
// =================================================================================

function showToast(message, duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

const colorPalette = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000', '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'];

function getColorForClass(labelClass) {
    const classNumber = parseInt(labelClass, 10);
    return isNaN(classNumber) || classNumber < 0 ? '#000000' : colorPalette[classNumber % colorPalette.length];
}

function validateLabelClass(input) {
    if (input === null) return null; // User cancelled prompt

    const trimmedInput = input.trim();
    if (trimmedInput === '') {
        showToast('Label class cannot be empty.', 3000);
        return null;
    }

    const num = Number(trimmedInput);

    if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 10000) {
        showToast('Invalid Label: Please enter an integer between 0 and 10000.', 4000);
        return null;
    }

    return String(num);
}


// =================================================================================
// Application State
// ==================================================================================

class AppState {
    constructor() {
        this.imageFolderHandle = null;
        this.labelFolderHandle = null;
        this.classInfoFolderHandle = null;
        this.imageFiles = [];
        this.classFiles = [];
        this.selectedClassFile = null;
        this.imageLabelStatus = new Map(); // <fileName, boolean>
        this.currentImageFile = null;
        this.currentImage = null;
        this.currentMode = 'edit'; // 'draw' or 'edit'
        this.isAutoSaveEnabled = false;
        this.showLabelsOnCanvas = true;
        this.labelFontSize = 14;
        this.saveTimeout = null;
        this.currentLoadToken = 0;
        this._clipboard = null;
        this.lastMousePosition = { x: 0, y: 0 }; // To store canvas mouse coords
        this.classNames = new Map(); // To store class names from .yaml file
        this.labelSortOrder = 'asc'; // 'asc' or 'desc'
        this.previewImageCache = new Map(); // For caching preview image ObjectURLs
        this.isPreviewBarHidden = false; // Start with the preview bar visible
    }
}


// =================================================================================
// UI Manager
// =================================================================================

class UIManager {
    constructor(state, canvasController, fileSystem) {
        this.state = state;
        this.canvasController = canvasController;
        this.fileSystem = fileSystem;
        this.elements = this.getDOMElements();
        this.setupSplitters();
    }

    getDisplayNameForClass(labelClass) {
        if (this.state.classNames.has(labelClass)) {
            return `${labelClass}: ${this.state.classNames.get(labelClass)}`;
        }
        return labelClass; // Fallback to just the ID
    }

    getDOMElements() {
        return {
            selectImageFolderBtn: document.getElementById('selectImageFolderBtn'),
            selectLabelFolderBtn: document.getElementById('selectLabelFolderBtn'),
            loadClassInfoFolderBtn: document.getElementById('loadClassInfoFolderBtn'),
            classFileSelect: document.getElementById('class-file-select'),
            imageList: document.getElementById('image-list'),
            imageSearchInput: document.getElementById('imageSearchInput'),
            showLabeledCheckbox: document.getElementById('showLabeled'),
            showUnlabeledCheckbox: document.getElementById('showUnlabeled'),
            saveLabelsBtn: document.getElementById('saveLabelsBtn'),
            autoSaveToggle: document.getElementById('autoSaveToggle'),
            showLabelsOnCanvasToggle: document.getElementById('showLabelsOnCanvasToggle'),
            labelFontSizeSlider: document.getElementById('label-font-size'),
            labelFontSizeValue: document.getElementById('label-font-size-value'),
            drawModeBtn: document.getElementById('drawMode'),
            editModeBtn: document.getElementById('editMode'),
            labelList: document.getElementById('label-list'),
            labelFilters: document.getElementById('label-filters'),
            selectByClassDropdown: document.getElementById('select-by-class-dropdown'),
            selectByClassBtn: document.getElementById('select-by-class-btn'),
            zoomInBtn: document.getElementById('zoomInBtn'),
            zoomOutBtn: document.getElementById('zoomOutBtn'),
            resetZoomBtn: document.getElementById('resetZoomBtn'),
            canvasContainer: document.querySelector('.canvas-container'),
            zoomInput: document.getElementById('zoom-input'),
            mouseCoordsDisplay: document.getElementById('mouse-coords'),
            coordXInput: document.getElementById('coordX'),
            coordYInput: document.getElementById('coordY'),
            goToCoordsBtn: document.getElementById('goToCoordsBtn'),
            currentImageNameSpan: document.getElementById('current-image-name'),
            prevImageBtn: document.getElementById('prevImageBtn'),
            nextImageBtn: document.getElementById('nextImageBtn'),
            leftPanel: document.getElementById('left-panel'),
            rightPanel: document.getElementById('right-panel'),
            leftSplitter: document.getElementById('left-splitter'),
            rightSplitter: document.getElementById('right-splitter'),
            darkModeToggle: document.getElementById('darkModeToggle'),
            downloadClassesBtn: document.getElementById('downloadClassesBtn'),
            sortLabelsAscBtn: document.getElementById('sortLabelsAscBtn'),
            sortLabelsDescBtn: document.getElementById('sortLabelsDescBtn'),
            viewClassFileBtn: document.getElementById('viewClassFileBtn'),
            classFileViewerModal: new bootstrap.Modal(document.getElementById('classFileViewerModal')),
            classFileEditorBody: document.getElementById('classFileEditorBody'),
            addClassRowBtn: document.getElementById('addClassRowBtn'),
            saveClassFileBtn: document.getElementById('saveClassFileBtn'),
            previewBar: document.getElementById('preview-bar'),
            previewPrevBtn: document.getElementById('preview-prev-btn'),
            previewNextBtn: document.getElementById('preview-next-btn'),
            previewListWrapper: document.getElementById('preview-list-wrapper'),
            previewList: document.getElementById('preview-list'),
            bottomPanel: document.getElementById('bottom-panel'),
            bottomSplitter: document.getElementById('bottom-splitter'),
            previewBarHeader: document.getElementById('preview-bar-header'),
            togglePreviewBtn: document.getElementById('toggle-preview-btn'),
            collapseLeftPanelBtn: document.getElementById('collapse-left-panel-btn'),
            expandLeftPanelBtn: document.getElementById('expand-left-panel-btn'),
            collapseRightPanelBtn: document.getElementById('collapse-right-panel-btn'),
            expandRightPanelBtn: document.getElementById('expand-right-panel-btn'),
            labelClassModal: new bootstrap.Modal(document.getElementById('labelClassModal')),
            labelClassInput: document.getElementById('labelClassInput'),
            classSelectionContainer: document.getElementById('class-selection-container'),
            saveLabelClassBtn: document.getElementById('saveLabelClassBtn'),
        };
    }

    togglePanel(panel, splitter, expandBtn, isCollapsing) {
        panel.classList.toggle('collapsed', isCollapsing);
        splitter.style.display = isCollapsing ? 'none' : '';
        expandBtn.style.display = isCollapsing ? 'block' : 'none';

        // Recalculate canvas size after transition
        setTimeout(() => {
            this.canvasController.resizeCanvas();
            this.canvasController.resetZoom();
        }, 300); // Match transition duration
    }

    updateLabelFolderButton(selected, folderName = '') {
        const btn = this.elements.selectLabelFolderBtn;
        if (selected) {
            btn.classList.remove('btn-secondary', 'btn-danger');
            btn.classList.add('btn-success');
            btn.innerHTML = `<i class="bi bi-folder-check"></i> ${folderName}`;
        } else {
            btn.classList.remove('btn-success');
            btn.classList.add('btn-danger');
            btn.innerHTML = `<i class="bi bi-folder-x"></i> Load Label Folder`;
        }
    }

    renderImageList() {
        const searchTerm = this.elements.imageSearchInput.value.toLowerCase();
        const showLabeled = this.elements.showLabeledCheckbox.checked;
        const showUnlabeled = this.elements.showUnlabeledCheckbox.checked;

        this.elements.imageList.innerHTML = '';
        const fragment = document.createDocumentFragment();

        this.state.imageFiles
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
            .filter(file => {
                const isLabeled = this.state.imageLabelStatus.get(file.name) || false;
                if (!showLabeled && isLabeled) return false;
                if (!showUnlabeled && !isLabeled) return false;
                return file.name.toLowerCase().includes(searchTerm);
            })
            .forEach(file => {
                const isLabeled = this.state.imageLabelStatus.get(file.name) || false;
                const icon = isLabeled
                    ? '<i class="bi bi-check-circle-fill text-success me-2"></i>'
                    : '<i class="bi bi-x-circle-fill text-muted me-2"></i>';

                const a = document.createElement('a');
                a.href = '#';
                a.className = 'list-group-item list-group-item-action d-flex align-items-center';
                a.innerHTML = `${icon}<span>${file.name}</span>`;

                if (this.state.currentImageFile && file.name === this.state.currentImageFile.name) {
                    a.classList.add('active');
                }
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.fileSystem.loadImageAndLabels(file);
                });
                fragment.appendChild(a);
            });
        
        this.elements.imageList.appendChild(fragment);
    }

    updateLabelList() {
        this.elements.labelList.innerHTML = '';
        const fragment = document.createDocumentFragment();
        let rects = this.canvasController.getObjects('rect');

        // Sort rects based on the current sort order
        rects.sort((a, b) => {
            const idA = parseInt(a.labelClass, 10);
            const idB = parseInt(b.labelClass, 10);
            return this.state.labelSortOrder === 'asc' ? idA - idB : idB - idA;
        });

        // Re-order objects on the canvas for correct z-index
        rects.forEach(rect => this.canvasController.canvas.remove(rect));
        rects.forEach(rect => this.canvasController.canvas.add(rect));
        this.canvasController.renderAll();

        this.updateLabelFilters(rects);
        this.updateSelectByClassDropdown(rects);
        this.canvasController.highlightSelection();

        rects.forEach((rect, index) => {
            const li = document.createElement('li');
            li.id = `label-item-${index}`;
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.draggable = true;
            li.dataset.index = index;

            // Get currently active objects from canvas for highlighting
            const activeCanvasObjects = this.canvasController.canvas.getActiveObjects();
            // Apply active class if this rect is currently selected on canvas
            const isActive = activeCanvasObjects.includes(rect) || (activeCanvasObjects.length === 1 && activeCanvasObjects[0].type === 'activeSelection' && activeCanvasObjects[0].getObjects().includes(rect));
            if (isActive) {
                li.classList.add('active');
            }

            const color = getColorForClass(rect.labelClass);
            const displayName = this.getDisplayNameForClass(rect.labelClass);
            
            li.innerHTML = `<span><span class="badge me-2" style="background-color: ${color};"> </span>${displayName}</span><div><button class="btn btn-sm btn-outline-primary edit-btn py-0 px-1" data-index="${index}"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger delete-btn py-0 px-1" data-index="${index}"><i class="bi bi-trash"></i></button></div>`;
            
            li.addEventListener('click', (e) => {
                if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) return;
                this.canvasController.canvas.setActiveObject(rects[index]).renderAll();
            });

            

            fragment.appendChild(li);
        });

        this.elements.labelList.appendChild(fragment);
        this.addEditDeleteListeners(rects);
        
        const activeClassFilters = new Set();
        this.elements.labelFilters.querySelectorAll('.btn[data-label-class].active').forEach(btn => {
            activeClassFilters.add(btn.dataset.labelClass);
        });

        rects.forEach((rect, index) => {
            let isVisible = true;
            if (activeClassFilters.size > 0) {
                isVisible = activeClassFilters.has(rect.labelClass);
            } else if (activeClassFilters.size === 0 && this.elements.labelFilters.querySelectorAll('.btn[data-label-class]').length > 0) {
                // If there are filters but none are active, hide all
                isVisible = false;
            }
            const listItem = document.getElementById(`label-item-${index}`);
            if (listItem) {
                listItem.style.display = isVisible ? '' : 'none';
            }
        });
    }
    
    updateLabelFilters(rects) {
        this.elements.labelFilters.innerHTML = '';

        const classCounts = rects.reduce((acc, rect) => {
            acc[rect.labelClass] = (acc[rect.labelClass] || 0) + 1;
            return acc;
        }, {});
        const totalCount = rects.length;
        const uniqueClasses = [...new Set(rects.map(r => r.labelClass))].sort((a, b) => a - b);

        const applyFilters = () => {
            const activeClassFilters = new Set();
            this.elements.labelFilters.querySelectorAll('.btn[data-label-class].active').forEach(btn => {
                activeClassFilters.add(btn.dataset.labelClass);
            });

            rects.forEach((rect, index) => {
                let isVisible = true;
                 if (activeClassFilters.size > 0) {
                    isVisible = activeClassFilters.has(rect.labelClass);
                } else if (activeClassFilters.size === 0 && this.elements.labelFilters.querySelectorAll('.btn[data-label-class]').length > 0) {
                    isVisible = false;
                }
                
                rect.set('visible', isVisible);
                if (rect._labelText) {
                    rect._labelText.set('visible', isVisible);
                }
                const listItem = document.getElementById(`label-item-${index}`);
                if (listItem) {
                    listItem.style.display = isVisible ? '' : 'none';
                }
            });
            this.canvasController.renderAll();
        };

        const totalEl = document.createElement('span');
        totalEl.className = 'badge bg-dark me-2 mb-1 align-items-center d-inline-flex';
        totalEl.textContent = `Total: ${totalCount}`;
        this.elements.labelFilters.appendChild(totalEl);

        if (uniqueClasses.length > 1) {
            const allBtn = document.createElement('button');
            allBtn.className = 'btn btn-sm btn-primary me-1 mb-1';
            allBtn.textContent = 'All';
            allBtn.addEventListener('click', () => {
                const classButtons = this.elements.labelFilters.querySelectorAll('.btn[data-label-class]');
                const allActive = Array.from(classButtons).every(b => b.classList.contains('active'));
                
                classButtons.forEach(btn => btn.classList.toggle('active', !allActive));
                
                applyFilters();
            });
            this.elements.labelFilters.appendChild(allBtn);
        }

        uniqueClasses.forEach(labelClass => {
            const btn = document.createElement('button');
            const count = classCounts[labelClass] || 0;
            const displayName = this.getDisplayNameForClass(labelClass);
            btn.className = 'btn btn-sm btn-outline-secondary me-1 mb-1 active';
            btn.textContent = `${displayName} (${count})`;
            btn.dataset.labelClass = labelClass;

            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                applyFilters();
            });
            this.elements.labelFilters.appendChild(btn);
        });
    }

    updateSelectByClassDropdown(rects) {
        const dropdown = this.elements.selectByClassDropdown;
        dropdown.innerHTML = '<option selected value="">Select a class to select boxes...</option>';
        const uniqueClasses = [...new Set(rects.map(r => r.labelClass))].sort((a, b) => a - b);

        if (uniqueClasses.length > 0) {
            const allOption = document.createElement('option');
            allOption.value = '__ALL__';
            allOption.textContent = 'All Classes';
            dropdown.appendChild(allOption);
        }

        uniqueClasses.forEach(labelClass => {
            const displayName = this.getDisplayNameForClass(labelClass);
            const option = document.createElement('option');
            option.value = labelClass;
            option.textContent = displayName;
            dropdown.appendChild(option);
        });
    }

    addEditDeleteListeners(rects) {
        this.elements.labelList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index, 10);
                this.canvasController.editLabel(rects[index]);
            });
        });

        this.elements.labelList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index, 10);
                this.canvasController.removeObject(rects[index]);
                this.updateLabelList();
            });
        });
    }

    setupSplitters() {
        const setup = (splitter, panel, direction) => {
            splitter.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const onMouseMove = (moveEvent) => {
                    const containerRect = splitter.parentElement.getBoundingClientRect();
                    let newWidth = (direction === 'left')
                        ? moveEvent.clientX - containerRect.left
                        : containerRect.right - moveEvent.clientX;

                    if (newWidth > 200 && newWidth < 600) {
                        panel.style.width = newWidth + 'px';
                        this.canvasController.resizeCanvas();
                        this.canvasController.resetZoom();
                    }
                };
                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                    // Final resize and zoom reset after dragging ends
                    this.canvasController.resizeCanvas();
                    this.canvasController.resetZoom();
                };
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        };
        setup(this.elements.leftSplitter, this.elements.leftPanel, 'left');
        setup(this.elements.rightSplitter, this.elements.rightPanel, 'right');
        this.setupBottomSplitter();
    }

    setupBottomSplitter() {
        const splitter = this.elements.bottomSplitter;
        const panel = this.elements.bottomPanel;

        splitter.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const startY = e.clientY;
            const startHeight = panel.offsetHeight;

            const onMouseMove = (moveEvent) => {
                const newHeight = startHeight - (moveEvent.clientY - startY);
                if (newHeight > 50 && newHeight < 400) { // Min/max height
                    panel.style.height = newHeight + 'px';
                    this.canvasController.resizeCanvas();
                    this.canvasController.resetZoom();
                }
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                this.canvasController.resizeCanvas(); // Final resize after drag ends
                this.canvasController.resetZoom();
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    updateZoomDisplay() {
        const zoom = this.canvasController.canvas.getZoom() * 100;
        if (document.activeElement !== this.elements.zoomInput) {
            this.elements.zoomInput.value = zoom.toFixed(0);
        }
    }

    updateMouseCoords(x, y) {
        // Only update if the input fields are not focused
        if (document.activeElement !== this.elements.coordXInput && document.activeElement !== this.elements.coordYInput) {
            this.elements.coordXInput.value = Math.round(x);
            this.elements.coordYInput.value = Math.round(y);
        }
    }

    hideMouseCoords() {
        // Clear the input fields when the mouse leaves the canvas, if they are not focused
        if (document.activeElement !== this.elements.coordXInput && document.activeElement !== this.elements.coordYInput) {
            this.elements.coordXInput.value = '';
            this.elements.coordYInput.value = '';
        }
    }
    
    updateImageInfo(fileName, currentIndex = null, totalImages = null) {
        let infoText = fileName;
        if (currentIndex !== null && totalImages !== null) {
            infoText = `${currentIndex + 1}/${totalImages} - ${fileName}`;
        }
        this.elements.currentImageNameSpan.textContent = infoText;
    }

    setActiveImageListItem(imageFile) {
        this.elements.imageList.querySelectorAll('.list-group-item').forEach(item => {
            const span = item.querySelector('span');
            if (!span) return;

            const isActive = span.textContent === imageFile.name;
            item.classList.toggle('active', isActive);
            if (isActive) {
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    async createThumbnail(file, maxWidth = 100, maxHeight = 100) {
        let imageURL;
        let isObjectUrl = false;
    
        if (/\.(tif|tiff)$/i.test(file.name)) {
            const arrayBuffer = await file.arrayBuffer();
            const tiff = new Tiff({ buffer: arrayBuffer });
            imageURL = tiff.toCanvas().toDataURL();
        } else {
            imageURL = URL.createObjectURL(file);
            isObjectUrl = true;
        }
    
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
                const canvas = document.createElement('canvas');
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                if (isObjectUrl) {
                    URL.revokeObjectURL(imageURL); // Clean up object URL
                }
                
                resolve(canvas.toDataURL('image/jpeg', 0.8)); // Use JPEG for smaller size
            };
            img.onerror = (err) => {
                if (isObjectUrl) {
                    URL.revokeObjectURL(imageURL);
                }
                console.error("Failed to load image for thumbnailing:", file.name, err);
                // Return a placeholder for broken images
                resolve('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWVlZWUiLz4KICA8bGluZSB4MT0iMCIgeTE9IjAiIHgyPSIxMDAiIHkyPSIxMDAiIHN0cm9rZT0iI2NjYyIvPgogIDxsaW5lIHgxPSIxMDAiIHkxPSIwIiB4Mj0iMCIgeTI9IjEwMCIgc3Ryb2tlPSIjY2NjIi8+Cjwvc3ZnPg==');
            };
            img.src = imageURL;
        });
    }

    async renderPreviewBar(currentImageFile) {
        // If the preview bar is hidden, don't bother rendering the images to save resources.
        if (this.state.isPreviewBarHidden) {
            return;
        }

        const bottomPanel = this.elements.bottomPanel;
        if (!currentImageFile) {
            bottomPanel.style.display = 'none';
            return;
        }

        bottomPanel.style.display = 'flex';
        this.elements.previewList.innerHTML = '';

        // Calculate dynamic number of previews
        const containerWidth = this.elements.previewListWrapper.offsetWidth;
        const itemWidth = 90 + 10; // preview-item width + gap
        const minPreviews = 10;
        const numPreviews = Math.max(minPreviews, Math.floor(containerWidth / itemWidth));
        const halfPreviews = Math.floor(numPreviews / 2);

        const currentIndex = this.state.imageFiles.findIndex(f => f.name === currentImageFile.name);

        let startIndex = Math.max(0, currentIndex - halfPreviews);
        let endIndex = Math.min(this.state.imageFiles.length - 1, currentIndex + halfPreviews);

        if (endIndex - startIndex + 1 < numPreviews) {
            if (startIndex === 0) {
                endIndex = Math.min(this.state.imageFiles.length - 1, numPreviews - 1);
            } else if (endIndex === this.state.imageFiles.length - 1) {
                startIndex = Math.max(0, this.state.imageFiles.length - numPreviews);
            }
        }

        const filesToPreview = this.state.imageFiles.slice(startIndex, endIndex + 1);

        for (const fileHandle of filesToPreview) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            if (fileHandle.name === currentImageFile.name) {
                previewItem.classList.add('active');
            }
            previewItem.dataset.fileName = fileHandle.name;

            const img = document.createElement('img');
            img.alt = fileHandle.name;

            previewItem.appendChild(img);
            this.elements.previewList.appendChild(previewItem);

            // Set src after appending to DOM to allow browser to render the item structure first
            if (this.state.previewImageCache.has(fileHandle.name)) {
                img.src = this.state.previewImageCache.get(fileHandle.name);
            } else {
                // Show a placeholder while loading
                img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWVlZWUiLz4KICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjAuNTsxOzAuNSIgZHVyPSIxcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz4KPC9zdmc+';
                
                // Use requestIdleCallback to avoid blocking the main thread during intensive operations
                requestIdleCallback(async () => {
                    try {
                        const file = await fileHandle.getFile();
                        const thumbnailUrl = await this.createThumbnail(file);
                        if (this.elements.previewList.contains(previewItem)) { // Check if item is still in DOM
                           img.src = thumbnailUrl;
                        }
                        this.state.previewImageCache.set(fileHandle.name, thumbnailUrl);
                    } catch (error) {
                        console.error('Could not generate thumbnail for', fileHandle.name, error);
                        if (this.elements.previewList.contains(previewItem)) {
                           img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWVlZWUiLz4KICA8bGluZSB4MT0iMCIgeTE9IjAiIHgyPSIxMDAiIHkyPSIxMDAiIHN0cm9rZT0iI2NjYyIvPgogIDxsaW5lIHgxPSIxMDAiIHkxPSIwIiB4Mj0iMCIgeTI9IjEwMCIgc3Ryb2tlPSIjY2NjIi8+Cjwvc3ZnPg==';
                        }
                    }
                });
            }

            previewItem.addEventListener('click', () => {
                this.fileSystem.loadImageAndLabels(fileHandle);
            });
        }
    }

    togglePreviewBarVisibility(hide) {
        this.state.isPreviewBarHidden = hide;
        this.elements.bottomPanel.classList.toggle('collapsed', hide);
        
        // If we are showing the bar again, re-render the previews.
        if (!hide) {
            this.renderPreviewBar(this.state.currentImageFile);
        }

        // Recalculate canvas size after transition
        setTimeout(() => {
            this.canvasController.resizeCanvas();
            this.canvasController.resetZoom();
        }, 300); // Match transition duration
    }

    renderClassFileList() {
        const select = this.elements.classFileSelect;
        select.innerHTML = '<option value="" selected>All Classes</option>'; // Default option

        this.state.classFiles
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
            .forEach(file => {
                const option = document.createElement('option');
                option.value = file.name;
                option.textContent = file.name;
                if (this.state.selectedClassFile && this.state.selectedClassFile.name === file.name) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
    }

    promptForLabelClass(defaultValue = '0') {
        return new Promise((resolve, reject) => {
            const {
                labelClassModal,
                labelClassInput,
                classSelectionContainer,
                saveLabelClassBtn
            } = this.elements;

            let isResolved = false;

            // --- Data Gathering ---
            const definedClasses = new Map(this.state.classNames);
            const usedClasses = new Set(this.canvasController.getObjects('rect').map(r => r.labelClass));
            
            // Add used classes to the map if they aren't already defined
            usedClasses.forEach(id => {
                if (!definedClasses.has(id)) {
                    definedClasses.set(id, `(Used in image)`);
                }
            });

            // --- UI Population ---
            labelClassInput.value = defaultValue;
            classSelectionContainer.innerHTML = ''; // Clear previous buttons

            if (definedClasses.size > 0) {
                const sortedClasses = [...definedClasses.entries()].sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10));
                
                sortedClasses.forEach(([id, name]) => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'btn btn-sm btn-outline-primary m-1';
                    btn.textContent = this.getDisplayNameForClass(id);
                    btn.dataset.classId = id;
                    btn.addEventListener('click', () => {
                        labelClassInput.value = id;
                        labelClassInput.focus();
                    });
                    classSelectionContainer.appendChild(btn);
                });
            } else {
                classSelectionContainer.innerHTML = '<p class="text-muted">No predefined or used classes found. Enter an ID manually.</p>';
            }

            // --- Event Handling ---
            const handleSave = () => {
                const finalLabel = validateLabelClass(labelClassInput.value);
                if (finalLabel !== null) {
                    isResolved = true;
                    cleanup();
                    resolve(finalLabel);
                }
            };

            const handleCancel = () => {
                cleanup();
                reject('User cancelled label selection.');
            };
            
            const handleKeyDown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSave();
                } else if (e.key === 'Escape') {
                    handleCancel();
                }
            };

            const handleModalHide = () => {
                if (!isResolved) {
                    handleCancel();
                }
            };

            const cleanup = () => {
                saveLabelClassBtn.removeEventListener('click', handleSave);
                labelClassModal._element.removeEventListener('keydown', handleKeyDown);
                labelClassModal._element.removeEventListener('hide.bs.modal', handleModalHide);
                if (labelClassModal._isShown) {
                    labelClassModal.hide();
                }
            };

            saveLabelClassBtn.addEventListener('click', handleSave);
            labelClassModal._element.addEventListener('keydown', handleKeyDown);
            labelClassModal._element.addEventListener('hide.bs.modal', handleModalHide, { once: true });
            
            // --- Show Modal ---
            labelClassModal.show();
            // Focus on the input field when the modal is shown
            labelClassModal._element.addEventListener('shown.bs.modal', () => {
                labelClassInput.focus();
                labelClassInput.select();
            }, { once: true });
        });
    }
}


// =================================================================================
// File System Manager
// =================================================================================

class FileSystem {
    constructor(state, uiManager, canvasController) {
        this.state = state;
        this.uiManager = uiManager;
        this.canvasController = canvasController;
    }

    async selectClassInfoFolder() {
        try {
            this.state.classInfoFolderHandle = await window.showDirectoryPicker();
            showToast(`Class Info Folder selected: ${this.state.classInfoFolderHandle.name}`);
            await this.listClassFiles();
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error selecting class info folder:', err);
                showToast('Failed to select class info folder.', 4000);
            }
        }
    }

    async listClassFiles() {
        if (!this.state.classInfoFolderHandle) return;
        this.state.classFiles = [];
        for await (const entry of this.state.classInfoFolderHandle.values()) {
            if (entry.kind === 'file' && /\.(yaml|yml)$/i.test(entry.name)) {
                this.state.classFiles.push(entry);
            }
        }
        this.uiManager.renderClassFileList();
        // If a file is selected, load it. Otherwise, clear the classes.
        if (this.state.selectedClassFile) {
            const stillExists = this.state.classFiles.some(f => f.name === this.state.selectedClassFile.name);
            if (stillExists) {
                await this.loadClassNamesFromFile(this.state.selectedClassFile);
            } else {
                this.state.selectedClassFile = null;
                this.state.classNames.clear();
                this.uiManager.updateLabelList();
                this.canvasController.updateAllLabelTexts();
            }
        } else {
            // If no file was previously selected, clear current class names
            this.state.classNames.clear();
            this.uiManager.updateLabelList();
            this.canvasController.updateAllLabelTexts();
        }
    }

    async loadClassNamesFromFile(fileHandle) {
        try {
            const file = await fileHandle.getFile();
            const content = await file.text();
            
            this.state.classNames.clear();
            const lines = content.split('\n');
            let loadedCount = 0;
            
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('#') || trimmedLine === '') return;

                const parts = trimmedLine.split(':');
                if (parts.length >= 2) {
                    const id = parts[0].trim();
                    const name = parts.slice(1).join(':').trim();
                    if (!isNaN(parseInt(id, 10)) && name) {
                        this.state.classNames.set(id, name);
                        loadedCount++;
                    }
                }
            });

            this.state.selectedClassFile = fileHandle;
            showToast(`${loadedCount} classes loaded from ${file.name}`);
            this.uiManager.updateLabelList();
            this.canvasController.updateAllLabelTexts();
            this.uiManager.updateLabelFilters(this.canvasController.getObjects('rect'));

        } catch (err) {
            console.error('Error loading class names file:', err);
            showToast(`Failed to load ${fileHandle.name}.`, 4000);
            this.state.classNames.clear(); // Clear on failure
            this.uiManager.updateLabelList();
            this.canvasController.updateAllLabelTexts();
        }
    }

    async showClassFileContent() {
        if (!this.state.selectedClassFile) {
            showToast('Please select a class file first.', 3000);
            return;
        }
        try {
            const file = await this.state.selectedClassFile.getFile();
            const content = await file.text();
            const editorBody = this.uiManager.elements.classFileEditorBody;
            editorBody.innerHTML = ''; // Clear previous content

            const classData = [];
            const lines = content.split('\n');
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('#') || trimmedLine === '') return;

                const parts = trimmedLine.split(':');
                if (parts.length >= 2) {
                    const id = parts[0].trim();
                    const name = parts.slice(1).join(':').trim();
                    if (!isNaN(parseInt(id, 10)) && name) {
                        classData.push({ id, name });
                    }
                }
            });

            if (classData.length > 0) {
                classData.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
                classData.forEach(item => {
                    const row = editorBody.insertRow();
                    row.innerHTML = `
                        <td contenteditable="true" class="class-id">${item.id}</td>
                        <td contenteditable="true" class="class-name">${item.name}</td>
                        <td><button class="btn btn-sm btn-outline-danger delete-class-row-btn py-0 px-1"><i class="bi bi-trash"></i></button></td>
                    `;
                });
            }

            this.uiManager.elements.classFileViewerModal.show();

        } catch (err) {
            console.error('Error reading class file:', err);
            showToast(`Could not read file: ${this.state.selectedClassFile.name}`, 4000);
        }
    }

    addNewClassRow() {
        const editorBody = this.uiManager.elements.classFileEditorBody;
        const row = editorBody.insertRow();
        row.innerHTML = `
            <td contenteditable="true" class="class-id"></td>
            <td contenteditable="true" class="class-name"></td>
            <td><button class="btn btn-sm btn-outline-danger delete-class-row-btn py-0 px-1"><i class="bi bi-trash"></i></button></td>
        `;
        // Focus on the new ID cell
        row.querySelector('.class-id').focus();
    }

    async saveClassFileContent() {
        if (!this.state.selectedClassFile) {
            showToast('No class file selected.', 4000);
            return;
        }

        const editorBody = this.uiManager.elements.classFileEditorBody;
        const rows = editorBody.querySelectorAll('tr');
        const classData = [];
        const seenIds = new Set();
        let isValid = true;

        rows.forEach(row => {
            const idCell = row.querySelector('.class-id');
            const nameCell = row.querySelector('.class-name');

            const id = idCell.textContent.trim();
            const name = nameCell.textContent.trim();

            // Validation
            const numId = parseInt(id, 10);
            if (id === '' && name === '') { // Ignore completely empty rows
                return;
            }
            if (isNaN(numId) || String(numId) !== id) {
                showToast(`Invalid ID: "${id}". IDs must be integers.`, 4000);
                idCell.classList.add('is-invalid');
                isValid = false;
            } else if (seenIds.has(id)) {
                showToast(`Duplicate ID: "${id}". IDs must be unique.`, 4000);
                idCell.classList.add('is-invalid');
                isValid = false;
            } else {
                idCell.classList.remove('is-invalid');
                seenIds.add(id);
            }

            if (name === '') {
                showToast(`Class name cannot be empty for ID ${id}.`, 4000);
                nameCell.classList.add('is-invalid');
                isValid = false;
            } else {
                nameCell.classList.remove('is-invalid');
            }

            if (isValid) {
                classData.push({ id, name });
            }
        });

        if (!isValid) {
            return;
        }

        // Sort by ID before saving
        classData.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

        const newContent = classData.map(item => `${item.id}: ${item.name}`).join('\n');

        try {
            const writable = await this.state.selectedClassFile.createWritable();
            await writable.write(newContent);
            await writable.close();
            showToast(`Successfully saved changes to ${this.state.selectedClassFile.name}`);
            
            // Hide modal and reload class names
            this.uiManager.elements.classFileViewerModal.hide();
            await this.loadClassNamesFromFile(this.state.selectedClassFile);

        } catch (err) {
            console.error('Error saving class file:', err);
            showToast('Failed to save file. Check console for details.', 4000);
        }
    }""


    downloadClassTemplate() {
        const templateContent = [
            '# This is a YAML file for class definitions.',
            '# Each line should be in the format: id: name',
            '# The ID must be an integer.',
            '',
            '0: person',
            '1: car',
            '2: bicycle',
            '3: dog',
            '10: traffic light',
        ].join('\n');
        const blob = new Blob([templateContent], { type: 'application/x-yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom-classes.yaml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async selectImageFolder() {
        try {
            const imageFolderHandle = await window.showDirectoryPicker();
            this.state.imageFolderHandle = imageFolderHandle;

            // Automatically check for a 'label' subfolder
            try {
                const labelFolderHandle = await imageFolderHandle.getDirectoryHandle('label');
                this.state.labelFolderHandle = labelFolderHandle;
                this.uiManager.updateLabelFolderButton(true, `label (auto)`);
                showToast(`Found and loaded 'label' subfolder.`);
            } catch (err) {
                if (err.name !== 'NotFoundError') {
                    console.error("Error checking for 'label' subfolder:", err);
                }
                // If not found, do nothing. User can select manually.
            }

            // Clear the preview cache when a new folder is selected
            this.state.previewImageCache.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
            this.state.previewImageCache.clear();
            await this.listImageFiles();
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error selecting image folder:', err);
            }
        }
    }

    async selectLabelFolder() {
        try {
            this.state.labelFolderHandle = await window.showDirectoryPicker();
            this.uiManager.updateLabelFolderButton(true, this.state.labelFolderHandle.name);
            if (this.state.imageFiles.length > 0) {
                await this.listImageFiles();
            }
            showToast(`Label folder selected: ${this.state.labelFolderHandle.name}`);
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error selecting label folder:', err);
            }
        }
    }

    

    async listImageFiles() {
        if (!this.state.imageFolderHandle) return;
        this.state.imageFiles = [];
        this.state.imageLabelStatus.clear();
        this.uiManager.elements.imageList.innerHTML = '<div class="list-group-item">Loading...</div>';

        // Performance Improvement: Pre-cache all label file names into a Set for fast lookups.
        const labelFileNames = new Set();
        if (this.state.labelFolderHandle) {
            for await (const entry of this.state.labelFolderHandle.values()) {
                if (entry.kind === 'file' && entry.name.endsWith('.txt')) {
                    labelFileNames.add(entry.name);
                }
            }
        }

        const fileHandles = [];
        for await (const entry of this.state.imageFolderHandle.values()) {
            if (entry.kind === 'file' && /\.(jpg|jpeg|png|gif|tif|tiff)$/i.test(entry.name)) {
                fileHandles.push(entry);
            }
        }

        // Check label status using the in-memory Set, avoiding slow individual file access.
        fileHandles.forEach(fileHandle => {
            const labelFileName = fileHandle.name.replace(/\.[^/.]+$/, ".txt");
            // We now check for the existence of the label file, not its content, for a significant speed boost.
            const hasLabel = labelFileNames.has(labelFileName);
            this.state.imageLabelStatus.set(fileHandle.name, hasLabel);
        });

        // Sort the files to ensure we load the correct "first" one.
        fileHandles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

        this.state.imageFiles = fileHandles;
        this.uiManager.renderImageList();

        // Automatically load the first image if it exists.
        if (this.state.imageFiles.length > 0) {
            await this.loadImageAndLabels(this.state.imageFiles[0]);
        } else {
            // If no images are found, ensure the preview bar is hidden.
            this.uiManager.elements.previewBar.style.display = 'none';
        }
    }

    async loadImageAndLabels(imageFileHandle) {
        if (this.state.isAutoSaveEnabled && this.state.currentImageFile) {
            await this.saveLabels(true);
        }

        clearTimeout(this.state.saveTimeout);

        this.state.currentLoadToken++;
        const loadToken = this.state.currentLoadToken;

        this.state.currentImageFile = imageFileHandle;
        const currentIndex = this.state.imageFiles.findIndex(f => f.name === imageFileHandle.name);
        const totalImages = this.state.imageFiles.length;
        this.uiManager.updateImageInfo(imageFileHandle.name, currentIndex, totalImages);
        
        const file = await imageFileHandle.getFile();

        const setBackgroundImage = (img) => {
            if (loadToken !== this.state.currentLoadToken) return;
            this.state.currentImage = img;
            this.canvasController.clear();
            this.uiManager.elements.labelList.innerHTML = '';
            this.uiManager.elements.labelFilters.innerHTML = '';
            this.canvasController.setBackgroundImage(img);
            this.canvasController.resetZoom();
            this.loadLabels(imageFileHandle.name, loadToken);
        };

        if (/\.(tif|tiff)$/i.test(file.name)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (loadToken !== this.state.currentLoadToken) return;
                const tiff = new Tiff({ buffer: e.target.result });
                const tiffCanvas = tiff.toCanvas();
                fabric.Image.fromURL(tiffCanvas.toDataURL(), setBackgroundImage);
            };
            reader.readAsArrayBuffer(file);
        } else {
            const url = URL.createObjectURL(file);
            fabric.Image.fromURL(url, (img) => {
                setBackgroundImage(img);
                URL.revokeObjectURL(url);
            });
        }
        
        this.uiManager.setActiveImageListItem(imageFileHandle);
        this.uiManager.renderPreviewBar(imageFileHandle);
    }

    async loadLabels(imageName, loadToken) {
        this.uiManager.updateLabelList();

        if (!this.state.labelFolderHandle) return;
        
        const labelFileName = imageName.replace(/\.[^/.]+$/, ".txt");
        try {
            const labelFileHandle = await this.state.labelFolderHandle.getFileHandle(labelFileName);
            const file = await labelFileHandle.getFile();
            const yoloData = await file.text();
            
            if (loadToken !== this.state.currentLoadToken) return;

            if (yoloData.trim()) {
                this.canvasController.addLabelsFromYolo(yoloData);
            }
            this.uiManager.updateLabelList();
        } catch (err) {
            if (err.name === 'NotFoundError') {
                console.log(`No label file found for ${imageName}.`);
                if (loadToken === this.state.currentLoadToken) this.uiManager.updateLabelList();
            } else {
                console.error('Error loading labels:', err);
            }
        }
    }

    async saveLabels(isAuto = false) {
        if (!this.state.currentImageFile) {
            if (!isAuto) showToast('Please select an image first.');
            return;
        }
        if (!this.state.labelFolderHandle) {
            if (!isAuto) showToast('Please select a label folder first.');
            return;
        }

        if (this.canvasController.canvas.getActiveObject()) {
            this.canvasController.canvas.discardActiveObject();
            this.canvasController.renderAll();
        }

        const yoloString = this.canvasController.getLabelsAsYolo();
        const labelFileName = this.state.currentImageFile.name.replace(/\.[^/.]+$/, ".txt");

        try {
            const fileHandle = await this.state.labelFolderHandle.getFileHandle(labelFileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(yoloString.trim());
            await writable.close();

            const hasLabels = yoloString.trim().length > 0;
            if (this.state.imageLabelStatus.get(this.state.currentImageFile.name) !== hasLabels) {
                this.state.imageLabelStatus.set(this.state.currentImageFile.name, hasLabels);
                this.uiManager.renderImageList();
            }

            if (!isAuto) {
                showToast(`Labels saved to ${labelFileName}`);
            }
        } catch (err) {
            console.error('Error saving labels:', err);
            if (!isAuto) {
                showToast('Failed to save labels. Check console for details.');
            }
        }
    }

}


// =================================================================================
// Canvas Controller
// =================================================================================

class CanvasController {
    constructor(state, uiManager, fileSystem) {
        this.state = state;
        this.uiManager = uiManager;
        this.fileSystem = fileSystem;
        this.canvas = new fabric.Canvas('canvas', {
            width: 800,
            height: 600,
            backgroundColor: '#eee',
        });
        this.isDrawing = false;
        this.startPoint = null;
        this.currentRect = null;
        this.activeLabelText = null;

        // 그룹 선택(ActiveSelection) 스타일 설정
        const activeSelectionStyle = {
            hasBorders: true,
            borderColor: '#0d6efd', // Bootstrap Primary Blue
            cornerColor: '#ffffff',
            cornerStrokeColor: '#0d6efd',
            cornerStyle: 'circle',
            transparentCorners: false,
            borderDashArray: [5, 5],
            hasRotatingPoint: false
        };
        fabric.ActiveSelection.prototype.set(activeSelectionStyle);

        // 객체 회전 기능 비활성화 (상단 회전 핸들 제거)
        fabric.Object.prototype.setControlVisible('mtr', false);
    }

    getObjects(type) {
        return this.canvas.getObjects(type);
    }

    renderAll() {
        this.canvas.renderAll();
    }

    clear() {
        this.canvas.clear();
    }

    setBackgroundImage(img) {
        this.canvas.setWidth(this.uiManager.elements.canvasContainer.offsetWidth);
        this.canvas.setHeight(this.uiManager.elements.canvasContainer.offsetHeight);
        this.canvas.setBackgroundImage(img, this.renderAll.bind(this));
    }

    setMode(mode) {
        this.state.currentMode = mode;
        this.uiManager.elements.drawModeBtn.checked = mode === 'draw';
        this.uiManager.elements.editModeBtn.checked = mode === 'edit';
        this.canvas.selection = mode === 'edit';
        this.canvas.defaultCursor = mode === 'draw' ? 'crosshair' : 'default';
        this.getObjects('rect').forEach(obj => {
            obj.set({
                selectable: mode === 'edit',
                hoverCursor: mode === 'draw' ? 'crosshair' : 'move'
            });
        });
        this.renderAll();
    }

    addLabelsFromYolo(yoloData) {
        const lines = yoloData.split('\n').filter(line => line.trim() !== '');
        const imgWidth = this.state.currentImage.width;
        const imgHeight = this.state.currentImage.height;

        lines.forEach(line => {
            const [labelClass, x_center, y_center, width, height] = line.split(' ').map(val => val.trim());
            if (labelClass === undefined) return;

            const rectWidth = parseFloat(width) * imgWidth;
            const rectHeight = parseFloat(height) * imgHeight;
            const rectLeft = (parseFloat(x_center) * imgWidth) - (rectWidth / 2);
            const rectTop = (parseFloat(y_center) * imgHeight) - (rectHeight / 2);
            const color = getColorForClass(labelClass);

            const rect = new fabric.Rect({
                left: rectLeft, top: rectTop, width: rectWidth, height: rectHeight,
                fill: `${color}33`, stroke: color, strokeWidth: 2,
                strokeUniform: true,
                selectable: this.state.currentMode === 'edit',
                hoverCursor: this.state.currentMode === 'draw' ? 'crosshair' : 'move',
                labelClass: String(labelClass),
                originalYolo: { x_center, y_center, width, height }
            });
            rect.setControlVisible('mtr', false);
            this.canvas.add(rect);
            this.drawLabelText(rect);
        });
    }

    getLabelsAsYolo() {
        const rects = this.getObjects('rect');
        const imgWidth = this.state.currentImage.width;
        const imgHeight = this.state.currentImage.height;
        let yoloString = '';

        rects.forEach(rect => {
            const labelClass = rect.labelClass || '0';
            rect.setCoords();
            const center = rect.getCenterPoint();
            const width = rect.getScaledWidth();
            const height = rect.getScaledHeight();
            const x_center = center.x / imgWidth;
            const y_center = center.y / imgHeight;
            const normWidth = width / imgWidth;
            const normHeight = height / imgHeight;
            yoloString += `${labelClass} ${x_center.toFixed(15)} ${y_center.toFixed(15)} ${normWidth.toFixed(15)} ${normHeight.toFixed(15)}\n`;
        });
        return yoloString;
    }

    highlightSelection() {
        const rects = this.getObjects('rect');
        const activeObjects = this.canvas.getActiveObjects();

        rects.forEach(rect => {
            const isSelected = activeObjects.includes(rect);
            const color = getColorForClass(rect.labelClass);

            if (isSelected) {
                rect.set({
                    stroke: '#ff0000', // Red color for selection
                    strokeWidth: 2, // Thicker stroke
                    strokeDashArray: [10, 5], // Dashed line (10px line, 5px gap)
                    shadow: null // Remove shadow
                });
            } else {
                rect.set({
                    stroke: color, // Original class color
                    strokeWidth: 2, // Original stroke width
                    strokeDashArray: [], // Solid line
                    shadow: null // Ensure no shadow
                });
            }

            this.updateLabelText(rect);
        });
        this.renderAll();
    }

    // Drawing
    startDrawing(pointer) {
        if (this.state.currentMode !== 'draw' || !this.state.currentImage) return;
        this.isDrawing = true;
        this.startPoint = pointer;
        this.currentRect = new fabric.Rect({
            left: this.startPoint.x, top: this.startPoint.y, width: 0, height: 0,
            fill: 'rgba(255, 0, 0, 0.2)', stroke: 'red', strokeWidth: 2, strokeUniform: true, selectable: false,
        });
        this.canvas.add(this.currentRect);
    }

    continueDrawing(pointer) {
        if (!this.isDrawing) return;
        let width = pointer.x - this.startPoint.x;
        let height = pointer.y - this.startPoint.y;
        this.currentRect.set({
            left: width > 0 ? this.startPoint.x : pointer.x,
            top: height > 0 ? this.startPoint.y : pointer.y,
            width: Math.abs(width), height: Math.abs(height)
        });
        this.renderAll();
    }

    async finishDrawing() {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        if (!this.state.labelFolderHandle) {
            showToast('Please select a label folder before creating labels.', 4000);
            this.canvas.remove(this.currentRect);
            this.currentRect = null;
            return;
        }

        if (this.currentRect.width < 5 && this.currentRect.height < 5) {
            this.canvas.remove(this.currentRect);
            this.currentRect = null;
        } else {
            try {
                const finalLabel = await this.uiManager.promptForLabelClass('0');

                this.currentRect.set('labelClass', finalLabel);
                
                const color = getColorForClass(finalLabel);
                this.currentRect.set({ fill: `${color}33`, stroke: color });
                this.currentRect.setControlVisible('mtr', false);
                
                const isEditMode = (this.state.currentMode === 'edit');
                this.currentRect.set({
                    'selectable': isEditMode,
                    'hoverCursor': isEditMode ? 'move' : 'crosshair'
                });
                
                this.currentRect.setCoords();
                this.drawLabelText(this.currentRect);
                this.canvas.requestRenderAll();
                
                this.uiManager.updateLabelList();
            } catch (error) {
                this.canvas.remove(this.currentRect);
                console.log(error); // Log cancellation message
            } finally {
                this.currentRect = null;
            }
        }
    }

    // Object Manipulation
    removeObject(obj) {
        if (obj._labelText) {
            this.canvas.remove(obj._labelText);
        }
        this.canvas.remove(obj);
    }

    sortObjectsByLabel(order = 'asc') {
        this.state.labelSortOrder = order;
        this.uiManager.updateLabelList();
    }

    reorderObject(srcIndex, destIndex) {
        const rects = this.getObjects('rect');
        const movedRect = rects.splice(srcIndex, 1)[0];
        rects.splice(destIndex, 0, movedRect);
        rects.forEach(rect => this.canvas.remove(rect));
        rects.forEach(rect => this.canvas.add(rect));
    }

    // CanvasController 클래스 내부에 위치
// CanvasController 클래스 내부
    async editLabel(rect) {
        try {
            const finalLabel = await this.uiManager.promptForLabelClass(rect.labelClass || '0');
            
            rect.set('labelClass', finalLabel);
            const color = getColorForClass(finalLabel);
            rect.set({ fill: `${color}33`, stroke: color });
            rect.originalYolo = null;
            this.updateLabelText(rect);
            this.uiManager.updateLabelList();

        } catch (error) {
            // User cancelled the modal, do nothing.
            console.log(error);
        } finally {
            // 1) 활성 객체 선택 해제
            this.canvas.discardActiveObject();
    
            // 2) Fabric 내부의 현재 변환(트랜스폼) 상태 초기화
            this.canvas._currentTransform = null;
    
            // 3) 드래그/드로잉 플래그도 초기화
            this.isDrawing = false;
            this.canvas.isDragging = false;
            this.canvas.selection = true;
            this.canvas.defaultCursor = 'default';
    
            // 4) 캔버스 강제 리렌더링
            this.canvas.renderAll();
        }
    }


    // Zoom and Pan
    setZoomPercentage(percentage) {
        const newZoom = parseFloat(percentage) / 100;
        if (isNaN(newZoom) || newZoom < 0.1 || newZoom > 20) {
            showToast('Invalid zoom level. Please enter a value between 10% and 2000%.');
            // Restore the input to the current actual zoom level
            this.uiManager.updateZoomDisplay();
            return;
        }
        const center = this.canvas.getCenter();
        this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), newZoom);
        this.uiManager.updateZoomDisplay();
    }

    zoom(factor) {
        const center = this.canvas.getCenter();
        this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), this.canvas.getZoom() * factor);
        this.uiManager.updateZoomDisplay();
    }

    resetZoom() {
        if (!this.state.currentImage) return;
        const containerWidth = this.uiManager.elements.canvasContainer.offsetWidth;
        const containerHeight = this.uiManager.elements.canvasContainer.offsetHeight;
        const imgWidth = this.state.currentImage.width;
        const imgHeight = this.state.currentImage.height;
        const scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight) * 0.95;
        this.canvas.setZoom(scale);
        this.canvas.viewportTransform[4] = (containerWidth - imgWidth * scale) / 2;
        this.canvas.viewportTransform[5] = (containerHeight - imgHeight * scale) / 2;
        this.renderAll();
        this.uiManager.updateZoomDisplay();
    }
    
    resizeCanvas() {
        this.canvas.setWidth(this.uiManager.elements.canvasContainer.offsetWidth);
        this.canvas.setHeight(this.uiManager.elements.canvasContainer.offsetHeight);
    }

    goToCoords(x, y) {
        if (!this.state.currentImage) {
            showToast('Please load an image first.');
            return;
        }
        if (isNaN(x) || isNaN(y)) {
            showToast('Please enter valid X and Y coordinates.');
            return;
        }
        const zoom = this.canvas.getZoom();
        const newX = -x * zoom + this.canvas.getWidth() / 2;
        const newY = -y * zoom + this.canvas.getHeight() / 2;
        this.canvas.setViewportTransform([zoom, 0, 0, zoom, newX, newY]);
        this.renderAll();
        this.highlightPoint(x, y);
    }

    highlightPoint(x, y) {
        const zoom = this.canvas.getZoom();
        const highlightCircle = new fabric.Circle({
            left: x, top: y, radius: 0, fill: 'transparent', stroke: 'yellow',
            strokeWidth: 3 / zoom, originX: 'center', originY: 'center',
            selectable: false, evented: false,
        });
        this.canvas.add(highlightCircle);
        highlightCircle.animate('radius', 50 / zoom, {
            onChange: this.renderAll.bind(this),
            duration: 500,
            easing: fabric.util.ease.easeOutQuad,
            onComplete: () => {
                highlightCircle.animate('opacity', 0, {
                    onChange: this.renderAll.bind(this),
                    duration: 300,
                    onComplete: () => this.canvas.remove(highlightCircle),
                });
            }
        });
    }

    // Selection Info
    updateSelectionLabel() {
        // Clear all active classes from list items first
        this.uiManager.elements.labelList.querySelectorAll('li.active').forEach(item => item.classList.remove('active'));

        const activeCanvasObjects = this.canvas.getActiveObjects();
        if (activeCanvasObjects.length === 0) return;

        const allRectsOnCanvas = this.getObjects('rect');
        let selectedRects = [];

        // Fabric.js returns an array of objects. If multiple objects are selected
        // (either by dragging or shift-clicking), it's usually a single 'activeSelection' object
        // in the array, which in turn contains the actual objects.
        if (activeCanvasObjects.length > 0 && activeCanvasObjects[0].type === 'activeSelection') {
            selectedRects = activeCanvasObjects[0].getObjects('rect');
        } else {
            // Otherwise, it's an array of individual objects (e.g., a single selection).
            selectedRects = activeCanvasObjects.filter(obj => obj.type === 'rect');
        }

        selectedRects.forEach(selectedRect => {
            const objectIndex = allRectsOnCanvas.indexOf(selectedRect);
            if (objectIndex > -1) {
                const listItem = document.getElementById(`label-item-${objectIndex}`);
                if (listItem) {
                    listItem.classList.add('active');
                }
            }
        });
    }

    clearSelectionLabel() {
        // Clear all active classes from list items
        this.uiManager.elements.labelList.querySelectorAll('li.active').forEach(item => item.classList.remove('active'));

        if (this.activeLabelText) {
            this.canvas.remove(this.activeLabelText);
            this.activeLabelText = null;
        }
    }

    // Permanent Label Text
    drawLabelText(rect) {
        if (!this.state.showLabelsOnCanvas) return;
        const displayName = this.uiManager.getDisplayNameForClass(rect.labelClass);
        const text = new fabric.Text(displayName, {
            left: rect.left,
            top: rect.top - 4, // 4px offset above the box
            originY: 'bottom',
            fontSize: this.state.labelFontSize,
            fontFamily: "'Consolas', monospace",
            fill: rect.stroke,
            backgroundColor: rect.fill,
            padding: 2,
            selectable: false,
            evented: false,
            _isLabelText: true, // Custom property
            _rect: rect, // Link to the rectangle
        });
        rect._labelText = text;
        this.canvas.add(text);
    }

    updateLabelText(rect) {
        if (rect._labelText) {
const zoom = this.canvas.getZoom();
            const displayName = this.uiManager.getDisplayNameForClass(rect.labelClass);

            let newLeft, newTop;

            if (rect.group) {
                // 그룹에 속한 경우, 캔버스 절대 좌표를 계산합니다.
                const bounds = rect.getBoundingRect();
                newLeft = (rect.group.left  +rect.group.width/2) + bounds.left ;
                newTop = (rect.group.top + rect.group.height/2)+ bounds.top ;
            } else {
                // 단독 객체인 경우, 기존 좌표를 사용합니다.
                newLeft = rect.left;
                newTop = rect.top;
            }

            rect._labelText.set({
                text: displayName,
                left: newLeft,
                top: newTop - 4,
                originY: 'bottom',
                fontSize: this.state.labelFontSize,
                fontFamily: "'Consolas', monospace",
                padding: 2,
                fill: rect.stroke,
                backgroundColor: rect.fill,
            });
        }
    }

    updateAllLabelTexts() {
        this.getObjects('rect').forEach(rect => {
            if (rect._labelText) {
                this.updateLabelText(rect);
            }
        });
    }

    toggleAllLabelTexts(visible) {
        if (visible) {
            this.getObjects('rect').forEach(rect => this.drawLabelText(rect));
        } else {
            this.canvas.getObjects('text').forEach(text => {
                if (text._isLabelText) {
                    this.canvas.remove(text);
                }
            });
            this.getObjects('rect').forEach(rect => {
                rect._labelText = null;
            });
        }
        this.renderAll();
    }

    selectAllLabels() {
        const rects = this.getObjects('rect');
        if (rects.length > 0) {
            const sel = new fabric.ActiveSelection(rects, { canvas: this.canvas });
            this.canvas.setActiveObject(sel);
            this.canvas.requestRenderAll();
        }
    }

    selectLabelsByClass(labelClass) {
        this.canvas.discardActiveObject();
        const rectsToSelect = this.getObjects('rect').filter(rect => rect.labelClass === labelClass);
        if (rectsToSelect.length > 0) {
            const sel = new fabric.ActiveSelection(rectsToSelect, { canvas: this.canvas });
            this.canvas.setActiveObject(sel);
        }
        this.canvas.requestRenderAll();
    }
}


// =================================================================================
// Event Manager
// =================================================================================

class EventManager {
    constructor(state, ui, fileSystem, canvasController) {
        this.state = state;
        this.ui = ui;
        this.fileSystem = fileSystem;
        this.canvas = canvasController;
        this.lastClickTime = 0;
        this.lastClickedObject = null;
        this.isDraggingForSelection = false;
        this.selectionStartIndex = -1;
    }

    bindEventListeners() {
        // UI Buttons
        this.ui.elements.selectImageFolderBtn.addEventListener('click', () => this.fileSystem.selectImageFolder());
        this.ui.elements.selectLabelFolderBtn.addEventListener('click', () => this.fileSystem.selectLabelFolder());
        this.ui.elements.loadClassInfoFolderBtn.addEventListener('click', () => this.fileSystem.selectClassInfoFolder());
        this.ui.elements.saveLabelsBtn.addEventListener('click', () => this.fileSystem.saveLabels(false));
        this.ui.elements.downloadClassesBtn.addEventListener('click', () => this.fileSystem.downloadClassTemplate());
        this.ui.elements.sortLabelsAscBtn.addEventListener('click', () => {
            this.canvas.sortObjectsByLabel('asc');
        });
        this.ui.elements.sortLabelsDescBtn.addEventListener('click', () => {
            this.canvas.sortObjectsByLabel('desc');
        });
        this.ui.elements.selectByClassBtn.addEventListener('click', () => {
            const selectedClass = this.ui.elements.selectByClassDropdown.value;
            if (selectedClass) {
                if (selectedClass === '__ALL__') {
                    this.canvas.selectAllLabels();
                } else {
                    this.canvas.selectLabelsByClass(selectedClass);
                }
            }
        });
        this.ui.elements.viewClassFileBtn.addEventListener('click', () => this.fileSystem.showClassFileContent());

        this.ui.elements.addClassRowBtn.addEventListener('click', () => this.fileSystem.addNewClassRow());

        this.ui.elements.saveClassFileBtn.addEventListener('click', () => this.fileSystem.saveClassFileContent());

        this.ui.elements.classFileEditorBody.addEventListener('click', (e) => {
            if (e.target.closest('.delete-class-row-btn')) {
                e.target.closest('tr').remove();
            }
        });

        this.ui.elements.classFileSelect.addEventListener('change', (e) => {
            const selectedFileName = e.target.value;
            if (selectedFileName) {
                const fileHandle = this.state.classFiles.find(f => f.name === selectedFileName);
                if (fileHandle) {
                    this.fileSystem.loadClassNamesFromFile(fileHandle);
                }
            } else {
                // "All Classes" is selected
                this.state.selectedClassFile = null;
                this.state.classNames.clear();
                this.ui.updateLabelList();
                this.canvas.updateAllLabelTexts();
                showToast('Cleared class names. Showing all classes.');
            }
        });
        this.ui.elements.imageSearchInput.addEventListener('input', () => this.ui.renderImageList());
        this.ui.elements.showLabeledCheckbox.addEventListener('change', () => this.ui.renderImageList());
        this.ui.elements.showUnlabeledCheckbox.addEventListener('change', () => this.ui.renderImageList());
        this.ui.elements.autoSaveToggle.addEventListener('change', (e) => {
            this.state.isAutoSaveEnabled = e.target.checked;
            showToast(`Auto Save ${this.state.isAutoSaveEnabled ? 'Enabled' : 'Disabled'}`);
        });
        this.ui.elements.showLabelsOnCanvasToggle.addEventListener('change', (e) => {
            this.state.showLabelsOnCanvas = e.target.checked;
            this.canvas.toggleAllLabelTexts(this.state.showLabelsOnCanvas);
        });
        this.ui.elements.labelFontSizeSlider.addEventListener('input', (e) => {
            const newSize = e.target.value;
            this.state.labelFontSize = parseInt(newSize, 10);
            this.ui.elements.labelFontSizeValue.textContent = newSize;
            this.canvas.updateAllLabelTexts();
            this.canvas.renderAll();
        });
        this.ui.elements.drawModeBtn.addEventListener('change', () => this.canvas.setMode('draw'));
        this.ui.elements.editModeBtn.addEventListener('change', () => this.canvas.setMode('edit'));
        this.ui.elements.zoomInBtn.addEventListener('click', () => this.canvas.zoom(1.2));
        this.ui.elements.zoomOutBtn.addEventListener('click', () => this.canvas.zoom(0.8));
        this.ui.elements.resetZoomBtn.addEventListener('click', () => this.canvas.resetZoom());

        this.ui.elements.zoomInput.addEventListener('change', (e) => {
            this.canvas.setZoomPercentage(e.target.value);
        });

        this.ui.elements.goToCoordsBtn.addEventListener('click', () => {
            const x = parseInt(this.ui.elements.coordXInput.value, 10);
            const y = parseInt(this.ui.elements.coordYInput.value, 10);
            this.canvas.goToCoords(x, y);
        });

        this.ui.elements.prevImageBtn.addEventListener('click', () => this.navigateImage(-1));
        this.ui.elements.nextImageBtn.addEventListener('click', () => this.navigateImage(1));

        this.ui.elements.previewPrevBtn.addEventListener('click', () => this.navigateImage(-1));
        this.ui.elements.previewNextBtn.addEventListener('click', () => this.navigateImage(1));

        this.ui.elements.previewBarHeader.addEventListener('click', () => {
            this.ui.togglePreviewBarVisibility(!this.state.isPreviewBarHidden);
        });

        this.ui.elements.collapseLeftPanelBtn.addEventListener('click', () => this.ui.togglePanel(this.ui.elements.leftPanel, this.ui.elements.leftSplitter, this.ui.elements.expandLeftPanelBtn, true));
        this.ui.elements.expandLeftPanelBtn.addEventListener('click', () => this.ui.togglePanel(this.ui.elements.leftPanel, this.ui.elements.leftSplitter, this.ui.elements.expandLeftPanelBtn, false));
        this.ui.elements.collapseRightPanelBtn.addEventListener('click', () => this.ui.togglePanel(this.ui.elements.rightPanel, this.ui.elements.rightSplitter, this.ui.elements.expandRightPanelBtn, true));
        this.ui.elements.expandRightPanelBtn.addEventListener('click', () => this.ui.togglePanel(this.ui.elements.rightPanel, this.ui.elements.rightSplitter, this.ui.elements.expandRightPanelBtn, false));

        this.ui.elements.darkModeToggle.addEventListener('change', this.toggleDarkMode.bind(this));

        // Canvas Events
        this.canvas.canvas.on('mouse:down', this.handleMouseDown.bind(this));
        this.canvas.canvas.on('mouse:move', this.handleMouseMove.bind(this));
        this.canvas.canvas.on('mouse:up', this.handleMouseUp.bind(this));
        this.canvas.canvas.on('mouse:wheel', this.handleMouseWheel.bind(this));
        this.canvas.canvas.on('mouse:out', () => this.ui.hideMouseCoords());
        
        const markAsModified = (e) => {
            if (!e.target) return;
            const target = e.target;
            if (target.type === 'activeSelection') {
                target.getObjects().forEach(obj => {
                    obj.originalYolo = null;
                    this.canvas.updateLabelText(obj);
                });
            } else {
                target.originalYolo = null;
                this.canvas.updateLabelText(target);
            }
        };

        this.canvas.canvas.on('object:modified', (e) => {
            markAsModified(e);
            this.ui.updateLabelList();
        });
        this.canvas.canvas.on('object:scaled', (e) => {
            markAsModified(e);
            this.ui.updateLabelList();
        });

        this.canvas.canvas.on('selection:created', (e) => {
            this.canvas.updateSelectionLabel(e);
            this.canvas.highlightSelection();
        });
        this.canvas.canvas.on('selection:updated', (e) => {
            this.canvas.updateSelectionLabel(e);
            this.canvas.highlightSelection();
        });
        this.canvas.canvas.on('selection:cleared', () => {
            this.canvas.clearSelectionLabel();
            this.canvas.highlightSelection();
        });

        // Label list multi-select drag
        this.ui.elements.labelList.addEventListener('mousedown', this.handleLabelListMouseDown.bind(this));

        // Keyboard Events
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleMouseDown(opt) {
        const evt = opt.e;
        const target = opt.target;
        const currentTime = new Date().getTime();
        const clickInterval = currentTime - this.lastClickTime;
        const isDoubleClick = clickInterval < 300 && target === this.lastClickedObject;

        if (isDoubleClick && target && target.type === 'rect' && this.state.currentMode === 'edit') {
            this.canvas.editLabel(target);
            this.lastClickTime = 0; // Reset to prevent triple-click issues
            this.lastClickedObject = null;
            evt.preventDefault(); // Prevent default Fabric.js drag behavior
            evt.stopPropagation(); // Stop event propagation
            return;
        }

        this.lastClickTime = currentTime;
        this.lastClickedObject = target;

        if (evt.altKey || evt.ctrlKey) {
            this.canvas.canvas.isDragging = true;
            this.canvas.canvas.selection = false;
            this.canvas.canvas.lastPosX = evt.clientX;
            this.canvas.canvas.lastPosY = evt.clientY;
        } else {
            this.canvas.startDrawing(this.canvas.canvas.getPointer(evt));
        }
    }

    handleMouseMove(opt) {
        if (this.canvas.canvas.isDragging) {
            const vpt = this.canvas.canvas.viewportTransform;
            vpt[4] += opt.e.clientX - this.canvas.canvas.lastPosX;
            vpt[5] += opt.e.clientY - this.canvas.canvas.lastPosY;
            this.canvas.renderAll();
            this.canvas.canvas.lastPosX = opt.e.clientX;
            this.canvas.canvas.lastPosY = opt.e.clientY;
        } else {
            this.canvas.continueDrawing(this.canvas.canvas.getPointer(opt.e));
        }
        
        if (this.state.currentImage) {
            const pointer = this.canvas.canvas.getPointer(opt.e);
            this.state.lastMousePosition = { x: pointer.x, y: pointer.y }; // Track mouse position

            if (pointer.x >= 0 && pointer.x <= this.state.currentImage.width && pointer.y >= 0 && pointer.y <= this.state.currentImage.height) {
                this.ui.updateMouseCoords(pointer.x, pointer.y);
            } else {
                this.ui.hideMouseCoords();
            }
        }
    }

    handleMouseUp() {
        if (this.canvas.canvas.isDragging) {
            this.canvas.canvas.setViewportTransform(this.canvas.canvas.viewportTransform);
            this.canvas.canvas.isDragging = false;
            this.canvas.canvas.selection = true;
        } else {
            this.canvas.finishDrawing();
        }
    }

    handleMouseWheel(opt) {
        const delta = opt.e.deltaY;
        let zoom = this.canvas.canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.1) zoom = 0.1;
        this.canvas.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
        this.ui.updateZoomDisplay();
    }

    handleKeyDown(e) {
        // If the class editor modal is open, don't process any global shortcuts.
        const isModalOpen = this.ui.elements.classFileViewerModal._element.classList.contains('show');
        if (isModalOpen) {
            return;
        }

        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyA') {
            e.preventDefault();
            this.canvas.selectAllLabels();
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
            e.preventDefault();
            this.fileSystem.saveLabels(false);
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyQ') {
            e.preventDefault();
            const newMode = this.state.currentMode === 'edit' ? 'draw' : 'edit';
            this.canvas.setMode(newMode);
            return;
        }

        if (this.state.currentMode === 'edit') {
            const activeObject = this.canvas.canvas.getActiveObject();
            if (activeObject && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                const step = e.shiftKey ? 10 : 1; // Move 10px with Shift, 1px otherwise

                switch (e.key) {
                    case 'ArrowUp':
                        activeObject.top -= step;
                        break;
                    case 'ArrowDown':
                        activeObject.top += step;
                        break;
                    case 'ArrowLeft':
                        activeObject.left -= step;
                        break;
                    case 'ArrowRight':
                        activeObject.left += step;
                        break;
                }
                activeObject.setCoords();

                // Manually mark as modified and update label text
                if (activeObject.type === 'activeSelection') {
                    activeObject.getObjects().forEach(obj => {
                        obj.originalYolo = null;
                        this.canvas.updateLabelText(obj);
                    });
                } else {
                    activeObject.originalYolo = null;
                    this.canvas.updateLabelText(activeObject);
                }
                
                this.canvas.renderAll();
            }

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'c') this.copy();
                if (e.key === 'v') this.paste();
                if (e.key === 'b') this.changeSelectedClasses();
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                this.deleteSelected();
            }
            if (e.key === 'Escape') {
                this.canvas.canvas.discardActiveObject();
                this.canvas.renderAll();
            }
        }

        if (e.key.toLowerCase() === 'd') this.navigateImage(1);
        if (e.key.toLowerCase() === 'a') this.navigateImage(-1);
    }

    handleLabelListMouseDown(e) {
        // Don't interfere with re-ordering, buttons or scrollbar
        if (e.target.classList.contains('bi-grip-vertical') || e.target.closest('button') || e.offsetX >= e.target.clientWidth) {
            return;
        }

        e.preventDefault();
        this.isDraggingForSelection = true;
        
        const listItem = e.target.closest('li');
        if (!listItem) return;

        this.selectionStartIndex = Array.from(listItem.parentElement.children).indexOf(listItem);
        
        // Clear previous selections
        this.canvas.canvas.discardActiveObject();
        this.ui.elements.labelList.querySelectorAll('li.active').forEach(li => li.classList.remove('active'));

        // Select starting item
        listItem.classList.add('active');

        const onMouseMove = (moveEvent) => {
            if (!this.isDraggingForSelection) return;

            const labelList = this.ui.elements.labelList;
            const rect = labelList.getBoundingClientRect();
            const mouseY = moveEvent.clientY;
            const scrollThreshold = 50; // pixels from edge
            const scrollSpeed = 20; // pixels per frame

            // Auto-scroll logic
            if (mouseY < rect.top + scrollThreshold) {
                labelList.scrollTop -= scrollSpeed;
            } else if (mouseY > rect.bottom - scrollThreshold) {
                labelList.scrollTop += scrollSpeed;
            }

            // Use elementFromPoint to get the item under the cursor, even during scroll
            const currentItem = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY).closest('li');
            if (!currentItem || !currentItem.parentElement.isSameNode(labelList)) return;

            const currentIndex = Array.from(currentItem.parentElement.children).indexOf(currentItem);
            if (currentIndex === -1) return;

            const min = Math.min(this.selectionStartIndex, currentIndex);
            const max = Math.max(this.selectionStartIndex, currentIndex);

            this.ui.elements.labelList.querySelectorAll('li').forEach((li, index) => {
                li.classList.toggle('active', index >= min && index <= max);
            });
        };

        const onMouseUp = () => {
            this.isDraggingForSelection = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            const selectedRects = [];
            const rects = this.canvas.getObjects('rect');
            this.ui.elements.labelList.querySelectorAll('li.active').forEach(li => {
                const index = parseInt(li.dataset.index, 10);
                if (!isNaN(index) && rects[index]) {
                    selectedRects.push(rects[index]);
                }
            });

            if (selectedRects.length > 1) {
                const sel = new fabric.ActiveSelection(selectedRects, { canvas: this.canvas.canvas });
                this.canvas.canvas.setActiveObject(sel);
                this.canvas.renderAll();
            } else if (selectedRects.length === 1) {
                this.canvas.canvas.setActiveObject(selectedRects[0]);
                this.canvas.renderAll();
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    toggleDarkMode(e) {
        const isEnabled = e.target.checked;
        document.body.classList.toggle('dark-mode', isEnabled);
        localStorage.setItem('darkMode', isEnabled ? 'enabled' : 'disabled');

        // Manually update button classes that don't automatically adapt
        const buttonsToUpdate = [
            ...document.querySelectorAll('label[for="showLabeled"], label[for="showUnlabeled"], label[for="drawMode"], label[for="editMode"]')
        ];

        if (isEnabled) {
            buttonsToUpdate.forEach(btn => {
                btn.classList.remove('btn-outline-primary');
                btn.classList.add('btn-outline-secondary');
            });
        } else {
            buttonsToUpdate.forEach(btn => {
                btn.classList.remove('btn-outline-secondary');
                btn.classList.add('btn-outline-primary');
            });
        }
    }

    copy() {
        const activeObject = this.canvas.canvas.getActiveObject();
        if (!activeObject) return;
        activeObject.clone(cloned => { this.state._clipboard = cloned; }, ['labelClass', 'originalYolo']);
    }

        paste() {
            if (!this.state._clipboard) return;

            this.state._clipboard.clone(cloned => {
                this.canvas.canvas.discardActiveObject();
                const newObjects = [];
                const { x, y } = this.state.lastMousePosition;
                const img = this.state.currentImage;
                if (!img) return;

                const targetX = Math.min(Math.max(x, 0), img.width);
                const targetY = Math.min(Math.max(y, 0), img.height);

                if (cloned.type === 'activeSelection') {
                    const tempGroup = new fabric.ActiveSelection(
                        cloned.getObjects().map(obj => fabric.util.object.clone(obj)),
                        { canvas: this.canvas.canvas }
                    );
                    const bounds = tempGroup.getBoundingRect(true);
                    const offsetX = targetX - (bounds.left + bounds.width  / 2);
                    const offsetY = targetY - (bounds.top  + bounds.height / 2);

                    tempGroup.getObjects().forEach(obj => {
                        obj.left += offsetX;
                        obj.top  += offsetY;
                        obj.originalYolo = null;
                        const color = getColorForClass(obj.labelClass);
                        obj.set({ fill: `${color}33`, stroke: color });
                        obj.setCoords();

                        this.canvas.canvas.add(obj);
                        this.canvas.drawLabelText(obj); // <<< 이 줄을 추가합니다.
                        newObjects.push(obj);
                    });
                } else {
                    const clonedObj = fabric.util.object.clone(cloned);
                    const center = clonedObj.getCenterPoint();
                    clonedObj.left += (targetX - center.x);
                    clonedObj.top  += (targetY - center.y);
                    clonedObj.originalYolo = null;
                    const color = getColorForClass(clonedObj.labelClass);
                    clonedObj.set({ fill: `${color}33`, stroke: color });
                    clonedObj.setCoords();

                    this.canvas.canvas.add(clonedObj);
                    this.canvas.drawLabelText(clonedObj); // <<< 이 줄을 추가합니다.
                    newObjects.push(clonedObj);
                }

                const selection = new fabric.ActiveSelection(newObjects, {
                    canvas: this.canvas.canvas
                });
                this.canvas.canvas.setActiveObject(selection);
                this.canvas.canvas.requestRenderAll();
                this.ui.updateLabelList();
            }, ['labelClass', 'originalYolo']);
        }


    deleteSelected() {
        this.canvas.canvas.getActiveObjects().forEach(obj => this.canvas.removeObject(obj));
        this.canvas.canvas.discardActiveObject().renderAll();
        this.ui.updateLabelList();
    }

    async changeSelectedClasses() {
        const activeSelection = this.canvas.canvas.getActiveObject();
        if (!activeSelection) {
            showToast('Please select one or more objects.');
            return;
        }

        try {
            const finalLabel = await this.ui.promptForLabelClass(activeSelection.labelClass || '0');
            const color = getColorForClass(finalLabel);

            const applyChanges = (obj) => {
                obj.set('labelClass', finalLabel);
                obj.set({ fill: `${color}33`, stroke: color });
                obj.originalYolo = null; // Mark as modified
                this.canvas.updateLabelText(obj);
            };

            if (activeSelection.type === 'activeSelection') {
                activeSelection.forEachObject(applyChanges);
            } else {
                applyChanges(activeSelection);
            }
            
            this.ui.updateLabelList();
            this.canvas.renderAll();
        } catch (error) {
            console.log(error); // User cancelled
        }
    }

    navigateImage(direction) {
        if (this.state.imageFiles.length === 0) return;
        const currentIndex = this.state.imageFiles.findIndex(f => f.name === this.state.currentImageFile?.name);
        if (currentIndex === -1 && this.state.imageFiles.length > 0) {
            this.fileSystem.loadImageAndLabels(this.state.imageFiles[0]);
            return;
        }
        
        let nextIndex = currentIndex + direction;
        if (nextIndex >= this.state.imageFiles.length) nextIndex = 0;
        else if (nextIndex < 0) nextIndex = this.state.imageFiles.length - 1;
        
        this.fileSystem.loadImageAndLabels(this.state.imageFiles[nextIndex]);
    }

    scrollPreview(direction) {
        const scrollAmount = 100; // Adjust as needed
        this.ui.elements.previewListWrapper.scrollLeft += direction * scrollAmount;
    }
}


// =================================================================================
// Main App Initialization
// =================================================================================

class App {
    constructor() {
        if (!('showDirectoryPicker' in window)) {
            showToast('File System Access API is only supported over localhost or HTTPS. Please use a secure connection (https).', 10000);
            return;
        }
        this.state = new AppState();
        this.canvasController = new CanvasController(this.state, null, null);
        this.uiManager = new UIManager(this.state, this.canvasController, null);
        this.fileSystem = new FileSystem(this.state, this.uiManager, this.canvasController);
        
        // Inject dependencies
        this.canvasController.uiManager = this.uiManager;
        this.canvasController.fileSystem = this.fileSystem;
        this.uiManager.fileSystem = this.fileSystem;

        this.eventManager = new EventManager(this.state, this.uiManager, this.fileSystem, this.canvasController);
        
        this.init();
    }

    init() {
        this.eventManager.bindEventListeners();
        this.canvasController.setMode(this.state.currentMode);
        this.uiManager.updateLabelFolderButton(false);
        this.uiManager.togglePreviewBarVisibility(true); // Start hidden

        // Apply dark mode on load
        const storedTheme = localStorage.getItem('darkMode');
        if (storedTheme === 'enabled') {
            this.uiManager.elements.darkModeToggle.checked = true;
            document.body.classList.add('dark-mode');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new App());