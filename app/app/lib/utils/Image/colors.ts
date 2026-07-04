const SAMPLE_SIZE = 64;
const BUCKET = 32;
const MAX_COLORS = 5;

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  );
}

export function getDominantColors(img: HTMLImageElement): string[] {
  try {
    const canvas = document.createElement("canvas");
    const scale = Math.min(
      1,
      SAMPLE_SIZE / img.naturalWidth,
      SAMPLE_SIZE / img.naturalHeight
    );
    canvas.width = Math.max(1, Math.floor(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.floor(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const count = new Map<string, number>();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 128) continue;
      const br = Math.round(r / BUCKET) * BUCKET;
      const bg = Math.round(g / BUCKET) * BUCKET;
      const bb = Math.round(b / BUCKET) * BUCKET;
      const key = `${br},${bg},${bb}`;
      count.set(key, (count.get(key) ?? 0) + 1);
    }
    const sorted = [...count.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_COLORS);
    return sorted.map(([key]) => {
      const [r, g, b] = key.split(",").map(Number);
      return rgbToHex(r, g, b);
    });
  } catch {
    return [];
  }
}
