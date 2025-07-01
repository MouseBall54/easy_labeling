document.addEventListener('DOMContentLoaded', () => {
    // Check for File System Access API support
    if (!('showDirectoryPicker' in window)) {
        showToast('Your browser is not supported. Please use Chrome or Edge.', 10000);
        return;
    }

    const canvas = new fabric.Canvas('canvas', {
        width: 800,
        height: 600,
        backgroundColor: '#eee'
    });

    // --- UI Elements ---
    const selectImageFolderBtn = document.getElementById('selectImageFolderBtn');
    const selectLabelFolderBtn = document.getElementById('selectLabelFolderBtn');
    const imageList = document.getElementById('image-list');
    const imageSearchInput = document.getElementById('imageSearchInput');
    const saveLabelsBtn = document.getElementById('saveLabelsBtn');
    const autoSaveToggle = document.getElementById('autoSaveToggle');
    const drawModeBtn = document.getElementById('drawMode');
    const editModeBtn = document.getElementById('editMode');
    const labelList = document.getElementById('label-list');
    const labelFilters = document.getElementById('label-filters');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn');
    const toastContainer = document.getElementById('toast-container');
    const canvasContainer = document.querySelector('.canvas-container');
    const zoomLevelDisplay = document.getElementById('zoom-level');
    const mouseCoordsDisplay = document.getElementById('mouse-coords');
    const coordXInput = document.getElementById('coordX');
    const coordYInput = document.getElementById('coordY');
    const currentImageNameSpan = document.getElementById('current-image-name');


    // --- Toast Notification ---
    function showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10); // Delay to allow CSS transition

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300); // Wait for fade out transition
        }, duration);
    }

    // --- State Management ---
    let imageFolderHandle = null;
    let labelFolderHandle = null;
    let imageFiles = [];
    let currentImageFile = null;
    let currentImage = null;
    let currentMode = 'draw';
    let isAutoSaveEnabled = false;
    let saveTimeout = null;
    let currentLoadToken = 0; // Token to handle race conditions

    // --- Folder Selection & File Search ---
    selectImageFolderBtn.addEventListener('click', async () => {
        try {
            imageFolderHandle = await window.showDirectoryPicker();
            await listImageFiles();
        } catch (err) {
            console.error('Error selecting image folder:', err);
        }
    });

    selectLabelFolderBtn.addEventListener('click', async () => {
        try {
            labelFolderHandle = await window.showDirectoryPicker();
            showToast(`Label folder selected: ${labelFolderHandle.name}`);
        } catch (err) {
            console.error('Error selecting label folder:', err);
        }
    });

    async function listImageFiles() {
        if (!imageFolderHandle) return;
        imageFiles = [];
        imageList.innerHTML = '<div class="list-group-item">Loading...</div>';
        for await (const entry of imageFolderHandle.values()) {
            if (entry.kind === 'file' && /\.(jpg|jpeg|png|gif|tif|tiff)$/i.test(entry.name)) {
                imageFiles.push(entry);
            }
        }
        renderImageList();
    }

    function renderImageList() {
        const searchTerm = imageSearchInput.value.toLowerCase();
        imageList.innerHTML = '';
        imageFiles
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
            .filter(file => file.name.toLowerCase().includes(searchTerm))
            .forEach(file => {
                const a = document.createElement('a');
                a.href = '#';
                a.className = 'list-group-item list-group-item-action';
                a.textContent = file.name;
                if (currentImageFile && file.name === currentImageFile.name) {
                    a.classList.add('active');
                }
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadImageAndLabels(file);
                });
                imageList.appendChild(a);
            });
    }

    imageSearchInput.addEventListener('input', renderImageList);


    // --- Image and Label Loading ---
    async function loadImageAndLabels(imageFile) {
        const loadToken = ++currentLoadToken;

        currentImageFile = imageFile;
        currentImageNameSpan.textContent = imageFile.name; // Update the navbar
        const file = await imageFile.getFile();

        const setBackgroundImage = (img) => {
            if (loadToken !== currentLoadToken) return; // A new image was requested, abort.
            currentImage = img;
            canvas.clear(); // Clear canvas only when we are sure to render the new image
            labelList.innerHTML = '';
            labelFilters.innerHTML = '';
            canvas.setWidth(canvasContainer.offsetWidth);
            canvas.setHeight(canvasContainer.offsetHeight);
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            resetZoom();
            loadLabels(imageFile.name, loadToken);
        };

        if (/\.(tif|tiff)$/i.test(file.name)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (loadToken !== currentLoadToken) return;
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

        // Update active item in the list and scroll it into view
        document.querySelectorAll('#image-list .list-group-item').forEach(item => {
            const isActive = item.textContent === imageFile.name;
            item.classList.toggle('active', isActive);
            if (isActive) {
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    async function loadLabels(imageName, loadToken) {
        if (!labelFolderHandle) return;
        
        const labelFileName = imageName.replace(/\.[^/.]+$/, "") + ".txt";
        try {
            const labelFileHandle = await labelFolderHandle.getFileHandle(labelFileName);
            const file = await labelFileHandle.getFile();
            const yoloData = await file.text();
            
            if (loadToken !== currentLoadToken) return; // A new image was requested, abort.

            if (!yoloData) {
                updateLabelList(); // Ensure label list is cleared if no labels found
                return;
            }
            const lines = yoloData.split('\n').filter(line => line.trim() !== '');
            const imgWidth = currentImage.width;
            const imgHeight = currentImage.height;

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
                    selectable: currentMode === 'edit', labelClass: String(labelClass)
                });
                canvas.add(rect);
            });
            updateLabelList();
        } catch (err) {
            if (err.name === 'NotFoundError') {
                console.log(`No label file found for ${imageName}.`);
                if (loadToken === currentLoadToken) updateLabelList(); // Still update list
            } else {
                console.error('Error loading labels:', err);
            }
        }
    }

    // --- Save Labels ---
    async function saveLabels(isAuto = false) {
        if (!currentImageFile) {
            if (!isAuto) showToast('Please select an image first.');
            return;
        }
        if (!labelFolderHandle) {
            if (!isAuto) showToast('Please select a label folder first.');
            return;
        }

        const rects = canvas.getObjects('rect');
        const imgWidth = currentImage.width;
        const imgHeight = currentImage.height;
        let yoloString = '';

        rects.forEach(rect => {
            const labelClass = rect.labelClass || '0';
            
            // When objects are in a group (active selection), their left/top properties are relative.
            // We need to calculate the absolute position for saving.
            const center = rect.getCenterPoint(); // Gets absolute center
            const width = rect.getScaledWidth();
            const height = rect.getScaledHeight();

            const x_center = center.x / imgWidth;
            const y_center = center.y / imgHeight;
            const normWidth = width / imgWidth;
            const normHeight = height / imgHeight;
            
            yoloString += `${labelClass} ${x_center.toFixed(6)} ${y_center.toFixed(6)} ${normWidth.toFixed(6)} ${normHeight.toFixed(6)}\n`;
        });

        const labelFileName = currentImageFile.name.replace(/\.[^/.]+$/, "") + ".txt";
        try {
            const fileHandle = await labelFolderHandle.getFileHandle(labelFileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(yoloString.trim());
            await writable.close();
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
    
    saveLabelsBtn.addEventListener('click', () => saveLabels(false));

    autoSaveToggle.addEventListener('change', (e) => {
        isAutoSaveEnabled = e.target.checked;
        showToast(`Auto Save ${isAutoSaveEnabled ? 'Enabled' : 'Disabled'}`);
        if (isAutoSaveEnabled) {
            triggerAutoSave();
        }
    });

    function triggerAutoSave() {
        if (!isAutoSaveEnabled) return;
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => saveLabels(true), 1000);
    }

    // --- Color Palette ---
    const colorPalette = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000', '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'];
    function getColorForClass(labelClass) {
        const classNumber = parseInt(labelClass, 10);
        return isNaN(classNumber) || classNumber < 0 ? '#000000' : colorPalette[classNumber % colorPalette.length];
    }

    // --- Drawing Logic ---
    let isDrawing = false, startPoint = null, currentRect = null;
    canvas.on('mouse:down', (o) => {
        if (o.e.altKey || currentMode !== 'draw' || !currentImage) return;
        isDrawing = true;
        startPoint = canvas.getPointer(o.e);
        currentRect = new fabric.Rect({
            left: startPoint.x, top: startPoint.y, width: 0, height: 0,
            fill: 'rgba(255, 0, 0, 0.2)', stroke: 'red', strokeWidth: 2, selectable: false,
        });
        canvas.add(currentRect);
    });
    canvas.on('mouse:move', (o) => {
        if (!isDrawing || !currentRect) return;
        const pointer = canvas.getPointer(o.e);
        let width = pointer.x - startPoint.x;
        let height = pointer.y - startPoint.y;
        currentRect.set({
            left: width > 0 ? startPoint.x : pointer.x,
            top: height > 0 ? startPoint.y : pointer.y,
            width: Math.abs(width), height: Math.abs(height)
        });
        canvas.renderAll();
    });
    canvas.on('mouse:up', () => {
        if (!isDrawing) return;
        isDrawing = false;
        if (currentRect.width < 5 && currentRect.height < 5) {
            canvas.remove(currentRect);
        } else {
            const newLabel = prompt('Enter label class for the new box:', '0');
            const finalLabel = (newLabel !== null && newLabel.trim() !== '') ? newLabel.trim() : '0';
            currentRect.set('labelClass', finalLabel);
            const color = getColorForClass(finalLabel);
            currentRect.set({ fill: `${color}33`, stroke: color });
            updateLabelList();
            triggerAutoSave();
        }
        currentRect = null;
    });

    // --- Auto-save Triggers ---
    canvas.on('object:modified', triggerAutoSave);
    canvas.on('object:scaled', triggerAutoSave);

    // --- Panel Splitter Logic ---
    const splitter = document.getElementById('panel-splitter');
    const controlPanel = document.getElementById('control-panel');

    splitter.addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        const newWidth = e.clientX;
        if (newWidth > 200 && newWidth < 600) { // Min and Max width
            controlPanel.style.width = newWidth + 'px';
            canvas.setWidth(canvasContainer.offsetWidth);
            canvas.setHeight(canvasContainer.offsetHeight);
            resetZoom();
        }
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    // --- Show Class on Selection ---
    let activeLabelText = null;
    canvas.on('selection:created', updateSelectionLabel);
    canvas.on('selection:updated', updateSelectionLabel);
    canvas.on('selection:cleared', clearSelectionLabel);

    function updateSelectionLabel(e) {
        clearSelectionLabel();
        // Only show label for single selections
        if (e.selected.length !== 1) {
            return;
        }
        const activeObject = e.selected[0];
        
        if (activeObject && activeObject.type === 'rect' && activeObject.labelClass) {
            const zoom = canvas.getZoom();
            const text = new fabric.Text('Class: ' + activeObject.labelClass, {
                left: activeObject.left,
                top: activeObject.top - 20 / zoom, // Position above the box
                fontSize: 16 / zoom,
                fill: 'black',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                padding: 2 / zoom,
                selectable: false,
                evented: false,
            });
            activeLabelText = text;
            canvas.add(activeLabelText);
        }
    }

    function clearSelectionLabel() {
        if (activeLabelText) {
            canvas.remove(activeLabelText);
            activeLabelText = null;
        }
    }

    // --- Info Display & Canvas Events ---
    function updateZoomDisplay() {
        const zoom = canvas.getZoom() * 100;
        zoomLevelDisplay.textContent = `Zoom: ${zoom.toFixed(0)}%`;
    }

    canvas.on('zoom:updated', updateZoomDisplay); // Custom event for zoom
    
    canvas.on('mouse:move', (options) => {
        if (!currentImage) return;
        const pointer = canvas.getPointer(options.e);
        const imageX = Math.round(pointer.x);
        const imageY = Math.round(pointer.y);

        if (imageX >= 0 && imageX <= currentImage.width && imageY >= 0 && imageY <= currentImage.height) {
            mouseCoordsDisplay.textContent = `X: ${imageX}, Y: ${imageY}`;
            mouseCoordsDisplay.style.display = 'block';
        } else {
            mouseCoordsDisplay.style.display = 'none';
        }
    });

    canvas.on('mouse:out', () => {
        mouseCoordsDisplay.style.display = 'none';
    });

    // --- Label List, Filtering, and Drag & Drop ---
    function updateLabelList() {
        labelList.innerHTML = '';
        const rects = canvas.getObjects('rect');
        
        updateLabelFilters(rects);

        rects.forEach((rect, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.draggable = true;
            li.dataset.index = index;

            const color = getColorForClass(rect.labelClass);
            li.innerHTML = `<span><i class="bi bi-grip-vertical me-2"></i><span class="badge me-2" style="background-color: ${color};"> </span>Class: ${rect.labelClass}</span><div><button class="btn btn-sm btn-outline-primary edit-btn py-0 px-1" data-index="${index}"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger delete-btn py-0 px-1" data-index="${index}"><i class="bi bi-trash"></i></button></div>`;
            
            li.addEventListener('click', (e) => {
                if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) return;
                document.querySelectorAll('#label-list li').forEach(item => item.classList.remove('active'));
                li.classList.add('active');
                canvas.setActiveObject(rects[index]).renderAll();
            });

            li.addEventListener('dragstart', handleDragStart);
            li.addEventListener('dragover', handleDragOver);
            li.addEventListener('drop', handleDrop);
            li.addEventListener('dragend', handleDragEnd);

            labelList.appendChild(li);
        });

        addEditDeleteListeners(rects);
    }

    function updateLabelFilters(rects) {
        labelFilters.innerHTML = '';
        const uniqueClasses = [...new Set(rects.map(r => r.labelClass))].sort((a, b) => a - b);

        if (uniqueClasses.length > 1) {
            const allBtn = document.createElement('button');
            allBtn.className = 'btn btn-sm btn-primary me-1 mb-1';
            allBtn.textContent = 'All';
            allBtn.addEventListener('click', () => {
                const allActive = document.querySelectorAll('#label-filters .btn.active').length === uniqueClasses.length;
                document.querySelectorAll('#label-filters .btn[data-label-class]').forEach(btn => {
                    btn.classList.toggle('active', !allActive);
                    const isActive = btn.classList.contains('active');
                    const rectsToToggle = canvas.getObjects('rect').filter(r => r.labelClass === btn.dataset.labelClass);
                    rectsToToggle.forEach(r => r.set('visible', isActive));
                });
                canvas.renderAll();
            });
            labelFilters.appendChild(allBtn);
        }

        uniqueClasses.forEach(labelClass => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm btn-outline-secondary me-1 mb-1 active';
            btn.textContent = `Class ${labelClass}`;
            btn.dataset.labelClass = labelClass;

            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                const isActive = btn.classList.contains('active');
                const rectsToToggle = canvas.getObjects('rect').filter(r => r.labelClass === labelClass);
                rectsToToggle.forEach(r => r.set('visible', isActive));
                canvas.renderAll();
            });
            labelFilters.appendChild(btn);
        });
    }

    function addEditDeleteListeners(rects) {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index, 10);
                const rect = rects[index];
                const newLabel = prompt('Enter new label class:', rect.labelClass || '0');
                if (newLabel !== null && newLabel.trim() !== '') {
                    const finalLabel = newLabel.trim();
                    rect.set('labelClass', finalLabel);
                    const color = getColorForClass(finalLabel);
                    rect.set({ fill: `${color}33`, stroke: color });
                    updateLabelList();
                    canvas.renderAll();
                    triggerAutoSave();
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index, 10);
                canvas.remove(rects[index]);
                updateLabelList();
                triggerAutoSave();
            });
        });
    }

    let dragSrcEl = null;

    function handleDragStart(e) {
        this.style.opacity = '0.4';
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }

    function handleDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDrop(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (dragSrcEl !== this) {
            const srcIndex = parseInt(dragSrcEl.dataset.index, 10);
            const destIndex = parseInt(this.dataset.index, 10);
            
            const rects = canvas.getObjects('rect');
            const movedRect = rects.splice(srcIndex, 1)[0];
            rects.splice(destIndex, 0, movedRect);

            rects.forEach(rect => canvas.remove(rect));
            rects.forEach(rect => canvas.add(rect));
            
            updateLabelList();
            triggerAutoSave();
        }
        return false;
    }

    function handleDragEnd() {
        this.style.opacity = '1';
    }

    // --- Mode, Edit, Zoom, Pan Logic ---
    function setMode(mode) {
        currentMode = mode;
        canvas.selection = mode === 'edit';
        canvas.defaultCursor = mode === 'draw' ? 'crosshair' : 'default';
        canvas.getObjects('rect').forEach(obj => obj.set('selectable', mode === 'edit'));
        canvas.renderAll();
    }
    drawModeBtn.addEventListener('change', () => setMode('draw'));
    editModeBtn.addEventListener('change', () => setMode('edit'));

    let _clipboard = null;
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (currentMode === 'edit' && (e.ctrlKey || e.metaKey)) {
            if (e.key === 'c') copy();
            if (e.key === 'v') paste();
            if (e.key === 'b') changeSelectedClasses();
        }
        
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (currentMode === 'edit') deleteSelected();
        }

        if (e.key.toLowerCase() === 'd') navigateImage(1);
        if (e.key.toLowerCase() === 'a') navigateImage(-1);
    });

    function navigateImage(direction) {
        if (imageFiles.length === 0) return;
        const currentIndex = imageFiles.findIndex(f => f.name === currentImageFile?.name);
        if (currentIndex === -1 && imageFiles.length > 0) {
            loadImageAndLabels(imageFiles[0]);
            return;
        }
        
        let nextIndex = currentIndex + direction;
        if (nextIndex >= imageFiles.length) nextIndex = 0;
        else if (nextIndex < 0) nextIndex = imageFiles.length - 1;
        
        loadImageAndLabels(imageFiles[nextIndex]);
    }

    function copy() {
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        activeObject.clone(cloned => { _clipboard = cloned; }, ['labelClass']);
    }

    function paste() {
        if (!_clipboard) return;
        _clipboard.clone(cloned => {
            canvas.discardActiveObject();
            const newObjects = [];

            if (cloned.type === 'activeSelection') {
                cloned.forEachObject(obj => {
                    const newObj = fabric.util.object.clone(obj);
                    newObj.set({ left: newObj.left + 10, top: newObj.top + 10, evented: true });
                    const color = getColorForClass(newObj.labelClass);
                    newObj.set({ fill: `${color}33`, stroke: color });
                    canvas.add(newObj);
                    newObjects.push(newObj);
                });
            } else {
                const newObj = fabric.util.object.clone(cloned);
                newObj.set({ left: newObj.left + 10, top: newObj.top + 10, evented: true });
                const color = getColorForClass(newObj.labelClass);
                newObj.set({ fill: `${color}33`, stroke: color });
                canvas.add(newObj);
                newObjects.push(newObj);
            }

            const sel = new fabric.ActiveSelection(newObjects, { canvas: canvas });
            canvas.setActiveObject(sel).requestRenderAll();
            updateLabelList();
            triggerAutoSave();
        }, ['labelClass']);
    }

    function deleteSelected() {
        canvas.getActiveObjects().forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject().renderAll();
        updateLabelList();
        triggerAutoSave();
    }

    function changeSelectedClasses() {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length === 0) {
            showToast('No objects selected.');
            return;
        }

        const newLabel = prompt(`Enter new class for ${activeObjects.length} selected objects:`);
        if (newLabel !== null && newLabel.trim() !== '') {
            const finalLabel = newLabel.trim();
            const color = getColorForClass(finalLabel);
            activeObjects.forEach(obj => {
                if (obj.type === 'rect') {
                    obj.set('labelClass', finalLabel);
                    obj.set({ fill: `${color}33`, stroke: color });
                }
            });
            canvas.renderAll();
            updateLabelList();
            triggerAutoSave();
        }
    }

    // --- Go to Coordinates and Highlight ---
    function goToCoords() {
        if (!currentImage) {
            showToast('Please load an image first.');
            return;
        }
        const x = parseInt(coordXInput.value, 10);
        const y = parseInt(coordYInput.value, 10);

        if (isNaN(x) || isNaN(y)) {
            showToast('Please enter valid X and Y coordinates.');
            return;
        }

        // Pan the canvas to center the specified point without changing the zoom
        const zoom = canvas.getZoom();
        const newX = -x * zoom + canvas.getWidth() / 2;
        const newY = -y * zoom + canvas.getHeight() / 2;
        
        canvas.setViewportTransform([zoom, 0, 0, zoom, newX, newY]);
        
        // Highlight effect
        const highlightCircle = new fabric.Circle({
            left: x,
            top: y,
            radius: 0,
            fill: 'transparent',
            stroke: 'yellow',
            strokeWidth: 3,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
        });
        canvas.add(highlightCircle);

        highlightCircle.animate('radius', 50 / zoom, { // Make radius consistent regardless of zoom
            onChange: canvas.renderAll.bind(canvas),
            duration: 500,
            easing: fabric.util.ease.easeOutQuad,
            onComplete: () => {
                highlightCircle.animate('opacity', 0, {
                    onChange: canvas.renderAll.bind(canvas),
                    duration: 300,
                    onComplete: () => canvas.remove(highlightCircle),
                });
            }
        });
        canvas.fire('zoom:updated');
    }

    goToCoordsBtn.addEventListener('click', goToCoords);
    coordXInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') goToCoords(); });
    coordYInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') goToCoords(); });


    canvas.on('mouse:wheel', opt => {
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.1) zoom = 0.1;
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
        canvas.fire('zoom:updated');
    });
    canvas.on('mouse:down', opt => {
        const evt = opt.e;
        // Pan with Alt or Ctrl key
        if (evt.altKey || evt.ctrlKey) {
            canvas.isDragging = true;
            canvas.selection = false;
            canvas.lastPosX = evt.clientX;
            canvas.lastPosY = evt.clientY;
        }
    });
    canvas.on('mouse:move', opt => {
        if (canvas.isDragging) {
            const vpt = canvas.viewportTransform;
            vpt[4] += opt.e.clientX - canvas.lastPosX;
            vpt[5] += opt.e.clientY - canvas.lastPosY;
            canvas.requestRenderAll();
            canvas.lastPosX = opt.e.clientX;
            canvas.lastPosY = opt.e.clientY;
        }
    });
    canvas.on('mouse:up', () => {
        if (canvas.isDragging) {
            canvas.setViewportTransform(canvas.viewportTransform);
            canvas.isDragging = false;
            canvas.selection = true;
        }
    });
    zoomInBtn.addEventListener('click', () => zoom(1.2));
    zoomOutBtn.addEventListener('click', () => zoom(0.8));
    resetZoomBtn.addEventListener('click', () => resetZoom());
    function zoom(factor) {
        const center = canvas.getCenter();
        canvas.zoomToPoint(new fabric.Point(center.left, center.top), canvas.getZoom() * factor);
        canvas.fire('zoom:updated');
    }
    function resetZoom() {
        if (!currentImage) return;
        const containerWidth = canvasContainer.offsetWidth;
        const containerHeight = canvasContainer.offsetHeight;
        const imgWidth = currentImage.width;
        const imgHeight = currentImage.height;

        const scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight) * 0.95; // 95% padding
        
        canvas.setZoom(scale);
        canvas.viewportTransform[4] = (containerWidth - imgWidth * scale) / 2;
        canvas.viewportTransform[5] = (containerHeight - imgHeight * scale) / 2;
        canvas.requestRenderAll();
        canvas.fire('zoom:updated');
    }

    // --- Initial Setup ---
    setMode(currentMode);
});