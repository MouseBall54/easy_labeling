import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const runtimeLibPath = path.resolve(
  ".sisyphus/runtime-libs/extracted/usr/lib/x86_64-linux-gnu"
);
const ldLibraryPath = process.env.LD_LIBRARY_PATH
  ? `${runtimeLibPath}:${process.env.LD_LIBRARY_PATH}`
  : runtimeLibPath;

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: "http://127.0.0.1:4173"
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          env: {
            ...process.env,
            LD_LIBRARY_PATH: ldLibraryPath
          }
        }
      }
    }
  ],
  webServer: {
    command: "node node_modules/live-server/live-server.js --host=127.0.0.1 --port=4173 --quiet --no-browser",
    url: "http://127.0.0.1:4173",
    timeout: 120_000,
    reuseExistingServer: true
  }
});
