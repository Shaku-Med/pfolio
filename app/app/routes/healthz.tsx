// Liveness only. It must never touch the database: the container healthcheck
// calls it every 30 seconds.
export function loader() {
  return new Response("ok", {
    status: 200,
    headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
  });
}
