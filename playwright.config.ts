import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const runtimeLibPath = path.resolve(
  ".sisyphus/runtime-libs/extracted/usr/lib/x86_64-linux-gnu"
);
const ldLibraryPath = process.env.LD_LIBRARY_PATH
  ? `${runtimeLibPath}:${process.env.LD_LIBRARY_PATH}`
  : runtimeLibPath;
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173"
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          ...(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {}),
          env: {
            ...process.env,
            LD_LIBRARY_PATH: ldLibraryPath
          }
        }
      }
    }
  ],
  webServer: {
    command: "node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    timeout: 120_000,
    reuseExistingServer: true
  }
});
