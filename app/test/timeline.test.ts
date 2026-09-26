import { describe, expect, it } from "vitest";
import { isOpenRole, type ExperienceEntry } from "~/lib/experience";
import { experienceToTimeline, sortTimeline } from "~/components/accessories/Timeline/Timeline";

const role = (id: string, company: string, period: string, position: number): ExperienceEntry => ({
  id,
  role: "Intern",
  title: id,
  company,
  period,
  description: "",
  position,
});

describe("open role slot", () => {
  it("recognizes the placeholder company", () => {
    expect(isOpenRole({ company: "Your company here" })).toBe(true);
    expect(isOpenRole({ company: "Electronic Arts (EA)" })).toBe(false);
    expect(isOpenRole({})).toBe(false);
  });

  it("sorts last under a Next marker even with the lowest position", () => {
    const items = sortTimeline(
      experienceToTimeline([
        role("next", "Your company here", "Since 2025", 0),
        role("ea", "Electronic Arts (EA)", "2025", 1),
        role("codepath", "CodePath", "2023", 2),
      ]),
    );
    expect(items.map((item) => item.id)).toEqual(["ea", "codepath", "next"]);
    expect(items.at(-1)?.markerLabel).toBe("Next");
  });
});
