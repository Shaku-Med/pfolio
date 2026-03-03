import { EnvValidator } from "../utils/env";
import IsDevelopment from "../utils/IsDevelopment";
/** Absolute site origin for canonical URLs and OG images. Set SITE_URL in env for production. */
export const BASE_URL =
  EnvValidator("SITE_URL") ??
  (IsDevelopment()
    ? `http://localhost:${IsDevelopment() ? 3001 : 3000}`
    : "https://medzy.brozy.org");

export const SITE_NAME = "Mohamed Amara";
export const DEFAULT_TITLE = "Mohamed Amara";
export const DEFAULT_DESCRIPTION =
  "Portfolio of Mohamed Amara: projects, experience, stack, gallery, and blog.";
export const DEFAULT_KEYWORDS = [
  "Mohamed Amara",
  "portfolio",
  "developer",
  "projects",
  "experience",
  "blog",
  "gallery",
  "software",
].join(", ");
export const DEFAULT_OG_IMAGE_PATH = "/web/icon-512.png";
export const FAVICON_PATH = "/favicon.ico";
export const MANIFEST_PATH = "/manifest.json";
export const APPLE_TOUCH_ICON_PATH = "/web/icon-192.png";
export const ICON_192_PATH = "/web/icon-192.png";
export const ICON_512_PATH = "/web/icon-512.png";

export const LOCALE = "en_US";
export const THEME_COLOR = "#000000";
