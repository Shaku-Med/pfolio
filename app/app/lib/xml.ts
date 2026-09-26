const INVALID_XML_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g;

/** Escapes text for XML bodies and attributes, dropping characters XML forbids. */
export function escapeXml(value: string): string {
  return value
    .replace(INVALID_XML_CHARS, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
