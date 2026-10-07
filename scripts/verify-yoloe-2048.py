"""Check existing dynamic ONNX models at 2048 without re-exporting their weights."""
import gc
import importlib.util
import json
from pathlib import Path

import numpy as np
import onnxruntime as ort
import torch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("yoloe_export", ROOT / "scripts/export-yoloe-onnx.py")
exporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)
checks = []
torch.manual_seed(2048)
torch.set_num_threads(4)
device = "cuda" if torch.cuda.is_available() else "cpu"

for size in "nsml":
    model = exporter.YOLOE(ROOT / f"runtime/yoloe/models/yoloe-26{size}-seg.pt").model.float().eval()
    model.fuse(verbose=False)
    model.to(device)
    encoder = exporter.Encoder(model).eval()
    detector = exporter.Detector(model).eval()
    images = torch.rand(1, 3, 2048, 2048, device=device)
    masks = torch.zeros(1, 1, 256, 256, device=device)
    masks[:, :, 90:110, 40:60] = 1
    with torch.no_grad():
        expected_embedding = encoder(images, masks)
        expected = detector(images, expected_embedding)
    folder = ROOT / f"assets/models/yoloe26/{size}"
    options = ort.SessionOptions()
    options.intra_op_num_threads = 4
    encoder_session = ort.InferenceSession(str(folder / "encoder.onnx"), options, providers=["CPUExecutionProvider"])
    detector_session = ort.InferenceSession(str(folder / "detector.onnx"), options, providers=["CPUExecutionProvider"])
    actual_embedding = encoder_session.run(None, {"images": images.cpu().numpy(), "masks": masks.cpu().numpy()})[0]
    actual = detector_session.run(None, {"images": images.cpu().numpy(), "embeddings": actual_embedding})
    np.testing.assert_allclose(actual_embedding, expected_embedding.cpu().numpy(), atol=2e-5, rtol=2e-4)
    for value, reference in zip(actual, expected):
        np.testing.assert_allclose(value, reference.cpu().numpy(), atol=0.02, rtol=2e-4)
    assert actual[0].shape == (1, 37, 86016)
    assert actual[1].shape == (1, 32, 512, 512)
    check = {"size": size, "imgsz": 2048, "examples": 1, "predictions": list(actual[0].shape), "parity": "PASS"}
    checks.append(check)
    print(json.dumps(check), flush=True)
    del model, encoder, detector, images, masks, expected_embedding, expected, actual_embedding, actual, encoder_session, detector_session
    gc.collect()
    if device == "cuda":
        torch.cuda.empty_cache()

# Record the new supported resolution only after every model passes.
for check in checks:
    manifest_path = ROOT / f"assets/models/yoloe26/{check['size']}/manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest["resolutions"] = [640, 1024, 2048]
    manifest["parity"] = [entry for entry in manifest["parity"] if entry["imgsz"] != 2048]
    manifest["parity"].append({key: value for key, value in check.items() if key != "size"})
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
output = ROOT / "output/yoloe-brush-boundary"
output.mkdir(parents=True, exist_ok=True)
(output / "2048-model-parity.json").write_text(json.dumps(checks, indent=2) + "\n", encoding="utf-8")
