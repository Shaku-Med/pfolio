import { getProjects } from "~/lib/database/queries";

const PAGE_SIZE = 12;

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || PAGE_SIZE, 50);
  const offset = Number(url.searchParams.get("offset")) || 0;
  const data = await getProjects(limit, offset);
  return data;
}
