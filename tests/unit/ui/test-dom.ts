type EventListener = (event: { preventDefault(): void }) => void;

class FakeClassList {
  private readonly classes = new Set<string>();

  add(...tokens: string[]): void {
    for (const token of tokens) {
      this.classes.add(token);
    }
  }

  remove(...tokens: string[]): void {
    for (const token of tokens) {
      this.classes.delete(token);
    }
  }

  contains(token: string): boolean {
    return this.classes.has(token);
  }

  toggle(token: string, force?: boolean): boolean {
    if (force === true) {
      this.classes.add(token);
      return true;
    }
    if (force === false) {
      this.classes.delete(token);
      return false;
    }
    if (this.classes.has(token)) {
      this.classes.delete(token);
      return false;
    }
    this.classes.add(token);
    return true;
  }

  replaceAll(className: string): void {
    this.classes.clear();
    for (const token of className.split(/\s+/).filter(Boolean)) {
      this.classes.add(token);
    }
  }

  toString(): string {
    return [...this.classes].join(" ");
  }
}

export class FakeElement {
  readonly children: FakeElement[] = [];
  readonly style: { display: string; maxHeight?: string } = { display: "" };
  readonly dataset: Record<string, string> = {};
  readonly classList = new FakeClassList();
  readonly listeners = new Map<string, EventListener[]>();

  id = "";
  tagName: string;
  textContent: string | null = null;
  innerHTML = "";
  value = "";
  checked = false;
  disabled = false;
  selectedIndex = 0;
  draggable = false;
  href = "";
  type = "";
  alt = "";
  offsetWidth = 0;
  htmlFor = "";
  title = "";
  readonly attributes = new Map<string, string>();

  private classNameValue = "";

  constructor(tagName: string) {
    this.tagName = tagName.toLowerCase();
  }

  get className(): string {
    return this.classNameValue;
  }

  set className(value: string) {
    this.classNameValue = value;
    this.classList.replaceAll(value);
  }

  appendChild(child: FakeElement | FakeDocumentFragment): FakeElement {
    if (child instanceof FakeDocumentFragment) {
      for (const grandChild of child.children) {
        this.children.push(grandChild);
      }
      return this;
    }

    this.children.push(child);
    return child;
  }

  addEventListener(type: string, listener: EventListener): void {
    const existing = this.listeners.get(type) ?? [];
    existing.push(listener);
    this.listeners.set(type, existing);
  }

  removeEventListener(type: string, listener: EventListener): void {
    const existing = this.listeners.get(type);
    if (!existing) {
      return;
    }
    this.listeners.set(
      type,
      existing.filter((item) => item !== listener)
    );
  }

  dispatch(type: string): void {
    const listeners = this.listeners.get(type) ?? [];
    for (const listener of listeners) {
      listener({
        preventDefault: () => {
          return;
        }
      });
    }
  }

  querySelector(selector: string): FakeElement | null {
    if (selector === "i") {
      const icon = this.children.find((child) => child.tagName === "i");
      return icon ?? null;
    }

    if (selector === "span") {
      const span = this.children.find((child) => child.tagName === "span");
      return span ?? null;
    }

    if (selector.startsWith(".")) {
      const className = selector.slice(1);
      return this.children.find((child) => child.classList.contains(className)) ?? null;
    }

    return null;
  }

  querySelectorAll(selector: string): FakeElement[] {
    if (selector === ".btn[data-label-class]") {
      return this.children.filter((child) => child.classList.contains("btn") && Boolean(child.dataset.labelClass));
    }
    if (selector === '[data-ui="filter-class"]') {
      return this.children.filter((child) => child.dataset.ui === "filter-class");
    }
    if (selector === '[data-ui="filter-all"]') {
      return this.children.filter((child) => child.dataset.ui === "filter-all");
    }
    return [];
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  focus(): void {
    return;
  }

  select(): void {
    return;
  }
}

export class FakeDocumentFragment {
  readonly children: FakeElement[] = [];

  appendChild(child: FakeElement): FakeElement {
    this.children.push(child);
    return child;
  }
}

export class FakeDocument {
  readonly body = new FakeElement("body");
  readonly elementsById = new Map<string, FakeElement>();
  readonly allElements: FakeElement[] = [this.body];

  addElement(element: FakeElement): FakeElement {
    this.allElements.push(element);
    if (element.id) {
      this.elementsById.set(element.id, element);
    }
    return element;
  }

  getElementById(id: string): FakeElement | null {
    return this.elementsById.get(id) ?? null;
  }

  querySelector(selector: string): FakeElement | null {
    if (selector.startsWith(".")) {
      const className = selector.slice(1);
      return this.allElements.find((element) => element.classList.contains(className)) ?? null;
    }
    return null;
  }

  querySelectorAll(selector: string): FakeElement[] {
    if (
      selector ===
      'label[for="showLabeled"], label[for="showUnlabeled"], label[for="drawMode"], label[for="editMode"]'
    ) {
      const accepted = new Set(["showLabeled", "showUnlabeled", "drawMode", "editMode"]);
      return this.allElements.filter((element) => element.tagName === "label" && accepted.has(element.htmlFor));
    }
    return [];
  }

  createElement(tagName: string): FakeElement {
    return new FakeElement(tagName);
  }

  createDocumentFragment(): FakeDocumentFragment {
    return new FakeDocumentFragment();
  }
}

function parseAttributes(attributeText: string): Record<string, string> {
  const matches = attributeText.matchAll(/([a-zA-Z-]+)="([^"]*)"/g);
  const attrs: Record<string, string> = {};
  for (const match of matches) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

export function createFakeDocumentFromHtmlFragment(html: string): FakeDocument {
  const doc = new FakeDocument();
  const tagMatches = html.matchAll(/<([a-zA-Z0-9-]+)([^>]*)>/g);
  for (const match of tagMatches) {
    const tagName = match[1];
    const attrs = parseAttributes(match[2]);
    const element = new FakeElement(tagName);
    if (attrs.id) {
      element.id = attrs.id;
    }
    if (attrs.class) {
      element.className = attrs.class;
    }
    if (attrs.for) {
      element.htmlFor = attrs.for;
    }
    doc.addElement(element);
  }

  return doc;
}
