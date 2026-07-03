import { searchAll } from "~/lib/database/queries";
import { pageParams } from "~/lib/security/http.server";

const PAGE_SIZE = 20;
const MAX_QUERY_LENGTH = 120;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "")
    .replace(CONTROL_CHARS, "")
    .trim()
    .slice(0, MAX_QUERY_LENGTH);
  if (!q) return [];
  const { limit, offset } = pageParams(url, PAGE_SIZE);
  return await searchAll(q, limit, offset);
}
