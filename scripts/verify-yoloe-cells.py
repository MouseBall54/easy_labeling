"""Measure visual prompting on the existing synthetic-cell dataset; do not modify it."""
import argparse
import base64
import io
import json
import urllib.request
from pathlib import Path

from PIL import Image


def image_data(path):
    with Image.open(path) as image:
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode(), image.size


def request(route, payload):
    return json.load(urllib.request.urlopen(urllib.request.Request(
        "http://127.0.0.1:8766/" + route, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}), timeout=120))


def truth_boxes(path, width, height):
    result = []
    for row in path.read_text().splitlines():
        if not row.strip():
            continue
        _, x, y, w, h = map(float, row.split())
        result.append([(x - w / 2) * width, (y - h / 2) * height,
                       (x + w / 2) * width, (y + h / 2) * height])
    return result


def iou(a, b):
    overlap = max(0, min(a[2], b[2]) - max(a[0], b[0])) * max(0, min(a[3], b[3]) - max(a[1], b[1]))
    area = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - overlap
    return overlap / area if area else 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", type=Path, default=Path(r"C:\Git\ym_yolo\datasets\synthetic_cells"))
    args = parser.parse_args()
    files = sorted((args.dataset / "images/test").glob("*.png"))[:3]
    if len(files) < 3:
        raise RuntimeError("Three test images are required.")
    reference, size = image_data(files[0])
    truth = truth_boxes(args.dataset / "labels/test" / (files[0].stem + ".txt"), *size)
    examples = [{"classId": 0, "name": "cell", "box": box} for box in truth[:3]]
    profile = request("prepare", {"model": "yoloe-26s-seg", "image": reference, "examples": examples})
    evidence = {"reference": files[0].name, "exampleCount": len(examples), "gpu": profile["gpu"],
                "confidence": 0.25, "matchIou": 0.5, "images": []}
    for file in files:
        image, size = image_data(file)
        labels = truth_boxes(args.dataset / "labels/test" / (file.stem + ".txt"), *size)
        result = request("infer", {"profileId": profile["id"], "image": image, "confidence": 0.25, "iou": 0.45})
        used = set()
        for detection in sorted(result["detections"], key=lambda box: box["confidence"], reverse=True):
            box = [detection[key] for key in ("left", "top", "right", "bottom")]
            candidates = [(iou(box, label), index) for index, label in enumerate(labels) if index not in used]
            if candidates:
                score, index = max(candidates)
                if score >= 0.5:
                    used.add(index)
        count = len(result["detections"])
        evidence["images"].append({"name": file.name, "truth": len(labels), "detections": count,
                                   "tp": len(used), "fp": count - len(used), "fn": len(labels) - len(used),
                                   "elapsedMs": result["elapsedMs"]})
    output = Path(__file__).resolve().parent.parent / "output/yoloe-validation"
    output.mkdir(parents=True, exist_ok=True)
    (output / "cells.json").write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(evidence, indent=2))


if __name__ == "__main__":
    main()
