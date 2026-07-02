// Week detail page renderer — /week?w=N
import { moduleColor, revealFallback, spotlight, videoThumb, fmtDate, escapeHtml } from "/js/shared.js";

const data = await (await fetch("/content/course.json")).json();
const { modules, weeks } = data;

const n = Math.min(Math.max(parseInt(new URLSearchParams(location.search).get("w")) || 1, 1), weeks.length);
const w = weeks.find(x => x.n === n);
const mod = modules.find(m => m.n === w.module);
const mc = moduleColor(w.module);
document.title = `Week ${w.n} · ${w.title} — IST 5930`;

/* ---------- hero + journey strip ---------- */
const strip = weeks.map((x, i) => {
  const cls = x.n === n ? "now" : x.n < n ? "done" : "";
  const dot = `<a class="jdot ${cls}" href="/week?w=${x.n}" title="Week ${x.n}: ${escapeHtml(x.title)}"
    style="--jc:${moduleColor(x.module)}; ${x.n === n ? `--mc:${mc}` : ""}"></a>`;
  const bar = i < weeks.length - 1 ? `<span class="jbar ${x.n < n ? "done" : ""}" style="--jc:${moduleColor(x.module)}"></span>` : "";
  return dot + bar;
}).join("");

document.getElementById("week-hero").innerHTML = `
  <div class="wrap mc-${w.module}">
    <div class="crumbs"><a href="/">Course</a> / <a href="/#mod-${mod.n}">Module ${mod.n} · ${mod.name}</a> / Week ${w.n}</div>
    <span class="bigicon">${w.icon}</span>
    <div><span class="tag">Week ${String(w.n).padStart(2, "0")} · ${w.tag} · ${mod.name}</span></div>
    <h1 class="grad-shift" style="background-image:linear-gradient(90deg, ${mc}, #e2ecf7, ${mc});">${w.title}</h1>
    <div class="journey-strip">${strip}</div>
    <div class="journey-legend"><span>Week 1 · first SSH</span><span>You are here: ${Math.round((n / weeks.length) * 100)}% through the journey</span><span>Week 15 · final demo</span></div>
  </div>`;
document.getElementById("week-hero").classList.add(`mc-${w.module}`);

/* ---------- body ---------- */
const terms = (w.keyTerms || []).map(t => `
  <div class="flip" tabindex="0" role="button" aria-label="Key term: ${escapeHtml(t.t)} — activate to reveal definition">
    <div class="flip-inner">
      <div class="flip-front"><span class="term">${t.t}</span><span class="hint">hover / tap to decode</span></div>
      <div class="flip-back">${t.d}</div>
    </div>
  </div>`).join("");

const facts = (w.funFacts || []).map(f => `<div class="fact"><span class="fi">💡</span><span>${f}</span></div>`).join("");

document.getElementById("week-body").innerHTML = `
  <div class="mc-${w.module}" style="display:grid; gap:2.2rem;">

    <div class="two-col">
      <div class="panel glass reveal">
        <h2><span class="dot"></span>What we're learning</h2>
        <p>${w.what}</p>
      </div>
      <div class="panel glass reveal">
        <h2><span class="dot"></span>Why it matters in the real world</h2>
        <p>${w.why}</p>
        <div class="arcnote" style="margin-top:1.2rem"><b>Where this fits in the arc:</b> ${w.arc}</div>
      </div>
    </div>

    <div class="panel glass reveal">
      <h2><span class="dot"></span>Key terms — flip to decode</h2>
      <div class="terms-grid stagger">${terms}</div>
    </div>

    <div class="two-col">
      <div class="panel glass reveal">
        <h2><span class="dot"></span>Fun facts</h2>
        <div class="facts">${facts}</div>
      </div>
      <div class="lab-callout glass reveal">
        <h3>🔬 This week's lab</h3>
        <p>${w.lab}</p>
      </div>
    </div>

    <div class="panel glass reveal">
      <h2><span class="dot"></span>Watch — videos for this week</h2>
      <div class="videos-grid stagger" id="videos-grid"><div class="empty">Loading videos…</div></div>
    </div>

    <div class="panel glass reveal">
      <h2><span class="dot"></span>Professor's slides &amp; documents</h2>
      <div class="docs-list" id="docs-list"><div class="empty">Loading documents…</div></div>
    </div>

    <div class="pager">
      ${n > 1 ? `<a class="glass sheen" href="/week?w=${n - 1}"><div class="plabel">← Previous</div><div class="ptitle">${weeks[n - 2].icon} ${weeks[n - 2].title}</div></a>` : "<span></span>"}
      ${n < weeks.length ? `<a class="glass sheen" href="/week?w=${n + 1}"><div class="plabel">Next →</div><div class="ptitle">${weeks[n].icon} ${weeks[n].title}</div></a>` : ""}
    </div>
  </div>`;

/* ---------- dynamic: videos (curriculum seed + admin-added) ---------- */
(async () => {
  let vids = [...(w.videos || [])];
  try {
    const extra = await (await fetch(`/api/videos?week=${n}`)).json();
    vids = vids.concat(extra);
  } catch { /* offline / not deployed yet */ }
  const grid = document.getElementById("videos-grid");
  grid.innerHTML = vids.length ? vids.map(v => {
    const thumb = videoThumb(v.url);
    return `<a class="video-card sheen" href="${escapeHtml(v.url)}" target="_blank" rel="noopener">
      <div class="video-thumb" style="${thumb ? `background-image:url('${thumb}')` : `background:linear-gradient(140deg, color-mix(in srgb, ${mc} 30%, var(--bg-deep)), var(--bg-deep))`}"></div>
      <div class="vt">${escapeHtml(v.title || v.url)}</div>
    </a>`;
  }).join("") : `<div class="empty">No videos posted for this week yet.</div>`;
})();

/* ---------- dynamic: uploaded docs ---------- */
(async () => {
  const list = document.getElementById("docs-list");
  try {
    const docs = await (await fetch(`/api/docs?week=${n}`)).json();
    const icons = { pdf: "📕", ppt: "📽️", pptx: "📽️", doc: "📄", docx: "📄", xlsx: "📊", csv: "📊", zip: "🗜️", py: "🐍", ipynb: "📓" };
    list.innerHTML = docs.length ? docs.map(d => {
      const ext = d.name.split(".").pop().toLowerCase();
      const kb = d.size > 1048576 ? (d.size / 1048576).toFixed(1) + " MB" : Math.round(d.size / 1024) + " KB";
      return `<a class="doc-item sheen" href="/api/files/${encodeURIComponent(d.key)}">
        <span class="di">${icons[ext] || "📎"}</span>
        <span class="dn">${escapeHtml(d.name)}</span>
        <span class="ds">${kb} · ${fmtDate(d.uploaded)}</span>
      </a>`;
    }).join("") : `<div class="empty">The professor hasn't uploaded slides for this week yet.</div>`;
  } catch {
    list.innerHTML = `<div class="empty">Documents appear here once the site is deployed.</div>`;
  }
})();

/* ---------- interactions ---------- */
spotlight();
revealFallback();
// tap-to-flip for touch devices + keyboard
document.querySelectorAll(".flip").forEach(el => {
  el.addEventListener("click", () => el.classList.toggle("flipped"));
  el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.classList.toggle("flipped"); } });
});
