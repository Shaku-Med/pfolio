import { describe, expect, it } from "vitest";
import {
  cleanText,
  clientIp,
  isSameOrigin,
  pageNumber,
  pageParams,
  rateLimit,
  tooManyRequests,
} from "~/lib/security/http.server";

const request = (headers: Record<string, string> = {}, url = "http://localhost:3000/contact") =>
  new Request(url, { headers });

describe("cleanText", () => {
  it("trims, strips control characters and caps length", () => {
    expect(cleanText("  hello\u0000 world\u001f  ", 50)).toBe("hello world");
    expect(cleanText("abcdef", 3)).toBe("abc");
    expect(cleanText(null, 10)).toBe("");
  });
});

describe("pageNumber", () => {
  it("falls back to 1 for anything invalid", () => {
    for (const page of ["abc", "-3", "0", "1.5", ""]) {
      expect(pageNumber(new URL(`http://x/?page=${page}`))).toBe(1);
    }
  });

  it("keeps valid pages and caps huge ones", () => {
    expect(pageNumber(new URL("http://x/?page=4"))).toBe(4);
    expect(pageNumber(new URL("http://x/?page=999999"))).toBe(500);
  });
});

describe("pageParams", () => {
  it("clamps limit and offset", () => {
    expect(pageParams(new URL("http://x/?limit=999&offset=-5"), 12)).toEqual({ limit: 50, offset: 0 });
    expect(pageParams(new URL("http://x/?limit=abc"), 12)).toEqual({ limit: 12, offset: 0 });
    expect(pageParams(new URL("http://x/?limit=5&offset=99999999"), 12)).toEqual({ limit: 5, offset: 10000 });
  });
});

describe("clientIp", () => {
  it("trusts X-Real-IP from nginx first", () => {
    expect(clientIp(request({ "x-real-ip": "203.0.113.7", "x-forwarded-for": "1.1.1.1" }))).toBe("203.0.113.7");
  });

  it("uses the rightmost forwarded entry, which the proxy appended", () => {
    expect(clientIp(request({ "x-forwarded-for": "10.0.0.1, 203.0.113.7" }))).toBe("203.0.113.7");
  });

  it("falls back when no proxy headers exist", () => {
    expect(clientIp(request())).toBe("unknown");
  });
});

describe("isSameOrigin", () => {
  it("accepts a matching Origin", () => {
    expect(isSameOrigin(request({ origin: "http://localhost:3000" }))).toBe(true);
  });

  it("rejects another site and requests with no origin info", () => {
    expect(isSameOrigin(request({ origin: "https://evil.example" }))).toBe(false);
    expect(isSameOrigin(request({ referer: "https://evil.example/page" }))).toBe(false);
    expect(isSameOrigin(request())).toBe(false);
  });

  it("falls back to Referer when Origin is missing", () => {
    expect(isSameOrigin(request({ referer: "http://localhost:3000/contact" }))).toBe(true);
  });
});

describe("rateLimit", () => {
  it("allows up to max requests per window, then blocks", () => {
    const key = `test:${crypto.randomUUID()}`;
    const results = Array.from({ length: 4 }, () => rateLimit(key, 3, 60_000));
    expect(results).toEqual([true, true, true, false]);
  });

  it("returns a 429 with Retry-After once the budget is spent", () => {
    const ip = `198.51.100.${Math.floor(Math.random() * 250)}`;
    const bucket = `bucket-${crypto.randomUUID()}`;
    expect(tooManyRequests(request({ "x-real-ip": ip }), bucket, 1)).toBeNull();
    const blocked = tooManyRequests(request({ "x-real-ip": ip }), bucket, 1);
    expect(blocked?.status).toBe(429);
    expect(blocked?.headers.get("Retry-After")).toBe("60");
  });
});
