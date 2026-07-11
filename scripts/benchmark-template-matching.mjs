import { performance } from "node:perf_hooks";
import { chromium } from "playwright";

const baseUrl = process.env.EASY_LABELING_URL ?? "http://127.0.0.1:4173/index.html";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

await page.addInitScript(() => {
  class MockFileHandle {
    kind = "file";

    constructor(name, content) {
      this.name = name;
      this.content = content;
    }

    async getFile() {
      const type = this.name.endsWith(".png") ? "image/png" : "text/plain";
      return new File([this.content], this.name, { type });
    }

    async createWritable() {
      return {
        write: async (data) => {
          this.content = data;
        },
        close: async () => {}
      };
    }
  }

  class MockDirectoryHandle {
    kind = "directory";
    entries = new Map();

    constructor(name) {
      this.name = name;
    }

    async *values() {
      for (const entry of this.entries.values()) {
        yield entry;
      }
    }

    async getDirectoryHandle(name, options) {
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

    async getFileHandle(name, options) {
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

  const createScene = async (index) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 384;
    const context = canvas.getContext("2d");
    context.fillStyle = "#e9edf2";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += 32) {
      for (let x = 0; x < canvas.width; x += 32) {
        context.fillStyle = (x / 32 + y / 32) % 2 === 0 ? "#d8dee6" : "#f5f7fa";
        context.fillRect(x, y, 32, 32);
      }
    }
    const offsetX = index * 3;
    const offsetY = index * 2;
    context.fillStyle = "#171a1f";
    context.fillRect(64 + offsetX, 42 + offsetY, 13, 58);
    context.fillRect(42 + offsetX, 64 + offsetY, 58, 13);
    context.fillStyle = "#dc3545";
    context.fillRect(78 + offsetX, 78 + offsetY, 11, 11);
    context.fillStyle = "#0d6efd";
    context.beginPath();
    context.arc(55 + offsetX, 52 + offsetY, 7, 0, Math.PI * 2);
    context.fill();
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PNG encode failed")), "image/png");
    });
    return blob.arrayBuffer();
  };

  const imageFolder = new MockDirectoryHandle("benchmark-images");
  const labelFolder = new MockDirectoryHandle("label");
  imageFolder.entries.set("label", labelFolder);
  labelFolder.entries.set("scene-00.txt", new MockFileHandle("scene-00.txt", [
    "0 0.41015625 0.546875 0.078125 0.104166666666667",
    "1 0.56640625 0.546875 0.078125 0.104166666666667"
  ].join("\n")));

  Object.defineProperty(window, "showDirectoryPicker", {
    configurable: true,
    value: async () => {
      if (!imageFolder.entries.has("scene-00.png")) {
        for (let index = 0; index < 10; index += 1) {
          const name = `scene-${String(index).padStart(2, "0")}.png`;
          imageFolder.entries.set(name, new MockFileHandle(name, await createScene(index)));
        }
      }
      return imageFolder;
    }
  });
});

async function measure(name, action) {
  const started = performance.now();
  await action();
  return { name, milliseconds: Number((performance.now() - started).toFixed(2)) };
}

try {
  const measurements = [];
  await page.goto(baseUrl);
  await page.locator("#selectImageFolderBtn").click();
  await page.waitForFunction(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi");
    return api?.getRectCount?.() === 2;
  });

  const layoutName = page.locator("#layoutNameInput");
  if (!(await layoutName.isVisible())) {
    await page.locator("#openLayoutSetupBtn").click();
  }
  await layoutName.fill("Benchmark layout");
  await page.locator("#layoutCaptureScopeSelect").selectOption("all");
  await page.locator("#saveBoxLayoutBtn").click();
  await page.waitForFunction(() => document.querySelectorAll("#boxLayoutSelect option").length === 2);
  const layoutModalClose = page.locator("#layoutSetupModal .modal-footer [data-bs-dismiss=modal]");
  if (await layoutModalClose.isVisible()) {
    await layoutModalClose.click();
  }

  measurements.push(await measure("opencv-warmup", async () => {
    await page.locator("#openTemplateMatchingBtn").click();
    await page.waitForFunction(() => document.querySelector("#templateMatchTimings")?.textContent?.includes("initialized"));
  }));
  await page.locator("#templateNameInput").fill("Benchmark preset");
  await page.locator("#templateMinimumScoreInput").fill("0.50");
  await page.locator("#templateExistingPolicySelect").selectOption("append");
  const templateCanvas = page.locator("#templateMatchingCanvas");
  const bounds = await templateCanvas.boundingBox();
  if (!bounds) {
    throw new Error("Template canvas is unavailable");
  }
  await page.mouse.move(bounds.x + 38, bounds.y + 28);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 116, bounds.y + 112, { steps: 6 });
  await page.mouse.up();
  await page.locator("#saveAutomationPresetBtn").click();
  await page.waitForFunction(() => document.querySelectorAll("#automationPresetSelect option").length === 2);

  measurements.push(await measure("first-match", async () => {
    await page.locator("#testTemplateMatchBtn").click();
    await page.waitForFunction(() => document.querySelector("#templateMatchScore")?.textContent !== "Not tested");
  }));
  await page.locator("#templateMatchScore").evaluate((element) => {
    element.textContent = "Not tested";
  });
  measurements.push(await measure("warm-match", async () => {
    await page.locator("#testTemplateMatchBtn").click();
    await page.waitForFunction(() => document.querySelector("#templateMatchScore")?.textContent !== "Not tested");
  }));

  await page.locator("#templateMatchingModal .modal-footer [data-bs-dismiss=modal]").click();
  measurements.push(await measure("batch-10-images", async () => {
    await page.locator("#runAutomationBatchBtn").click();
    await page.waitForFunction(() => document.querySelector("#automationBatchCounts")?.textContent?.trim() === "10 / 10");
  }));

  console.log(JSON.stringify({
    url: baseUrl,
    imageSize: "512x384",
    templateSize: "approximately 78x84",
    measurements,
    pageErrors
  }, null, 2));
} finally {
  await browser.close();
}
