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
    command: "CHOKIDAR_USEPOLLING=1 node --input-type=commonjs -e \"require('./node_modules/live-server').start({ root: '.', host: '127.0.0.1', port: 4173, open: false, logLevel: 0, watch: ['index.html', 'css', 'dist', 'privacy.html'], ignore: ['node_modules', '.git', '.sisyphus'] })\"",
    url: "http://127.0.0.1:4173",
    timeout: 120_000,
    reuseExistingServer: true
  }
});
