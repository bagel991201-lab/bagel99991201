import { describe, expect, it } from "vitest";
import { matchesSelectedFilters } from "./filter.logic";

describe("matchesSelectedFilters", () => {
  it("keeps every entry when no filters are selected", () => {
    expect(matchesSelectedFilters("noun", [])).toBe(true);
    expect(matchesSelectedFilters("sentence", [])).toBe(true);
  });

  it("matches any selected part of speech or content type", () => {
    expect(matchesSelectedFilters("noun", ["noun", "phrase"])).toBe(true);
    expect(matchesSelectedFilters("phrase", ["noun", "phrase"])).toBe(true);
    expect(matchesSelectedFilters("sentence", ["noun", "phrase"])).toBe(false);
  });
});
