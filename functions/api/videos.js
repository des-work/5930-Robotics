// GET    /api/videos?week=N           → list admin-added videos for a week
// POST   /api/videos?week=N   (admin) → add {title, url}
// DELETE /api/videos?week=N&index=I (admin)
import { json, text, requireAdmin, weekNum } from "./_lib.js";

const load = async (env, wk) => JSON.parse((await env.DYNAMIC.get(`videos:${wk}`)) || "[]");

export async function onRequestGet({ request, env }) {
  const wk = weekNum(new URL(request.url).searchParams.get("week"));
  if (!wk) return text("Bad week.", 400);
  return json(await load(env, wk));
}

export async function onRequestPost({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const wk = weekNum(new URL(request.url).searchParams.get("week"));
  if (!wk) return text("Bad week.", 400);
  const body = await request.json().catch(() => null);
  if (!body?.url) return text("Missing url.", 400);
  try { new URL(body.url); } catch { return text("Not a valid URL.", 400); }
  const vids = await load(env, wk);
  vids.push({ title: String(body.title || body.url).slice(0, 200), url: String(body.url).slice(0, 500) });
  await env.DYNAMIC.put(`videos:${wk}`, JSON.stringify(vids.slice(0, 30)));
  return json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  const u = new URL(request.url);
  const wk = weekNum(u.searchParams.get("week"));
  const i = parseInt(u.searchParams.get("index"), 10);
  if (!wk) return text("Bad week.", 400);
  const vids = await load(env, wk);
  if (!(i >= 0 && i < vids.length)) return text("Bad index.", 400);
  vids.splice(i, 1);
  await env.DYNAMIC.put(`videos:${wk}`, JSON.stringify(vids));
  return json({ ok: true });
}
