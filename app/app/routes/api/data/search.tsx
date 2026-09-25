import { searchAll } from "~/lib/database/queries";
import { cleanText, pageParams, tooManyRequests } from "~/lib/security/http.server";

const PAGE_SIZE = 20;
const MAX_QUERY_LENGTH = 120;

export async function loader({ request }: { request: Request }) {
  const limited = tooManyRequests(request, "search", 40);
  if (limited) return limited;
  const url = new URL(request.url);
  const q = cleanText(url.searchParams.get("q"), MAX_QUERY_LENGTH);
  if (!q) return [];
  const { limit, offset } = pageParams(url, PAGE_SIZE);
  return await searchAll(q, limit, offset);
}
