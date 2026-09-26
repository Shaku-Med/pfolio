import { afterEach, describe, expect, it, vi } from "vitest";
import { allowMarkdownElement } from "~/lib/markdown";
import { escapeXml } from "~/lib/xml";
import { cached } from "~/lib/database/cache.server";
import { nestMarkdown } from "~/lib/llms.server";

describe("allowMarkdownElement", () => {
  it("keeps normal markdown output", () => {
    for (const tagName of ["p", "h2", "a", "img", "pre", "code", "table", "blockquote", "svg"]) {
      expect(allowMarkdownElement({ tagName })).toBe(true);
    }
  });

  it("drops tags that can run script or load documents", () => {
    for (const tagName of ["script", "iframe", "object", "embed", "style", "form", "meta", "base", "template"]) {
      expect(allowMarkdownElement({ tagName })).toBe(false);
    }
  });

  it("only allows checkbox inputs from task lists", () => {
    expect(allowMarkdownElement({ tagName: "input", properties: { type: "checkbox" } })).toBe(true);
    expect(allowMarkdownElement({ tagName: "input", properties: { type: "text" } })).toBe(false);
  });
});

describe("escapeXml", () => {
  it("escapes markup and drops characters XML forbids", () => {
    expect(escapeXml(`<a href="x">Tom & Jerry's</a>\u0000`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&apos;s&lt;/a&gt;",
    );
  });
});

describe("cached", () => {
  afterEach(() => vi.useRealTimers());

  it("shares one load between callers and reuses it until it expires", async () => {
    vi.useFakeTimers();
    const key = `test:${crypto.randomUUID()}`;
    const load = vi.fn(async () => "value");

    const [a, b] = await Promise.all([cached(key, load), cached(key, load)]);
    expect([a, b]).toEqual(["value", "value"]);
    expect(load).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5 * 60 * 1000 + 1);
    await cached(key, load);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("never keeps a null result, so failures are retried", async () => {
    const key = `test:${crypto.randomUUID()}`;
    const load = vi.fn(async () => null);
    await cached(key, load);
    await cached(key, load);
    expect(load).toHaveBeenCalledTimes(2);
  });
});

describe("nestMarkdown", () => {
  it("shifts headings under the parent and drops a repeated title", () => {
    const md = "# Cloak\n\n## Features\n\nText\n\n### Detail";
    expect(nestMarkdown(md, 3, "Cloak: Hide Windows")).toBe("#### Features\n\nText\n\n##### Detail");
  });

  it("leaves headings inside code fences alone", () => {
    const md = "## Setup\n\n```bash\n# not a heading\n```";
    expect(nestMarkdown(md, 3, "Other")).toBe("#### Setup\n\n```bash\n# not a heading\n```");
  });
});
