import { describe, expect, it } from "vitest";
import { HELP_GROUP_IDS, HELP_LANGS, HELP_TOPIC_IDS, helpTopics, searchHelpTopics } from "../../../src/bootstrap/refine-help-content.js";
import { REFINE_EDITOR_FIELD_LABELS } from "../../../src/bootstrap/refine-editor.js";

/** Reclass rule labels (reclass-editor.ts builds them inline). */
const RECLASS_LABELS = ["Change to", "Combine", "Centre inset top %", "Centre inset bottom %", "Centre inset left %", "Centre inset right %", "Mean ≥", "Bright pixels ≥ %", "Bright level", "Area shrinks ≥ %"];
const LANGS = HELP_LANGS.map((lang) => lang.id);

describe("bootstrap/refine-help-content", () => {
  it.each(LANGS)("%s: every topic has its text, a known section and links that resolve", (lang) => {
    const topics = helpTopics(lang);
    expect(topics.map((topic) => topic.id)).toEqual(HELP_TOPIC_IDS);
    expect(new Set(HELP_TOPIC_IDS).size).toBe(HELP_TOPIC_IDS.length);
    for (const topic of topics) {
      expect(HELP_GROUP_IDS).toContain(topic.group);
      expect(topic.title.trim()).not.toBe("");
      for (const [, target] of topic.html.matchAll(/data-topic="([^"]+)"/g)) expect(HELP_TOPIC_IDS).toContain(target);
    }
    // The guide opens on each mode's tutorial.
    expect(HELP_TOPIC_IDS).toEqual(expect.arrayContaining(["edge-quickstart", "reclass-quickstart"]));
  });

  it("keeps the two languages apart: Korean text and figure labels, English UI names", () => {
    const [en, ko] = [helpTopics("en"), helpTopics("ko")];
    en.forEach((topic, index) => expect(ko[index].title).not.toBe(topic.title));
    expect(ko.find((topic) => topic.id === "edge-quickstart")!.figure).toContain("그린 라벨");
    expect(en.find((topic) => topic.id === "edge-quickstart")!.figure).toContain("label as drawn");
  });

  // Both languages name settings exactly as the Lab shows them, so a setting name finds its explanation.
  it.each(LANGS)("%s: explains every setting the Lab shows, under its UI name", (lang) => {
    for (const label of [...REFINE_EDITOR_FIELD_LABELS, ...RECLASS_LABELS]) {
      expect(searchHelpTopics(label, helpTopics(lang)).length, label).toBeGreaterThan(0);
    }
  });

  it("finds topics by English or Korean keywords in either language, best match first", () => {
    for (const lang of LANGS) {
      const topics = helpTopics(lang);
      expect(searchHelpTopics("polarity", topics)[0].id).toBe("edge-polarity");
      expect(searchHelpTopics("극성", topics)[0].id).toBe("edge-polarity");
      expect(searchHelpTopics("inset", topics)[0].id).toBe("reclass-crop");
      expect(searchHelpTopics("이웃", topics)[0].id).toBe("edge-surroundings");
      expect(searchHelpTopics("polarity zzz", topics)).toEqual([]);
      expect(searchHelpTopics("  ", topics)).toHaveLength(topics.length);
    }
    // Every word must match; case does not matter.
    expect(searchHelpTopics("BACKGROUND ring").map((topic) => topic.id)).toContain("edge-surroundings");
    expect(searchHelpTopics("가운데 crop", helpTopics("ko"))[0].id).toBe("reclass-crop");
  });
});
