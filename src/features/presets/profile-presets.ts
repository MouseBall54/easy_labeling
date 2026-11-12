// Desktop app: every kind of preset is a JSON file in its folder under Documents/Easy Labeling
// (getEasyLabelingProfileDirectory in src/platform/tauri-desktop.ts). Saving writes there directly, without a
// dialog. The web build has no such folder (null below), so its presets stay in the dataset's .easy-labeling files.
// Subfolders group presets (any depth); a preset's fileName is its path inside the kind's folder ("SEM/fine.json").
// Folders whose name starts with "." are the app's own and are not listed.
import { isFileHandleLike, isNotFoundError, readFileText, writeTextFileByName } from "../../platform/file-system-access.js";
import type { DirectoryHandleLike, FileHandleLike } from "../../types/files.js";

export type ProfilePresetKind = EasyLabelingLibraryFileKind;

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
   * Otherwise it goes to `<name>.json`, asking first when that file already exists. Returns the file name,
   * or null when the user declined.
   */
  save(name: string, contents: string, fileName?: string | null): Promise<string | null>;
  /** Deletes a preset file; a file already gone is fine. */
  remove(fileName: string): Promise<void>;
}

export interface ProfilePresetWindow {
  getEasyLabelingProfileDirectory?: (kind: EasyLabelingProfileDirectoryKind) => Promise<FileSystemDirectoryHandle>;
  confirm?: (message?: string) => boolean;
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
  return {
    name: directory.name,
    exists,
    async list() {
      const files = (await listPresetFiles(directory, ""))
        .sort((left, right) => left.fileName.localeCompare(right.fileName, undefined, { numeric: true, sensitivity: "base" }));
      return Promise.all(files.map(async ({ fileName, handle }) => ({ fileName, contents: await readFileText(handle) })));
    },
    async save(name, contents, fileName) {
      const target = fileName ?? presetFileName(name);
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
    }
  };
}

type RemovableDirectory = DirectoryHandleLike & { removeEntry?(name: string): Promise<void> };

async function listPresetFiles(directory: DirectoryHandleLike, prefix: string): Promise<Array<{ fileName: string; handle: FileHandleLike }>> {
  const found: Array<{ fileName: string; handle: FileHandleLike }> = [];
  for await (const entry of directory.values()) {
    if (isFileHandleLike(entry)) {
      if (entry.name.toLowerCase().endsWith(".json")) found.push({ fileName: prefix + entry.name, handle: entry });
    } else if (entry.kind === "directory" && !entry.name.startsWith(".") && "values" in entry) {
      found.push(...await listPresetFiles(entry, `${prefix}${entry.name}/`));
    }
  }
  return found;
}
