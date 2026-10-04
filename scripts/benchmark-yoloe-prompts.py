"""Small calibration experiment, not a production accuracy benchmark."""
import json
import runpy
import sys
from pathlib import Path

import cv2
import numpy as np
import torch
from PIL import Image
from torchvision.ops import batched_nms

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "runtime/yoloe"))
from backend import ROOT, MaskPromptPredictor, visual_prompts
from ultralytics import YOLOE
from ultralytics.models.yolo.yoloe import YOLOEVPDetectPredictor
helpers = runpy.run_path(str(Path(__file__).with_name("verify-yoloe-cells.py")))
truth_boxes, iou = helpers["truth_boxes"], helpers["iou"]


def examples_for(dataset, path, count):
    image = Image.open(path).convert("RGB")
    truth = truth_boxes(dataset / "labels/test" / (path.stem + ".txt"), *image.size)
    _, components, stats, _ = cv2.connectedComponentsWithStats((np.array(Image.open(dataset / "masks/test" / path.name)) > 0).astype(np.uint8))
    examples = []
    for box in truth[:count]:
        index = max(range(1, len(stats)), key=lambda i: iou(box, [*stats[i, :2], stats[i, 0] + stats[i, 2], stats[i, 1] + stats[i, 3]]))
        x, y, w, h = map(int, stats[index, :4])
        pixels = (components[y:y + h, x:x + w] == index).ravel().astype(np.uint8)
        starts = np.r_[0, np.flatnonzero(pixels[1:] != pixels[:-1]) + 1]
        examples.append({"classId": 1, "name": "cell", "box": [x, y, x + w, y + h], "mask": {"width": w, "height": h, "runs": np.column_stack((pixels[starts], np.diff(np.r_[starts, pixels.size]))).ravel().tolist()}})
    return image, examples


def main():
    dataset = Path(r"C:\Git\ym_yolo\datasets\synthetic_cells")
    files = sorted((dataset / "images/test").glob("*.png"))[:3]
    model = YOLOE(ROOT / "models/yoloe-26s-seg.pt")
    evidence = {"dataset": str(dataset), "reference": files[0].name, "boundary": "3 calibration images; reference included, not a held-out production evaluation", "cases": []}
    for strategy, size, count, prompt in [("union", 640, 3, "mask"), ("union", 1024, 3, "mask"), ("mean", 640, 3, "mask"), ("separate", 640, 3, "mask"), ("separate", 1024, 3, "mask"), ("separate", 1024, 8, "mask"), ("separate", 1024, 3, "box")]:
        image, examples = examples_for(dataset, files[0], count)
        if prompt == "box":
            for example in examples:
                del example["mask"]
        prompts, _, _ = visual_prompts(examples, *image.size)
        if strategy != "union":
            prompts["cls"] = np.arange(len(examples))
        predictor_type = MaskPromptPredictor if prompt == "mask" else YOLOEVPDetectPredictor
        predictor = predictor_type(overrides={"task": "segment", "mode": "predict", "device": 0, "imgsz": size, "verbose": False, "save": False})
        predictor.set_prompts(prompts)
        predictor.setup_model(model=model.model, verbose=False)
        embeddings = predictor.get_vpe(image)
        if strategy == "mean":
            embeddings = torch.nn.functional.normalize(embeddings.mean(1, keepdim=True), dim=-1)
        model.set_classes([f"cell-{i}" for i in range(embeddings.shape[1])], embeddings)
        for confidence in [0.25, 0.05]:
            case = {"strategy": strategy, "imgsz": size, "examples": count, "prompt": prompt, "confidence": confidence, "images": []}
            for path in files:
                image = Image.open(path).convert("RGB")
                result = model.predict(image, device=0, imgsz=size, conf=confidence, iou=0.45, max_det=300, retina_masks=True, verbose=False)[0]
                rows = result.boxes.data
                keep = batched_nms(rows[:, :4], rows[:, 4], torch.zeros(len(rows), device=rows.device), 0.45)
                boxes = rows[keep].detach().cpu().tolist()
                labels = truth_boxes(dataset / "labels/test" / (path.stem + ".txt"), *image.size)
                used = set()
                for box in boxes:
                    matches = [(iou(box[:4], label), i) for i, label in enumerate(labels) if i not in used]
                    if matches:
                        score, index = max(matches)
                        if score >= 0.5:
                            used.add(index)
                pixels = np.zeros((image.height, image.width), dtype=bool)
                if result.masks is not None:
                    pixels = (result.masks.data[keep] > 0).any(0).cpu().numpy()
                truth = np.array(Image.open(dataset / "masks/test" / path.name)) > 0
                tp = int((pixels & truth).sum()); fp = int((pixels & ~truth).sum()); fn = int((~pixels & truth).sum())
                case["images"].append({"name": path.name, "tp": len(used), "fp": len(boxes) - len(used), "fn": len(labels) - len(used), "pixelTp": tp, "pixelFp": fp, "pixelFn": fn})
            evidence["cases"].append(case)
            print(json.dumps(case), flush=True)
    output = Path(__file__).resolve().parents[1] / "output/yoloe-validation/prompt-calibration.json"
    output.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
