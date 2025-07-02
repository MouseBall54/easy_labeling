
document.addEventListener('DOMContentLoaded', () => {
    // Canvas & Fabric.js
    const canvas = new fabric.Canvas('canvas', {
        backgroundColor: '#f0f0f0',
        selection: false, 
    });

    // Panels & Splitters
    const leftPanel = document.getElementById('left-panel');
    const rightPanel = document.getElementById('right-panel');
    const leftSplitter = document.getElementById('left-splitter');
    const rightSplitter = document.getElementById('right-splitter');
    const canvasContainer = document.getElementById('canvas-container');

    // Navbar Elements
    const currentImageName = document.getElementById('current-image-name');
    const zoomLevel = document.getElementById('zoom-level');
    const mouseCoords = document.getElementById('mouse-coords');
    const coordXInput = document.getElementById('coordX');
    const coordYInput = document.getElementById('coordY');
    const goToCoordsBtn = document.getElementById('goToCoordsBtn');

    // Left Panel Controls
    const selectImageFolderBtn = document.getElementById('selectImageFolderBtn');
    const selectLabelFolderBtn = document.getElementById('selectLabelFolderBtn');
    const imageSearchInput = document.getElementById('imageSearchInput');
    const imageListContainer = document.getElementById('image-list');
    const autoSaveToggle = document.getElementById('autoSaveToggle');
    const saveLabelsBtn = document.getElementById('saveLabelsBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn');
    const drawModeRadio = document.getElementById('drawMode');
    const editModeRadio = document.getElementById('editMode');

    // Right Panel Controls
    const labelFilterContainer = document.getElementById('label-filters');
    const labelList = document.getElementById('label-list');

    // Toast Container
    const toastContainer = document.getElementById('toast-container');

    // --- State Management ---
    let imageFiles = [];
    let labelFiles = [];
    let currentImageHandle = null;
    let imageFolderHandle = null;
    let labelFolderHandle = null;
    let currentLabelData = {}; 
    let currentFabricImage = null;
    let isAutoSaveEnabled = false;
    let currentMode = 'draw'; // 'draw' or 'edit'
    let activeLabelListItem = null;
    let activeRect = null;

    // --- Initial Setup ---
    function initialize() {
        console.log("Easy Labeling App Initialized");
        setupEventListeners();
        setMode(currentMode);
        resizeCanvas();
        
        // Check for File System Access API support
        if (!window.showDirectoryPicker) {
            showToast('Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge.', 'danger');
            selectImageFolderBtn.disabled = true;
            selectLabelFolderBtn.disabled = true;
        }
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        window.addEventListener('resize', resizeCanvas);

        // Panel resizing
        leftSplitter.addEventListener('mousedown', (e) => initResize(e, leftPanel, 'x'));
        rightSplitter.addEventListener('mousedown', (e) => initResize(e, rightPanel, 'x-reverse'));

        // Left Panel
        selectImageFolderBtn.addEventListener('click', selectImageFolder);
        selectLabelFolderBtn.addEventListener('click', selectLabelFolder);
        imageSearchInput.addEventListener('input', filterImageList);
        autoSaveToggle.addEventListener('change', (e) => isAutoSaveEnabled = e.target.checked);
        saveLabelsBtn.addEventListener('click', () => saveLabels(currentImageHandle));
        
        // Zoom
        zoomInBtn.addEventListener('click', () => zoom(1.2));
        zoomOutBtn.addEventListener('click', () => zoom(0.8));
        resetZoomBtn.addEventListener('click', resetZoom);

        // Mode
        drawModeRadio.addEventListener('change', () => setMode('draw'));
        editModeRadio.addEventListener('change', () => setMode('edit'));

        // Canvas
        canvas.on('mouse:wheel', handleMouseWheel);
        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);
        canvas.on('object:modified', handleObjectModified);
        canvas.on('selection:created', handleSelectionCreated);
        canvas.on('selection:updated', handleSelectionUpdated);
        canvas.on('selection:cleared', handleSelectionCleared);
    }

    // --- Folder & File Handling ---
    async function selectImageFolder() {
        try {
            imageFolderHandle = await window.showDirectoryPicker();
            await loadImageList();
            selectLabelFolderBtn.disabled = false; // Enable label folder selection
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error selecting image folder:', err);
                showToast('Error selecting image folder.', 'danger');
            }
        }
    }

    async function selectLabelFolder() {
        try {
            labelFolderHandle = await window.showDirectoryPicker();
            // If an image is already loaded, try to load its labels
            if (currentImageHandle) {
                await loadImageAndLabels(currentImageHandle);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error selecting label folder:', err);
                showToast('Error selecting label folder.', 'danger');
            }
        }
    }

    async function loadImageList() {
        if (!imageFolderHandle) return;
        
        imageFiles = [];
        imageListContainer.innerHTML = '<div class="list-group-item">Loading...</div>';

        const imagePromises = [];
        for await (const entry of imageFolderHandle.values()) {
            if (entry.kind === 'file' && (entry.name.match(/\.(jpg|jpeg|png|gif|bmp|tiff|tif)$/i))) {
                imagePromises.push(entry);
            }
        }

        // Natural sort for file names (e.g., img2.jpg before img10.jpg)
        imageFiles = imagePromises.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        
        renderImageList();
    }

    function renderImageList() {
        imageListContainer.innerHTML = '';
        const filteredFiles = imageFiles.filter(file => file.name.toLowerCase().includes(imageSearchInput.value.toLowerCase()));

        if (filteredFiles.length === 0) {
            imageListContainer.innerHTML = '<div class="list-group-item">No images found.</div>';
            return;
        }

        filteredFiles.forEach(fileHandle => {
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'list-group-item list-group-item-action';
            a.textContent = fileHandle.name;
            a.dataset.fileName = fileHandle.name;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentImageHandle && isAutoSaveEnabled) {
                    saveLabels(currentImageHandle);
                }
                loadImageAndLabels(fileHandle);
            });
            imageListContainer.appendChild(a);
        });
    }

    function filterImageList() {
        renderImageList();
    }

    async function loadImageAndLabels(imageFileHandle) {
        try {
            // Highlight selected image in the list
            document.querySelectorAll('#image-list a').forEach(el => {
                el.classList.remove('active');
                if (el.dataset.fileName === imageFileHandle.name) {
                    el.classList.add('active');
                }
            });

            currentImageHandle = imageFileHandle;
            currentImageName.textContent = imageFileHandle.name;
            
            const file = await imageFileHandle.getFile();
            const url = URL.createObjectURL(file);

            // Clear canvas
            canvas.clear();
            currentLabelData = {};
            renderLabelList();

            // Load image onto canvas
            fabric.Image.fromURL(url, (img) => {
                currentFabricImage = img;
                canvas.setWidth(img.width);
                canvas.setHeight(img.height);
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
                resetZoom();
                URL.revokeObjectURL(url);
            });

            // Load corresponding label file
            if (labelFolderHandle) {
                const labelFileName = imageFileHandle.name.substr(0, imageFileHandle.name.lastIndexOf('.')) + '.txt';
                try {
                    const labelFileHandle = await labelFolderHandle.getFileHandle(labelFileName);
                    const labelFile = await labelFileHandle.getFile();
                    const text = await labelFile.text();
                    parseAndDrawLabels(text);
                } catch (err) {
                    if (err.name === 'NotFoundError') {
                        console.log(`No label file found for ${imageFileHandle.name}. A new one will be created on save.`);
                    } else {
                        throw err;
                    }
                }
            }
        } catch (err) {
            console.error('Error loading image and labels:', err);
            showToast(`Error loading ${imageFileHandle.name}.`, 'danger');
        }
    }

    // --- Canvas & Drawing ---
    function resizeCanvas() {
        const containerWidth = canvasContainer.clientWidth;
        const containerHeight = canvasContainer.clientHeight;
        canvas.setDimensions({ width: containerWidth, height: containerHeight });
        if (currentFabricImage) {
            resetZoom(); // Re-center image on resize
        }
    }

    function setMode(mode) {
        currentMode = mode;
        if (mode === 'draw') {
            canvas.selection = false;
            canvas.defaultCursor = 'crosshair';
            canvas.getObjects('rect').forEach(obj => obj.set('selectable', false));
            drawModeRadio.checked = true;
        } else { // edit mode
            canvas.selection = true;
            canvas.defaultCursor = 'default';
            canvas.getObjects('rect').forEach(obj => obj.set('selectable', true));
            editModeRadio.checked = true;
        }
        canvas.renderAll();
    }

    // Placeholder for functions to be implemented
    function handleMouseWheel(opt) {
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        updateZoomLevel();
        opt.e.preventDefault();
        opt.e.stopPropagation();
    }

    let isPanning = false;
    let lastPosX, lastPosY;

    function handleMouseDown(opt) {
        const evt = opt.e;
        // Pan with Alt key or Middle mouse button
        if (evt.altKey === true || evt.button === 1) {
            isPanning = true;
            canvas.selection = false;
            lastPosX = evt.clientX;
            lastPosY = evt.clientY;
        } else if (currentMode === 'draw' && !canvas.getActiveObject()) {
            // Start drawing a new rectangle
            isDrawing = true;
            const pointer = canvas.getPointer(evt);
            startPoint = pointer;

            const classId = getNextClassId(); // Get a default class ID

            currentRect = new fabric.Rect({
                left: startPoint.x,
                top: startPoint.y,
                width: 0,
                height: 0,
                fill: 'rgba(255, 0, 0, 0.2)',
                stroke: 'red',
                strokeWidth: 2 / canvas.getZoom(), // Adjust stroke width with zoom
                selectable: false,
                classId: classId,
            });
            canvas.add(currentRect);
        }
    }

    function handleMouseMove(opt) {
        const evt = opt.e;
        // Update mouse coordinates display
        const pointer = canvas.getPointer(evt);
        mouseCoords.textContent = `X: ${pointer.x.toFixed(0)}, Y: ${pointer.y.toFixed(0)}`;

        if (isPanning) {
            const vpt = canvas.viewportTransform;
            vpt[4] += evt.clientX - lastPosX;
            vpt[5] += evt.clientY - lastPosY;
            canvas.requestRenderAll();
            lastPosX = evt.clientX;
            lastPosY = evt.clientY;
        } else if (isDrawing) {
            const pointer = canvas.getPointer(evt);
            let width = pointer.x - startPoint.x;
            let height = pointer.y - startPoint.y;

            currentRect.set({
                left: width > 0 ? startPoint.x : pointer.x,
                top: height > 0 ? startPoint.y : pointer.y,
                width: Math.abs(width),
                height: Math.abs(height),
            });
            canvas.renderAll();
        }
    }

    function handleMouseUp(opt) {
        if (isPanning) {
            isPanning = false;
            if (currentMode === 'edit') {
                 canvas.selection = true;
            }
        } else if (isDrawing) {
            isDrawing = false;
            // Prevent tiny boxes from being saved
            if (currentRect.width < 5 && currentRect.height < 5) {
                canvas.remove(currentRect);
            } else {
                // Finalize rect
                currentRect.setCoords();
                renderLabelList();
                if (isAutoSaveEnabled) {
                    saveLabels(currentImageHandle);
                }
            }
            currentRect = null;
        }
    }
    function handleObjectModified(e) {
        if (isAutoSaveEnabled) {
            saveLabels(currentImageHandle);
        }
    }

    function handleSelectionCreated(e) {
        highlightLabelListItem(e.selected[0]);
    }

    function handleSelectionUpdated(e) {
        highlightLabelListItem(e.selected[0]);
    }

    function handleSelectionCleared(e) {
        clearLabelListHighlight();
    }

    function highlightLabelListItem(fabricObject) {
        if (!fabricObject) return;
        const objectIndex = canvas.getObjects().indexOf(fabricObject);
        
        document.querySelectorAll('#label-list li').forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.dataset.index, 10) === objectIndex) {
                item.classList.add('active');
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    function clearLabelListHighlight() {
        document.querySelectorAll('#label-list li').forEach(item => {
            item.classList.remove('active');
        });
    }
    async function saveLabels(imageFileHandle) {
        if (!imageFileHandle || !labelFolderHandle || !currentFabricImage) {
            showToast('Image or Label folder not selected.', 'warning');
            return;
        }

        const rects = canvas.getObjects('rect');
        const imgWidth = currentFabricImage.width;
        const imgHeight = currentFabricImage.height;
        let yoloString = '';

        rects.forEach(rect => {
            const classId = rect.classId || '0'; // Default to '0' if not set

            const x_center = (rect.left + rect.width / 2) / imgWidth;
            const y_center = (rect.top + rect.height / 2) / imgHeight;
            const width = rect.width / imgWidth;
            const height = rect.height / imgHeight;

            // Ensure values are within [0, 1] bounds
            const clamped_x = Math.max(0, Math.min(1, x_center));
            const clamped_y = Math.max(0, Math.min(1, y_center));
            const clamped_w = Math.max(0, Math.min(1, width));
            const clamped_h = Math.max(0, Math.min(1, height));

            yoloString += `${classId} ${clamped_x.toPrecision(10)} ${clamped_y.toPrecision(10)} ${clamped_w.toPrecision(10)} ${clamped_h.toPrecision(10)}\n`;
        });

        try {
            const labelFileName = imageFileHandle.name.substr(0, imageFileHandle.name.lastIndexOf('.')) + '.txt';
            const fileHandle = await labelFolderHandle.getFileHandle(labelFileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(yoloString);
            await writable.close();
            showToast(`Labels saved to ${labelFileName}`, 'success');
        } catch (err) {
            console.error('Error saving labels:', err);
            showToast('Error saving labels.', 'danger');
        }
    }
    function parseAndDrawLabels(text) {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const imgWidth = currentFabricImage.width;
        const imgHeight = currentFabricImage.height;

        lines.forEach(line => {
            const parts = line.split(' ');
            const classId = parts[0];
            const [x_center, y_center, width, height] = parts.slice(1).map(parseFloat);

            const rectWidth = width * imgWidth;
            const rectHeight = height * imgHeight;
            const rectLeft = (x_center * imgWidth) - (rectWidth / 2);
            const rectTop = (y_center * imgHeight) - (rectHeight / 2);

            const rect = new fabric.Rect({
                left: rectLeft,
                top: rectTop,
                width: rectWidth,
                height: rectHeight,
                fill: 'rgba(255, 0, 0, 0.2)',
                stroke: 'red',
                strokeWidth: 2,
                selectable: currentMode === 'edit',
                classId: classId, 
            });
            canvas.add(rect);
        });
        renderLabelList();
        canvas.renderAll();
    }

    function renderLabelList() {
        labelList.innerHTML = '';
        const rects = canvas.getObjects('rect');
        
        updateLabelFilters();

        rects.forEach((rect, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item list-group-item-action';
            li.textContent = `Box ${index + 1} (Class: ${rect.classId || 'N/A'})`;
            li.dataset.index = canvas.getObjects().indexOf(rect);

            li.addEventListener('click', () => {
                document.querySelectorAll('#label-list li').forEach(item => item.classList.remove('active'));
                li.classList.add('active');
                activeLabelListItem = li;

                canvas.setActiveObject(rect);
                canvas.renderAll();
            });

            labelList.appendChild(li);
        });
    }
    function zoom(factor) {
        const center = canvas.getCenter();
        canvas.zoomToPoint(new fabric.Point(center.left, center.top), canvas.getZoom() * factor);
        updateZoomLevel();
    }

    function resetZoom() {
        if (!currentFabricImage) return;
        const containerWidth = canvasContainer.clientWidth;
        const scale = containerWidth / currentFabricImage.width;
        canvas.setZoom(scale);
        canvas.absolutePan({ x: 0, y: 0 });
        updateZoomLevel();
    }

    function updateZoomLevel() {
        zoomLevel.textContent = `Zoom: ${Math.round(canvas.getZoom() * 100)}%`;
        // Adjust stroke width of all objects based on zoom
        const strokeWidth = 2 / canvas.getZoom();
        canvas.getObjects('rect').forEach(obj => obj.set('strokeWidth', strokeWidth));
    }

    function getNextClassId() {
        const existingClasses = new Set(canvas.getObjects('rect').map(obj => obj.classId));
        let nextId = 0;
        while (existingClasses.has(String(nextId))) {
            nextId++;
        }
        return String(nextId);
    }

    function updateLabelFilters() {
        const classIds = [...new Set(canvas.getObjects('rect').map(obj => obj.classId))];
        labelFilterContainer.innerHTML = '';
        classIds.sort().forEach(id => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm btn-outline-secondary me-1 mb-1';
            btn.textContent = `Class ${id}`;
            btn.dataset.classId = id;
            labelFilterContainer.appendChild(btn);
        });
    }

    // --- UI Utilities ---
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0 show`;
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    function initResize(e, panel, direction) {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = panel.offsetWidth;

        function doDrag(e) {
            let newWidth;
            if (direction === 'x') {
                newWidth = startWidth + (e.clientX - startX);
            } else { // x-reverse
                newWidth = startWidth - (e.clientX - startX);
            }
            if (newWidth > 100) { // Minimum panel width
                panel.style.width = `${newWidth}px`;
                resizeCanvas();
            }
        }

        function stopDrag() {
            document.documentElement.removeEventListener('mousemove', doDrag, false);
            document.documentElement.removeEventListener('mouseup', stopDrag, false);
        }

        document.documentElement.addEventListener('mousemove', doDrag, false);
        document.documentElement.addEventListener('mouseup', stopDrag, false);
    }

    // --- Start the App ---
    initialize();
});
