import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import potrace from "potrace";
import { optimize } from "svgo";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const input = path.join(root, "public/web/icon-512.png");
const tmpPng = path.join(root, "scripts/.trace-tmp.png");
const outSvg = path.join(root, "public/brand/icon-mark.svg");
const outTs = path.join(root, "app/lib/brand/iconMark.ts");

await fs.mkdir(path.dirname(outSvg), { recursive: true });

const circleMask = Buffer.from(
  `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="black"/>
    <circle cx="256" cy="256" r="248" fill="white"/>
  </svg>`,
);

await sharp(input)
  .resize(512, 512, { fit: "cover", position: "center" })
  .composite([{ input: circleMask, blend: "dest-in" }])
  .flatten({ background: "#ffffff" })
  .greyscale()
  .linear(2.8, -190)
  .threshold(96)
  .png()
  .toFile(tmpPng);

const svg = await new Promise((resolve, reject) => {
  potrace.trace(
    tmpPng,
    {
      turdSize: 14,
      optTolerance: 0.25,
      optCurve: true,
      color: "currentColor",
      background: "transparent",
    },
    (err, result) => (err ? reject(err) : resolve(result)),
  );
});

const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
const pathMatches = [...svg.matchAll(/<path[^>]*d="([^"]+)"/g)].map((m) => m[1]);

if (!viewBoxMatch || pathMatches.length === 0) {
  console.error("SVG snippet:", svg.slice(0, 500));
  throw new Error("Failed to parse traced SVG");
}

const simplifiedPaths = pathMatches.map(
  (d) =>
    optimize(`<svg viewBox="${viewBoxMatch[1]}"><path d="${d}"/></svg>`, {
      multipass: true,
      plugins: [
        "preset-default",
        { name: "convertPathData", params: { floatPrecision: 1 } },
      ],
    })
      .data.match(/d="([^"]+)"/)[1],
);

const paths = simplifiedPaths
  .filter((d) => d.length >= 200)
  .sort((a, b) => b.length - a.length)
  .slice(0, 12);

if (paths.length === 0) {
  throw new Error("No usable paths after filtering");
}

const cleaned = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBoxMatch[1]}" fill="currentColor" aria-hidden="true">
${paths.map((d) => `  <path d="${d}" />`).join("\n")}
</svg>
`;

const ts = `/** Traced from \`public/web/icon-512.png\` via \`npm run trace-icon\`. */
export const ICON_MARK_VIEWBOX = "${viewBoxMatch[1]}";

export const ICON_MARK_PATHS = [
${paths.map((d) => `  ${JSON.stringify(d)},`).join("\n")}
] as const;

/** Longest portrait contour for single-path consumers. */
export const ICON_MARK_PATH = ICON_MARK_PATHS[0];
`;

await fs.writeFile(outSvg, cleaned);
await fs.writeFile(outTs, ts);
await fs.unlink(tmpPng).catch(() => {});

console.log(`Wrote ${outSvg} (${paths.length} paths, ${cleaned.length} bytes)`);
console.log(`Updated ${outTs}`);
