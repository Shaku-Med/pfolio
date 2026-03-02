export type ProjectLink = {
  url: string;
  label: string;
  icon?: "doc" | "video" | "external" | "article";
};

export type Project = {
  id: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  imageAlt: string;
  githubUrl?: string;
  liveUrl?: string;
  links?: ProjectLink[];
  /** Markdown "more details"; only loaded on the project detail page, not in lists. */
  detailsMd?: string;
};

export const projects: Project[] = [
  {
    id: "streaming-pipeline",
    category: "Video platform",
    title: "High-volume streaming pipeline",
    description:
      "End‑to‑end upload and encoding flow with HLS, image processing, and edge delivery.",
    tags: ["Go", "Redis", "FFmpeg"],
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=240&fit=crop",
    imageAlt: "Video streaming and encoding",
    githubUrl: "https://github.com/example/streaming-pipeline",
    liveUrl: "https://streaming-demo.example.com",
  },
  {
    id: "ai-workflows",
    category: "Developer tools",
    title: "AI‑assisted code workflows",
    description:
      "Interactive tooling that accelerates refactors, reviews, and exploratory work for teams.",
    tags: ["React", "TypeScript", "AI APIs"],
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=240&fit=crop",
    imageAlt: "Code and development",
    liveUrl: "https://ai-tools-demo.example.com",
    links: [
      { url: "https://example.com/docs/ai-tools", label: "Documentation", icon: "doc" },
    ],
  },
  {
    id: "design-interfaces",
    category: "Product design",
    title: "Clean, resilient interfaces",
    description:
      "Systems‑driven UI work with strong emphasis on clarity, motion, and accessibility.",
    tags: ["Design systems", "Figma", "Accessibility"],
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=240&fit=crop",
    imageAlt: "UI and design systems",
    githubUrl: "https://github.com/example/design-system",
    links: [
      { url: "https://example.com/case-study", label: "Case study", icon: "article" },
    ],
  },
];
