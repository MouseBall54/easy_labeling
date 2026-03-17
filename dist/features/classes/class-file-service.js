import { NEW_CLASS_FILE_SEED_CONTENT, hasCaseInsensitiveNameCollision, normalizeNewClassFileName, parseClassContent, parseClassContentForEditor, validateAndSerializeClassRows } from "../../domain/class-files.js";
export async function readClassNamesFromFileHandle(fileHandle) {
    const file = await fileHandle.getFile();
    const content = await file.text();
    return { classNames: parseClassContent(content) };
}
export async function readClassFileRowsForEditor(fileHandle) {
    const file = await fileHandle.getFile();
    const content = await file.text();
    return parseClassContentForEditor(content);
}
export async function validateAndSaveClassRowsToFileHandle(fileHandle, rows) {
    const validation = validateAndSerializeClassRows(rows);
    if (!validation.isValid) {
        return { saved: false, validation };
    }
    const writable = await fileHandle.createWritable();
    await writable.write(validation.newContent);
    await writable.close();
    return { saved: true, validation };
}
export async function createNewClassFile(folderHandle, inputName) {
    const fileName = normalizeNewClassFileName(inputName);
    const existingNames = [];
    for await (const entry of folderHandle.values()) {
        existingNames.push(entry.name);
    }
    if (hasCaseInsensitiveNameCollision(existingNames, fileName)) {
        return {
            created: false,
            fileName,
            fileHandle: null
        };
    }
    const fileHandle = await folderHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(NEW_CLASS_FILE_SEED_CONTENT);
    await writable.close();
    return {
        created: true,
        fileName,
        fileHandle
    };
}
