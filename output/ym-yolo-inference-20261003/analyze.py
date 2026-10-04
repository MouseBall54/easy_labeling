import csv
import hashlib
import json
import statistics
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

output = Path(__file__).parent
app = json.loads((output / "app-results.json").read_text(encoding="utf-8"))
references = {entry["name"]: {row["image"]: row for row in entry["predictions"]} for entry in json.loads((output / "reference-results.json").read_text(encoding="utf-8"))}

def coords(boxes):
    return np.array([[b["left"], b["top"], b["right"], b["bottom"]] for b in boxes], dtype=float).reshape(-1, 4)

def iou_matrix(a, b):
    a, b = coords(a), coords(b)
    intersection = np.maximum(0, np.minimum(a[:, None, 2:], b[None, :, 2:]) - np.maximum(a[:, None, :2], b[None, :, :2])).prod(axis=2)
    area_a = np.maximum(0, a[:, 2:] - a[:, :2]).prod(axis=1)
    area_b = np.maximum(0, b[:, 2:] - b[:, :2]).prod(axis=1)
    return intersection / np.maximum(1e-12, area_a[:, None] + area_b[None, :] - intersection)

def match(predictions, targets, threshold):
    matrix = iou_matrix(predictions, targets)
    pairs = []
    used = set()
    for i in sorted(range(len(predictions)), key=lambda k: -predictions[k].get("confidence", 1)):
        options = [j for j in range(len(targets)) if j not in used and targets[j]["classId"] == predictions[i]["classId"] and matrix[i, j] >= threshold]
        if options:
            j = max(options, key=lambda j: matrix[i, j])
            used.add(j)
            pairs.append((i, j, float(matrix[i, j])))
    return pairs

summaries = []
image_rows = []
for job in app:
    if "predictions" not in job:
        continue
    total_gt = total_pred = total_tp = reference_count = reference_matches = 0
    confidence_errors, coordinate_errors, agreement_ious, timings = [], [], [], []
    source_unchanged = True
    for row in job["predictions"]:
        file = row["image"]
        reference = references[job["name"]][file]
        width, height = reference["width"], reference["height"]
        label_file = Path(job["labels"]) / Path(file).with_suffix(".txt")
        truth = []
        for line in label_file.read_text(encoding="utf-8").splitlines():
            if not line.strip(): continue
            class_id, cx, cy, bw, bh = map(float, line.split())
            truth.append(dict(classId=int(class_id), left=(cx-bw/2)*width, top=(cy-bh/2)*height, right=(cx+bw/2)*width, bottom=(cy+bh/2)*height))
        boxes = row["result"]
        gt_pairs = match(boxes, truth, 0.5)
        ref_pairs = match(boxes, reference["result"], 0.999)
        total_gt += len(truth)
        total_pred += len(boxes)
        total_tp += len(gt_pairs)
        reference_count += len(reference["result"])
        reference_matches += len(ref_pairs)
        timings.append(row["elapsedMs"])
        for i, j, iou in ref_pairs:
            confidence_errors.append(abs(boxes[i]["confidence"] - reference["result"][j]["confidence"]))
            coordinate_errors.append(float(np.max(np.abs(coords([boxes[i]]) - coords([reference["result"][j]])))))
            agreement_ious.append(iou)
        image_rows.append(dict(model=job["name"], image=file, ground_truth=len(truth), predictions=len(boxes), true_positive=len(gt_pairs), false_positive=len(boxes)-len(gt_pairs), false_negative=len(truth)-len(gt_pairs), worker_ms=row["elapsedMs"], reference_predictions=len(reference["result"]), reference_matches=len(ref_pairs)))
        source_unchanged &= hashlib.sha256(label_file.read_bytes()).digest() == hashlib.sha256((Path(job["workspace"]) / "label" / label_file.name).read_bytes()).digest()
        source_unchanged &= hashlib.sha256((Path(job["images"]) / file).read_bytes()).digest() == hashlib.sha256((Path(job["workspace"]) / file).read_bytes()).digest()
    precision = total_tp / total_pred if total_pred else 0
    recall = total_tp / total_gt if total_gt else 0
    summary = dict(name=job["name"], pass_=job["pass"], images=len(job["predictions"]), gt=total_gt, detections=total_pred, tp=total_tp, fp=total_pred-total_tp, fn=total_gt-total_tp, precision=precision, recall=recall, f1=2*precision*recall/(precision+recall) if precision+recall else 0, worker_mean_ms=statistics.mean(timings), worker_median_ms=statistics.median(timings), batch_seconds=job["batchMs"]/1000, load_seconds=job["modelLoadMs"]/1000, reference_detections=reference_count, reference_matched=reference_matches, max_confidence_delta=max(confidence_errors, default=0), max_coordinate_delta_px=max(coordinate_errors, default=0), min_reference_iou=min(agreement_ious, default=None), source_files_unchanged=bool(source_unchanged), model=job["model"], results=job["resultsFolder"])
    summaries.append(summary)
    # A standalone ground-truth / predicted-box comparison with original pixels unchanged.
    representative = max(job["predictions"], key=lambda row: len(row["result"]))
    file = representative["image"]
    original = Image.open(Path(job["images"]) / file).convert("RGB")
    predicted = original.copy()
    ground_truth = original.copy()
    draw = ImageDraw.Draw(predicted)
    for box in representative["result"]:
        draw.rectangle((box["left"], box["top"], box["right"], box["bottom"]), outline=(255, 50, 90), width=2)
    draw = ImageDraw.Draw(ground_truth)
    for line in (Path(job["labels"]) / Path(file).with_suffix(".txt")).read_text().splitlines():
        if not line.strip(): continue
        _, cx, cy, bw, bh = map(float, line.split())
        w, h = original.size
        draw.rectangle(((cx-bw/2)*w, (cy-bh/2)*h, (cx+bw/2)*w, (cy+bh/2)*h), outline=(20, 220, 120), width=2)
    panel = Image.new("RGB", (original.width*2, original.height+35), "white")
    panel.paste(ground_truth, (0, 35))
    panel.paste(predicted, (original.width, 35))
    ImageDraw.Draw(panel).text((8, 8), f"Ground truth: {file}", fill="black")
    ImageDraw.Draw(panel).text((original.width+8, 8), f"EasyLabeling: {len(representative['result'])} detections", fill="black")
    panel.save(output / f"{job['name']}-comparison.png")

(output / "summary.json").write_text(json.dumps(summaries, indent=2), encoding="utf-8")
with (output / "per-image.csv").open("w", newline="", encoding="utf-8-sig") as file:
    writer = csv.DictWriter(file, fieldnames=image_rows[0].keys())
    writer.writeheader()
    writer.writerows(image_rows)
print(json.dumps(summaries, indent=2))
