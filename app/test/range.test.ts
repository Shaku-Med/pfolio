import { describe, expect, it } from "vitest";
import { parseRange } from "~/lib/range";

describe("parseRange", () => {
  it("returns null without a header", () => {
    expect(parseRange(null, 1000)).toBeNull();
  });

  it("handles open, closed and suffix ranges", () => {
    expect(parseRange("bytes=0-", 1000)).toEqual({ start: 0, end: 999 });
    expect(parseRange("bytes=0-1", 1000)).toEqual({ start: 0, end: 1 });
    expect(parseRange("bytes=500-99999", 1000)).toEqual({ start: 500, end: 999 });
    expect(parseRange("bytes=-100", 1000)).toEqual({ start: 900, end: 999 });
  });

  it("rejects ranges it cannot serve", () => {
    for (const header of ["bytes=1000-", "bytes=5-2", "bytes=-", "bytes=0-1,4-5", "items=0-1", "bytes=abc-"]) {
      expect(parseRange(header, 1000)).toBe("invalid");
    }
  });
});
