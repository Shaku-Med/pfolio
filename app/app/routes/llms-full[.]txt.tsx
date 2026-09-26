import { buildLlmsFullTxt } from "../lib/llms.server";

export async function loader() {
  return new Response(await buildLlmsFullTxt(), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
