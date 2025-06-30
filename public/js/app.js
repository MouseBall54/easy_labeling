document.addEventListener('DOMContentLoaded', () => {
    const canvas = new fabric.Canvas('canvas', {
        width: 800,
        height: 600,
        backgroundColor: '#eee'
    });

    const imageList = document.getElementById('image-list');
    const saveLabelsBtn = document.getElementById('saveLabelsBtn');
    const drawModeBtn = document.getElementById('drawMode');
    const editModeBtn = document.getElementById('editMode');
    const labelList = document.getElementById('label-list');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn');

    let isDrawing = false;
    let startPoint = null;
    let currentRect = null;
    let currentImage = null;
    let currentImageName = null;

    // --- Color Palette for Classes ---
    const colorPalette = [
        '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', 
        '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
        '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
        '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080',
        '#ffffff', '#000000', '#1f77b4', '#ff7f0e', '#2ca02c',
        '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'
    ];

    function getColorForClass(labelClass) {
        const classNumber = parseInt(labelClass, 10);
        if (isNaN(classNumber) || classNumber < 0) {
            return '#000000'; // Default color for invalid classes
        }
        return colorPalette[classNumber % colorPalette.length];
    }

    // --- Mode Management ---
    let currentMode = 'draw';
    drawModeBtn.addEventListener('change', () => setMode('draw'));
    editModeBtn.addEventListener('change', () => setMode('edit'));

    function setMode(mode) {
        currentMode = mode;
        canvas.selection = mode === 'edit';
        canvas.defaultCursor = mode === 'draw' ? 'crosshair' : 'default';
        canvas.getObjects('rect').forEach(obj => obj.set('selectable', mode === 'edit'));
        canvas.renderAll();
    }

    // --- Image and Label Loading from Server ---
    async function loadImageAndLabels(imageName) {
        currentImageName = imageName;
        const imagePath = `/data/${imageName}`;

        // Clear canvas
        canvas.clear();
        
        // Load image
        fabric.Image.fromURL(imagePath, (img) => {
            currentImage = img;
            canvas.setWidth(img.width);
            canvas.setHeight(img.height);
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            resetZoom();
            
            // Load labels
            loadLabels(imageName);
        });

        // Highlight selected image in the list
        document.querySelectorAll('#image-list .list-group-item').forEach(item => {
            if (item.dataset.imageName === imageName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    async function loadLabels(imageName) {
        try {
            const response = await fetch(`/api/labels/${imageName}`);
            const yoloData = await response.text();
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
                    left: rectLeft,
                    top: rectTop,
                    width: rectWidth,
                    height: rectHeight,
                    fill: `${color}33`, // Semi-transparent fill
                    stroke: color,
                    strokeWidth: 2,
                    selectable: currentMode === 'edit',
                    labelClass: String(labelClass)
                });
                canvas.add(rect);
            });
            updateLabelList();
        } catch (error) {
            console.error('Error loading labels:', error);
        }
    }

    // --- Initial Image List Loading ---
    async function fetchImageList() {
        try {
            const response = await fetch('/api/images');
            const images = await response.json();
            imageList.innerHTML = '';
            images.forEach(imageName => {
                const a = document.createElement('a');
                a.href = '#';
                a.className = 'list-group-item list-group-item-action';
                a.textContent = imageName;
                a.dataset.imageName = imageName;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadImageAndLabels(imageName);
                });
                imageList.appendChild(a);
            });
        } catch (error) {
            console.error('Error fetching image list:', error);
            imageList.innerHTML = '<div class="list-group-item">Failed to load images. Is the server running?</div>';
        }
    }

    // --- Drawing Logic ---
    canvas.on('mouse:down', (o) => {
        if (o.e.altKey || currentMode !== 'draw' || !currentImage) return;
        isDrawing = true;
        startPoint = canvas.getPointer(o.e);
        currentRect = new fabric.Rect({
            left: startPoint.x,
            top: startPoint.y,
            width: 0,
            height: 0,
            fill: 'rgba(255, 0, 0, 0.2)',
            stroke: 'red',
            strokeWidth: 2,
            selectable: false,
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
            width: Math.abs(width),
            height: Math.abs(height)
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
            currentRect.set({
                fill: `${color}33`,
                stroke: color
            });

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
            li.innerHTML = `
                <span>
                    <span class="badge me-2" style="background-color: ${color};">&nbsp;</span>
                    Label ${index + 1} (Class: ${rect.labelClass})
                </span>
                <div>
                    <button class="btn btn-sm btn-outline-primary edit-btn py-0 px-1" data-index="${index}"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-btn py-0 px-1" data-index="${index}"><i class="bi bi-trash"></i></button>
                </div>
            `;

            li.addEventListener('click', (e) => {
                if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) return;
                
                document.querySelectorAll('#label-list li').forEach(item => item.classList.remove('active'));
                li.classList.add('active');
                canvas.setActiveObject(rects[index]);
                canvas.renderAll();
            });

            labelList.appendChild(li);
        });

        // Add event listeners for edit/delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index, 10);
                const rect = rects[index];
                const newLabel = prompt('Enter new label class:', rect.labelClass || '0');
                if (newLabel !== null && newLabel.trim() !== '') {
                    const finalLabel = newLabel.trim();
                    rect.set('labelClass', finalLabel);
                    const color = getColorForClass(finalLabel);
                    rect.set({
                        fill: `${color}33`,
                        stroke: color
                    });
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

    // --- Edit Mode Logic (Copy, Paste, Delete) ---
    let _clipboard = null;
    window.addEventListener('keydown', (e) => {
        if (currentMode !== 'edit') return;
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') copy();
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') paste();
        if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
    });

    function copy() {
        canvas.getActiveObject()?.clone(cloned => _clipboard = cloned);
    }

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

    // --- Zoom & Pan Logic ---
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

    function resetZoom() {
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    }

    // --- Save Labels to Server ---
    saveLabelsBtn.addEventListener('click', async () => {
        if (!currentImageName) {
            alert('Please select an image first.');
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

        try {
            const response = await fetch(`/api/labels/${currentImageName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ labels: yoloString.trim() })
            });
            if (response.ok) {
                alert('Labels saved successfully!');
            } else {
                alert('Failed to save labels.');
            }
        } catch (error) {
            console.error('Error saving labels:', error);
            alert('Error saving labels.');
        }
    });

    // --- Initial Setup ---
    setMode(currentMode);
    fetchImageList();
});