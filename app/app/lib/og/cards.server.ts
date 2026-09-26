import {
  getBlogPostById,
  getExperienceById,
  getGalleryById,
  getProjectById,
  getStackById,
} from "../database/queries";
import { formatBlogDate } from "../blog";
import { parseToolsString } from "../stack";
import type { OgCard } from "./og.server";

const SITE_CARD: OgCard = {
  eyebrow: "Portfolio",
  title: "Full stack software engineer",
  subtitle: "I build whole products and ship them for real people, from social platforms to encryption tools.",
};

// Static pages get fixed cards, so nobody can put their own text on an image
// served from this domain.
const PAGE_CARDS: Record<string, OgCard> = {
  projects: {
    eyebrow: "Projects",
    title: "Things I've built and shipped",
    subtitle: "From weekend experiments to tools people actually use.",
  },
  experience: {
    eyebrow: "Experience",
    title: "Where I've worked and what I've shipped",
    subtitle: "Internships at Electronic Arts, Auristor and CodePath, all on one line.",
  },
  stack: {
    eyebrow: "Stack & tooling",
    title: "The tools I reach for",
    subtitle: "The languages and tools I use, and where I've used them.",
  },
  gallery: { eyebrow: "Gallery", title: "Screens and moments from the work" },
  blog: {
    eyebrow: "Blog",
    title: "Notes & writing",
    subtitle: "What I'm building, what broke along the way, and what I learned fixing it.",
  },
  resume: { eyebrow: "Resume", title: "The short version of everything here" },
  contact: {
    eyebrow: "Contact",
    title: "Have something in mind? Let's build it.",
    subtitle: "Looking for software engineering roles and internships.",
  },
};

export const OG_KINDS = ["site", "page", "project", "blog", "experience", "stack", "gallery"] as const;
export type OgKind = (typeof OG_KINDS)[number];

export function isOgKind(value: string): value is OgKind {
  return (OG_KINDS as readonly string[]).includes(value);
}

function firstParagraph(text?: string): string | undefined {
  return text?.replace(/\r\n/g, "\n").trim().split(/\n+/)[0] || undefined;
}

export async function getOgCard(kind: OgKind, id?: string): Promise<OgCard | null> {
  switch (kind) {
    case "site":
      return SITE_CARD;
    case "page":
      return (id && PAGE_CARDS[id]) || null;
    case "project": {
      const project = id ? await getProjectById(id) : null;
      return project && { eyebrow: project.category, title: project.title, subtitle: firstParagraph(project.description) };
    }
    case "blog": {
      const post = id ? await getBlogPostById(id) : null;
      return post && { eyebrow: `${post.category} / ${formatBlogDate(post.date)}`, title: post.title, subtitle: post.excerpt };
    }
    case "experience": {
      const entry = id ? await getExperienceById(id) : null;
      return (
        entry && {
          eyebrow: [entry.company, entry.period].filter(Boolean).join(" / "),
          title: entry.title,
          subtitle: firstParagraph(entry.description),
        }
      );
    }
    case "stack": {
      const stack = id ? await getStackById(id) : null;
      return stack && { eyebrow: "Stack & tooling", title: stack.category, subtitle: parseToolsString(stack.tools).join(", ") };
    }
    case "gallery": {
      const item = id ? await getGalleryById(id) : null;
      return item && { eyebrow: "Gallery", title: item.title, subtitle: item.subtitle };
    }
  }
}
