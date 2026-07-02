// POST /api/upload (admin, multipart) — store a document in R2 under week-N/filename
import { json, text, requireAdmin, weekNum } from "./_lib.js";

const ALLOWED = new Set(["pdf", "ppt", "pptx", "doc", "docx", "xls", "xlsx", "csv", "txt", "md", "zip", "py", "ipynb", "png", "jpg", "jpeg"]);

export async function onRequestPost({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const wk = weekNum(form?.get("week"));
  if (!file || typeof file === "string") return text("No file.", 400);
  if (!wk) return text("Bad week.", 400);
  if (file.size > 100 * 1024 * 1024) return text("File exceeds 100 MB.", 413);

  const safeName = file.name.replace(/[^\w.\- ()]/g, "_");
  const ext = safeName.split(".").pop().toLowerCase();
  if (!ALLOWED.has(ext)) return text(`File type .${ext} not allowed.`, 415);

  const key = `week-${wk}/${safeName}`;
  await env.DOCS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
    customMetadata: { uploaded: new Date().toISOString(), week: String(wk) },
  });
  return json({ ok: true, key });
}
