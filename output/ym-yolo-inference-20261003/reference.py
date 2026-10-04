"""Independent Python ONNX Runtime + the project's Ultralytics preprocessing/NMS reference."""
import json
import sys
import time
from pathlib import Path

import cv2
import numpy as np
import onnxruntime as ort
import torch
from ultralytics.data.augment import LetterBox
from ultralytics.utils.nms import non_max_suppression
from ultralytics.utils.ops import scale_boxes

output = Path(__file__).parent
project = Path(r"C:\Git\ym_yolo")
sys.path.insert(0, str(project))
from tools.common import read_gray

torch.set_num_threads(1)
results = []
for job in json.loads((output / "models.json").read_text(encoding="utf-8")):
    options = ort.SessionOptions()
    options.intra_op_num_threads = 1
    options.inter_op_num_threads = 1
    session = ort.InferenceSession(job["model"], sess_options=options, providers=["CPUExecutionProvider"])
    channels = session.get_inputs()[0].shape[1]
    rows = []
    for file in sorted(Path(job["images"]).glob("*.png")):
        image = read_gray(file)
        height, width = image.shape
        source = image[..., None] if channels == 1 else np.repeat(image[..., None], 3, axis=2)
        resized = LetterBox(new_shape=(job["size"], job["size"]), auto=False, stride=32)(image=source)
        if resized.ndim == 2:
            resized = resized[..., None]
        values = np.ascontiguousarray(resized.transpose(2, 0, 1)[None], dtype=np.float32) / 255
        started = time.perf_counter()
        raw = session.run(None, {session.get_inputs()[0].name: values})[0]
        elapsed = (time.perf_counter() - started) * 1000
        predictions = non_max_suppression(torch.from_numpy(raw), conf_thres=0.25, iou_thres=0.45, nc=1, max_det=300)[0]
        if len(predictions):
            scale_boxes(values.shape[2:], predictions[:, :4], (height, width))
        boxes = [dict(left=float(p[0]), top=float(p[1]), right=float(p[2]), bottom=float(p[3]), confidence=float(p[4]), classId=int(p[5])) for p in predictions]
        rows.append(dict(image=file.name, width=width, height=height, elapsedMs=elapsed, result=boxes))
    entry = {"name": job["name"], "predictions": rows}
    results.append(entry)
    (output / "reference-results.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"REFERENCE {job['name']}: {len(rows)} images, {sum(len(x['result']) for x in rows)} detections", flush=True)
    del session
