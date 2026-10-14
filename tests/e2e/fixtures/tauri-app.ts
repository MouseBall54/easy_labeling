import { chromium, type Browser, type Page } from "@playwright/test";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";

// Starts a Tauri build of the app with WebView2's CDP port open and test seams set (folder picker
// answers, profile folder, isolated WebView2 data), then attaches Playwright to its page.
export interface DesktopApp {
  page: Page;
  close(): Promise<void>;
}

let nextPort = 9400 + Math.floor(Math.random() * 400);

export async function launchDesktop(exe: string, sandbox: string, pickDirectories: string[]): Promise<DesktopApp> {
  const port = nextPort++;
  const child: ChildProcess = spawn(exe, [], {
    env: {
      ...process.env,
      WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${port} ${process.env.EASY_LABELING_TEST_WEBVIEW_ARGS ?? ""}`.trim(),
      WEBVIEW2_USER_DATA_FOLDER: path.join(sandbox, "webview"),
      APPDATA: path.join(sandbox, "appdata"),
      EASY_LABELING_TEST_PROFILE_ROOT: path.join(sandbox, "profiles"),
      EASY_LABELING_TEST_PICK_DIRECTORIES: pickDirectories.join(";")
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
    async close() {
      await browser?.close().catch(() => undefined);
      spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
      await new Promise((resolve) => child.once("exit", resolve));
    }
  };
}

