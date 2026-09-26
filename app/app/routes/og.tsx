import { cached } from "../lib/database/cache.server";
import { getOgCard, isOgKind } from "../lib/og/cards.server";
import { renderOgPng } from "../lib/og/og.server";
import { tooManyRequests } from "../lib/security/http.server";

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: Promise<{ kind: string; id?: string }>;
}) {
  const limited = tooManyRequests(request, "og", 60);
  if (limited) return limited;

  const { kind, id } = await params;
  if (!isOgKind(kind)) return new Response("Not found", { status: 404 });

  const png = await cached(`og:${kind}:${id ?? ""}`, async () => {
    const card = await getOgCard(kind, id);
    return card ? await renderOgPng(card) : null;
  });
  if (!png) return new Response("Not found", { status: 404 });

  return new Response(png, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
