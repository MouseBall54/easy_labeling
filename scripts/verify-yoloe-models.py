"""Smoke-test n/s/m/l on CUDA and n on CPU with real weights in both workflows."""
import base64
import gc
import io
import json
import sys
from pathlib import Path
from unittest.mock import patch

from PIL import Image
import torch

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT / "runtime/yoloe"))
from backend import Runtime, device_status


def main():
    source = Path(r"C:\Git\ym_yolo\datasets\synthetic_cells\images\test\cell_0016.png")
    with Image.open(source) as image:
        width, height = image.size
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
    encoded = "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode()
    _, x, y, w, h = map(float, source.parents[2].joinpath("labels/test", source.stem + ".txt").read_text().splitlines()[0].split())
    box = [(x - w / 2) * width, (y - h / 2) * height, (x + w / 2) * width, (y + h / 2) * height]
    example = {"classId": 7, "name": "cell", "box": box, "polygon": [[box[0], box[1]], [box[2], box[1]], [box[2], box[3]], [box[0], box[3]]]}
    hardware = device_status()
    evidence = {"hardware": hardware, "image": str(source), "checks": []}
    for backend in (["cuda", "cpu"] if hardware["cuda"] else ["cpu"]):
        for size in ("nsml" if backend == "cuda" else "n"):
            for workflow in ("detection", "segmentation"):
                runtime = Runtime()
                # Exercise the no-GPU path on this GPU-equipped machine; computation really runs on CPU.
                with patch("torch.cuda.is_available", return_value=backend == "cuda"):
                    profile = runtime.prepare({**({"model": f"yoloe-26{size}-seg"} if backend == "cuda" else {}), "image": encoded, "examples": [example], "workflow": workflow})
                    assert profile["model"] == f"yoloe-26{size}-seg"
                    result = runtime.infer({"profileId": profile["id"], "image": encoded, "confidence": 0.05, "iou": 0.45})
                    device = next(runtime.model.predictor.model.model.parameters()).device.type
                    assert device == backend and profile["backend"] == backend
                assert result["backend"] == backend
                assert all(row["classId"] == 7 for row in result["detections"])
                if workflow == "segmentation":
                    assert (result["mask"]["width"], result["mask"]["height"]) == (width, height)
                    assert sum(result["mask"]["runs"][1::2]) == width * height
                else:
                    assert result["mask"] is None
                row = {"model": profile["model"], "workflow": workflow, "backend": backend, "tensorDevice": device, "detections": len(result["detections"]), "elapsedMs": result["elapsedMs"], "mask": result["mask"] is not None, "pass": True}
                evidence["checks"].append(row)
                print(json.dumps(row), flush=True)
                del runtime
                gc.collect()
                if hardware["cuda"]:
                    torch.cuda.empty_cache()
    target = PROJECT / "output/yoloe-validation/model-sizes-cpu-gpu.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(evidence, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
