# Template Matching Benchmark

Measured on 2026-07-11 with Chromium against `http://127.0.0.1:4173/index.html`.
The fixture contains ten 512 x 384 PNG images and an approximately 78 x 84 template.
Run the same scenario with `npm run benchmark:template-matching`.

| Measurement | Before | After | Change |
| --- | ---: | ---: | ---: |
| OpenCV initialization / warm-up | Included in first match | 9388.90 ms | Measured separately |
| First match after warm-up | Not isolated | 111.14 ms | Now excludes engine loading |
| Warm match | 72.06 ms | 69.57 ms | 3.5% faster |
| Ten-image batch | 986.83 ms | 610.64 ms | 38.1% faster |

The optimized run reported no page errors. OpenCV initialization remains the dominant cold-start cost, so the Template Matching Setup modal starts it before the first explicit match. The batch improvement comes primarily from persistent worker reuse, cached template preprocessing, transferable image buffers, and offscreen decode-to-YOLO processing without loading each image into Fabric.js.

These wall-clock values are diagnostic and intentionally are not CI pass/fail thresholds.
