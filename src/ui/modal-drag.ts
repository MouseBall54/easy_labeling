export function installModalDragging(documentRef: Document): void {
  const windowRef = documentRef.defaultView;
  if (!windowRef) return;

  documentRef.querySelectorAll<HTMLElement>(".modal").forEach((modal) => {
    const header = modal.querySelector<HTMLElement>(".modal-header");
    const content = modal.querySelector<HTMLElement>(".modal-content");
    if (!header || !content || header.dataset.modalDrag === "installed") return;
    header.dataset.modalDrag = "installed";
    let x = 0;
    let y = 0;
    let drag: { pointerId: number; mouseX: number; mouseY: number; x: number; y: number } | null = null;

    const move = (nextX: number, nextY: number): void => {
      const bounds = header.getBoundingClientRect();
      const left = bounds.left - x;
      const top = bounds.top - y;
      // Keep a usable header handle visible even when a large dialog moves aside.
      const visibleWidth = Math.min(96, bounds.width);
      x = Math.max(8 - left - bounds.width + visibleWidth, Math.min(nextX, windowRef.innerWidth - 8 - left - visibleWidth));
      y = Math.max(8 - top, Math.min(nextY, windowRef.innerHeight - 8 - top - bounds.height));
      content.style.translate = `${x}px ${y}px`;
    };

    const stop = (): void => {
      const pointerId = drag?.pointerId;
      drag = null;
      header.classList.remove("is-dragging");
      if (pointerId !== undefined && header.hasPointerCapture(pointerId)) header.releasePointerCapture(pointerId);
    };

    header.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !event.isPrimary || drag) return;
      const target = event.target as Element;
      if (target.closest('button, a, input, select, textarea, label, [role="button"], [contenteditable="true"]')) return;
      event.preventDefault();
      drag = { pointerId: event.pointerId, mouseX: event.clientX, mouseY: event.clientY, x, y };
      header.setPointerCapture(event.pointerId);
      header.classList.add("is-dragging");
    });
    header.addEventListener("pointermove", (event) => {
      if (drag?.pointerId !== event.pointerId) return;
      move(drag.x + event.clientX - drag.mouseX, drag.y + event.clientY - drag.mouseY);
    });
    header.addEventListener("pointerup", stop);
    header.addEventListener("pointercancel", stop);
    header.addEventListener("lostpointercapture", stop);
    modal.addEventListener("hidden.bs.modal", () => {
      stop();
      x = 0;
      y = 0;
      content.style.translate = "";
    });
    windowRef.addEventListener("resize", () => {
      if (modal.classList.contains("show")) move(x, y);
    });
  });
}
