// Shared helpers for Pages Functions.

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

export const text = (msg, status) => new Response(msg, { status });

// All writes require the instructor key (set with: wrangler pages secret put ADMIN_KEY)
export function requireAdmin(request, env) {
  const key = request.headers.get("x-admin-key");
  if (!env.ADMIN_KEY) return text("ADMIN_KEY secret not configured on the server.", 500);
  if (!key || key !== env.ADMIN_KEY) return text("Invalid admin key.", 401);
  return null;
}

export const weekNum = (v) => {
  const n = parseInt(v, 10);
  return Number.isInteger(n) && n >= 1 && n <= 15 ? n : null;
};
