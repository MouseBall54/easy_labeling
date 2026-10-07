import { inspectDetectionLabels } from "../dist/features/review/quality.js";
// ponytail: keep the O(n²) inspector for exact parity; prune pairs after dense-overlap validation.

self.onmessage = ({ data }) => {
  try { self.postMessage({ id: data.id, result: inspectDetectionLabels(data.input) }); }
  catch (error) { self.postMessage({ id: data.id, error: error instanceof Error ? error.message : String(error) }); }
};
