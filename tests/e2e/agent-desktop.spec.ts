import { expect, test, type Page } from "@playwright/test";
import { execFileSync, spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { inferenceModel } from "./fixtures/inference-model.js";
import { grayPng } from "./fixtures/review-dataset.js";
import { launchDesktop } from "./fixtures/tauri-app.js";

// Drives the desktop app the way an AI agent does: easy-labeling-mcp.exe over stdio (MCP JSON-RPC), which
// forwards to the app over its named pipe (docs/AGENT_MCP_PLAN_KO.md). Needs `npm run tauri:dev` and
// `cargo build -p el-mcp`.
const root = path.resolve(".");
const exe = process.env.EASY_LABELING_TAURI_EXE ?? path.join(root, "target/debug/Easy Labeling.exe");
const mcpExe = process.env.EASY_LABELING_MCP_EXE ?? path.join(root, "target/debug/easy-labeling-mcp.exe");
test.skip(!existsSync(exe) || !existsSync(mcpExe), `Desktop or MCP executable not built: ${exe}, ${mcpExe}`);

interface ToolResult {
  isError?: boolean;
  structuredContent?: unknown;
  content: Array<{ type: "text"; text: string } | { type: "image"; data: string; mimeType: string }>;
}

/** A minimal MCP client over the server's stdio. */
function startMcp(pipe: string) {
  const child: ChildProcessWithoutNullStreams = spawn(mcpExe, [], { env: { ...process.env, EASY_LABELING_AGENT_PIPE: pipe } });
  const exited = new Promise<number | null>((resolve) => child.on("exit", (code) => resolve(code)));
  const waiting = new Map<number, (message: { result?: unknown; error?: unknown }) => void>();
  let buffer = "";
  let next = 1;
  child.stdout.setEncoding("utf8").on("data", (chunk: string) => {
    buffer += chunk;
    for (let end = buffer.indexOf("\n"); end >= 0; end = buffer.indexOf("\n")) {
      const line = buffer.slice(0, end).trim();
      buffer = buffer.slice(end + 1);
      if (!line) continue;
      const message = JSON.parse(line) as { id?: number; result?: unknown; error?: unknown };
      if (message.id !== undefined) waiting.get(message.id)?.(message);
    }
  });
  const request = (method: string, params: unknown) => new Promise<{ result?: unknown; error?: unknown }>((resolve) => {
    const id = next++;
    waiting.set(id, resolve);
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
  });
  return {
    async initialize() {
      const reply = await request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "e2e", version: "0" } });
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`);
      return reply.result as { serverInfo: { name: string } };
    },
    async tools() {
      return ((await request("tools/list", {})).result as { tools: Array<{ name: string }> }).tools.map((tool) => tool.name).sort();
    },
    async call(name: string, args: Record<string, unknown> = {}) {
      return (await request("tools/call", { name, arguments: args })).result as ToolResult;
    },
    /** Resolves with the exit code once the server process ends. */
    exited,
    close: () => child.kill()
  };
}

const textOf = (result: ToolResult): string => result.content.flatMap((part) => (part.type === "text" ? [part.text] : [])).join("\n");
const json = (result: ToolResult) => {
  expect(result.isError, textOf(result)).toBeFalsy();
  return JSON.parse(textOf(result));
};
const testApi = <T>(page: Page, body: string): Promise<T> => page.evaluate(`(() => { const api = window.__easyLabelingTestApi; return ${body}; })()`) as Promise<T>;

/** Two photos from the bundled sample with their labels. */
async function sampleDataset(dataset: string): Promise<void> {
  for (const name of ["sample_1", "sample_2"]) {
    await copyFile(path.join(root, `assets/sample/${name}.jpg`), path.join(dataset, `${name}.jpg`));
    await copyFile(path.join(root, `assets/sample/label/${name}.txt`), path.join(dataset, `label/${name}.txt`));
  }
}

/** SEM-like gray PNGs (bright blocks at x 13..51, y 10..39 of every 64 x 48 cell) with boxes drawn 4 px too large. */
const SEM_SIZE = { width: 512, height: 384 };
const loose = (column: number, row: number) => ({ x0: column * 64 + 9, y0: row * 48 + 6, x1: column * 64 + 56, y1: row * 48 + 44 });
async function semDataset(dataset: string): Promise<void> {
  const cells = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]];
  const rows = cells.map(([column, row], index) => {
    const box = loose(column, row);
    const { width, height } = SEM_SIZE;
    return `${index < 3 ? 0 : 1} ${(box.x0 + box.x1) / 2 / width} ${(box.y0 + box.y1) / 2 / height} ${(box.x1 - box.x0) / width} ${(box.y1 - box.y0) / height}`;
  }).join("\n");
  for (const name of ["a", "b"]) {
    await writeFile(path.join(dataset, `${name}.png`), grayPng(SEM_SIZE.width, SEM_SIZE.height, name === "a" ? 3 : 4));
    await writeFile(path.join(dataset, `label/${name}.txt`), rows);
  }
}

/** The app on a dataset with its own pipe, and an MCP client for it. */
async function openAgentApp(options: { dataset?: (folder: string) => Promise<void>; approve?: "accept" | "decline" } = {}) {
  const sandbox = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-agent-"));
  const dataset = path.join(sandbox, "데이터셋");
  await mkdir(path.join(dataset, "label"), { recursive: true });
  await (options.dataset ?? sampleDataset)(dataset);
  await copyFile(path.join(root, "assets/sample/label/classes.yaml"), path.join(dataset, "label/classes.yaml"));
  // The desktop app reads class files from the profile's Class Info folder.
  await mkdir(path.join(sandbox, "profiles", "Class Info"), { recursive: true });
  await copyFile(path.join(root, "assets/sample/label/classes.yaml"), path.join(sandbox, "profiles", "Class Info", "classes.yaml"));
  const pipe = `\\\\.\\pipe\\easy-labeling-agent-e2e-${process.pid}-${Date.now()}`;
  const app = await launchDesktop(exe, sandbox, [], { env: { EASY_LABELING_AGENT_PIPE: pipe, EASY_LABELING_TEST_AGENT_APPROVE: options.approve ?? "accept" } });
  const mcp = startMcp(pipe);
  let appClosed = false;
  const errors: string[] = [];
  app.page.on("pageerror", (error) => errors.push(error.message));
  expect((await mcp.initialize()).serverInfo.name).toBe("easy-labeling");
  return {
    page: app.page,
    mcp,
    dataset,
    errors,
    async closeApp() {
      appClosed = true;
      await app.close();
    },
    async close() {
      mcp.close();
      if (!appClosed) await app.close();
      await rm(sandbox, { recursive: true, force: true, maxRetries: 40, retryDelay: 250 });
    }
  };
}

test("MCP reports disk state and protects shared outputs in both workflows", async () => {
  test.setTimeout(180_000);
  const row = "0 0.5 0.5 0.3 0.3";
  const { page, mcp, dataset, close } = await openAgentApp({
    dataset: async (folder) => {
      const png = grayPng(48, 48, 3);
      const masks = path.join(folder, "mask");
      await mkdir(masks);
      await writeFile(path.join(folder, "shared.png"), png);
      await copyFile(path.join(root, "assets/sample/sample_1.jpg"), path.join(folder, "shared.jpg"));
      for (const stem of ["00-empty", "01-unique", "02-error", "03-missing"]) {
        await writeFile(path.join(folder, `${stem}.png`), png);
      }
      await writeFile(path.join(folder, "label", "00-empty.txt"), " \n");
      await writeFile(path.join(folder, "label", "shared.txt"), row);
    }
  });
  try {
    const call = async (name: string, args?: Record<string, unknown>) => json(await mcp.call(name, args));
    const storage = async (names: string[]) => {
      const result = await call("list_images", { storage: true, images: names });
      return Object.fromEntries(result.images.map((image: { name: string; storage: unknown }) => [image.name, image.storage]));
    };
    const label = (stem: string) => path.join(dataset, "label", `${stem}.txt`);
    const mask = (stem: string) => path.join(dataset, "mask", `${stem}.png`);
    const shared = ["shared.jpg", "shared.png"];
    await call("open_folder", { path: dataset });
    await expect.poll(async () => (await call("list_images", { filter: "labeled" })).total).toBe(2);
    const listedPage = await call("list_images", { storage: true, images: shared, filter: "labeled", offset: 1, limit: 1 });
    expect(listedPage).toMatchObject({ total: 2, offset: 1, returned: 1, imageCount: 6, scope: { total: 2 }, images: [
      { name: "shared.png", storage: [{ conflictingImages: shared }, { conflictingImages: shared }] }
    ] });

    // Create invalid outputs after opening so the first canvas and review reads are independent of the test.
    await mkdir(label("02-error"));
    await writeFile(mask("02-error"), Buffer.from("invalid PNG"));
    const names = ["00-empty.png", "01-unique.png", "02-error.png", "03-missing.png", ...shared];
    const initial = await storage(names);
    expect(initial["00-empty.png"][0].files[0]).toMatchObject({ status: "empty", boxCount: 0 });
    expect(initial["01-unique.png"][0].files[0]).toMatchObject({ status: "missing" });
    expect(initial["02-error.png"].map((entry: { files: { status: string }[] }) => entry.files[0].status)).toEqual(["read_error", "read_error"]);
    expect(initial["shared.jpg"][0]).toMatchObject({ labelFolder: path.dirname(label("shared")), paths: [label("shared")], conflictingImages: shared,
      files: [{ status: "present", boxCount: 1 }] });
    expect(initial["shared.jpg"][1]).toMatchObject({ paths: [mask("shared")], conflictingImages: shared });
    await call("go_to_image", { image: "01-unique.png" });
    await call("add_boxes", { boxes: [{ classId: 0, x0: 2, y0: 2, x1: 14, y1: 16 }] });
    expect((await storage(["01-unique.png"]))["01-unique.png"][0]).toMatchObject({ unsavedChanges: true, files: [{ status: "missing" }] });
    const saved = await call("save");
    expect(saved).toMatchObject({ saved: "01-unique.png", image: "01-unique.png", workflow: "detection", success: true, boxCount: 1,
      action: "written", writtenPaths: [label("01-unique")], unsavedChanges: false });
    expect((await storage(["01-unique.png"]))["01-unique.png"][0]).toMatchObject({ unsavedChanges: false,
      files: [{ path: saved.writtenPaths[0], status: "present", boxCount: saved.boxCount }] });
    await call("go_to_image", { image: "shared.png" });
    await page.locator("#autoSaveToggle").check();
    await call("go_to_image", { image: "shared.jpg" });
    expect(await readFile(label("shared"), "utf8")).toBe(row);
    await page.locator("#autoSaveToggle").uncheck();
    await call("go_to_image", { image: "shared.png" });
    const refused = await mcp.call("save");
    expect(refused.isError).toBe(true);
    expect(refused.structuredContent).toMatchObject({ image: "shared.png", workflow: "detection", success: false, paths: [label("shared")], conflictingImages: shared, action: "not_written", writtenPaths: [] });
    expect(await readFile(label("shared"), "utf8")).toBe(row);

    // Seed a mask the app already uses, then confirm both shared names are blocked even with one selected.
    await call("go_to_image", { image: "01-unique.png" });
    await call("set_workflow", { workflow: "segmentation" });
    const shapes = [{ type: "rect", x0: 2, y0: 2, x1: 5, y1: 4 }, { type: "rect", x0: 9, y0: 9, x1: 10, y1: 10 }];
    await call("paint_mask", { classId: 1, shapes });
    const setExport = async (format: string) => {
      await page.locator("#openSegmentationFormatBtn").click({ timeout: 5000 });
      await expect(page.locator("#segmentationFormatModal")).toBeVisible();
      await page.locator("#segmentationAnnotationTypeSelect").selectOption(format === "png-semantic-mask" ? "semantic" : "instance");
      // The dialog updates enabled formats on Apply, so choose the new type and export together.
      await page.locator("#segmentationExportFormatSelect").evaluate((select: HTMLSelectElement, value) => { select.value = value; }, format);
      await page.locator("#applySegmentationFormatBtn").click({ timeout: 5000 });
      await expect(page.locator("#segmentationFormatModal")).toBeHidden();
    };
    await setExport("coco-segmentation");
    const coco = path.join(dataset, "segmentation", "coco", "01-unique.json");
    expect((await storage(["01-unique.png"]))["01-unique.png"][1].paths).toEqual([mask("01-unique"), coco]);
    await mkdir(coco, { recursive: true });
    const partial = await mcp.call("save");
    expect(partial.isError).toBe(true);
    expect(partial.structuredContent).toMatchObject({ image: "01-unique.png", success: false, action: "partially_written",
      paths: [mask("01-unique"), coco], writtenPaths: [mask("01-unique")] });
    expect((await storage(["01-unique.png"]))["01-unique.png"][1]).toMatchObject({ unsavedChanges: true,
      files: [{ status: "present", pixelsByClass: { "1": 7 } }, { status: "read_error" }] });
    await rm(coco, { recursive: true });
    const maskSaved = await call("save");
    expect(maskSaved).toMatchObject({ image: "01-unique.png", workflow: "segmentation", success: true, writtenPaths: [mask("01-unique"), coco],
      pixelsByClass: { "1": 7 }, regionsByClass: { "1": 2 } });
    expect((await storage(["01-unique.png"]))["01-unique.png"][1].files[0]).toMatchObject({
      path: maskSaved.writtenPaths[0], status: "present", pixelsByClass: maskSaved.pixelsByClass, regionsByClass: maskSaved.regionsByClass
    });
    expect((await storage(["01-unique.png"]))["01-unique.png"][1].files[1]).toMatchObject({ path: coco, status: "present" });
    await setExport("png-semantic-mask");
    await copyFile(mask("01-unique"), mask("shared"));
    const originalMask = await readFile(mask("shared"));
    await call("go_to_image", { image: "shared.png" });
    const maskRefused = await mcp.call("save");
    expect(maskRefused.isError).toBe(true);
    expect(maskRefused.structuredContent).toMatchObject({ image: "shared.png", workflow: "segmentation", success: false, paths: [mask("shared")], conflictingImages: shared });
    const cleanup = await call("clean_masks", { images: ["shared.png", "01-unique.png"], removeSpecks: 10, apply: true });
    expect(cleanup).toMatchObject({ applied: true, skipped: [{ image: "shared.png", conflictingImages: shared }],
      saves: [{ image: "01-unique.png", success: true, action: "written_empty", paths: [mask("01-unique")], pixelsByClass: {}, regionsByClass: {} }] });
    expect(await readFile(mask("shared"))).toEqual(originalMask);
    expect((await storage(["01-unique.png"]))["01-unique.png"][1].files[0]).toMatchObject({ status: "empty", pixelsByClass: {}, regionsByClass: {} });

    await call("set_workflow", { workflow: "detection" });
    // Remove the deliberately unreadable target before the folder remap, which requires readable inputs.
    await rm(label("02-error"), { force: true, recursive: true });
    const remap = await call("remap_classes", { offset: 1, dryRun: false });
    expect(remap).toMatchObject({ applied: true, skipped: [{ image: "shared.jpg" }, { image: "shared.png" }],
      saves: [{ image: "01-unique.png", success: true, boxCount: 1, paths: [label("01-unique")] }] });
    expect(await readFile(label("shared"), "utf8")).toBe(row);
    expect(await readFile(label("01-unique"), "utf8")).toMatch(/^1 /);
    await call("go_to_image", { image: "03-missing.png" });
    expect(await call("save")).toMatchObject({ image: "03-missing.png", action: "written_empty", success: true, boxCount: 0 });
    expect((await storage(["03-missing.png"]))["03-missing.png"][0].files[0]).toMatchObject({ status: "empty", boxCount: 0 });
  } finally {
    await close();
  }
});

test("MCP creates and selects a class file without overwriting existing files", async () => {
  const { mcp, dataset, close } = await openAgentApp();
  try {
    json(await mcp.call("open_folder", { path: dataset }));
    const classes = [{ id: "0", name: "Cell" }, { id: 2, name: "Boundary" }];
    const file = path.join(path.dirname(dataset), "profiles", "Class Info", "specimen.yaml");
    const create = (name: string, definitions = classes) => mcp.call("create_class_file", { name, classes: definitions });
    expect(textOf(await create("../specimen"))).toMatch(/^invalid_args:/);
    expect(textOf(await create("specimen", [{ id: "0", name: "A" }, { id: 0, name: "B" }]))).toMatch(/^invalid_args:/);
    expect(textOf(await create("specimen", [{ id: "0", name: "A\n2: B" }]))).toMatch(/^invalid_args:/);
    expect(existsSync(file)).toBe(false);

    const result = json(await create("specimen"));
    expect(result).toMatchObject({ created: true, path: file, classFile: "specimen.yaml",
      classes: [{ id: "0", name: "Cell" }, { id: "2", name: "Boundary" }] });
    expect(json(await mcp.call("get_classes"))).toEqual({ classFile: result.classFile, classes: result.classes });
    const original = await readFile(file, "utf8");
    expect(original).toBe("0: Cell\n2: Boundary");
    expect(textOf(await create("SPECIMEN.YAML", [{ id: "0", name: "Overwrite" }]))).toMatch(/^invalid_args:.*already exists/);
    expect(await readFile(file, "utf8")).toBe(original);
  } finally {
    await close();
  }
});

test("an MCP agent reads, navigates and captures the open app", async () => {
  test.setTimeout(180_000);
  const { page, mcp, dataset, errors, close } = await openAgentApp();
  try {
    expect(await mcp.tools()).toEqual([
      "add_boxes", "analyze_boxes", "analyze_masks", "app_state", "apply_layout", "approve", "boxes_to_masks", "capture_view", "clean_masks", "compare_labels", "compare_masks", "create_class_file", "delete_boxes", "edit_regions", "find_similar", "get_boxes", "get_classes",
      "get_refine_settings", "get_regions", "go_to_image", "inference_status", "list_images", "list_templates", "load_model", "open_folder", "paint_mask", "read_labels",
      "reclass_folder", "redo", "refine_folder", "remap_classes", "review_folder", "review_queue", "run_inference",
      "run_reclass", "run_refine", "run_template_matching", "save", "save_layout", "segment_ai", "select_boxes", "set_review_status", "set_workflow", "undo", "update_boxes"
    ]);

    expect(json(await mcp.call("app_state"))).toMatchObject({ folder: null, imageCount: 0, agentPaused: false });
    const noFolder = await mcp.call("list_images");
    expect(noFolder.isError).toBe(true);
    expect(textOf(noFolder)).toMatch(/^no_folder:/);

    const opened = json(await mcp.call("open_folder", { path: dataset }));
    expect(opened).toMatchObject({ folder: dataset, imageCount: 2 });
    await expect.poll(() => testApi<string>(page, "api.getCurrentImageName()")).toBe("sample_1.jpg");

    const listed = json(await mcp.call("list_images", { limit: 10 }));
    expect(listed.images.map((image: { name: string }) => image.name)).toEqual(["sample_1.jpg", "sample_2.jpg"]);

    const moved = json(await mcp.call("go_to_image", { image: "sample_2.jpg" }));
    expect(moved.currentImage).toBe("sample_2.jpg");
    expect(await testApi<string>(page, "api.getCurrentImageName()")).toBe("sample_2.jpg");
    expect(textOf(await mcp.call("go_to_image", { image: "missing.jpg" }))).toMatch(/^not_found:/);

    const boxes = json(await mcp.call("get_boxes"));
    const geometries = await testApi<Array<{ annotationId: string; left: number; top: number; right: number; bottom: number }>>(page, "api.getRectGeometries()");
    expect(boxes.boxes).toHaveLength(geometries.length);
    expect(boxes.boxes.length).toBeGreaterThan(0);
    // get_boxes refreshes the cached corners first; the test API reads them as they are (last-digit noise).
    const round = (value: number) => Math.round(value * 1e6) / 1e6;
    expect(boxes.boxes.map((box: { annotationId: string; x0: number; y0: number; x1: number; y1: number }) => [box.annotationId, ...[box.x0, box.y0, box.x1, box.y1].map(round)]))
      .toEqual(geometries.map((rect) => [rect.annotationId, ...[rect.left, rect.top, rect.right, rect.bottom].map(round)]));

    const labels = json(await mcp.call("read_labels", { image: "sample_1.jpg" }));
    expect(labels.units).toBe("normalized");
    expect(labels.boxes.length).toBeGreaterThan(0);
    expect(labels.boxes.every((box: { x0: number; x1: number }) => box.x0 >= -0.01 && box.x1 <= 1.01 && box.x0 < box.x1)).toBe(true);

    const classes = json(await mcp.call("get_classes"));
    expect(classes.classes.length).toBeGreaterThan(0);
    expect(classes.classes[0]).toEqual({ id: expect.any(String), name: expect.any(String), color: expect.stringMatching(/^#[0-9a-f]{6}$/i) });

    const capture = await mcp.call("capture_view", { maxSide: 512 });
    expect(capture.isError, textOf(capture)).toBeFalsy();
    const image = capture.content.find((part) => part.type === "image");
    expect(image?.type === "image" && image.mimeType).toBe("image/png");
    const png = Buffer.from(image?.type === "image" ? image.data : "", "base64");
    expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
    const info = JSON.parse(textOf(capture));
    expect(Math.max(png.readUInt32BE(16), png.readUInt32BE(20))).toBe(Math.max(info.width, info.height));
    expect(Math.max(info.width, info.height)).toBeLessThanOrEqual(512);
    await writeFile(test.info().outputPath("capture_view.png"), png);

    // The person typing: calls that change the app wait; reading still works.
    await page.evaluate(() => {
      const input = document.createElement("input");
      input.id = "agentBusyProbe";
      document.body.append(input);
      input.focus();
    });
    expect(textOf(await mcp.call("go_to_image", { step: -1 }))).toMatch(/^busy:/);
    expect(json(await mcp.call("app_state")).busy).toMatch(/typing/);
    await page.evaluate(() => document.getElementById("agentBusyProbe")?.remove());

    // The person's Stop pauses the agent until resumed.
    await page.evaluate(() => document.getElementById("agentPauseBtn")?.click());
    await expect(page.locator("#agentIndicator")).toBeVisible();
    await expect(page.locator("#agentIndicatorText")).toHaveText("Agent paused");
    for (const theme of ["light", "dark"]) {
      await page.evaluate((dark) => document.body.classList.toggle("dark-mode", dark), theme === "dark");
      const height = await page.evaluate(() => window.innerHeight);
      await page.screenshot({ path: test.info().outputPath(`agent-indicator-${theme}.png`), clip: { x: 0, y: height - 120, width: 1480, height: 120 } });
    }
    await page.evaluate(() => document.body.classList.remove("dark-mode"));
    expect(textOf(await mcp.call("go_to_image", { step: -1 }))).toMatch(/^declined:/);
    expect(json(await mcp.call("app_state")).agentPaused).toBe(true);
    await page.locator("#agentPauseBtn").click();
    expect(json(await mcp.call("go_to_image", { step: -1 })).currentImage).toBe("sample_1.jpg");
    await expect(page.locator("#agentIndicator")).toBeHidden();
    expect(errors).toEqual([]);
  } finally {
    await close();
  }
});

test("an MCP agent edits boxes, each call one undo step, and saves", async () => {
  test.setTimeout(180_000);
  const { page, mcp, dataset, errors, close } = await openAgentApp();
  try {
    json(await mcp.call("open_folder", { path: dataset }));
    await expect.poll(() => testApi<string>(page, "api.getCurrentImageName()")).toBe("sample_1.jpg");
    const start = await testApi<number>(page, "api.getRectCount()");
    const rectCount = () => testApi<number>(page, "api.getRectCount()");
    const boxOf = async (id: string) => json(await mcp.call("get_boxes", { ids: [id] })).boxes[0];
    await expect(page.locator("#undoBtn")).toBeDisabled();

    const added = json(await mcp.call("add_boxes", { boxes: [
      { classId: "1", x0: 10, y0: 20, x1: 60, y1: 80 },
      { classId: 3, x0: 100.5, y0: 100, x1: 150, y1: 140.25 }
    ] }));
    expect(added.annotationIds).toHaveLength(2);
    expect(added.boxCount).toBe(start + 2);
    expect(await rectCount()).toBe(start + 2);
    const [first, second] = added.annotationIds as string[];
    expect(await boxOf(first)).toMatchObject({ classId: "1", x0: 10, y0: 20, x1: 60, y1: 80 });
    const secondBox = await boxOf(second);
    expect([secondBox.classId, secondBox.x0, secondBox.y0, secondBox.x1, secondBox.y1]).toEqual(["3", 100.5, 100, 150, 140.25]);
    await expect(page.locator("#undoBtn")).toBeEnabled();

    // Bad input changes nothing.
    expect(textOf(await mcp.call("add_boxes", { boxes: [{ classId: "1", x0: 10, y0: 20, x1: 99_999, y1: 80 }] }))).toMatch(/^invalid_args: boxes\[0\]: lies outside/);
    expect(textOf(await mcp.call("add_boxes", { boxes: [{ classId: "-1", x0: 10, y0: 20, x1: 60, y1: 80 }] }))).toMatch(/^invalid_args:/);
    expect(textOf(await mcp.call("update_boxes", { updates: [{ annotationId: "nope", x0: 1 }] }))).toMatch(/^not_found:/);
    expect(await rectCount()).toBe(start + 2);

    // Geometry and class together: one undo step restores both.
    expect(json(await mcp.call("update_boxes", { updates: [{ annotationId: first, x1: 70, classId: "2" }] }))).toMatchObject({ moved: 1, relabelled: 1 });
    expect(await boxOf(first)).toMatchObject({ classId: "2", x0: 10, x1: 70 });
    expect(json(await mcp.call("undo"))).toMatchObject({ undone: 1 });
    expect(await boxOf(first)).toMatchObject({ classId: "1", x0: 10, x1: 60 });

    expect(json(await mcp.call("delete_boxes", { annotationIds: [first, second] }))).toMatchObject({ deleted: 2, boxCount: start });
    expect(await rectCount()).toBe(start);
    json(await mcp.call("undo"));
    expect(await rectCount()).toBe(start + 2);
    json(await mcp.call("redo"));
    expect(await rectCount()).toBe(start);
    json(await mcp.call("undo"));
    expect(await rectCount()).toBe(start + 2);

    expect(json(await mcp.call("select_boxes", { annotationIds: [second] })).selectedIds).toEqual([second]);
    expect(await testApi<string[]>(page, "api.getSelectedRectIds()")).toEqual([second]);
    expect(json(await mcp.call("select_boxes", { select: "none" })).selectedIds).toEqual([]);

    // The person holding the mouse on the canvas: edits wait.
    const canvas = await page.locator("#canvas").boundingBox();
    await page.mouse.move(canvas!.x + canvas!.width - 5, canvas!.y + canvas!.height - 5);
    await page.mouse.down();
    expect(textOf(await mcp.call("add_boxes", { boxes: [{ classId: "1", x0: 1, y0: 1, x1: 5, y1: 5 }] }))).toMatch(/^busy:/);
    await page.mouse.up();
    expect(await rectCount()).toBe(start + 2);

    expect(json(await mcp.call("save"))).toMatchObject({ saved: "sample_1.jpg", unsavedChanges: false });
    const rows = (await readFile(path.join(dataset, "label/sample_1.txt"), "utf8")).trim().split(/\r?\n/);
    expect(rows).toHaveLength(start + 2);
    expect(rows.some((row) => row.startsWith("3 "))).toBe(true);

    // The person's Ctrl+Z undoes the agent's edit: one shared history.
    json(await mcp.call("add_boxes", { boxes: [{ classId: "1", x0: 1, y0: 1, x1: 9, y1: 9 }] }));
    expect(await rectCount()).toBe(start + 3);
    await page.keyboard.press("Control+KeyZ");
    await expect.poll(rectCount).toBe(start + 2);
    expect(errors).toEqual([]);
  } finally {
    await close();
  }
});

test("an MCP agent runs Refine, review and folder-wide changes the person allows", async () => {
  test.setTimeout(240_000);
  const { page, mcp, dataset, errors, close } = await openAgentApp({ dataset: semDataset });
  try {
    json(await mcp.call("open_folder", { path: dataset }));
    await expect.poll(() => testApi<string>(page, "api.getCurrentImageName()")).toBe("a.png");
    const settings = json(await mcp.call("get_refine_settings"));
    expect(settings).toMatchObject({ mode: "edge", runWith: null, edgePresets: [] });

    const boxes = json(await mcp.call("get_boxes")).boxes as Array<{ annotationId: string; classId: string; x0: number; x1: number }>;
    const first = boxes[0];
    const refined = json(await mcp.call("run_refine", { annotationIds: [first.annotationId] }));
    expect(refined.refined).toBe(1);
    const change = refined.changes[0];
    expect(change.annotationId).toBe(first.annotationId);
    // Confidence to judge the result by: overall and per refined side, 0..1.
    expect(change.confidence).toBeGreaterThan(0);
    expect(change.confidence).toBeLessThanOrEqual(1);
    expect(Object.keys(change.sideConfidence).sort()).toEqual(["B", "L", "R", "T"]);
    // Snapped inward onto the block (13..52), from the loose box (9..56).
    expect(change.after.x0).toBeGreaterThan(change.before.x0 + 2);
    expect(change.after.x1).toBeLessThan(change.before.x1 - 2);
    const after = json(await mcp.call("get_boxes", { ids: [first.annotationId] })).boxes[0];
    expect(Math.abs(after.x0 - change.after.x0)).toBeLessThan(1e-6);
    json(await mcp.call("undo"));
    expect(json(await mcp.call("get_boxes", { ids: [first.annotationId] })).boxes[0].x0).toBeCloseTo(first.x0, 6);

    const classRun = json(await mcp.call("run_refine", { classId: "1" }));
    expect(classRun.changes.length).toBeGreaterThan(0);
    expect(classRun.changes.every((item: { classId: string }) => item.classId === "1")).toBe(true);
    const queue = json(await mcp.call("review_queue"));
    expect(queue.mode).toBe("edge");
    expect(json(await mcp.call("approve", { all: true })).remaining).toBe(0);
    expect(json(await mcp.call("review_queue")).boxes).toEqual([]);

    expect(textOf(await mcp.call("run_refine", { preset: "No such preset" }))).toMatch(/^not_found:/);
    expect(textOf(await mcp.call("run_refine", { annotationIds: ["nope"] }))).toMatch(/^not_found: No box with annotationId nope/);
    // Reclass with the default rule: the matches join the reclass queue; one undo puts the classes back.
    const reclassed = json(await mcp.call("run_reclass", { classId: "1" }));
    expect(reclassed.changed.length).toBeGreaterThan(0);
    expect(reclassed.changed.every((item: { from: string }) => item.from === "1")).toBe(true);
    expect(json(await mcp.call("review_queue", { mode: "reclass" })).boxes).toHaveLength(reclassed.changed.length);
    expect(json(await mcp.call("approve", { all: true, mode: "reclass" })).remaining).toBe(0);
    json(await mcp.call("undo"));
    const classOne = json(await mcp.call("get_boxes")).boxes.filter((box: { classId: string }) => box.classId === "1");
    expect(classOne).toHaveLength(3);

    const review = json(await mcp.call("review_folder"));
    expect(review.imagesChecked).toBe(2);

    // Class remap: a dry run changes nothing; applying it rewrites both label files after the person allows it.
    const before = await readFile(path.join(dataset, "label/b.txt"), "utf8");
    const dry = json(await mcp.call("remap_classes", { mapping: [{ from: "1", to: "5" }] }));
    expect(dry).toMatchObject({ changedBoxes: 6, imagesChanged: 2, applied: false });
    expect(await readFile(path.join(dataset, "label/b.txt"), "utf8")).toBe(before);
    const remapped = json(await mcp.call("remap_classes", { mapping: [{ from: "1", to: "5" }], dryRun: false }));
    expect(remapped).toMatchObject({ applied: true, changedBoxes: 6 });
    const remappedRows = (await readFile(path.join(dataset, "label/b.txt"), "utf8")).trim().split(/\r?\n/);
    expect(remappedRows.map((row) => row.split(" ")[0])).toEqual(["0", "0", "0", "5", "5", "5"]);

    // Folder refine is a dry run first: a summary in numbers and a resultId; no file changes.
    const remappedText = await readFile(path.join(dataset, "label/b.txt"), "utf8");
    const dryRun = json(await mcp.call("refine_folder", { outliers: 3 }));
    expect(dryRun).toMatchObject({ dryRun: true, imagesChecked: 2, imagesChanged: 2 });
    expect(dryRun.resultId).toMatch(/^edge-/);
    // 12 boxes; the three class-1 boxes of a.png were refined (and saved) above, so they no longer move.
    expect(dryRun.summary.boxes).toMatchObject({ total: 12, moved: 9 });
    expect(dryRun.boxesChanged).toBe(9);
    expect(dryRun.summary.shiftPx.median).toBeGreaterThan(2);
    expect(dryRun.summary.byClass["0"].boxes).toBe(6);
    expect(dryRun.summary.outliers.boxes).toHaveLength(3);
    expect(Object.keys(dryRun.summary.afterRefine.counts).sort()).toEqual(["crowded", "missing", "off-column", "off-row", "overlap", "size"]);
    expect(await readFile(path.join(dataset, "label/b.txt"), "utf8")).toBe(remappedText);
    // The TS path (native folder refine off) summarizes the same results.
    await page.evaluate(() => Reflect.set(window, "easyLabelingNativeOff", ["refine-folder"]));
    const tsDryRun = json(await mcp.call("refine_folder", { outliers: 3 }));
    await page.evaluate(() => Reflect.deleteProperty(window, "easyLabelingNativeOff"));
    expect(tsDryRun.summary).toEqual(dryRun.summary);
    // A sample of one image.
    const sample = json(await mcp.call("refine_folder", { sample: 1 }));
    expect(sample).toMatchObject({ imagesChecked: 1 });
    expect(sample.summary.boxes.total).toBe(6);

    // Applying the dry run writes exactly what it previewed; a resultId is used once.
    const applied = json(await mcp.call("refine_folder", { resultId: dryRun.resultId }));
    expect(applied).toMatchObject({ boxesChanged: dryRun.boxesChanged, imagesChanged: 2 });
    expect(applied.backupPath).toBeTruthy();
    expect(textOf(await mcp.call("refine_folder", { resultId: dryRun.resultId }))).toMatch(/^failed: No dry run with resultId/);
    // The sample's dry run (a.png) went stale when the apply rewrote a.txt: refused, and a.txt stays as written.
    const appliedA = await readFile(path.join(dataset, "label/a.txt"), "utf8");
    expect(textOf(await mcp.call("refine_folder", { resultId: sample.resultId }))).toMatch(/changed since the dry run/);
    expect(await readFile(path.join(dataset, "label/a.txt"), "utf8")).toBe(appliedA);
    const refinedRows = (await readFile(path.join(dataset, "label/b.txt"), "utf8")).trim().split(/\r?\n/);
    const width = Number(refinedRows[0].split(" ")[3]) * SEM_SIZE.width;
    expect(width).toBeLessThan(loose(0, 0).x1 - loose(0, 0).x0 - 4);
    expect(errors).toEqual([]);
  } finally {
    await close();
  }
});

test("an MCP agent previews, pages, zooms in, and reuses boxes as templates and layouts", async () => {
  test.setTimeout(240_000);
  const { page, mcp, dataset, errors, close } = await openAgentApp({ dataset: semDataset });
  try {
    json(await mcp.call("open_folder", { path: dataset }));
    await expect.poll(() => testApi<string>(page, "api.getCurrentImageName()")).toBe("a.png");
    const rectCount = () => testApi<number>(page, "api.getRectCount()");

    // Paged boxes with counts for the whole image.
    const firstPage = json(await mcp.call("get_boxes", { limit: 2 }));
    expect(firstPage).toMatchObject({ total: 6, offset: 0, truncated: true, countsByClass: { 0: 3, 1: 3 } });
    expect(firstPage.boxes).toHaveLength(2);
    expect(json(await mcp.call("get_boxes", { limit: 0 })).boxes).toEqual([]);
    const classZero = json(await mcp.call("get_boxes", { classId: 0 })).boxes as Array<{ annotationId: string; x0: number; y0: number; x1: number; y1: number }>;
    expect(classZero).toHaveLength(3);

    // Dry runs return what would change and change nothing.
    const dry = json(await mcp.call("run_refine", { classId: "1", dryRun: true }));
    expect(dry.dryRun).toBe(true);
    expect(dry.changes.length).toBeGreaterThan(0);
    const unchanged = json(await mcp.call("get_boxes", { ids: [dry.changes[0].annotationId] })).boxes[0];
    expect(unchanged.x0).toBeCloseTo(dry.changes[0].before.x0, 6);
    const one = json(await mcp.call("run_refine", { classId: "1", limit: 1 }));
    expect(one.changes).toHaveLength(1);
    expect(one.listed).toMatchObject({ total: 3, truncated: true });
    json(await mcp.call("undo"));
    const reclassDry = json(await mcp.call("run_reclass", { classId: "1", dryRun: true }));
    expect(reclassDry.dryRun).toBe(true);
    expect(Object.values(reclassDry.changesByClass as Record<string, number>).reduce((sum, count) => sum + count, 0)).toBe(reclassDry.listed.total);
    expect(json(await mcp.call("get_boxes", { classId: "1" })).total).toBe(3);

    // A zoomed crop around one box.
    const crop = await mcp.call("capture_view", { annotationId: classZero[0].annotationId, maxSide: 512 });
    const cropInfo = JSON.parse(textOf(crop));
    const cropImage = crop.content.find((part) => part.type === "image");
    expect(cropImage).toBeTruthy();
    if (cropImage?.type === "image") await writeFile(path.join(root, "test-results/agent-capture-crop.png"), Buffer.from(cropImage.data, "base64"));
    expect(Math.max(cropInfo.width, cropInfo.height)).toBeLessThanOrEqual(512);
    expect(cropInfo.imageFromCapture.offsetX).toBeCloseTo(Math.max(0, classZero[0].x0 - (classZero[0].x1 - classZero[0].x0) / 2), 6);
    expect(textOf(await mcp.call("capture_view", { region: { x0: 600, y0: 0, x1: 700, y1: 10 } }))).toMatch(/^invalid_args:/);
    // The same crop again with nothing changed: no image, the earlier mapping repeated; force sends it again.
    const again = await mcp.call("capture_view", { annotationId: classZero[0].annotationId, maxSide: 512 });
    expect(again.content.some((part) => part.type === "image")).toBe(false);
    expect(JSON.parse(textOf(again))).toMatchObject({ unchanged: true, imageFromCapture: cropInfo.imageFromCapture });
    expect((await mcp.call("capture_view", { annotationId: classZero[0].annotationId, maxSide: 512, force: true })).content.some((part) => part.type === "image")).toBe(true);

    // Several boxes in one sheet: numbered cells in the order given.
    const sheetIds = classZero.map((box) => box.annotationId);
    const sheet = await mcp.call("capture_view", { annotationIds: sheetIds, maxSide: 512 });
    const sheetInfo = JSON.parse(textOf(sheet)) as { width: number; height: number; cells: Array<{ n: number; annotationId: string; classId: string; cell: { x: number; y: number; width: number; height: number } }> };
    const sheetImage = sheet.content.find((part) => part.type === "image");
    expect(sheetImage).toBeTruthy();
    if (sheetImage?.type === "image") await writeFile(path.join(root, "test-results/agent-capture-sheet.png"), Buffer.from(sheetImage.data, "base64"));
    expect(sheetInfo.cells.map((cell) => [cell.n, cell.annotationId, cell.classId])).toEqual(sheetIds.map((id, index) => [index + 1, id, "0"]));
    expect(sheetInfo.cells.every((cell) => cell.cell.x + cell.cell.width <= sheetInfo.width && cell.cell.y + cell.cell.height <= sheetInfo.height)).toBe(true);
    expect(Math.max(sheetInfo.width, sheetInfo.height)).toBeLessThanOrEqual(512);
    // A change inside the sheet sends a new image.
    json(await mcp.call("update_boxes", { updates: [{ annotationId: sheetIds[0], x1: classZero[0].x1 - 2 }] }));
    expect((await mcp.call("capture_view", { annotationIds: sheetIds, maxSide: 512 })).content.some((part) => part.type === "image")).toBe(true);
    json(await mcp.call("undo"));
    expect(textOf(await mcp.call("capture_view", { annotationIds: ["missing"] }))).toMatch(/^not_found:/);
    expect(textOf(await mcp.call("capture_view", { annotationIds: Array.from({ length: 37 }, () => sheetIds[0]) }))).toMatch(/^invalid_args: At most 36/);

    // find_similar: every block in the 8 x 8 grid matches the labelled one; the 6 labelled blocks are skipped.
    const start = await rectCount();
    const similar = json(await mcp.call("find_similar", { annotationId: classZero[0].annotationId, limit: 5 }));
    expect(similar.applied).toBe(false);
    expect(similar.found).toBeGreaterThanOrEqual(50);
    expect(similar.candidates).toHaveLength(5);
    expect(similar.overlappingExisting).toBeGreaterThanOrEqual(5);
    expect(await rectCount()).toBe(start);
    const added = json(await mcp.call("find_similar", { annotationId: classZero[0].annotationId, apply: true, limit: 0 }));
    expect(added.annotationIds).toHaveLength(similar.found);
    expect(await rectCount()).toBe(start + similar.found);
    // Population check on the filled grid: class 0 now covers every cell but the three class-1 boxes, which show as
    // missing positions in the class-0 columns, at the class-1 boxes' centres; sizes and alignment are regular.
    const classOne = json(await mcp.call("get_boxes", { classId: 1 })).boxes as Array<{ x0: number; y0: number; x1: number; y1: number }>;
    const stats = json(await mcp.call("analyze_boxes", { classId: 0 }));
    expect(stats.counts).toMatchObject({ size: 0, "off-row": 0, "off-column": 0, missing: 3 });
    expect(stats.byClass["0"].groups[0].rows).toBeGreaterThanOrEqual(7);
    for (const hole of stats.missing as Array<{ x: number; y: number }>) {
      expect(classOne.some((box) => Math.abs((box.x0 + box.x1) / 2 - hole.x) < 4 && Math.abs((box.y0 + box.y1) / 2 - hole.y) < 4)).toBe(true);
    }
    json(await mcp.call("undo"));
    expect(await rectCount()).toBe(start);

    // Saved label files of both images (normalized): three boxes per class per image is too few to judge.
    const filesStats = json(await mcp.call("analyze_boxes", { sample: 2 }));
    expect(filesStats).toMatchObject({ units: "normalized", imagesChecked: 2, imagesWithFindings: 0 });

    // A layout from the class-0 row, placed two rows lower (anchor + 96 px), then undone.
    const saved = json(await mcp.call("save_layout", { name: "Agent row", annotationIds: classZero.map((box) => box.annotationId) }));
    expect(saved).toMatchObject({ layout: "Agent row", boxCount: 3, overwritten: false });
    expect(textOf(await mcp.call("save_layout", { name: "Agent row", scope: "all" }))).toMatch(/^invalid_args:/);
    expect(json(await mcp.call("list_templates")).layouts).toContainEqual({ name: "Agent row", boxCount: 3 });
    const placed = json(await mcp.call("apply_layout", { layout: "Agent row", x: saved.sourceAnchor.x, y: saved.sourceAnchor.y + 96 }));
    expect(placed.applied).toBe(3);
    const placedBoxes = json(await mcp.call("get_boxes", { ids: placed.annotationIds })).boxes as Array<{ y0: number }>;
    expect(placedBoxes.map((box) => box.y0).sort((a, b) => a - b)[0]).toBeCloseTo(Math.min(...classZero.map((box) => box.y0)) + 96, 6);
    json(await mcp.call("undo"));
    expect(await rectCount()).toBe(start);
    expect(textOf(await mcp.call("apply_layout", { layout: "No such layout" }))).toMatch(/^not_found:/);

    // Review status, as the image list's buttons set it.
    expect(json(await mcp.call("set_review_status", { status: "reviewed" }))).toMatchObject({ images: ["a.png"], reviewedInFolder: 1, imageCount: 2 });
    const reviewState = JSON.parse(await readFile(path.join(dataset, ".easy-labeling/review-state.json"), "utf8"));
    expect(reviewState.images["a.png"].status).toBe("reviewed");
    expect(errors).toEqual([]);
  } finally {
    await close();
  }
});

test("an MCP agent switches to Segmentation and reads the mask as regions", async () => {
  test.setTimeout(180_000);
  // The sample's SEM pattern image with its mask: 446,750 px of class 10 (bars, rails and a few specks).
  const { page, mcp, dataset, errors, close } = await openAgentApp({
    dataset: async (folder) => {
      await mkdir(path.join(folder, "mask"), { recursive: true });
      await copyFile(path.join(root, "assets/sample/sample_metal_pattern.png"), path.join(folder, "sample_metal_pattern.png"));
      await copyFile(path.join(root, "assets/sample/label/sample_metal_pattern.txt"), path.join(folder, "label/sample_metal_pattern.txt"));
      await copyFile(path.join(root, "assets/sample/mask/sample_metal_pattern.png"), path.join(folder, "mask/sample_metal_pattern.png"));
    }
  });
  try {
    json(await mcp.call("open_folder", { path: dataset }));
    expect(textOf(await mcp.call("get_regions"))).toMatch(/^failed: The app is in Detection/);
    expect(json(await mcp.call("set_workflow", { workflow: "segmentation" }))).toEqual({ workflow: "segmentation", previous: "detection" });
    await expect.poll(() => page.evaluate(() => (document.getElementById("segmentationWorkflowTab") as HTMLInputElement).checked)).toBe(true);

    const state = json(await mcp.call("app_state"));
    expect(state).toMatchObject({ workflow: "segmentation", mask: { pixelsByClass: { 10: 446750 } } });
    const all = json(await mcp.call("get_regions", { limit: 0 }));
    expect(all).toMatchObject({ width: 1759, height: 1146, units: "pixels", pixelsByClass: { 10: 446750 }, regions: [], truncated: true });
    expect(all.total).toBe(all.regionsByClass["10"]);
    // Largest first, every region inside the image, its seed inside its box; specks drop out with minArea.
    const top = json(await mcp.call("get_regions", { limit: 5 }));
    const areas = (top.regions as Array<{ area: number }>).map((region) => region.area);
    expect(areas).toEqual([...areas].sort((a, b) => b - a));
    for (const region of top.regions as Array<{ classId: string; x0: number; y0: number; x1: number; y1: number; seed: { x: number; y: number } }>) {
      expect(region.classId).toBe("10");
      expect(region.seed.x).toBeGreaterThanOrEqual(region.x0);
      expect(region.seed.x).toBeLessThan(region.x1);
      expect(region.seed.y).toBeGreaterThanOrEqual(region.y0);
      expect(region.seed.y).toBeLessThan(region.y1);
    }
    const big = json(await mcp.call("get_regions", { minArea: 100, limit: 0 }));
    expect(big.total).toBeLessThan(all.total);
    expect(json(await mcp.call("get_regions", { classId: 3, limit: 0 })).total).toBe(0);

    // Paint a 20 x 10 block of class 12 on background: one new region; backgroundOnly leaves class 10 alone.
    const painted = json(await mcp.call("paint_mask", { classId: 12, shapes: [{ type: "rect", x0: 2, y0: 2, x1: 22, y1: 12 }], backgroundOnly: true }));
    expect(painted).toMatchObject({ value: 12, bounds: { x0: 2, y0: 2 } });
    expect(painted.changed).toBeGreaterThan(0);
    expect(painted.changed).toBeLessThanOrEqual(200);
    expect(painted.pixelsByClass["10"]).toBe(446750);
    expect(painted.regionsByClass["12"]).toBe(1);
    expect(json(await mcp.call("app_state")).unsavedChanges).toBe(true);
    // Relabel it by a seed, then erase it with a circle; a seed on background is not_found.
    const block = (json(await mcp.call("get_regions", { classId: 12 })).regions as Array<{ seed: { x: number; y: number } }>)[0]!;
    expect(json(await mcp.call("edit_regions", { action: "relabel", seeds: [block.seed], toClassId: 11 }))).toMatchObject({ regions: 1, changed: painted.changed, toClassId: "11" });
    expect(textOf(await mcp.call("edit_regions", { action: "delete", seeds: [{ x: 0, y: 0 }] }))).toMatch(/^not_found: seeds\[0\] \(0, 0\) is background/);
    // Specks: every class-10 region of 60 px or less (two small regions in this mask) goes in one call (one undo step).
    const specks = (json(await mcp.call("get_regions", { classId: 10, limit: 500, offset: 0 })).total as number) - (json(await mcp.call("get_regions", { classId: 10, minArea: 61, limit: 0 })).total as number);
    expect(specks).toBeGreaterThan(0);
    const cleaned = json(await mcp.call("edit_regions", { action: "delete", classId: 10, maxArea: 60 }));
    expect(cleaned.regions).toBe(specks);
    expect(cleaned.regionsByClass["10"]).toBe(all.total - specks);
    expect(json(await mcp.call("undo"))).toMatchObject({ undone: 1 });
    expect(json(await mcp.call("app_state")).mask.regionsByClass["10"]).toBe(all.total);
    expect(json(await mcp.call("undo", { steps: 2 }))).toMatchObject({ undone: 2 });
    expect(json(await mcp.call("app_state")).mask.pixelsByClass).toEqual({ 10: 446750 });
    expect(textOf(await mcp.call("paint_mask", { classId: 0, shapes: [{ type: "rect", x0: 0, y0: 0, x1: 5, y1: 5 }] }))).toMatch(/^invalid_args: classId must be 1\.\.65535/);
    expect(textOf(await mcp.call("paint_mask", { classId: 3, shapes: [{ type: "polygon", points: [[0, 0], [5, 5]] }] }))).toMatch(/^invalid_args: shapes\[0\]/);

    // The workflow-wide tools act on the mask; the capture shows it.
    expect(json(await mcp.call("redo"))).toMatchObject({ redone: 1 });
    expect(json(await mcp.call("save"))).toMatchObject({ saved: "sample_metal_pattern.png", unsavedChanges: false });
    expect((await mcp.call("capture_view")).content.some((part: { type: string }) => part.type === "image")).toBe(true);
    // Box tools say which workflow they need.
    expect(textOf(await mcp.call("add_boxes", { boxes: [{ classId: 0, x0: 1, y0: 1, x1: 9, y1: 9 }] }))).toMatch(/^failed: The app is in Segmentation/);

    expect(json(await mcp.call("set_workflow", { workflow: "detection" }))).toEqual({ workflow: "detection", previous: "segmentation" });
    expect(textOf(await mcp.call("set_workflow", { workflow: "masks" }))).toMatch(/^invalid_args:/);
    expect(errors).toEqual([]);
  } finally {
    await close();
  }
});

test("an MCP agent scores masks against reference masks", async () => {
  test.setTimeout(180_000);
  // scripts/bench/make-mask-reference-dataset.mjs: mask_gt = the sample's SEM masks (1205 regions of class 10), mask = the
  // same masks damaged (seed 1: 66 regions deleted, 31 given class 11, every region grown or shrunk by up to 3 px, 24 blobs).
  const { page, mcp, dataset, errors, close } = await openAgentApp({
    dataset: async (folder) => { execFileSync(process.execPath, [path.join(root, "scripts/bench/make-mask-reference-dataset.mjs"), folder]); }
  });
  try {
    json(await mcp.call("open_folder", { path: dataset }));
    json(await mcp.call("set_workflow", { workflow: "segmentation" }));
    await expect.poll(() => testApi<string>(page, "api.getCurrentImageName()")).toBe("sample_metal_cross_section.png");

    const self = json(await mcp.call("compare_masks", { reference: "mask_gt", labels: "mask_gt" }));
    expect(self).toMatchObject({ images: 2, meanIou: 1, boundaryF1: 1, regions: { reference: 1205, labels: 1205, misses: 0, extras: 0, wrongClass: 0 }, canvas: "saved masks" });

    // The damaged masks; the current image comes from the canvas, which holds the same saved mask.
    const score = json(await mcp.call("compare_masks", { reference: "mask_gt", outliers: 3 }));
    expect(score.canvas).toMatch(/^sample_metal_cross_section\.png is scored from the canvas/);
    expect(score.meanIou).toBeCloseTo(0.757, 2);
    expect(score.boundaryF1).toBeCloseTo(0.776, 2);
    expect(score.regions).toEqual({ reference: 1205, labels: 1150, misses: 119, extras: 23, wrongClass: 24 });
    expect(score.confusions["10->11"]).toBeGreaterThan(30_000);
    expect(score.worst.misses).toHaveLength(3);
    expect(score.worst.misses[0]).toMatchObject({ classId: "10", seed: { x: expect.any(Number), y: expect.any(Number) } });
    expect(score.perImage.map((image: { image: string }) => image.image)).toEqual(["sample_metal_pattern.png", "sample_metal_cross_section.png"]);
    const before = json(await mcp.call("compare_masks", { reference: "mask_gt", images: ["sample_metal_cross_section.png"], outliers: 1 }));
    // A looser boundary tolerance can only raise the boundary score.
    expect(json(await mcp.call("compare_masks", { reference: "mask_gt", tolerance: 5 })).boundaryF1).toBeGreaterThan(score.boundaryF1);

    // AI Select from a box around the largest missed region: a preview with numbers, then applying it by resultId.
    const missed = before.worst.misses[0] as { x0: number; y0: number; x1: number; y1: number; area: number };
    const box = { x0: missed.x0 - 3, y0: missed.y0 - 3, x1: missed.x1 + 3, y1: missed.y1 + 3 };
    const preview = json(await mcp.call("segment_ai", { classId: 10, prompts: [{ box }, { points: [{ x: (missed.x0 + missed.x1) / 2, y: (missed.y0 + missed.y1) / 2 }] }] }));
    expect(preview).toMatchObject({ resultId: expect.stringMatching(/^ai-\d+$/), applied: 0 });
    expect(preview.results).toHaveLength(2);
    const fromBox = preview.results[0];
    expect(fromBox.pixels).toBeGreaterThan(missed.area * 0.5);
    expect(fromBox.x0).toBeGreaterThanOrEqual(box.x0);
    expect(fromBox.x1).toBeLessThanOrEqual(box.x1);
    expect(fromBox.score).toBeGreaterThan(0);
    expect(fromBox.edgeFit).toBeGreaterThan(1);
    expect(preview.timing.encodeMs).toBeGreaterThanOrEqual(0);
    expect(json(await mcp.call("compare_masks", { reference: "mask_gt", images: ["sample_metal_cross_section.png"] })).regions.misses).toBe(before.regions.misses);
    const applied = json(await mcp.call("segment_ai", { classId: 10, resultId: preview.resultId, accept: [0] }));
    expect(applied.applied).toBe(1);
    expect(applied.changed).toBeGreaterThan(0);
    const afterAi = json(await mcp.call("compare_masks", { reference: "mask_gt", images: ["sample_metal_cross_section.png"] }));
    expect(afterAi.regions.misses).toBe(before.regions.misses - 1);
    expect(afterAi.meanIou).toBeGreaterThan(before.meanIou);
    json(await mcp.call("undo"));
    expect(textOf(await mcp.call("segment_ai", { classId: 10, resultId: "ai-999" }))).toMatch(/^not_found:/);
    expect(textOf(await mcp.call("segment_ai", { classId: 10, prompts: [{}] }))).toMatch(/^invalid_args: prompts\[0\] needs points, a box, or both/);

    // Detection boxes to mask regions: three boxes read in Detection, converted in Segmentation (the box class, 10).
    json(await mcp.call("set_workflow", { workflow: "detection" }));
    const three = (json(await mcp.call("get_boxes", { limit: 3 })).boxes as Array<{ annotationId: string; x0: number; y0: number; x1: number; y1: number }>);
    json(await mcp.call("set_workflow", { workflow: "segmentation" }));
    const converted = json(await mcp.call("boxes_to_masks", { annotationIds: three.map((box) => box.annotationId), snapPx: 3 }));
    expect(converted).toMatchObject({ boxes: 3, applied: 0, noClass: 0 });
    expect(converted.results.map((row: { annotationId: string }) => row.annotationId).sort()).toEqual(three.map((box) => box.annotationId).sort());
    for (const row of converted.results as Array<{ maskClassId: string; fill: number; x0: number; x1: number; annotationId: string }>) {
      const box = three.find((entry) => entry.annotationId === row.annotationId)!;
      expect(row.maskClassId).toBe("10");
      expect(row.fill).toBeGreaterThan(0.3);
      expect(row.x0).toBeGreaterThanOrEqual(Math.floor(box.x0) - 2);
      expect(row.x1).toBeLessThanOrEqual(Math.ceil(box.x1) + 2);
    }
    expect(converted.timing.perPromptMs).toBeGreaterThan(0);
    const convertedApplied = json(await mcp.call("boxes_to_masks", { resultId: converted.resultId }));
    expect(convertedApplied.applied).toBe(3);
    json(await mcp.call("undo"));
    expect(textOf(await mcp.call("segment_ai", { classId: 10, resultId: converted.resultId }))).toMatch(/^not_found: That resultId is not the last segment_ai preview/);
    expect(textOf(await mcp.call("boxes_to_masks", { annotationIds: ["nope"] }))).toMatch(/^not_found:/);

    // Live view: AI results are drawn on the mask while they are found; a preview puts the mask back at the end.
    await page.locator("#agentPanelBtn").click();
    await page.locator("#agentLiveToggle").check();
    await page.locator("#agentPanelCloseBtn").click();
    json(await mcp.call("set_workflow", { workflow: "detection" }));
    const tenBoxes = json(await mcp.call("get_boxes", { limit: 10 })).boxes as Array<{ annotationId: string; x0: number; y0: number; x1: number; y1: number }>;
    json(await mcp.call("set_workflow", { workflow: "segmentation" }));
    // Clear the mask under those boxes first, so the live drawing shows on empty pixels.
    json(await mcp.call("paint_mask", { erase: true, shapes: tenBoxes.map((box) => ({ type: "rect", x0: Math.max(0, box.x0 - 3), y0: Math.max(0, box.y0 - 3), x1: box.x1 + 3, y1: box.y1 + 3 })) }));
    const pixelsBefore = json(await mcp.call("app_state")).mask.pixelsByClass["10"];
    const centre = { x: Math.round((tenBoxes[0]!.x0 + tenBoxes[0]!.x1) / 2), y: Math.round((tenBoxes[0]!.y0 + tenBoxes[0]!.y1) / 2) };
    const classAtCentre = () => testApi<string | null>(page, `api.getSegmentationClassAtPoint(${centre.x}, ${centre.y})`);
    expect(await classAtCentre()).not.toBe("10");
    const livePreview = mcp.call("boxes_to_masks", { annotationIds: tenBoxes.map((box) => box.annotationId), snapPx: 3 });
    await expect.poll(classAtCentre, { timeout: 20_000, intervals: [50] }).toBe("10");
    await page.screenshot({ path: test.info().outputPath("live-view-segmentation.png") });
    expect(json(await livePreview).boxes).toBe(10);
    expect(await classAtCentre()).not.toBe("10");
    expect(json(await mcp.call("app_state")).mask.pixelsByClass["10"]).toBe(pixelsBefore);
    json(await mcp.call("undo"));
    await page.locator("#agentPanelBtn").click();
    await page.locator("#agentLiveToggle").uncheck();
    await page.locator("#agentPanelCloseBtn").click();

    // Checks and clean-up: the damaged mask has stray blobs (extras); removing small regions removes them.
    const checked = json(await mcp.call("analyze_masks", { outliers: 5 }));
    expect(Object.keys(checked.counts).sort()).toEqual(["holes", "missing", "necked", "offEdges", "offLine", "size", "specks"]);
    expect(Object.values(checked.byClass as Record<string, { regions: number }>).reduce((sum, entry) => sum + entry.regions, 0)).toBe(checked.regions);
    const fits = (checked.offEdges as Array<{ edgeFit: number; seed: { x: number; y: number } }>).map((entry) => entry.edgeFit);
    expect(fits).toEqual([...fits].sort((a, b) => a - b));
    const cleanPreview = json(await mcp.call("clean_masks", { removeSpecks: 90 }));
    expect(cleanPreview.applied).toBe(false);
    expect(cleanPreview.specksRemoved).toBeGreaterThan(0);
    expect(json(await mcp.call("compare_masks", { reference: "mask_gt", images: ["sample_metal_cross_section.png"] })).regions.extras).toBe(before.regions.extras);
    const cleaned = json(await mcp.call("clean_masks", { removeSpecks: 90, apply: true }));
    expect(cleaned).toMatchObject({ applied: true, specksRemoved: cleanPreview.specksRemoved, changed: cleanPreview.changed });
    expect(json(await mcp.call("compare_masks", { reference: "mask_gt", images: ["sample_metal_cross_section.png"] })).regions.extras).toBeLessThan(before.regions.extras);
    json(await mcp.call("undo"));
    expect(textOf(await mcp.call("clean_masks", {}))).toMatch(/^invalid_args: Give at least one of/);

    // Folder runs on the saved masks: counts per image, a preview that writes nothing, then an approved, backed-up write.
    const folderCheck = json(await mcp.call("analyze_masks", { scope: "folder" }));
    expect(folderCheck).toMatchObject({ imagesChecked: 2, withoutMask: 0 });
    expect(folderCheck.images).toHaveLength(2);
    const maskFile = path.join(dataset, "mask", "sample_metal_pattern.png");
    const originalBytes = await readFile(maskFile);
    const folderPreview = json(await mcp.call("clean_masks", { scope: "folder", removeSpecks: 90 }));
    expect(folderPreview).toMatchObject({ applied: false, imagesChecked: 2 });
    expect(folderPreview.imagesChanged).toBeGreaterThan(0);
    expect((await readFile(maskFile)).equals(originalBytes)).toBe(true);
    const extrasBefore = json(await mcp.call("compare_masks", { reference: "mask_gt", labels: "mask" })).regions.extras;
    const folderClean = json(await mcp.call("clean_masks", { scope: "folder", removeSpecks: 90, apply: true }));
    expect(folderClean).toMatchObject({ applied: true, imagesChanged: folderPreview.imagesChanged, specksRemoved: folderPreview.specksRemoved, backup: expect.stringMatching(/^mask\/\.easy-labeling\/clean-masks-/) });
    const backupFile = path.join(dataset, folderClean.backup, "sample_metal_pattern.png");
    expect((await readFile(backupFile)).equals(originalBytes)).toBe(true);
    expect((await readFile(maskFile)).equals(originalBytes)).toBe(false);
    expect(json(await mcp.call("compare_masks", { reference: "mask_gt", labels: "mask" })).regions.extras).toBeLessThan(extrasBefore);
    expect(textOf(await mcp.call("clean_masks", { scope: "everything", removeSpecks: 9 }))).toMatch(/^invalid_args: scope must be/);

    expect(textOf(await mcp.call("compare_masks", { reference: "no_such_folder" }))).toMatch(/^not_found:/);
    expect(textOf(await mcp.call("compare_masks", { reference: "../mask_gt" }))).toMatch(/^invalid_args:/);
    expect(textOf(await mcp.call("compare_masks", { reference: "mask_gt", tolerance: 50 }))).toMatch(/^invalid_args:/);
    expect(errors).toEqual([]);
  } finally {
    await close();
  }
});

test("an MCP agent scores labels against reference labels", async () => {
  test.setTimeout(180_000);
  // scripts/bench/make-reference-dataset.mjs: label_gt = the sample's edge-tight SEM labels, label = the same labels damaged
  // (seed 1: 1203 boxes, 56 dropped, 29 given class 11, 22 duplicated half a box away, every edge moved up to 3 px).
  const { page, mcp, dataset, errors, close } = await openAgentApp({
    dataset: async (folder) => { execFileSync(process.execPath, [path.join(root, "scripts/bench/make-reference-dataset.mjs"), folder]); }
  });
  try {
    json(await mcp.call("open_folder", { path: dataset }));
    await expect.poll(() => testApi<string>(page, "api.getCurrentImageName()")).toBe("sample_metal_cross_section.png");

    // The reference against itself is perfect.
    const self = json(await mcp.call("compare_labels", { reference: "label_gt", labels: "label_gt" }));
    expect(self).toMatchObject({ images: 2, precision: 1, recall: 1, f1: 1, meanIou: 1, edgeErrorPx: { max: 0 } });

    // The damaged labels: every dropped box is missed, every class change is a confusion, edges are off by up to 3 px.
    const score = json(await mcp.call("compare_labels", { reference: "label_gt", outliers: 3 }));
    expect(score.boxes.reference).toBe(1203);
    expect(score.boxes.misses).toBeGreaterThanOrEqual(56);
    expect(score.confusions["10->11"]).toBeGreaterThan(20);
    expect(score.edgeErrorPx.max).toBeLessThanOrEqual(3.01);
    expect(score.recall).toBeGreaterThan(0.8);
    expect(score.recall).toBeLessThan(0.95);
    expect(score.worst.misses).toHaveLength(3);
    expect(score.perImage.map((image: { image: string }) => image.image).sort()).toEqual(["sample_metal_cross_section.png", "sample_metal_pattern.png"]);

    // The current image is scored from the canvas: deleting a matched box costs one correct box before any save.
    const boxes = json(await mcp.call("get_boxes", { limit: 0 }));
    const before = json(await mcp.call("compare_labels", { reference: "label_gt", images: ["sample_metal_cross_section.png"] }));
    const matchedId = (before.worst.edges as Array<{ label: { id: string; classId: string }; reference: { classId: string } }>).find((pair) => pair.label.classId === pair.reference.classId)!.label.id;
    json(await mcp.call("delete_boxes", { annotationIds: [matchedId] }));
    const after = json(await mcp.call("compare_labels", { reference: "label_gt", images: ["sample_metal_cross_section.png"] }));
    expect(after.boxes.labels).toBe(boxes.total - 1);
    expect(after.boxes.correct).toBe(before.boxes.correct - 1);
    json(await mcp.call("undo"));

    expect(textOf(await mcp.call("compare_labels", { reference: "no_such_folder" }))).toMatch(/^not_found:/);
    expect(textOf(await mcp.call("compare_labels", { reference: "../label_gt" }))).toMatch(/^invalid_args:/);
    expect(errors).toEqual([]);
  } finally {
    await close();
  }
});

test("an MCP agent runs template automation presets and YOLO inference", async () => {
  test.setTimeout(240_000);
  const { page, mcp, dataset, errors, close } = await openAgentApp({
    dataset: async (folder) => {
      await sampleDataset(folder);
      // The sample's automation presets, which open_folder loads with the folder.
      await mkdir(path.join(folder, ".easy-labeling"), { recursive: true });
      await copyFile(path.join(root, "assets/sample/.easy-labeling/automation-library.json"), path.join(folder, ".easy-labeling/automation-library.json"));
      await writeFile(path.join(path.dirname(folder), "local.onnx"), inferenceModel(1, "nchw"));
    }
  });
  try {
    json(await mcp.call("open_folder", { path: dataset }));
    await expect.poll(() => testApi<string>(page, "api.getCurrentImageName()")).toBe("sample_1.jpg");
    const rectCount = () => testApi<number>(page, "api.getRectCount()");
    const start = await rectCount();

    const library = json(await mcp.call("list_templates"));
    expect(library.presets.map((preset: { name: string }) => preset.name)).toEqual(["Sample Pink Anchor + Layout", "Sample Pink Vehicle Finder"]);
    expect(library.layouts).toEqual([{ name: "Sample Color Grid (4 Cars)", boxCount: 4 }]);

    // A preview finds the anchor and changes nothing; apply adds the layout's boxes as one undo step.
    const preview = json(await mcp.call("run_template_matching", { preset: "Sample Pink Anchor + Layout" }));
    expect(preview.applied).toBe(false);
    expect(preview.match.score).toBeGreaterThanOrEqual(0.85);
    expect(preview.match.layout).toBe("Sample Color Grid (4 Cars)");
    expect(await rectCount()).toBe(start);
    const applied = json(await mcp.call("run_template_matching", { preset: "Sample Pink Anchor + Layout", apply: true }));
    expect(applied.applied).toBe(true);
    expect(applied.annotationIds.length).toBeGreaterThan(0);
    expect(await rectCount()).toBe(start + applied.annotationIds.length);
    json(await mcp.call("undo"));
    expect(await rectCount()).toBe(start);

    const candidates = json(await mcp.call("run_template_matching", { preset: "Sample Pink Vehicle Finder" })).candidates;
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((item: { score: number; classId: string }) => item.score >= 0.82 && typeof item.classId === "string")).toBe(true);
    expect(textOf(await mcp.call("run_template_matching", { preset: "No such preset" }))).toMatch(/^not_found:/);

    // Inference: a model from a path; results go to the model's own label folder.
    expect(textOf(await mcp.call("load_model", { path: path.join(dataset, "sample_1.jpg") }))).toMatch(/^invalid_args:/);
    expect(textOf(await mcp.call("run_inference"))).toMatch(/^failed: Load an ONNX model first/);
    expect(json(await mcp.call("load_model", { path: path.join(path.dirname(dataset), "local.onnx") })).model).toBe("local.onnx");
    expect(json(await mcp.call("inference_status"))).toMatchObject({ ready: true, model: "local.onnx" });
    const current = json(await mcp.call("run_inference"));
    expect(current).toMatchObject({ imageCount: 1, detectionCount: 1, folderName: "inference-local", skipped: [],
      saves: [{ image: "sample_1.jpg", workflow: "detection", success: true, paths: [path.join(dataset, "inference-local", "sample_1.txt")], boxCount: 1 }] });
    expect((await readFile(path.join(dataset, "inference-local/sample_1.txt"), "utf8")).trim().split(/\s+/)).toHaveLength(5);
    expect(json(await mcp.call("run_inference", { allImages: true, confidence: 0.1 }))).toMatchObject({ imageCount: 2, folderName: "inference-local" });
    expect(errors).toEqual([]);
  } finally {
    await close();
  }
});

test("the MCP panel shows the connection, how to register each client, permissions and activity", async () => {
  test.setTimeout(180_000);
  const { page, mcp, dataset, errors, close } = await openAgentApp();
  try {
    await expect(page.locator("#agentPanelBtn")).toBeVisible();
    await page.locator("#agentPanelBtn").click();
    const panel = page.locator("#agentPanel");
    await expect(panel).toBeVisible();
    await expect(page.locator("#agentStatusLine")).toHaveAttribute("data-state", "listening");
    await expect(page.locator("#agentStatusLine")).toHaveText("Waiting for an MCP client");
    await expect(page.locator("#agentPanelBtn")).toContainText("MCP");
    // Docked beside the workspace: the canvas area ends where the panel starts, nothing slides under it.
    const [canvasArea, panelBox] = await Promise.all([page.locator(".main-container").boundingBox(), panel.boundingBox()]);
    expect(canvasArea!.x + canvasArea!.width).toBeLessThanOrEqual(panelBox!.x + 1);
    const serverPath = (await page.locator("#agentStatusLine").getAttribute("title"))!.split("\n").at(-1)!;
    expect(serverPath).toMatch(/easy-labeling-mcp\.exe$/);
    await expect(page.locator("#agentServerWarning")).toBeHidden();

    // Every client gets a snippet with the server path; Codex also gets a long tool time limit.
    await page.locator("#agentClientSelect").selectOption("codex");
    await expect(page.locator("#agentClientSnippet")).toContainText("tool_timeout_sec = 3600");
    await expect(page.locator("#agentClientSnippet")).toContainText(serverPath);
    await page.locator("#agentClientSelect").selectOption("opencode");
    await expect(page.locator("#agentClientSnippet")).toContainText('"type": "local"');
    await page.locator("#agentClientSelect").selectOption("claude-code");
    await expect(page.locator("#agentClientSnippet")).toHaveText(`claude mcp add --scope user easy-labeling -- "${serverPath}"`);

    // A call shows up as the last call (with the client's name) and in the activity list.
    json(await mcp.call("open_folder", { path: dataset }));
    json(await mcp.call("app_state"));
    await expect(page.locator("#agentStatusLine")).toContainText(/^e2e 0 · app_state \d+ s ago$/);
    await expect(page.locator("#agentActivityList li").first()).toContainText("app_state");
    await expect(page.locator("#agentActivityList li")).toHaveCount(2);

    for (const theme of ["light", "dark"]) {
      await page.evaluate((dark) => document.body.classList.toggle("dark-mode", dark), theme === "dark");
      await panel.screenshot({ path: test.info().outputPath(`agent-panel-${theme}.png`) });
      await page.screenshot({ path: test.info().outputPath(`agent-panel-window-${theme}.png`) });
    }
    await page.evaluate(() => document.body.classList.remove("dark-mode"));

    // Live view: added boxes appear one by one (30 ms each) before the call answers, then all are shown as usual.
    await page.locator("#agentLiveToggle").check();
    const liveStart = Date.now();
    const liveAdded = json(await mcp.call("add_boxes", { boxes: Array.from({ length: 20 }, (_, index) => ({ classId: 1, x0: 10 + index * 20, y0: 10, x1: 25 + index * 20, y1: 25 })) }));
    expect(Date.now() - liveStart).toBeGreaterThanOrEqual(450);
    expect(liveAdded.annotationIds).toHaveLength(20);
    expect((json(await mcp.call("get_boxes", { ids: liveAdded.annotationIds })).boxes as Array<{ hidden: boolean }>).every((box) => !box.hidden)).toBe(true);
    json(await mcp.call("undo"));
    await page.locator("#agentLiveToggle").uncheck();

    // Read-only: reading works, changes are declined.
    await page.locator("#agentChangesToggle").uncheck();
    expect(textOf(await mcp.call("go_to_image", { step: 1 }))).toMatch(/^declined: .*read-only/);
    json(await mcp.call("get_boxes"));
    await page.locator("#agentChangesToggle").check();

    // Folder-wide changes blocked: refused without a dialog, files untouched.
    await page.locator("#agentFolderSelect").selectOption("block");
    const before = await readFile(path.join(dataset, "label/sample_1.txt"), "utf8");
    expect(textOf(await mcp.call("remap_classes", { mapping: [{ from: "1", to: "5" }], dryRun: false }))).toMatch(/^declined: Folder-wide changes are blocked/);
    expect(await readFile(path.join(dataset, "label/sample_1.txt"), "utf8")).toBe(before);
    await page.locator("#agentFolderSelect").selectOption("ask");

    // Agents off: every call is declined, reads included.
    await page.locator("#agentEnabledToggle").uncheck();
    expect(textOf(await mcp.call("app_state"))).toMatch(/^declined: The person turned agent access off/);
    await page.locator("#agentEnabledToggle").check();
    json(await mcp.call("app_state"));
    await expect(page.locator("#agentActivityList li[data-ok='false']")).toHaveCount(3);

    // The settings stay after a reload.
    await page.locator("#agentChangesToggle").uncheck();
    await page.reload();
    await page.waitForFunction(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")));
    await page.locator("#agentPanelBtn").click();
    await expect(page.locator("#agentChangesToggle")).not.toBeChecked();
    await page.locator("#agentPanelCloseBtn").click();
    await expect(panel).toBeHidden();
    expect(errors).toEqual([]);
  } finally {
    await close();
  }
});

test("the person can decline what the agent asks for", async () => {
  test.setTimeout(120_000);
  const { mcp, dataset, close } = await openAgentApp({ approve: "decline" });
  try {
    expect(textOf(await mcp.call("open_folder", { path: dataset }))).toMatch(/^declined:/);
    expect(json(await mcp.call("app_state")).folder).toBeNull();
  } finally {
    await close();
  }
});

test("the MCP server exits when the app closes, so no server outlives the window", async () => {
  test.setTimeout(120_000);
  const { mcp, closeApp, close } = await openAgentApp();
  try {
    json(await mcp.call("app_state"));
    await closeApp();
    const outcome = await Promise.race([mcp.exited, new Promise((resolve) => setTimeout(() => resolve("still running"), 15_000))]);
    expect(outcome).toBe(0);
  } finally {
    await close();
  }
});

test("the MCP server answers app_not_running when no app listens", async () => {
  const mcp = startMcp(`\\\\.\\pipe\\easy-labeling-agent-nobody-${process.pid}`);
  try {
    await mcp.initialize();
    const result = await mcp.call("app_state");
    expect(result.isError).toBe(true);
    expect(textOf(result)).toMatch(/^app_not_running:/);
    // It keeps waiting for the app instead of exiting.
    expect(await Promise.race([mcp.exited, new Promise((resolve) => setTimeout(() => resolve("running"), 3_000))])).toBe("running");
  } finally {
    mcp.close();
  }
});
