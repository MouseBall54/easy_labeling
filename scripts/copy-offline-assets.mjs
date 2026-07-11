import { access, mkdir, copyFile, cp } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(scriptPath), "..");
const fabricDistDir = path.join(rootDir, "node_modules", "fabric", "dist");

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
    from: [
      path.join(fabricDistDir, "index.min.js"),
      path.join(fabricDistDir, "fabric.min.js")
    ],
    to: path.join(rootDir, "vendor", "fabric", "fabric.min.js")
  },
  {
    from: [
      path.join(fabricDistDir, "index.min.js.map"),
      path.join(fabricDistDir, "fabric.min.js.map")
    ],
    to: path.join(rootDir, "vendor", "fabric", "index.min.js.map"),
    optional: true
  },
  {
    from: path.join(rootDir, "node_modules", "tiff.js", "tiff.min.js"),
    to: path.join(rootDir, "vendor", "tiff", "tiff.min.js")
  },
  {
    from: path.join(rootDir, "node_modules", "@techstark", "opencv-js", "dist", "opencv.js"),
    to: path.join(rootDir, "vendor", "opencv", "opencv.js")
  }
];

const directoryCopies = [
  {
    from: path.join(rootDir, "node_modules", "bootstrap-icons", "font", "fonts"),
    to: path.join(rootDir, "vendor", "bootstrap-icons", "font", "fonts")
  }
];

async function firstExistingPath(paths) {
  const candidates = Array.isArray(paths) ? paths : [paths];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
  }
  return null;
}

async function run() {
  await Promise.all(fileCopies.map(async ({ from, to, optional = false }) => {
    const source = await firstExistingPath(from);
    if (!source) {
      if (optional) {
        return;
      }
      throw new Error(`Missing required offline asset: ${Array.isArray(from) ? from.join(", ") : from}`);
    }
    await mkdir(path.dirname(to), { recursive: true });
    await copyFile(source, to);
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
