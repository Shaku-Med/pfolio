export type StackCategory = {
  id: string;
  category: string;
  tools: string;
  description: string;
  /** Manual display order (lower = earlier). */
  position?: number;
};

/**
 * Splits a tools string (e.g. "Python, JavaScript, TypeScript, Go") into an array of trimmed strings.
 */
export function parseToolsString(tools: string): string[] {
  if (!tools || typeof tools !== "string") return [];
  return tools
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
