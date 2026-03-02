import db from "./supabase";
import type { Project } from "../projects";
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
  details_md?: string | null;
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
};

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
  if (from && to) return `${from} – ${to}`;
  if (from) return `${from} – Present`;
  if (to) return to;
  return "";
}

type DbStack = {
  id: string;
  category: string;
  tools: string;
  description: string;
};

type DbGallery = {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  tone: "dark" | "light";
  project_srcs?: string[] | null;
  details_md?: string | null;
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
};

type DbResume = {
  id: string;
  body_md: string;
  updated_at: string;
};

function mapProject(row: DbProject): Project {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    tags: row.tags ?? [],
    image: row.image,
    imageAlt: row.image_alt,
    githubUrl: row.github_url ?? undefined,
    liveUrl: row.live_url ?? undefined,
    links: (row.links as Project["links"]) ?? undefined,
    ...(row.details_md != null && row.details_md !== "" && { detailsMd: row.details_md }),
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
  };
}

function mapStack(row: DbStack): StackCategory {
  return {
    id: row.id,
    category: row.category,
    tools: row.tools,
    description: row.description,
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
  };
}

export async function getProjects(limit = 20, offset = 0): Promise<Project[]> {
  const { data, error } = await db.rpc("get_projects", {
    p_limit: limit,
    p_offset: offset,
  });
  if (error || !data) return [];
  return (data as DbProject[]).map(mapProject);
}

/** Fetches a single project by id including details_md. Use only on the project detail page. */
export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await db.rpc("get_project_by_id", { p_id: id });
  if (error || !data || !Array.isArray(data) || data.length === 0) return null;
  return mapProject(data[0] as DbProject);
}

export async function getSelectedProjects(
  limit = 4,
  offset = 0,
): Promise<Project[]> {
  const { data, error } = await db.rpc("get_selected_projects", {
    p_limit: limit,
    p_offset: offset,
  });
  if (error || !data) return [];
  return (data as DbProject[]).map(mapProject);
}

export async function getExperience(
  limit = 20,
  offset = 0,
): Promise<ExperienceEntry[]> {
  const { data, error } = await db.rpc("get_experience", {
    p_limit: limit,
    p_offset: offset,
  });
  if (error || !data) return [];
  return (data as DbExperience[]).map(mapExperience);
}

export async function getExperienceById(
  id: string,
): Promise<ExperienceEntry | null> {
  const { data, error } = await db
    .from("experience")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapExperience(data as DbExperience);
}

export async function getStack(
  limit = 20,
  offset = 0,
): Promise<StackCategory[]> {
  const { data, error } = await db.rpc("get_stack", {
    p_limit: limit,
    p_offset: offset,
  });
  if (error || !data) return [];
  return (data as DbStack[]).map(mapStack);
}

export async function getStackById(id: string): Promise<StackCategory | null> {
  const { data, error } = await db
    .from("stack")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapStack(data as DbStack);
}

export async function getStackUsage(
  stackId: string,
  limit = 20,
  offset = 0,
): Promise<StackUsageItem[]> {
  const { data, error } = await db.rpc("get_stack_usage", {
    p_stack_id: stackId,
    p_limit: limit,
    p_offset: offset,
  });
  if (error || !data) return [];
  return data as StackUsageItem[];
}

export async function getSelectedStack(
  limit = 4,
  offset = 0,
): Promise<StackCategory[]> {
  const { data, error } = await db.rpc("get_selected_stack", {
    p_limit: limit,
    p_offset: offset,
  });
  if (error || !data) return [];
  return (data as DbStack[]).map(mapStack);
}

export async function getGallery(
  limit = 20,
  offset = 0,
): Promise<GalleryItem[]> {
  const { data, error } = await db.rpc("get_gallery", {
    p_limit: limit,
    p_offset: offset,
  });
  if (error || !data) return [];
  return (data as DbGallery[]).map(mapGallery);
}

export async function getGalleryById(id: string): Promise<GalleryItem | null> {
  const { data, error } = await db
    .from("gallery")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapGallery(data as DbGallery);
}

export async function getSelectedGallery(
  limit = 4,
  offset = 0,
): Promise<GalleryItem[]> {
  const { data, error } = await db.rpc("get_selected_gallery", {
    p_limit: limit,
    p_offset: offset,
  });
  if (error || !data) return [];
  return (data as DbGallery[]).map(mapGallery);
}

export async function searchAll(
  query: string,
  limit = 20,
  offset = 0,
): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const { data, error } = await db.rpc("search_all", {
    p_query: query,
    p_limit: limit,
    p_offset: offset,
  });
  if (error || !data) return [];
  return data as SearchResult[];
}

export async function searchByTag(
  tag: string,
  limit = 20,
  offset = 0,
): Promise<SearchResult[]> {
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
  "id, slug, title, category, excerpt, date, read_time, tags, cover_image";

export async function getBlogPosts(
  limit = 20,
  offset = 0,
): Promise<BlogPost[]> {
  const { data, error } = await db
    .from("blog_posts")
    .select(BLOG_LIST_COLUMNS)
    .order("date", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error || !data) return [];
  return (data as DbBlog[]).map(mapBlog);
}

export async function getSelectedBlog(
  limit = 4,
  offset = 0,
): Promise<BlogPost[]> {
  const { data: selected, error: selError } = await db
    .from("selected_items")
    .select("item_id")
    .eq("table_name", "blog_posts")
    .order("created_at")
    .range(offset, offset + limit - 1);
  if (selError || !selected?.length) return [];
  const ids = (selected as { item_id: string }[]).map((r) => r.item_id);
  const { data, error } = await db
    .from("blog_posts")
    .select(BLOG_LIST_COLUMNS)
    .in("id", ids);
  if (error || !data) return [];
  const order = new Map<string, number>(ids.map((id: string, i: number) => [id, i]));
  (data as DbBlog[]).sort(
    (a: DbBlog, b: DbBlog) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
  );
  return (data as DbBlog[]).map(mapBlog);
}

/** Fetches a single blog post by id from Supabase. */
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapBlog(data as DbBlog);
}

export async function getContact() {
  const { data, error } = await db.rpc("get_contact");
  if (error || !data || !Array.isArray(data) || data.length === 0) return null;
  return data[0] as {
    id: string;
    email: string;
    phone: string | null;
    links: unknown | null;
  };
}

export async function getResume() {
  const { data, error } = await db.rpc("get_resume");
  if (error || !data || !Array.isArray(data) || data.length === 0) return null;
  return data[0] as DbResume;
}

