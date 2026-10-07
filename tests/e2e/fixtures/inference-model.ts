// Minimal ONNX protobuf fixture: a real Identity graph, independent of network downloads or Python.
// The prediction tensor is intentionally fixed; preprocessing values are checked in unit tests.
const varint = (value: number): number[] => {
  const bytes: number[] = [];
  do { bytes.push((value & 127) | (value > 127 ? 128 : 0)); value = Math.floor(value / 128); } while (value);
  return bytes;
};
const integer = (field: number, value: number): number[] => [...varint(field * 8), ...varint(value)];
const bytes = (field: number, data: number[] | Uint8Array): number[] => [...varint(field * 8 + 2), ...varint(data.length), ...data];
const string = (field: number, value: string): number[] => bytes(field, new TextEncoder().encode(value));
const valueInfo = (name: string, dims: (number | string)[]): number[] => [
  ...string(1, name),
  ...bytes(2, bytes(1, [
    ...integer(1, 1),
    ...bytes(2, dims.flatMap((dim) => bytes(1, typeof dim === "number" ? integer(1, dim) : string(2, dim))))
  ]))
];

export function inferenceModel(channels: 1 | 3, layout: "nchw" | "nhwc", dynamic = false, rows?: number[][]): Buffer {
  const inputShape = layout === "nchw" ? [1, channels, 32, 32] : [1, 32, 32, channels];
  const shape: (number | string)[] = inputShape.map((dim, index) => dynamic && (layout === "nchw" ? index > 1 : index === 1 || index === 2) ? `spatial${index}` : dim);
  const count = rows?.length ?? 8;
  const predictions = new Float32Array(5 * count);
  if (rows) rows.forEach((row, index) => row.forEach((value, column) => { predictions[column * count + index] = value; }));
  else {
    [0, 1, 2, 3].forEach(column => { predictions[column * count] = 16; });
    predictions[4 * count] = .9;
  }
  const tensor = [
    ...[1, 5, count].flatMap((dim) => integer(1, dim)),
    ...integer(2, 1), ...string(8, "predictions"), ...bytes(9, new Uint8Array(predictions.buffer))
  ];
  const node = [...string(1, "predictions"), ...string(2, "output"), ...string(4, "Identity")];
  const graph = [
    ...bytes(1, node), ...string(2, "YOLO smoke fixture"), ...bytes(5, tensor),
    ...bytes(11, valueInfo("images", shape)), ...bytes(12, valueInfo("output", [1, 5, count]))
  ];
  return Buffer.from([...integer(1, 8), ...bytes(7, graph), ...bytes(8, integer(2, 13))]);
}
