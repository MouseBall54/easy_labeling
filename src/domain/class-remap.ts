import { parseNonNegativeClassId } from "./class-id.js";

export type ClassRemapRule =
  | { mode: "offset"; offset: number }
  | { mode: "mapping"; mapping: readonly { from: string; to: string }[] };

export interface ClassRemapSummary {
  changedCount: number;
  changes: { from: string; to: string; count: number }[];
}

export function createClassIdRemapper(rule: ClassRemapRule): (value: string) => string {
  const mapping = new Map<string, string>();
  if (rule.mode === "offset") {
    if (!Number.isSafeInteger(rule.offset)) throw new Error("Offset must be a whole number within the safe integer range.");
  } else {
    if (!rule.mapping.length) throw new Error("Add at least one class mapping.");
    for (const row of rule.mapping) {
      const from = parseNonNegativeClassId(row.from, "Original class ID");
      const to = parseNonNegativeClassId(row.to, "New class ID");
      if (mapping.has(from)) throw new Error(`Class ${from} has more than one mapping.`);
      mapping.set(from, to);
    }
  }
  return (value) => {
    const from = parseNonNegativeClassId(value);
    const target = rule.mode === "offset" ? String(Number(from) + rule.offset) : mapping.get(from) ?? from;
    return parseNonNegativeClassId(target, `Result for class ${from}`);
  };
}

export function summarizeClassRemap(classIds: readonly string[], rule: ClassRemapRule): ClassRemapSummary {
  const remap = createClassIdRemapper(rule);
  const changes = new Map<string, { from: string; to: string; count: number }>();
  let changedCount = 0;
  for (const value of classIds) {
    const from = parseNonNegativeClassId(value);
    const to = remap(from);
    if (to === from) continue;
    changedCount++;
    const change = changes.get(from) ?? { from, to, count: 0 };
    change.count++;
    changes.set(from, change);
  }
  return { changedCount, changes: [...changes.values()].sort((a, b) => Number(a.from) - Number(b.from)) };
}

export function remapYoloClassIds(text: string, rule: ClassRemapRule): ClassRemapSummary & { text: string } {
  const remap = createClassIdRemapper(rule);
  const lines = text.split(/(\r\n|\n|\r)/);
  const classIds: string[] = [];
  for (let index = 0; index < lines.length; index += 2) {
    const line = lines[index]!;
    if (!line.trim()) continue;
    const fields = line.trim().split(/\s+/);
    const coordinates = fields.slice(1).map(Number);
    if (fields.length !== 5 || !coordinates.every(Number.isFinite) || coordinates[2]! <= 0 || coordinates[3]! <= 0) {
      throw new Error(`Line ${index / 2 + 1}: expected a Detection class ID and four valid box coordinates.`);
    }
    try {
      const from = parseNonNegativeClassId(fields[0]!);
      const to = remap(from);
      classIds.push(from);
      if (to !== from) lines[index] = line.replace(/^(\s*)\S+/, (_match, space: string) => `${space}${to}`);
    } catch (error) {
      throw new Error(`Line ${index / 2 + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return { ...summarizeClassRemap(classIds, rule), text: lines.join("") };
}
