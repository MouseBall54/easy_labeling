const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

// Exercise the production preload and file:// workers without opening dialogs or touching the user's data.
app.whenReady().then(() => {
  const pickerFolders = process.env.INFERENCE_TEST_PICKER_FOLDERS ? JSON.parse(process.env.INFERENCE_TEST_PICKER_FOLDERS) : [];
  ipcMain.handle("easy-labeling:pick-directory", () => pickerFolders.shift() ?? process.env.INFERENCE_TEST_DATASET);
  ipcMain.handle("easy-labeling:get-profile-directory", async (_event, kind) => {
    const folder = path.join(process.env.INFERENCE_TEST_DATASET, "profiles", kind);
    await fs.mkdir(folder, { recursive: true });
    return folder;
  });
  ipcMain.handle("easy-labeling:list-library-files", () => []);
  const window = new BrowserWindow({
    show: false, width: 1480, height: 940,
    webPreferences: { preload: path.join(process.env.INFERENCE_TEST_ROOT, "electron/preload.cjs"), nodeIntegration: false, contextIsolation: false, sandbox: false }
  });
  window.loadFile(path.join(process.env.INFERENCE_TEST_ROOT, "index.html"));
});
