import { describe, expect, it } from "vitest";
import {
  isUuid,
  isValidEmail,
  parseProjectLinks,
  safeHttpUrl,
  safeVideoSource,
} from "~/lib/security/validate";

describe("isUuid", () => {
  it("accepts a real uuid", () => {
    expect(isUuid("8190035e-f243-4f95-b184-6b2f9f70a367")).toBe(true);
  });

  it("rejects anything else", () => {
    for (const value of ["nope", "", "8190035e-f243-4f95-b184", "8190035e-f243-4f95-b184-6b2f9f70a367x", "../etc"]) {
      expect(isUuid(value)).toBe(false);
    }
  });
});

describe("isValidEmail", () => {
  it("accepts normal addresses", () => {
    expect(isValidEmail("me@site.com")).toBe(true);
    expect(isValidEmail("first.last+tag@sub.domain.io")).toBe(true);
  });

  it("rejects values that could add extra Reply-To recipients", () => {
    for (const value of ["a@b.com,c@d.com", "x@y.com;z@w.com", "<a@b.com>", '"q"@a.com', "a b@c.com"]) {
      expect(isValidEmail(value)).toBe(false);
    }
  });

  it("rejects missing parts and oversized input", () => {
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("@b.com")).toBe(false);
    expect(isValidEmail(`${"a".repeat(250)}@b.com`)).toBe(false);
  });
});

describe("safeHttpUrl", () => {
  it("keeps http and https links", () => {
    expect(safeHttpUrl("https://github.com/Shaku-Med")).toBe("https://github.com/Shaku-Med");
    expect(safeHttpUrl("http://example.com/a")).toBe("http://example.com/a");
  });

  it("drops script and data urls", () => {
    expect(safeHttpUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeHttpUrl("JaVaScRiPt:alert(1)")).toBeUndefined();
    expect(safeHttpUrl("data:text/html,<script>alert(1)</script>")).toBeUndefined();
  });

  it("drops non strings, junk and very long input", () => {
    expect(safeHttpUrl(42)).toBeUndefined();
    expect(safeHttpUrl("not a url")).toBeUndefined();
    expect(safeHttpUrl(`https://a.com/${"x".repeat(2100)}`)).toBeUndefined();
  });
});

describe("parseProjectLinks", () => {
  it("keeps valid links and drops unsafe ones", () => {
    const links = parseProjectLinks([
      { url: "https://example.com/doc", label: " Docs ", icon: "doc" },
      { url: "javascript:alert(1)", label: "Bad" },
      { url: "https://example.com", label: "" },
      { url: "https://example.com/v", label: "Video", icon: "not-an-icon" },
      "garbage",
    ]);
    expect(links).toEqual([
      { url: "https://example.com/doc", label: "Docs", icon: "doc" },
      { url: "https://example.com/v", label: "Video" },
    ]);
  });

  it("returns undefined when nothing usable is left", () => {
    expect(parseProjectLinks(null)).toBeUndefined();
    expect(parseProjectLinks([{ url: "ftp://x", label: "x" }])).toBeUndefined();
  });
});

describe("safeVideoSource", () => {
  it("routes repo paths through the image proxy", () => {
    expect(safeVideoSource("/07_23_2026/abc/demo.mp4")).toBe("/api/load/image/07_23_2026/abc/demo.mp4");
    expect(safeVideoSource("clips/demo.webm")).toBe("/api/load/image/clips/demo.webm");
  });

  it("allows direct https video files only", () => {
    expect(safeVideoSource("https://cdn.example.com/demo.mp4")).toBe("https://cdn.example.com/demo.mp4");
    expect(safeVideoSource("http://cdn.example.com/demo.mp4")).toBeUndefined();
    expect(safeVideoSource("https://example.com/page.html")).toBeUndefined();
  });

  it("rejects traversal, other types and script urls", () => {
    for (const value of ["../secret.mp4", "/a/../b.mp4", "demo.exe", "javascript:alert(1)//.mp4", "", 5]) {
      expect(safeVideoSource(value)).toBeUndefined();
    }
  });
});
