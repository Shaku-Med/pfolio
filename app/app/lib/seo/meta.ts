import type { MetaDescriptor } from "react-router";
import {
  BASE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE_PATH,
  LOCALE,
} from "./constants";

const defaultOgImage = `${BASE_URL}${DEFAULT_OG_IMAGE_PATH}`;
const OG_IMAGE_SIZE: MetaDescriptor[] = [
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
];
const canonicalUrl = BASE_URL;

// Icons and the manifest live in root.tsx `links`, so they reach every page.
// Link tags returned from meta need tagName, or React Router renders <meta>.
function canonicalLink(href: string): MetaDescriptor {
  return { tagName: "link", rel: "canonical", href };
}

export function buildDefaultMeta(): MetaDescriptor[] {
  return [
    { title: DEFAULT_TITLE },
    { name: "description", content: DEFAULT_DESCRIPTION },
    { name: "keywords", content: DEFAULT_KEYWORDS },
    { name: "author", content: SITE_NAME },
    {
      name: "robots",
      content:
        "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },
    {
      name: "googlebot",
      content:
        "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: DEFAULT_TITLE },
    { property: "og:description", content: DEFAULT_DESCRIPTION },
    { property: "og:image", content: defaultOgImage },
    { property: "og:image:alt", content: SITE_NAME },
    { property: "og:url", content: canonicalUrl },
    { property: "og:locale", content: LOCALE },
    ...OG_IMAGE_SIZE,
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: SITE_NAME },
    { name: "twitter:title", content: DEFAULT_TITLE },
    { name: "twitter:description", content: DEFAULT_DESCRIPTION },
    { name: "twitter:image", content: defaultOgImage },
    { name: "twitter:image:alt", content: SITE_NAME },
    canonicalLink(canonicalUrl),
  ];
}

export function buildErrorMeta(): MetaDescriptor[] {
  return [
    { title: "Error" },
    { name: "description", content: "Error loading data." },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export type PageMetaInput = {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
  ogImageAlt?: string;
  keywords?: string;
  author?: string;
  noindex?: boolean;
  ogType?: "website" | "article" | "profile" | "video.other" | "image";
  extra?: MetaDescriptor[];
};

export function buildPageMeta(input: PageMetaInput): MetaDescriptor[] {
  const {
    title,
    description,
    canonicalPath = "",
    ogImage,
    ogImageAlt,
    keywords = DEFAULT_KEYWORDS,
    author = SITE_NAME,
    noindex = false,
    ogType = "website",
    extra = [],
  } = input;
  const canonical = canonicalPath
    ? `${BASE_URL}${canonicalPath.startsWith("/") ? "" : "/"}${canonicalPath}`
    : canonicalUrl;
  const image = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : `${BASE_URL}${ogImage}`
    : defaultOgImage;
  const robots = noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  return [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "author", content: author },
    { name: "robots", content: robots },
    ...(noindex ? [] : [{ name: "googlebot", content: robots }]),
    { property: "og:type", content: ogType },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: ogImageAlt ?? title },
    ...OG_IMAGE_SIZE,
    { property: "og:url", content: canonical },
    { property: "og:locale", content: LOCALE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: ogImageAlt ?? title },
    canonicalLink(canonical),
    ...extra,
  ];
}
