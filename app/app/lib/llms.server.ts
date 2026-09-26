import {
  getBlogPostById,
  getBlogPosts,
  getExperience,
  getProjectById,
  getProjects,
  getResume,
  getStack,
} from "./database/queries";
import type { ExperienceEntry } from "./experience";
import { contact } from "./contact";
import { music } from "./music";
import { parseToolsString } from "./stack";
import { BASE_URL, SITE_NAME } from "./seo";

const LIST_SIZE = 50;
const SUMMARY =
  "Mohamed Amara is a full stack software engineer based in the US who builds and ships real products, from social platforms to encryption tools. He is looking for software engineering roles and internships, and also makes music as Medzy Amara.";

// The timeline keeps an open "your company here" slot for recruiters; an
// assistant should not read it as a real job.
function isRealRole(entry: ExperienceEntry): boolean {
  return !/your company here/i.test(entry.company ?? "");
}

function firstParagraph(text: string | undefined, max = 220): string {
  const first = (text ?? "").replace(/\r\n/g, "\n").trim().split(/\n+/)[0] ?? "";
  if (first.length <= max) return first;
  return `${first.slice(0, first.lastIndexOf(" ", max)).trimEnd()}...`;
}

// Titles go inside [..](..) links, so brackets would break the list syntax.
function linkText(text: string): string {
  return text.replace(/[[\]]/g, "").trim();
}

function link(title: string, path: string, note?: string): string {
  const entry = `- [${linkText(title)}](${BASE_URL}${path})`;
  return note ? `${entry}: ${note}` : entry;
}

function roleTitle(entry: ExperienceEntry): string {
  return entry.company ? `${entry.title} at ${entry.company}` : entry.title;
}

function roleLine(entry: ExperienceEntry): string {
  const role = entry.role && entry.role !== entry.title ? entry.role : "";
  return [role, entry.period, entry.location].filter(Boolean).join(", ");
}

const HEADING = /^(#{1,6})\s+(.*)$/;

/**
 * Embedded markdown brings its own # headings, which would break the file's
 * outline. Shifts them so the shallowest one sits one level below `parent`,
 * drops a leading heading that only repeats `title`, and leaves code fences alone.
 */
function nestMarkdown(markdown: string, parent: number, title: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").trim().split("\n");
  const first = lines[0]?.match(HEADING);
  if (first && title.toLowerCase().startsWith(first[2].trim().toLowerCase())) lines.shift();

  let inFence = false;
  let shallowest = 7;
  for (const line of lines) {
    if (line.trimStart().startsWith("```")) inFence = !inFence;
    const m = !inFence && line.match(HEADING);
    if (m) shallowest = Math.min(shallowest, m[1].length);
  }
  if (shallowest === 7) return lines.join("\n").trim();

  const shift = parent + 1 - shallowest;
  inFence = false;
  return lines
    .map((line) => {
      if (line.trimStart().startsWith("```")) inFence = !inFence;
      const m = !inFence && line.match(HEADING);
      if (!m) return line;
      return `${"#".repeat(Math.min(6, Math.max(1, m[1].length + shift)))} ${m[2]}`;
    })
    .join("\n")
    .trim();
}

async function loadCore() {
  const [projects, experience, stack, posts] = await Promise.all([
    getProjects(LIST_SIZE, 0),
    getExperience(LIST_SIZE, 0),
    getStack(LIST_SIZE, 0),
    getBlogPosts(LIST_SIZE, 0),
  ]);
  return { projects, experience: experience.filter(isRealRole), stack, posts };
}

export async function buildLlmsTxt(): Promise<string> {
  const { projects, experience, stack, posts } = await loadCore();
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SUMMARY}`,
    "",
    `This is ${SITE_NAME}'s portfolio. The pages below cover his projects, work history, tools and writing. A plain text version with full details is at ${BASE_URL}/llms-full.txt.`,
    "",
    "## Projects",
    "",
    ...projects.map((p) => link(p.title, `/projects/${p.id}`, firstParagraph(p.description))),
    "",
    "## Experience",
    "",
    ...experience.map((e) => link(roleTitle(e), `/experience/${e.id}`, roleLine(e))),
    "",
    "## Stack",
    "",
    ...stack.map((s) => link(s.category, `/stack/${s.id}`, parseToolsString(s.tools).join(", "))),
    "",
    "## Writing",
    "",
    ...posts.map((p) => link(p.title, `/blog/${p.id}`, firstParagraph(p.excerpt))),
    "",
    "## Contact",
    "",
    link("Contact form", "/contact", "The fastest way to reach him"),
    `- [Email](mailto:${contact.email})`,
    ...contact.links.map((l) => `- [${l.label}](${l.href})`),
    "",
    "## Optional",
    "",
    link("Resume", "/resume", "Readable resume with a PDF download"),
    link("Full details", "/llms-full.txt", "Every project, role and post in plain text"),
    link("Blog feed", "/rss.xml"),
    `- [Music on Spotify](${music.links[0].href}): Released as ${music.artistName}`,
    "",
  ];
  return lines.join("\n");
}

export async function buildLlmsFullTxt(): Promise<string> {
  const { projects, experience, posts } = await loadCore();
  const [projectDetails, postDetails, resume] = await Promise.all([
    Promise.all(projects.map((p) => getProjectById(p.id))),
    Promise.all(posts.map((p) => getBlogPostById(p.id))),
    getResume(),
  ]);

  const sections: string[] = [`# ${SITE_NAME}`, "", `> ${SUMMARY}`, ""];

  sections.push("## Projects", "");
  projects.forEach((summary, i) => {
    const p = projectDetails[i] ?? summary;
    sections.push(
      `### ${p.title}`,
      "",
      `${BASE_URL}/projects/${p.id}`,
      [p.category, p.tags.length ? `Built with ${p.tags.join(", ")}` : ""].filter(Boolean).join(". "),
      [p.liveUrl && `Live: ${p.liveUrl}`, p.githubUrl && `Source: ${p.githubUrl}`].filter(Boolean).join(" | "),
      "",
      p.description.trim(),
      "",
      ...(p.detailsMd ? [nestMarkdown(p.detailsMd, 3, p.title), ""] : []),
    );
  });

  sections.push("## Experience", "");
  for (const e of experience) {
    sections.push(`### ${roleTitle(e)}`, "", `${BASE_URL}/experience/${e.id}`, roleLine(e), "", e.description.trim(), "");
    if (e.highlights?.length) sections.push(...e.highlights.map((h) => `- ${h}`), "");
  }

  sections.push("## Writing", "");
  posts.forEach((summary, i) => {
    const post = postDetails[i] ?? summary;
    sections.push(`### ${post.title}`, "", `${BASE_URL}/blog/${post.id}`, `${post.category}, ${post.date}`, "");
    sections.push(nestMarkdown(post.body || post.excerpt, 3, post.title), "");
  });

  if (resume?.body_md) sections.push("## Resume", "", nestMarkdown(resume.body_md, 2, SITE_NAME), "");

  return sections.join("\n");
}
