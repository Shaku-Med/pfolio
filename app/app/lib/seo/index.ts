export {
  BASE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE_PATH,
  FAVICON_PATH,
  APPLE_TOUCH_ICON_PATH,
  MANIFEST_PATH,
  ICON_192_PATH,
  ICON_512_PATH,
  LOCALE,
  THEME_COLOR_LIGHT,
  THEME_COLOR_DARK,
} from "./constants";
export {
  buildDefaultMeta,
  buildErrorMeta,
  buildPageMeta,
  type PageMetaInput,
} from "./meta";
export { homeStructuredData, blogPostStructuredData } from "./structured";
