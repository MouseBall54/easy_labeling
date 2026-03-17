export const DARK_MODE_STORAGE_KEY = "darkMode";

export interface DarkModeInput {
  enabled: boolean;
  bodyElement: HTMLElement;
  documentRef: Document;
  storage: Pick<Storage, "setItem">;
}

export function applyDarkMode(input: DarkModeInput): void {
  input.bodyElement.classList.toggle("dark-mode", input.enabled);
  input.storage.setItem(DARK_MODE_STORAGE_KEY, input.enabled ? "enabled" : "disabled");

  const buttonsToUpdate = input.documentRef.querySelectorAll(
    'label[for="showLabeled"], label[for="showUnlabeled"], label[for="drawMode"], label[for="editMode"]'
  );

  if (input.enabled) {
    for (const button of buttonsToUpdate) {
      button.classList.remove("btn-outline-primary");
      button.classList.add("btn-outline-secondary");
    }
    return;
  }

  for (const button of buttonsToUpdate) {
    button.classList.remove("btn-outline-secondary");
    button.classList.add("btn-outline-primary");
  }
}

export function readStoredDarkMode(storage: Pick<Storage, "getItem">): boolean {
  return storage.getItem(DARK_MODE_STORAGE_KEY) === "enabled";
}
