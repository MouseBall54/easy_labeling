export interface LabelClassOption {
  id: string;
  displayName: string;
}

export interface LabelClassModalContentInput {
  defaultValue: string;
  labelClassInputElement: HTMLInputElement;
  classSelectionContainerElement: HTMLElement;
  classOptions: LabelClassOption[];
}

export function renderLabelClassModalContent(input: LabelClassModalContentInput): void {
  input.labelClassInputElement.value = input.defaultValue;
  input.classSelectionContainerElement.innerHTML = "";

  if (input.classOptions.length === 0) {
    input.classSelectionContainerElement.innerHTML =
      '<p class="text-muted">No predefined or used classes found. Enter an ID manually.</p>';
    return;
  }

  for (const classOption of input.classOptions) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-sm btn-outline-primary m-1";
    button.textContent = classOption.displayName;
    button.dataset.classId = classOption.id;
    button.addEventListener("click", () => {
      input.labelClassInputElement.value = classOption.id;
      input.labelClassInputElement.focus();
    });
    input.classSelectionContainerElement.appendChild(button);
  }
}
