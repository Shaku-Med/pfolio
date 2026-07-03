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
  /** ISO date (rough is fine). Projects without one stay off the timeline. */
  date?: string;
  /** Markdown "more details"; only loaded on the project detail page, not in lists. */
  detailsMd?: string;
};
