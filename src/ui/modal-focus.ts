const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(",");

function getFocusableElements(modal: HTMLElement): HTMLElement[] {
  return [...modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter((element) => {
    const style = modal.ownerDocument.defaultView?.getComputedStyle(element);
    return !element.hidden && style?.display !== "none" && style?.visibility !== "hidden" && element.getClientRects().length > 0;
  });
}

export function installModalFocusManagement(documentRef: Document, modalIds: string[]): void {
  modalIds.forEach((modalId) => {
    const modal = documentRef.getElementById(modalId);
    if (!modal || modal.dataset.focusManagement === "installed") {
      return;
    }

    modal.dataset.focusManagement = "installed";
    let trigger: HTMLElement | null = null;

    modal.addEventListener("show.bs.modal", () => {
      const activeElement = documentRef.activeElement;
      const configuredTrigger = modal.dataset.focusReturn
        ? documentRef.getElementById(modal.dataset.focusReturn)
        : null;
      trigger = activeElement instanceof HTMLElement && activeElement !== documentRef.body && !modal.contains(activeElement)
        ? activeElement
        : configuredTrigger;
    });

    modal.addEventListener("shown.bs.modal", () => {
      const focusable = getFocusableElements(modal);
      (focusable[0] ?? modal).focus();
    });

    modal.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(modal);
      if (focusable.length === 0) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = documentRef.activeElement;
      if (event.shiftKey && (activeElement === first || !modal.contains(activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeElement === last || !modal.contains(activeElement))) {
        event.preventDefault();
        first.focus();
      }
    });

    modal.addEventListener("hidden.bs.modal", () => {
      if (trigger?.isConnected) {
        trigger.focus();
      }
      trigger = null;
    });
  });
}
