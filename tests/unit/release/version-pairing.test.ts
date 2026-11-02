import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

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
    const [major, minor, patch] = parse(pkg.version);
    expect(json("src-tauri/tauri.yoloe.conf.json").version).toBe(`${major}.${minor + 1}.${patch}`);
  });

  it("builds the standard Tauri installer from package.json's version", () => {
    expect(json("src-tauri/tauri.conf.json").version).toBe("../package.json");
  });
});
