"""Local GPU/CPU visual prompting for Easy Labeling. No uploads leave this machine."""
import argparse
import base64
import binascii
import hashlib
import io
import json
import math
import os
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
(ROOT / ".state" / "Ultralytics").mkdir(parents=True, exist_ok=True)
os.environ["YOLO_CONFIG_DIR"] = str(ROOT / ".state")
os.environ.setdefault("YOLO_AUTOINSTALL", "false")
import numpy as np
import torch
from PIL import Image, ImageDraw
from torchvision.ops import batched_nms
from ultralytics import YOLOE, settings
from ultralytics.models.yolo.yoloe import YOLOEVPDetectPredictor
from ultralytics.data.augment import LoadVisualPrompt

settings.update({"sync": False})

MODELS = [f"yoloe-26{size}-seg" for size in "nsmlx"]
ORIGINS = {"http://localhost:4173", "http://127.0.0.1:4173", "null"}
MAX_BODY = 48 * 1024 * 1024


class MaskPromptPredictor(YOLOEVPDetectPredictor):
    def _process_single_image(self, dst_shape, src_shape, category, bboxes=None, masks=None):
        # 8.4.168's mask branch sends 2-D masks through a 3-D image letterbox; resize masks explicitly.
        gain = min(dst_shape[0] / src_shape[0], dst_shape[1] / src_shape[1])
        w, h = round(src_shape[1] * gain), round(src_shape[0] * gain)
        left, top = round((dst_shape[1] - w) / 2 - 0.1), round((dst_shape[0] - h) / 2 - 0.1)
        resized = np.zeros((len(masks), *dst_shape), dtype=np.uint8)
        for i, mask in enumerate(masks):
            resized[i, top:top + h, left:left + w] = np.array(Image.fromarray(mask).resize((w, h), Image.Resampling.NEAREST))
        return LoadVisualPrompt().get_visuals(category, dst_shape, masks=resized)


def reference_prompts(payload):
    references = payload.get("references", [{"image": payload.get("image"), "examples": payload.get("examples")}])
    if not isinstance(references, list) or not 1 <= len(references) <= 32:
        raise ValueError("Use 1–32 reference images.")
    prepared, class_ids, names, example_count = [], [], {}, 0
    for reference in references:
        if not isinstance(reference, dict):
            raise ValueError("Invalid reference image.")
        image = decode_image(reference.get("image"))
        examples = reference.get("examples")
        prompts, local_ids, local_names = visual_prompts(examples, image.width, image.height)
        for class_id, name in local_names.items():
            if class_id in names and names[class_id] != name:
                raise ValueError("Examples of the same class must have the same name across images.")
            if name in names.values() and names.get(class_id) != name:
                raise ValueError("Examples of the same name must use the same class ID.")
            names[class_id] = name
        # Preserve within-image prompting; keep each reference's classes as separate prototypes.
        class_ids.extend(local_ids)
        example_count += len(examples)
        if example_count > 32:
            raise ValueError("Use at most 32 samples across all images.")
        prepared.append((image, prompts))
    return prepared, class_ids, names, example_count


def select_detections(rows, class_ids, iou):
    mapped = torch.tensor(class_ids, device=rows.device, dtype=torch.int64)[rows[:, 5].long()]
    return batched_nms(rows[:, :4], rows[:, 4], mapped, iou)


def device_status():
    available = torch.cuda.is_available()
    return {"cuda": available, "gpu": torch.cuda.get_device_name(0) if available else None,
            "torch": torch.__version__}


def decode_image(encoded):
    if not isinstance(encoded, str) or not encoded.startswith("data:image/png;base64,"):
        raise ValueError("Send a PNG image from the annotation canvas.")
    try:
        raw = base64.b64decode(encoded.split(",", 1)[1], validate=True)
    except (ValueError, binascii.Error) as error:
        raise ValueError("Invalid image encoding.") from error
    with Image.open(io.BytesIO(raw)) as image:
        if image.format != "PNG" or image.width * image.height > 32_000_000:
            raise ValueError("Use a PNG image with at most 32 million pixels.")
        return image.convert("RGB").copy()


def validate_examples(examples, width, height):
    if not isinstance(examples, list) or not 1 <= len(examples) <= 32:
        raise ValueError("Select between 1 and 32 example boxes.")
    names = {}
    boxes = []
    ids = []
    for example in examples:
        if not isinstance(example, dict):
            raise ValueError("Invalid example.")
        class_id = example.get("classId")
        name = example.get("name")
        box = example.get("box")
        if type(class_id) is not int or not 0 <= class_id <= 9007199254740991 or not isinstance(name, str) or not name.strip():
            raise ValueError("Each example needs a non-negative class ID and a name.")
        if not isinstance(box, list) or len(box) != 4 or not all(type(x) in (int, float) and math.isfinite(x) for x in box):
            raise ValueError("Invalid example coordinates.")
        x1, y1, x2, y2 = box
        if not (0 <= x1 < x2 <= width and 0 <= y1 < y2 <= height):
            raise ValueError("Example boxes must be inside the reference image.")
        if class_id in names and names[class_id] != name.strip():
            raise ValueError("Examples of the same class must have the same name.")
        names[class_id] = name.strip()
        boxes.append(box)
        ids.append(class_id)
    class_ids = sorted(names)
    return np.array(boxes, dtype=np.float32), np.array([class_ids.index(i) for i in ids]), class_ids, names


def semantic_mask(masks, rows, class_ids, width, height):
    # The editor stores one class per pixel; higher-confidence instances win overlaps.
    mask = np.zeros((height, width), dtype=np.uint16)
    if masks is not None:
        if masks.shape != (len(rows), height, width):
            raise ValueError("Model masks do not match the original image dimensions.")
        for index in sorted(range(len(rows)), key=lambda i: rows[i][4]):
            mask[masks[index] > 0] = class_ids[int(rows[index][5])]
    flat = mask.ravel()
    starts = np.r_[0, np.flatnonzero(flat[1:] != flat[:-1]) + 1]
    runs = np.column_stack((flat[starts], np.diff(np.r_[starts, flat.size]))).ravel().tolist()
    return {"width": width, "height": height, "runs": runs}


def visual_prompts(examples, width, height):
    boxes, classes, class_ids, names = validate_examples(examples, width, height)
    prompts = {"bboxes": boxes, "cls": classes}
    if any("polygon" in example or "mask" in example for example in examples):
        masks = []
        for example in examples:
            canvas = Image.new("L", (width, height))
            polygon, mask = example.get("polygon"), example.get("mask")
            if "polygon" in example and polygon is None or "mask" in example and mask is None:
                raise ValueError("Invalid sample mask.")
            if polygon is not None and mask is not None:
                raise ValueError("Use one mask type per sample.")
            if polygon is not None:
                if not isinstance(polygon, list) or not 3 <= len(polygon) <= 512:
                    raise ValueError("A sample outline needs 3–512 points.")
                x1, y1, x2, y2 = example["box"]
                for point in polygon:
                    if not isinstance(point, list) or len(point) != 2 or not all(type(x) in (int, float) and math.isfinite(x) for x in point) or not (x1 <= point[0] <= x2 and y1 <= point[1] <= y2):
                        raise ValueError("Sample outline points must be inside its bounds.")
                area = sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(polygon, polygon[1:] + polygon[:1]))
                if abs(area) < 2:
                    raise ValueError("Sample outline must enclose an area.")
                ImageDraw.Draw(canvas).polygon([tuple(point) for point in polygon], fill=1)
            elif mask is not None:
                if not isinstance(mask, dict):
                    raise ValueError("Invalid sample mask.")
                w, h, runs = mask.get("width"), mask.get("height"), mask.get("runs")
                box = example["box"]
                if not all(type(x) is int for x in (w, h, *box)) or w <= 0 or h <= 0 or (w, h) != (box[2] - box[0], box[3] - box[1]) or not isinstance(runs, list) or not runs or len(runs) % 2:
                    raise ValueError("Sample mask must match its integer bounds.")
                pixels = np.zeros(w * h, dtype=np.uint8)
                offset = 0
                for value, count in zip(runs[::2], runs[1::2]):
                    if type(value) is not int or value not in (0, 1) or type(count) is not int or count <= 0 or offset + count > pixels.size:
                        raise ValueError("Invalid binary sample mask run.")
                    pixels[offset:offset + count] = value
                    offset += count
                if offset != pixels.size or not pixels.any():
                    raise ValueError("Sample mask is empty or incomplete.")
                canvas.paste(Image.fromarray(pixels.reshape(h, w)), (box[0], box[1]))
            else:
                x1, y1, x2, y2 = example["box"]
                ImageDraw.Draw(canvas).rectangle((x1, y1, math.ceil(x2) - 1, math.ceil(y2) - 1), fill=1)
            masks.append(np.array(canvas))
        prompts = {"masks": np.stack(masks), "cls": classes}
    return prompts, class_ids, names


class Runtime:
    def __init__(self):
        self.lock = threading.Lock()
        self.model = None
        self.profile = None
        self.busy = False

    def status(self):
        return {**device_status(), "models": [name for name in MODELS if (ROOT / "models" / f"{name}.pt").is_file()],
                "busy": self.busy, "version": 5}

    def prepare(self, payload):
        hardware = device_status()
        device = 0 if hardware["cuda"] else "cpu"
        name = payload.get("model", "yoloe-26s-seg" if hardware["cuda"] else "yoloe-26n-seg")
        if name not in MODELS or not (ROOT / "models" / f"{name}.pt").is_file():
            raise ValueError("Model is not prepared. Run npm.cmd run yoloe:prepare -- --model " + str(name))
        references, class_ids, names, example_count = reference_prompts(payload)
        imgsz = payload.get("imgsz", 640)
        if type(imgsz) is not int or imgsz not in (640, 1024):
            raise ValueError("Choose inference resolution 640 or 1024.")
        workflow = payload.get("workflow", "detection")
        if workflow not in ("detection", "segmentation"):
            raise ValueError("Choose Detection or Segmentation.")
        if workflow == "segmentation" and not all(1 <= i <= 65535 for i in class_ids):
            raise ValueError("Segmentation class IDs must be 1–65535; 0 is reserved for background.")
        model_path = str(ROOT / "models" / f"{name}.pt")
        model = YOLOE(model_path) if workflow == "segmentation" else YOLOE(name.replace("-seg", "") + ".yaml").load(model_path)
        embeddings = []
        for image, prompts in references:
            predictor_type = MaskPromptPredictor if "masks" in prompts else YOLOEVPDetectPredictor
            predictor = predictor_type(overrides={"task": model.task, "mode": "predict", "device": device, "imgsz": imgsz, "verbose": False, "save": False})
            predictor.set_prompts(prompts)
            predictor.setup_model(model=model.model, verbose=False)
            embeddings.append(predictor.get_vpe(image))
        model.set_classes([f"{names[class_id]} / example {index + 1}" for index, class_id in enumerate(class_ids)], torch.cat(embeddings, dim=1))
        profile = {"id": str(uuid.uuid4()), "model": name, "workflow": workflow, "classIds": class_ids,
                   "classes": {str(i): name for i, name in names.items()}, "exampleCount": example_count,
                   "referenceCount": len(references), "imgsz": imgsz, "embeddingStrategy": "per-reference-class",
                   "backend": "cuda" if hardware["cuda"] else "cpu", "gpu": hardware["gpu"],
                   "referenceSha256": hashlib.sha256(b"".join(image.tobytes() for image, _ in references)).hexdigest()}
        self.model, self.profile = model, profile
        return {**profile, **hardware}

    def infer(self, payload):
        if self.model is None or not self.profile or payload.get("profileId") != self.profile["id"]:
            raise ValueError("Examples expired or changed in another window. Reconnect, then Find again.")
        confidence, iou = payload.get("confidence"), payload.get("iou")
        if not all(type(x) in (int, float) and math.isfinite(x) and 0 <= x <= 1 for x in (confidence, iou)):
            raise ValueError("Confidence and IoU must be between 0 and 1.")
        image = decode_image(payload.get("image"))
        started = time.perf_counter()
        result = self.model.predict(image, device=0 if self.profile["backend"] == "cuda" else "cpu", imgsz=self.profile["imgsz"], conf=confidence, iou=iou,
                                    max_det=300, verbose=False, retina_masks=self.profile["workflow"] == "segmentation")[0]
        keep = select_detections(result.boxes.data, self.profile["classIds"], iou)
        rows = result.boxes.data[keep].detach().cpu().tolist()
        detections = [{"classId": self.profile["classIds"][int(row[5])], "confidence": row[4],
                       "left": row[0], "top": row[1], "right": row[2], "bottom": row[3]} for row in rows]
        mask = semantic_mask(result.masks.data[keep].cpu().numpy() if result.masks is not None else None,
                             rows, self.profile["classIds"], image.width, image.height) if self.profile["workflow"] == "segmentation" else None
        return {"detections": detections, "mask": mask, "elapsedMs": (time.perf_counter() - started) * 1000,
                "backend": self.profile["backend"], "gpu": self.profile["gpu"]}


def serve(port):
    runtime = Runtime()

    class Handler(BaseHTTPRequestHandler):
        def allowed(self):
            return self.headers.get("Host") in {f"127.0.0.1:{port}", f"localhost:{port}"} and (
                self.headers.get("Origin") is None or self.headers.get("Origin") in ORIGINS)

        def respond(self, status, value):
            body = json.dumps(value, ensure_ascii=False, allow_nan=False).encode("utf-8")
            self.send_response(status)
            if self.headers.get("Origin") in ORIGINS:
                self.send_header("Access-Control-Allow-Origin", self.headers["Origin"])
                self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            try:
                self.wfile.write(body)
            except (BrokenPipeError, ConnectionResetError):
                pass  # The UI may cancel an in-flight GPU operation.

        def do_OPTIONS(self):
            self.respond(200 if self.allowed() else 403, {})

        def do_GET(self):
            if not self.allowed():
                return self.respond(403, {"error": "Local Easy Labeling origins only."})
            self.respond(200 if self.path == "/status" else 404, runtime.status() if self.path == "/status" else {})

        def do_POST(self):
            if not self.allowed():
                return self.respond(403, {"error": "Local Easy Labeling origins only."})
            if self.path not in ("/prepare", "/infer"):
                return self.respond(404, {"error": "Unknown operation."})
            if self.headers.get("Content-Type") != "application/json":
                return self.respond(415, {"error": "Send application/json."})
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if not 0 < length <= MAX_BODY:
                    return self.respond(413, {"error": "Image request is too large."})
                payload = json.loads(self.rfile.read(length))
                if not isinstance(payload, dict):
                    raise ValueError("Invalid request.")
                if not runtime.lock.acquire(blocking=False):
                    return self.respond(409, {"error": "YOLOE is busy. Wait for the current operation to finish."})
                try:
                    runtime.busy = True
                    value = runtime.prepare(payload) if self.path == "/prepare" else runtime.infer(payload)
                finally:
                    runtime.busy = False
                    runtime.lock.release()
                self.respond(200, value)
            except Exception as error:
                self.respond(400, {"error": str(error)})

    print(json.dumps({"listening": f"http://127.0.0.1:{port}", **runtime.status()}), flush=True)
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["prepare", "check", "serve"])
    parser.add_argument("--model", choices=[*MODELS, "all"])
    parser.add_argument("--port", type=int, default=8766)
    args = parser.parse_args()
    if args.command == "prepare":
        from ultralytics.utils.downloads import attempt_download_asset
        (ROOT / "models").mkdir(exist_ok=True)
        names = MODELS[:4] if args.model == "all" else [args.model or ("yoloe-26s-seg" if device_status()["cuda"] else "yoloe-26n-seg")]
        for name in names:
            target = Path(attempt_download_asset(ROOT / "models" / f"{name}.pt"))
            if not target.is_file():
                raise RuntimeError("Model download failed.")
            print(json.dumps({"model": str(target), "sha256": hashlib.sha256(target.read_bytes()).hexdigest()}))
    elif args.command == "check":
        print(json.dumps(Runtime().status()))
        device = "cuda" if device_status()["cuda"] else "cpu"
        value = torch.ones((16, 16), device=device) @ torch.ones((16, 16), device=device)
        if device == "cuda":
            torch.cuda.synchronize()
        assert value[0, 0].item() == 16
        print(json.dumps({"backend": device, "matrixCheck": "PASS"}))
    else:
        serve(args.port)


if __name__ == "__main__":
    main()
