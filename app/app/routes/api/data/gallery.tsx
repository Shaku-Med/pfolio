import { getGallery } from "~/lib/database/queries";
import { pageParams, tooManyRequests } from "~/lib/security/http.server";

const PAGE_SIZE = 12;

export async function loader({ request }: { request: Request }) {
  const limited = tooManyRequests(request, "data", 120);
  if (limited) return limited;
  const { limit, offset } = pageParams(new URL(request.url), PAGE_SIZE);
  return await getGallery(limit, offset);
}
