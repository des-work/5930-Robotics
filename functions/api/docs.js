// GET /api/docs?week=N → list uploaded documents for a week
import { json, text, weekNum } from "./_lib.js";

export async function onRequestGet({ request, env }) {
  const wk = weekNum(new URL(request.url).searchParams.get("week"));
  if (!wk) return text("Bad week.", 400);
  const listed = await env.DOCS.list({ prefix: `week-${wk}/`, include: ["customMetadata"] });
  return json(listed.objects.map(o => ({
    key: o.key,
    name: o.key.slice(`week-${wk}/`.length),
    size: o.size,
    uploaded: (o.customMetadata?.uploaded || new Date(o.uploaded).toISOString()).slice(0, 10),
  })));
}
