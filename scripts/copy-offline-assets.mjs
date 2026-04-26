import { mkdir, copyFile, cp } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(scriptPath), "..");

const fileCopies = [
  {
    from: path.join(rootDir, "node_modules", "bootstrap", "dist", "css", "bootstrap.min.css"),
    to: path.join(rootDir, "vendor", "bootstrap", "css", "bootstrap.min.css")
  },
  {
    from: path.join(rootDir, "node_modules", "bootstrap", "dist", "css", "bootstrap.min.css.map"),
    to: path.join(rootDir, "vendor", "bootstrap", "css", "bootstrap.min.css.map")
  },
  {
    from: path.join(rootDir, "node_modules", "bootstrap", "dist", "js", "bootstrap.bundle.min.js"),
    to: path.join(rootDir, "vendor", "bootstrap", "js", "bootstrap.bundle.min.js")
  },
  {
    from: path.join(rootDir, "node_modules", "bootstrap", "dist", "js", "bootstrap.bundle.min.js.map"),
    to: path.join(rootDir, "vendor", "bootstrap", "js", "bootstrap.bundle.min.js.map")
  },
  {
    from: path.join(rootDir, "node_modules", "bootstrap-icons", "font", "bootstrap-icons.min.css"),
    to: path.join(rootDir, "vendor", "bootstrap-icons", "font", "bootstrap-icons.min.css")
  },
  {
    from: path.join(rootDir, "node_modules", "fabric", "dist", "index.min.js"),
    to: path.join(rootDir, "vendor", "fabric", "fabric.min.js")
  },
  {
    from: path.join(rootDir, "node_modules", "fabric", "dist", "index.min.js.map"),
    to: path.join(rootDir, "vendor", "fabric", "index.min.js.map")
  },
  {
    from: path.join(rootDir, "node_modules", "tiff.js", "tiff.min.js"),
    to: path.join(rootDir, "vendor", "tiff", "tiff.min.js")
  }
];

const directoryCopies = [
  {
    from: path.join(rootDir, "node_modules", "bootstrap-icons", "font", "fonts"),
    to: path.join(rootDir, "vendor", "bootstrap-icons", "font", "fonts")
  }
];

async function run() {
  await Promise.all(fileCopies.map(async ({ from, to }) => {
    await mkdir(path.dirname(to), { recursive: true });
    await copyFile(from, to);
  }));

  await Promise.all(directoryCopies.map(async ({ from, to }) => {
    await mkdir(path.dirname(to), { recursive: true });
    await cp(from, to, { recursive: true, force: true });
  }));
}

run().catch((error) => {
  console.error("[copy-offline-assets] failed:", error);
  process.exitCode = 1;
});
