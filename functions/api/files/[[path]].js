// GET    /api/files/week-N/filename → download a document from R2
// DELETE /api/files/week-N/filename → remove it (admin)
import { text, json, requireAdmin } from "../_lib.js";

const keyFrom = (params) => decodeURIComponent((params.path || []).join("/"));

export async function onRequestGet({ params, env }) {
  const key = keyFrom(params);
  const obj = await env.DOCS.get(key);
  if (!obj) return text("Not found.", 404);
  const name = key.split("/").pop();
  return new Response(obj.body, {
    headers: {
      "content-type": obj.httpMetadata?.contentType || "application/octet-stream",
      "content-disposition": `attachment; filename="${name}"`,
      "cache-control": "public, max-age=300",
    },
  });
}

export async function onRequestDelete({ request, params, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  await env.DOCS.delete(keyFrom(params));
  return json({ ok: true });
}
