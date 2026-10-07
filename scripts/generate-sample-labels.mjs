import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { encodeSegmentationMaskPng } from "../dist/domain/annotations/segmentation-codec.js";

// Rebuild reviewed assets without downloading a model or requiring a GPU.
const root = fileURLToPath(new URL("../assets/sample/", import.meta.url));
const source = JSON.parse(await readFile(path.join(root, "annotations.json"), "utf8"));
await mkdir(path.join(root, "label"), { recursive: true });
await mkdir(path.join(root, "mask"), { recursive: true });
const files = source.images.map((image) => image.file);
for (const image of source.images) {
  const bytes = await readFile(path.join(root, image.file));
  if (createHash("sha256").update(bytes).digest("hex") !== image.sha256) {
    throw new Error(`Source image changed: ${image.file}`);
  }
  const mask = new Uint16Array(image.width * image.height);
  const rows = [];
  for (const object of image.objects) {
    const [x, y, width, height] = object.box;
    if (x < 0 || y < 0 || x + width > image.width || y + height > image.height
      || width <= 0 || height <= 0 || object.classId <= 0 || !source.classes[object.classId]
      || object.runs.some((run) => !Number.isInteger(run) || run < 0)
      || object.runs.reduce((sum, run) => sum + run, 0) !== width * height) {
      throw new Error(`Invalid reviewed object: ${image.file}`);
    }
    let offset = 0;
    object.runs.forEach((run, index) => {
      const end = offset + run;
      if (index % 2) {
        while (offset < end) {
          const row = Math.floor(offset / width), column = offset % width;
          const count = Math.min(end - offset, width - column);
          const target = (y + row) * image.width + x + column;
          mask.fill(object.classId, target, target + count);
          offset += count;
        }
      } else offset = end;
    });
    rows.push([object.classId, (x + width / 2) / image.width, (y + height / 2) / image.height,
      width / image.width, height / image.height].map((value, index) => index ? value.toFixed(15) : value).join(" "));
  }
  const stem = path.parse(image.file).name;
  const labelPath = `label/${stem}.txt`, maskPath = `mask/${stem}.png`;
  await writeFile(path.join(root, labelPath), `${rows.join("\n")}\n`);
  await writeFile(path.join(root, maskPath), await encodeSegmentationMaskPng({ width: image.width,
    height: image.height, mask, activeClassId: "1", activeTool: "brush", overlayVisible: true,
    overlayOpacity: 0.45, hiddenClassIds: new Set(), brushRadius: 8 }));
  files.push(labelPath, maskPath);
  console.log(`${image.file}: ${rows.length} boxes + semantic mask`);
}
await writeFile(path.join(root, "label/classes.yaml"), "# Class 0 is reserved for segmentation background.\n"
  + Object.entries(source.classes).map(([id, name]) => `${id}: ${name}`).join("\n") + "\n");

// Keep the prepared car layout and matching presets aligned with the revised class IDs/boxes.
const library = JSON.parse(await readFile(path.join(root, ".easy-labeling/automation-library.json"), "utf8"));
const cars = source.images.find((image) => image.file === "sample_1.jpg").objects;
const layout = library.layouts[0];
const nearest = (cx, cy) => cars.reduce((best, object) => {
  const distance = ([x, y, w, h]) => Math.abs(x + w / 2 - cx) + Math.abs(y + h / 2 - cy);
  return distance(object.box) < distance(best.box) ? object : best;
});
const objects = [[650, 331], [700, 331], [650, 376], [700, 376]].map(([x, y]) => nearest(x, y));
layout.sourceAnchor = { x: Math.min(...objects.map((object) => object.box[0])), y: Math.min(...objects.map((object) => object.box[1])) };
layout.boxes = objects.map((object, index) => ({ id: `sample-layout-box-${index + 1}`, classId: String(object.classId),
  relativeX: object.box[0] - layout.sourceAnchor.x, relativeY: object.box[1] - layout.sourceAnchor.y,
  width: object.box[2], height: object.box[3], order: index }));
for (const preset of library.presets) {
  preset.multipleDetection.classId = "3";
  if (preset.layoutId) {
    const template = library.templates.find((item) => item.id === preset.templateId);
    preset.relationOffset = { x: layout.sourceAnchor.x - template.roi.x, y: layout.sourceAnchor.y - template.roi.y };
  }
}
await writeFile(path.join(root, ".easy-labeling/automation-library.json"), JSON.stringify(library, null, 2) + "\n");
files.push("label/classes.yaml", "templates/pink-anchor.png", "templates/pink-vehicle.png", ".easy-labeling/automation-library.json");
await writeFile(path.join(root, "manifest.json"), JSON.stringify({ name: "Easy Labeling Sample Test", files }, null, 2) + "\n");
