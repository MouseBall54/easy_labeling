import { describe, expect, it } from "vitest";

import { createSegmentationAnnotationCodec } from "../../../../src/domain/annotations/segmentation-codec.js";

describe("domain/annotations/segmentation-codec", () => {
  it("round-trips segmentation snapshot through png and metadata assets", () => {
    const codec = createSegmentationAnnotationCodec();
    const snapshot = {
      width: 2,
      height: 2,
      mask: new Uint16Array([0, 12, 34, 0]),
      activeClassId: "34",
      activeTool: "erase" as const,
      overlayVisible: false,
      overlayOpacity: 0.25,
      hiddenClassIds: new Set<string>(["12"]),
      brushRadius: 3
    };

    const assets = codec.encode({ imageBaseName: "scene-a", snapshot });
    expect(assets[0]).toMatchObject({ path: "mask/scene-a.png" });
    expect(assets[1]).toMatchObject({ path: "mask/scene-a.seg.json" });

    const decoded = codec.decode({
      imageBaseName: "scene-a",
      pngBytes: assets[0]?.content as ArrayBuffer,
      metadataText: assets[1]?.content as string
    });

    expect(decoded.data.snapshot).toEqual(snapshot);
  });

  it("degrades safely when metadata text is missing", () => {
    const codec = createSegmentationAnnotationCodec();
    const assets = codec.encode({
      imageBaseName: "scene-b",
      snapshot: {
        width: 1,
        height: 2,
        mask: new Uint16Array([0, 7]),
        activeClassId: "7",
        activeTool: "brush",
        overlayVisible: true,
        overlayOpacity: 0.9,
        hiddenClassIds: new Set<string>(),
        brushRadius: 5
      }
    });

    const decoded = codec.decode({
      imageBaseName: "scene-b",
      pngBytes: assets[0]?.content as ArrayBuffer,
      metadataText: null
    });

    expect(decoded.data.snapshot.activeClassId).toBe("1");
    expect(decoded.data.snapshot.activeTool).toBe("brush");
    expect(decoded.data.snapshot.overlayVisible).toBe(true);
    expect(decoded.data.snapshot.overlayOpacity).toBe(0.6);
    expect(decoded.data.snapshot.mask).toEqual(new Uint16Array([0, 7]));
  });
});
