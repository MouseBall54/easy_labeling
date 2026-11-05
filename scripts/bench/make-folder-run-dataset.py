"""Synthetic SEM-like dataset for timing Refine's folder run (tests/e2e/folder-run-performance.spec.ts).

Each image is 8-bit gray: a dark noisy background with a grid of bright blurred blobs. Its YOLO label file
holds one box per blob, every side off by a few pixels so refinement has edges to move.

    python scripts/bench/make-folder-run-dataset.py <out-dir> [--count 200] [--boxes 100]
        [--size 2048x1536] [--format tif|png|jpg]
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


def make(index, width, height, boxes, rng):
    image = rng.normal(45, 8, (height, width))
    image += np.linspace(0, 20, width)[None, :]  # uneven background, as SEM images have
    cols = int(np.ceil(np.sqrt(boxes * width / height)))
    rows = int(np.ceil(boxes / cols))
    cell_w, cell_h = width / cols, height / rows
    rects = []
    for n in range(boxes):
        cx, cy = (n % cols + 0.5) * cell_w, (n // cols + 0.5) * cell_h
        w, h = cell_w * rng.uniform(0.35, 0.6), cell_h * rng.uniform(0.35, 0.6)
        x0, y0, x1, y1 = int(cx - w / 2), int(cy - h / 2), int(cx + w / 2), int(cy + h / 2)
        image[y0:y1, x0:x1] += rng.uniform(110, 150)
        rects.append((x0, y0, x1, y1))
    gray = Image.fromarray(np.clip(image, 0, 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(1.5))
    lines = []
    for n, (x0, y0, x1, y1) in enumerate(rects):
        dx0, dy0, dx1, dy1 = rng.integers(-5, 6, 4)
        bx0, by0, bx1, by1 = x0 + dx0, y0 + dy0, x1 + dx1, y1 + dy1
        lines.append(f"{n % 3} {(bx0 + bx1) / 2 / width:.6f} {(by0 + by1) / 2 / height:.6f} {(bx1 - bx0) / width:.6f} {(by1 - by0) / height:.6f}")
    return gray, "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("out")
    parser.add_argument("--count", type=int, default=200)
    parser.add_argument("--boxes", type=int, default=100)
    parser.add_argument("--size", default="2048x1536")
    parser.add_argument("--format", default="tif", choices=["tif", "png", "jpg"])
    args = parser.parse_args()
    width, height = map(int, args.size.lower().split("x"))
    out = Path(args.out)
    (out / "label").mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(7)
    for index in range(args.count):
        gray, label = make(index, width, height, args.boxes, rng)
        name = f"image-{index:04d}"
        gray.save(out / f"{name}.{args.format}", **({"quality": 92} if args.format == "jpg" else {}))
        (out / "label" / f"{name}.txt").write_text(label, newline="\n")
    print(f"{args.count} {args.format} images ({width}x{height}, {args.boxes} boxes each) in {out}")


if __name__ == "__main__":
    main()
