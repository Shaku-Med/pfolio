import type { Project } from "../../../lib/projects";
import type { BlogPost } from "../../../lib/blog";
import type { StackCategory } from "../../../lib/stack";
import type { GalleryItem } from "../../../lib/gallery";
import type { ExperienceEntry } from "../../../lib/experience";

export type ContextType = {
  projects: Project[];
  stack: StackCategory[];
  blog_posts: BlogPost[];
  gallery: GalleryItem[];
  experience: ExperienceEntry[];
};