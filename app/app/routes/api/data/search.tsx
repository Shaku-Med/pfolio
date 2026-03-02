import { searchAll } from "~/lib/database/queries";

const PAGE_SIZE = 20;

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(
    Number(url.searchParams.get("limit")) || PAGE_SIZE,
    50,
  );
  const offset = Number(url.searchParams.get("offset")) || 0;
  if (!q) return [];
  const data = await searchAll(q, limit, offset);
  return data;
}

