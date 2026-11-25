/* Bounty Hunter HQ — all client-side. Live values are labelled LIVE with a
   time; anything that could not be fetched live falls back to a recorded
   snapshot labelled CACHED with its timestamp. Nothing is faked as live. */
"use strict";

const GOAL = 70;
const EARN_KEY = "bhh-earnings-v1";
const CHECK_KEY = "bhh-checklist-v1";
const DUNE = {
  contract: "0x1296da72914EA99a6Ac0D0c94Afba2D890dFA25b",
  rpc: "https://bsc-dataseed.bnbchain.org",
  data: "0xa2309ff8", // totalMinted()
  supply: 6666,
};

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
function wib(iso) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta", day: "2-digit", month: "short",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date(iso)) + " WIB";
  } catch { return String(iso); }
}
function wibNow() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date()) + " WIB";
}
function money(n) {
  return "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function setPill(el, mode, label) {
  el.className = "pill " + mode;
  el.textContent = label;
}
async function fetchJSON(url, opts, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs || 10000);
  try {
    const r = await fetch(url, { ...opts, signal: ctrl.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

/* ---------- 1. Bounty board ---------- */
let boardItems = [];
function isZeroFee(c) {
  return c.entryFeesUsd === "0.00" || c.entryFeeUsd === null ||
    c.entryFeeUsd === 0 || c.entryFeeUsd === "0";
}
function renderBoard() {
  const q = (document.getElementById("boardSearch").value || "").toLowerCase();
  const sort = document.getElementById("boardSort").value;
  let items = boardItems.filter((c) =>
    (!q || (c.title + " " + (c.category || "")).toLowerCase().includes(q)));
  if (sort === "pot") items = [...items].sort((a, b) => (b.rewardAmount || 0) - (a.rewardAmount || 0));
  else items = [...items].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const ul = document.getElementById("boardList");
  if (!items.length) { ul.innerHTML = '<li class="muted">No open zero-capital bounties match.</li>'; return; }
  ul.innerHTML = items.map((c) => {
    const pot = c.potUsd ? money(parseFloat(c.potUsd)) : money(c.rewardAmount);
    return `<li><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.title)}</a>
      <div class="meta"><span class="pot">${pot}</span> · ends ${esc(wib(c.deadline))} · ${esc(c.category || "—")} · ${esc(c.submissionCount ?? "?")} entries</div></li>`;
  }).join("");
}
async function loadBoard() {
  const pill = document.getElementById("boardPill");
  const src = document.getElementById("boardSrc");
  const now = Date.now();
  try {
    const d = await fetchJSON("https://make.fun/api/competitions?limit=200", {}, 10000);
    const items = (d.items || []).filter((c) => c.deadline && new Date(c.deadline).getTime() > now && isZeroFee(c));
    if (!items.length) throw new Error("empty board");
    boardItems = items;
    setPill(pill, "live", "live · " + wibNow());
    src.textContent = "Source: make.fun public API, fetched live this session.";
  } catch (e) {
    try {
      const snap = await fetchJSON("data/board-snapshot.json", {}, 8000);
      boardItems = (snap.items || []);
      setPill(pill, "cached", "cached · " + esc(snap.fetched_at_wib || ""));
      src.textContent = "Live board unreachable (" + esc(e.message) + "). Showing cached snapshot recorded " + esc(snap.fetched_at_wib || "") + ".";
    } catch {
      document.getElementById("boardList").innerHTML = '<li class="muted">Board unavailable — live fetch and cached snapshot both failed.</li>';
      setPill(pill, "cached", "unavailable");
      src.textContent = "";
    }
  }
  renderBoard();
}
document.getElementById("boardSearch").addEventListener("input", renderBoard);
document.getElementById("boardSort").addEventListener("change", renderBoard);

/* ---------- 2. Free-mint radar ---------- */
async function loadMints() {
  const pill = document.getElementById("radarPill");
  const list = document.getElementById("mintList");
  const src = document.getElementById("radarSrc");
  let data;
  try { data = await fetchJSON("data/mints.json", {}, 8000); }
  catch { list.innerHTML = '<li class="muted">Mint data unavailable.</li>'; return; }
  const dune = data.items.find((m) => m.name.startsWith("DUNE")) || data.items[0];
  const rest = data.items.filter((m) => m !== dune);
  const feat = document.getElementById("featuredMint");
  feat.innerHTML = `<div class="featured"><h3>⭐ Featured: ${esc(dune.name)}</h3>
    <div class="meta">${esc(dune.free)} · BSC</div>
    <div><span class="big" id="duneCount">${esc(dune.minted)} / ${esc(dune.supply)}</span>
    <span class="cached-tag" id="duneTag">cached ${esc(dune.minted_at_wib)}</span></div>
    <div class="meta">${esc(dune.note || "")}</div>
    <div class="addr">${esc(dune.contract || "")}</div>
    <div class="meta"><a href="${esc(dune.link)}" target="_blank" rel="noopener">${esc(dune.link)}</a></div></div>`;
  list.innerHTML = rest.map((m) => `<li><b>${esc(m.name)}</b>
    <div class="meta">${esc(m.free)} · ${esc(m.chain)} · minted ${esc(m.minted)}${m.supply ? " / " + esc(m.supply) : ""} <span class="cached-tag">cached ${esc(m.minted_at_wib)}</span></div>
    ${m.contract ? `<div class="addr">${esc(m.contract)}</div>` : ""}
    ${m.warning ? `<div class="risk">⚠ ${esc(m.warning)}</div>` : ""}
    ${m.note ? `<div class="meta">${esc(m.note)}</div>` : ""}
    <div class="meta"><a href="${esc(m.link)}" target="_blank" rel="noopener">${esc(m.link)}</a></div></li>`).join("");
  src.textContent = "Mint list recorded " + (data.updated_wib || "") + " from the hunter's verified records. Only the featured DUNE count is read live on-chain.";
  setPill(pill, "cached", "cached · " + (data.updated_wib || ""));
  // Live DUNE read
  try {
    const res = await fetchJSON(DUNE.rpc, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_call", params: [{ to: DUNE.contract, data: DUNE.data }, "latest"], id: 1 }),
    }, 10000);
    const n = parseInt(res.result, 16);
    if (!res.result || Number.isNaN(n)) throw new Error("bad rpc result");
    document.getElementById("duneCount").textContent = n + " / " + DUNE.supply;
    const tag = document.getElementById("duneTag");
    tag.className = "live-tag"; tag.textContent = "live · " + wibNow();
    setPill(pill, "live", "live DUNE · " + wibNow());
  } catch { /* cached count stays, honestly labelled */ }
}

/* ---------- 3. Earnings tracker ---------- */
function loadEarnings() {
  try { return JSON.parse(localStorage.getItem(EARN_KEY) || "[]"); } catch { return []; }
}
function saveEarnings(rows) { try { localStorage.setItem(EARN_KEY, JSON.stringify(rows)); } catch {} }
function renderEarnings() {
  const rows = loadEarnings();
  const ul = document.getElementById("earnList");
  const earned = rows.filter((r) => r.status === "won").reduce((s, r) => s + (Number(r.payout) || 0), 0);
  ul.innerHTML = rows.length ? rows.map((r) => `<li><b>${esc(r.name)}</b>
    <span class="meta">pot ${money(r.pot)} · ${esc(r.status)}${r.status === "won" ? " · paid " + money(r.payout) : ""}</span>
    <button class="del" data-id="${esc(r.id)}" type="button">✕</button></li>`).join("")
    : '<li class="muted">No entries logged yet. Add your first submission above.</li>';
  document.getElementById("earnTotals").textContent =
    "Earned: " + money(earned) + " of $70.00 goal (" + rows.length + " entr" + (rows.length === 1 ? "y" : "ies") + " logged)";
  document.getElementById("goalNum").textContent = money(earned);
  document.getElementById("goalFill").style.width = Math.min(100, (earned / GOAL) * 100) + "%";
  ul.querySelectorAll(".del").forEach((b) => b.addEventListener("click", () => {
    saveEarnings(loadEarnings().filter((r) => r.id !== b.dataset.id));
    renderEarnings();
  }));
}
document.getElementById("earnForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const rows = loadEarnings();
  rows.unshift({
    id: Date.now().toString(36),
    name: document.getElementById("earnName").value.trim(),
    pot: parseFloat(document.getElementById("earnPot").value) || 0,
    status: document.getElementById("earnStatus").value,
    payout: parseFloat(document.getElementById("earnPayout").value) || 0,
  });
  saveEarnings(rows);
  e.target.reset();
  renderEarnings();
});

/* ---------- 5. Daily checklist ---------- */
const CHECKS = [
  ["news-image", "Check today's news-image bounty"],
  ["race", "Check race / bounty results"],
  ["pxio", "Claim PXIO if the cycle is full"],
  ["flop", "Check the FLOP testnet faucet"],
];
function loadChecks() {
  try { return JSON.parse(localStorage.getItem(CHECK_KEY) || "{}"); } catch { return {}; }
}
function renderChecks() {
  const state = loadChecks();
  document.getElementById("checkList").innerHTML = CHECKS.map(([id, label]) =>
    `<li class="${state[id] ? "done" : ""}"><label><input type="checkbox" data-id="${id}" ${state[id] ? "checked" : ""}><span>${esc(label)}</span></label></li>`).join("");
  document.querySelectorAll("#checkList input").forEach((box) => box.addEventListener("change", () => {
    const s = loadChecks(); s[box.dataset.id] = box.checked;
    try { localStorage.setItem(CHECK_KEY, JSON.stringify(s)); } catch {}
    renderChecks();
  }));
}
document.getElementById("checkReset").addEventListener("click", () => {
  try { localStorage.removeItem(CHECK_KEY); } catch {}
  renderChecks();
});

/* ---------- boot ---------- */
loadBoard();
loadMints();
renderEarnings();
renderChecks();
