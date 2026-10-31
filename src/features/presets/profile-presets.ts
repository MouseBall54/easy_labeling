// Desktop app: every kind of preset is a JSON file in its folder under Documents/Easy Labeling
// (getEasyLabelingProfileDirectory in src/platform/tauri-desktop.ts). Saving writes there directly, without a
// dialog. The web build has no such folder (null below), so its presets stay in the dataset's .easy-labeling files.
import { isNotFoundError, listFileHandles, readFileText, writeTextFileByName } from "../../platform/file-system-access.js";
import type { DirectoryHandleLike } from "../../types/files.js";

export type ProfilePresetKind = EasyLabelingLibraryFileKind;

export interface ProfilePresetFile {
  fileName: string;
  contents: string;
}

export interface ProfilePresetFolder {
  readonly name: string;
  /** The folder's .json files, in natural name order. */
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

/** `<name>.json` with the characters Windows does not allow in file names replaced (as save_library_file does). */
export function presetFileName(name: string): string {
  const safe = name.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").replace(/[. ]+$/, "") || "preset";
  return safe.toLowerCase().endsWith(".json") ? safe : `${safe}.json`;
}

export async function openProfilePresetFolder(windowRef: ProfilePresetWindow, kind: ProfilePresetKind): Promise<ProfilePresetFolder | null> {
  if (typeof windowRef.getEasyLabelingProfileDirectory !== "function") return null;
  const directory = await windowRef.getEasyLabelingProfileDirectory(kind) as unknown as DirectoryHandleLike & {
    removeEntry?(name: string): Promise<void>;
  };
  const exists = async (fileName: string): Promise<boolean> => {
    try {
      await directory.getFileHandle(fileName);
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
      const files = (await listFileHandles(directory)).filter((file) => file.name.toLowerCase().endsWith(".json"))
        .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: "base" }));
      return Promise.all(files.map(async (file) => ({ fileName: file.name, contents: await readFileText(file) })));
    },
    async save(name, contents, fileName) {
      const target = fileName ?? presetFileName(name);
      if (!fileName && await exists(target)
        && !(windowRef.confirm?.(`"${target}" already exists in ${directory.name}. Replace it?`) ?? true)) return null;
      await writeTextFileByName(directory, target, contents);
      return target;
    },
    async remove(fileName) {
      try {
        await directory.removeEntry?.(fileName);
      } catch (error) {
        if (!isNotFoundError(error)) throw error;
      }
    }
  };
}
