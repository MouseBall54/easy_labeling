import base64
import io
import unittest
from unittest.mock import patch

from PIL import Image
import numpy as np

from backend import Runtime, decode_image, validate_examples, semantic_mask, visual_prompts, MaskPromptPredictor


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

    def test_visual_masks_keep_outline_and_selected_pixels_instead_of_bounding_boxes(self):
        examples = [{"classId": 7, "name": "sampleA", "box": [1, 1, 8, 8], "polygon": [[1, 1], [8, 1], [1, 8]]},
                    {"classId": 2, "name": "sampleB", "box": [8, 8, 10, 10], "mask": {"width": 2, "height": 2, "runs": [1, 1, 0, 2, 1, 1]}},
                    {"classId": 7, "name": "sampleA", "box": [2, 10, 5, 13]}]
        prompts, ids, names = visual_prompts(examples, 16, 16)
        self.assertNotIn("bboxes", prompts)
        self.assertEqual(prompts["cls"].tolist(), [1, 0, 1])
        self.assertEqual(prompts["masks"].shape, (3, 16, 16))
        self.assertEqual(prompts["masks"][0, 7, 7], 0)
        self.assertEqual(prompts["masks"][0, 2, 2], 1)
        self.assertEqual(prompts["masks"][1, 8:10, 8:10].tolist(), [[1, 0], [0, 1]])
        self.assertEqual(int(prompts["masks"][2].sum()), 9)
        self.assertEqual((ids, names[7]), ([2, 7], "sampleA"))
        for polygon in ([[1, 1], [8, 8]], [[1, 1], [4, 4], [8, 8]], [[1, 1], [99, 2], [1, 8]]):
            with self.assertRaises(ValueError):
                visual_prompts([{**examples[0], "polygon": polygon}], 16, 16)
        for runs in ([0, 4], [1, 3], [2, 4], [1, 5]):
            with self.assertRaises(ValueError):
                visual_prompts([{**examples[1], "mask": {"width": 2, "height": 2, "runs": runs}}], 16, 16)

    def test_gpu_required_and_stale_profile_is_rejected(self):
        runtime = Runtime()
        with patch("backend.device_status", return_value={"cuda": False}):
            with self.assertRaisesRegex(ValueError, "CUDA"):
                runtime.prepare({})
        with self.assertRaisesRegex(ValueError, "expired"):
            runtime.infer({"profileId": "stale"})

    def test_mask_encoder_letterboxes_non_square_masks_without_filling_background(self):
        predictor = MaskPromptPredictor.__new__(MaskPromptPredictor)
        visuals = predictor._process_single_image((64, 64), (10, 20), np.array([0]), masks=np.ones((1, 10, 20), dtype=np.uint8)).numpy()
        height = visuals.shape[1]
        self.assertFalse(visuals[:, :height // 4].any())
        self.assertTrue(visuals[:, height // 4:height * 3 // 4].all())
        self.assertFalse(visuals[:, height * 3 // 4:].any())

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
