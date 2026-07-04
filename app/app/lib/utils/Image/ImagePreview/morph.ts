export type MorphOrigin = {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: number;
};

export const MORPH_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
export const MORPH_DURATION = 0.44;

export function captureMorphOrigin(el: HTMLElement): MorphOrigin {
  const rect = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  const radius = style.borderRadius;
  const borderRadius =
    radius && radius !== "0px"
      ? Math.min(parseFloat(radius) || 0, 24)
      : 0;

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    borderRadius,
  };
}

export function getContainedViewportRect(
  naturalWidth: number,
  naturalHeight: number,
): Pick<MorphOrigin, "top" | "left" | "width" | "height"> {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / naturalWidth, vh / naturalHeight);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  return {
    top: (vh - height) / 2,
    left: (vw - width) / 2,
    width,
    height,
  };
}

export function loadImageDimensions(
  src: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}
