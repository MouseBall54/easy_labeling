const path = require("node:path");
const fs = require("node:fs/promises");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");

const PICK_DIRECTORY_CHANNEL = "easy-labeling:pick-directory";
const SAMPLE_DIRECTORY_CHANNEL = "easy-labeling:get-sample-directory";

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

  window.loadFile(path.resolve(__dirname, "..", "index.html"));
}

function registerIpcHandlers() {
  ipcMain.handle(PICK_DIRECTORY_CHANNEL, async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });
  ipcMain.handle(SAMPLE_DIRECTORY_CHANNEL, async () => {
    const sourcePath = path.resolve(__dirname, "..", "assets", "sample");
    const targetPath = path.join(app.getPath("userData"), "sample-test");
    await fs.mkdir(targetPath, { recursive: true });
    await fs.cp(sourcePath, targetPath, { recursive: true, force: true });
    return targetPath;
  });
}

app.whenReady().then(() => {
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
