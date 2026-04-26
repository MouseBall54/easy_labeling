import { expect, test, type Page } from "@playwright/test";

type MockFileInit = string | ArrayBuffer;

interface RectGeometrySnapshot {
  annotationId: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

interface AlignmentHistorySnapshot {
  geometries: RectGeometrySnapshot[];
  selectedRectIds: string[];
  activeSelectionBounds: {
    left: number;
    top: number;
    width: number;
    height: number;
  } | null;
  canUndo: boolean;
  canRedo: boolean;
  rectCount: number;
  labelRowCount: number;
}

async function readSnapshot(page: Page): Promise<AlignmentHistorySnapshot> {
  return page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as
      | {
          getRectGeometries?: () => RectGeometrySnapshot[];
          getSelectedRectIds?: () => string[];
          getActiveSelectionBounds?: () => {
            left: number;
            top: number;
            width: number;
            height: number;
          } | null;
          canUndo?: () => boolean;
          canRedo?: () => boolean;
          getRectCount?: () => number;
          getVisibleLabelRowCount?: () => number;
        }
      | undefined;

    return {
      geometries: api?.getRectGeometries?.() ?? [],
      selectedRectIds: api?.getSelectedRectIds?.() ?? [],
      activeSelectionBounds: api?.getActiveSelectionBounds?.() ?? null,
      canUndo: api?.canUndo?.() ?? false,
      canRedo: api?.canRedo?.() ?? false,
      rectCount: api?.getRectCount?.() ?? -1,
      labelRowCount: api?.getVisibleLabelRowCount?.() ?? -1
    };
  });
}

test("arrange/history: align-left, undo/redo, distribute, delete, undo-delete", async ({ page }) => {
  await page.addInitScript(() => {
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8AARQMBgN6f3QAAAABJRU5ErkJggg==";
    const pngBinary = atob(pngBase64);
    const pngBuffer = new ArrayBuffer(pngBinary.length);
    const pngBytes = new Uint8Array(pngBuffer);
    for (let index = 0; index < pngBinary.length; index += 1) {
      pngBytes[index] = pngBinary.charCodeAt(index);
    }

    class MockFileHandle {
      kind = "file";
      name: string;
      content: MockFileInit;

      constructor(name: string, content: MockFileInit) {
        this.name = name;
        this.content = content;
      }

      async getFile() {
        const type = this.name.endsWith(".png") ? "image/png" : "text/plain";
        return new File([this.content], this.name, { type });
      }

      async createWritable() {
        return {
          write: async (data: string) => {
            this.content = data;
          },
          close: async () => {}
        };
      }
    }

    class MockDirectoryHandle {
      kind = "directory";
      name: string;
      entries: Map<string, MockDirectoryHandle | MockFileHandle>;

      constructor(name: string) {
        this.name = name;
        this.entries = new Map();
      }

      setEntry(name: string, entry: MockDirectoryHandle | MockFileHandle) {
        this.entries.set(name, entry);
      }

      async *values() {
        for (const entry of this.entries.values()) {
          yield entry;
        }
      }

      async getDirectoryHandle(name: string, options?: { create?: boolean }) {
        const existing = this.entries.get(name);
        if (existing instanceof MockDirectoryHandle) {
          return existing;
        }
        if (options?.create) {
          const created = new MockDirectoryHandle(name);
          this.entries.set(name, created);
          return created;
        }
        throw new DOMException("Directory not found", "NotFoundError");
      }

      async getFileHandle(name: string, options?: { create?: boolean }) {
        const existing = this.entries.get(name);
        if (existing instanceof MockFileHandle) {
          return existing;
        }
        if (options?.create) {
          const created = new MockFileHandle(name, "");
          this.entries.set(name, created);
          return created;
        }
        throw new DOMException("File not found", "NotFoundError");
      }
    }

    const imageFolder = new MockDirectoryHandle("images");
    imageFolder.setEntry("scene-a.png", new MockFileHandle("scene-a.png", pngBuffer));
    const labelFolder = new MockDirectoryHandle("label");
    labelFolder.setEntry(
      "scene-a.txt",
      new MockFileHandle(
        "scene-a.txt",
        [
          "0 0.15 0.20 0.10 0.10",
          "1 0.50 0.45 0.10 0.10",
          "2 0.75 0.70 0.40 0.10"
        ].join("\n")
      )
    );
    imageFolder.setEntry("label", labelFolder);

    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      writable: true,
      value: async () => imageFolder
    });
  });

  await page.goto("/index.html");
  await page.locator("#selectImageFolderBtn").click();

  await expect.poll(async () => (await readSnapshot(page)).rectCount).toBe(3);
  await expect.poll(async () => (await readSnapshot(page)).labelRowCount).toBe(3);
  await expect(page.locator('[data-ui="history-undo"]')).toBeDisabled();
  await expect(page.locator('[data-ui="history-redo"]')).toBeDisabled();
  await expect(page.locator('[data-ui="arrange-align-left"]')).toBeDisabled();
  await expect(page.locator('[data-ui="arrange-align-right"]')).toBeDisabled();
  await expect(page.locator('[data-ui="arrange-align-top"]')).toBeDisabled();
  await expect(page.locator('[data-ui="arrange-align-bottom"]')).toBeDisabled();
  await expect(page.locator('[data-ui="arrange-distribute-horizontal"]')).toBeDisabled();
  await expect(page.locator('[data-ui="arrange-distribute-vertical"]')).toBeDisabled();

  await page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { selectRectsByIndex?: (indices: number[]) => void } | undefined;
    api?.selectRectsByIndex?.([0, 1, 2]);
  });
  await expect.poll(async () => (await readSnapshot(page)).selectedRectIds.length).toBe(3);
  await expect(page.locator('[data-ui="arrange-align-left"]')).toBeEnabled();
  await expect(page.locator('[data-ui="arrange-align-right"]')).toBeEnabled();
  await expect(page.locator('[data-ui="arrange-align-top"]')).toBeEnabled();
  await expect(page.locator('[data-ui="arrange-align-bottom"]')).toBeEnabled();
  await expect(page.locator('[data-ui="arrange-distribute-horizontal"]')).toBeEnabled();
  await expect(page.locator('[data-ui="arrange-distribute-vertical"]')).toBeEnabled();

  const initialSnapshot = await readSnapshot(page);
  expect(initialSnapshot.selectedRectIds).toHaveLength(3);
  const initialSelected = initialSnapshot.selectedRectIds
    .map((annotationId) => initialSnapshot.geometries.find((geometry) => geometry.annotationId === annotationId))
    .filter((geometry): geometry is RectGeometrySnapshot => geometry != null);
  const initialLeftSpan =
    Math.max(...initialSelected.map((geometry) => geometry.left)) - Math.min(...initialSelected.map((geometry) => geometry.left));

  await page.locator('[data-ui="arrange-align-left"]').click();
  await expect.poll(async () => (await readSnapshot(page)).canUndo).toBe(true);
  await expect.poll(async () => (await readSnapshot(page)).canRedo).toBe(false);
  await expect(page.locator('[data-ui="history-undo"]')).toBeEnabled();
  await expect(page.locator('[data-ui="history-redo"]')).toBeDisabled();

  const alignedSnapshot = await readSnapshot(page);
  const alignedById = new Map(alignedSnapshot.geometries.map((geometry) => [geometry.annotationId, geometry]));
  const targetLeft = Math.min(...initialSnapshot.geometries.map((geometry) => geometry.left));
  for (const annotationId of initialSnapshot.selectedRectIds) {
    const aligned = alignedById.get(annotationId);
    expect(aligned).toBeDefined();
    expect(aligned?.left ?? NaN).toBeCloseTo(targetLeft, 4);
  }

  await page.locator('[data-ui="history-undo"]').click();
  await expect.poll(async () => (await readSnapshot(page)).canUndo).toBe(false);
  await expect.poll(async () => (await readSnapshot(page)).canRedo).toBe(true);
  await expect(page.locator('[data-ui="history-undo"]')).toBeDisabled();
  await expect(page.locator('[data-ui="history-redo"]')).toBeEnabled();

  const undoneSnapshot = await readSnapshot(page);
  const undoneSelected = undoneSnapshot.selectedRectIds
    .map((annotationId) => undoneSnapshot.geometries.find((geometry) => geometry.annotationId === annotationId))
    .filter((geometry): geometry is RectGeometrySnapshot => geometry != null);
  expect(undoneSelected).toHaveLength(3);
  const undoneLeftSpan =
    Math.max(...undoneSelected.map((geometry) => geometry.left)) - Math.min(...undoneSelected.map((geometry) => geometry.left));
  expect(undoneLeftSpan).toBeGreaterThan(initialLeftSpan * 0.5);

  await page.locator('[data-ui="history-redo"]').click();
  await expect.poll(async () => (await readSnapshot(page)).canUndo).toBe(true);
  await expect.poll(async () => (await readSnapshot(page)).canRedo).toBe(false);
  await expect(page.locator('[data-ui="history-undo"]')).toBeEnabled();
  await expect(page.locator('[data-ui="history-redo"]')).toBeDisabled();

  const redoneSnapshot = await readSnapshot(page);
  expect(redoneSnapshot.selectedRectIds).toHaveLength(3);
  const redoneSelected = redoneSnapshot.selectedRectIds
    .map((annotationId) => redoneSnapshot.geometries.find((geometry) => geometry.annotationId === annotationId))
    .filter((geometry): geometry is RectGeometrySnapshot => geometry != null);
  const redoneLeftSpan =
    Math.max(...redoneSelected.map((geometry) => geometry.left)) - Math.min(...redoneSelected.map((geometry) => geometry.left));
  expect(redoneLeftSpan).toBeLessThan(0.001);

  await page.locator('[data-ui="history-undo"]').click();
  await expect.poll(async () => (await readSnapshot(page)).canRedo).toBe(true);

  const distributionSourceSnapshot = await readSnapshot(page);
  expect(distributionSourceSnapshot.selectedRectIds).toHaveLength(3);
  const distributionSourceSelected = distributionSourceSnapshot.selectedRectIds
    .map((annotationId) => distributionSourceSnapshot.geometries.find((geometry) => geometry.annotationId === annotationId))
    .filter((geometry): geometry is RectGeometrySnapshot => geometry != null);
  const sourceMinLeft = Math.min(...distributionSourceSelected.map((geometry) => geometry.left));
  const sourceMaxRight = Math.max(...distributionSourceSelected.map((geometry) => geometry.right));

  await page.locator('[data-ui="arrange-distribute-horizontal"]').click();
  const distributedSnapshot = await readSnapshot(page);
  const distributedSelected = distributedSnapshot.selectedRectIds
    .map((annotationId) => distributedSnapshot.geometries.find((geometry) => geometry.annotationId === annotationId))
    .filter((geometry): geometry is RectGeometrySnapshot => geometry != null)
    .sort((left, right) => left.left - right.left);

  expect(distributedSelected).toHaveLength(3);
  const [first, middle, last] = distributedSelected;
  expect(first.left).toBeCloseTo(sourceMinLeft, 4);
  expect(last.right).toBeCloseTo(sourceMaxRight, 4);
  const leftGap = middle.left - first.right;
  const rightGap = last.left - middle.right;
  expect(leftGap).toBeCloseTo(rightGap, 4);
  expect(middle.left).toBeGreaterThan(sourceMinLeft);

  await page.locator("body").click();
  await page.keyboard.press("Delete");
  await expect.poll(async () => (await readSnapshot(page)).rectCount).toBe(0);
  await expect.poll(async () => (await readSnapshot(page)).labelRowCount).toBe(0);
  await expect.poll(async () => (await readSnapshot(page)).canUndo).toBe(true);
  await expect(page.locator('[data-ui="history-undo"]')).toBeEnabled();
  await expect(page.locator('[data-ui="history-redo"]')).toBeDisabled();
  await expect(page.locator('[data-ui="arrange-align-left"]')).toBeDisabled();
  await expect(page.locator('[data-ui="arrange-distribute-horizontal"]')).toBeDisabled();

  await page.locator('[data-ui="history-undo"]').click();
  await expect.poll(async () => (await readSnapshot(page)).rectCount).toBe(3);
  await expect.poll(async () => (await readSnapshot(page)).labelRowCount).toBe(3);
  await expect.poll(async () => (await readSnapshot(page)).canRedo).toBe(true);
  await expect(page.locator('[data-ui="history-redo"]')).toBeEnabled();
  await expect(page.locator('[data-ui="arrange-align-left"]')).toBeEnabled();
  await expect(page.locator('[data-ui="arrange-distribute-horizontal"]')).toBeEnabled();
});

test("arrange/history: class-group selection restores exact geometry after align-left undo", async ({ page }) => {
  await page.addInitScript(() => {
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8AARQMBgN6f3QAAAABJRU5ErkJggg==";
    const pngBinary = atob(pngBase64);
    const pngBuffer = new ArrayBuffer(pngBinary.length);
    const pngBytes = new Uint8Array(pngBuffer);
    for (let index = 0; index < pngBinary.length; index += 1) {
      pngBytes[index] = pngBinary.charCodeAt(index);
    }

    class MockFileHandle {
      kind = "file";
      name: string;
      content: MockFileInit;

      constructor(name: string, content: MockFileInit) {
        this.name = name;
        this.content = content;
      }

      async getFile() {
        const type = this.name.endsWith(".png") ? "image/png" : "text/plain";
        return new File([this.content], this.name, { type });
      }

      async createWritable() {
        return {
          write: async (data: string) => {
            this.content = data;
          },
          close: async () => {}
        };
      }
    }

    class MockDirectoryHandle {
      kind = "directory";
      name: string;
      entries: Map<string, MockDirectoryHandle | MockFileHandle>;

      constructor(name: string) {
        this.name = name;
        this.entries = new Map();
      }

      setEntry(name: string, entry: MockDirectoryHandle | MockFileHandle) {
        this.entries.set(name, entry);
      }

      async *values() {
        for (const entry of this.entries.values()) {
          yield entry;
        }
      }

      async getDirectoryHandle(name: string, options?: { create?: boolean }) {
        const existing = this.entries.get(name);
        if (existing instanceof MockDirectoryHandle) {
          return existing;
        }
        if (options?.create) {
          const created = new MockDirectoryHandle(name);
          this.entries.set(name, created);
          return created;
        }
        throw new DOMException("Directory not found", "NotFoundError");
      }

      async getFileHandle(name: string, options?: { create?: boolean }) {
        const existing = this.entries.get(name);
        if (existing instanceof MockFileHandle) {
          return existing;
        }
        if (options?.create) {
          const created = new MockFileHandle(name, "");
          this.entries.set(name, created);
          return created;
        }
        throw new DOMException("File not found", "NotFoundError");
      }
    }

    const imageFolder = new MockDirectoryHandle("images");
    imageFolder.setEntry("scene-a.png", new MockFileHandle("scene-a.png", pngBuffer));
    const labelFolder = new MockDirectoryHandle("label");
    labelFolder.setEntry(
      "scene-a.txt",
      new MockFileHandle(
        "scene-a.txt",
        [
          "0 0.15 0.20 0.10 0.10",
          "0 0.50 0.45 0.10 0.10",
          "0 0.75 0.70 0.40 0.10"
        ].join("\n")
      )
    );
    imageFolder.setEntry("label", labelFolder);

    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      writable: true,
      value: async () => imageFolder
    });
  });

  await page.goto("/index.html");
  await page.locator("#selectImageFolderBtn").click();

  await expect.poll(async () => (await readSnapshot(page)).rectCount).toBe(3);
  await page.locator('[data-testid="select-group-0"]').click();
  await expect.poll(async () => (await readSnapshot(page)).selectedRectIds.length).toBe(3);

  const before = await readSnapshot(page);
  const beforeById = new Map(before.geometries.map((geometry) => [geometry.annotationId, geometry]));
  expect(before.activeSelectionBounds).not.toBeNull();

  await page.locator('[data-ui="arrange-align-left"]').click();
  await page.locator('[data-ui="history-undo"]').click();

  const afterUndo = await readSnapshot(page);
  expect(afterUndo.selectedRectIds).toEqual(before.selectedRectIds);
  expect(afterUndo.activeSelectionBounds).not.toBeNull();
  expect(afterUndo.activeSelectionBounds?.left ?? NaN).toBeCloseTo(before.activeSelectionBounds?.left ?? NaN, 4);
  expect(afterUndo.activeSelectionBounds?.top ?? NaN).toBeCloseTo(before.activeSelectionBounds?.top ?? NaN, 4);
  expect(afterUndo.activeSelectionBounds?.width ?? NaN).toBeCloseTo(before.activeSelectionBounds?.width ?? NaN, 4);
  expect(afterUndo.activeSelectionBounds?.height ?? NaN).toBeCloseTo(before.activeSelectionBounds?.height ?? NaN, 4);
  for (const annotationId of before.selectedRectIds) {
    const beforeGeometry = beforeById.get(annotationId);
    const afterGeometry = afterUndo.geometries.find((geometry) => geometry.annotationId === annotationId);
    expect(beforeGeometry).toBeDefined();
    expect(afterGeometry).toBeDefined();
    expect(afterGeometry?.left ?? NaN).toBeCloseTo(beforeGeometry?.left ?? NaN, 4);
    expect(afterGeometry?.top ?? NaN).toBeCloseTo(beforeGeometry?.top ?? NaN, 4);
    expect(afterGeometry?.right ?? NaN).toBeCloseTo(beforeGeometry?.right ?? NaN, 4);
    expect(afterGeometry?.bottom ?? NaN).toBeCloseTo(beforeGeometry?.bottom ?? NaN, 4);
  }
});
