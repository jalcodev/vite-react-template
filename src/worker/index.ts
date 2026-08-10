import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "GridHub" }));

// Proxy: browser calls /api/gridhub/v1/... and this forwards to the real
// GridHub API with the partner key attached server-side. The key is never
// sent to the client — only this Worker ever sees it.
app.get("/api/gridhub/*", async (c) => {
  const incoming = new URL(c.req.url);
  const subpath = incoming.pathname.replace(/^\/api\/gridhub/, "");
  const target = `${c.env.GRIDHUB_API_BASE}${subpath}${incoming.search}`;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      headers: { Authorization: `Bearer ${c.env.GRIDHUB_PARTNER_KEY}` },
    });
  } catch (e) {
    return c.json({ error: "upstream unreachable", detail: String(e) }, 502);
  }

  const headers = new Headers();
  const ct = upstream.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  const cc = upstream.headers.get("cache-control");
  if (cc) headers.set("cache-control", cc);

  return new Response(upstream.body, { status: upstream.status, headers });
});

// Everything else (all real page routes) falls through to the static
// assets binding, which applies the single-page-application fallback —
// without this, Hono's own 404 intercepts the request before Cloudflare
// ever gets a chance to serve index.html for client-side routes.
app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
