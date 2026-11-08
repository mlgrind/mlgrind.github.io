import { describe, expect, it } from "vitest";
import { sections } from "../data/sections";
import {
  curriculumGroups,
  resolvedGroups,
  groupOfSection,
  groupProgress,
} from "../data/curriculum";

describe("curriculum groups", () => {
  it("puts every section in exactly one group", () => {
    const grouped = curriculumGroups.flatMap((g) => g.sectionIds);
    for (const section of sections) {
      expect(
        grouped.filter((id) => id === section.id),
        section.id,
      ).toHaveLength(1);
    }
    // ...and no group names a section that doesn't exist.
    expect(grouped.sort()).toEqual(sections.map((s) => s.id).sort());
  });

  it("follows section order", () => {
    expect(curriculumGroups.flatMap((g) => g.sectionIds)).toEqual(
      sections.map((s) => s.id),
    );
  });

  it("has unique ids and no empty groups", () => {
    const ids = curriculumGroups.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const group of resolvedGroups) expect(group.sections.length).toBeGreaterThan(0);
  });

  it("finds a section's group and counts solved problems per group", () => {
    expect(groupOfSection("transformers")?.title).toBe("Transformers & LLMs");
    expect(groupOfSection("nope")).toBeUndefined();
    const foundations = resolvedGroups.find((g) => g.id === "foundations")!;
    const [first, second] = sections[0].problems;
    const progress = {
      [sections[0].id]: {
        [first]: { status: "completed" as const },
        [second]: { status: "in_progress" as const },
        "not-in-section": { status: "completed" as const },
      },
    };
    expect(groupProgress(progress, foundations)).toEqual({
      done: 1,
      total: foundations.sections.reduce((n, s) => n + s.problems.length, 0),
    });
  });
});
