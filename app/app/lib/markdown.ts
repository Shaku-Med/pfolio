type HastElement = { tagName: string; properties?: Record<string, unknown> };

// The renderer parses raw HTML inside markdown, so only these tags survive.
// Anything that can run script or load a document (script, iframe, object,
// style, form, meta, base, template...) is dropped. Link and image URLs are
// already filtered by react-markdown's urlTransform, which blocks javascript:.
const SAFE_TAGS = new Set([
  "a", "abbr", "b", "blockquote", "br", "caption", "code", "dd", "del", "details", "div",
  "dl", "dt", "em", "figcaption", "figure", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i",
  "img", "input", "ins", "kbd", "li", "mark", "ol", "p", "pre", "q", "s", "section", "small",
  "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead",
  "tr", "u", "ul",
  // The preview draws its own heading anchor and copy icons with these.
  "svg", "path",
]);

export function allowMarkdownElement(element: HastElement): boolean {
  if (!SAFE_TAGS.has(element.tagName)) return false;
  // GFM task lists render disabled checkboxes; no other inputs are allowed.
  if (element.tagName === "input") return element.properties?.type === "checkbox";
  return true;
}
