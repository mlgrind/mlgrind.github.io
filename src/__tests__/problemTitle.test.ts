import { describe, expect, it } from "vitest";
import { normalizeTitle, stripRepeatedTitle } from "../lib/problemTitle";

describe("stripRepeatedTitle", () => {
  it("drops a leading heading that repeats the title", () => {
    expect(
      stripRepeatedTitle("## Scaled Dot-Product Attention\n\nImplement it.", "Scaled Dot-Product Attention"),
    ).toBe("Implement it.");
    expect(stripRepeatedTitle("\n# KL `Divergence`\nBody", "KL divergence")).toBe("Body");
    expect(normalizeTitle("Q & A: Test!")).toBe("q and a test");
  });

  it("keeps headings that differ from the title and non-leading headings", () => {
    const other = "## Formula\n\nBody";
    expect(stripRepeatedTitle(other, "Attention")).toBe(other);
    const later = "Intro\n\n## Attention\nBody";
    expect(stripRepeatedTitle(later, "Attention")).toBe(later);
  });
});
