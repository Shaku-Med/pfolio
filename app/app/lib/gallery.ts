export type GalleryItem = {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  tone: "dark" | "light";
  /** Optional extra images for this gallery item (from project_srcs). */
  projectSrcs?: string[];
   /** Optional markdown details; only loaded on the detail page. */
  detailsMd?: string;
};
