import json
from pathlib import Path
import cv2
import numpy as np
import onnxruntime as ort
from ultralytics.data.augment import LetterBox

output = Path(__file__).parent
job = json.loads((output / "models.json").read_text())[0]
session = ort.InferenceSession(job["model"], providers=["CPUExecutionProvider"])
rows = []
for file in sorted(Path(job["images"]).glob("*.png")):
    source = cv2.imread(str(file), cv2.IMREAD_GRAYSCALE)[..., None]
    image = LetterBox((128, 128), auto=False)(image=source)
    if image.ndim == 2: image = image[..., None]
    tensor = np.ascontiguousarray(image.transpose(2, 0, 1)[None], dtype=np.float32) / 255
    raw = session.run(None, {session.get_inputs()[0].name: tensor})[0]
    rows.append({"image": file.name, "maximum_confidence": float(raw[0, 4].max()), "candidates_above_025": int((raw[0, 4] >= .25).sum())})
(output / "smoke-score-audit.json").write_text(json.dumps(rows, indent=2))
print(json.dumps(rows, indent=2))
