import { readFileSync } from "node:fs";
import path from "node:path";
import { escapeXml } from "../xml";
import { BASE_URL } from "../seo/constants";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// Default palette, dark mode, converted from the OKLCH theme tokens.
const COLORS = {
  background: "#09090b",
  foreground: "#fafafa",
  muted: "#9f9fa9",
  border: "#27272a",
  primary: "#00a85c",
};

const PUBLIC_DIR = path.join(process.cwd(), "public");
const FONT_FILES = [400, 600, 700].map((w) => path.join(PUBLIC_DIR, "fonts", `inter-${w}.ttf`));

let avatarDataUri: string | null = null;
function avatar(): string {
  avatarDataUri ??= `data:image/png;base64,${readFileSync(path.join(PUBLIC_DIR, "web", "icon-192.png")).toString("base64")}`;
  return avatarDataUri;
}

export type OgCard = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

/**
 * Greedy word wrap using an average glyph width for Inter. Close enough for a
 * preview card; the last kept line gets an ellipsis when text is cut.
 */
function wrap(text: string, fontSize: number, maxWidth: number, maxLines: number, widthRatio: number): string[] {
  const maxChars = Math.max(8, Math.floor(maxWidth / (fontSize * widthRatio)));
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word.length > maxChars ? `${word.slice(0, maxChars - 1)}…` : word;
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);

  const used = lines.join(" ").length;
  if (lines.length === maxLines && used < words.join(" ").length) {
    const last = lines[maxLines - 1].slice(0, Math.max(0, maxChars - 1));
    const cut = last.lastIndexOf(" ") > maxChars / 2 ? last.slice(0, last.lastIndexOf(" ")) : last;
    lines[maxLines - 1] = `${cut.replace(/[\s.,;:]+$/, "")}…`;
  }
  return lines;
}

function textBlock(lines: string[], x: number, y: number, lineHeight: number, attrs: string): string {
  return lines
    .map((line, i) => `<text x="${x}" y="${y + i * lineHeight}" ${attrs}>${escapeXml(line)}</text>`)
    .join("");
}

export function buildOgSvg(card: OgCard): string {
  const pad = 80;
  const width = OG_WIDTH - pad * 2;
  const titleSize = card.title.length > 42 ? 58 : 68;
  const titleLines = wrap(card.title, titleSize, width, 3, 0.56);
  const subtitleLines = card.subtitle ? wrap(card.subtitle, 28, width - 40, 2, 0.5) : [];

  const titleTop = titleLines.length > 2 ? 262 : 282;
  const titleHeight = titleSize * 1.12;
  const subtitleTop = titleTop + (titleLines.length - 1) * titleHeight + 70;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
  <defs>
    <radialGradient id="glow" cx="0.85" cy="0.1" r="0.7">
      <stop offset="0" stop-color="${COLORS.primary}" stop-opacity="0.28"/>
      <stop offset="1" stop-color="${COLORS.primary}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="avatar"><circle cx="${pad + 28}" cy="${pad + 28}" r="28"/></clipPath>
  </defs>
  <rect width="100%" height="100%" fill="${COLORS.background}"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <image href="${avatar()}" x="${pad}" y="${pad}" width="56" height="56" clip-path="url(#avatar)"/>
  <text x="${pad + 76}" y="${pad + 37}" font-family="Inter" font-size="26" font-weight="600" fill="${COLORS.foreground}">Mohamed Amara</text>
  <text x="${pad}" y="${titleTop - titleSize - 8}" font-family="Inter" font-size="28" font-weight="400" fill="${COLORS.muted}">${escapeXml(card.eyebrow)}</text>
  ${textBlock(titleLines, pad, titleTop, titleHeight, `font-family="Inter" font-size="${titleSize}" font-weight="700" letter-spacing="-1.5" fill="${COLORS.foreground}"`)}
  ${textBlock(subtitleLines, pad, subtitleTop, 40, `font-family="Inter" font-size="28" font-weight="400" fill="${COLORS.muted}"`)}
  <path d="M${pad} 545 C ${pad + 300} 540, ${pad + 650} 550, ${OG_WIDTH - pad - 250} 545" stroke="${COLORS.border}" stroke-width="3" fill="none"/>
  <path d="M${pad} 545 C ${pad + 200} 541, ${pad + 380} 548, ${pad + 520} 545" stroke="${COLORS.primary}" stroke-width="3" stroke-linecap="round" fill="none"/>
  <circle cx="${pad + 180}" cy="544" r="7" fill="${COLORS.background}" stroke="${COLORS.muted}" stroke-width="3"/>
  <circle cx="${pad + 420}" cy="546" r="7" fill="${COLORS.background}" stroke="${COLORS.muted}" stroke-width="3"/>
  <text x="${OG_WIDTH - pad}" y="555" text-anchor="end" font-family="Inter" font-size="26" font-weight="600" fill="${COLORS.foreground}">${escapeXml(new URL(BASE_URL).host)}</text>
</svg>`;
}

// Loaded on first use: resvg is a native module, and a missing binary should
// only break preview cards, never the whole server at startup.
export async function renderOgPng(card: OgCard): Promise<Uint8Array<ArrayBuffer>> {
  const { Resvg } = await import("@resvg/resvg-js");
  const resvg = new Resvg(buildOgSvg(card), {
    fitTo: { mode: "width", value: OG_WIDTH },
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: "Inter" },
  });
  return new Uint8Array(resvg.render().asPng());
}
