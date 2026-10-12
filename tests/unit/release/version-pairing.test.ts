import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const root = new URL("../../../", import.meta.url);
const json = (file: string) => JSON.parse(readFileSync(new URL(file, root), "utf8"));
const parse = (version: string) => version.split(".").map(Number);

describe("release versions", () => {
  const pkg = json("package.json");

  it("keeps package-lock.json in step with package.json", () => {
    const lock = json("package-lock.json");
    expect(lock.version).toBe(pkg.version);
    expect(lock.packages[""].version).toBe(pkg.version);
  });

  it("keeps the YOLOE-26 build one minor above package.json with the same patch", () => {
    const yoloe = require(fileURLToPath(new URL("electron-builder.yoloe.cjs", root)));
    const [major, minor, patch] = parse(pkg.version);
    expect(yoloe.extraMetadata.version).toBe(`${major}.${minor + 1}.${patch}`);
  });
});
