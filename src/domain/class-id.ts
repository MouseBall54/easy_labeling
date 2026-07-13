export function parseNonNegativeClassId(input: string, field = "Class ID"): string {
  const value = input.trim();
  if (!value) {
    throw new Error(`${field} is required.`);
  }
  if (!/^\d+$/.test(value)) {
    throw new Error(`${field} must be 0 or a positive whole number.`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`${field} is too large.`);
  }
  return String(parsed);
}
