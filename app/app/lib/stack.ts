export type StackCategory = {
  id: string;
  category: string;
  tools: string;
  description: string;
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

export const stackCategories: StackCategory[] = [
  {
    id: "frontend",
    category: "Frontend",
    tools: "React, Remix, Tailwind",
    description:
      "Modern, accessible interfaces with strong design systems and smooth interactions.",
  },
  {
    id: "backend",
    category: "Backend",
    tools: "Node, Go, Postgres",
    description:
      "APIs, workers, and queues tuned for observability and reliability.",
  },
  {
    id: "workflow",
    category: "Workflow",
    tools: "GitHub, Linear, Figma",
    description:
      "Tight feedback loops from idea to shipped feature, with plenty of small scripts in between.",
  },
];
