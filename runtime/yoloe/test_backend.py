import base64
import io
import unittest
from unittest.mock import patch

from PIL import Image

from backend import Runtime, decode_image, validate_examples


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


if __name__ == "__main__":
    unittest.main()
