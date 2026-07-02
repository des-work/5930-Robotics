// Instructor admin panel — talks to /api/* Pages Functions with the admin key.
import { videoThumb, fmtDate, escapeHtml } from "/js/shared.js";

const data = await (await fetch("/content/course.json")).json();
const weeks = data.weeks;

const $ = id => document.getElementById(id);
const keyInput = $("admin-key");
keyInput.value = localStorage.getItem("ist5930-admin-key") || "";
keyInput.addEventListener("change", () => {
  localStorage.setItem("ist5930-admin-key", keyInput.value.trim());
  $("key-status").textContent = "Key saved on this device.";
  $("key-status").className = "status ok";
});

const headers = () => ({ "x-admin-key": keyInput.value.trim() });
const setStatus = (id, msg, ok) => { const el = $(id); el.textContent = msg; el.className = `status ${ok ? "ok" : "err"}`; };

// populate week selectors
const opts = weeks.map(w => `<option value="${w.n}">Week ${w.n} — ${w.title}</option>`).join("");
$("up-week").innerHTML = opts;
$("vid-week").innerHTML = opts;

/* ---------- uploads ---------- */
async function refreshDocs() {
  const wk = $("up-week").value;
  try {
    const docs = await (await fetch(`/api/docs?week=${wk}`)).json();
    $("up-existing").innerHTML = docs.map(d => `
      <div class="doc-item"><span class="di">📎</span><span class="dn">${escapeHtml(d.name)}</span>
        <button class="btn ds" style="padding:.2rem .8rem" data-del-doc="${escapeHtml(d.key)}">Delete</button></div>`).join("");
    document.querySelectorAll("[data-del-doc]").forEach(b => b.onclick = async () => {
      const r = await fetch(`/api/files/${encodeURIComponent(b.dataset.delDoc)}`, { method: "DELETE", headers: headers() });
      setStatus("up-status", r.ok ? "Deleted." : `Delete failed (${r.status}).`, r.ok);
      refreshDocs();
    });
  } catch { $("up-existing").innerHTML = ""; }
}
$("up-week").addEventListener("change", refreshDocs);
refreshDocs();

$("up-btn").addEventListener("click", async () => {
  const file = $("up-file").files[0];
  if (!file) return setStatus("up-status", "Choose a file first.", false);
  if (file.size > 100 * 1024 * 1024) return setStatus("up-status", "File exceeds 100 MB.", false);
  setStatus("up-status", `Uploading ${file.name}…`, true);
  const fd = new FormData();
  fd.append("file", file);
  fd.append("week", $("up-week").value);
  const r = await fetch("/api/upload", { method: "POST", headers: headers(), body: fd });
  setStatus("up-status", r.ok ? `✅ ${file.name} uploaded — it's live on Week ${$("up-week").value}.` : `Upload failed (${r.status}): ${await r.text()}`, r.ok);
  if (r.ok) { $("up-file").value = ""; refreshDocs(); }
});

/* ---------- videos ---------- */
async function refreshVids() {
  const wk = $("vid-week").value;
  try {
    const vids = await (await fetch(`/api/videos?week=${wk}`)).json();
    $("vid-existing").innerHTML = vids.map((v, i) => `
      <div class="doc-item"><span class="di">🎬</span><span class="dn">${escapeHtml(v.title)}</span>
        <button class="btn ds" style="padding:.2rem .8rem" data-del-vid="${i}">Delete</button></div>`).join("");
    document.querySelectorAll("[data-del-vid]").forEach(b => b.onclick = async () => {
      const r = await fetch(`/api/videos?week=${wk}&index=${b.dataset.delVid}`, { method: "DELETE", headers: headers() });
      setStatus("vid-status", r.ok ? "Deleted." : `Delete failed (${r.status}).`, r.ok);
      refreshVids();
    });
  } catch { $("vid-existing").innerHTML = ""; }
}
$("vid-week").addEventListener("change", refreshVids);
refreshVids();

$("vid-btn").addEventListener("click", async () => {
  const title = $("vid-title").value.trim(), url = $("vid-url").value.trim();
  if (!url) return setStatus("vid-status", "Paste a video URL.", false);
  const r = await fetch(`/api/videos?week=${$("vid-week").value}`, {
    method: "POST", headers: { ...headers(), "content-type": "application/json" },
    body: JSON.stringify({ title: title || url, url })
  });
  setStatus("vid-status", r.ok
    ? `✅ Added${videoThumb(url) ? " — thumbnail detected." : " (no auto-thumbnail for this site; a styled placeholder is used)."}`
    : `Failed (${r.status}): ${await r.text()}`, r.ok);
  if (r.ok) { $("vid-title").value = ""; $("vid-url").value = ""; refreshVids(); }
});

/* ---------- current events ---------- */
async function refreshEvents() {
  try {
    const evs = await (await fetch("/api/events")).json();
    $("ev-existing").innerHTML = evs.map((e, i) => `
      <div class="doc-item"><span class="di">📰</span><span class="dn">${escapeHtml(e.title)}</span>
        <span class="ds">${fmtDate(e.date)}</span>
        <button class="btn" style="padding:.2rem .8rem; font-size:.75rem" data-del-ev="${i}">Delete</button></div>`).join("");
    document.querySelectorAll("[data-del-ev]").forEach(b => b.onclick = async () => {
      const r = await fetch(`/api/events?index=${b.dataset.delEv}`, { method: "DELETE", headers: headers() });
      setStatus("ev-status", r.ok ? "Deleted." : `Delete failed (${r.status}).`, r.ok);
      refreshEvents();
    });
  } catch { $("ev-existing").innerHTML = ""; }
}
refreshEvents();

$("ev-btn").addEventListener("click", async () => {
  const title = $("ev-title").value.trim();
  if (!title) return setStatus("ev-status", "Write a headline.", false);
  const r = await fetch("/api/events", {
    method: "POST", headers: { ...headers(), "content-type": "application/json" },
    body: JSON.stringify({ title, summary: $("ev-summary").value.trim(), link: $("ev-link").value.trim() })
  });
  setStatus("ev-status", r.ok ? "✅ Posted to the homepage." : `Failed (${r.status}): ${await r.text()}`, r.ok);
  if (r.ok) { $("ev-title").value = ""; $("ev-summary").value = ""; $("ev-link").value = ""; refreshEvents(); }
});
