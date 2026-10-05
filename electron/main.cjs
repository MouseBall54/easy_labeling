const path = require("node:path");
const fs = require("node:fs/promises");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { createWindowCloseController } = require("./window-close-controller.cjs");

const PICK_DIRECTORY_CHANNEL = "easy-labeling:pick-directory";
const SAMPLE_DIRECTORY_CHANNEL = "easy-labeling:get-sample-directory";
const OPEN_LIBRARY_FILE_CHANNEL = "easy-labeling:open-library-file";
const SAVE_LIBRARY_FILE_CHANNEL = "easy-labeling:save-library-file";
const LIST_LIBRARY_FILES_CHANNEL = "easy-labeling:list-library-files";
const GET_PROFILE_DIRECTORY_CHANNEL = "easy-labeling:get-profile-directory";
const DOCUMENT_DIRTY_CHANNEL = "easy-labeling:set-document-dirty";

const PROFILE_DIRECTORY_NAMES = {
  preset: "Template Presets",
  layout: "Layouts",
  yoloe: "YOLOE Presets",
  "class-info": "Class Info"
};

function requireProfileDirectoryKind(kind) {
  if (!Object.hasOwn(PROFILE_DIRECTORY_NAMES, kind)) {
    throw new TypeError(`Unsupported profile directory kind: ${String(kind)}`);
  }
  return kind;
}

async function ensureProfileDirectory(kind) {
  const safeKind = requireProfileDirectoryKind(kind);
  const directoryPath = path.join(
    app.getPath("documents"),
    "Easy Labeling",
    PROFILE_DIRECTORY_NAMES[safeKind]
  );
  await fs.mkdir(directoryPath, { recursive: true });
  return directoryPath;
}

async function resolveBundledDirectory(...segments) {
  const unpackedPath = path.join(process.resourcesPath, "app.asar.unpacked", ...segments);
  try {
    await fs.access(unpackedPath);
    return unpackedPath;
  } catch {
    return path.resolve(__dirname, "..", ...segments);
  }
}

function sanitizeSuggestedFileName(fileName) {
  const safeName = path.basename(String(fileName || "easy-labeling.json"))
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "-");
  return safeName.toLowerCase().endsWith(".json") ? safeName : `${safeName}.json`;
}

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 1080,
    minHeight: 720,
    autoHideMenuBar: true,
    icon: path.resolve(__dirname, "..", "assets", "icons", "easy-labeling.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: false,
      sandbox: false
    }
  });

  const closeController = createWindowCloseController(window, dialog);
  const updateDirtyState = (event, hasUnsavedChanges) => {
    if (event.sender === window.webContents) {
      closeController.setHasUnsavedChanges(hasUnsavedChanges);
    }
  };
  ipcMain.on(DOCUMENT_DIRTY_CHANNEL, updateDirtyState);
  window.on("closed", () => {
    ipcMain.removeListener(DOCUMENT_DIRTY_CHANNEL, updateDirtyState);
  });

  window.loadFile(path.resolve(__dirname, "..", "index.html"));
}

function registerIpcHandlers() {
  ipcMain.handle("easy-labeling:get-gpu-name", async (_event, vendor, device) => {
    const vendorId = { nvidia: 0x10de, amd: 0x1002, intel: 0x8086, qualcomm: 0x5143, apple: 0x106b }[String(vendor).toLowerCase()];
    if (!vendorId) return null;
    const info = await app.getGPUInfo("complete");
    const deviceId = typeof device === "string" && /^0x[\da-f]+$/i.test(device) ? Number.parseInt(device, 16) : null;
    const matches = (info.gpuDevice ?? []).filter((gpu) => gpu.vendorId === vendorId && (deviceId === null || gpu.deviceId === deviceId));
    return matches.length === 1 ? matches[0].deviceString || null : null;
  });
  ipcMain.handle(PICK_DIRECTORY_CHANNEL, async (_event, options = {}) => {
    const defaultPath = options.id === "class-info"
      ? await ensureProfileDirectory("class-info")
      : undefined;
    const result = await dialog.showOpenDialog({
      defaultPath,
      properties: ["openDirectory", "createDirectory"]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });
  ipcMain.handle(GET_PROFILE_DIRECTORY_CHANNEL, async (_event, kind) => {
    return await ensureProfileDirectory(kind);
  });
  ipcMain.handle(SAMPLE_DIRECTORY_CHANNEL, async () => {
    const sourcePath = await resolveBundledDirectory("assets", "sample");
    const targetPath = path.join(app.getPath("userData"), "sample-test");
    await fs.mkdir(targetPath, { recursive: true });
    await fs.cp(sourcePath, targetPath, { recursive: true, force: true });
    return targetPath;
  });
  ipcMain.handle(OPEN_LIBRARY_FILE_CHANNEL, async (_event, kind) => {
    const directoryPath = await ensureProfileDirectory(kind);
    const result = await dialog.showOpenDialog({
      defaultPath: directoryPath,
      properties: ["openFile"],
      filters: [{ name: "Easy Labeling JSON", extensions: ["json"] }]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    const filePath = result.filePaths[0];
    return {
      filePath,
      name: path.basename(filePath),
      contents: await fs.readFile(filePath, "utf8")
    };
  });
  ipcMain.handle(LIST_LIBRARY_FILES_CHANNEL, async (_event, kind) => {
    const directoryPath = await ensureProfileDirectory(kind);
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    const fileNames = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }));
    return await Promise.all(fileNames.map(async (name) => {
      const filePath = path.join(directoryPath, name);
      return {
        filePath,
        name,
        contents: await fs.readFile(filePath, "utf8")
      };
    }));
  });
  ipcMain.handle(SAVE_LIBRARY_FILE_CHANNEL, async (_event, options) => {
    if (!options || typeof options.contents !== "string") {
      throw new TypeError("Library file contents must be text");
    }
    const directoryPath = await ensureProfileDirectory(options.kind);
    const defaultPath = path.join(directoryPath, sanitizeSuggestedFileName(options.suggestedName));
    if (options.kind === "yoloe" && !options.saveAs) {
      const filePath = options.filePath || defaultPath;
      await fs.writeFile(filePath, options.contents, "utf8");
      return { filePath };
    }
    const result = await dialog.showSaveDialog({
      defaultPath: options.kind === "yoloe" && options.filePath ? options.filePath : defaultPath,
      filters: [{ name: "Easy Labeling JSON", extensions: ["json"] }]
    });
    if (result.canceled || !result.filePath) {
      return null;
    }
    await fs.writeFile(result.filePath, options.contents, "utf8");
    return { filePath: result.filePath };
  });
}

app.whenReady().then(() => {
  if (require("../package.json").name === "easy-labeling-yoloe26") {
    ipcMain.handle("easy-labeling:read-yoloe-model", (_event, file) => {
      if (typeof file !== "string" || !/^[nsml]\/(manifest\.json|encoder\.onnx|detector\.onnx|(encoder|detector)-\d+\.data)$/.test(file)) throw new TypeError("Invalid bundled YOLOE model file.");
      return fs.readFile(path.join(process.resourcesPath, "yoloe26", file));
    });
  }
  registerIpcHandlers();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
