// IST 5930 site — homepage renderer. All content comes from /content/course.json
// (edit that file to change the site) + /api/* for dynamic content (admin-managed).

import { moduleColor, revealFallback, spotlight, videoThumb, fmtDate } from "/js/shared.js";

const data = await (await fetch("/content/course.json")).json();
const { course, modules, weeks } = data;

/* ---------- narrative ---------- */
const nar = document.getElementById("narrative-card");
nar.insertAdjacentHTML("beforeend",
  `<h2>${course.narrative.headline}</h2>` +
  course.narrative.paragraphs.map(p => `<p>${p}</p>`).join("")
);

/* ---------- professor ---------- */
const prof = course.instructor;
if (prof) {
  document.getElementById("prof-card").innerHTML = `
    <div class="prof-fig grad-border mc-4"><div class="media-inner">
      <img src="${prof.image}" alt="${prof.imageAlt}" width="450" height="658" loading="lazy" />
    </div></div>
    <div class="prof-copy">
      <span class="kicker" style="--mc: var(--m4)">${prof.kicker}</span>
      <h2>${prof.headline}</h2>
      <div class="prof-tagline">${prof.tagline.map(t => `<span>${t}</span>`).join("")}</div>
      ${prof.paragraphs.map(p => `<p>${p}</p>`).join("")}
      <ul class="prof-timeline">
        ${prof.timeline.map(t => `<li><span class="yr">${t.years}</span><span>${t.label}</span></li>`).join("")}
      </ul>
      <div class="prof-links">
        ${prof.links.map(l => `<a class="btn sheen" href="${l.url}" target="_blank" rel="noopener">${l.label} →</a>`).join("")}
      </div>
    </div>`;
}

/* ---------- journey arc SVG ---------- */
const jx = [130, 420, 700, 960];
const jy = [150, 78, 150, 78];
const jw = ["W1–4", "W5–8", "W9–11", "W12–15"];
const path = `M ${jx[0]} ${jy[0]} C 250 150, 300 78, ${jx[1]} ${jy[1]} S 580 150, ${jx[2]} ${jy[2]} S 860 78, ${jx[3]} ${jy[3]}`;
document.getElementById("journey-svg").innerHTML = `
<svg viewBox="0 0 1090 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Course journey: four modules building one system">
  <defs>
    <linearGradient id="jgrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${moduleColor(1)}"/><stop offset=".35" stop-color="${moduleColor(2)}"/>
      <stop offset=".68" stop-color="${moduleColor(3)}"/><stop offset="1" stop-color="${moduleColor(4)}"/>
    </linearGradient>
    <filter id="jglow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="${path}" fill="none" stroke="url(#jgrad)" stroke-width="3" opacity=".9" class="dash-flow" filter="url(#jglow)"/>
  ${modules.map((m, i) => `
    <g class="jnode" style="cursor:pointer" onclick="document.getElementById('mod-${m.n}').scrollIntoView({behavior:'smooth'})">
      <circle cx="${jx[i]}" cy="${jy[i]}" r="22" fill="${moduleColor(m.n)}" opacity=".18" class="pulse"/>
      <circle cx="${jx[i]}" cy="${jy[i]}" r="11" fill="${moduleColor(m.n)}" filter="url(#jglow)"/>
      <text x="${jx[i]}" y="${jy[i] + (jy[i] < 100 ? -38 : 46)}" text-anchor="middle" class="node-label" font-size="15">${m.name}</text>
      <text x="${jx[i]}" y="${jy[i] + (jy[i] < 100 ? -20 : 64)}" text-anchor="middle" class="node-sub">${jw[i]} · ${m.question}</text>
    </g>`).join("")}
</svg>`;

/* ---------- per-module animated media visuals ---------- */
const glow = c => `filter="url(#mg${c})"`;
const defs = n => `<defs><filter id="mg${n}"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
const visuals = {
  1: c => `<svg viewBox="0 0 300 220">${defs(1)}
    <g class="mfloat">
    <line x1="150" y1="60" x2="60" y2="150" stroke="${c}" stroke-width="2" class="dash-flow" opacity=".7"/>
    <line x1="150" y1="60" x2="150" y2="160" stroke="${c}" stroke-width="2" class="dash-flow" opacity=".7"/>
    <line x1="150" y1="60" x2="240" y2="150" stroke="${c}" stroke-width="2" class="dash-flow" opacity=".7"/>
    <circle cx="150" cy="60" r="18" fill="${c}" ${glow(1)}/>
    <circle cx="60" cy="150" r="12" fill="${c}" opacity=".75"/><circle cx="150" cy="160" r="12" fill="${c}" opacity=".75"/><circle cx="240" cy="150" r="12" fill="${c}" opacity=".75"/>
    <text x="150" y="35" text-anchor="middle" fill="${c}" font-family="monospace" font-size="12">topic: /g1/jointstate</text>
    <text x="150" y="200" text-anchor="middle" fill="${c}" opacity=".6" font-family="monospace" font-size="11">publish → subscribe</text></g></svg>`,
  2: c => `<svg viewBox="0 0 300 220">${defs(2)}
    <g class="mfloat">
    ${Array.from({ length: 13 }, (_, i) => {
      const h = [12, 26, 44, 62, 40, 70, 88, 66, 46, 60, 34, 22, 12][i];
      return `<rect x="${52 + i * 15}" y="${110 - h / 2}" width="7" height="${h}" rx="3.5" fill="${c}" opacity="${.45 + (h / 140)}" ${glow(2)}>
        <animate attributeName="height" values="${h};${h * 0.35};${h}" dur="${1 + (i % 5) * .22}s" repeatCount="indefinite"/>
        <animate attributeName="y" values="${110 - h / 2};${110 - h * 0.175};${110 - h / 2}" dur="${1 + (i % 5) * .22}s" repeatCount="indefinite"/></rect>`;
    }).join("")}
    <text x="150" y="185" text-anchor="middle" fill="${c}" font-family="monospace" font-size="12">ASR → Claude → TTS → speaker</text></g></svg>`,
  3: c => `<svg viewBox="0 0 300 220">${defs(3)}
    <g class="mfloat">
    <path d="M30 160 Q 80 40, 150 110 T 270 70" fill="none" stroke="${c}" stroke-width="2.5" class="dash-flow" ${glow(3)}/>
    <path d="M30 170 Q 85 70, 150 125 T 270 85" fill="none" stroke="${c}" stroke-width="1.5" opacity=".4"/>
    <circle r="7" fill="${c}" ${glow(3)}><animateMotion dur="3.2s" repeatCount="indefinite" path="M30 160 Q 80 40, 150 110 T 270 70"/></circle>
    <text x="150" y="200" text-anchor="middle" fill="${c}" font-family="monospace" font-size="12">human trajectory → robot joints</text></g></svg>`,
  4: c => `<svg viewBox="0 0 300 220">${defs(4)}
    <g class="mfloat">
    <path d="M150 30 L 210 55 V 110 Q 210 155 150 180 Q 90 155 90 110 V 55 Z" fill="none" stroke="${c}" stroke-width="2.5" ${glow(4)}/>
    <path d="M150 30 L 210 55 V 110 Q 210 155 150 180 Q 90 155 90 110 V 55 Z" fill="${c}" opacity=".08" class="pulse"/>
    ${[0, 1, 2, 3].map(i => `<rect x="${120 + i * 18}" y="${138 - [22, 38, 30, 46][i]}" width="10" height="${[22, 38, 30, 46][i]}" rx="2" fill="${c}" opacity=".8">
      <animate attributeName="height" values="${[22, 38, 30, 46][i]};${[30, 22, 44, 30][i]};${[22, 38, 30, 46][i]}" dur="${2 + i * .4}s" repeatCount="indefinite"/>
      <animate attributeName="y" values="${138 - [22, 38, 30, 46][i]};${138 - [30, 22, 44, 30][i]};${138 - [22, 38, 30, 46][i]}" dur="${2 + i * .4}s" repeatCount="indefinite"/></rect>`).join("")}
    <text x="150" y="205" text-anchor="middle" fill="${c}" font-family="monospace" font-size="12">threat model + telemetry</text></g></svg>`
};

/* ---------- Z-pattern module rows ---------- */
document.getElementById("modules-z").innerHTML = modules.map(m => `
  <div class="row reveal mc-${m.n}" id="mod-${m.n}">
    <div class="media grad-border"><div class="media-inner">${visuals[m.n](moduleColor(m.n))}</div></div>
    <div>
      <span class="module-num">Module 0${m.n} · ${m.weeks}</span>
      <h3>${m.name}</h3>
      <p class="question">“${m.question}”</p>
      <p class="muted">${m.blurb}</p>
      <div class="arcnote"><b>Where this fits:</b> ${m.arc}</div>
    </div>
  </div>`).join("");

/* ---------- weeks grid ---------- */
document.getElementById("weeks-grid").innerHTML = weeks.map(w => `
  <a class="week-card glass spot sheen mc-${w.module}" href="/week?w=${w.n}">
    <span class="ghostnum">${String(w.n).padStart(2, "0")}</span>
    <span class="icon">${w.icon}</span>
    <span class="wk">Week ${String(w.n).padStart(2, "0")} · ${w.tag}</span>
    <h4>${w.title}</h4>
    <p>${w.what.split(". ")[0].slice(0, 110)}${w.what.length > 110 ? "…" : ""}</p>
    <div class="go">Open week →</div>
  </a>`).join("");

/* ---------- current events (dynamic, admin-managed) ---------- */
try {
  const events = await (await fetch("/api/events")).json();
  const list = document.getElementById("events-list");
  list.innerHTML = events.length ? events.map(e => `
    <div class="event-item glass spot mc-1">
      <span class="date">${fmtDate(e.date)}</span>
      <h4>${e.title}</h4>
      <p>${e.summary || ""}</p>
      ${e.link ? `<a href="${e.link}" target="_blank" rel="noopener">Read / watch →</a>` : ""}
    </div>`).join("")
    : `<div class="empty">No current events posted yet — check back after class.</div>`;
} catch {
  document.getElementById("events-list").innerHTML =
    `<div class="empty">Current events appear here once the site is deployed.</div>`;
}

/* ---------- info cards ---------- */
document.getElementById("info-grid").innerHTML = `
  <div class="info-card glass">
    <h3>🛤️ Project Tracks <span class="muted" style="font-size:.8rem">(choose by Week 3)</span></h3>
    <table>${course.tracks.map(t => `
      <tr><td><span class="track-badge">${t.id}</span><b>${t.name}</b><br>
      <span class="muted">Midterm: ${t.midterm}<br>Final: ${t.final}</span></td></tr>`).join("")}
    </table>
  </div>
  <div class="info-card glass">
    <h3>📋 Grading</h3>
    <table>${course.grading.map(g => `<tr><td>${g.item}</td><td class="mono" style="text-align:right">${g.weight}</td></tr>`).join("")}</table>
    <h3 style="margin-top:1.4rem">🎯 You'll be able to…</h3>
    <table>${course.outcomes.map(o => `<tr><td>✅ ${o}</td></tr>`).join("")}</table>
  </div>
  <div class="info-card glass">
    <h3>🤖 The Robot Fleet</h3>
    <table><tr><th>Robot</th><th>Type</th><th>Role</th></tr>
    ${course.robots.map(r => `<tr><td><b>${r.name}</b></td><td>${r.type}</td><td class="muted">${r.role}</td></tr>`).join("")}
    </table>
  </div>`;

/* ---------- interactions ---------- */
spotlight();
revealFallback();

// hero counters
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  const el = en.target, target = +el.dataset.count, t0 = performance.now();
  const tick = now => {
    const p = Math.min((now - t0) / 1400, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  io.unobserve(el);
}));
document.querySelectorAll("[data-count]").forEach(el => io.observe(el));
