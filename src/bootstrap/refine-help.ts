import {
  HELP_GROUP_IDS,
  HELP_LANGS,
  HELP_SVG_DEFS,
  HELP_UI,
  helpQueryTerms,
  helpTopics,
  searchHelpTopics,
  type HelpGroup,
  type HelpLang,
  type HelpTopic
} from "./refine-help-content.js";

/**
 * The Refine Lab guide: a <dialog> inside the Lab modal (so Bootstrap's focus trap keeps focus in it), shown in
 * the top layer over the Lab. English / Korean toggle, group tabs, a contents list, keyword search with
 * highlights, and links between topics. Loaded with import() the first time "?" is pressed.
 */
type GroupFilter = HelpGroup | "all";
const LANG_KEY = "easyLabeling.refineHelpLang";

let guide: { open(mode: "edge" | "reclass", topic?: string): void } | null = null;

export function openRefineHelp(doc: Document, options: { mode: "edge" | "reclass"; topic?: string }): void {
  guide ??= createGuide(doc);
  guide.open(options.mode, options.topic);
}

/** The language last chosen in this browser, else the browser's own. Storage may be unavailable. */
function initialLang(doc: Document): HelpLang {
  const win = doc.defaultView;
  try {
    const saved = win?.localStorage.getItem(LANG_KEY);
    if (saved === "en" || saved === "ko") return saved;
  } catch { /* private mode or blocked storage */ }
  return win?.navigator.language?.toLowerCase().startsWith("ko") ? "ko" : "en";
}

function createGuide(doc: Document): { open(mode: "edge" | "reclass", topic?: string): void } {
  const dialog = doc.getElementById("refineHelpDialog") as HTMLDialogElement;
  dialog.innerHTML = `${HELP_SVG_DEFS}
<div class="rh-shell">
  <header class="rh-header">
    <h5 id="refineHelpTitle" class="rh-title"><i class="bi bi-question-circle" aria-hidden="true"></i> <span data-ref="title"></span></h5>
    <label class="rh-search"><i class="bi bi-search" aria-hidden="true"></i><input id="refineHelpSearch" type="search" class="form-control form-control-sm" autocomplete="off"></label>
    <div class="rh-lang refine-scope" role="group" data-ref="lang">${HELP_LANGS.map((lang) => `<button type="button" data-lang="${lang.id}" lang="${lang.id}">${lang.label}</button>`).join("")}</div>
    <button type="button" class="btn-close" data-act="close"></button>
  </header>
  <nav class="rh-groups refine-scope" role="group" data-ref="groups">
    <button type="button" data-group="all"></button>${HELP_GROUP_IDS.map((id) => `<button type="button" data-group="${id}"></button>`).join("")}
  </nav>
  <div class="rh-body">
    <aside class="rh-toc"><ul></ul><p class="rh-empty" hidden></p></aside>
    <div class="rh-content" tabindex="-1"></div>
  </div>
</div>`;
  const ref = <T extends HTMLElement>(name: string): T => dialog.querySelector<T>(`[data-ref="${name}"]`)!;
  const search = dialog.querySelector<HTMLInputElement>("#refineHelpSearch")!;
  const closeButton = dialog.querySelector<HTMLButtonElement>("[data-act='close']")!;
  const tocAside = dialog.querySelector<HTMLElement>(".rh-toc")!;
  const toc = tocAside.querySelector("ul")!;
  const empty = dialog.querySelector<HTMLElement>(".rh-empty")!;
  const content = dialog.querySelector<HTMLElement>(".rh-content")!;
  let lang = initialLang(doc);
  let group: GroupFilter = "all";
  let active = "";

  /** Window strings of the current language. */
  const applyLang = (): void => {
    const ui = HELP_UI[lang];
    dialog.lang = lang;
    ref("title").textContent = ui.title;
    search.placeholder = ui.search;
    search.setAttribute("aria-label", ui.searchLabel);
    closeButton.title = ui.close;
    closeButton.setAttribute("aria-label", ui.close);
    ref("lang").setAttribute("aria-label", ui.language);
    ref("groups").setAttribute("aria-label", ui.sections);
    tocAside.setAttribute("aria-label", ui.contents);
    dialog.querySelectorAll<HTMLButtonElement>("[data-group]").forEach((button) => {
      const id = button.dataset.group as GroupFilter;
      button.textContent = id === "all" ? ui.all : ui.groups[id];
    });
    dialog.querySelectorAll<HTMLButtonElement>("[data-lang]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.lang === lang)));
  };

  const articleOf = (topic: HelpTopic): HTMLElement => {
    const article = doc.createElement("article");
    article.className = "rh-topic";
    article.id = `refineHelp-${topic.id}`;
    article.dataset.topicId = topic.id;
    article.innerHTML = `<h3>${topic.title} <span class="rh-badge">${HELP_UI[lang].groups[topic.group]}</span></h3>`
      + (topic.figure ? `<figure class="rh-figure">${topic.figure}${topic.caption ? `<figcaption>${topic.caption}</figcaption>` : ""}</figure>` : "")
      + `<div class="rh-text">${topic.html}</div>`;
    return article;
  };
  /** Wraps every query word in <mark>, in text only (not inside the drawings). */
  const highlight = (root: HTMLElement, terms: string[]): void => {
    if (!terms.length) return;
    const pattern = new RegExp(terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "gi");
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (node.parentElement?.closest("svg") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
    });
    const nodes: Text[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text);
    for (const node of nodes) {
      const text = node.data;
      const matches = [...text.matchAll(pattern)];
      if (!matches.length) continue;
      const fragment = doc.createDocumentFragment();
      let last = 0;
      for (const match of matches) {
        fragment.append(text.slice(last, match.index), Object.assign(doc.createElement("mark"), { textContent: match[0] }));
        last = match.index! + match[0].length;
      }
      fragment.append(text.slice(last));
      node.replaceWith(fragment);
    }
  };
  const visibleTopics = (): HelpTopic[] => searchHelpTopics(search.value, helpTopics(lang)).filter((topic) => group === "all" || topic.group === group);

  const setActive = (id: string): void => {
    active = id;
    toc.querySelectorAll<HTMLButtonElement>("button[data-topic]").forEach((button) => {
      const current = button.dataset.topic === id;
      button.classList.toggle("is-active", current);
      if (current) button.setAttribute("aria-current", "true"); else button.removeAttribute("aria-current");
    });
  };
  const render = (): void => {
    const ui = HELP_UI[lang];
    dialog.querySelectorAll<HTMLButtonElement>("[data-group]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.group === group)));
    const topics = visibleTopics();
    const terms = helpQueryTerms(search.value);
    // Ranked list while searching, grouped by section otherwise.
    const sections = terms.length
      ? [{ label: ui.results(topics.length), topics }]
      : HELP_GROUP_IDS.map((id) => ({ label: ui.groups[id], topics: topics.filter((topic) => topic.group === id) })).filter((section) => section.topics.length);
    toc.replaceChildren(...sections.flatMap((section) => [
      Object.assign(doc.createElement("li"), { className: "rh-toc-heading", textContent: section.label }),
      ...section.topics.map((topic) => {
        const item = doc.createElement("li");
        const button = Object.assign(doc.createElement("button"), { type: "button", textContent: topic.title });
        button.dataset.topic = topic.id;
        item.append(button);
        return item;
      })
    ]));
    const ordered = terms.length ? topics : sections.flatMap((section) => section.topics);
    content.replaceChildren(...ordered.map((topic) => {
      const article = articleOf(topic);
      highlight(article, terms);
      return article;
    }));
    empty.hidden = topics.length > 0;
    empty.textContent = topics.length ? "" : ui.empty(search.value.trim());
    setActive(ordered.some((topic) => topic.id === active) ? active : ordered[0]?.id ?? "");
  };
  const show = (id: string): void => {
    if (!content.querySelector(`[data-topic-id="${id}"]`)) {
      // A link to a topic the filter hides: clear the filter first.
      search.value = "";
      group = "all";
      render();
    }
    const article = content.querySelector<HTMLElement>(`[data-topic-id="${id}"]`);
    if (!article) return;
    content.scrollTop = article.offsetTop; // the pane is the articles' offset parent
    setActive(id);
  };

  closeButton.addEventListener("click", () => dialog.close());
  // Esc closes the guide only: the Lab modal around it listens for Escape too.
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    event.preventDefault();
    if (doc.activeElement === search && search.value) { search.value = ""; render(); }
    else dialog.close();
  });
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  ref("lang").addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-lang]");
    if (!button || button.dataset.lang === lang) return;
    lang = button.dataset.lang as HelpLang;
    try { doc.defaultView?.localStorage.setItem(LANG_KEY, lang); } catch { /* storage unavailable: this session only */ }
    // Same topic, other language.
    const current = active;
    applyLang();
    render();
    if (current) show(current);
  });
  ref("groups").addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-group]");
    if (!button) return;
    group = button.dataset.group as GroupFilter;
    render();
    content.scrollTop = 0;
  });
  toc.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-topic]");
    if (button) show(button.dataset.topic!);
  });
  content.addEventListener("click", (event) => {
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[data-topic]");
    if (!anchor) return;
    event.preventDefault();
    show(anchor.dataset.topic!);
  });
  search.addEventListener("input", () => { render(); content.scrollTop = 0; });
  search.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const first = content.querySelector<HTMLElement>("[data-topic-id]");
    if (first) show(first.dataset.topicId!);
  });
  // The contents list follows the topic at the top of the reading pane.
  content.addEventListener("scroll", () => {
    const top = content.scrollTop + 24;
    let current = "";
    content.querySelectorAll<HTMLElement>("[data-topic-id]").forEach((article) => { if (article.offsetTop <= top) current = article.dataset.topicId!; });
    if (current && current !== active) setActive(current);
  }, { passive: true });

  applyLang();
  return {
    open(mode, topic) {
      if (!dialog.open) dialog.showModal();
      search.value = "";
      group = "all";
      render();
      show(topic ?? `${mode}-quickstart`);
      search.focus();
    }
  };
}
