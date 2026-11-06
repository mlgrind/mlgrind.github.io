import { describe, expect, it } from "vitest";
import { allPaths, problemHref } from "../data/learningPaths";
import { allProblems } from "../data/problems";
import { staticRoutes } from "../components/SEO/StaticContent";
describe("learning path navigation", () => {
  it("contains valid exercise links and a seven-exercise challenge", () => {
    expect(
      allPaths.find((p) => p.id === "seven-day-challenge")!.problems,
    ).toHaveLength(7);
    for (const path of allPaths)
      for (const id of path.problems)
        expect(staticRoutes).toContain(problemHref(id));
  });
  it("generates one canonical route per exercise with no duplicates", () => {
    expect(new Set(staticRoutes).size).toBe(staticRoutes.length);
    for (const problem of allProblems)
      expect(staticRoutes).toContain(
        `/problem/${problem.section}/${problem.id}`,
      );
  });
});
