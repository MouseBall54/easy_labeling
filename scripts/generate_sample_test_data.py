"""Compatibility entrypoint: rebuild reviewed boxes/masks with the app PNG codec.

Run npm run build first. No Python packages, model downloads, or GPU are required.
"""
from pathlib import Path
import subprocess

if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    subprocess.run(["node", str(root / "scripts/generate-sample-labels.mjs")], cwd=root, check=True)
