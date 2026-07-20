import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const { createWindowCloseController } = require("../../../electron/window-close-controller.cjs") as {
  createWindowCloseController(
    window: FakeWindow,
    dialog: { showMessageBoxSync: ReturnType<typeof vi.fn> }
  ): { setHasUnsavedChanges(value: boolean): void };
};

class FakeWindow {
  private closeListener: ((event: { preventDefault(): void }) => void) | null = null;
  public destroyed = false;

  on(type: string, listener: (event: { preventDefault(): void }) => void): void {
    if (type === "close") {
      this.closeListener = listener;
    }
  }

  close(): void {
    let prevented = false;
    this.closeListener?.({ preventDefault: () => { prevented = true; } });
    if (!prevented) {
      this.destroyed = true;
    }
  }
}

describe("Electron window close controller", () => {
  it("closes immediately when there are no unsaved changes", () => {
    const window = new FakeWindow();
    const dialog = { showMessageBoxSync: vi.fn() };
    createWindowCloseController(window, dialog);

    window.close();

    expect(window.destroyed).toBe(true);
    expect(dialog.showMessageBoxSync).not.toHaveBeenCalled();
  });

  it("keeps the window open when discarding unsaved changes is cancelled", () => {
    const window = new FakeWindow();
    const dialog = { showMessageBoxSync: vi.fn(() => 0) };
    const controller = createWindowCloseController(window, dialog);
    controller.setHasUnsavedChanges(true);

    window.close();

    expect(window.destroyed).toBe(false);
    expect(dialog.showMessageBoxSync).toHaveBeenCalledOnce();
  });

  it("closes after the user confirms discarding unsaved changes", () => {
    const window = new FakeWindow();
    const dialog = { showMessageBoxSync: vi.fn(() => 1) };
    const controller = createWindowCloseController(window, dialog);
    controller.setHasUnsavedChanges(true);

    window.close();

    expect(window.destroyed).toBe(true);
    expect(dialog.showMessageBoxSync).toHaveBeenCalledOnce();
  });
});
