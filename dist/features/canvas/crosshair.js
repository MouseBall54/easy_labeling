export function createCrosshairLines(fabric, canvas, state) {
    const lineOptions = {
        stroke: "rgba(200, 200, 200, 0.8)",
        strokeWidth: 1,
        selectable: false,
        evented: false,
        excludeFromExport: true
    };
    state.crosshairX = new fabric.Line([0, 0, 0, 0], lineOptions);
    state.crosshairY = new fabric.Line([0, 0, 0, 0], lineOptions);
    canvas.add(state.crosshairX, state.crosshairY);
}
export function toggleCrosshair(fabric, canvas, state, visible) {
    state.isCrosshairVisible = visible;
    if (visible && !state.crosshairX) {
        createCrosshairLines(fabric, canvas, state);
    }
    if (!state.crosshairX || !state.crosshairY) {
        return;
    }
    state.crosshairX.set("visible", visible);
    state.crosshairY.set("visible", visible);
    canvas.renderAll();
}
export function updateCrosshair(canvas, state, pointer) {
    if (!state.isCrosshairVisible || !state.crosshairX || !state.crosshairY) {
        return;
    }
    const vpt = canvas.viewportTransform;
    if (!vpt || vpt.length < 6) {
        return;
    }
    const zoom = canvas.getZoom();
    const viewportWidth = canvas.width / zoom;
    const viewportHeight = canvas.height / zoom;
    const viewportLeft = -vpt[4] / zoom;
    const viewportTop = -vpt[5] / zoom;
    state.crosshairX.set({
        x1: viewportLeft,
        y1: pointer.y,
        x2: viewportLeft + viewportWidth,
        y2: pointer.y,
        visible: true
    });
    state.crosshairY.set({
        x1: pointer.x,
        y1: viewportTop,
        x2: pointer.x,
        y2: viewportTop + viewportHeight,
        visible: true
    });
    canvas.renderAll();
}
export function hideCrosshair(canvas, state) {
    if (!state.crosshairX || !state.crosshairY) {
        return;
    }
    state.crosshairX.set("visible", false);
    state.crosshairY.set("visible", false);
    canvas.renderAll();
}
