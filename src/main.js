(() => {
'use strict';
const $ = s => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const wait = ms => new Promise(r => setTimeout(r, ms));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const W8 = ms => wait(reduced ? 0 : ms);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const TECH = Object.fromEntries(Engine.TECHS.map((t, i) => [t.key, Object.assign({ idx: i }, t)]));
const TECH_ORDER = Engine.TECHS.map(t => t.key);
const introAt = {}; STAGES.forEach((s, i) => { if (s.tech) introAt[s.tech] = i; });
// 章の中での番号
const chIdx = []; { const c = {}; STAGES.forEach((s, i) => { c[s.ch] = (c[s.ch] || 0) + 1; chIdx[i] = c[s.ch]; }); }
const label = i => STAGES[i].ch + '-' + chIdx[i];
STAGES.forEach(s => {
  if (!s.mode) s.time = Math.ceil((s.par * 4 + 14) / 5) * 5;
  else s.time = s.mode === 'test' ? 180 : s.mode === 'normal' ? 150 : 90;
});

/* ---------- 保存 ---------- */
const KEY = 'ultimate-sigma-v2';
const prog = { stars: {}, seen: {}, bgm: true, se: true, track: 'auto', unlockAll: false };
const TRACKS = [
  { f: 't1', name: 'Meditating Beat', who: 'fvi' }, { f: 't2', name: 'Favorite', who: 'fvi' }, { f: 't3', name: '3am West End', who: 'fvi' },
  { f: 't4', name: 'Beat One', who: 'fvi' }, { f: 't5', name: 'Ambient 2', who: 'Maximiliano Stradex' }, { f: 't6', name: 'Arpent', who: 'fvi' },
  { f: 't7', name: 'Chronos', who: 'fvi' }, { f: 't8', name: 'Ambient 1', who: 'Maximiliano Stradex' }, { f: 't9', name: 'Fireworks', who: 'fvi' },
];
const CH_TRACK = ['t2', 't1', 't2', 't3', 't4', 't5', 't7', 't6', 't8', 't9'];
try { Object.assign(prog, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
if (prog.track !== 'auto' && !TRACKS.some(t => t.f === prog.track)) prog.track = 'auto';
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch (e) {} };

/* ---------- アイコン ---------- */
const T = (x, y, s, txt, extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Times New Roman,serif" font-weight="700" font-size="${s}" fill="currentColor" ${extra}>${txt}</text>`;
const ICON = {
  dainyu: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">' + T(15, 22, 15, 'n', 'font-style="italic"') + '<path d="M14 27v8M10 31l4 4 4-4"/><rect x="8" y="36" width="14" height="9" rx="2" fill="currentColor" stroke="none"/>' + T(35, 30, 12, 'aₙ', 'font-family="sans-serif"') + '<path d="M24 17h20" stroke-width="1.6"/></svg>',
  toosa: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="8" cy="34" r="4" fill="currentColor"/><circle cx="24" cy="34" r="4" fill="currentColor"/><circle cx="40" cy="34" r="4" fill="currentColor"/><path d="M10 27q6-10 12 0M26 27q6-10 12 0"/><path d="M19 25l3 2 1-4M35 25l3 2 1-4"/>' + T(16, 14, 11, '+d', 'font-family="sans-serif"') + T(32, 14, 11, '+d', 'font-family="sans-serif"') + '</svg>',
  gauss: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="27" width="5" height="7" fill="currentColor" stroke="none"/><rect x="17" y="22" width="5" height="12" fill="currentColor" stroke="none"/><rect x="25" y="16" width="5" height="18" fill="currentColor" stroke="none"/><rect x="33" y="10" width="5" height="24" fill="none"/><path d="M11 39c5 6 21 6 25 0"/><path d="M8 36l3 3 3-3M33 36l3 3 3-3"/></svg>',
  toohi: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="4" y="30" width="6" height="6" fill="currentColor"/><rect x="15" y="24" width="12" height="12" fill="currentColor"/><path d="M8 24q4-8 10-4" stroke-linecap="round"/>' + T(38, 34, 13, '×r', 'font-family="sans-serif"') + '</svg>',
  geo: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="6" y="32" width="5" height="5" fill="currentColor"/><rect x="14" y="27" width="10" height="10" fill="currentColor"/><rect x="27" y="17" width="16" height="20"/><path d="M27 37l16-20" stroke-width="1.6"/></svg>',
  sk: '<svg viewBox="0 0 48 48">' + T(21, 34, 30, 'Σ') + T(37, 36, 17, 'k', 'font-style="italic"') + '</svg>',
  sk2: '<svg viewBox="0 0 48 48">' + T(18, 34, 30, 'Σ') + T(33, 36, 17, 'k', 'font-style="italic"') + T(42, 25, 12, '2') + '</svg>',
  sk3: '<svg viewBox="0 0 48 48">' + T(18, 34, 30, 'Σ') + T(33, 36, 17, 'k', 'font-style="italic"') + T(42, 25, 12, '3') + '</svg>',
  split: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="24" r="6" fill="currentColor" stroke="none"/><path d="M5 24h4M20 21l14-9M20 27l14 9"/><path d="M29 10l6 1-2 6M29 38l6-1-2-6"/><circle cx="40" cy="11" r="3.2" fill="currentColor" stroke="none"/><circle cx="40" cy="37" r="3.2" fill="currentColor" stroke="none"/></svg>',
  kaisa: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="7" cy="12" r="3.5" fill="currentColor"/><circle cx="20" cy="12" r="3.5" fill="currentColor"/><circle cx="33" cy="12" r="3.5" fill="currentColor"/><circle cx="44" cy="12" r="3" fill="currentColor"/><path d="M8 17l5 12 5-12M21 17l5 12 5-12M34 17l4 12 4-12"/><rect x="9" y="32" width="8" height="8" rx="2" fill="currentColor"/><rect x="22" y="32" width="8" height="8" rx="2" fill="currentColor"/><rect x="34" y="32" width="8" height="8" rx="2" fill="currentColor"/></svg>',
  hammer: '<svg viewBox="0 0 64 64"><g transform="rotate(-30 32 32)"><rect x="29" y="22" width="7" height="38" rx="2" fill="#5a4636"/><rect x="31" y="24" width="2" height="34" fill="#7a6250"/><rect x="14" y="8" width="38" height="18" rx="3" fill="#6d6a68"/><rect x="14" y="8" width="38" height="5" rx="2" fill="#9b9896"/><rect x="10" y="10" width="6" height="14" rx="2" fill="#4c4947"/><rect x="50" y="10" width="6" height="14" rx="2" fill="#4c4947"/></g><path d="M47 7l3-5M53 12l6-2M51 9l5-4" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',
  hammerW: '<svg viewBox="0 0 64 64"><g transform="rotate(-30 32 32)" fill="currentColor"><rect x="29" y="22" width="7" height="38" rx="2"/><rect x="14" y="8" width="38" height="18" rx="3"/></g></svg>',
  lock: '<svg viewBox="0 0 48 48"><rect x="11" y="21" width="26" height="21" rx="4" fill="currentColor"/><path d="M16 21v-6a8 8 0 0 1 16 0v6" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="24" cy="30" r="3" fill="#0a0c0b"/><rect x="22.5" y="31" width="3" height="6" rx="1" fill="#0a0c0b"/></svg>',
  domino: '<svg viewBox="0 0 48 48"><g transform="rotate(-18 14 40)"><rect x="8" y="8" width="11" height="32" rx="2" fill="currentColor"/></g><g transform="rotate(-6 28 40)"><rect x="22" y="8" width="11" height="32" rx="2" fill="currentColor" opacity=".8"/></g><rect x="36" y="8" width="11" height="32" rx="2" fill="currentColor" opacity=".6"/></svg>',
  curve: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M3 40C14 40 16 10 24 10S34 40 45 40"/><path d="M33 40V26c3 6 6 12 12 14z" fill="currentColor" stroke="none"/></svg>',
  star: (on) => `<svg viewBox="0 0 40 38"><path d="M20 2l5.3 11 12 1.6-8.8 8.3 2.2 11.9L20 29.1 9.3 34.8l2.2-11.9L2.7 14.6l12-1.6z" fill="${on ? '#ffd23a' : 'rgba(0,0,0,.28)'}" stroke="${on ? '#b8801a' : 'rgba(255,255,255,.25)'}" stroke-width="2" stroke-linejoin="round"/>${on ? '<path d="M12 15l7-1" stroke="#fff6c2" stroke-width="2" stroke-linecap="round"/>' : ''}</svg>`,
  coinStar: '<svg viewBox="0 0 40 38"><path d="M20 3l5 10.4 11.4 1.5-8.3 7.9 2 11.3L20 28.7l-10.1 5.4 2-11.3-8.3-7.9 11.4-1.5z" fill="currentColor"/></svg>',
  book: '<svg viewBox="0 0 48 48"><rect x="8" y="6" width="30" height="36" rx="3" fill="#8e3b26"/><rect x="8" y="6" width="6" height="36" rx="2" fill="#5f2414"/><rect x="36" y="9" width="5" height="31" rx="1.5" fill="#efe4c8"/><path d="M25 14l7 10-7 10-7-10z" fill="#ffd23a" stroke="#b8801a" stroke-width="1.5"/><path d="M25 18l4 6-4 6-4-6z" fill="#3aa6e0"/></svg>',
  help: '<svg viewBox="0 0 48 48"><path d="M6 30l14-14 8 8-14 14z" fill="#d8c19a"/><path d="M6 30l8 8" stroke="#8b6b45" stroke-width="3" stroke-linecap="round"/><path d="M20 16l8 8" stroke="#8b6b45" stroke-width="3" stroke-linecap="round"/><circle cx="34" cy="14" r="11" fill="#fff"/><path d="M27 23l-3 6 7-3z" fill="#fff"/><text x="34" y="19" text-anchor="middle" font-weight="900" font-size="15" fill="#2a2f2e" font-family="sans-serif">?</text></svg>',
  bell: (on) => `<svg viewBox="0 0 48 48"><path d="M24 7c-8 0-12 6-12 13v8l-4 6h32l-4-6v-8c0-7-4-13-12-13z" fill="${on ? '#ffc93a' : '#7c7f7e'}" stroke="${on ? '#b8801a' : '#4f5251'}" stroke-width="2"/><circle cx="24" cy="38" r="4" fill="${on ? '#e09a1a' : '#5f6261'}"/><path d="M17 15c1-3 3-4 5-4" stroke="#fff6c2" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="${on ? 1 : .3}"/>${on ? '<path d="M38 10c3 2 4 5 4 8M6 18c0-3 1-6 4-8" stroke="#ffc93a" stroke-width="2.5" stroke-linecap="round" fill="none"/>' : '<path d="M8 8l32 32" stroke="#e55" stroke-width="3.5" stroke-linecap="round"/>'}</svg>`,
  next: '<svg viewBox="0 0 24 24"><path d="M3 9h10V4l8 8-8 8v-5H3z" fill="currentColor"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="9.5" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="3" y="9.5" width="5" height="5" rx="1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><rect x="16" y="9.5" width="5" height="5" rx="1"/><rect x="3" y="16" width="5" height="5" rx="1"/><rect x="9.5" y="16" width="5" height="5" rx="1"/><rect x="16" y="16" width="5" height="5" rx="1"/></svg>',
  retry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M19 12a7 7 0 1 1-2.1-5"/><path d="M18 3v5h-5" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  coin: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#d9a92a" stroke="#8a6410" stroke-width="3"/><circle cx="32" cy="32" r="21" fill="none" stroke="#f6d36a" stroke-width="2"/><text x="32" y="41" text-anchor="middle" font-size="24" font-weight="900" fill="#6b4a08" font-family="sans-serif">裏</text></svg>',
  coinF: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#d9a92a" stroke="#8a6410" stroke-width="3"/><circle cx="32" cy="32" r="21" fill="none" stroke="#f6d36a" stroke-width="2"/><text x="32" y="41" text-anchor="middle" font-size="24" font-weight="900" fill="#6b4a08" font-family="sans-serif">表</text></svg>',
  dice: '<svg viewBox="0 0 64 64"><rect x="6" y="6" width="52" height="52" rx="10" fill="#f6f3ec" stroke="#3b3b3b" stroke-width="3"/><g fill="#2a2a2a"><circle cx="20" cy="18" r="5"/><circle cx="20" cy="32" r="5"/><circle cx="20" cy="46" r="5"/><circle cx="44" cy="18" r="5"/><circle cx="44" cy="32" r="5"/><circle cx="44" cy="46" r="5"/></g></svg>',
  dice1: '<svg viewBox="0 0 64 64"><rect x="6" y="6" width="52" height="52" rx="10" fill="#f6f3ec" stroke="#3b3b3b" stroke-width="3"/><circle cx="32" cy="32" r="8" fill="#d23b2f"/></svg>',
  seed: '<svg viewBox="0 0 64 64"><path d="M10 54h44" stroke="#7a5a32" stroke-width="5" stroke-linecap="round"/><path d="M32 52V28" stroke="#3c9a4a" stroke-width="4" stroke-linecap="round"/><path d="M32 34c-14 0-18-12-18-18 10 0 18 6 18 18zM32 30c0-12 8-18 18-18 0 8-6 18-18 18z" fill="#57c062"/></svg>',
  pill: '<svg viewBox="0 0 64 64"><g transform="rotate(-35 32 32)"><rect x="10" y="22" width="44" height="20" rx="10" fill="#f6f3ec" stroke="#3b3b3b" stroke-width="3"/><path d="M32 22h12a10 10 0 0 1 0 20H32z" fill="#e8743a" stroke="#3b3b3b" stroke-width="3"/></g></svg>',
  vote: '<svg viewBox="0 0 64 64"><rect x="10" y="30" width="44" height="26" rx="4" fill="#3a8fd9" stroke="#1d4f7a" stroke-width="3"/><rect x="20" y="30" width="24" height="4" fill="#1d4f7a"/><path d="M22 8h20v24H22z" fill="#fff" stroke="#3b3b3b" stroke-width="3"/><path d="M27 20l4 4 7-9" stroke="#d23b2f" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>',
  gear: '<svg viewBox="0 0 64 64"><g fill="#9aa5a2" stroke="#3b4442" stroke-width="3"><path d="M28 6h8l2 8 7 3 7-4 6 6-4 7 3 7 8 2v8l-8 2-3 7 4 7-6 6-7-4-7 3-2 8h-8l-2-8-7-3-7 4-6-6 4-7-3-7-8-2v-8l8-2 3-7-4-7 6-6 7 4 7-3z" transform="scale(.82) translate(7 7)"/></g><circle cx="32" cy="32" r="8" fill="#2a302f"/></svg>',
  milk: '<svg viewBox="0 0 64 64"><path d="M20 20l6-12h12l6 12v38H20z" fill="#f6f3ec" stroke="#3b3b3b" stroke-width="3" stroke-linejoin="round"/><path d="M20 30h24v16H20z" fill="#3a8fd9"/><text x="32" y="43" text-anchor="middle" font-size="9" font-weight="900" fill="#fff" font-family="sans-serif">MILK</text></svg>',
  ruler: '<svg viewBox="0 0 64 64"><rect x="24" y="4" width="16" height="56" rx="2" fill="#f2c94c" stroke="#8a6410" stroke-width="3"/><g stroke="#8a6410" stroke-width="2.5"><path d="M24 12h7M24 20h10M24 28h7M24 36h10M24 44h7M24 52h10"/></g></svg>',
  unit: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6"><circle cx="24" cy="24" r="17"/><path d="M3 24h42M24 3v42" stroke-width="1.6" opacity=".6"/><path d="M24 24L36 12" /><path d="M36 12V24" stroke-dasharray="3 3"/><circle cx="36" cy="12" r="3.5" fill="currentColor"/></svg>',
  seqi: '<svg viewBox="0 0 48 48"><g fill="currentColor"><rect x="3" y="18" width="9" height="12" rx="2"/><rect x="14" y="18" width="9" height="12" rx="2"/><rect x="25" y="18" width="9" height="12" rx="2"/><rect x="36" y="18" width="9" height="12" rx="2" opacity=".45"/></g>' + T(8, 42, 9, 'a₁', 'font-family="sans-serif"') + T(40, 42, 9, 'aₙ', 'font-family="sans-serif"') + '</svg>',
  curveN: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M3 40C14 40 16 10 24 10S34 40 45 40"/><path d="M24 40V10" stroke-dasharray="3 3" stroke-width="1.6"/><path d="M24 40V12c4 0 6 10 8 20v8z" fill="currentColor" stroke="none" opacity=".6"/></svg>',
  formula: '<svg viewBox="0 0 48 48"><rect x="8" y="5" width="32" height="38" rx="3" fill="#f6f3ec" stroke="#3b3b3b" stroke-width="2.5"/><rect x="8" y="5" width="32" height="9" rx="3" fill="#1f9d48"/><text x="24" y="31" text-anchor="middle" font-family="Times New Roman,serif" font-weight="700" font-size="15" fill="#1d2422">Σ π</text><path d="M14 37h20" stroke="#9aa5a2" stroke-width="2"/></svg>',
  bag: '<svg viewBox="0 0 64 64"><path d="M16 14h32l6 42H10z" fill="#e8743a" stroke="#8c3d16" stroke-width="3" stroke-linejoin="round"/><path d="M16 14l4-6h24l4 6" fill="#f2a066" stroke="#8c3d16" stroke-width="3" stroke-linejoin="round"/><text x="32" y="42" text-anchor="middle" font-size="13" font-weight="900" fill="#fff" font-family="sans-serif">350g</text></svg>',
};

/* ---------- 図解（技カード用 SVG） ---------- */
const C = { ink: '#1d2422', blue: '#2f7fd0', org: '#e8892e', grn: '#1f9d48', red: '#d23b2f', mute: '#7b8784' };
const tx = (x, y, s, t, fill = C.ink, extra = '') => `<text x="${x}" y="${y}" font-size="${s}" fill="${fill}" text-anchor="middle" font-family="Zen Kaku Gothic New,Hiragino Sans,sans-serif" font-weight="700" ${extra}>${t}</text>`;
const arrowDef = `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${C.blue}"/></marker><marker id="ao" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${C.org}"/></marker></defs>`;
function diagram(key) {
  let g = '';
  if (key === 'dainyu') {
    const v = [4, 7, 10, 13, 16];
    v.forEach((n, i) => { const x = 40 + i * 60; g += `<rect x="${x - 22}" y="62" width="44" height="36" rx="6" fill="#fff" stroke="${C.ink}" stroke-width="2.2"/>` + tx(x, 86, 16, n) + tx(x, 114, 12, `n=${i + 1}`, C.mute); });
    g += `<rect x="256" y="60" width="48" height="40" rx="6" fill="none" stroke="${C.org}" stroke-width="3"/>` + tx(160, 22, 14, 'aₙ ＝ 3n＋1 の n に番号を入れる', C.ink) + tx(160, 44, 13, 'n＝5 → 3×5＋1 ＝ 16（第5項）', C.org) + tx(160, 134, 12, '一般項は「何番目でも計算できる公式」', C.grn);
  } else if (key === 'toosa') {
    const xs = [40, 100, 160, 220, 280], v = [3, 7, 11, 15, 19];
    xs.forEach((x, i) => { g += `<circle cx="${x}" cy="88" r="17" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/>` + tx(x, 95, 17, v[i]) + tx(x, 124, 12, `第${i + 1}項`, C.mute); if (i) g += `<path d="M${xs[i - 1] + 12} 70 Q${x - 30} 40 ${x - 12} 70" fill="none" stroke="${C.blue}" stroke-width="2.5" marker-end="url(#ah)"/>` + tx(x - 30, 44, 14, '+4', C.blue); });
    g += tx(160, 18, 14, '第5項 = 3 に +4 を 4回（5−1回）足す', C.ink);
  } else if (key === 'gauss') {
    for (let k = 1; k <= 5; k++) { const x = 24 + (k - 1) * 30; g += `<rect x="${x}" y="${132 - k * 18}" width="26" height="${k * 18}" fill="${C.blue}" rx="2"/><rect x="${x}" y="${132 - 6 * 18}" width="26" height="${(6 - k) * 18}" fill="${C.org}" rx="2"/>` + tx(x + 13, 128, 12, k, '#fff') + tx(x + 13, 132 - 6 * 18 + 14, 12, 6 - k, '#fff'); }
    g += tx(250, 40, 13, '青 1＋2＋3＋4＋5', C.blue) + tx(250, 62, 13, '橙 5＋4＋3＋2＋1', C.org) + tx(250, 92, 13, '合わせると長方形') + tx(250, 112, 13, '(1＋5)×5 ＝ 30') + tx(250, 132, 13, '半分にして 15', C.grn);
  } else if (key === 'toohi') {
    const s = [10, 20, 40, 80], v = [3, 6, 12, 24]; let x = 14;
    s.forEach((w, i) => { g += `<rect x="${x}" y="${120 - w}" width="${w}" height="${w}" fill="${i % 2 ? C.org : C.blue}" rx="2"/>` + tx(x + w / 2, 136, 12, v[i]); if (i < 3) g += tx(x + w + 14, 120 - w / 2, 13, '×2', C.grn); x += w + 28; });
    g += tx(160, 18, 14, '第4項 = 3 に ×2 を 3回（4−1回）掛ける');
  } else if (key === 'geo') {
    const cx = [80, 130, 180, 230, 280];
    g += tx(36, 52, 16, 'S＝') + tx(36, 90, 16, '2S＝');
    [3, 6, 12, 24].forEach((v, i) => { g += tx(cx[i], 52, 16, (i ? '＋' : '') + v); });
    [6, 12, 24, 48].forEach((v, i) => { g += tx(cx[i + 1], 90, 16, (i ? '＋' : '') + v); });
    [1, 2, 3].forEach(i => { g += `<path d="M${cx[i] - 16} 58 L${cx[i] + 16} 38 M${cx[i] - 16} 96 L${cx[i] + 16} 76" stroke="${C.red}" stroke-width="2.5"/>`; });
    g += tx(160, 18, 13, '2倍した式から元の式を引くと、真ん中が消える', C.mute) + tx(160, 128, 15, '2S − S ＝ 48 − 3　→　S ＝ 3×(2⁴−1)', C.grn);
  } else if (key === 'sk') {
    for (let r = 1; r <= 4; r++) for (let c = 0; c < 5; c++) g += `<circle cx="${28 + c * 20}" cy="${22 + (r - 1) * 26}" r="8" fill="${c < r ? C.blue : C.org}"/>`;
    g += tx(220, 34, 13, '青：1＋2＋3＋4', C.blue) + tx(220, 56, 13, '橙：4＋3＋2＋1', C.org) + tx(220, 86, 13, '2つで 4×5 の長方形') + tx(220, 112, 14, '→ Σk ＝ n×(n＋1)÷2', C.grn);
  } else if (key === 'sk2') {
    let x = 14; [1, 2, 3, 4].forEach(k => { const u = 12; for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) g += `<rect x="${x + a * u}" y="${108 - (b + 1) * u}" width="${u - 1}" height="${u - 1}" fill="${[C.blue, C.org, C.grn, C.red][k - 1]}"/>`; g += tx(x + k * u / 2, 128, 13, `${k}²＝${k * k}`); x += k * u + 18; });
    g += tx(160, 20, 13, '1＋4＋9＋16 ＝ 30') + tx(160, 40, 13, '公式：4×5×9÷6 ＝ 30', C.grn);
  } else if (key === 'sk3') {
    const u = 18, o = 16; g += `<rect x="${o}" y="${o}" width="${6 * u}" height="${6 * u}" fill="${C.org}"/><rect x="${o}" y="${o}" width="${3 * u}" height="${3 * u}" fill="${C.blue}"/><rect x="${o}" y="${o}" width="${u}" height="${u}" fill="${C.grn}"/>`;
    for (let k = 0; k <= 6; k++) g += `<path d="M${o + k * u} ${o}V${o + 6 * u}M${o} ${o + k * u}H${o + 6 * u}" stroke="#fff" stroke-width="1" opacity=".55"/>`;
    g += tx(220, 36, 13, '1辺が 1＋2＋3 ＝ 6 の正方形') + tx(220, 62, 13, '緑 1 ＝ 1³', C.grn) + tx(220, 82, 13, '青のL字 8 ＝ 2³', C.blue) + tx(220, 102, 13, '橙のL字 27 ＝ 3³', C.org) + tx(220, 128, 13, '(1＋2＋3)² ＝ 1³＋2³＋3³');
  } else if (key === 'split') {
    for (let k = 1; k <= 4; k++) { const x = 16 + (k - 1) * 22; g += `<rect x="${x}" y="${120 - 2 * k * 11}" width="18" height="${2 * k * 11}" fill="${C.blue}"/><rect x="${x}" y="${120 - 2 * k * 11 - 11}" width="18" height="10" fill="${C.org}"/>` + tx(x + 9, 136, 11, `k=${k}`, C.mute); }
    g += `<path d="M112 70H140" stroke="${C.ink}" stroke-width="2.5" marker-end="url(#ah)"/>`;
    for (let k = 1; k <= 4; k++) { const x = 150 + (k - 1) * 22; g += `<rect x="${x}" y="${120 - 2 * k * 11}" width="18" height="${2 * k * 11}" fill="${C.blue}"/>`; g += `<rect x="${250 + (k - 1) * 16}" y="110" width="13" height="10" fill="${C.org}"/>`; }
    g += tx(190, 20, 13, '2×(1＋2＋3＋4)', C.blue) + tx(274, 98, 13, '1×4', C.org) + tx(80, 20, 13, 'Σ(2k＋1)', C.ink);
  } else if (key === 'kaisa') {
    const xs = [36, 98, 160, 222, 284], v = [1, 2, 5, 10, 17], d = [1, 3, 5, 7];
    xs.forEach((x, i) => { g += `<circle cx="${x}" cy="34" r="16" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/>` + tx(x, 40, 15, v[i]); });
    d.forEach((b, i) => { const x = (xs[i] + xs[i + 1]) / 2; g += `<path d="M${xs[i] + 6} 52 L${x} 76 L${xs[i + 1] - 6} 52" fill="none" stroke="${C.org}" stroke-width="2.2"/><rect x="${x - 15}" y="76" width="30" height="24" rx="6" fill="${C.org}"/>` + tx(x, 93, 14, b, '#fff'); });
    g += tx(36, 94, 11, '階差→', C.org) + tx(160, 128, 14, '第5項 ＝ 1 ＋ (1＋3＋5＋7) ＝ 1 ＋ Σ(k=1〜4) bₖ', C.grn);
  } else if (key === 'domino') {
    for (let i = 0; i < 7; i++) { const x = 30 + i * 40, r = i < 3 ? 62 : i === 3 ? 30 : 0; g += `<g transform="rotate(${r} ${x + 14} 118)"><rect x="${x}" y="46" width="14" height="72" rx="3" fill="${i < 4 ? C.blue : '#c9d1cf'}" stroke="${C.ink}" stroke-width="1.5"/></g>` + tx(x + 7, 136, 11, i < 6 ? `n=${i + 1}` : '…', C.mute); }
    g += tx(160, 18, 13, '①最初が倒れる　②どれかが倒れたら次も倒れる', C.ink) + tx(160, 36, 13, '→ ぜんぶ倒れる＝すべての n で成り立つ', C.grn);
  } else if (key === 'std') {
    const zx = (z, o) => o + z * 26, zy = z => 112 - 70 * Math.exp(-z * z / 2);
    let p1 = '', p2 = ''; for (let z = -3; z <= 3.01; z += .1) { p1 += (p1 ? 'L' : 'M') + zx(z, 70).toFixed(1) + ' ' + zy(z).toFixed(1); p2 += (p2 ? 'L' : 'M') + zx(z, 240).toFixed(1) + ' ' + zy(z).toFixed(1); }
    g += `<path d="${p1}" fill="none" stroke="${C.blue}" stroke-width="2.5"/><path d="${p2}" fill="none" stroke="${C.grn}" stroke-width="2.5"/><path d="M8 112H140M178 112H312" stroke="${C.ink}" stroke-width="1.6"/>`;
    g += tx(70, 128, 11, '60（平均）', C.blue) + tx(96, 128, 11, '70', C.blue) + tx(240, 128, 11, '0', C.grn) + tx(266, 128, 11, '1', C.grn) + `<path d="M96 112V40" stroke="${C.red}" stroke-dasharray="4 3"/><path d="M266 112V40" stroke="${C.red}" stroke-dasharray="4 3"/>`;
    g += `<path d="M146 70H172" stroke="${C.ink}" stroke-width="2.5" marker-end="url(#ah)"/>` + tx(159, 60, 11, '標準化') + tx(70, 22, 12, 'X：N(60, 10²)', C.blue) + tx(240, 22, 12, 'Z：N(0, 1)', C.grn) + tx(160, 40, 11, 'Z ＝ (70 − 60) ÷ 10 ＝ 1', C.red);
  } else if (key === 'unit') {
    const R = 54, ox = 90, oy = 72, a = Math.PI / 6, px = ox + R * Math.cos(a), py = oy - R * Math.sin(a);
    g += `<circle cx="${ox}" cy="${oy}" r="${R}" fill="none" stroke="${C.ink}" stroke-width="2"/><path d="M20 ${oy}H160M${ox} 8V136" stroke="${C.mute}" stroke-width="1.4"/><path d="M${ox} ${oy}L${px} ${py}" stroke="${C.ink}" stroke-width="2.5"/><path d="M${px} ${py}V${oy}" stroke="${C.org}" stroke-width="3"/><path d="M${ox} ${oy}H${px}" stroke="${C.blue}" stroke-width="3"/><circle cx="${px}" cy="${py}" r="5" fill="${C.red}"/>`;
    g += tx(px + 12, py - 4, 13, 'P') + tx(ox + 27, oy + 16, 12, 'cos', C.blue) + tx(px + 20, oy - 12, 12, 'sin', C.org) + tx(ox + 22, oy - 6, 11, 'θ');
    g += tx(240, 34, 13, '点 P ＝ (cos θ, sin θ)') + tx(240, 60, 12, 'x 座標 → cos θ', C.blue) + tx(240, 82, 12, 'y 座標 → sin θ', C.org) + tx(240, 104, 12, '傾き y/x → tan θ', C.grn) + tx(240, 128, 12, '半径1 → sin²θ＋cos²θ＝1');
  } else if (key === 'seq') {
    const v = [2, 5, 8, 11, 14];
    v.forEach((n, i) => { const x = 36 + i * 62; g += `<rect x="${x - 22}" y="40" width="44" height="40" rx="6" fill="#fff" stroke="${C.ink}" stroke-width="2.2"/>` + tx(x, 67, 17, n) + tx(x, 100, 13, `a${'₁₂₃₄₅'[i]}`, C.blue); if (i < 4) g += tx(x + 31, 32, 12, '+3', C.org); });
    g += tx(36, 124, 12, '初項', C.grn) + tx(222, 124, 12, '第4項 a₄ ＝ 11', C.grn) + tx(160, 20, 12, '1つ1つの数が「項」。右下の数字が「何番目か」');
  } else if (key === 'curve') {
    let pth = '', area = 'M' + zx(1.4) + ' 120';
    for (let z = -3.4; z <= 3.41; z += 0.1) pth += (pth ? 'L' : 'M') + zx(z).toFixed(1) + ' ' + zy(z).toFixed(1);
    for (let z = 1.4; z <= 3.41; z += 0.1) area += 'L' + zx(z).toFixed(1) + ' ' + zy(z).toFixed(1);
    area += 'L' + zx(3.4) + ' 120Z';
    g += `<path d="${area}" fill="${C.org}" opacity=".85"/><path d="${pth}" fill="none" stroke="${C.ink}" stroke-width="2.5"/><path d="M14 120H306" stroke="${C.ink}" stroke-width="2"/>` + tx(zx(0), 136, 12, '平均') + tx(zx(2.3), 98, 12, 'はしっこ', C.org) + tx(160, 18, 12, 'はしっこの確率が 0.05 より小さい＝めったに起きない', C.ink) + tx(160, 36, 12, '→ 帰無仮説は「おかしい」と否定する', C.red);
    function zx(z) { return 160 + z * 42; } function zy(z) { return 120 - 90 * Math.exp(-z * z / 2); }
  }
  return `<svg class="diag" viewBox="0 0 320 140" role="img" aria-label="図解">${arrowDef}${g}</svg>`;
}

/* ---------- サウンド（CC0フリー素材のみ） ---------- */
const SFX = { tap: .5, untap: .45, tech: .55, whoosh: .55, flip: .45, hammer: .6, crumble: .6, error: .5, clear: .8, title: .7, coin: .7, click: .5, page: .35, open: .5, close: .5, tick: .3, shine: .55, gavel: .8, domino: .7, correct: .55, paper: .45 };
const Audio_ = {
  ctx: null, buf: {}, sfxGain: null, bgmGain: null, bgmEls: {}, cur: null, curName: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext; this.ctx = new AC();
      this.sfxGain = this.ctx.createGain(); this.sfxGain.connect(this.ctx.destination);
      this.bgmGain = this.ctx.createGain(); this.bgmGain.gain.value = 0; this.bgmGain.connect(this.ctx.destination);
      if (this.unrouted) { try { this.ctx.createMediaElementSource(this.unrouted).connect(this.bgmGain); this.unrouted.volume = 1; this.bgmGain.gain.value = this.lvl(1); } catch (e) {} this.unrouted = null; }
    } catch (e) { this.ctx = null; }
    Object.keys(SFX).forEach(n => this.load(n));
  },
  load(n) {
    if (!this.ctx) return;
    fetch('sfx/' + n + '.mp3').then(r => r.arrayBuffer()).then(a => new Promise((res, rej) => this.ctx.decodeAudioData(a, res, rej))).then(b => { this.buf[n] = b; }).catch(() => {});
  },
  play(n, rate = 1) {
    if (!prog.se) return;
    const vol = SFX[n] ?? .5;
    if (this.ctx && this.buf[n]) {
      const s = this.ctx.createBufferSource(); s.buffer = this.buf[n]; s.playbackRate.value = rate;
      const g = this.ctx.createGain(); g.gain.value = vol; s.connect(g); g.connect(this.sfxGain); s.start();
    } else { try { const a = new Audio('sfx/' + n + '.mp3'); a.volume = vol; a.play().catch(() => {}); } catch (e) {} }
  },
  bgmFile(name) {
    if (name === 'title') return 'bgm/title.mp3';
    if (name === 'menu') return 'bgm/menu.mp3';
    return 'bgm/' + (prog.track === 'auto' ? CH_TRACK[STAGES[G.idx].ch] : prog.track) + '.mp3';
  },
  tryAuto() {
    if (!prog.bgm) return;
    try { const a = new Audio('bgm/title.mp3'); a.loop = true; a.volume = .4; a.play().then(() => { this.bgmEls['bgm/title.mp3'] = a; this.cur = a; this.curName = 'bgm/title.mp3'; this.unrouted = a; }).catch(() => {}); } catch (e) {}
  },
  bgm(name, level = 1) {
    const file = name ? this.bgmFile(name) : null;
    if (!prog.bgm || !file) { this.fadeTo(0, .5, () => { if (this.cur) this.cur.pause(); this.cur = null; this.curName = null; }); return; }
    if (this.curName === file) { this.fadeTo(this.lvl(level), .6); return; }
    const old = this.cur;
    const start = () => {
      if (old) old.pause();
      let a = this.bgmEls[file];
      if (!a) {
        a = new Audio(file); a.loop = true; a.preload = 'auto'; this.bgmEls[file] = a;
        if (this.ctx) { try { this.ctx.createMediaElementSource(a).connect(this.bgmGain); } catch (e) {} }
      }
      a.currentTime = 0; a.play().catch(() => {});
      this.cur = a; this.curName = file; this.fadeTo(this.lvl(level), 1.2);
    };
    if (old) this.fadeTo(0, .4, start); else start();
  },
  lvl(l) { return .42 * l; },
  fadeTo(v, sec, done) {
    if (this.ctx && this.bgmGain) {
      const g = this.bgmGain.gain, t = this.ctx.currentTime;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(v, t + sec);
    } else if (this.cur) { this.cur.volume = Math.min(1, v); }
    if (done) setTimeout(done, sec * 1000 + 30);
  },
};

/* ---------- 画面切替 ---------- */
const screens = ['title', 'select', 'play', 'loading'];
function show(id) { screens.forEach(s => { $('#' + s).hidden = s !== id; }); }

/* ---------- タイトル ---------- */
function startTitle() {
  show('title'); Audio_.tryAuto();
  requestAnimationFrame(() => { $('#logo').classList.add('in'); $('#logo').querySelectorAll('span').forEach((s, i) => s.style.animationDelay = (i * 0.08) + 's'); });
}
$('#title').addEventListener('click', e => {
  Audio_.init();
  if ($('#tmenu').hidden) { $('#tmenu').hidden = false; $('#tapstart').hidden = true; Audio_.play('title'); Audio_.bgm('title', 1); return; }
});
$('#tStart').onclick = e => { e.stopPropagation(); Audio_.init(); Audio_.play('click'); openSelect(); };
$('#tHelp').onclick = e => { e.stopPropagation(); Audio_.play('open'); showHelp(); };
$('#tBook').onclick = e => { e.stopPropagation(); Audio_.play('open'); showBook(); };
$('#tFormula').onclick = e => { e.stopPropagation(); Audio_.play('open'); showFormulas(); };
$('#tSet').onclick = e => { e.stopPropagation(); Audio_.play('open'); showSettings(); };

/* ---------- ステージ選択（章ごとのページ） ---------- */
let page = 0;
const firstOfCh = i => i === 0 || STAGES[i - 1].ch !== STAGES[i].ch;
const stageUnlocked = i => prog.unlockAll || firstOfCh(i) || (prog.stars[i - 1] || 0) > 0;
const MODEINFO = { proof: { icon: 'domino', name: '数学的帰納法' }, test: { icon: 'curve', name: '仮説検定' }, normal: { icon: 'curveN', name: '正規分布' }, quiz: { icon: 'seqi', name: '数列の基本' }, trig: { icon: 'unit', name: '三角関数' } };
function layoutSelect() {
  const cols = innerWidth < 560 ? 4 : 6;
  const pages = $('#pages'); pages.innerHTML = '';
  CHAPTERS.forEach((ch, c) => {
    const pg = el('div', 'page');
    const head = el('div', 'chhead', `<span class="chpart">${ch.part}</span><span class="chn">第${c}章</span><span class="chname">${ch.name}</span><span class="chsub">${ch.sub}</span>`);
    const g = el('div', 'grid'); g.style.setProperty('--cols', cols);
    STAGES.forEach((s, i) => {
      if (s.ch !== c) return;
      if (s.tech) g.append(slotEl({ type: 'tech', key: s.tech, at: i }));
      if (s.mode && firstOfCh(i)) g.append(slotEl({ type: 'info', key: s.mode, at: i }));
      g.append(slotEl({ type: 'stage', idx: i }));
    });
    const wrap = el('div', 'pagein'); wrap.append(head, g); pg.append(wrap); pages.append(pg);
  });
  const dots = $('#dots'); dots.innerHTML = '';
  CHAPTERS.forEach((ch, p) => { const d = el('button'); d.setAttribute('aria-label', `第${p}章 ${ch.name}`); d.onclick = () => goPage(p); dots.append(d); });
  goPage(page, true);
}
function slotEl(s) {
  const b = el('button', 'slot'); const lcd = el('span', 'lcd'); b.append(lcd);
  if (s.type === 'tech' || s.type === 'info') {
    const open = stageUnlocked(s.at);
    const ic = s.type === 'tech' ? s.key : MODEINFO[s.key].icon;
    b.classList.add('slot-tech'); if (!open) b.classList.add('locked');
    lcd.innerHTML = open ? ICON[ic] : ICON.lock;
    b.setAttribute('aria-label', open ? (s.type === 'tech' ? '技：' + TECH[s.key].name : MODEINFO[s.key].name + 'の説明') : 'ロック中');
    b.onclick = () => { if (!open) { Audio_.play('error'); return; } Audio_.play('open'); s.type === 'tech' ? showTechCard(s.key) : showModeCard(s.key); };
  } else {
    const open = stageUnlocked(s.idx), st = STAGES[s.idx];
    if (!open) { b.classList.add('locked'); lcd.innerHTML = ICON.lock; b.setAttribute('aria-label', 'ステージ' + label(s.idx) + '（ロック中）'); }
    else {
      lcd.textContent = chIdx[s.idx];
      if (st.mode) b.classList.add('slot-' + st.mode);
      const stars = prog.stars[s.idx] || 0;
      if (stars > 0) { const sv = el('span', 'stars'); sv.innerHTML = [1, 2, 3].map(k => ICON.star(k <= stars)).join(''); b.append(sv); }
      b.setAttribute('aria-label', 'ステージ' + label(s.idx) + '　星' + stars);
    }
    b.onclick = () => { if (!open) { Audio_.play('error'); b.animate([{ transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'none' }], 240); return; } Audio_.play('click'); enterStage(s.idx); };
  }
  return b;
}
function goPage(p, silent) {
  const n = $('#pages').children.length; p = Math.max(0, Math.min(n - 1, p));
  if (p !== page && !silent) Audio_.play('page');
  page = p; $('#pages').style.transform = `translateX(${-100 * p}%)`;
  [...$('#dots').children].forEach((d, i) => d.classList.toggle('on', i === p));
  $('#pgL').disabled = p === 0; $('#pgR').disabled = p === n - 1;
}
$('#pgL').onclick = () => goPage(page - 1); $('#pgR').onclick = () => goPage(page + 1);
(() => { let x0 = null; const pg = $('#pages');
  pg.addEventListener('pointerdown', e => { x0 = e.clientX; });
  pg.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) goPage(page + (dx < 0 ? 1 : -1)); });
})();
function openSelect(toCh) {
  stopTimer(); layoutSelect(); show('select');
  if (toCh != null) goPage(toCh, true);
  Audio_.bgm('menu', .9);
}
$('#btnBook').innerHTML = ICON.book; $('#btnHelp').innerHTML = ICON.help;
const paintBell = () => { $('#btnSound').innerHTML = ICON.bell(prog.bgm || prog.se); };
paintBell();
$('#btnBook').onclick = () => { Audio_.play('open'); showBook(); };
$('#btnFormula').innerHTML = ICON.formula; $('#btnFormula').onclick = () => { Audio_.play('open'); showFormulas(); };
$('#btnHelp').onclick = () => { Audio_.play('open'); showHelp(); };
$('#btnSound').onclick = () => { Audio_.play('open'); showSettings(); };
addEventListener('resize', () => { if (!$('#select').hidden) layoutSelect(); if (!$('#play').hidden) fit(); });

/* ---------- モーダル ---------- */
let modalDone = null;
function openModal(html, onClose) {
  $('#sheet').innerHTML = '<button class="x" aria-label="閉じる">×</button>' + html;
  $('#modal').hidden = false; modalDone = onClose || null;
  $('#sheet .x').onclick = closeModal; $('#sheet').scrollTop = 0;
}
function closeModal() { Audio_.play('close'); $('#modal').hidden = true; const f = modalDone; modalDone = null; if (f) f(); }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
const ringHTML = key => `<span class="ring"><span>${ICON[key]}</span></span>`;
function techDesc(t) {
  const ex = `<div class="ex"><span class="exl">例</span>${t.ex.map((l, i) => `<span class="${i ? 'exs' : ''}">${l}</span>`).join('')}</div>`;
  return `<div class="tdesc"><div><span class="k">使うとき</span><span>${t.when}</span></div><div><span class="k how">こう変わる</span><span>${t.how}</span></div><div><span class="k why">なぜ？</span><span>${t.why}</span></div></div>`
    + `<figure class="fig">${diagram(t.key)}</figure>` + ex
    + (t.use ? `<div class="use"><span class="k use">ゲームでの使い方</span><ol>${t.use.map(u => `<li>${u}</li>`).join('')}</ol></div>` : '');
}
const techOpen = k => stageUnlocked(introAt[k]);
function showBook() {
  const cards = TECH_ORDER.map(k => {
    const t = TECH[k], open = techOpen(k);
    return `<div class="tcard ${open ? '' : 'lockd'}">${open ? ringHTML(k) : ringHTML('lock')}<h4>${open ? t.name : '??????'}</h4>${open ? `<div class="fm">${t.formula}</div>${techDesc(t)}` : `<p>ステージ${label(introAt[k])}で覚える技</p>`}</div>`;
  }).join('');
  openModal(`<h2>技の書</h2><div class="techgrid">${cards}</div>`);
}
function showTechCard(key, onStart) {
  const t = TECH[key];
  openModal(`<h2>${onStart ? '新しい技！　' : ''}${t.name}</h2><div class="newtech">${ringHTML(key)}<div><div class="fm">${t.formula}</div>${techDesc(t)}</div></div>${onStart ? '<button class="okbtn" id="okStart">この技で挑戦する</button>' : ''}`, onStart);
  if (onStart) $('#okStart').onclick = closeModal;
}
const MODECARD = {
  quiz: { title: '数列ってなに？', fm: '数を1列に並べたもの。n番目の数を aₙ（第n項）と書く',
    rows: [['項', '並んでいる1つ1つの数。最初の項を「初項」a₁ という。'], ['第n項', 'n 番目の項 aₙ。n が番号、aₙ がその値。'], ['一般項', 'aₙ を n の式で表したもの（例：aₙ ＝ 3n − 1）。n に番号を入れると、その項が出る。']],
    fig: 'seq', btn: 'はじめる' },
  normal: { title: '正規分布と標準化', fm: 'Z ＝ (X − m) ÷ σ　→　Z は N(0, 1) に従う',
    rows: [['正規分布', 'N(m, σ²) は、平均 m を中心にした左右対称の山。m が真ん中、σ が山の広がり。'], ['標準化', 'X から平均 m を引いて σ で割ると Z になる。どんな正規分布も N(0, 1)（標準正規分布）にそろう。'], ['正規分布表', 'p(z) ＝「0 から z まで」の面積。右半分ぜんぶは 0.5。はしっこは 0.5 − p(z)。']],
    fig: 'std', btn: '標準化してみる' },
  trig: { title: '三角関数（数Ⅱ）', fm: '単位円の点 P ＝ (cos θ, sin θ)',
    rows: [['弧度法', '180° ＝ π ラジアン。度 × π/180 でラジアンになる。'], ['定義', '半径1の円で、角 θ の点 P の x 座標が cos θ、y 座標が sin θ。tan θ ＝ sin θ ÷ cos θ。'], ['使い方', 'sin・cos の値は、図の P の高さと横の長さを見ればわかる。左なら cos がマイナス、下なら sin がマイナス。']],
    fig: 'unit', btn: '単位円で考える' },
  proof: { title: '数学的帰納法ってなに？', fm: '①n=1 で成り立つ　②n=k で成り立つなら n=k+1 でも成り立つ',
    rows: [['使うとき', '「すべての自然数 n について ◯◯ が成り立つ」ことを証明したいとき。'], ['やること', '①まず n=1 で確かめる。②次に「n=k で成り立つ」と仮定して、そこから n=k+1 でも成り立つことを式変形で示す。'], ['なぜ？', '①で1枚目のドミノが倒れ、②で「倒れたら次も倒れる」が保証される。だから全部のドミノ（すべての n）が倒れる。']],
    fig: 'domino', btn: 'ドミノを倒しにいく' },
  test: { title: '仮説検定の流れ', fm: '仮説を立てる → 確率を出す → 0.05 とくらべる → 判定',
    rows: [['① 仮説', '言いたいこと（例：裏が出やすい）の反対を「帰無仮説」にする（例：裏が出る確率は 1/2）。'], ['② 分布', 'X は二項分布 B(n, p)。回数が多いので正規分布 N(np, np(1−p)) と考えてよい。平均 m と標準偏差 σ を計算。'], ['③ 確率', '標準化（Z にする）はゲームが自動でやる！ 正規分布表で値を探して、はしっこの確率 0.5 − (表の値) を出す。'], ['④ 判定', '0.05 より小さい → めったに起きない → 帰無仮説は否定される（言いたいことが言える）。0.05 より大きい → 否定されない（言えない）。']],
    fig: 'curve', btn: '検定をはじめる' },
};
function showModeCard(mode, onStart) {
  const m = MODECARD[mode] || MODECARD.quiz;
  openModal(`<h2>${m.title}</h2><div class="newtech">${ringHTML(MODEINFO[mode].icon)}<div><div class="fm">${m.fm}</div><div class="tdesc">${m.rows.map((r, i) => `<div><span class="k ${['', 'how', 'why', 'how'][i] || ''}">${r[0]}</span><span>${r[1]}</span></div>`).join('')}</div><figure class="fig">${diagram(m.fig)}</figure></div></div>${onStart ? `<button class="okbtn" id="okStart">${m.btn}</button>` : ''}`, onStart);
  if (onStart) $('#okStart').onclick = closeModal;
}
/* ---------- 公式集 ---------- */
const FR = (a, b) => `<span class="fr"><span>${a}</span><span>${b}</span></span>`;
const FORMULAS = {
  '数列': [
    ['数列の基本', [['第n項', 'aₙ（n 番目の項）　初項 a₁'], ['和', 'Sₙ ＝ a₁ ＋ a₂ ＋ … ＋ aₙ'], ['和と一般項', `aₙ ＝ Sₙ − Sₙ₋₁（n ≧ 2）、a₁ ＝ S₁`]]],
    ['等差数列（初項 a、公差 d）', [['一般項', 'aₙ ＝ a ＋ (n − 1)d'], ['和', `Sₙ ＝ ${FR('n(a ＋ l)', '2')} ＝ ${FR('n{2a ＋ (n − 1)d}', '2')}　（l は末項）`]]],
    ['等比数列（初項 a、公比 r）', [['一般項', 'aₙ ＝ a·rⁿ⁻¹'], ['和', `Sₙ ＝ ${FR('a(rⁿ − 1)', 'r − 1')}（r ≠ 1）、r ＝ 1 なら Sₙ ＝ na`]]],
    ['Σの公式', [['定数', 'Σ c ＝ cn'], ['k', `Σ k ＝ ${FR('n(n ＋ 1)', '2')}`], ['k²', `Σ k² ＝ ${FR('n(n ＋ 1)(2n ＋ 1)', '6')}`], ['k³', `Σ k³ ＝ {${FR('n(n ＋ 1)', '2')}}²`], ['等比', `Σ arᵏ⁻¹ ＝ ${FR('a(rⁿ − 1)', 'r − 1')}`], ['性質', 'Σ(aₖ ＋ bₖ) ＝ Σaₖ ＋ Σbₖ、Σ c·aₖ ＝ c Σaₖ']]],
    ['階差数列', [['一般項', 'bₙ ＝ aₙ₊₁ − aₙ のとき、n ≧ 2 で aₙ ＝ a₁ ＋ Σ(k=1〜n−1) bₖ'], ['注意', 'n ＝ 1 のときも成り立つか必ず確かめる']]],
    ['数学的帰納法', [['[1]', 'n ＝ 1 のとき成り立つことを示す'], ['[2]', 'n ＝ k のとき成り立つと仮定して、n ＝ k ＋ 1 のときも成り立つことを示す'], ['結論', '[1][2] より、すべての自然数 n で成り立つ']]],
  ],
  '統計': [
    ['確率変数', [['平均（期待値）', 'E(X) ＝ m'], ['分散', 'V(X) ＝ σ²'], ['標準偏差', 'σ(X) ＝ √V(X)']]],
    ['二項分布 B(n, p)', [['平均', 'E(X) ＝ np'], ['分散', 'V(X) ＝ np(1 − p)'], ['近似', 'n が大きいとき、正規分布 N(np, np(1 − p)) で近似できる']]],
    ['正規分布', [['表し方', 'N(m, σ²)：平均 m、標準偏差 σ'], ['標準化', `Z ＝ ${FR('X − m', 'σ')} は N(0, 1)（標準正規分布）に従う`], ['標本平均', `標本の大きさ n の標本平均 X̄ は N(m, ${FR('σ²', 'n')})、標準偏差は ${FR('σ', '√n')}`]]],
    ['正規分布表の使い方（p(z) ＝ P(0 ≦ Z ≦ z)）', [['右はし', 'P(Z ≧ z) ＝ 0.5 − p(z)'], ['左がわ全部', 'P(Z ≦ z) ＝ 0.5 ＋ p(z)'], ['0 をまたぐ', 'P(−a ≦ Z ≦ b) ＝ p(a) ＋ p(b)'], ['同じがわ', 'P(a ≦ Z ≦ b) ＝ p(b) − p(a)'], ['よく使う値', 'p(1) ＝ 0.3413、p(1.96) ＝ 0.4750、p(2) ＝ 0.4772、p(2.58) ＝ 0.4951']]],
    ['仮説検定の手順', [['①', '言いたいことの反対を「帰無仮説」にする'], ['②', '帰無仮説のもとで分布を決める（B(n, p) → N(np, np(1 − p))）'], ['③', '標準化して Z を出し、正規分布表で確率を求める'], ['④', '確率が有意水準（0.05）より小さい → 帰無仮説は否定される（言いたいことが言える）'], ['⑤', '0.05 より大きい → 否定されない（言いたいことは言えない）']]],
  ],
  '三角関数': [
    ['弧度法', [['基本', '180° ＝ π ラジアン、1° ＝ π/180'], ['扇形', '弧の長さ l ＝ rθ、面積 S ＝ ½r²θ ＝ ½rl']]],
    ['定義（単位円）', [['点 P', 'P(cos θ, sin θ)'], ['tan', 'tan θ ＝ sin θ / cos θ（直線 OP の傾き）']]],
    ['相互関係', [['基本', 'sin²θ ＋ cos²θ ＝ 1'], ['tan', `1 ＋ tan²θ ＝ ${FR('1', 'cos²θ')}`]]],
    ['いろいろな角', [['−θ', 'sin(−θ) ＝ −sin θ、cos(−θ) ＝ cos θ'], ['π − θ', 'sin(π − θ) ＝ sin θ、cos(π − θ) ＝ −cos θ'], ['θ ＋ π/2', 'sin(θ ＋ π/2) ＝ cos θ、cos(θ ＋ π/2) ＝ −sin θ'], ['周期', 'sin・cos は 2π、tan は π でくり返す']]],
    ['加法定理', [['sin', 'sin(α ± β) ＝ sin α cos β ± cos α sin β'], ['cos', 'cos(α ± β) ＝ cos α cos β ∓ sin α sin β'], ['tan', `tan(α ± β) ＝ ${FR('tan α ± tan β', '1 ∓ tan α tan β')}`]]],
    ['2倍角の公式', [['sin', 'sin 2α ＝ 2 sin α cos α'], ['cos', 'cos 2α ＝ cos²α − sin²α ＝ 1 − 2sin²α ＝ 2cos²α − 1'], ['tan', `tan 2α ＝ ${FR('2 tan α', '1 − tan²α')}`]]],
    ['半角の公式', [['sin', `sin²${FR('α', '2')} ＝ ${FR('1 − cos α', '2')}`], ['cos', `cos²${FR('α', '2')} ＝ ${FR('1 ＋ cos α', '2')}`]]],
    ['三角関数の合成', [['公式', 'a sin θ ＋ b cos θ ＝ r sin(θ ＋ α)'], ['r と α', `r ＝ √(a² ＋ b²)、cos α ＝ ${FR('a', 'r')}、sin α ＝ ${FR('b', 'r')}`]]],
  ],
};
function trigTable() {
  const rows = [['0', '0', '1', '0'], ['π/6', '1/2', '√3/2', '1/√3'], ['π/4', '√2/2', '√2/2', '1'], ['π/3', '√3/2', '1/2', '√3'], ['π/2', '1', '0', 'なし'], ['2π/3', '√3/2', '−1/2', '−√3'], ['3π/4', '√2/2', '−√2/2', '−1'], ['5π/6', '1/2', '−√3/2', '−1/√3'], ['π', '0', '−1', '0']];
  return `<div class="ftw"><table class="ftab"><thead><tr><th>θ</th>${rows.map(r => `<th>${r[0]}</th>`).join('')}</tr></thead><tbody>${['sin θ', 'cos θ', 'tan θ'].map((n, k) => `<tr><th>${n}</th>${rows.map(r => `<td>${r[k + 1]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function fullNT() {
  let h = '<div class="ftw"><table class="ztable full"><thead><tr><th>z</th>' + [...Array(10)].map((_, c) => `<th>.0${c}</th>`).join('') + '</tr></thead><tbody>';
  for (let r = 0; r <= 30; r++) h += `<tr><th>${(r / 10).toFixed(1)}</th>` + [...Array(10)].map((_, c) => { const i = r * 10 + c; return i <= 309 ? `<td>${NT[i].toFixed(4)}</td>` : '<td></td>'; }).join('') + '</tr>';
  return h + '</tbody></table></div>';
}
function showFormulas(tab = '数列') {
  const tabs = [...Object.keys(FORMULAS), '正規分布表'];
  let body = '';
  if (tab === '正規分布表') body = `<p class="small">p(z) ＝ P(0 ≦ Z ≦ z)：0 から z までの面積。縦が z の小数第1位まで、横が小数第2位。</p><figure class="fig">${diagram('curve')}</figure>` + fullNT();
  else {
    body = FORMULAS[tab].map(([h, rows]) => `<section class="fsec"><h3>${h}</h3><dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></section>`).join('');
    if (tab === '三角関数') body = `<figure class="fig">${diagram('unit')}</figure>` + body + `<section class="fsec"><h3>主な角の値</h3>${trigTable()}</section>`;
    if (tab === '統計') body = `<figure class="fig">${diagram('std')}</figure>` + body;
    if (tab === '数列') body = `<figure class="fig">${diagram('seq')}</figure>` + body;
  }
  openModal(`<h2>公式集</h2><div class="ftabs" role="tablist">${tabs.map(t => `<button role="tab" aria-selected="${t === tab}" data-t="${t}">${t}</button>`).join('')}</div><div class="fbody">${body}</div>`);
  document.querySelectorAll('.ftabs button').forEach(b => b.onclick = () => { Audio_.play('page'); showFormulas(b.dataset.t); });
}
function showHelp() {
  openModal(`<h2>遊び方</h2><div class="help"><ol>
  <li><b>計算ステージ（第0〜4章）：</b>タイルをタップして選ぶ。となりのタイルをタップすると選択範囲がのびる。</li>
  <li><b>下の「技」ボタン</b>で、選んだ部分を公式の形に変形する。タイルを選ばずに技ボタンを押すと、その技の説明（図つき）が開く。</li>
  <li><b>右のハンマー</b>で、となり合う2つのタイルを計算する（1回に1つの計算）。×÷は＋−より先！</li>
  <li>式が<b>1つの数</b>になったらクリア。★1 クリア　★2 制限時間内　★3 最短手数以内。</li>
  <li><b>数列の基本（第0章）：</b>項・初項・一般項を学んで、ダイニュウで n に番号を入れる。</li>
  <li><b>数学的帰納法（第5章）：</b>正しい式のタイルを選んで証明を組み立てる。正しく進むとドミノが倒れていく。</li>
  <li><b>正規分布（第6章）・仮説検定（第7章）：</b>標準化 Z ＝ (X − m) ÷ σ はタイルで自分で計算。正規分布表は表のマスをタップ。検定の最後はハンマーで判定！ ★3 はノーミス。</li>
  <li><b>三角関数（第8・9章・数Ⅱ）：</b>単位円の図を見ながら sin・cos の値や公式を選ぶ。</li>
  <li><b>公式集：</b>右上の公式集ボタン（ポーズ中も開ける）に、全部の公式と正規分布表がある。</li>
  <li><b>💡ガイド：</b>上の「ガイド」ボタンで、次にやることが光って解説が出る。新しい技を覚えるステージでは、最初は自動でガイドが付く。</li>
  <li>キーボード：1〜9 で技、Enter／スペースでハンマー、Esc でポーズ。</li>
</ol></div>`);
}
function showSettings() {
  const tg = (id, on, lb) => `<div class="setrow"><span>${lb}</span><button class="toggle" id="${id}" aria-pressed="${on}" aria-label="${lb}"></button></div>`;
  openModal(`<h2>サウンドと設定</h2>
  ${tg('sBgm', prog.bgm, 'BGM')}${tg('sSe', prog.se, '効果音')}
  <div class="setrow"><label for="sTrack">プレイ中のBGM</label><select id="sTrack" class="selbox"><option value="auto">章ごとに変える（おすすめ）</option>${TRACKS.map((t, i) => `<option value="${t.f}">曲${i + 1}：${t.name}</option>`).join('')}</select></div>
  ${tg('sAll', prog.unlockAll, 'すべてのステージを開放（授業・復習用）')}
  <div class="setrow"><span>記録をリセット</span><button class="dangerbtn" id="sReset">リセット</button></div>
  <h2 style="margin-top:22px;font-size:20px">素材クレジット</h2>
  <p class="small">音はすべて人が制作したCC0（パブリックドメイン）のフリー素材です。GitHubの <a href="https://github.com/lavenderdotpet/CC0-Public-Domain-Sounds" target="_blank" rel="noopener">CC0-Public-Domain-Sounds</a> コレクションから選びました。</p>
  <ul class="credits">
    <li>BGM：fvi「Meditating Beat」「Favorite」「3am West End」「Beat One」「Arpent」「Hippety Hop」（Warfork CC0 アセット／Team Forbidden）</li>
    <li>BGM：Maximiliano Stradex「Theme 1」「Ambient 2」</li>
    <li>効果音：Kenney「Interface Sounds」「Impact Sounds」「Casino Audio」「Music Jingles」（<a href="https://kenney.nl" target="_blank" rel="noopener">kenney.nl</a>）</li>
    <li>効果音：Ben Burnes「Micro Pack – Organic Wooshes」、「75 CC0 breaking / falling / hit sfx」</li>
  </ul>`);
  const bind = (id, k, after) => { $('#' + id).onclick = e => { prog[k] = !prog[k]; e.currentTarget.setAttribute('aria-pressed', prog[k]); save(); paintBell(); after && after(); Audio_.play('click'); }; };
  bind('sBgm', 'bgm', () => Audio_.bgm(!$('#play').hidden ? 'play' : !$('#title').hidden ? 'title' : 'menu', .9));
  bind('sSe', 'se');
  bind('sAll', 'unlockAll', () => layoutSelect());
  $('#sTrack').value = prog.track;
  $('#sTrack').onchange = e => { prog.track = e.target.value; save(); Audio_.play('click'); if (!$('#play').hidden) Audio_.bgm('play', .8); };
  $('#sReset').onclick = e => {
    const b = e.currentTarget;
    if (b.dataset.armed) { prog.stars = {}; prog.seen = {}; save(); layoutSelect(); b.textContent = 'リセットしました'; b.disabled = true; Audio_.play('close'); }
    else { b.dataset.armed = 1; b.textContent = 'もう一度押すと消えます'; Audio_.play('error'); }
  };
}

/* ---------- ローディング（記号モーフ） ---------- */
const SHAPES = {
  plus: [[0, 0, 0, 1, 1], [0, 0, 90, 1, 1], [0, -26, 0, 0, 0], [0, 26, 0, 0, 0]],
  minus: [[0, 0, 0, 1, 1], [0, 0, 0, 1, 0], [0, -26, 0, 0, 0], [0, 26, 0, 0, 0]],
  times: [[0, 0, 45, 1, 1], [0, 0, -45, 1, 1], [0, -26, 0, 0, 0], [0, 26, 0, 0, 0]],
  equal: [[0, -16, 0, 1, 1], [0, 16, 0, 1, 1], [0, -26, 0, 0, 0], [0, 26, 0, 0, 0]],
  divide: [[0, 0, 0, 1, 1], [0, 0, 0, .2, 0], [0, -28, 0, 1, 1], [0, 28, 0, 1, 1]],
};
function setShape(name) { const parts = $('#morph').children; SHAPES[name].forEach(([x, y, r, s, o], k) => { parts[k].style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`; parts[k].style.opacity = o; }); }
async function loading(ms = 1300) {
  $('#loading').hidden = false;
  const seq = ['plus', 'minus', 'times', 'divide', 'equal']; let k = Math.floor(Math.random() * 5), d = 1;
  setShape(seq[k]);
  const iv = setInterval(() => { k = (k + 1) % seq.length; setShape(seq[k]); d = d % 3 + 1; $('#loadtxt').textContent = 'Loading' + '.'.repeat(d); Audio_.play('tick'); }, 330);
  await wait(ms); clearInterval(iv); $('#loading').hidden = true;
}

/* ---------- 共通：表示 ---------- */
const G = { idx: 0, mode: 'calc', root: null, sel: null, moves: 0, misses: 0, hist: [], log: [], t0: 0, acc: 0, tid: null, busy: false, paused: false, done: false, step: 0, steps: [], choice: null };
const OPS = { '+': '+', '-': '−', '*': '×', '/': '÷' };
const opS = op => op ? OPS[op] : '';
function termDec(d) { let k = 0, x = d; while (x % 2 === 0) { x /= 2; k++; } let m = 0; while (x % 5 === 0) { x /= 5; m++; } return x === 1 ? Math.max(k, m) : -1; }
function fracHTML(v, dec) {
  const neg = v.n < 0, n = Math.abs(v.n);
  if (v.d === 1) return (neg ? '−' : '') + n;
  if (dec) { const k = termDec(v.d); if (k >= 0) return (neg ? '−' : '') + (n / v.d).toFixed(k); }
  return (neg ? '−' : '') + `<span class="frac"><span>${n}</span><span>${v.d}</span></span>`;
}
function polyHTML(c) {
  const terms = [];
  for (let p = 3; p >= 0; p--) {
    const a = c[p]; if (!a) continue;
    const sign = a < 0 ? '−' : (terms.length ? '+' : '');
    const A = Math.abs(a), coef = p === 0 ? A : (A === 1 ? '' : A);
    terms.push(sign + coef + (p === 0 ? '' : '<i>k</i>' + (p > 1 ? `<sup>${p}</sup>` : '')));
  }
  const s = terms.join('');
  return terms.length > 1 || c[0] ? '(' + s + ')' : s;
}
function genHTML(f) {
  if (f.kind === 'geo') return (f.a === 1 ? '' : f.a + '·') + f.r + '<sup>n−1</sup>';
  return polyHTML(f.c).replace(/^\((.*)\)$/, '$1').replace(/<i>k<\/i>/g, '<i>n</i>');
}
function sigBody(f) {
  if (f.kind === 'poly') return polyHTML(f.c);
  if (f.kind === 'geo') return (f.a === 1 ? '' : f.a + '·') + f.r + '<sup><i>k</i>−1</sup>';
  return '<span class="frac"><span>1</span><span><i>k</i>(<i>k</i>+1)</span></span>';
}
const neg = x => x < 0 ? '−' + (-x) : '' + x;
function tileHTML(tk) {
  if (tk.t === 'num') { const v = tk.v, wrap = (tk.op === '*' || tk.op === '/') && v.n < 0; return `<span class="op">${opS(tk.op)}</span>${wrap ? '(' + fracHTML(v, tk.dec) + ')' : fracHTML(v, tk.dec)}`; }
  if (tk.t === 'pow') return `<span class="op">${opS(tk.op)}</span>${tk.base}<sup>${tk.exp}</sup>`;
  if (tk.t === 'sig') return `<span class="op">${opS(tk.op)}</span><span class="sig"><span class="lim">${tk.to}</span><span class="s">Σ</span><span class="lim"><i>k</i>=${tk.from}</span></span><span class="sig-body">${sigBody(tk.f)}</span>`;
  if (tk.t === 'gen') return `<span class="op">${opS(tk.op)}</span><span class="sq"><span class="sq-terms">a<sub>n</sub> = ${genHTML(tk.f)}</span><span class="sq-main">の第${tk.n}項</span></span>`;
  if (tk.t === 'seq') return `<span class="op">${opS(tk.op)}</span><span class="sq"><span class="sq-terms">${tk.terms.map(neg).join(', ')}, …</span><span class="sq-main">${tk.sum ? `第1〜${tk.n}項の和` : `の第${tk.n}項`}</span></span>`;
  return '';
}
function build(items, path) {
  const frag = document.createDocumentFragment();
  items.forEach((tk, i) => {
    if (tk.t === 'grp') {
      const g = el('span', 'grp'); g.dataset.id = tk.id;
      g.append(el('span', 'paren', opS(tk.op) + '('));
      g.append(build(tk.items, path.concat(i)));
      g.append(el('span', 'paren', ')' + (tk.exp ? `<sup>${tk.exp}</sup>` : '')));
      frag.append(g);
    } else {
      const b = el('button', 'tile' + (tk.t === 'sig' ? ' sigt' : '') + (tk.t === 'seq' ? ' seqt' : ''), tileHTML(tk));
      b.dataset.path = path.join('.'); b.dataset.i = i; b.dataset.id = tk.id;
      frag.append(b);
    }
  });
  return frag;
}
function render(newIds, anim) {
  const ex = $('#expr'); ex.innerHTML = ''; ex.append(build(G.root, []));
  paintSel(); fit();
  if (newIds && !reduced) { let k = 0; newIds.forEach(id => { const t = ex.querySelector(`.tile[data-id="${id}"]`); if (t) { t.classList.add(anim); t.style.animationDelay = (anim === 'dropin' ? k++ * 0.035 : 0) + 's'; } }); }
}
function fit() {
  const ex = $('#expr'), host = ex.parentElement; if (!host || ex.offsetParent === null) return;
  const W = host.clientWidth - 24, H = (G.mode === 'calc' ? host.clientHeight - 24 : 170);
  let t = Math.max(42, Math.min(G.mode === 'calc' ? 76 : 60, Math.round(Math.min(innerWidth / 9, innerHeight / 10))));
  ex.style.setProperty('--t', t + 'px');
  while (t > 28 && (ex.scrollWidth > W || ex.offsetHeight > H * .86)) { t -= 3; ex.style.setProperty('--t', t + 'px'); }
}
const selKey = () => G.sel ? G.sel.path.join('.') : null;
function paintSel() {
  document.querySelectorAll('#expr .tile').forEach(t => { const on = G.sel && t.dataset.path === selKey() && +t.dataset.i >= G.sel.i && +t.dataset.i <= G.sel.j; t.classList.toggle('sel', !!on); });
  $('#btnHammer').classList.toggle('ready', !!G.sel || (G.mode !== 'calc' && G.choice != null && curStep() && curStep().k === 'judge'));
  guideUpdate();
}
$('#expr').addEventListener('click', e => {
  const t = e.target.closest('.tile'); if (!t || G.busy || G.done || G.paused) return;
  const path = t.dataset.path === '' ? [] : t.dataset.path.split('.').map(Number), i = +t.dataset.i, pk = t.dataset.path;
  const s = G.sel;
  if (s && selKey() === pk) {
    if (i === s.i - 1) { s.i = i; Audio_.play('tap', 1.06); }
    else if (i === s.j + 1) { s.j = i; Audio_.play('tap', 1.06); }
    else if (i === s.i && s.i === s.j) { G.sel = null; Audio_.play('untap'); }
    else if (i === s.i) { s.i++; Audio_.play('untap'); }
    else if (i === s.j) { s.j--; Audio_.play('untap'); }
    else { G.sel = { path, i, j: i }; Audio_.play('tap'); }
  } else { G.sel = { path, i, j: i }; Audio_.play('tap'); }
  paintSel();
});
const selTiles = () => [...document.querySelectorAll('#expr .tile.sel')];

/* タイマー */
function fmt(sec) { sec = Math.floor(sec); return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); }
const elapsed = () => G.acc + (G.t0 ? (performance.now() - G.t0) / 1000 : 0);
function startTimer() { G.t0 = performance.now(); clearInterval(G.tid); G.tid = setInterval(() => { $('#timer').textContent = fmt(elapsed()); }, 200); }
function stopTimer() { if (G.t0) G.acc += (performance.now() - G.t0) / 1000; G.t0 = 0; clearInterval(G.tid); }

/* 技バー */
function buildTechBar() {
  const tr = $('#track'); tr.innerHTML = '';
  TECH_ORDER.forEach((k, n) => {
    const open = introAt[k] <= G.idx;
    const b = el('button', 'tech' + (open ? '' : ' locked')); b.dataset.key = k;
    b.innerHTML = `${ringHTML(open ? k : 'lock')}<span class="lbl">${open ? TECH[k].name : '??????'}</span>`;
    b.setAttribute('aria-label', open ? `技 ${n + 1}：${TECH[k].name}` : 'まだ使えない技');
    b.onclick = () => useTech(k, b, open);
    tr.append(b);
  });
  const upd = () => { $('#trL').disabled = tr.scrollLeft < 4; $('#trR').disabled = tr.scrollLeft + tr.clientWidth > tr.scrollWidth - 4; };
  tr.onscroll = upd; requestAnimationFrame(upd);
  $('#trL').onclick = () => tr.scrollBy({ left: -tr.clientWidth * .8, behavior: 'smooth' });
  $('#trR').onclick = () => tr.scrollBy({ left: tr.clientWidth * .8, behavior: 'smooth' });
  const cur = STAGES[G.idx].tech; if (cur) { const btn = tr.querySelector(`[data-key="${cur}"]`); requestAnimationFrame(() => { if (btn) tr.scrollLeft = btn.offsetLeft - tr.offsetLeft - (tr.clientWidth - btn.offsetWidth) / 2; upd(); }); }
}
$('#btnHammer').innerHTML = ICON.hammer;

let bannerT = null, toastT = null;
function banner(key) {
  const t = TECH[key]; $('#bIcon').innerHTML = ICON[key]; $('#bName').textContent = t.name; $('#bForm').textContent = t.formula;
  $('#banner').classList.add('show'); clearTimeout(bannerT); bannerT = setTimeout(() => $('#banner').classList.remove('show'), 2600);
}
function toast(msg, info) {
  const t = $('#toast'); t.textContent = msg; t.classList.toggle('info', !!info); t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}
function miss(msg, nodes) {
  G.misses++; Audio_.play('error'); toast('✕ ' + msg);
  (nodes || selTiles()).forEach(t => { t.classList.remove('shake'); void t.offsetWidth; t.classList.add('shake'); });
}
function snapshot(actionKey) { G.hist.push({ html: $('#expr').innerHTML, key: actionKey }); }

async function useTech(key, btn, open) {
  if (G.busy || G.done || G.paused) return;
  if (!open) { Audio_.play('error'); toast(`ステージ${label(introAt[key])}で覚える技`, true); return; }
  btn.classList.add('flash'); setTimeout(() => btn.classList.remove('flash'), 500);
  if (!G.sel) { Audio_.play('open'); stopTimer(); showTechCard(key, () => { if (!G.done) startTimer(); }); return; }
  const work = Engine.clone(G.root);
  const res = Engine.applyTech(work, key, G.sel);
  if (!res.ok) { miss(res.msg); return; }
  G.busy = true; Audio_.play('tech'); banner(key);
  snapshot(key);
  const tiles = selTiles(); tiles.forEach(t => t.classList.add('burn'));
  await W8(260); Audio_.play('whoosh');
  tiles.forEach(t => t.classList.add('flipout'));
  await W8(280);
  G.root = work; G.sel = null; G.moves++; $('#moves').textContent = G.moves;
  render(res.newIds, 'dropin'); Audio_.play('flip');
  G.busy = false; checkCalcDone();
}
async function doHammer() {
  if (G.busy || G.done || G.paused) return;
  if (G.mode !== 'calc' && curStep() && curStep().k === 'judge') return judge();
  if (G.mode !== 'calc' && !(curStep() && curStep().k === 'calc')) { toast('ここは選ぶステップ。答えのタイルをタップしよう', true); return; }
  if (!G.sel) { toast('計算するタイルを2つ選んでからハンマー', true); Audio_.play('click'); return; }
  const work = Engine.clone(G.root);
  const res = Engine.hammer(work, G.sel);
  if (!res.ok) { miss(res.msg); return; }
  G.busy = true; if (G.mode === 'calc') snapshot('hammer'); Audio_.play('hammer');
  const tiles = selTiles(); tiles.forEach(t => t.classList.add('burn'));
  await W8(300); Audio_.play('crumble');
  tiles.forEach(t => { shatter(t); t.classList.add('gone'); });
  await W8(240);
  G.root = work; G.sel = null; if (G.mode === 'calc') { G.moves++; $('#moves').textContent = G.moves; }
  render(res.newIds, 'pop');
  G.busy = false;
  if (G.mode === 'calc') checkCalcDone(); else if (Engine.isSolved(G.root)) calcStepDone();
}
$('#btnHammer').onclick = doHammer;
function shatter(t) {
  if (reduced) return;
  const r = t.getBoundingClientRect(), fx = $('#fx');
  for (let k = 0; k < 14; k++) {
    const s = el('i', 'shard');
    const x = r.left + Math.random() * r.width, y = r.top + Math.random() * r.height;
    s.style.left = x + 'px'; s.style.top = y + 'px';
    const sz = 4 + Math.random() * 9; s.style.width = sz + 'px'; s.style.height = sz + 'px';
    s.style.background = ['#7a4a28', '#5e3a20', '#a2602f', '#3a2414'][k % 4];
    fx.append(s);
    const dx = (x - (r.left + r.width / 2)) * (1.2 + Math.random()), dy = 40 + Math.random() * 70;
    s.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }], { duration: 550 + Math.random() * 350, easing: 'cubic-bezier(.2,.6,.4,1)' }).onfinish = () => s.remove();
  }
}

/* ---------- ステージ開始 ---------- */
async function enterStage(idx) {
  G.idx = idx; const st = STAGES[idx];
  Audio_.bgm(null);
  await loading(1150);
  setupStage(); show('play');
  const go = () => { startTimer(); Audio_.bgm('play', .8); };
  if (G.mode === 'calc') {
    render(null); dropAll();
    if (st.tech && !prog.seen[st.tech]) { prog.seen[st.tech] = 1; save(); Audio_.play('shine'); showTechCard(st.tech, go); } else go();
  } else {
    if (firstOfCh(idx) && !prog.seen[st.mode]) { prog.seen[st.mode] = 1; save(); Audio_.play('shine'); showModeCard(st.mode, () => { go(); runStep(); }); }
    else { go(); runStep(); }
  }
}
function setupStage() {
  const st = STAGES[G.idx];
  G.mode = st.mode || 'calc';
  $('#calcView').append($('#expr')); $('#expr').style.display = '';
  Object.assign(G, { sel: null, moves: 0, misses: 0, hist: [], log: [], acc: 0, t0: 0, busy: false, paused: false, done: false, step: 0, steps: [], choice: null });
  $('#play').dataset.mode = G.mode; $('#play').dataset.hammer = '1';
  G.guide = !!(st.tech || (st.mode && firstOfCh(G.idx))) && !(prog.stars[G.idx] > 0); paintGuideBtn();
  $('#timer').textContent = '00:00';
  $('#chipStage').textContent = 'STAGE ' + label(G.idx);
  $('#result').classList.remove('on'); $('#pause').hidden = true; $('#banner').classList.remove('show');
  if (G.mode === 'calc') {
    $('#moves').textContent = 0; $('#par').textContent = ' / ' + st.par; $('#chipMoves').hidden = false; $('#btnHammer').hidden = false;
    $('#calcView').append($('#expr')); $('#calcView').hidden = false; $('#stepView').hidden = true;
    G.root = Engine.parse(st.q); Engine.normalize(G.root, true);
    buildTechBar();
  } else {
    $('#chipMoves').hidden = true;
    $('#calcView').hidden = true; $('#stepView').hidden = false;
    G.cv = null;
    G.steps = st.mode === 'test' ? buildTestSteps(st) : st.mode === 'normal' ? buildNormalSteps(st) : st.steps.map(s => Object.assign({ k: 'choose' }, s));
    buildStepView(st);
  }
}
function dropAll() {
  if (reduced) return;
  document.querySelectorAll('#expr .tile, #expr .paren').forEach((t, k) => { t.animate([{ opacity: 0, transform: 'translateY(-26px)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: 60 + k * 45, easing: 'cubic-bezier(.2,1.4,.4,1)', fill: 'backwards' }); });
}
function retry() { Audio_.play('click'); enterStage(G.idx); }

/* ポーズ */
function pause() { if (G.done || G.busy || !$('#modal').hidden) return; G.paused = true; stopTimer(); $('#pause').hidden = false; Audio_.play('open'); Audio_.fadeTo(Audio_.lvl(.3), .3); }
function resume() { G.paused = false; $('#pause').hidden = true; startTimer(); Audio_.play('close'); Audio_.fadeTo(Audio_.lvl(.8), .3); }
$('#btnPause').onclick = pause; $('#btnResume').onclick = resume;
$('#pRetry').innerHTML = ICON.retry; $('#pSelect').innerHTML = ICON.grid; $('#pFormula').innerHTML = ICON.formula; $('#pFormula').onclick = () => { Audio_.play('open'); showFormulas(STAGES[G.idx].ch >= 8 ? '三角関数' : STAGES[G.idx].ch >= 6 ? '統計' : '数列'); };
$('#pRetry').onclick = retry; $('#pSelect').onclick = () => { Audio_.play('click'); openSelect(STAGES[G.idx].ch); };
$('#rNext').innerHTML = ICON.next; $('#rSelect').innerHTML = ICON.grid; $('#rRetry').innerHTML = ICON.retry;
$('#rRetry').onclick = retry; $('#rSelect').onclick = () => { Audio_.play('click'); openSelect(STAGES[G.idx].ch); };
$('#rNext').onclick = () => { Audio_.play('click'); if (G.idx + 1 < STAGES.length) enterStage(G.idx + 1); else openSelect(); };

/* ---------- ステップ進行（クイズ・帰納法・正規分布・検定・三角関数） ---------- */
const curStep = () => G.steps[G.step];
const NT = []; // 正規分布表 p(z) = P(0 ≦ Z ≦ z)
(function () {
  const erf = x => { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; };
  for (let i = 0; i <= 309; i++) NT[i] = Math.round(0.5 * erf(i / 100 / Math.SQRT2) * 10000) / 10000;
})();
const fmtP = v => v.toFixed(4);
const r2 = v => Math.round(v * 100) / 100;
const pz = z => NT[Math.round(Math.abs(z) * 100)];
const zs = z => (z < 0 ? '−' : '') + Math.abs(r2(z)).toFixed(2).replace(/\.?0+$/, m => m === '.00' ? '' : m);
const zstr = z => { const a = Math.abs(r2(z)); return (z < 0 ? '−' : '') + (Number.isInteger(a) ? a : a); };

// 二項分布 → 正規分布 → 平均・分散・σ（共通部品）
function binomSteps(S, st, what) {
  const pf = `${st.p[0]}/${st.p[1]}`;
  const m = st.n * st.p[0] / st.p[1], s2 = st.n * st.p[0] * (st.p[1] - st.p[0]) / (st.p[1] * st.p[1]), s = Math.sqrt(s2);
  S.push({ k: 'choose', p: `X を「${what}」とする。X が従う分布は？`, hint: 'B(n, p) の n は回数、p は1回あたりの確率。', o: [`二項分布 B(${st.n}, ${pf})`, `二項分布 B(${st.x ?? st.q.a}, ${pf})`, `二項分布 B(${st.n}, ${st.x ?? st.q.a}/${st.n})`], line: `X は 二項分布 B(${st.n}, ${pf}) に従う`, e: `n は試した回数 ${st.n}、p は1回あたりの確率 ${pf}。${st.x ?? st.q.a} は調べたい回数なので n には入れない。` });
  S.push({ k: 'anim', what: 'approx', p: `${st.n}回は十分多いので、正規分布 N(np, np(1−p)) で近似できる！`, line: `${st.n}回は十分多い → 正規分布 N(np, np(1−p)) で考える` });
  S.push({ k: 'calc', p: '平均 m = np を計算しよう', q: `${st.n} *${pf}`, line: `m = np = ${st.n}×${pf} = ${m}`, e: `平均 = 回数 × 確率。${st.n} × ${pf} = ${m}。これが「ふつうなら出る回数」。2つのタイルを選んでハンマー！` });
  S.push({ k: 'calc', p: '分散 σ² = np(1−p) を計算しよう', q: `${st.n} *${pf} *( 1 -${pf} )`, line: `σ² = np(1−p) = ${s2}`, e: `分散 = 回数 × 確率 × (1 − 確率)。まずカッコの中の 1 − ${pf} から計算して、あとは左から掛けていく。` });
  S.push({ k: 'choose', p: `σ² = ${s2} のとき、標準偏差 σ は？`, hint: '2乗して ' + s2 + ' になる数。', o: [String(s), String(s2 / 2), String(s2)], line: `σ = √${s2} = ${s}　→ N(${m}, ${s}²)`, e: `標準偏差 σ は分散の √（ルート）。${s} × ${s} = ${s2} だから σ = ${s}。`, cv: { phase: 'curve', mode: 'X', m, s, title: `正規分布 N(${m}, ${s}²)` } });
  return { m, s };
}
// 標準化ステップ
function stdStep(S, x, m, s, xn = 'X') {
  const z = (x - m) / s;
  S.push({ k: 'calc', dec: true, p: `${xn} = ${x} を標準化しよう：Z = (${xn} − m) ÷ σ`, q: `( ${x} -${m} ) /${s}`, line: `${xn} = ${x} → Z = (${x} − ${m})/${s} = ${zstr(z)}`,
    e: `標準化は「平均を引いて、標準偏差で割る」。${xn} が平均から σ 何個ぶん離れているかが Z。カッコの中 ${x} − ${m} から計算しよう。`, cvAdd: { mode: 'Z', zl: z } });
  return z;
}
function tableStep(S, z) {
  const az = Math.abs(r2(z)), tv = pz(az);
  S.push({ k: 'table', z: az, p: `正規分布表で z = ${az.toFixed(2)} のマスをタップ！`, hint: '縦が小数第1位まで、横が小数第2位。', line: `正規分布表より p(${az.toFixed(2)}) = ${fmtP(tv)}`,
    e: `z = ${az.toFixed(2)} は「縦 ${(Math.floor(az * 10 + 1e-9) / 10).toFixed(1)} の行」と「横 .0${Math.round(az * 100) % 10} の列」が交わるマス。表の値 p(z) は 0 から z までの面積。` + (z < 0 ? '　Z がマイナスでも、グラフは左右対称なので同じ値を使う。' : '') });
  return tv;
}
// 求める面積の出し方（正規分布表の4パターン）
function regionSteps(S, q, za, zb) {
  // q.type: ge (Z≧za) / le (Z≦za) / between (za≦Z≦zb)
  const pa = pz(za), pb = zb != null ? pz(zb) : null;
  const A = Math.abs(r2(za)).toFixed(2), B = zb != null ? Math.abs(r2(zb)).toFixed(2) : null;
  let ok, wrong, expr, val, e, shade;
  if (q.type === 'ge') {
    if (za >= 0) { ok = `0.5 − p(${A})`; wrong = [`0.5 + p(${A})`, `p(${A})`]; expr = `0.5 -${fmtP(pa)}`; val = 0.5 - pa; e = `Z ≧ ${A} は右のはしっこ。右半分ぜんぶ（0.5）から、0〜${A}（表の値）を引く。`; }
    else { ok = `0.5 + p(${A})`; wrong = [`0.5 − p(${A})`, `p(${A})`]; expr = `0.5 +${fmtP(pa)}`; val = 0.5 + pa; e = `Z ≧ −${A} は −${A} から右ぜんぶ。右半分（0.5）に、−${A}〜0（＝表の値）を足す。`; }
    shade = [[za, 3.6]];
  } else if (q.type === 'le') {
    if (za <= 0) { ok = `0.5 − p(${A})`; wrong = [`0.5 + p(${A})`, `p(${A})`]; expr = `0.5 -${fmtP(pa)}`; val = 0.5 - pa; e = `Z ≦ −${A} は左のはしっこ。左半分ぜんぶ（0.5）から、−${A}〜0（表の値）を引く。`; }
    else { ok = `0.5 + p(${A})`; wrong = [`0.5 − p(${A})`, `p(${A})`]; expr = `0.5 +${fmtP(pa)}`; val = 0.5 + pa; e = `Z ≦ ${A} は左半分（0.5）と 0〜${A}（表の値）を合わせた部分。`; }
    shade = [[-3.6, za]];
  } else {
    if (za < 0 && zb > 0) { ok = `p(${A}) + p(${B})`; wrong = [`p(${B}) − p(${A})`, `0.5 − p(${B})`]; expr = `${fmtP(pa)} +${fmtP(pb)}`; val = pa + pb; e = `0 をまたいでいるので、左側（−${A}〜0）と右側（0〜${B}）を足す。左右対称なので左側も p(${A})。`; }
    else if (za === 0) { ok = `p(${B})`; wrong = [`0.5 − p(${B})`, `0.5 + p(${B})`]; expr = null; val = pb; e = `0〜${B} の面積は、表の値そのもの！`; }
    else { ok = `p(${B}) − p(${A})`; wrong = [`p(${A}) + p(${B})`, `0.5 − p(${B})`]; expr = `${fmtP(pb)} -${fmtP(pa)}`; val = pb - pa; e = `どちらも同じ側なので、大きいほう（0〜${B}）から小さいほう（0〜${A}）を引く。`; }
    shade = [[za, zb]];
  }
  val = Math.round(val * 10000) / 10000;
  S.push({ k: 'choose', p: '求める面積は、表の値をどう使う？', o: [ok, ...wrong], e, line: `求める確率 = ${ok}`, cvAdd: { shade, label: '求める部分' } });
  if (expr) S.push({ k: 'calc', dec: true, p: `${ok} を計算しよう`, q: expr, line: `= ${expr.replace(' -', ' − ').replace(' +', ' + ')} = ${fmtP(val)}`, e: '小数の計算。位をそろえて計算しよう。' });
  return val;
}

function buildNormalSteps(st) {
  const S = [];
  const q = st.q;
  G.cv = { phase: 'curve', mode: st.std ? 'Z' : 'X', m: st.m ?? 0, s: st.s ?? 1, title: st.std ? '標準正規分布 N(0, 1)' : (st.binom ? '' : `正規分布 ${st.given}`) };
  let za, zb;
  if (st.std) {
    S.push({ k: 'choose', p: '標準正規分布 N(0, 1) の平均と標準偏差は？', o: ['平均 0、標準偏差 1', '平均 1、標準偏差 0', '平均 0、標準偏差 0'], e: 'N(m, σ²) の形なので N(0, 1) は平均 m = 0、分散 σ² = 1（σ = 1）。グラフは 0 を中心に左右対称。', line: 'N(0, 1)：平均 0、標準偏差 1' });
    za = q.a; zb = q.b;
  } else {
    let m = st.m, s = st.s;
    if (st.binom) { G.cv = { phase: 'intro' }; G.test = { n: st.binom.n, p: st.binom.p }; ({ m, s } = binomSteps(S, Object.assign({}, st.binom, { q }), st.what)); }
    else S.push({ k: 'choose', p: `X は ${st.given} に従う。平均 m と標準偏差 σ は？`, o: [`m = ${m}、σ = ${s}`, `m = ${s}、σ = ${m}`, `m = ${m}、σ = ${s * s}`], e: `N(m, σ²) の1つ目が平均、2つ目は分散 σ²。${s}² と書いてあるので σ = ${s}。`, line: `m = ${m}、σ = ${s}` });
    st._m = m; st._s = s;
    za = stdStep(S, q.a, m, s);
    if (q.type === 'between') zb = stdStep(S, q.b, m, s);
  }
  if (Math.abs(za) > 1e-9) tableStep(S, za);
  if (zb != null && Math.abs(zb) > 1e-9 && Math.abs(Math.abs(zb) - Math.abs(za)) > 1e-9) tableStep(S, zb);
  const val = regionSteps(S, q, za, zb);
  if (st.people) {
    const cnt = Math.round(val * st.people.n * 100) / 100;
    S.push({ k: 'calc', dec: true, p: st.people.txt + `（確率 × ${st.people.n}）`, q: `${fmtP(val)} *${st.people.n}`, line: `${fmtP(val)} × ${st.people.n} = ${cnt}`, e: '割合 × 全体の人数 = その部分の人数。' });
    const r = Math.round(cnt);
    S.push({ k: 'choose', p: 'およそ何人？', o: [`約 ${r} 人`, `約 ${Math.round(val * 100)} 人`, `約 ${Math.round((1 - val) * st.people.n)} 人`], line: `答え：約 ${r} 人`, e: `${cnt} を四捨五入して約 ${r} 人。` });
  }
  G.normal = { za, zb, val };
  return S;
}

function buildTestSteps(st) {
  const S = [];
  const face = st.faceName || st.face || (st.icon === 'coin' ? '裏' : st.icon === 'dice' ? '6の目' : '');
  let m, s;
  G.cv = { phase: 'intro' };
  S.push({ k: 'choose', p: '帰無仮説（否定したい仮説）はどれ？', hint: '「言いたいこと」の反対を仮説にして、それが否定できるか調べる。', o: st.nulls, line: '帰無仮説：「' + st.nulls[0] + '」',
    e: '問題文で言いたいこと（「 」の中）の反対、つまり「ふつうの状態」を仮説にする。この仮説が否定できれば、言いたいことが言える。結果の数は仮説ではない。' });
  if (!st.mean) {
    G.test = { n: st.n, p: st.p };
    ({ m, s } = binomSteps(S, st, st.what || `${face}が出る回数`));
  } else {
    m = st.mu; s = st.sd / Math.sqrt(st.size);
    const u = st.unit || '';
    S.push({ k: 'choose', p: `${st.xlab}を X̄ とする。帰無仮説が正しいとき、X̄ が従う分布は？`, hint: '標本平均の分散は σ²/n（母集団の分散 ÷ 標本の大きさ）。', o: [`正規分布 N(${m}, ${st.sd.toFixed(1)}²/${st.size})`, `正規分布 N(${m}, ${st.sd.toFixed(1)}²)`, `正規分布 N(${st.xbar}, ${st.sd.toFixed(1)}²/${st.size})`], line: `X̄ は 正規分布 N(${m}, ${st.sd.toFixed(1)}²/${st.size}) に従う`,
      e: `平均は帰無仮説の ${m}${u}。分散は「母集団の分散 ÷ 標本の大きさ」で ${st.sd.toFixed(1)}²/${st.size}。${st.xbar}${u} は結果なので平均には使わない。`, cv: { phase: 'curve', mode: 'X', m, s: 1, title: '正規分布で考える', hideTicks: true } });
    S.push({ k: 'calc', dec: true, p: `X̄ の標準偏差 σ/√n = ${st.sd.toFixed(1)} ÷ √${st.size} を計算しよう（√${st.size} = ${Math.sqrt(st.size)}）`, q: `${st.sd.toFixed(1)} /${Math.sqrt(st.size)}`, line: `σ = ${st.sd.toFixed(1)}/√${st.size} = ${s}`,
      e: `標本平均の標準偏差は σ ÷ √n。√${st.size} = ${Math.sqrt(st.size)} なので ${st.sd.toFixed(1)} ÷ ${Math.sqrt(st.size)} を計算。`, cv: { phase: 'curve', mode: 'X', m, s, title: `正規分布 N(${m}, ${s}²)` } });
  }
  const z = stdStep(S, st.mean ? st.xbar : st.x, m, s, st.mean ? 'X̄' : 'X');
  const tv = tableStep(S, z);
  const az = Math.abs(r2(z));
  const P = Math.round((0.5 - tv) * 10000) / 10000;
  const ineq = st.side === 'up' ? `P(Z ≧ ${az})` : `P(Z ≦ −${az})`;
  S.push({ k: 'calc', dec: true, p: `求めたいのは${st.side === 'up' ? '右' : '左'}のはしっこ ${ineq}。半分(0.5) から表の値を引こう`, q: `0.5 -${fmtP(tv)}`, line: `${ineq} = 0.5 − ${fmtP(tv)} = ${fmtP(P)}`,
    e: `グラフの${st.side === 'up' ? '右' : '左'}半分ぜんぶの面積が 0.5。そこから 0〜${az}（表の値 ${fmtP(tv)}）を引くと、はしっこの確率になる。`, cvAdd: { shade: st.side === 'up' ? [[az, 3.6]] : [[-3.6, -az]], label: '0.5 − ' + fmtP(tv) } });
  const big = P > 0.05;
  S.push({ k: 'choose', p: `${fmtP(P)} を 有意水準 0.05 とくらべると？`, o: ['0.05 より大きい', '0.05 より小さい'], ans: big ? 0 : 1, keepOrder: true, line: `${fmtP(P)} は 0.05 より${big ? '大きい' : '小さい'}`, e: `${fmtP(P)} と 0.0500 を、小数第2位からくらべる。→ ${big ? '大きい' : '小さい'}。` });
  S.push({ k: 'judge', p: '判定をえらんで、ハンマーで下そう！', o: ['帰無仮説は否定されない', '帰無仮説は否定される'], ans: big ? 0 : 1, keepOrder: true, big,
    line: big ? '帰無仮説は否定されない（もとの仮説が正しくないとは言えない）' : '帰無仮説は否定される（もとの仮説は正しくないと言える）',
    e: big ? `0.05 より大きい ＝ 帰無仮説が正しくても、${(P * 100).toFixed(2)}% くらいは「たまたま」起こる。めずらしくないので、帰無仮説は否定されない。` : `0.05 より小さい ＝ 帰無仮説が正しいなら ${(P * 100).toFixed(2)}% しか起きない「めずらしいこと」が起きた。だから帰無仮説の方がおかしい → 否定される。` });
  S.push({ k: 'choose', p: '結論はどっち？', o: st.concl, line: '結論：' + st.concl[0], e: big ? '帰無仮説が否定されない → 言いたいこと（問題文の「 」）は「言えない」「判断できない」。' : '帰無仮説が否定される → 言いたいこと（問題文の「 」）が「言える」「判断できる」。' });
  return S;
}

function buildStepView(st) {
  const v = $('#stepView'); v.innerHTML = '';
  const q = el('div', 'qcard');
  const icon = st.icon ? ICON[st.icon === 'coin' && st.face === '表' ? 'coinF' : st.icon === 'dice' && st.faceName === '1の目' ? 'dice1' : st.icon] : ICON[MODEINFO[G.mode].icon];
  const kind = { proof: '証明しよう', test: '仮説検定', normal: st.std ? '標準正規分布' : '正規分布', quiz: '数列の基本', trig: '三角関数（数Ⅱ）' }[G.mode];
  const body = G.mode === 'proof' ? `すべての自然数 n について<br><b class="stmt">${st.stmt}</b>` : (st.story || `<b class="stmt">${st.stmt}</b>`);
  q.innerHTML = `<span class="qic ${st.icon ? 'big' : ''}">${icon}</span><div><div class="qk">${kind}</div><div class="qt">${body}</div></div>`;
  const vis = el('div', 'visual', '');
  if (G.mode === 'proof') {
    const row = el('div', 'dominos');
    for (let i = 0; i < 9; i++) row.append(el('div', 'dom' + (i === 8 ? ' more' : ''), `<i></i><span>${i < 8 ? 'n=' + (i + 1) : '…'}</span>`));
    vis.append(row);
  } else if (G.mode === 'test' || G.mode === 'normal') {
    vis.append(el('div', 'curvebox', '<svg id="curve" viewBox="0 0 600 230" preserveAspectRatio="xMidYMid meet"></svg>'));
  } else if (G.mode === 'trig') {
    vis.append(el('div', 'unitbox', '<svg id="unit" viewBox="-160 -150 320 300" preserveAspectRatio="xMidYMid meet"></svg>'));
  } else if (G.mode === 'quiz') {
    vis.append(el('div', 'seqstrip', ''));
  }
  const log = el('ol', 'plog'); log.id = 'plog';
  const calc = el('div', 'vcalc'); calc.id = 'vcalc';
  const prompt = el('div', 'prompt', '<span class="pstep" id="pstep"></span><span id="ptext"></span><span class="phint" id="phint"></span><div class="pexp" id="pexp" hidden></div>');
  const ch = el('div', 'choices'); ch.id = 'choices';
  v.append(q, vis, calc, prompt, ch, log);
  if (G.mode === 'test' || G.mode === 'normal') drawCurve();
  if (G.mode === 'trig') { G.uc = { deg: 0 }; drawUnit(st.steps[0].v || { deg: 0 }, true); }
  if (G.mode === 'quiz') { G.sq = { seq: st.seq || (st.steps[0].v && st.steps[0].v.seq) || [], hl: -1, reveal: false, ans: st.ans, diffs: null }; drawSeq(); }
}

async function runStep() {
  const s = curStep(); if (!s) return finishSteps();
  G.choice = null; G.sel = null; $('#coach').hidden = true; paintSel();
  $('#pstep').textContent = `${G.step + 1}/${G.steps.length}`;
  $('#ptext').innerHTML = s.p || '';
  $('#phint').textContent = s.hint || '';
  const ch = $('#choices'); ch.innerHTML = ''; ch.className = 'choices';
  $('#vcalc').hidden = true; $('#expr').style.display = '';
  $('#btnHammer').hidden = !(s.k === 'calc' || s.k === 'judge'); $('#play').dataset.hammer = (s.k === 'calc' || s.k === 'judge') ? '1' : '0';
  showExp(s, G.guide);
  if (s.v) { if (G.mode === 'trig') drawUnit(s.v); if (G.mode === 'quiz') { Object.assign(G.sq, s.v); if (s.v.seq) G.sq.reveal = false; drawSeq(); } }
  if (s.k === 'choose' || s.k === 'judge') {
    const ans = s.ans ?? 0, base = s.o.map((t, i) => ({ t, ok: i === ans })); const opts = s.keepOrder ? base : shuffle(base);
    opts.forEach((o, i) => {
      const b = el('button', 'choice', o.t); b.dataset.ok = o.ok ? 1 : 0;
      b.style.animationDelay = (i * 0.06) + 's';
      b.onclick = () => s.k === 'judge' ? pickJudge(b) : pick(b);
      if (G.guide && o.ok) b.classList.add('hintpulse');
      ch.append(b);
    });
    if (s.k === 'judge') ch.classList.add('judge');
  } else if (s.k === 'calc') {
    $('#vcalc').hidden = false; $('#vcalc').append($('#expr'));
    G.root = Engine.parse(s.q); if (s.dec) Engine.markDec(G.root); Engine.normalize(G.root, true);
    render(null); dropAll();
  } else if (s.k === 'anim') {
    G.busy = true;
    if (s.what === 'approx') { G.cv.phase = 'hist'; drawCurve(); Audio_.play('paper'); await W8(1300); G.cv = { phase: 'curve', mode: 'X', title: '正規分布 N(np, np(1−p)) で考える', hideTicks: true, draw: true }; drawCurve(); Audio_.play('shine'); await W8(1500); G.cv.draw = false; }
    G.busy = false; stepOK();
  } else if (s.k === 'table') {
    buildTable(s.z);
  }
}
function pick(b) {
  if (G.busy || G.done || G.paused) return;
  if (b.dataset.ok === '1') { b.classList.add('right'); Audio_.play('correct'); [...$('#choices').children].forEach(x => x.disabled = true); G.busy = true; setTimeout(() => { G.busy = false; stepOK(); }, reduced ? 0 : 520); }
  else { b.classList.add('wrong'); b.disabled = true; miss(G.mode === 'proof' ? 'その式だとドミノがつながらない' : 'ちがうよ。解説を読んでもう一度！', [b]); showExp(curStep(), true); }
}
function pickJudge(b) {
  if (G.busy || G.done || G.paused) return;
  [...$('#choices').children].forEach(x => x.classList.remove('picked'));
  b.classList.add('picked'); G.choice = b; Audio_.play('tap'); paintSel();
  if (G.guide && b.dataset.ok === '1') { b.classList.remove('hintpulse'); $('#btnHammer').classList.add('gb'); }
}
async function judge() {
  if (!G.choice) { toast('判定をえらんでからハンマー！', true); return; }
  const b = G.choice;
  if (b.dataset.ok !== '1') { b.classList.remove('picked'); G.choice = null; paintSel(); miss('くらべた結果をもう一度見よう', [b]); showExp(curStep(), true); return; }
  G.busy = true;
  const hb = $('#btnHammer'); hb.classList.remove('gb'); hb.classList.add('slam'); Audio_.play('gavel');
  await W8(260); hb.classList.remove('slam');
  const s = curStep();
  const stamp = el('div', 'stamp ' + (s.big ? 'blue' : 'red'), s.big ? '否定されない' : '否定される！');
  $('#stepView').append(stamp); Audio_.play('crumble');
  await W8(1200); stamp.remove();
  G.busy = false; stepOK();
}
function stepOK() {
  const s = curStep();
  if (s.line) addLog(s.line);
  if (G.mode === 'proof' && s.fall) fallDominos(s.fall);
  if (G.cv && (s.cv || s.cvAdd || s.k === 'table')) {
    if (s.cv) G.cv = Object.assign({}, s.cv);
    if (s.cvAdd) { const a = s.cvAdd; if (a.mode) { G.cv.mode = a.mode; G.cv.zl = (G.cv.zl || []).concat([a.zl]); G.cv.title = ''; } if (a.shade) { G.cv.shade = a.shade; G.cv.slabel = a.label; } }
    if (s.k === 'table') { G.cv.tables = (G.cv.tables || []).concat([s.z]); }
    drawCurve();
  }
  if (s.va && G.mode === 'quiz') { Object.assign(G.sq, s.va); drawSeq(); }
  if (s.va && G.mode === 'trig') drawUnit(s.va);
  G.step++;
  setTimeout(runStep, reduced ? 0 : (G.mode === 'proof' && s.fall === 99 ? 1100 : 250));
}
function calcStepDone() {
  const t = $('#expr .tile'); if (t) t.classList.add('final');
  Audio_.play('correct');
  G.busy = true; setTimeout(() => { G.busy = false; stepOK(); }, reduced ? 0 : 650);
}
function addLog(line) {
  G.log.push(line);
  const li = el('li', '', line); $('#plog').append(li);
  li.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 300 });
  $('#plog').scrollTop = $('#plog').scrollHeight;
}
function fallDominos(n) {
  const ds = [...document.querySelectorAll('.dom')];
  ds.forEach((d, i) => { if (i < Math.min(n, ds.length) && !d.classList.contains('down')) setTimeout(() => { d.classList.add('down'); Audio_.play('domino', 1 + i * 0.03); }, (reduced ? 0 : 110) * i); });
  if (n === 1 && ds[1]) setTimeout(() => ds[1].classList.add('wobble'), 200);
}

/* 正規分布表（問題用：一部だけ） */
function buildTable(z) {
  const ch = $('#choices'); ch.className = 'choices tablewrap';
  const r0 = Math.floor(z * 10 + 1e-9) / 10; const rows = [];
  for (let r = Math.max(0, r0 - 0.3); r <= Math.min(3.0, r0 + 0.3) + 1e-9; r += 0.1) rows.push(Math.round(r * 10) / 10);
  let h = '<table class="ztable"><thead><tr><th>z</th>' + [...Array(10)].map((_, c) => `<th>.0${c}</th>`).join('') + '</tr></thead><tbody>';
  rows.forEach(r => { h += `<tr><th>${r.toFixed(1)}</th>` + [...Array(10)].map((_, c) => { const zz = Math.round(r * 100 + c); return `<td><button data-z="${zz}">${NT[zz].toFixed(4).slice(1)}</button></td>`; }).join('') + '</tr>'; });
  h += '</tbody></table>';
  ch.innerHTML = h;
  if (G.guide) { const hb = ch.querySelector(`button[data-z="${Math.round(z * 100)}"]`); if (hb) hb.classList.add('hintpulse'); }
  ch.querySelectorAll('button').forEach(b => b.onclick = () => {
    if (G.busy || G.paused) return;
    if (+b.dataset.z === Math.round(z * 100)) { b.classList.add('right'); Audio_.play('correct'); G.busy = true; setTimeout(() => { G.busy = false; stepOK(); }, reduced ? 0 : 600); }
    else { b.classList.add('wrong'); showExp(curStep(), true); miss(`z = ${z.toFixed(2)} は「縦 ${(Math.floor(z * 10 + 1e-9) / 10).toFixed(1)} の行」と「横 .0${Math.round(z * 100) % 10} の列」が交わるマス`, [b]); }
  });
}

/* 正規分布のグラフ（状態 G.cv から描く） */
const CV = { x0: 300, k: 78, base: 190, hgt: 150 };
const cx = z => CV.x0 + z * CV.k, cy = z => CV.base - CV.hgt * Math.exp(-z * z / 2);
function curvePath(a = -3.6, b = 3.6) { let d = ''; for (let z = a; z <= b + 1e-9; z += 0.05) d += (d ? 'L' : 'M') + cx(z).toFixed(1) + ' ' + cy(z).toFixed(1); return d; }
function areaPath(a, b) { a = Math.max(-3.6, a); b = Math.min(3.6, b); let d = `M${cx(a).toFixed(1)} ${CV.base}`; for (let z = a; z <= b + 1e-9; z += 0.02) d += `L${cx(z).toFixed(1)} ${cy(z).toFixed(1)}`; return d + `L${cx(b).toFixed(1)} ${CV.base}Z`; }
function drawCurve() {
  const svg = $('#curve'); if (!svg) return; const c = G.cv || {};
  const lab = (x, y, t, cls = '') => `<text x="${x}" y="${y}" class="cl ${cls}" text-anchor="middle">${t}</text>`;
  let h = `<path d="M10 ${CV.base}H590" class="axis"/>`;
  if (c.phase === 'intro') { svg.innerHTML = h + lab(300, 110, '帰無仮説が正しいとして、どれくらい「めずらしい」かを調べよう', 'big'); return; }
  if (c.phase === 'hist') {
    const { n, p } = G.test; const pp = p[0] / p[1], mu = n * pp, sd = Math.sqrt(n * pp * (1 - pp));
    let lf = [0]; for (let i = 1; i <= n; i++) lf[i] = lf[i - 1] + Math.log(i);
    const step = Math.max(1, Math.round(sd / 6)); const w = CV.k / sd * step;
    for (let x = Math.max(0, Math.ceil(mu - 3.6 * sd)); x <= Math.min(n, mu + 3.6 * sd); x += step) {
      const lp = lf[n] - lf[x] - lf[n - x] + x * Math.log(pp) + (n - x) * Math.log(1 - pp);
      const hh = Math.exp(lp) * sd * Math.sqrt(2 * Math.PI) * CV.hgt, z = (x - mu) / sd;
      h += `<rect class="bar" x="${(cx(z) - w / 2).toFixed(1)}" y="${(CV.base - hh).toFixed(1)}" width="${Math.max(1, w - 1).toFixed(1)}" height="${hh.toFixed(1)}" style="animation-delay:${((z + 3.6) * 0.06).toFixed(2)}s"/>`;
    }
    svg.innerHTML = h + lab(300, 24, `二項分布 B(${n}, ${p[0]}/${p[1]})`, 'big'); return;
  }
  if (c.shade) c.shade.forEach(([a, b]) => { h += `<path d="${areaPath(a, b)}" class="tail"/>`; });
  (c.tables || []).forEach(t => { const sg = (c.zl || []).find(z => Math.abs(Math.abs(z) - t) < 1e-6) < 0 ? -1 : 1; const a = sg < 0 ? -t : 0, b = sg < 0 ? 0 : t; h += `<path d="${areaPath(a, b)}" class="area"/>` + lab(cx((a + b) / 2), CV.base - 30, fmtP(pz(t)), 'av'); });
  if (c.shade) { const [a, b] = c.shade[0]; const mid = Math.max(-3, Math.min(3, (Math.max(a, -3.2) + Math.min(b, 3.2)) / 2)); h += lab(cx(mid), 70, c.slabel || '', 'tv'); }
  h += `<path d="${curvePath()}" class="curve ${c.draw ? 'draw' : ''}"/>`;
  const zMode = c.mode === 'Z';
  for (let k = -3; k <= 3; k++) {
    h += `<path d="M${cx(k)} ${CV.base}v6" class="axis"/>`;
    if (c.hideTicks) { if (k === 0) h += lab(cx(0), CV.base + 22, 'm'); continue; }
    h += lab(cx(k), CV.base + 22, zMode ? k : +(c.m + k * c.s).toFixed(2), zMode ? 'zt' : '');
  }
  h += lab(565, CV.base + 22, zMode ? 'Z' : 'X', 'ax');
  (c.zl || []).forEach((z, i) => { h += `<path d="M${cx(Math.max(-3.5, Math.min(3.5, z)))} ${CV.base}V34" class="zline"/>` + lab(cx(Math.max(-3.3, Math.min(3.3, z))), 26 + i * 20, 'Z = ' + zstr(z), 'zl'); });
  if (c.title) h += lab(300, 24, c.title, 'big');
  svg.innerHTML = h;
}

/* 単位円（三角関数） */
function drawUnit(v, instant) {
  const svg = $('#unit'); if (!svg) return;
  let from = G.uc && G.uc.deg != null ? G.uc.deg : 0; const to = v.deg != null ? v.deg : from;
  from = ((from % 360) + 360) % 360; if (to - from > 180) from += 360; if (from - to > 180) from -= 360;
  const st = Object.assign({}, v);
  if (st.pt || instant || reduced || from === to) { G.uc = st; svg.innerHTML = unitSVG(st, to); return; }
  const t0 = performance.now(), dur = 650;
  const tick = now => { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); svg.innerHTML = unitSVG(st, ((from + (to - from) * e) % 360 + 360) % 360 || (to >= 359 ? 359.9 : 0)); if (p < 1) requestAnimationFrame(tick); else G.uc = st; };
  requestAnimationFrame(tick);
}
function unitSVG(v, deg) {
  const R = 110; let h = '';
  const r = v.r || 1, k = R / r;
  h += `<path d="M-150 0H150M0 -140V140" class="uax"/>` + `<text x="146" y="16" class="ul">x</text><text x="8" y="-130" class="ul">y</text>`;
  h += `<circle cx="0" cy="0" r="${R}" class="ucirc"/>`;
  if (r === 1) { h += `<text x="${R + 4}" y="14" class="ul">1</text><text x="${-R - 16}" y="14" class="ul">−1</text><text x="6" y="${-R - 4}" class="ul">1</text><text x="6" y="${R + 14}" class="ul">−1</text>`; for (let d = 0; d < 360; d += 30) { const a = d * Math.PI / 180; h += `<circle cx="${(R * Math.cos(a)).toFixed(1)}" cy="${(-R * Math.sin(a)).toFixed(1)}" r="2.2" class="udot"/>`; } }
  let px, py, a;
  if (v.pt) { px = v.pt[0] * k; py = -v.pt[1] * k; a = Math.atan2(v.pt[1], v.pt[0]); deg = a * 180 / Math.PI; }
  else { a = deg * Math.PI / 180; px = R * Math.cos(a); py = -R * Math.sin(a); }
  const ar = 26, large = (deg % 360) > 180 ? 1 : 0;
  if (Math.abs(deg) > 0.5) {
    if (Math.abs(deg - 360) < 0.5) h += `<circle cx="0" cy="0" r="${ar}" class="uarc"/>`;
    else h += `<path d="M${ar} 0 A${ar} ${ar} 0 ${large} 0 ${(ar * Math.cos(a)).toFixed(1)} ${(-ar * Math.sin(a)).toFixed(1)}" class="uarc"/>`;
    if (v.show === 'arc') h += `<path d="M${R} 0 A${R} ${R} 0 ${large} 0 ${px.toFixed(1)} ${py.toFixed(1)}" class="uarcbig"/>`;
  }
  const show = v.show || 'pt';
  if (show !== 'arc') {
    if (['cos', 'both', 'xy', 'ptang'].includes(show) || show === 'pt') h += `<path d="M${px.toFixed(1)} ${py.toFixed(1)}V0" class="ucos-d"/>`;
    if (['sin', 'both', 'xy', 'ptang'].includes(show) || show === 'pt') h += `<path d="M${px.toFixed(1)} ${py.toFixed(1)}H0" class="usin-d"/>`;
    if (['cos', 'both', 'xy'].includes(show)) h += `<path d="M0 0H${px.toFixed(1)}" class="ucos"/>`;
    if (['sin', 'both', 'xy'].includes(show)) h += `<path d="M${px.toFixed(1)} 0V${py.toFixed(1)}" class="usin"/>`;
  }
  h += `<path d="M0 0L${px.toFixed(1)} ${py.toFixed(1)}" class="urad"/><circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="6" class="upt"/>`;
  const lx = px + (px >= 0 ? 10 : -10), ly = py + (py <= 0 ? -10 : 18);
  h += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="ul big" text-anchor="${px >= 0 ? 'start' : 'end'}">P</text>`;
  if (v.vals) {
    if (['cos', 'both', 'xy'].includes(show)) h += `<text x="${(px / 2).toFixed(1)}" y="${py <= 0 ? 18 : -8}" class="ul cosl" text-anchor="middle">${v.vals[0]}</text>`;
    if (['sin', 'both', 'xy'].includes(show)) h += `<text x="${(px + (px >= 0 ? 8 : -8)).toFixed(1)}" y="${(py / 2 + 5).toFixed(1)}" class="ul sinl" text-anchor="${px >= 0 ? 'start' : 'end'}">${v.vals[1]}</text>`;
  } else {
    if (['cos', 'both', 'xy'].includes(show)) h += `<text x="${(px / 2).toFixed(1)}" y="${py <= 0 ? 18 : -8}" class="ul cosl" text-anchor="middle">cos</text>`;
    if (['sin', 'both', 'xy'].includes(show)) h += `<text x="${(px + (px >= 0 ? 8 : -8)).toFixed(1)}" y="${(py / 2 + 5).toFixed(1)}" class="ul sinl" text-anchor="${px >= 0 ? 'start' : 'end'}">sin</text>`;
  }
  const dlab = v.pt ? (v.show === 'ptang' ? 'α' : '') : (v.lab || (Math.round(deg) + '°'));
  if (dlab) h += `<text x="${(ar + 12) * Math.cos(a / 2) + 4}" y="${-(ar + 12) * Math.sin(a / 2)}" class="ul ang">${dlab}</text>`;
  if (v.pt) h += `<text x="${(px / 2 - 14).toFixed(1)}" y="${(py / 2 - 6).toFixed(1)}" class="ul ang" text-anchor="end">r</text><text x="${px.toFixed(1)}" y="16" class="ul cosl" text-anchor="middle">${v.pl ? v.pl[0] : ''}</text><text x="-8" y="${(py + 5).toFixed(1)}" class="ul sinl" text-anchor="end">${v.pl ? v.pl[1] : ''}</text>`;
  return h;
}

/* 数列のならび（第0章） */
function drawSeq() {
  const box = document.querySelector('.seqstrip'); if (!box) return;
  const q = G.sq; let h = '';
  q.seq.forEach((t, i) => {
    const isQ = t === '?';
    const val = isQ ? (q.reveal ? q.ans : '□') : (t < 0 ? '−' + (-t) : t);
    h += `<div class="sqt ${q.hl === i ? 'hl' : ''} ${isQ ? 'q' : ''} ${t === '…' ? 'dots' : ''}"><b>${val}</b>${t === '…' ? '' : `<span>a<sub>${i + 1}</sub></span>`}</div>`;
    if (i < q.seq.length - 1 && q.diffs) h += `<div class="sqd">${q.diffs[i] ?? ''}</div>`;
  });
  box.innerHTML = h;
}

/* ---------- ガイド（次の一手を光らせて解説） ---------- */
const BULB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" fill="currentColor" fill-opacity=".25"/></svg>';
function paintGuideBtn() { const b = $('#btnGuide'); b.innerHTML = BULB + '<span>ガイド' + (G.guide ? 'ON' : 'OFF') + '</span>'; b.classList.toggle('on', !!G.guide); b.setAttribute('aria-pressed', !!G.guide); }
$('#btnGuide').onclick = () => {
  G.guide = !G.guide; paintGuideBtn(); Audio_.play('click');
  if (G.mode === 'calc' || (curStep() && curStep().k === 'calc')) guideUpdate();
  if (G.mode !== 'calc' && curStep()) { showExp(curStep(), G.guide); markHints(); }
};
function markHints() {
  document.querySelectorAll('.hintpulse').forEach(x => x.classList.remove('hintpulse'));
  if (!G.guide) return;
  const s = curStep(); if (!s) return;
  if (s.k === 'table') { const hb = document.querySelector(`.ztable button[data-z="${Math.round(s.z * 100)}"]`); if (hb) hb.classList.add('hintpulse'); }
  document.querySelectorAll('#choices .choice[data-ok="1"]').forEach(b => { if (!b.disabled) b.classList.add('hintpulse'); });
}
function showExp(s, on) {
  const p = $('#pexp'); if (!p) return;
  if (!on || !s || !s.e) { p.hidden = true; return; }
  p.hidden = false; p.innerHTML = `<b>${G.guide ? '解説' : 'ヒント'}</b>${s.e}`;
}
const skey = items => JSON.stringify(items, (k, v) => k === 'id' ? undefined : v);
function groupsOf(items, path, out) { out.push(path); items.forEach((t, k) => { if (t.items) groupsOf(t.items, path.concat(k), out); }); return out; }
const guideCache = new Map();
function nextAction(root, techs) {
  const k0 = skey(root) + '|' + techs.join(',');
  if (guideCache.has(k0)) return guideCache.get(k0);
  const seen = new Set([skey(root)]);
  let frontier = [{ root, first: null }], found = null, count = 0;
  while (frontier.length && !found && count < 8000) {
    const next = [];
    for (const node of frontier) {
      for (const gp of groupsOf(node.root, [], [])) {
        const items = Engine.getGroup(node.root, gp);
        for (let i = 0; i < items.length && !found; i++) for (let j = i; j < items.length && !found; j++) {
          for (const act of ['hammer', ...techs]) {
            const r = Engine.clone(node.root);
            const res = act === 'hammer' ? Engine.hammer(r, { path: gp, i, j }) : Engine.applyTech(r, act, { path: gp, i, j });
            if (!res.ok) continue;
            const kk = skey(r); if (seen.has(kk)) continue; seen.add(kk); count++;
            const first = node.first || { act, path: gp, i, j, after: r };
            if (Engine.isSolved(r)) { found = first; break; }
            next.push({ root: r, first });
          }
        }
        if (found) break;
      }
      if (found) break;
    }
    frontier = next;
  }
  guideCache.set(k0, found);
  return found;
}
function guideUpdate() {
  const coach = $('#coach');
  document.querySelectorAll('.gt, .gb').forEach(x => x.classList.remove('gt', 'gb'));
  const calcLike = G.mode === 'calc' || (curStep() && curStep().k === 'calc');
  if (!G.guide || G.done || !calcLike || !G.root || Engine.isSolved(G.root)) { coach.hidden = true; return; }
  const techs = G.mode === 'calc' ? TECH_ORDER.filter(k => introAt[k] <= G.idx) : [];
  const a = nextAction(G.root, techs);
  if (!a) { coach.hidden = true; return; }
  const showBox = G.mode === 'calc';
  const pk = a.path.join('.');
  const tiles = [...document.querySelectorAll('#expr .tile')].filter(t => t.dataset.path === pk && +t.dataset.i >= a.i && +t.dataset.i <= a.j);
  const matched = G.sel && selKey() === pk && G.sel.i === a.i && G.sel.j === a.j;
  tiles.forEach(t => t.classList.add('gt'));
  let btn, name, why;
  if (a.act === 'hammer') {
    btn = $('#btnHammer'); name = 'ハンマー';
    const items = Engine.getGroup(G.root, a.path); const part = items.slice(a.i, a.j + 1);
    const hasMul = part.slice(1).some(t => t.op === '*' || t.op === '/');
    const pow = part.some(t => t.t === 'pow');
    why = pow && part.length === 1 ? '累乗（◯の◯乗）を計算する。' : a.path.length ? 'カッコの中から先に計算する。' : hasMul ? '×・÷ は ＋・− より先に計算する。' : '残ったものを左から順に計算する。';
    if (pow && part.length > 1) why = '累乗もいっしょに計算される。' + why;
  } else {
    btn = document.querySelector(`.tech[data-key="${a.act}"]`); name = TECH[a.act].name;
    why = TECH[a.act].how;
    const tr = $('#track'); if (btn && matched) tr.scrollLeft = btn.offsetLeft - tr.offsetLeft - (tr.clientWidth - btn.offsetWidth) / 2;
  }
  if (matched && btn) btn.classList.add('gb');
  const n = tiles.length;
  const step = matched ? `② <b>${name}</b> をタップ！` : (n > 1 ? `① 光っているタイルを <b>はしからはしまで${n}個</b> 選ぶ` : `① 光っているタイルを <b>タップ</b>`) + `　→　② <b>${name}</b>`;
  const prev = el('div', 'expr mini'); prev.append(build(a.after, []));
  coach.innerHTML = `<div class="ch-top"><span class="ch-tag">${BULB}ガイド</span><span class="ch-step">${step}</span></div><div class="ch-why">${why}</div><div class="ch-prev"><span class="ch-l">こうなる →</span></div>`;
  coach.querySelector('.ch-prev').append(prev);
  prev.querySelectorAll('.tile').forEach(t => { t.tabIndex = -1; t.disabled = true; });
  coach.hidden = !showBox;
}

/* ---------- クリア ---------- */
async function checkCalcDone() {
  if (!Engine.isSolved(G.root)) return;
  G.done = true; stopTimer(); $('#coach').hidden = true;
  snapshot('done');
  const t = $('#expr .tile'); await W8(380);
  t.classList.add('final'); Audio_.play('shine');
  Audio_.fadeTo(Audio_.lvl(.25), .3);
  await W8(700);
  showResult();
}
async function finishSteps() {
  G.done = true; stopTimer();
  if (G.mode === 'proof') { const q = el('div', 'stamp gold', '証明完了！'); $('#stepView').append(q); Audio_.play('gavel'); await W8(1200); q.remove(); }
  Audio_.fadeTo(Audio_.lvl(.25), .3);
  showResult();
}
async function showResult() {
  Audio_.play('clear');
  const st = STAGES[G.idx], sec = elapsed();
  const okTime = sec <= st.time, okM = G.mode === 'calc' ? G.moves <= st.par : G.misses === 0;
  const stars = 1 + (okTime ? 1 : 0) + (okM ? 1 : 0);
  prog.stars[G.idx] = Math.max(prog.stars[G.idx] || 0, stars); save();
  const hist = $('#hist'); hist.innerHTML = '';
  if (G.mode === 'calc') {
    G.hist.forEach((h, k) => {
      const row = el('div', 'hrow');
      const ic = el('span', 'hic', h.key === 'done' ? ICON.check : h.key === 'hammer' ? ICON.hammer : ICON[h.key]);
      const ex = el('div', 'expr', h.html);
      ex.querySelectorAll('.tile').forEach(x => { x.classList.remove('final', 'pop', 'dropin', 'burn', 'gone', 'flipout', 'shake'); x.style.animationDelay = ''; x.tabIndex = -1; });
      row.append(ic, ex); hist.append(row);
      row.animate([{ opacity: 0, transform: 'translateX(-16px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 200 + k * 90, fill: 'backwards' });
    });
  } else {
    const ol = el('ol', 'plog done'); G.log.forEach(l => ol.append(el('li', '', l))); hist.append(ol);
  }
  $('#rStage').textContent = 'STAGE ' + label(G.idx);
  $('#m1t').textContent = `${st.time}秒以内にクリア（${fmt(sec)}）`;
  $('#m2t').textContent = G.mode === 'calc' ? `${st.par}手以内でクリア（${G.moves}手）` : `ノーミスでクリア（ミス ${G.misses}）`;
  $('#m1').classList.toggle('ok', okTime); $('#m2').classList.toggle('ok', okM);
  $('#rTip').textContent = st.tip;
  $('#rNext').hidden = G.idx + 1 >= STAGES.length;
  const coins = $('#coins'); coins.innerHTML = '';
  const got = [true, okTime, okM];
  got.forEach(() => coins.append(el('span', 'coin', ICON.coinStar)));
  $('#result').classList.add('on');
  await W8(650);
  for (let k = 0; k < 3; k++) if (got[k]) { coins.children[k].classList.add('got'); Audio_.play('coin', 1 + k * .08); await W8(320); }
  Audio_.fadeTo(Audio_.lvl(.6), 1.5);
}

/* キーボード */
addEventListener('keydown', e => {
  if (!$('#modal').hidden) { if (e.key === 'Escape') closeModal(); return; }
  if ($('#play').hidden) { if (!$('#title').hidden && (e.key === 'Enter' || e.key === ' ')) $('#title').click(); return; }
  if (e.key === 'Escape') { G.paused ? resume() : pause(); return; }
  if (G.mode === 'calc' && /^[1-9]$/.test(e.key)) { const b = $('#track').children[+e.key - 1]; if (b) b.click(); }
  if (e.key === 'Enter' || e.key === ' ') { if (document.activeElement && document.activeElement.matches('.tile, .choice, .ztable button')) return; e.preventDefault(); doHammer(); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden && !$('#play').hidden && !G.done && !G.paused && $('#modal').hidden) pause(); });

startTitle();
})();
