import { chromium, type Browser, type Page } from "@playwright/test";
import { spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// Starts a Tauri build of the app with WebView2's CDP port open and test seams set (folder picker
// answers, profile folder, isolated WebView2 data), then attaches Playwright to its page.
export interface DesktopApp {
  page: Page;
  /** The app's process id (its WebView2 processes run under it). */
  pid: number;
  close(): Promise<void>;
}

export interface DesktopOptions {
  /** Extra environment variables, e.g. EASY_LABELING_TEST_PICK_FILE (answers the library file dialogs). */
  env?: Record<string, string>;
  /** Extra WebView2 (Chromium) switches, e.g. --disable-gpu. */
  browserArgs?: string[];
}

let nextPort = 9400 + Math.floor(Math.random() * 400);
const throttleFlags = "--disable-renderer-backgrounding --disable-background-timer-throttling --disable-backgrounding-occluded-windows";

export async function launchDesktop(exe: string, sandbox: string, pickDirectories: string[], options: DesktopOptions = {}): Promise<DesktopApp> {
  const port = nextPort++;
  const child: ChildProcess = spawn(exe, [], {
    env: {
      ...process.env,
      // The test window often sits behind others; keep WebView2 from throttling it like a background window.
      WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${port} ${throttleFlags} ${(options.browserArgs ?? []).join(" ")}`.trim(),
      WEBVIEW2_USER_DATA_FOLDER: path.join(sandbox, "webview"),
      APPDATA: path.join(sandbox, "appdata"),
      EASY_LABELING_TEST_PROFILE_ROOT: path.join(sandbox, "profiles"),
      EASY_LABELING_TEST_PICK_DIRECTORIES: pickDirectories.join(";"),
      ...options.env
    },
    stdio: "ignore"
  });
  let browser: Browser | null = null;
  for (let attempt = 0; attempt < 100 && !browser; attempt += 1) {
    try {
      browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  if (!browser) {
    child.kill();
    throw new Error("Tauri WebView2 did not open its debugging port.");
  }
  const context = browser.contexts()[0];
  const page = context.pages()[0] ?? await context.waitForEvent("page");
  await page.waitForFunction(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")));
  return {
    page,
    pid: child.pid!,
    async close() {
      await browser?.close().catch(() => undefined);
      spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
      await new Promise((resolve) => child.once("exit", resolve));
    }
  };
}

/** The desktop executable the specs drive: `npm run tauri:dev` builds it (with a fresh dist/), or set EASY_LABELING_TAURI_EXE. */
export const desktopExe = process.env.EASY_LABELING_TAURI_EXE ?? path.resolve("target/debug/Easy Labeling.exe");

/**
 * launchDesktop(desktopExe) with its WebView2 data and profile libraries in a temporary sandbox that close() deletes.
 * `profiles` is the profile root: a kind's folder is its display name ("Class Info", "Layouts", ...).
 */
export async function openDesktop(pickDirectories: string[]): Promise<DesktopApp & { profiles: string }> {
  const sandbox = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-desktop-"));
  const app = await launchDesktop(desktopExe, sandbox, pickDirectories);
  return {
    ...app,
    profiles: path.join(sandbox, "profiles"),
    async close() {
      await app.close();
      await rm(sandbox, { recursive: true, force: true, maxRetries: 40, retryDelay: 250 });
    }
  };
}
