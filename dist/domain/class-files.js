export const NEW_CLASS_FILE_SEED_CONTENT = "# YAML Class file. Format: id: name\n0: class1\n1: class2";
function parseLoadableRows(content) {
    const classData = [];
    const lines = content.split("\n");
    lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("#") || trimmedLine === "")
            return;
        const parts = trimmedLine.split(":");
        if (parts.length >= 2) {
            const id = parts[0].trim();
            const name = parts.slice(1).join(":").trim();
            if (!Number.isNaN(parseInt(id, 10)) && name) {
                classData.push({ id, name });
            }
        }
    });
    return classData;
}
export function parseClassContent(content) {
    const classNames = new Map();
    const classData = parseLoadableRows(content);
    classData.forEach((row) => {
        classNames.set(row.id, row.name);
    });
    return classNames;
}
export function parseClassContentForEditor(content) {
    const classData = parseLoadableRows(content);
    classData.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
    return classData;
}
export function validateAndSerializeClassRows(rows) {
    const classData = [];
    const seenIds = new Set();
    let isValid = true;
    const invalidIdRows = [];
    const duplicateIdRows = [];
    const emptyNameRows = [];
    rows.forEach((row, index) => {
        const id = row.id.trim();
        const name = row.name.trim();
        const numId = parseInt(id, 10);
        if (id === "" && name === "") {
            return;
        }
        if (Number.isNaN(numId) || String(numId) !== id) {
            invalidIdRows.push(index);
            isValid = false;
        }
        else if (seenIds.has(id)) {
            duplicateIdRows.push(index);
            isValid = false;
        }
        else {
            seenIds.add(id);
        }
        if (name === "") {
            emptyNameRows.push(index);
            isValid = false;
        }
        if (isValid) {
            classData.push({ id, name });
        }
    });
    classData.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
    const newContent = classData.map((item) => `${item.id}: ${item.name}`).join("\n");
    return {
        isValid,
        classData,
        newContent,
        invalidIdRows,
        duplicateIdRows,
        emptyNameRows
    };
}
export function normalizeNewClassFileName(inputName) {
    let fileName = inputName.trim();
    if (!fileName.toLowerCase().endsWith(".yaml") && !fileName.toLowerCase().endsWith(".yml")) {
        fileName += ".yaml";
    }
    return fileName;
}
export function hasCaseInsensitiveNameCollision(existingNames, targetName) {
    return existingNames.some((existingName) => existingName.toLowerCase() === targetName.toLowerCase());
}
