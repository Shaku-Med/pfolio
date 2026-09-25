import db from "./supabase";
import { cached } from "./cache.server";
import type { Project, ProjectLink } from "../projects";
import type { ExperienceEntry } from "../experience";
import type { StackCategory } from "../stack";
import type { GalleryItem } from "../gallery";
import type { BlogPost } from "../blog";

type DbProject = {
  id: string;
  category: string;
  title: string;
  description: string;
  tags: string[] | null;
  image: string;
  image_alt: string;
  github_url: string | null;
  live_url: string | null;
  links: unknown | null;
  date?: string | null;
  details_md?: string | null;
  position?: number | null;
};

type DbExperience = {
  id: string;
  role: string;
  title: string;
  period: { from?: string; to?: string } | null;
  description: string;
  company: string | null;
  location: string | null;
  logo: string | null;
  highlights: string[] | null;
  tags: string[] | null;
  development_summary: string | null;
  challenges: string[] | null;
  learnings: string[] | null;
  details_md?: string | null;
  position?: number | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function normalizePeriodPart(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return trimmed;
  return d.getFullYear().toString();
}

function formatPeriod(period: DbExperience["period"]): string {
  if (!period) return "";
  const from = normalizePeriodPart(period.from);
  const to = normalizePeriodPart(period.to);
  const ongoing = to != null && /^(present|now|current|ongoing)$/i.test(to);
  if (from && (ongoing || !to)) return `Since ${from}`;
  if (from && to) return from === to ? from : `${from} to ${to}`;
  if (to) return to;
  return "";
}

type DbStack = {
  id: string;
  category: string;
  tools: string;
  description: string;
  position?: number | null;
};

type DbGallery = {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  tone: "dark" | "light";
  project_srcs?: string[] | null;
  details_md?: string | null;
  position?: number | null;
};

export type StackUsageItem = {
  kind: "project" | "experience" | "blog";
  id: string;
  title: string;
  summary: string;
  tags?: string[];
  cover_image?: string | null;
  period?: string | null;
  date?: string | null;
};

export type SearchResult = {
  kind: "project" | "experience" | "stack" | "blog" | "gallery" | "resume";
  id: string;
  title: string;
  summary: string;
  href: string;
};

/** Full row from blog_posts (e.g. getBlogPostById). List RPCs omit body. */
type DbBlog = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  read_time: string | null;
  tags: string[] | null;
  cover_image: string | null;
  body?: string;
  position?: number | null;
};

type DbResume = {
  id: string;
  body_md: string;
  updated_at: string;
};

const LINK_ICONS = new Set(["doc", "video", "external", "article"]);

function safeHttpUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 2048) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function parseProjectLinks(raw: unknown): ProjectLink[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const links = raw.flatMap((item): ProjectLink[] => {
    if (!item || typeof item !== "object") return [];
    const { url, label, icon } = item as Record<string, unknown>;
    const href = safeHttpUrl(url);
    if (!href || typeof label !== "string" || !label.trim()) return [];
    return [
      {
        url: href,
        label: label.trim().slice(0, 60),
        ...(typeof icon === "string" && LINK_ICONS.has(icon) && { icon: icon as ProjectLink["icon"] }),
      },
    ];
  });
  return links.length ? links : undefined;
}

function mapProject(row: DbProject): Project {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    tags: row.tags ?? [],
    image: row.image,
    imageAlt: row.image_alt,
    githubUrl: safeHttpUrl(row.github_url),
    liveUrl: safeHttpUrl(row.live_url),
    links: parseProjectLinks(row.links),
    date: row.date ?? undefined,
    ...(row.details_md != null && row.details_md !== "" && { detailsMd: row.details_md }),
    ...(typeof row.position === "number" && { position: row.position }),
  };
}

function mapExperience(row: DbExperience): ExperienceEntry {
  return {
    id: row.id,
    role: row.role,
    title: row.title,
    period: formatPeriod(row.period),
    description: row.description,
    company: row.company || undefined,
    location: row.location || undefined,
    logo: row.logo || undefined,
    highlights: row.highlights ?? undefined,
    tags: row.tags ?? undefined,
    developmentSummary: row.development_summary || undefined,
    challenges: row.challenges ?? undefined,
    learnings: row.learnings ?? undefined,
    ...(row.details_md != null && row.details_md !== "" && {
      detailsMd: row.details_md,
    }),
    ...(typeof row.position === "number" && { position: row.position }),
  };
}

function mapStack(row: DbStack): StackCategory {
  return {
    id: row.id,
    category: row.category,
    tools: row.tools,
    description: row.description,
    ...(typeof row.position === "number" && { position: row.position }),
  };
}

function mapGallery(row: DbGallery): GalleryItem {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    src: row.src,
    tone: row.tone,
    ...(row.project_srcs != null && {
      projectSrcs: row.project_srcs as string[],
    }),
    ...(row.details_md != null && row.details_md !== "" && {
      detailsMd: row.details_md,
    }),
    ...(typeof row.position === "number" && { position: row.position }),
  };
}

function mapBlog(row: DbBlog): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    excerpt: row.excerpt,
    date: row.date,
    readTime: row.read_time || undefined,
    tags: row.tags ?? undefined,
    coverImage: row.cover_image || undefined,
    body: row.body ?? "",
    ...(typeof row.position === "number" && { position: row.position }),
  };
}

export async function getProjects(limit = 20, offset = 0): Promise<Project[]> {
  const rows = await cached(`projects:${limit}:${offset}`, async () => {
    const { data, error } = await db.rpc("get_projects", { p_limit: limit, p_offset: offset });
    return error || !data ? null : (data as DbProject[]).map(mapProject);
  });
  return rows ?? [];
}

/** Fetches a single project by id including details_md. Use only on the project detail page. */
export async function getProjectById(id: string): Promise<Project | null> {
  if (!isUuid(id)) return null;
  return cached(`project:${id}`, async () => {
    const { data, error } = await db.rpc("get_project_by_id", { p_id: id });
    if (error || !Array.isArray(data) || data.length === 0) return null;
    return mapProject(data[0] as DbProject);
  });
}

export async function getSelectedProjects(limit = 4, offset = 0): Promise<Project[]> {
  const rows = await cached(`selected-projects:${limit}:${offset}`, async () => {
    const { data, error } = await db.rpc("get_selected_projects", { p_limit: limit, p_offset: offset });
    return error || !data ? null : (data as DbProject[]).map(mapProject);
  });
  return rows ?? [];
}

export async function getExperience(limit = 20, offset = 0): Promise<ExperienceEntry[]> {
  const rows = await cached(`experience:${limit}:${offset}`, async () => {
    const { data, error } = await db.rpc("get_experience", { p_limit: limit, p_offset: offset });
    return error || !data ? null : (data as DbExperience[]).map(mapExperience);
  });
  return rows ?? [];
}

export async function getExperienceById(id: string): Promise<ExperienceEntry | null> {
  if (!isUuid(id)) return null;
  return cached(`experience-item:${id}`, async () => {
    const { data, error } = await db.from("experience").select("*").eq("id", id).maybeSingle();
    return error || !data ? null : mapExperience(data as DbExperience);
  });
}

export async function getStack(limit = 20, offset = 0): Promise<StackCategory[]> {
  const rows = await cached(`stack:${limit}:${offset}`, async () => {
    const { data, error } = await db.rpc("get_stack", { p_limit: limit, p_offset: offset });
    return error || !data ? null : (data as DbStack[]).map(mapStack);
  });
  return rows ?? [];
}

export async function getStackById(id: string): Promise<StackCategory | null> {
  if (!isUuid(id)) return null;
  return cached(`stack-item:${id}`, async () => {
    const { data, error } = await db.from("stack").select("*").eq("id", id).maybeSingle();
    return error || !data ? null : mapStack(data as DbStack);
  });
}

export async function getStackUsage(
  stackId: string,
  limit = 20,
  offset = 0,
): Promise<StackUsageItem[]> {
  if (!isUuid(stackId)) return [];
  const rows = await cached(`stack-usage:${stackId}:${limit}:${offset}`, async () => {
    const { data, error } = await db.rpc("get_stack_usage", {
      p_stack_id: stackId,
      p_limit: limit,
      p_offset: offset,
    });
    return error || !data ? null : (data as StackUsageItem[]);
  });
  return rows ?? [];
}

export async function getSelectedStack(limit = 4, offset = 0): Promise<StackCategory[]> {
  const rows = await cached(`selected-stack:${limit}:${offset}`, async () => {
    const { data, error } = await db.rpc("get_selected_stack", { p_limit: limit, p_offset: offset });
    return error || !data ? null : (data as DbStack[]).map(mapStack);
  });
  return rows ?? [];
}

export async function getGallery(limit = 20, offset = 0): Promise<GalleryItem[]> {
  const rows = await cached(`gallery:${limit}:${offset}`, async () => {
    const { data, error } = await db.rpc("get_gallery", { p_limit: limit, p_offset: offset });
    return error || !data ? null : (data as DbGallery[]).map(mapGallery);
  });
  return rows ?? [];
}

export async function getGalleryById(id: string): Promise<GalleryItem | null> {
  if (!isUuid(id)) return null;
  return cached(`gallery-item:${id}`, async () => {
    const { data, error } = await db.from("gallery").select("*").eq("id", id).maybeSingle();
    return error || !data ? null : mapGallery(data as DbGallery);
  });
}

export async function getSelectedGallery(limit = 4, offset = 0): Promise<GalleryItem[]> {
  const rows = await cached(`selected-gallery:${limit}:${offset}`, async () => {
    const { data, error } = await db.rpc("get_selected_gallery", { p_limit: limit, p_offset: offset });
    return error || !data ? null : (data as DbGallery[]).map(mapGallery);
  });
  return rows ?? [];
}

export async function searchAll(query: string, limit = 20, offset = 0): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const { data, error } = await db.rpc("search_all", {
    p_query: query,
    p_limit: limit,
    p_offset: offset,
  });
  if (error || !data) return [];
  return data as SearchResult[];
}

export async function searchByTag(tag: string, limit = 20, offset = 0): Promise<SearchResult[]> {
  const q = tag.trim();
  if (!q) return [];
  const { data, error } = await db.rpc("search_by_tag", {
    p_tag: q,
    p_limit: limit,
    p_offset: offset,
  });
  if (error || !data) return [];
  return data as SearchResult[];
}

/** Columns for blog list only; body is excluded and loaded only on /blog/:id. */
const BLOG_LIST_COLUMNS =
  "id, slug, title, category, excerpt, date, read_time, tags, cover_image, position";

export async function getBlogPosts(limit = 20, offset = 0): Promise<BlogPost[]> {
  const rows = await cached(`blog:${limit}:${offset}`, async () => {
    const { data, error } = await db
      .from("blog_posts")
      .select(BLOG_LIST_COLUMNS)
      .order("position", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + limit - 1);
    return error || !data ? null : (data as DbBlog[]).map(mapBlog);
  });
  return rows ?? [];
}

export async function getSelectedBlog(limit = 4, offset = 0): Promise<BlogPost[]> {
  const rows = await cached(`selected-blog:${limit}:${offset}`, async () => {
    const { data, error } = await db.rpc("get_selected_blog", { p_limit: limit, p_offset: offset });
    return error || !data ? null : (data as DbBlog[]).map(mapBlog);
  });
  return rows ?? [];
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  if (!isUuid(id)) return null;
  return cached(`blog-post:${id}`, async () => {
    const { data, error } = await db.from("blog_posts").select("*").eq("id", id).maybeSingle();
    return error || !data ? null : mapBlog(data as DbBlog);
  });
}

export async function getContact() {
  return cached("contact", async () => {
    const { data, error } = await db.rpc("get_contact");
    if (error || !Array.isArray(data) || data.length === 0) return null;
    return data[0] as {
      id: string;
      email: string;
      phone: string | null;
      links: unknown | null;
    };
  });
}

export async function getResume() {
  return cached("resume", async () => {
    const { data, error } = await db.rpc("get_resume");
    if (error || !Array.isArray(data) || data.length === 0) return null;
    return data[0] as DbResume;
  });
}

const SITEMAP_TABLES = ["projects", "experience", "stack", "gallery", "blog_posts"] as const;
export type SitemapIds = Record<(typeof SITEMAP_TABLES)[number], string[]>;

export async function getSitemapIds(): Promise<SitemapIds> {
  const ids = await cached("sitemap", async () => {
    const results = await Promise.all(SITEMAP_TABLES.map((table) => db.from(table).select("id")));
    if (results.some((r) => r.error)) return null;
    return Object.fromEntries(
      SITEMAP_TABLES.map((table, i) => [
        table,
        ((results[i].data ?? []) as { id: string }[]).map((r) => r.id),
      ]),
    ) as SitemapIds;
  });
  return ids ?? { projects: [], experience: [], stack: [], gallery: [], blog_posts: [] };
}
