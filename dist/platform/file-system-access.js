function isObject(value) {
    return typeof value === "object" && value !== null;
}
function hasName(value) {
    return isObject(value) && typeof value.name === "string";
}
function hasGetFile(value) {
    return isObject(value) && typeof value.getFile === "function";
}
function hasCreateWritable(value) {
    return isObject(value) && typeof value.createWritable === "function";
}
export function isNotFoundError(error) {
    return hasName(error) && error.name === "NotFoundError";
}
export function isFileHandleLike(entry) {
    return entry.kind === "file" && hasGetFile(entry) && hasCreateWritable(entry);
}
export async function getSubdirectoryHandle(directoryHandle, name, options) {
    return directoryHandle.getDirectoryHandle(name, options);
}
export async function listFileHandles(directoryHandle) {
    const fileHandles = [];
    for await (const entry of directoryHandle.values()) {
        if (isFileHandleLike(entry)) {
            fileHandles.push(entry);
        }
    }
    return fileHandles;
}
export async function readFileText(fileHandle) {
    const file = await fileHandle.getFile();
    return file.text();
}
export async function readFileArrayBuffer(fileHandle) {
    const file = await fileHandle.getFile();
    if (typeof file.arrayBuffer !== "function") {
        throw new TypeError(`arrayBuffer() is unavailable for file: ${file.name}`);
    }
    return file.arrayBuffer();
}
export async function readTextFileByName(directoryHandle, fileName) {
    const fileHandle = await directoryHandle.getFileHandle(fileName);
    return readFileText(fileHandle);
}
export async function writeTextFileByName(directoryHandle, fileName, content) {
    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
}
