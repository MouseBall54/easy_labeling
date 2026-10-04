import hashlib
import json
import shutil
import time
from pathlib import Path

import onnx
import onnxruntime as ort
from ultralytics import YOLO

root = Path(r"C:\Git\ym_yolo")
output = Path(__file__).parent
jobs = [
    ("smoke_1ch", root / "results/exports/detect/smoke/best.onnx", 128, root / "datasets/example_detect/images/val", root / "datasets/example_detect/labels/val", "target"),
    ("cells_1ch_w0844", root / "results/benchmarks/widths_20261003/w0844_repeat1/training/weights/best.pt", 640, root / "datasets/synthetic_cells/images/test", root / "datasets/synthetic_cells/labels/test", "cell"),
    ("cells_3ch", root / "results/benchmarks/yolo26m_entrypoints_20261002/repeat1_3ch/training/weights/best.pt", 640, root / "datasets/synthetic_cells/images/test", root / "datasets/synthetic_cells/labels/test", "cell"),
]
manifest = []
for name, source, size, images, labels, class_name in jobs:
    started = time.perf_counter()
    folder = output / "models" / name
    folder.mkdir(parents=True, exist_ok=True)
    if source.suffix == ".onnx":
        model_path = folder / "best.onnx"
        shutil.copy2(source, model_path)
    else:
        checkpoint = folder / "best.pt"
        shutil.copy2(source, checkpoint)
        model_path = Path(YOLO(str(checkpoint)).export(format="onnx", device="cpu", imgsz=size, batch=1, dynamic=False, quantize=32, nms=None, simplify=False, opset=18))
    onnx.checker.check_model(onnx.load(model_path))
    session = ort.InferenceSession(str(model_path), providers=["CPUExecutionProvider"])
    entry = {
        "name": name, "source": str(source), "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "model": str(model_path), "modelSha256": hashlib.sha256(model_path.read_bytes()).hexdigest(),
        "modelBytes": model_path.stat().st_size, "images": str(images), "labels": str(labels),
        "className": class_name, "size": size,
        "inputs": [{"name": x.name, "shape": x.shape, "type": x.type} for x in session.get_inputs()],
        "outputs": [{"name": x.name, "shape": x.shape, "type": x.type} for x in session.get_outputs()],
        "metadata": session.get_modelmeta().custom_metadata_map, "exportSeconds": time.perf_counter() - started,
    }
    manifest.append(entry)
    (output / "models.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"READY: {name} {entry['inputs']} -> {entry['outputs']}", flush=True)
    del session
