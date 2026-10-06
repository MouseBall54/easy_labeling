export interface ClassFileRow {
  id: string;
  name: string;
  color?: string;
}

export interface ClassFileSaveResult {
  isValid: boolean;
  classData: ClassFileRow[];
  newContent: string;
  invalidIdRows: number[];
  duplicateIdRows: number[];
  emptyNameRows: number[];
  invalidColorRows: number[];
}

export const NEW_CLASS_FILE_SEED_CONTENT = "# YAML Class file. Format: id: name\n0: class1\n1: class2";

export function normalizeClassName(value: string): string {
  let name = value.trim();
  // Older inference exports re-encoded names that already contained string delimiters.
  while (name.length > 1) {
    if (name.startsWith('"') && name.endsWith('"')) {
      try { name = JSON.parse(name); } catch { break; }
    } else if (name.startsWith("'") && name.endsWith("'")) {
      name = name.slice(1, -1).replace(/''/g, "'");
    } else break;
  }
  return name;
}

function parseLoadableRows(content: string): ClassFileRow[] {
  const classData: ClassFileRow[] = [];
  const lines = content.split("\n");

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("#") || trimmedLine === "") return;

    const parts = trimmedLine.split(":");
    if (parts.length >= 2) {
      const id = parts[0].trim();
      const name = normalizeClassName(parts.slice(1).join(":"));
      if (!Number.isNaN(parseInt(id, 10)) && name) {
        classData.push({ id, name });
      }
    }
  });

  return classData;
}

export function parseClassContent(content: string): Map<string, string> {
  const classNames = new Map<string, string>();
  const classData = parseLoadableRows(content);

  classData.forEach((row) => {
    classNames.set(row.id, row.name);
  });

  return classNames;
}

export function parseClassContentForEditor(content: string): ClassFileRow[] {
  const classData = parseLoadableRows(content);
  const colors = parseClassColors(content);
  classData.forEach((row) => {
    const color = colors.get(row.id);
    if (color) row.color = color;
  });
  classData.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
  return classData;
}

export function parseClassColors(content: string): Map<string, string> {
  const colors = new Map<string, string>();
  for (const match of content.matchAll(/^\s*# easy-labeling-color (\d+): (#[\da-f]{6})\s*$/gim)) {
    colors.set(match[1]!, match[2]!.toLowerCase());
  }
  return colors;
}

export function validateAndSerializeClassRows(rows: ClassFileRow[]): ClassFileSaveResult {
  const classData: ClassFileRow[] = [];
  const seenIds = new Set<string>();
  let isValid = true;
  const invalidIdRows: number[] = [];
  const duplicateIdRows: number[] = [];
  const emptyNameRows: number[] = [];
  const invalidColorRows: number[] = [];

  rows.forEach((row, index) => {
    const id = row.id.trim();
    const name = normalizeClassName(row.name);
    const color = row.color?.trim().toLowerCase();

    const numId = parseInt(id, 10);
    if (id === "" && name === "") {
      return;
    }

    if (Number.isNaN(numId) || String(numId) !== id) {
      invalidIdRows.push(index);
      isValid = false;
    } else if (seenIds.has(id)) {
      duplicateIdRows.push(index);
      isValid = false;
    } else {
      seenIds.add(id);
    }

    if (name === "") {
      emptyNameRows.push(index);
      isValid = false;
    }

    if (color !== undefined && !/^#[\da-f]{6}$/.test(color)) {
      invalidColorRows.push(index);
      isValid = false;
    }

    if (isValid) {
      classData.push({ id, name, ...(color ? { color } : {}) });
    }
  });

  classData.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
  // YAML comments keep existing ID/name readers compatible with custom colors.
  const newContent = classData.map((item) => `${item.color ? `# easy-labeling-color ${item.id}: ${item.color}\n` : ""}${item.id}: ${item.name}`).join("\n");

  return {
    isValid,
    classData,
    newContent,
    invalidIdRows,
    duplicateIdRows,
    emptyNameRows,
    invalidColorRows
  };
}

export function normalizeNewClassFileName(inputName: string): string {
  let fileName = inputName.trim();
  if (!fileName.toLowerCase().endsWith(".yaml") && !fileName.toLowerCase().endsWith(".yml")) {
    fileName += ".yaml";
  }
  return fileName;
}

export function hasCaseInsensitiveNameCollision(existingNames: string[], targetName: string): boolean {
  return existingNames.some((existingName) => existingName.toLowerCase() === targetName.toLowerCase());
}

export function validateNewClassFileName(inputName: string, existingNames: string[] = []): string {
  const trimmed = inputName.trim();
  if (!trimmed) {
    throw new Error("Enter a file name.");
  }
  if (/[<>:"/\\|?*\u0000-\u001F]/.test(trimmed)) {
    throw new Error("The file name contains unsupported characters.");
  }

  const fileName = normalizeNewClassFileName(trimmed);
  const stem = fileName.replace(/\.(?:yaml|yml)$/i, "");
  if (!stem || stem === "." || stem === ".." || /[. ]$/.test(stem)) {
    throw new Error("Enter a valid file name.");
  }
  if (/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(stem)) {
    throw new Error("This file name is reserved by the operating system.");
  }
  if (fileName.length > 255) {
    throw new Error("The file name is too long.");
  }
  if (hasCaseInsensitiveNameCollision(existingNames, fileName)) {
    throw new Error("A class file with this name already exists.");
  }
  return fileName;
}
