// Desktop app: every kind of preset is a JSON file in its folder under Documents/Easy Labeling
// (getEasyLabelingProfileDirectory in src/platform/tauri-desktop.ts). Saving writes there directly, without a
// dialog. The web build has no such folder (null below), so its presets stay in the dataset's .easy-labeling files.
// Subfolders group presets (any depth); a preset's fileName is its path inside the kind's folder ("SEM/fine.json").
// Folders whose name starts with "." are the app's own and are not listed.
import { isFileHandleLike, isNotFoundError, readFileText, writeTextFileByName } from "../../platform/file-system-access.js";
import type { DirectoryHandleLike, FileHandleLike } from "../../types/files.js";

/** Every profile folder kind; "class-info" holds class files (.yaml), the others JSON presets. */
export type ProfilePresetKind = EasyLabelingProfileDirectoryKind;

/** Whether a file name is one of this kind's files. */
export function isProfilePresetFileName(kind: ProfilePresetKind, name: string): boolean {
  return kind === "class-info" ? /\.ya?ml$/i.test(name) : name.toLowerCase().endsWith(".json");
}

export interface ProfilePresetFile {
  /** Path inside the kind's folder, "/"-separated ("SEM/Metal pattern/fine.json"). */
  fileName: string;
  contents: string;
}

export interface ProfilePresetFolder {
  readonly name: string;
  /** The .json files of the folder and its subfolders, in natural path order. */
  list(): Promise<ProfilePresetFile[]>;
  exists(fileName: string): Promise<boolean>;
  /**
   * Writes the preset called `name`. `fileName` is the file it was loaded from: that file is overwritten.
   * Otherwise it goes to `<name>.json` in the kind's save folder (getPresetSaveFolder), asking first when that
   * file already exists. Returns the file name, or null when the user declined.
   */
  save(name: string, contents: string, fileName?: string | null): Promise<string | null>;
  /** Deletes a preset file; a file already gone is fine. */
  remove(fileName: string): Promise<void>;
  /** Every subfolder path, empty ones included, in natural order. */
  folders(): Promise<string[]>;
  /** Creates a subfolder ("a/b" nests); names are cleaned like file names. Returns its path. */
  createFolder(path: string): Promise<string>;
  /** Moves a preset file into `folder` ("" = the top). Refuses to replace a file there. Returns the new fileName. */
  move(fileName: string, folder: string): Promise<string>;
  /** Renames a subfolder in place (its presets and subfolders go along). Refuses a name already used there. Returns the new path. */
  renameFolder(path: string, name: string): Promise<string>;
  /**
   * Removes a subfolder. Its presets are moved to `.trash/<time>/<path>` in the kind's folder (not listed, kept
   * for recovery). Returns how many presets were moved there.
   */
  removeFolder(path: string): Promise<number>;
}

export interface ProfilePresetWindow {
  getEasyLabelingProfileDirectory?: (kind: EasyLabelingProfileDirectoryKind) => Promise<FileSystemDirectoryHandle>;
  confirm?: (message?: string) => boolean;
  localStorage?: Pick<Storage, "getItem" | "setItem">;
}

const SAVE_FOLDER_KEY = "easyLabeling.presetSaveFolder.";

/** Subfolder new presets of this kind are saved in ("" = the top), kept in this app's storage. */
export function getPresetSaveFolder(windowRef: ProfilePresetWindow, kind: ProfilePresetKind): string {
  try { return windowRef.localStorage?.getItem(SAVE_FOLDER_KEY + kind) ?? ""; } catch { return ""; }
}

export function setPresetSaveFolder(windowRef: ProfilePresetWindow, kind: ProfilePresetKind, folder: string): void {
  try { windowRef.localStorage?.setItem(SAVE_FOLDER_KEY + kind, folder); } catch { /* storage unavailable: new presets go to the top */ }
}

/** A folder path with each name cleaned like a file name; "" for the top. */
export function presetFolderPath(path: string): string {
  return path.split(/[\\/]+/).map((part) => part.trim().replace(/[<>:"|?*\u0000-\u001f]/g, "-").replace(/^\.+|[. ]+$/g, ""))
    .filter(Boolean).join("/");
}

/** The subfolder part of a preset's fileName ("" at the top). */
export function presetFolderOf(fileName: string): string {
  const slash = fileName.lastIndexOf("/");
  return slash < 0 ? "" : fileName.slice(0, slash);
}

/** `<name>.json` with the characters Windows does not allow in file names replaced (as save_library_file does). */
export function presetFileName(name: string): string {
  const safe = name.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").replace(/[. ]+$/, "") || "preset";
  return safe.toLowerCase().endsWith(".json") ? safe : `${safe}.json`;
}

export async function openProfilePresetFolder(windowRef: ProfilePresetWindow, kind: ProfilePresetKind): Promise<ProfilePresetFolder | null> {
  if (typeof windowRef.getEasyLabelingProfileDirectory !== "function") return null;
  const directory = await windowRef.getEasyLabelingProfileDirectory(kind) as unknown as RemovableDirectory;
  /** The folder holding `fileName` and the file's own name; refuses paths that leave the kind's folder. */
  const locate = async (fileName: string, create: boolean): Promise<{ parent: RemovableDirectory; name: string }> => {
    const parts = fileName.split("/");
    if (parts.some((part) => part === "" || part === "." || part === ".." || part.includes("\\"))) {
      throw new Error(`Not a preset path: ${fileName}`);
    }
    let parent = directory;
    for (const part of parts.slice(0, -1)) parent = await parent.getDirectoryHandle(part, { create }) as RemovableDirectory;
    return { parent, name: parts[parts.length - 1]! };
  };
  const exists = async (fileName: string): Promise<boolean> => {
    try {
      const { parent, name } = await locate(fileName, false);
      await parent.getFileHandle(name);
      return true;
    } catch (error) {
      if (isNotFoundError(error)) return false;
      throw error;
    }
  };
  /** Moves every file and subfolder of `from` to `to` (written first, then removed), then removes `from`. */
  const moveTree = async (from: string, to: string): Promise<number> => {
    const source = await walkDirectory(directory, from);
    const files = await listAllFiles(source, "");
    const folders = await listAllFolders(source, "");
    await locate(`${to}/x`, true);
    for (const folder of folders) await locate(`${to}/${folder}/x`, true);
    for (const file of files) {
      const destination = await locate(`${to}/${file.path}`, true);
      await writeTextFileByName(destination.parent, destination.name, await readFileText(file.handle));
    }
    for (const file of files) {
      const { parent, name } = await locate(`${from}/${file.path}`, false);
      await parent.removeEntry?.(name);
    }
    // Deepest first, so each folder is empty when it goes.
    for (const folder of [...folders].sort((left, right) => right.split("/").length - left.split("/").length)) {
      const { parent, name } = await locate(`${from}/${folder}`, false);
      await parent.removeEntry?.(name);
    }
    const { parent, name } = await locate(from, false);
    await parent.removeEntry?.(name);
    return files.filter((file) => isProfilePresetFileName(kind, file.path)).length;
  };
  return {
    name: directory.name,
    exists,
    async list() {
      const files = (await listPresetFiles(directory, "", kind))
        .sort((left, right) => left.fileName.localeCompare(right.fileName, undefined, { numeric: true, sensitivity: "base" }));
      return Promise.all(files.map(async ({ fileName, handle }) => ({ fileName, contents: await readFileText(handle) })));
    },
    async save(name, contents, fileName) {
      const saveFolder = presetFolderPath(getPresetSaveFolder(windowRef, kind));
      const target = fileName ?? (saveFolder ? `${saveFolder}/${presetFileName(name)}` : presetFileName(name));
      if (!fileName && await exists(target)
        && !(windowRef.confirm?.(`"${target}" already exists in ${directory.name}. Replace it?`) ?? true)) return null;
      const { parent, name: targetName } = await locate(target, true);
      await writeTextFileByName(parent, targetName, contents);
      return target;
    },
    async remove(fileName) {
      try {
        const { parent, name } = await locate(fileName, false);
        await parent.removeEntry?.(name);
      } catch (error) {
        if (!isNotFoundError(error)) throw error;
      }
    },
    async folders() {
      return (await listPresetFolders(directory, ""))
        .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }));
    },
    async createFolder(path) {
      const folder = presetFolderPath(path);
      if (!folder) throw new Error("Enter a folder name.");
      await locate(`${folder}/x`, true);
      return folder;
    },
    async renameFolder(path, name) {
      const from = presetFolderPath(path);
      const leaf = presetFolderPath(name);
      if (!from) throw new Error("The top folder cannot be renamed.");
      if (!leaf || leaf.includes("/")) throw new Error("Enter a folder name without \"/\".");
      const parentPath = presetFolderOf(from);
      const to = parentPath ? `${parentPath}/${leaf}` : leaf;
      if (to === from) return from;
      const siblings = await locate(to, false);
      if (await hasEntry(siblings.parent, siblings.name) || await exists(`${to}.json`)) throw new Error(`"${leaf}" already exists there.`);
      await moveTree(from, to);
      return to;
    },
    async removeFolder(path) {
      const from = presetFolderPath(path);
      if (!from) throw new Error("The top folder cannot be removed.");
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      return moveTree(from, `.trash/${stamp}/${from}`);
    },
    async move(fileName, folder) {
      const base = fileName.slice(fileName.lastIndexOf("/") + 1);
      const target = folder ? `${presetFolderPath(folder)}/${base}` : base;
      if (target === fileName) return fileName;
      if (await exists(target)) throw new Error(`"${base}" already exists in ${folder || "the top folder"}.`);
      const { parent, name } = await locate(fileName, false);
      const contents = await readFileText(await parent.getFileHandle(name));
      const destination = await locate(target, true);
      // Written before the old file goes, so a failure leaves the preset where it was.
      await writeTextFileByName(destination.parent, destination.name, contents);
      await parent.removeEntry?.(name);
      return target;
    }
  };
}

type RemovableDirectory = DirectoryHandleLike & { removeEntry?(name: string): Promise<void> };

async function listPresetFiles(directory: DirectoryHandleLike, prefix: string, kind: ProfilePresetKind): Promise<Array<{ fileName: string; handle: FileHandleLike }>> {
  const found: Array<{ fileName: string; handle: FileHandleLike }> = [];
  for await (const entry of directory.values()) {
    if (isFileHandleLike(entry)) {
      if (isProfilePresetFileName(kind, entry.name)) found.push({ fileName: prefix + entry.name, handle: entry });
    } else if (entry.kind === "directory" && !entry.name.startsWith(".") && "values" in entry) {
      found.push(...await listPresetFiles(entry, `${prefix}${entry.name}/`, kind));
    }
  }
  return found;
}

async function listPresetFolders(directory: DirectoryHandleLike, prefix: string): Promise<string[]> {
  const found: string[] = [];
  for await (const entry of directory.values()) {
    if (entry.kind === "directory" && !entry.name.startsWith(".") && "values" in entry) {
      found.push(prefix + entry.name, ...await listPresetFolders(entry, `${prefix}${entry.name}/`));
    }
  }
  return found;
}

async function walkDirectory(directory: DirectoryHandleLike, path: string): Promise<DirectoryHandleLike> {
  let current = directory;
  for (const part of path.split("/")) current = await current.getDirectoryHandle(part);
  return current;
}

async function hasEntry(directory: DirectoryHandleLike, name: string): Promise<boolean> {
  for await (const entry of directory.values()) if (entry.name.toLowerCase() === name.toLowerCase()) return true;
  return false;
}

/** Every file (any type, dot folders included) under `directory`, by relative path. */
async function listAllFiles(directory: DirectoryHandleLike, prefix: string): Promise<Array<{ path: string; handle: FileHandleLike }>> {
  const found: Array<{ path: string; handle: FileHandleLike }> = [];
  for await (const entry of directory.values()) {
    if (isFileHandleLike(entry)) found.push({ path: prefix + entry.name, handle: entry });
    else if (entry.kind === "directory" && "values" in entry) found.push(...await listAllFiles(entry, `${prefix}${entry.name}/`));
  }
  return found;
}

async function listAllFolders(directory: DirectoryHandleLike, prefix: string): Promise<string[]> {
  const found: string[] = [];
  for await (const entry of directory.values()) {
    if (entry.kind === "directory" && "values" in entry) found.push(prefix + entry.name, ...await listAllFolders(entry, `${prefix}${entry.name}/`));
  }
  return found;
}
