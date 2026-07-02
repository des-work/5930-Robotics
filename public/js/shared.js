// Shared helpers used by all pages.

export const moduleColor = n =>
  ({ 1: "#4da3ff", 2: "#b967ff", 3: "#05ffa1", 4: "#ff9f43" }[n] || "#05d9e8");

// IntersectionObserver fallback for browsers without CSS scroll-driven animations.
export function revealFallback() {
  if (CSS.supports("animation-timeline: view()")) return;
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll(".reveal, .stagger > *").forEach(el => io.observe(el));
}

// Cursor-tracking glow (vault: spotlight-hover).
export function spotlight() {
  document.querySelectorAll(".spot").forEach(el => el.addEventListener("mousemove", e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", (e.clientX - r.left) + "px");
    el.style.setProperty("--my", (e.clientY - r.top) + "px");
  }));
}

// Derive a video thumbnail from a link (YouTube/Vimeo get real thumbnails).
export function videoThumb(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://img.youtube.com/vi/${u.pathname.slice(1)}/hqdefault.jpg`;
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v") || u.pathname.split("/").pop();
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    if (u.hostname.includes("vimeo.com")) return `https://vumbnail.com/${u.pathname.split("/").filter(Boolean).pop()}.jpg`;
  } catch { /* not a URL */ }
  return null;
}

export const fmtDate = d => {
  const dt = new Date(d + (d?.length === 10 ? "T12:00:00" : ""));
  return isNaN(dt) ? (d || "") : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const escapeHtml = s => String(s ?? "")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
