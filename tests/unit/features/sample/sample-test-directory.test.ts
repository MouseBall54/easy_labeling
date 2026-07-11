import { describe, expect, it, vi } from "vitest";

import { createBundledSampleDirectory } from "../../../../src/features/sample/sample-test-directory.js";

describe("bundled sample test directory", () => {
  it("builds nested File System Access handles and keeps writes session-local", async () => {
    const files = new Map<string, BodyInit>([
      ["https://example.test/assets/sample/manifest.json", JSON.stringify({
        name: "Sample Test",
        files: ["sample.jpg", "label/sample.txt", ".easy-labeling/automation-library.json"]
      })],
      ["https://example.test/assets/sample/sample.jpg", new Uint8Array([1, 2, 3])],
      ["https://example.test/assets/sample/label/sample.txt", "0 0.5 0.5 0.1 0.1\n"],
      ["https://example.test/assets/sample/.easy-labeling/automation-library.json", "{\"schemaVersion\":2}"]
    ]);
    const fetchRef = vi.fn(async (input: string | URL | Request) => {
      const body = files.get(String(input));
      return body === undefined ? new Response("missing", { status: 404 }) : new Response(body, { status: 200 });
    });

    const root = await createBundledSampleDirectory({
      baseUrl: new URL("https://example.test/assets/sample/"),
      fetchRef: fetchRef as typeof fetch
    });

    const entries: string[] = [];
    for await (const entry of root.values()) {
      entries.push(`${entry.kind}:${entry.name}`);
    }
    expect(entries).toEqual(["file:sample.jpg", "directory:label", "directory:.easy-labeling"]);

    const labelDirectory = await root.getDirectoryHandle("label");
    const labelFile = await labelDirectory.getFileHandle("sample.txt");
    expect(await (await labelFile.getFile()).text()).toContain("0 0.5 0.5");
    const writable = await labelFile.createWritable();
    await writable.write("2 0.2 0.3 0.1 0.1");
    await writable.close();
    expect(await (await labelFile.getFile()).text()).toBe("2 0.2 0.3 0.1 0.1");
    expect(files.get("https://example.test/assets/sample/label/sample.txt")).toContain("0 0.5");

    const automation = await root.getDirectoryHandle(".easy-labeling");
    expect(await (await (await automation.getFileHandle("automation-library.json")).getFile()).text()).toContain("schemaVersion");
  });
});
