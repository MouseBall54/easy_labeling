document.addEventListener('DOMContentLoaded', () => {
    const canvas = new fabric.Canvas('canvas', {
        width: 800,
        height: 600,
        backgroundColor: '#eee'
    });

    const imageLoader = document.getElementById('imageLoader');
    const exportYoloBtn = document.getElementById('exportYolo');
    const drawModeBtn = document.getElementById('drawMode');
    const editModeBtn = document.getElementById('editMode');
    const yoloLoader = document.getElementById('yoloLoader');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn');

    let isDrawing = false;
    let startPoint = null;
    let currentRect = null;
    let currentImage = null;

    // --- Mode Management ---
    let currentMode = 'draw'; // 'draw' or 'edit'

    drawModeBtn.addEventListener('change', () => setMode('draw'));
    editModeBtn.addEventListener('change', () => setMode('edit'));

    function setMode(mode) {
        currentMode = mode;
        if (mode === 'draw') {
            canvas.selection = false;
            canvas.defaultCursor = 'crosshair';
            canvas.getObjects('rect').forEach(obj => obj.set('selectable', false));
        } else { // edit mode
            canvas.selection = true;
            canvas.defaultCursor = 'default';
            canvas.getObjects('rect').forEach(obj => obj.set('selectable', true));
        }
        canvas.renderAll();
    }
    
    // --- Image Loading ---
    imageLoader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        fabric.Image.fromURL(URL.createObjectURL(file), (img) => {
            currentImage = img;
            // Resize canvas to fit image
            canvas.setWidth(img.width);
            canvas.setHeight(img.height);
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                scaleX: 1,
                scaleY: 1,
            });
            // Clear existing labels
            canvas.getObjects('rect').forEach(obj => canvas.remove(obj));
            updateLabelList();
            resetZoom();
        });
    });

    // --- Zoom & Pan Logic ---
    canvas.on('mouse:wheel', function(opt) {
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.1) zoom = 0.1;
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
    });

    canvas.on('mouse:down', function(opt) {
        const evt = opt.e;
        if (evt.altKey === true) {
            this.isDragging = true;
            this.selection = false;
            this.lastPosX = evt.clientX;
            this.lastPosY = evt.clientY;
        }
    });
    
    canvas.on('mouse:move', function(opt) {
        if (this.isDragging) {
            const e = opt.e;
            const vpt = this.viewportTransform;
            vpt[4] += e.clientX - this.lastPosX;
            vpt[5] += e.clientY - this.lastPosY;
            this.requestRenderAll();
            this.lastPosX = e.clientX;
            this.lastPosY = e.clientY;
        }
    });

    canvas.on('mouse:up', function(opt) {
        this.setViewportTransform(this.viewportTransform);
        this.isDragging = false;
        this.selection = true;
    });

    zoomInBtn.addEventListener('click', () => zoom(1.2));
    zoomOutBtn.addEventListener('click', () => zoom(0.8));
    resetZoomBtn.addEventListener('click', () => resetZoom());

    function zoom(factor) {
        const center = canvas.getCenter();
        canvas.zoomToPoint(new fabric.Point(center.left, center.top), canvas.getZoom() * factor);
    }

    function resetZoom() {
        const center = canvas.getCenter();
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        canvas.zoomToPoint(new fabric.Point(center.left, center.top), 1);
    }

    // --- Drawing Logic ---
    canvas.on('mouse:down', (o) => {
        if (currentMode !== 'draw' || !currentImage) return;
        
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
            selectable: false, // Not selectable in draw mode
        });
        canvas.add(currentRect);
    });

    canvas.on('mouse:move', (o) => {
        if (!isDrawing || !currentRect) return;

        const pointer = canvas.getPointer(o.e);
        let width = pointer.x - startPoint.x;
        let height = pointer.y - startPoint.y;

        // Handle drawing in any direction
        if (width < 0) {
            currentRect.set('left', pointer.x);
        }
        if (height < 0) {
            currentRect.set('top', pointer.y);
        }
        
        currentRect.set({
            width: Math.abs(width),
            height: Math.abs(height)
        });
        canvas.renderAll();
    });

    canvas.on('mouse:up', () => {
        if (!isDrawing) return;
        isDrawing = false;

        // Prevent tiny boxes
        if (currentRect.width < 5 && currentRect.height < 5) {
            canvas.remove(currentRect);
        } else {
            // Assign a default class '0' for now
            currentRect.set('labelClass', '0'); 
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
            li.className = 'list-group-item';
            li.textContent = `Label ${index + 1} (Class: ${rect.labelClass})`;
            li.dataset.index = index;
            
            li.addEventListener('click', () => {
                // Highlight the item in the list
                document.querySelectorAll('#label-list li').forEach(item => item.classList.remove('active'));
                li.classList.add('active');
                
                // Highlight the corresponding rect on canvas
                canvas.setActiveObject(rects[index]);
                canvas.renderAll();
            });

            labelList.appendChild(li);
        });
    }

    // --- Edit Mode Logic (Copy, Paste, Delete) ---
    let _clipboard = null;

    function copy() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.clone((cloned) => {
                _clipboard = cloned;
            });
        }
    }

    function paste() {
        if (!_clipboard) return;

        _clipboard.clone((clonedObj) => {
            canvas.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + 10,
                top: clonedObj.top + 10,
                evented: true,
            });
            if (clonedObj.type === 'activeSelection') {
                // active selection needs a reference to the canvas.
                clonedObj.canvas = canvas;
                clonedObj.forEachObject((obj) => {
                    canvas.add(obj);
                });
                clonedObj.setCoords();
            } else {
                canvas.add(clonedObj);
            }
            _clipboard.top += 10;
            _clipboard.left += 10;
            canvas.setActiveObject(clonedObj);
            canvas.requestRenderAll();
            updateLabelList();
        });
    }

    function deleteSelected() {
        const activeObjects = canvas.getActiveObjects();
        canvas.discardActiveObject();
        if (activeObjects.length) {
            activeObjects.forEach((object) => {
                canvas.remove(object);
            });
        }
        canvas.renderAll();
        updateLabelList();
    }

    window.addEventListener('keydown', (e) => {
        if (currentMode !== 'edit') return;

        // Ctrl+C or Cmd+C
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            copy();
        }
        // Ctrl+V or Cmd+V
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            paste();
        }
        // Delete or Backspace
        if (e.key === 'Delete' || e.key === 'Backspace') {
            deleteSelected();
        }
    });

    // --- YOLO Export ---
    exportYoloBtn.addEventListener('click', () => {
        if (!currentImage) {
            alert('Please load an image first.');
            return;
        }

        const rects = canvas.getObjects('rect');
        if (rects.length === 0) {
            alert('No labels to export.');
            return;
        }

        const imgWidth = currentImage.width;
        const imgHeight = currentImage.height;
        let yoloString = '';

        rects.forEach(rect => {
            const labelClass = rect.labelClass || '0'; // Default to '0' if not set

            // YOLO format: <object-class> <x_center> <y_center> <width> <height>
            const x_center = (rect.left + rect.width / 2) / imgWidth;
            const y_center = (rect.top + rect.height / 2) / imgHeight;
            const width = rect.width / imgWidth;
            const height = rect.height / imgHeight;

            yoloString += `${labelClass} ${x_center.toFixed(6)} ${y_center.toFixed(6)} ${width.toFixed(6)} ${height.toFixed(6)}
`;
        });

        // Create a blob and download it
        const blob = new Blob([yoloString], { type: 'text/plain' });
        const anchor = document.createElement('a');
        anchor.download = 'labels.txt';
        anchor.href = URL.createObjectURL(blob);
        anchor.click();
        URL.revokeObjectURL(anchor.href);
    });

    // --- YOLO Import ---
    yoloLoader.addEventListener('change', (e) => {
        if (!currentImage) {
            alert('Please load an image before loading YOLO data.');
            return;
        }

        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const yoloData = event.target.result;
            const lines = yoloData.split('\n').filter(line => line.trim() !== '');
            
            const imgWidth = currentImage.width;
            const imgHeight = currentImage.height;

            lines.forEach(line => {
                const [labelClass, x_center, y_center, width, height] = line.split(' ').map(Number);

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
                    labelClass: String(labelClass)
                });
                canvas.add(rect);
            });
            updateLabelList();
            canvas.renderAll();
        };
        reader.readAsText(file);
    });
    
    // Initial setup
    setMode(currentMode);
});