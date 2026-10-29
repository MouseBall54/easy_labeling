"""Writes the TIFF inputs of crates/el-bench/fixtures/tiff/ (committed; rerun only to change them).

Needs Pillow for the compressed variants; the uncompressed strip/tile/photometric/orientation variants
are written by hand so their layout is exact. gen-golden.mjs then decodes every file with tiff.js
(the app's reference) to produce the expected pixels, so CI needs no Python.

    python scripts/migration/make-tiff-fixtures.py
"""
import json
import struct
from pathlib import Path

from PIL import Image

OUT = Path(__file__).resolve().parents[2] / "crates" / "el-bench" / "fixtures" / "tiff"
WIDTH, HEIGHT = 37, 23  # odd sizes: partial tiles, padded rows


def pixels(width, height, seed):
    state = seed
    data = bytearray()
    for y in range(height):
        for x in range(width):
            state = (state * 1103515245 + 12345) & 0xFFFFFFFF
            data.append((x * 7 + y * 13 + (state >> 24)) & 0xFF)
    return bytes(data)


def write_tiff(path, width, height, samples, bits, entries, chunks, tile=None, pages=1):
    """Little-endian uncompressed TIFF. `chunks(page)` returns the strip or tile payloads."""
    out = bytearray(b"II*\x00\x00\x00\x00\x00")
    ifd_offsets = []
    for page in range(pages):
        payloads = chunks(page)
        offsets = []
        for payload in payloads:
            offsets.append(len(out))
            out += payload
        tags = {
            256: (4, [width]), 257: (4, [height]), 258: (3, [bits] * samples), 259: (3, [1]),
            277: (3, [samples]), 284: (3, [1]),
        }
        tags.update(entries)
        if tile:
            tags[322], tags[323] = (3, [tile[0]]), (3, [tile[1]])
            tags[324], tags[325] = (4, offsets), (4, [len(p) for p in payloads])
        else:
            rows = entries.get(278, (4, [height]))[1][0]
            tags[278] = (4, [rows])
            tags[273], tags[279] = (4, offsets), (4, [len(p) for p in payloads])
        # Out-of-line values first, then the IFD.
        blobs = {}
        for tag, (kind, values) in tags.items():
            size = len(values) * (2 if kind == 3 else 4)
            if size > 4:
                blobs[tag] = len(out)
                out += b"".join(struct.pack("<H" if kind == 3 else "<I", v) for v in values)
                if len(out) % 2:
                    out += b"\x00"
        ifd_offsets.append(len(out))
        out += struct.pack("<H", len(tags))
        for tag in sorted(tags):
            kind, values = tags[tag]
            out += struct.pack("<HHI", tag, kind, len(values))
            if tag in blobs:
                out += struct.pack("<I", blobs[tag])
            else:
                packed = b"".join(struct.pack("<H" if kind == 3 else "<I", v) for v in values)
                out += packed.ljust(4, b"\x00")
        out += b"\x00\x00\x00\x00"  # next IFD, patched below
    struct.pack_into("<I", out, 4, ifd_offsets[0])
    for this, following in zip(ifd_offsets, ifd_offsets[1:]):
        count = struct.unpack_from("<H", out, this)[0]
        struct.pack_into("<I", out, this + 2 + count * 12, following)
    path.write_bytes(bytes(out))


def strips(data, width, rows_per_strip, bytes_per_pixel=1):
    row = width * bytes_per_pixel
    return [data[start:start + rows_per_strip * row] for start in range(0, len(data), rows_per_strip * row)]


def tiles(data, width, height, tw, th):
    out = []
    for ty in range(0, height, th):
        for tx in range(0, width, tw):
            tile = bytearray()
            for y in range(ty, ty + th):
                for x in range(tx, tx + tw):
                    tile.append(data[y * width + x] if x < width and y < height else 0)
            out.append(bytes(tile))
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    gray = pixels(WIDTH, HEIGHT, 1)
    cases = []

    def add(name, native, note):
        cases.append({"file": f"{name}.tif", "native": native, "note": note})

    image = Image.frombytes("L", (WIDTH, HEIGHT), gray)
    for name, options in {
        "pil-none": {"compression": "raw"},
        "pil-lzw": {"compression": "tiff_lzw"},
        "pil-lzw-predictor": {"compression": "tiff_lzw", "tiffinfo": {317: 2}},
        "pil-deflate": {"compression": "tiff_adobe_deflate"},
        "pil-packbits": {"compression": "packbits"},
    }.items():
        image.save(OUT / f"{name}.tif", **options)
        add(name, True, f"Pillow, {options['compression']}")

    one = {262: (3, [1])}
    write_tiff(OUT / "strips-5-rows.tif", WIDTH, HEIGHT, 1, 8, {**one, 278: (4, [5])}, lambda _: strips(gray, WIDTH, 5))
    add("strips-5-rows", True, "uncompressed, 5 rows per strip (last strip short)")
    write_tiff(OUT / "tiles-16.tif", WIDTH, HEIGHT, 1, 8, one, lambda _: tiles(gray, WIDTH, HEIGHT, 16, 16), tile=(16, 16))
    add("tiles-16", True, "uncompressed 16x16 tiles, partial edge tiles")
    write_tiff(OUT / "min-is-white.tif", WIDTH, HEIGHT, 1, 8, {262: (3, [0])}, lambda _: strips(gray, WIDTH, HEIGHT))
    add("min-is-white", True, "photometric WhiteIsZero (shown inverted)")
    second = pixels(WIDTH, HEIGHT, 2)
    write_tiff(OUT / "two-pages.tif", WIDTH, HEIGHT, 1, 8, one, lambda page: strips(gray if page == 0 else second, WIDTH, HEIGHT), pages=2)
    add("two-pages", True, "first page is shown")
    write_tiff(OUT / "orientation-3.tif", WIDTH, HEIGHT, 1, 8, {**one, 274: (3, [3])}, lambda _: strips(gray, WIDTH, HEIGHT))
    add("orientation-3", False, "rotated: tiff.js flips it, left to tiff.js")
    rgb = bytes(v for p in gray for v in (p, 255 - p, p // 2))
    write_tiff(OUT / "rgb.tif", WIDTH, HEIGHT, 3, 8, {262: (3, [2])}, lambda _: strips(rgb, WIDTH, HEIGHT, 3))
    add("rgb", False, "RGB, left to tiff.js")
    gray16 = b"".join(struct.pack("<H", p * 257) for p in gray)
    write_tiff(OUT / "gray16.tif", WIDTH, HEIGHT, 1, 16, one, lambda _: strips(gray16, WIDTH, HEIGHT, 2))
    add("gray16", False, "16-bit, left to tiff.js")
    gray_alpha = bytes(v for p in gray for v in (p, 200))
    write_tiff(OUT / "gray-alpha.tif", WIDTH, HEIGHT, 2, 8, {**one, 338: (3, [2])}, lambda _: strips(gray_alpha, WIDTH, HEIGHT, 2))
    add("gray-alpha", False, "gray + alpha, left to tiff.js")
    (OUT / "truncated.tif").write_bytes((OUT / "pil-lzw.tif").read_bytes()[:300])
    add("truncated", False, "damaged file, left to tiff.js")

    (OUT / "inputs.json").write_text(json.dumps(cases, indent=1) + "\n", encoding="utf-8")
    print(f"{len(cases)} TIFF fixtures in {OUT}")


if __name__ == "__main__":
    main()
