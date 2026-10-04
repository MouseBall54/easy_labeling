import base64
import io
import unittest
from unittest.mock import patch

from PIL import Image
import numpy as np

from backend import Runtime, decode_image, validate_examples, semantic_mask


class BackendTest(unittest.TestCase):
    def test_examples_group_non_contiguous_classes_and_reject_invalid_coordinates(self):
        examples = [{"classId": 7, "name": "cell", "box": [0, 0, 10, 10]},
                    {"classId": 2, "name": "part", "box": [10, 0, 20, 10]},
                    {"classId": 7, "name": "cell", "box": [20, 0, 30, 10]}]
        _, classes, ids, names = validate_examples(examples, 40, 40)
        self.assertEqual(classes.tolist(), [1, 0, 1])
        self.assertEqual(ids, [2, 7])
        self.assertEqual(names[7], "cell")
        for box in ([0, 0, 0, 10], [0, 0, float("nan"), 10], [-1, 0, 2, 3]):
            with self.assertRaises(ValueError):
                validate_examples([{"classId": 0, "name": "cell", "box": box}], 40, 40)

    def test_grayscale_is_converted_to_rgb_without_changing_brightness(self):
        data = io.BytesIO()
        Image.new("L", (2, 2), 123).save(data, format="PNG")
        decoded = decode_image("data:image/png;base64," + base64.b64encode(data.getvalue()).decode())
        self.assertEqual(decoded.mode, "RGB")
        self.assertEqual(decoded.getpixel((0, 0)), (123, 123, 123))
        with self.assertRaises(ValueError):
            decode_image("https://example.com/a.png")

    def test_gpu_required_and_stale_profile_is_rejected(self):
        runtime = Runtime()
        with patch("backend.device_status", return_value={"cuda": False}):
            with self.assertRaisesRegex(ValueError, "CUDA"):
                runtime.prepare({})
        with self.assertRaisesRegex(ValueError, "expired"):
            runtime.infer({"profileId": "stale"})

    def test_masks_preserve_ids_and_high_confidence_wins_overlap(self):
        masks = np.array([[[1, 1, 0], [0, 0, 0]], [[0, 1, 1], [0, 0, 0]]])
        rows = [[0, 0, 1, 1, 0.9, 0], [0, 0, 1, 1, 0.4, 1]]
        result = semantic_mask(masks, rows, [5, 1200], 3, 2)
        self.assertEqual(result, {"width": 3, "height": 2, "runs": [5, 2, 1200, 1, 0, 3]})
        self.assertEqual(semantic_mask(None, [], [5], 3, 2)["runs"], [0, 6])
        with self.assertRaisesRegex(ValueError, "dimensions"):
            semantic_mask(masks, rows, [5, 1200], 2, 2)


if __name__ == "__main__":
    unittest.main()
