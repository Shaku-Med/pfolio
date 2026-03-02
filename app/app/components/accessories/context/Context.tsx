import { createContext, useContext, useMemo } from "react";
import type { ContextType } from "./types";
import type { BlogPost } from "~/lib/blog";
import type { StackCategory } from "~/lib/stack";
import type { GalleryItem } from "~/lib/gallery";
import type { Project } from "~/lib/projects";
import type { ExperienceEntry } from "~/lib/experience";

export const Context = createContext<ContextType>({
  projects: [],
  stack: [],
  blog_posts: [],
  gallery: [],
  experience: [],
});

interface ContextProviderProps {
  children: React.ReactNode;
  projects: Project[];
  stack: StackCategory[];
  blog_posts: BlogPost[];
  gallery: GalleryItem[];
  experience: ExperienceEntry[];
}

export const ContextProvider = ({
  children,
  projects,
  stack,
  blog_posts,
  gallery,
  experience,
}: ContextProviderProps) => {
  const value = useMemo(
    () => ({ projects, stack, blog_posts, gallery, experience }),
    [projects, stack, blog_posts, gallery, experience],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useContextHook = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useContext must be used within a ContextProvider");
  }
  return context;
};