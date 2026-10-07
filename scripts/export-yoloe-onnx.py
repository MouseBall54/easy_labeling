"""Developer-only export: dynamic visual samples and detection/masks without Python at runtime."""
import argparse
import hashlib
import json
import os
from pathlib import Path

import numpy as np
import onnx
import onnxruntime as ort
import torch

ROOT = Path(__file__).resolve().parents[1]
os.environ["YOLO_CONFIG_DIR"] = str(ROOT / "runtime/yoloe/.state")
os.environ["YOLO_AUTOINSTALL"] = "false"
from ultralytics import YOLOE

OUTPUT = ROOT / "assets/models/yoloe26"


class Encoder(torch.nn.Module):
    def __init__(self, model):
        super().__init__()
        self.model = model

    def forward(self, images, masks):
        return self.model.predict(images, vpe=masks, return_vpe=True)


class Detector(torch.nn.Module):
    def __init__(self, model):
        super().__init__()
        self.model = model
        head = model.model[-1]
        head.export, head.dynamic, head.format = True, True, "onnx"
        # Keep the trained inference head and dynamic class embeddings; JS filters boxes.
        head.postprocess = lambda predictions: predictions

    def forward(self, images, embeddings):
        return self.model.predict(images, vpe=embeddings)


def save_shards(filename):
    model = onnx.load(filename)
    # Each tracked file stays below GitHub's regular Git file-size limit; no LFS/downloads.
    part, offset, stream = -1, 0, None
    for tensor in model.graph.initializer:
        if not tensor.raw_data:
            continue
        size = len(tensor.raw_data)
        if stream is None or offset + size > 50_000_000:
            if stream:
                stream.close()
            part += 1
            offset = 0
            location = f"{filename.stem}-{part}.data"
            stream = filename.with_name(location).open("wb")
        stream.write(tensor.raw_data)
        onnx.external_data_helper.set_external_data(tensor, location, offset, size)
        tensor.ClearField("raw_data")
        offset += size
    if stream:
        stream.close()
    model.ir_version = 10
    onnx.save(model, filename)


def export(size):
    folder = OUTPUT / size
    folder.mkdir(parents=True, exist_ok=True)
    model = YOLOE(ROOT / f"runtime/yoloe/models/yoloe-26{size}-seg.pt").model.float().eval()
    model.fuse(verbose=False)
    image = torch.rand(1, 3, 640, 640)
    masks = torch.zeros(1, 2, 80, 80)
    masks[:, 0, 10:35, 10:35] = 1
    masks[:, 1, 40:60, 40:60] = 1
    encoder = Encoder(model).eval()
    with torch.no_grad():
        embeddings = encoder(image, masks)
    detector = Detector(model).eval()
    for name, module, inputs, input_names, output_names, dynamic in [
        ("encoder", encoder, (image, masks), ["images", "masks"], ["embeddings"],
         {"images": {2: "height", 3: "width"}, "masks": {1: "examples", 2: "mask_height", 3: "mask_width"}, "embeddings": {1: "examples"}}),
        ("detector", detector, (image, embeddings), ["images", "embeddings"], ["predictions", "prototypes"],
         {"images": {2: "height", 3: "width"}, "embeddings": {1: "examples"}, "predictions": {1: "anchors", 2: "channels"}, "prototypes": {2: "proto_height", 3: "proto_width"}}),
    ]:
        filename = folder / f"{name}.onnx"
        with torch.no_grad():
            torch.onnx.export(module, inputs, filename, input_names=input_names, output_names=output_names,
                              dynamic_axes=dynamic, opset_version=17, dynamo=False, external_data=False)
        save_shards(filename)
    encoder_session = ort.InferenceSession(str(folder / "encoder.onnx"), providers=["CPUExecutionProvider"])
    detector_session = ort.InferenceSession(str(folder / "detector.onnx"), providers=["CPUExecutionProvider"])
    checks = []
    for resolution, count in [(640, 1), (640, 3), (1024, 2), (2048, 1)]:
        image = torch.rand(1, 3, resolution, resolution)
        masks = torch.ones(1, count, resolution // 8, resolution // 8)
        with torch.no_grad():
            expected_embedding = encoder(image, masks)
            expected = detector(image, expected_embedding)
        actual_embedding = encoder_session.run(None, {"images": image.numpy(), "masks": masks.numpy()})[0]
        actual = detector_session.run(None, {"images": image.numpy(), "embeddings": actual_embedding})
        np.testing.assert_allclose(actual_embedding, expected_embedding.numpy(), atol=2e-5, rtol=2e-4)
        for value, reference in zip(actual, expected):
            np.testing.assert_allclose(value, reference.numpy(), atol=0.02, rtol=2e-4)
        checks.append({"imgsz": resolution, "examples": count, "predictions": list(actual[0].shape), "parity": "PASS"})
    files = [{"file": file.name, "bytes": file.stat().st_size, "sha256": hashlib.sha256(file.read_bytes()).hexdigest()}
             for file in sorted(folder.iterdir()) if file.suffix in (".onnx", ".data")]
    manifest = {"model": f"yoloe-26{size}-seg", "format": "onnx-visual-prompt-v1", "maskChannels": 32,
                "embeddingSize": 512, "resolutions": [640, 1024, 2048], "files": files, "parity": checks}
    (folder / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf8")
    print(json.dumps({"size": size, "bytes": sum(file["bytes"] for file in files), "checks": checks}), flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--size", choices=["n", "s", "m", "l", "all"], default="all")
    args = parser.parse_args()
    torch.set_num_threads(4)
    torch.manual_seed(0)
    for size in "nsml" if args.size == "all" else args.size:
        export(size)
