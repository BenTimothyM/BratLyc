/** WCAG relative luminance for a #rrggbb color (0 = black, 1 = white). */
export function relativeLuminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Light backgrounds get black ink. Threshold is where black and white contrast equally. */
export const isLightColor = (hex: string) => relativeLuminance(hex) > 0.179;
