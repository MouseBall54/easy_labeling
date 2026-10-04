import base64
import io
import unittest
from unittest.mock import MagicMock, patch
from types import SimpleNamespace

from PIL import Image
import numpy as np
import torch

from backend import Runtime, decode_image, validate_examples, semantic_mask, visual_prompts, MaskPromptPredictor, reference_prompts, select_detections


class BackendTest(unittest.TestCase):
    def test_references_keep_same_name_prototypes_and_reject_inconsistent_classes(self):
        data = io.BytesIO(); Image.new("RGB", (40, 40)).save(data, format="PNG")
        encoded = "data:image/png;base64," + base64.b64encode(data.getvalue()).decode()
        example = {"classId": 7, "name": "sampleA", "box": [0, 0, 10, 10]}
        references = [{"image": encoded, "examples": [example, {**example, "box": [20, 20, 30, 30]}]}, {"image": encoded, "examples": [example]}]
        prepared, ids, names, count = reference_prompts({"references": references})
        self.assertEqual((ids, names, count), ([7, 7], {7: "sampleA"}, 3))
        self.assertEqual(prepared[0][1]["cls"].tolist(), [0, 0])
        for change in ({"name": "sampleB"}, {"classId": 8}):
            with self.assertRaises(ValueError):
                reference_prompts({"references": [references[0], {"image": encoded, "examples": [{**example, **change}]}]})
        with self.assertRaisesRegex(ValueError, "32 samples"):
            reference_prompts({"references": [references[0]] * 17})
        for size in (True, 960, "1024"):
            with patch("backend.device_status", return_value={"cuda": True}), patch("pathlib.Path.is_file", return_value=True):
                with self.assertRaisesRegex(ValueError, "resolution"):
                    Runtime().prepare({"model": "yoloe-26s-seg", "references": references, "imgsz": size})

    def test_same_output_class_deduplicates_prototypes_without_removing_other_classes(self):
        rows = torch.tensor([[0, 0, 10, 10, 0.9, 0], [0, 0, 10, 10, 0.8, 1], [0, 0, 10, 10, 0.7, 2]])
        self.assertEqual(select_detections(rows, [7, 7, 12], 0.45).tolist(), [0, 2])
        self.assertEqual(select_detections(torch.empty((0, 6)), [7], 0.45).tolist(), [])

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

    def test_gpu_and_cpu_defaults_drive_prompt_encoding_inference_and_reported_backend(self):
        data = io.BytesIO(); Image.new("RGB", (40, 40)).save(data, format="PNG")
        encoded = "data:image/png;base64," + base64.b64encode(data.getvalue()).decode()
        for cuda in (False, True):
            for workflow in ("detection", "segmentation"):
                with self.subTest(cuda=cuda, workflow=workflow):
                    model = MagicMock(task="segment" if workflow == "segmentation" else "detect")
                    model.load.return_value = model
                    model.predict.return_value = [SimpleNamespace(boxes=SimpleNamespace(data=torch.tensor([[0, 0, 10, 10, 0.9, 0]])),
                        masks=SimpleNamespace(data=torch.ones((1, 40, 40))) if workflow == "segmentation" else None)]
                    predictor = MagicMock()
                    predictor.get_vpe.return_value = torch.ones((1, 1, 512))
                    with patch("backend.device_status", return_value={"cuda": cuda, "gpu": "Test GPU" if cuda else None}), patch("pathlib.Path.is_file", return_value=True), patch("backend.YOLOE", return_value=model), patch("backend.YOLOEVPDetectPredictor", return_value=predictor) as factory:
                        runtime = Runtime()
                        profile = runtime.prepare({"image": encoded, "workflow": workflow, "examples": [{"classId": 7, "name": "part", "box": [0, 0, 10, 10]}]})
                        expected = "cuda" if cuda else "cpu"
                        self.assertEqual(profile["model"], "yoloe-26s-seg" if cuda else "yoloe-26n-seg")
                        self.assertEqual(profile["backend"], expected)
                        self.assertEqual(factory.call_args.kwargs["overrides"]["device"], 0 if cuda else "cpu")
                        result = runtime.infer({"profileId": profile["id"], "image": encoded, "confidence": 0.25, "iou": 0.45})
                        self.assertEqual(model.predict.call_args.kwargs["device"], 0 if cuda else "cpu")
                        self.assertEqual(result["backend"], expected)
                        self.assertEqual(result["gpu"], "Test GPU" if cuda else None)
                        self.assertEqual(result["detections"][0]["classId"], 7)
                        self.assertEqual(result["mask"] is not None, workflow == "segmentation")
        runtime = Runtime()
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
