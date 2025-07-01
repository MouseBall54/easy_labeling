"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tiff_js_1 = __importDefault(require("tiff.js"));
const fabric_1 = require("fabric");
function toFabricPoint(point) {
    return new fabric_1.fabric.Point(point.x, point.y);
}
// =================================================================================
// Utility Functions
// =================================================================================
function showToast(message, duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer)
        return;
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
// =================================================================================
// Application State
// =================================================================================
class AppState {
    constructor() {
        this.imageFolderHandle = null;
        this.labelFolderHandle = null;
        this.imageFiles = [];
        this.currentImageFile = null;
        this.currentImage = null;
        this.currentMode = 'draw';
        this.isAutoSaveEnabled = false;
        this.saveTimeout = null;
        this.currentLoadToken = 0;
        this._clipboard = null;
    }
}
class UIManager {
    constructor(state, canvasController, fileSystem) {
        this.dragSrcEl = null;
        this.state = state;
        this.canvasController = canvasController;
        this.fileSystem = fileSystem;
        this.elements = this.getDOMElements();
        this.setupSplitters();
    }
    getDOMElements() {
        return {
            selectImageFolderBtn: document.getElementById('selectImageFolderBtn'),
            selectLabelFolderBtn: document.getElementById('selectLabelFolderBtn'),
            imageList: document.getElementById('image-list'),
            imageSearchInput: document.getElementById('imageSearchInput'),
            saveLabelsBtn: document.getElementById('saveLabelsBtn'),
            autoSaveToggle: document.getElementById('autoSaveToggle'),
            drawModeBtn: document.getElementById('drawMode'),
            editModeBtn: document.getElementById('editMode'),
            labelList: document.getElementById('label-list'),
            labelFilters: document.getElementById('label-filters'),
            zoomInBtn: document.getElementById('zoomInBtn'),
            zoomOutBtn: document.getElementById('zoomOutBtn'),
            resetZoomBtn: document.getElementById('resetZoomBtn'),
            canvasContainer: document.querySelector('.canvas-container'),
            zoomLevelDisplay: document.getElementById('zoom-level'),
            mouseCoordsDisplay: document.getElementById('mouse-coords'),
            coordXInput: document.getElementById('coordX'),
            coordYInput: document.getElementById('coordY'),
            goToCoordsBtn: document.getElementById('goToCoordsBtn'),
            currentImageNameSpan: document.getElementById('current-image-name'),
            leftPanel: document.getElementById('left-panel'),
            rightPanel: document.getElementById('right-panel'),
            leftSplitter: document.getElementById('left-splitter'),
            rightSplitter: document.getElementById('right-splitter'),
        };
    }
    renderImageList() {
        const searchTerm = this.elements.imageSearchInput.value.toLowerCase();
        this.elements.imageList.innerHTML = '';
        this.state.imageFiles
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
            .filter(file => file.name.toLowerCase().includes(searchTerm))
            .forEach(file => {
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'list-group-item list-group-item-action';
            a.textContent = file.name;
            if (this.state.currentImageFile && file.name === this.state.currentImageFile.name) {
                a.classList.add('active');
            }
            a.addEventListener('click', (e) => {
                e.preventDefault();
                this.fileSystem.loadImageAndLabels(file);
            });
            this.elements.imageList.appendChild(a);
        });
    }
    updateLabelList() {
        this.elements.labelList.innerHTML = '';
        const rects = this.canvasController.getObjects('rect');
        // Calculate average area and identify issue boxes
        if (rects.length > 0) {
            const totalArea = rects.reduce((sum, rect) => sum + (rect.getScaledWidth() * rect.getScaledHeight()), 0);
            const averageArea = totalArea / rects.length;
            const threshold = averageArea * 0.5;
            rects.forEach(rect => {
                const area = rect.getScaledWidth() * rect.getScaledHeight();
                rect.isIssue = area < threshold;
            });
        }
        this.updateLabelFilters(rects);
        this.canvasController.highlightIssueBoxes();
        rects.forEach((rect, index) => {
            const li = document.createElement('li');
            li.id = `label-item-${index}`;
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.draggable = true;
            li.dataset.index = String(index);
            const color = getColorForClass(rect.labelClass);
            const issueIcon = rect.isIssue ? '<i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>' : '';
            li.innerHTML = `<span>${issueIcon}<i class="bi bi-grip-vertical me-2"></i><span class="badge me-2" style="background-color: ${color};"> </span>Class: ${rect.labelClass}</span><div><button class="btn btn-sm btn-outline-primary edit-btn py-0 px-1" data-index="${index}"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger delete-btn py-0 px-1" data-index="${index}"><i class="bi bi-trash"></i></button></div>`;
            li.addEventListener('click', (e) => {
                if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn'))
                    return;
                this.canvasController.canvas.setActiveObject(rects[index]).renderAll();
            });
            li.addEventListener('dragstart', this.handleDragStart.bind(this));
            li.addEventListener('dragover', this.handleDragOver.bind(this));
            li.addEventListener('drop', this.handleDrop.bind(this));
            li.addEventListener('dragend', this.handleDragEnd.bind(this));
            this.elements.labelList.appendChild(li);
        });
        this.addEditDeleteListeners(rects);
        // After list is built, re-apply the current filter state without triggering new clicks
        const activeClassFilters = new Set();
        this.elements.labelFilters.querySelectorAll('.btn[data-label-class].active').forEach(btn => {
            activeClassFilters.add(btn.dataset.labelClass);
        });
        const issueFilterActive = this.elements.labelFilters.querySelector('.btn-warning.active');
        rects.forEach((rect, index) => {
            let isVisible = true;
            if (issueFilterActive) {
                isVisible = rect.isIssue;
            }
            else if (activeClassFilters.size > 0) {
                isVisible = activeClassFilters.has(rect.labelClass);
            }
            const listItem = document.getElementById(`label-item-${index}`);
            if (listItem) {
                listItem.style.display = isVisible ? '' : 'none';
            }
        });
    }
    updateLabelFilters(rects) {
        this.elements.labelFilters.innerHTML = '';
        const uniqueClasses = [...new Set(rects.map(r => r.labelClass))].sort((a, b) => Number(a) - Number(b));
        const hasIssues = rects.some(r => r.isIssue);
        const applyFilters = () => {
            const activeClassFilters = new Set();
            this.elements.labelFilters.querySelectorAll('.btn[data-label-class].active').forEach(btn => {
                activeClassFilters.add(btn.dataset.labelClass);
            });
            const issueFilterActive = this.elements.labelFilters.querySelector('.btn-warning.active');
            rects.forEach((rect, index) => {
                let isVisible = true;
                if (issueFilterActive) {
                    isVisible = rect.isIssue;
                }
                else if (activeClassFilters.size > 0) {
                    isVisible = activeClassFilters.has(rect.labelClass);
                }
                rect.set('visible', isVisible);
                const listItem = document.getElementById(`label-item-${index}`);
                if (listItem) {
                    listItem.style.display = isVisible ? '' : 'none';
                }
            });
            this.canvasController.renderAll();
        };
        if (hasIssues) {
            const issueBtn = document.createElement('button');
            issueBtn.className = 'btn btn-sm btn-warning me-1 mb-1';
            issueBtn.textContent = 'Issue Labels';
            issueBtn.addEventListener('click', () => {
                const isActivating = !issueBtn.classList.contains('active');
                // Deactivate all other filters when activating issue filter
                if (isActivating) {
                    this.elements.labelFilters.querySelectorAll('.btn.active').forEach(b => b.classList.remove('active'));
                }
                issueBtn.classList.toggle('active', isActivating);
                applyFilters();
            });
            this.elements.labelFilters.appendChild(issueBtn);
        }
        if (uniqueClasses.length > 1) {
            const allBtn = document.createElement('button');
            allBtn.className = 'btn btn-sm btn-primary me-1 mb-1';
            allBtn.textContent = 'All';
            allBtn.addEventListener('click', () => {
                const allActive = !this.elements.labelFilters.querySelector('.btn[data-label-class]:not(.active)');
                this.elements.labelFilters.querySelectorAll('.btn[data-label-class]').forEach(btn => btn.classList.toggle('active', !allActive));
                if (this.elements.labelFilters.querySelector('.btn-warning')) {
                    this.elements.labelFilters.querySelector('.btn-warning').classList.remove('active');
                }
                applyFilters();
            });
            this.elements.labelFilters.appendChild(allBtn);
        }
        uniqueClasses.forEach(labelClass => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm btn-outline-secondary me-1 mb-1 active';
            btn.textContent = `Class ${labelClass}`;
            btn.dataset.labelClass = labelClass;
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                if (this.elements.labelFilters.querySelector('.btn-warning')) {
                    this.elements.labelFilters.querySelector('.btn-warning').classList.remove('active');
                }
                applyFilters();
            });
            this.elements.labelFilters.appendChild(btn);
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
                };
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        };
        setup(this.elements.leftSplitter, this.elements.leftPanel, 'left');
        setup(this.elements.rightSplitter, this.elements.rightPanel, 'right');
    }
    updateZoomDisplay() {
        const zoom = this.canvasController.canvas.getZoom() * 100;
        this.elements.zoomLevelDisplay.textContent = `Zoom: ${zoom.toFixed(0)}%`;
    }
    updateMouseCoords(x, y) {
        this.elements.mouseCoordsDisplay.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
        this.elements.mouseCoordsDisplay.style.display = 'block';
    }
    hideMouseCoords() {
        this.elements.mouseCoordsDisplay.style.display = 'none';
    }
    updateImageInfo(fileName) {
        this.elements.currentImageNameSpan.textContent = fileName;
    }
    setActiveImageListItem(imageFile) {
        this.elements.imageList.querySelectorAll('.list-group-item').forEach(item => {
            const isActive = item.textContent === imageFile.name;
            item.classList.toggle('active', isActive);
            if (isActive) {
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }
    // Drag and Drop for label list
    handleDragStart(e) {
        e.target.style.opacity = '0.4';
        this.dragSrcEl = e.target;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
    }
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    handleDrop(e) {
        e.stopPropagation();
        if (this.dragSrcEl && this.dragSrcEl !== e.target) {
            const srcIndex = parseInt(this.dragSrcEl.dataset.index, 10);
            const destIndex = parseInt(e.target.closest('li').dataset.index, 10);
            this.canvasController.reorderObject(srcIndex, destIndex);
            this.updateLabelList();
        }
    }
    handleDragEnd(e) {
        e.target.style.opacity = '1';
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
    selectImageFolder() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.state.imageFolderHandle = yield window.showDirectoryPicker();
                yield this.listImageFiles();
            }
            catch (err) {
                console.error('Error selecting image folder:', err);
            }
        });
    }
    selectLabelFolder() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.state.labelFolderHandle = yield window.showDirectoryPicker();
                showToast(`Label folder selected: ${this.state.labelFolderHandle.name}`);
            }
            catch (err) {
                console.error('Error selecting label folder:', err);
            }
        });
    }
    listImageFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            if (!this.state.imageFolderHandle)
                return;
            this.state.imageFiles = [];
            this.uiManager.elements.imageList.innerHTML = '<div class="list-group-item">Loading...</div>';
            try {
                for (var _d = true, _e = __asyncValues(this.state.imageFolderHandle.values()), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const entry = _c;
                    if (entry.kind === 'file' && /\.(jpg|jpeg|png|gif|tif|tiff)$/i.test(entry.name)) {
                        this.state.imageFiles.push(entry);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.uiManager.renderImageList();
        });
    }
    loadImageAndLabels(imageFileHandle) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state.isAutoSaveEnabled && this.state.currentImageFile) {
                yield this.saveLabels(true);
            }
            // Cancel any pending auto-save before loading a new image
            if (this.state.saveTimeout)
                clearTimeout(this.state.saveTimeout);
            this.state.currentLoadToken++;
            const loadToken = this.state.currentLoadToken;
            this.state.currentImageFile = imageFileHandle;
            this.uiManager.updateImageInfo(imageFileHandle.name);
            const file = yield imageFileHandle.getFile();
            const setBackgroundImage = (img) => {
                if (loadToken !== this.state.currentLoadToken)
                    return;
                this.state.currentImage = img;
                this.canvasController.clear();
                this.uiManager.elements.labelList.innerHTML = '';
                this.uiManager.elements.labelFilters.innerHTML = '';
                this.canvasController.setBackgroundImage(img);
                this.canvasController.resetZoom();
                // Only try to load labels if it's part of a folder selection
                this.loadLabels(imageFileHandle.name, loadToken);
            };
            if (/\.(tif|tiff)$/i.test(file.name)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (loadToken !== this.state.currentLoadToken)
                        return;
                    const tiff = new tiff_js_1.default({ buffer: e.target.result });
                    const tiffCanvas = tiff.toCanvas();
                    fabric_1.fabric.Image.fromURL(tiffCanvas.toDataURL(), setBackgroundImage);
                };
                reader.readAsArrayBuffer(file);
            }
            else {
                const url = URL.createObjectURL(file);
                fabric_1.fabric.Image.fromURL(url, (img) => {
                    setBackgroundImage(img);
                    URL.revokeObjectURL(url);
                });
            }
            this.uiManager.setActiveImageListItem(imageFileHandle);
        });
    }
    loadLabels(imageName, loadToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.state.labelFolderHandle)
                return;
            const labelFileName = imageName.replace(/\.[^/.]+$/, "") + ".txt";
            try {
                const labelFileHandle = yield this.state.labelFolderHandle.getFileHandle(labelFileName);
                const file = yield labelFileHandle.getFile();
                const yoloData = yield file.text();
                if (loadToken !== this.state.currentLoadToken)
                    return;
                if (yoloData) {
                    this.canvasController.addLabelsFromYolo(yoloData);
                }
                this.uiManager.updateLabelList();
            }
            catch (err) {
                if (err.name === 'NotFoundError') {
                    console.log(`No label file found for ${imageName}.`);
                    if (loadToken === this.state.currentLoadToken)
                        this.uiManager.updateLabelList();
                }
                else {
                    console.error('Error loading labels:', err);
                }
            }
        });
    }
    saveLabels() {
        return __awaiter(this, arguments, void 0, function* (isAuto = false) {
            if (!this.state.currentImageFile) {
                if (!isAuto)
                    showToast('Please select an image first.');
                return;
            }
            if (!this.state.labelFolderHandle) {
                if (!isAuto)
                    showToast('Please select a label folder first.');
                return;
            }
            // If there's an active selection, discard it to commit transformations
            if (this.canvasController.canvas.getActiveObject()) {
                this.canvasController.canvas.discardActiveObject();
                this.canvasController.renderAll();
            }
            const yoloString = this.canvasController.getLabelsAsYolo();
            const labelFileName = this.state.currentImageFile.name.replace(/\.[^/.]+$/, "") + ".txt";
            try {
                const fileHandle = yield this.state.labelFolderHandle.getFileHandle(labelFileName, { create: true });
                const writable = yield fileHandle.createWritable();
                yield writable.write(yoloString.trim());
                yield writable.close();
                if (!isAuto) {
                    showToast(`Labels saved to ${labelFileName}`);
                }
            }
            catch (err) {
                console.error('Error saving labels:', err);
                if (!isAuto) {
                    showToast('Failed to save labels. Check console for details.');
                }
            }
        });
    }
}
class CanvasController {
    constructor(state, uiManager, fileSystem) {
        this.uiManager = null;
        this.fileSystem = null;
        this.isDrawing = false;
        this.startPoint = null;
        this.currentRect = null;
        this.activeLabelText = null;
        this.state = state;
        this.uiManager = uiManager;
        this.fileSystem = fileSystem;
        this.canvas = new fabric_1.fabric.Canvas('canvas', {
            width: 800,
            height: 600,
            backgroundColor: '#eee',
        });
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
        this.canvas.selection = mode === 'edit';
        this.canvas.defaultCursor = mode === 'draw' ? 'crosshair' : 'default';
        this.getObjects('rect').forEach(obj => obj.set('selectable', mode === 'edit'));
        this.renderAll();
    }
    addLabelsFromYolo(yoloData) {
        const lines = yoloData.split('\n').filter(line => line.trim() !== '');
        const imgWidth = this.state.currentImage.width;
        const imgHeight = this.state.currentImage.height;
        lines.forEach(line => {
            const [labelClass, x_center, y_center, width, height] = line.split(' ').map(val => val.trim());
            if (labelClass === undefined)
                return;
            const rectWidth = parseFloat(width) * imgWidth;
            const rectHeight = parseFloat(height) * imgHeight;
            const rectLeft = (parseFloat(x_center) * imgWidth) - (rectWidth / 2);
            const rectTop = (parseFloat(y_center) * imgHeight) - (rectHeight / 2);
            const color = getColorForClass(labelClass);
            const rect = new fabric_1.fabric.Rect({
                left: rectLeft, top: rectTop, width: rectWidth, height: rectHeight,
                fill: `${color}33`, stroke: color, strokeWidth: 2,
                selectable: this.state.currentMode === 'edit',
            });
            rect.labelClass = String(labelClass);
            rect.originalYolo = { x_center, y_center, width, height };
            this.canvas.add(rect);
        });
    }
    getLabelsAsYolo() {
        const rects = this.getObjects('rect');
        const imgWidth = this.state.currentImage.width;
        const imgHeight = this.state.currentImage.height;
        let yoloString = '';
        rects.forEach(rect => {
            const labelClass = rect.labelClass || '0';
            if (rect.originalYolo) {
                const { x_center, y_center, width, height } = rect.originalYolo;
                yoloString += `${labelClass} ${x_center} ${y_center} ${width} ${height}\n`;
            }
            else {
                rect.setCoords();
                const center = rect.getCenterPoint();
                const width = rect.getScaledWidth();
                const height = rect.getScaledHeight();
                const x_center = center.x / imgWidth;
                const y_center = center.y / imgHeight;
                const normWidth = width / imgWidth;
                const normHeight = height / imgHeight;
                yoloString += `${labelClass} ${x_center.toFixed(15)} ${y_center.toFixed(15)} ${normWidth.toFixed(15)} ${normHeight.toFixed(15)}\n`;
            }
        });
        return yoloString;
    }
    highlightIssueBoxes() {
        const rects = this.getObjects('rect');
        rects.forEach(rect => {
            if (rect.isIssue) {
                rect.set({
                    stroke: '#FFA500', // Bright Orange
                    strokeWidth: 3
                });
            }
            else {
                // Revert to normal style based on class
                const color = getColorForClass(rect.labelClass);
                rect.set({
                    stroke: color,
                    strokeWidth: 2
                });
            }
        });
        this.renderAll();
    }
    // Drawing
    startDrawing(pointer) {
        if (this.state.currentMode !== 'draw' || !this.state.currentImage)
            return;
        this.isDrawing = true;
        this.startPoint = pointer;
        this.currentRect = new fabric_1.fabric.Rect({
            left: this.startPoint.x, top: this.startPoint.y, width: 0, height: 0,
            fill: 'rgba(255, 0, 0, 0.2)', stroke: 'red', strokeWidth: 2, selectable: false,
        });
        this.canvas.add(this.currentRect);
    }
    continueDrawing(pointer) {
        if (!this.isDrawing)
            return;
        let width = pointer.x - this.startPoint.x;
        let height = pointer.y - this.startPoint.y;
        this.currentRect.set({
            left: width > 0 ? this.startPoint.x : pointer.x,
            top: height > 0 ? this.startPoint.y : pointer.y,
            width: Math.abs(width), height: Math.abs(height)
        });
        this.renderAll();
    }
    finishDrawing() {
        if (!this.isDrawing)
            return;
        this.isDrawing = false;
        if (this.currentRect.width < 5 && this.currentRect.height < 5) {
            this.canvas.remove(this.currentRect);
        }
        else {
            const newLabel = prompt('Enter label class for the new box:', '0');
            const finalLabel = (newLabel !== null && newLabel.trim() !== '') ? newLabel.trim() : '0';
            this.currentRect.labelClass = finalLabel;
            const color = getColorForClass(finalLabel);
            this.currentRect.set({ fill: `${color}33`, stroke: color });
            this.uiManager.updateLabelList();
        }
        this.currentRect = null;
    }
    // Object Manipulation
    removeObject(obj) {
        this.canvas.remove(obj);
    }
    reorderObject(srcIndex, destIndex) {
        const rects = this.getObjects('rect');
        const movedRect = rects.splice(srcIndex, 1)[0];
        rects.splice(destIndex, 0, movedRect);
        rects.forEach(rect => this.canvas.remove(rect));
        rects.forEach(rect => this.canvas.add(rect));
    }
    editLabel(rect) {
        const newLabel = prompt('Enter new label class:', rect.labelClass || '0');
        if (newLabel !== null && newLabel.trim() !== '') {
            const finalLabel = newLabel.trim();
            rect.labelClass = finalLabel;
            const color = getColorForClass(finalLabel);
            rect.set({ fill: `${color}33`, stroke: color });
            rect.originalYolo = null; // Mark as modified
            this.uiManager.updateLabelList();
            this.renderAll();
        }
    }
    // Zoom and Pan
    zoom(factor, point) {
        const center = point ? toFabricPoint(point) : this.canvas.getCenter();
        this.canvas.zoomToPoint(center, this.canvas.getZoom() * factor);
        this.uiManager.updateZoomDisplay();
    }
    resetZoom() {
        if (!this.state.currentImage)
            return;
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
        const highlightCircle = new fabric_1.fabric.Circle({
            left: x, top: y, radius: 0, fill: 'transparent', stroke: 'yellow',
            strokeWidth: 3, originX: 'center', originY: 'center',
            selectable: false, evented: false,
        });
        this.canvas.add(highlightCircle);
        highlightCircle.animate('radius', 50 / zoom, {
            onChange: this.renderAll.bind(this),
            duration: 500,
            easing: fabric_1.fabric.util.ease.easeOutQuad,
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
    updateSelectionLabel(e) {
        this.clearSelectionLabel();
        this.uiManager.elements.labelList.querySelectorAll('li').forEach(item => item.classList.remove('active'));
        if (!e.selected || e.selected.length !== 1)
            return;
        const activeObject = e.selected[0];
        if (activeObject && activeObject.type === 'rect' && activeObject.labelClass) {
            const zoom = this.canvas.getZoom();
            this.activeLabelText = new fabric_1.fabric.Text('Class: ' + activeObject.labelClass, {
                left: activeObject.left, top: activeObject.top - 20 / zoom,
                fontSize: 16 / zoom, fill: 'black', backgroundColor: 'rgba(255, 255, 255, 0.7)',
                padding: 2 / zoom, selectable: false, evented: false,
            });
            this.canvas.add(this.activeLabelText);
            const objectIndex = this.getObjects('rect').indexOf(activeObject);
            if (objectIndex > -1) {
                const listItem = document.getElementById(`label-item-${objectIndex}`);
                if (listItem) {
                    listItem.classList.add('active');
                    listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        }
    }
    clearSelectionLabel() {
        if (this.activeLabelText) {
            this.canvas.remove(this.activeLabelText);
            this.activeLabelText = null;
        }
        this.uiManager.elements.labelList.querySelectorAll('li').forEach(item => item.classList.remove('active'));
    }
}
// =================================================================================
// Event Manager
// =================================================================================
class EventManager {
    constructor(state, ui, fileSystem, canvas) {
        this.state = state;
        this.ui = ui;
        this.fileSystem = fileSystem;
        this.canvas = canvas;
    }
    bindEventListeners() {
        // UI Buttons
        this.ui.elements.selectImageFolderBtn.addEventListener('click', () => this.fileSystem.selectImageFolder());
        this.ui.elements.selectLabelFolderBtn.addEventListener('click', () => this.fileSystem.selectLabelFolder());
        this.ui.elements.saveLabelsBtn.addEventListener('click', () => this.fileSystem.saveLabels(false));
        this.ui.elements.imageSearchInput.addEventListener('input', () => this.ui.renderImageList());
        this.ui.elements.autoSaveToggle.addEventListener('change', (e) => {
            this.state.isAutoSaveEnabled = e.target.checked;
            showToast(`Auto Save ${this.state.isAutoSaveEnabled ? 'Enabled' : 'Disabled'}`);
        });
        this.ui.elements.drawModeBtn.addEventListener('change', () => this.canvas.setMode('draw'));
        this.ui.elements.editModeBtn.addEventListener('change', () => this.canvas.setMode('edit'));
        this.ui.elements.zoomInBtn.addEventListener('click', () => this.canvas.zoom(1.2));
        this.ui.elements.zoomOutBtn.addEventListener('click', () => this.canvas.zoom(0.8));
        this.ui.elements.resetZoomBtn.addEventListener('click', () => this.canvas.resetZoom());
        this.ui.elements.goToCoordsBtn.addEventListener('click', () => {
            const x = parseInt(this.ui.elements.coordXInput.value, 10);
            const y = parseInt(this.ui.elements.coordYInput.value, 10);
            this.canvas.goToCoords(x, y);
        });
        // Canvas Events
        this.canvas.canvas.on('mouse:down', this.handleMouseDown.bind(this));
        this.canvas.canvas.on('mouse:move', this.handleMouseMove.bind(this));
        this.canvas.canvas.on('mouse:up', this.handleMouseUp.bind(this));
        this.canvas.canvas.on('mouse:wheel', this.handleMouseWheel.bind(this));
        this.canvas.canvas.on('mouse:out', () => this.ui.hideMouseCoords());
        const markAsModified = (e) => {
            if (!e.target)
                return;
            const target = e.target;
            if (target.type === 'activeSelection') {
                target.getObjects().forEach(obj => obj.originalYolo = null);
            }
            else {
                target.originalYolo = null;
            }
        };
        this.canvas.canvas.on('object:modified', markAsModified);
        this.canvas.canvas.on('object:scaled', markAsModified);
        this.canvas.canvas.on('selection:created', (e) => this.canvas.updateSelectionLabel(e));
        this.canvas.canvas.on('selection:updated', (e) => this.canvas.updateSelectionLabel(e));
        this.canvas.canvas.on('selection:cleared', () => this.canvas.clearSelectionLabel());
        // Keyboard Events
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    handleMouseDown(opt) {
        const evt = opt.e;
        if (evt.altKey || evt.ctrlKey) {
            this.canvas.canvas.isDragging = true;
            this.canvas.canvas.selection = false;
            this.canvas.canvas.lastPosX = evt.clientX;
            this.canvas.canvas.lastPosY = evt.clientY;
        }
        else {
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
        }
        else {
            this.canvas.continueDrawing(this.canvas.canvas.getPointer(opt.e));
        }
        if (this.state.currentImage) {
            const pointer = this.canvas.canvas.getPointer(opt.e);
            if (pointer.x >= 0 && pointer.x <= this.state.currentImage.width && pointer.y >= 0 && pointer.y <= this.state.currentImage.height) {
                this.ui.updateMouseCoords(pointer.x, pointer.y);
            }
            else {
                this.ui.hideMouseCoords();
            }
        }
    }
    handleMouseUp() {
        if (this.canvas.canvas.isDragging) {
            this.canvas.canvas.setViewportTransform(this.canvas.canvas.viewportTransform);
            this.canvas.canvas.isDragging = false;
            this.canvas.canvas.selection = true;
        }
        else {
            this.canvas.finishDrawing();
        }
    }
    handleMouseWheel(opt) {
        const delta = opt.e.deltaY;
        let zoom = this.canvas.canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20)
            zoom = 20;
        if (zoom < 0.1)
            zoom = 0.1;
        this.canvas.canvas.zoomToPoint(toFabricPoint({ x: opt.e.offsetX, y: opt.e.offsetY }), zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
        this.ui.updateZoomDisplay();
    }
    handleKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
            return;
        if (this.state.currentMode === 'edit') {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'c')
                    this.copy();
                if (e.key === 'v')
                    this.paste();
                if (e.key === 'b')
                    this.changeSelectedClasses();
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                this.deleteSelected();
            }
        }
        if (e.key.toLowerCase() === 'd')
            this.navigateImage(1);
        if (e.key.toLowerCase() === 'a')
            this.navigateImage(-1);
    }
    copy() {
        const activeObject = this.canvas.canvas.getActiveObject();
        if (!activeObject)
            return;
        activeObject.clone((cloned) => { this.state._clipboard = cloned; }, ['labelClass', 'originalYolo']);
    }
    paste() {
        if (!this.state._clipboard)
            return;
        this.state._clipboard.clone((cloned) => {
            this.canvas.canvas.discardActiveObject();
            const newObjects = [];
            const pasteObject = (obj) => {
                const newObj = fabric_1.fabric.util.object.clone(obj);
                newObj.set({ left: newObj.left + 10, top: newObj.top + 10, evented: true });
                const color = getColorForClass(newObj.labelClass);
                newObj.set({ fill: `${color}33`, stroke: color });
                newObj.originalYolo = null; // Pasted objects are new
                this.canvas.canvas.add(newObj);
                return newObj;
            };
            if (cloned.type === 'activeSelection') {
                cloned.forEachObject(obj => newObjects.push(pasteObject(obj)));
            }
            else {
                newObjects.push(pasteObject(cloned));
            }
            const sel = new fabric_1.fabric.ActiveSelection(newObjects, { canvas: this.canvas.canvas });
            this.canvas.canvas.setActiveObject(sel).requestRenderAll();
            this.ui.updateLabelList();
        }, ['labelClass', 'originalYolo']);
    }
    deleteSelected() {
        this.canvas.canvas.getActiveObjects().forEach(obj => this.canvas.removeObject(obj));
        this.canvas.canvas.discardActiveObject().renderAll();
        this.ui.updateLabelList();
    }
    changeSelectedClasses() {
        const activeSelection = this.canvas.canvas.getActiveObject();
        if (!activeSelection) {
            showToast('Please select one or more objects.');
            return;
        }
        const newLabel = prompt(`Enter new class for selected object(s):`, activeSelection.labelClass || '0');
        if (newLabel === null || newLabel.trim() === '')
            return;
        const finalLabel = newLabel.trim();
        const color = getColorForClass(finalLabel);
        const applyChanges = (obj) => {
            const customObj = obj;
            customObj.labelClass = finalLabel;
            customObj.set({ fill: `${color}33`, stroke: color });
            customObj.originalYolo = null; // Mark as modified
        };
        if (activeSelection.type === 'activeSelection') {
            activeSelection.forEachObject(applyChanges);
        }
        else {
            applyChanges(activeSelection);
        }
        this.canvas.renderAll();
        this.ui.updateLabelList();
    }
    navigateImage(direction) {
        if (this.state.imageFiles.length === 0)
            return;
        const currentIndex = this.state.imageFiles.findIndex(f => { var _a; return f.name === ((_a = this.state.currentImageFile) === null || _a === void 0 ? void 0 : _a.name); });
        if (currentIndex === -1 && this.state.imageFiles.length > 0) {
            this.fileSystem.loadImageAndLabels(this.state.imageFiles[0]);
            return;
        }
        let nextIndex = currentIndex + direction;
        if (nextIndex >= this.state.imageFiles.length)
            nextIndex = 0;
        else if (nextIndex < 0)
            nextIndex = this.state.imageFiles.length - 1;
        this.fileSystem.loadImageAndLabels(this.state.imageFiles[nextIndex]);
    }
}
// =================================================================================
// Main App Initialization
// =================================================================================
class App {
    constructor() {
        if (!('showDirectoryPicker' in window)) {
            showToast('Your browser is not supported. Please use Chrome or Edge.', 10000);
            // Stop execution if the API is not supported
            this.state = new AppState();
            this.canvasController = new CanvasController(this.state, null, null);
            this.uiManager = new UIManager(this.state, this.canvasController, null);
            this.fileSystem = new FileSystem(this.state, this.uiManager, this.canvasController);
            this.eventManager = new EventManager(this.state, this.uiManager, this.fileSystem, this.canvasController);
            return;
        }
        this.state = new AppState();
        this.canvasController = new CanvasController(this.state, null, null);
        this.fileSystem = new FileSystem(this.state, null, this.canvasController);
        this.uiManager = new UIManager(this.state, this.canvasController, this.fileSystem);
        // Inject dependencies
        this.canvasController.uiManager = this.uiManager;
        this.canvasController.fileSystem = this.fileSystem;
        this.fileSystem.uiManager = this.uiManager;
        this.eventManager = new EventManager(this.state, this.uiManager, this.fileSystem, this.canvasController);
        this.init();
    }
    init() {
        this.eventManager.bindEventListeners();
        this.canvasController.setMode(this.state.currentMode);
    }
}
document.addEventListener('DOMContentLoaded', () => new App());
