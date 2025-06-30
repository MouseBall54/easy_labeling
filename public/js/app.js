document.addEventListener('DOMContentLoaded', () => {
    // Check for File System Access API support
    if (!('showDirectoryPicker' in window)) {
        alert('Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge.');
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
    const saveLabelsBtn = document.getElementById('saveLabelsBtn');
    const drawModeBtn = document.getElementById('drawMode');
    const editModeBtn = document.getElementById('editMode');
    const labelList = document.getElementById('label-list');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn');

    // --- State Management ---
    let imageFolderHandle = null;
    let labelFolderHandle = null;
    let imageFiles = [];
    let currentImageFile = null;
    let currentImage = null;
    let currentMode = 'draw';

    // --- Folder Selection ---
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
            alert(`Label folder selected: ${labelFolderHandle.name}`);
        } catch (err) {
            console.error('Error selecting label folder:', err);
        }
    });

    async function listImageFiles() {
        if (!imageFolderHandle) return;
        imageFiles = [];
        imageList.innerHTML = '<div class="list-group-item">Loading...</div>';
        for await (const entry of imageFolderHandle.values()) {
            if (entry.kind === 'file' && /\.(jpg|jpeg|png|gif)$/i.test(entry.name)) {
                imageFiles.push(entry);
            }
        }
        imageList.innerHTML = '';
        imageFiles.forEach(file => {
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'list-group-item list-group-item-action';
            a.textContent = file.name;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                loadImageAndLabels(file);
            });
            imageList.appendChild(a);
        });
    }

    // --- Image and Label Loading ---
    async function loadImageAndLabels(imageFile) {
        currentImageFile = imageFile;
        const file = await imageFile.getFile();
        const url = URL.createObjectURL(file);

        canvas.clear();
        fabric.Image.fromURL(url, (img) => {
            currentImage = img;
            canvas.setWidth(img.width);
            canvas.setHeight(img.height);
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            resetZoom();
            loadLabels(imageFile.name);
            URL.revokeObjectURL(url);
        });

        // Highlight selected image
        document.querySelectorAll('#image-list .list-group-item').forEach(item => {
            item.classList.toggle('active', item.textContent === imageFile.name);
        });
    }

    async function loadLabels(imageName) {
        if (!labelFolderHandle) return; // Don't load labels if folder isn't selected
        
        const labelFileName = imageName.replace(/\.[^/.]+$/, "") + ".txt";
        try {
            const labelFileHandle = await labelFolderHandle.getFileHandle(labelFileName);
            const file = await labelFileHandle.getFile();
            const yoloData = await file.text();
            
            if (!yoloData) return;
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
            } else {
                console.error('Error loading labels:', err);
            }
        }
    }

    // --- Save Labels ---
    saveLabelsBtn.addEventListener('click', async () => {
        if (!currentImageFile) {
            alert('Please select an image first.');
            return;
        }
        if (!labelFolderHandle) {
            alert('Please select a label folder first.');
            return;
        }

        const rects = canvas.getObjects('rect');
        const imgWidth = currentImage.width;
        const imgHeight = currentImage.height;
        let yoloString = '';

        rects.forEach(rect => {
            const labelClass = rect.labelClass || '0';
            const x_center = (rect.left + rect.width / 2) / imgWidth;
            const y_center = (rect.top + rect.height / 2) / imgHeight;
            const width = rect.width / imgWidth;
            const height = rect.height / imgHeight;
            yoloString += `${labelClass} ${x_center.toFixed(6)} ${y_center.toFixed(6)} ${width.toFixed(6)} ${height.toFixed(6)}\n`;
        });

        const labelFileName = currentImageFile.name.replace(/\.[^/.]+$/, "") + ".txt";
        try {
            const fileHandle = await labelFolderHandle.getFileHandle(labelFileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(yoloString.trim());
            await writable.close();
            alert(`Labels saved to ${labelFileName} in ${labelFolderHandle.name}`);
        } catch (err) {
            console.error('Error saving labels:', err);
            alert('Failed to save labels. Check console for details.');
        }
    });

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
        }
        currentRect = null;
    });

    // --- Label List Management ---
    function updateLabelList() {
        labelList.innerHTML = '';
        const rects = canvas.getObjects('rect');
        rects.forEach((rect, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            const color = getColorForClass(rect.labelClass);
            li.innerHTML = `<span><span class="badge me-2" style="background-color: ${color};"> </span>Label ${index + 1} (Class: ${rect.labelClass})</span><div><button class="btn btn-sm btn-outline-primary edit-btn py-0 px-1" data-index="${index}"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger delete-btn py-0 px-1" data-index="${index}"><i class="bi bi-trash"></i></button></div>`;
            li.addEventListener('click', (e) => {
                if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) return;
                document.querySelectorAll('#label-list li').forEach(item => item.classList.remove('active'));
                li.classList.add('active');
                canvas.setActiveObject(rects[index]).renderAll();
            });
            labelList.appendChild(li);
        });
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
                }
            });
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index, 10);
                canvas.remove(rects[index]);
                updateLabelList();
            });
        });
    }

    // --- Mode, Edit, Zoom, Pan Logic (unchanged) ---
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
        if (currentMode !== 'edit') return;
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') copy();
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') paste();
        if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
    });
    function copy() { canvas.getActiveObject()?.clone(cloned => _clipboard = cloned); }
    function paste() {
        if (!_clipboard) return;
        _clipboard.clone(clonedObj => {
            canvas.discardActiveObject();
            clonedObj.set({ left: clonedObj.left + 10, top: clonedObj.top + 10, evented: true });
            if (clonedObj.type === 'activeSelection') {
                clonedObj.canvas = canvas;
                clonedObj.forEachObject(obj => canvas.add(obj));
            } else {
                canvas.add(clonedObj);
            }
            canvas.setActiveObject(clonedObj).requestRenderAll();
            updateLabelList();
        });
    }
    function deleteSelected() {
        canvas.getActiveObjects().forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject().renderAll();
        updateLabelList();
    }

    canvas.on('mouse:wheel', opt => {
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.1) zoom = 0.1;
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
    });
    canvas.on('mouse:down', opt => {
        if (opt.e.altKey) {
            canvas.isDragging = true;
            canvas.selection = false;
            canvas.lastPosX = opt.e.clientX;
            canvas.lastPosY = opt.e.clientY;
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
    }
    function resetZoom() { canvas.setViewportTransform([1, 0, 0, 1, 0, 0]); }

    // --- Initial Setup ---
    setMode(currentMode);
});