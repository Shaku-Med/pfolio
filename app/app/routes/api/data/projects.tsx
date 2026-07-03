import { getProjects } from "~/lib/database/queries";
import { pageParams } from "~/lib/security/http.server";

const PAGE_SIZE = 12;

export async function loader({ request }: { request: Request }) {
  const { limit, offset } = pageParams(new URL(request.url), PAGE_SIZE);
  return await getProjects(limit, offset);
}
