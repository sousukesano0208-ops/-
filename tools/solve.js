const PARS={};
const E = require('../src/engine.js');
const { STAGES } = require('../src/stages.js');
const fr = v => v.d === 1 ? '' + v.n : v.n + '/' + v.d;
function str(items) {
  return items.map(t => (t.op || '') + (t.t === 'num' ? fr(t.v) : t.t === 'pow' ? t.base + '^' + t.exp :
    t.t === 'grp' ? '(' + str(t.items) + ')' + (t.exp ? '^' + t.exp : '') : t.t === 'seq' ? (t.sum?'U':'T')+'['+t.terms+';'+t.n+']' : 'S[' + t.from + ',' + t.to + ',' + JSON.stringify(t.f) + ']')).join(' ');
}
function groups(items, path, out) { out.push(path); items.forEach((t, k) => { if (t.items) groups(t.items, path.concat(k), out); }); return out; }
let unlocked = [];
STAGES.forEach((st, idx) => {
  if (st.tech) unlocked.push(st.tech);
  if (st.mode) return;
  const root = E.parse(st.q); E.normalize(root, true);
  const target = E.evalAll(root);
  const start = str(root);
  const seen = new Map([[start, null]]);
  let frontier = [{ root, path: [] }], found = null, depth = 0;
  while (frontier.length && !found && depth < 24) {
    const next = [];
    for (const node of frontier) {
      for (const gp of groups(node.root, [], [])) {
        const items = E.getGroup(node.root, gp);
        for (let i = 0; i < items.length; i++) for (let j = i; j < items.length; j++) {
          for (const act of ['hammer', ...unlocked]) {
            const r = JSON.parse(JSON.stringify(node.root));
            const res = act === 'hammer' ? E.hammer(r, { path: gp, i, j }) : E.applyTech(r, act, { path: gp, i, j });
            if (!res.ok) continue;
            const s = str(r);
            if (seen.has(s)) continue;
            seen.set(s, 1);
            const v = E.evalAll(r);
            if (v.n !== target.n || v.d !== target.d) { console.log('VALUE MISMATCH', idx + 1, act, str(node.root), '=>', s, fr(v), fr(target)); process.exit(1); }
            const nn = { root: r, path: node.path.concat(act + ':' + s) };
            if (E.isSolved(r)) { found = nn; break; }
            next.push(nn);
          }
          if (found) break;
        }
        if (found) break;
      }
      if (found) break;
    }
    frontier = next.slice(0, 40000); depth++;
  }
  PARS[idx]=found?found.path.length:-1; console.log(`#${idx + 1} ${st.q}  = ${fr(target)}  steps=${found ? found.path.length : 'NONE'} states=${seen.size}`);
  if (found && process.argv[2] == idx + 1) found.path.forEach(p => console.log('   ', p));
});

require('fs').writeFileSync('pars.json', JSON.stringify(PARS));
