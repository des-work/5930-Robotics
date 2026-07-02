// GET  /api/events            → list current events (newest first)
// POST /api/events             → add one   (admin)   {title, summary, link}
// DELETE /api/events?index=N   → remove one (admin)
import { json, text, requireAdmin } from "./_lib.js";

const KEY = "events";
const load = async (env) => JSON.parse((await env.DYNAMIC.get(KEY)) || "[]");

export async function onRequestGet({ env }) {
  return json(await load(env));
}

export async function onRequestPost({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  if (!body?.title) return text("Missing title.", 400);
  const events = await load(env);
  events.unshift({
    title: String(body.title).slice(0, 200),
    summary: String(body.summary || "").slice(0, 500),
    link: String(body.link || "").slice(0, 500),
    date: new Date().toISOString().slice(0, 10),
  });
  await env.DYNAMIC.put(KEY, JSON.stringify(events.slice(0, 50)));
  return json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const i = parseInt(new URL(request.url).searchParams.get("index"), 10);
  const events = await load(env);
  if (!(i >= 0 && i < events.length)) return text("Bad index.", 400);
  events.splice(i, 1);
  await env.DYNAMIC.put(KEY, JSON.stringify(events));
  return json({ ok: true });
}
