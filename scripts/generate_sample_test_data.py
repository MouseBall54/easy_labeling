from __future__ import annotations

import base64
import json
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
SAMPLE_DIR = ROOT / "assets" / "sample"
LABEL_DIR = SAMPLE_DIR / "label"
TEMPLATE_DIR = SAMPLE_DIR / "templates"
AUTOMATION_DIR = SAMPLE_DIR / ".easy-labeling"
CREATED_AT = "2026-07-11T00:00:00.000Z"

CLASS_NAMES = {
    "0": "Light / White",
    "1": "Dark / Gray",
    "2": "Red / Pink",
    "3": "Blue",
    "4": "Green / Yellow",
}

COLOR_OVERRIDES = {
    "sample_1.jpg": {
        (650, 331): "2",
        (700, 466): "3",
        (700, 556): "4",
    },
    "sample_2.jpg": {
        (541, 435): "2",
        (589, 435): "3",
        (633, 435): "3",
        (165, 542): "4",
        (305, 542): "3",
        (445, 542): "3",
        (722, 542): "3",
        (908, 542): "3",
    },
    "sample_3.jpg": {
        (316, 380): "4",
        (504, 380): "2",
        (578, 380): "4",
        (765, 380): "3",
        (953, 380): "3",
        (154, 580): "2",
        (959, 580): "2",
        (531, 419): "4",
    },
}


@dataclass(frozen=True)
class Box:
    center_x: float
    center_y: float
    width: float
    height: float
    class_id: str = "0"

    @property
    def left(self) -> float:
        return self.center_x - self.width / 2

    @property
    def top(self) -> float:
        return self.center_y - self.height / 2


def sample_boxes() -> dict[str, list[Box]]:
    sample_1 = [
        Box(x, y, 46, 30)
        for x in (495, 545, 650, 700)
        for y in range(61, 602, 45)
    ]

    upper_x = [65, 112, 159, 207, 254, 301, 349, 398, 445, 492, 540, 588, 637, 684, 733, 779, 826, 872, 920, 968, 1014, 1058, 1103]
    lower_x = [73, 120, 166, 213, 259, 306, 352, 399, 446, 493, 541, 589, 633, 678, 725, 770, 817, 864, 911, 957, 1004, 1051, 1098]
    bottom_x = [72, 119, 165, 212, 258, 305, 351, 398, 445, 491, 537, 583, 630, 676, 722, 768, 814, 861, 908, 955, 1002, 1049, 1096]
    sample_2 = (
        [Box(x, 134, 38, 96) for x in upper_x]
        + [Box(x, 242, 38, 96) for x in upper_x]
        + [Box(x, 435, 38, 96) for x in lower_x]
        + [Box(x, 542, 38, 96) for x in bottom_x]
    )

    sample_3 = (
        [Box(x, 217, 28, 48) for x in (247, 282, 319, 355, 392, 429, 466, 503, 540, 577, 614, 651, 689, 727, 765, 802, 840, 878, 916, 954)]
        + [Box(x, 380, 28, 49) for x in (202, 240, 278, 316, 354, 391, 429, 467, 504, 541, 578, 615, 652, 689, 727, 765, 802, 840, 878, 915, 953)]
        + [Box(x, 580, 32, 76) for x in (154, 193, 235, 275, 551, 612, 754, 818, 884, 959)]
        + [Box(x, 419, 58, 28) for x in (292, 383, 531, 609, 701, 782, 852, 946)]
    )
    return {
        "sample_1.jpg": sample_1,
        "sample_2.jpg": sample_2,
        "sample_3.jpg": sample_3,
    }


def classify_color(image: np.ndarray, box: Box) -> str:
    height, width = image.shape[:2]
    x1 = max(0, int(round(box.left + box.width * 0.16)))
    y1 = max(0, int(round(box.top + box.height * 0.12)))
    x2 = min(width, int(round(box.left + box.width * 0.84)))
    y2 = min(height, int(round(box.top + box.height * 0.88)))
    crop = image[y1:y2, x1:x2]
    if crop.size == 0:
        return "1"

    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    value = hsv[..., 2]
    bright_quantile = float(np.percentile(value, 72))
    mean_value = float(np.mean(value))
    return "0" if bright_quantile >= 168 and mean_value >= 92 else "1"


def classify_boxes(image_name: str, image: np.ndarray, boxes: list[Box]) -> list[Box]:
    overrides = COLOR_OVERRIDES.get(image_name, {})
    return [
        Box(
            box.center_x,
            box.center_y,
            box.width,
            box.height,
            overrides.get((int(box.center_x), int(box.center_y)), classify_color(image, box)),
        )
        for box in boxes
    ]


def serialize_yolo(boxes: list[Box], image_width: int, image_height: int) -> str:
    rows = [
        f"{box.class_id} {box.center_x / image_width:.15f} {box.center_y / image_height:.15f} {box.width / image_width:.15f} {box.height / image_height:.15f}"
        for box in boxes
    ]
    return "\n".join(rows) + "\n"


def crop_png_data_url(image: np.ndarray, roi: dict[str, int], output_path: Path) -> str:
    crop = image[
        roi["y"]:roi["y"] + roi["height"],
        roi["x"]:roi["x"] + roi["width"],
    ]
    ok, encoded = cv2.imencode(".png", crop)
    if not ok:
        raise RuntimeError(f"Unable to encode template crop: {output_path}")
    output_path.write_bytes(encoded.tobytes())
    return "data:image/png;base64," + base64.b64encode(encoded.tobytes()).decode("ascii")


def nearest_box(boxes: list[Box], center_x: float, center_y: float) -> Box:
    return min(boxes, key=lambda box: abs(box.center_x - center_x) + abs(box.center_y - center_y))


def create_automation_library(sample_1: np.ndarray, sample_1_boxes: list[Box]) -> dict[str, object]:
    source_size = {"width": int(sample_1.shape[1]), "height": int(sample_1.shape[0])}
    layout_source_boxes = [
        nearest_box(sample_1_boxes, 650, 331),
        nearest_box(sample_1_boxes, 700, 331),
        nearest_box(sample_1_boxes, 650, 376),
        nearest_box(sample_1_boxes, 700, 376),
    ]
    source_anchor = {
        "x": min(box.left for box in layout_source_boxes),
        "y": min(box.top for box in layout_source_boxes),
    }
    layout = {
        "schemaVersion": 1,
        "id": "sample-color-grid-layout",
        "name": "Sample Color Grid (4 Cars)",
        "sourceImageName": "sample_1.jpg",
        "sourceImageSize": source_size,
        "sourceAnchor": source_anchor,
        "createdAt": CREATED_AT,
        "updatedAt": CREATED_AT,
        "boxes": [
            {
                "id": f"sample-layout-box-{index + 1}",
                "classId": box.class_id,
                "relativeX": box.left - source_anchor["x"],
                "relativeY": box.top - source_anchor["y"],
                "width": box.width,
                "height": box.height,
                "order": index,
            }
            for index, box in enumerate(layout_source_boxes)
        ],
    }

    anchor_roi = {"x": 620, "y": 301, "width": 82, "height": 62}
    vehicle_roi = {"x": 628, "y": 315, "width": 44, "height": 32}
    anchor_data_url = crop_png_data_url(sample_1, anchor_roi, TEMPLATE_DIR / "pink-anchor.png")
    vehicle_data_url = crop_png_data_url(sample_1, vehicle_roi, TEMPLATE_DIR / "pink-vehicle.png")
    preprocessing = {
        "grayscale": False,
        "gaussianBlurEnabled": True,
        "blurKernelSize": 5,
        "blurSigma": 0,
        "gaussianNoiseEnabled": False,
        "gaussianNoiseSigma": 0,
        "gaussianNoiseSeed": 1,
    }
    templates = [
        {
            "schemaVersion": 1,
            "id": "sample-pink-anchor-template",
            "name": "Sample Pink Anchor",
            "sourceImageName": "sample_1.jpg",
            "sourceImageSize": source_size,
            "roi": anchor_roi,
            "pngDataUrl": anchor_data_url,
            "preprocessing": preprocessing,
            "createdAt": CREATED_AT,
            "updatedAt": CREATED_AT,
        },
        {
            "schemaVersion": 1,
            "id": "sample-pink-vehicle-template",
            "name": "Sample Pink Vehicle",
            "sourceImageName": "sample_1.jpg",
            "sourceImageSize": source_size,
            "roi": vehicle_roi,
            "pngDataUrl": vehicle_data_url,
            "preprocessing": preprocessing,
            "createdAt": CREATED_AT,
            "updatedAt": CREATED_AT,
        },
    ]
    default_multiple = {
        "classId": "2",
        "maximumDetections": 10,
        "strictNonOverlap": True,
        "nmsIouThreshold": 0.3,
        "paddingX": 2,
        "paddingY": 2,
    }
    presets = [
        {
            "schemaVersion": 2,
            "id": "sample-layout-preset",
            "name": "Sample Pink Anchor + Layout",
            "templateId": "sample-pink-anchor-template",
            "layoutId": layout["id"],
            "outputMode": "layout-best-match",
            "relationOffset": {
                "x": source_anchor["x"] - anchor_roi["x"],
                "y": source_anchor["y"] - anchor_roi["y"],
            },
            "manualOffset": {"x": 0, "y": 0},
            "matching": {
                "minimumScore": 0.85,
                "searchRoi": None,
                "mode": "accurate",
            },
            "multipleDetection": default_multiple,
            "existingLabelsPolicy": "append",
            "createdAt": CREATED_AT,
            "updatedAt": CREATED_AT,
        },
        {
            "schemaVersion": 2,
            "id": "sample-multiple-preset",
            "name": "Sample Pink Vehicle Finder",
            "templateId": "sample-pink-vehicle-template",
            "layoutId": None,
            "outputMode": "multiple-detection-boxes",
            "relationOffset": {"x": 0, "y": 0},
            "manualOffset": {"x": 0, "y": 0},
            "matching": {
                "minimumScore": 0.82,
                "searchRoi": None,
                "mode": "fast",
            },
            "multipleDetection": default_multiple,
            "existingLabelsPolicy": "append",
            "createdAt": CREATED_AT,
            "updatedAt": CREATED_AT,
        },
    ]
    return {
        "schemaVersion": 2,
        "layouts": [layout],
        "templates": templates,
        "presets": presets,
    }


def write_manifest() -> None:
    paths = [
        "sample_1.jpg",
        "sample_2.jpg",
        "sample_3.jpg",
        "label/sample_1.txt",
        "label/sample_2.txt",
        "label/sample_3.txt",
        "label/classes.yaml",
        "templates/pink-anchor.png",
        "templates/pink-vehicle.png",
        ".easy-labeling/automation-library.json",
    ]
    manifest = {"name": "Easy Labeling Sample Test", "files": paths}
    (SAMPLE_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    LABEL_DIR.mkdir(parents=True, exist_ok=True)
    TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)
    AUTOMATION_DIR.mkdir(parents=True, exist_ok=True)
    classified: dict[str, list[Box]] = {}
    loaded_images: dict[str, np.ndarray] = {}

    for image_name, boxes in sample_boxes().items():
        image = cv2.imread(str(SAMPLE_DIR / image_name))
        if image is None:
            raise FileNotFoundError(SAMPLE_DIR / image_name)
        loaded_images[image_name] = image
        classified_boxes = classify_boxes(image_name, image, boxes)
        classified[image_name] = classified_boxes
        height, width = image.shape[:2]
        label_name = f"{Path(image_name).stem}.txt"
        (LABEL_DIR / label_name).write_text(
            serialize_yolo(classified_boxes, width, height),
            encoding="utf-8",
        )

    classes_yaml = "# Vehicle body color classes for bundled sample images.\n" + "\n".join(
        f"{class_id}: {name}" for class_id, name in CLASS_NAMES.items()
    ) + "\n"
    (LABEL_DIR / "classes.yaml").write_text(classes_yaml, encoding="utf-8")

    library = create_automation_library(loaded_images["sample_1.jpg"], classified["sample_1.jpg"])
    (AUTOMATION_DIR / "automation-library.json").write_text(
        json.dumps(library, indent=2) + "\n",
        encoding="utf-8",
    )
    write_manifest()

    for image_name, boxes in classified.items():
        counts = {class_id: sum(box.class_id == class_id for box in boxes) for class_id in CLASS_NAMES}
        print(f"{image_name}: {len(boxes)} boxes {counts}")


if __name__ == "__main__":
    main()
