/* ===== Σ計算エンジン ===== */
const Engine = (() => {
  // ---------- 有理数 ----------
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
  const F = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
  const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
  const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
  const mul = (a, b) => F(a.n * b.n, a.d * b.d);
  const div = (a, b) => (b.n === 0 ? null : F(a.n * b.d, a.d * b.n));
  const neg = a => F(-a.n, a.d);
  const isNeg = a => a.n < 0;
  const abs = a => F(Math.abs(a.n), a.d);
  const eq = (a, b) => a.n === b.n && a.d === b.d;
  const isZero = a => a.n === 0;
  const ipow = (b, e) => { let r = 1; for (let i = 0; i < e; i++) r *= b; return r; };

  // ---------- トークン ----------
  let uid = 1;
  const num = (op, v) => ({ id: uid++, t: 'num', op, v: typeof v === 'number' ? F(v) : v });
  const grp = (op, items, exp) => { const g = { id: uid++, t: 'grp', op, items }; if (exp) g.exp = exp; return g; };
  const sig = (op, from, to, f) => ({ id: uid++, t: 'sig', op, from, to, f });
  const pw = (op, base, exp) => ({ id: uid++, t: 'pow', op, base, exp });
  const poly = (c0, c1 = 0, c2 = 0, c3 = 0) => ({ kind: 'poly', c: [c0, c1, c2, c3] });
  const geoF = (a, r) => ({ kind: 'geo', a, r });
  const teleF = () => ({ kind: 'tele' });
  const genT = (op, f, n) => ({ id: uid++, t: 'gen', op, f, n });
  const seqT = (op, terms, n, sum) => ({ id: uid++, t: 'seq', op, terms: terms.slice(), n, sum: !!sum });
  // 数列の種類を調べる
  function seqInfo(terms) {
    const d = terms.slice(1).map((x, i) => x - terms[i]);
    if (d.every(x => x === d[0])) return { kind: 'arith', a: terms[0], d: d[0], diffs: d };
    const r = terms[0] !== 0 ? terms[1] / terms[0] : NaN;
    if (Number.isInteger(r) && r !== 0 && r !== 1 && terms.every((x, i) => i === 0 || x === terms[i - 1] * r)) return { kind: 'geo', a: terms[0], r, diffs: d };
    const b = seqInfo(d);
    return { kind: 'diff', a: terms[0], b, diffs: d };
  }
  function seqTermVal(info, n) {
    if (info.kind === 'arith') return info.a + (n - 1) * info.d;
    if (info.kind === 'geo') return info.a * ipow(info.r, n - 1);
    let v = info.a; for (let k = 1; k <= n - 1; k++) v += seqTermVal(info.b, k); return v;
  }

  const clone = x => JSON.parse(JSON.stringify(x));
  const reid = node => { if (Array.isArray(node)) node.forEach(reid); else if (node && typeof node === 'object') { if (node.t) node.id = uid++; if (node.items) reid(node.items); } return node; };

  // 数値トークン(num/pow)の値
  const valOf = tk => tk.t === 'num' ? tk.v : tk.t === 'pow' ? F(ipow(tk.base, tk.exp)) : null;

  // ---------- 簡易パーサ（ステージ定義用） ----------
  // 例: "33 +36 +39" , "( 33 +45 ) *5 /2" , "S(1,10,k) +S(1,5,2k^2-k)"
  function parse(src) {
    const toks = src.trim().split(/\s+/);
    let pos = 0;
    function parseList(endTok) {
      const out = [];
      while (pos < toks.length && toks[pos] !== endTok) {
        let s = toks[pos++];
        let op = null;
        if (/^[+\-*/]/.test(s) && out.length > 0) { op = s[0]; s = s.slice(1); }
        else if (/^[*/]/.test(s)) { op = s[0]; s = s.slice(1); }
        if (s === '' ) s = toks[pos++];
        if (s === '(') { out.push(grp(op, parseList(')'))); pos++; continue; }
        if (s.startsWith('S(')) { out.push(parseSig(op, s)); continue; }
        if (/^G\(/.test(s)) { const m = s.match(/^G\((.+);(\d+)\)$/); const sg = parseSig(null, 'S(1,1,' + m[1].replace(/n/g, 'k') + ')'); out.push(genT(op, sg.f, +m[2])); continue; }
        if (/^[TU]\(/.test(s)) { const m = s.match(/^([TU])\((.+);(\d+)\)$/); out.push(seqT(op, m[2].split(',').map(Number), +m[3], m[1] === 'U')); continue; }
        if (/^-?\d+\.\d+$/.test(s)) { const k = s.split('.')[1].length; const t = num(op, F(Math.round(parseFloat(s) * ipow(10, k)), ipow(10, k))); t.dec = true; out.push(t); continue; }
        if (s.includes('^')) { const [b, e] = s.split('^').map(Number); out.push(pw(op, b, e)); continue; }
        if (s.includes('/')) { const [a, b] = s.split('/').map(Number); out.push(num(op, F(a, b))); continue; }
        out.push(num(op, Number(s)));
      }
      return out;
    }
    return parseList(null);
  }
  function parseSig(op, s) {
    const m = s.match(/^S\((\d+),(\d+),(.+)\)$/);
    const from = +m[1], to = +m[2], e = m[3];
    if (e === 'tele') return sig(op, from, to, teleF());
    let g = e.match(/^geo:(-?\d+):(\d+)$/);
    if (g) return sig(op, from, to, geoF(+g[1], +g[2]));
    // 多項式 例 2k^2-k+3
    const c = [0, 0, 0, 0];
    e.replace(/-/g, '+-').split('+').filter(Boolean).forEach(term => {
      let mm = term.match(/^(-?\d*)k(\^(\d))?$/);
      if (mm) { const co = mm[1] === '' ? 1 : mm[1] === '-' ? -1 : +mm[1]; c[mm[3] ? +mm[3] : 1] += co; }
      else c[0] += +term;
    });
    return sig(op, from, to, poly(...c));
  }

  // ---------- 評価（優先順位あり） ----------
  // tokens: 数値トークン列（先頭のopは sign として扱う）
  function evalFlat(tokens, firstSign = 1) {
    let total = F(0), term = null;
    for (let i = 0; i < tokens.length; i++) {
      const tk = tokens[i]; const v = valOf(tk); if (!v) return null;
      const op = i === 0 ? (firstSign < 0 ? '-' : '+') : tk.op;
      if (op === '+' || op === '-' || op === null) {
        if (term) total = add(total, term);
        term = op === '-' ? neg(v) : v;
      } else if (op === '*') term = mul(term, v);
      else if (op === '/') { term = div(term, v); if (!term) return null; }
    }
    return add(total, term);
  }
  // 完全評価（デバッグ・検証用）
  function evalAll(items) {
    const vals = items.map(tk => {
      if (tk.t === 'num' || tk.t === 'pow') return { op: tk.op, v: valOf(tk) };
      if (tk.t === 'grp') { let v = evalAll(tk.items); if (tk.exp) v = F(ipow(v.n, tk.exp), ipow(v.d, tk.exp)); return { op: tk.op, v }; }
      if (tk.t === 'sig') return { op: tk.op, v: sigVal(tk) };
      if (tk.t === 'gen') { const n = tk.n, f = tk.f; const v = f.kind === 'poly' ? f.c[0] + f.c[1] * n + f.c[2] * n * n + f.c[3] * n * n * n : f.a * ipow(f.r, n - 1); return { op: tk.op, v: F(v) }; }
      if (tk.t === 'seq') { const inf = seqInfo(tk.terms); let v = 0; if (tk.sum) { for (let k = 1; k <= tk.n; k++) v += seqTermVal(inf, k); } else v = seqTermVal(inf, tk.n); return { op: tk.op, v: F(v) }; }
    });
    return evalFlat(vals.map(x => ({ t: 'num', op: x.op, v: x.v })));
  }
  function sigVal(s) {
    let t = F(0);
    for (let k = s.from; k <= s.to; k++) {
      if (s.f.kind === 'poly') t = add(t, F(s.f.c[0] + s.f.c[1] * k + s.f.c[2] * k * k + s.f.c[3] * k * k * k));
      else if (s.f.kind === 'geo') t = add(t, F(s.f.a * ipow(s.f.r, k - 1)));
      else t = add(t, F(1, k * (k + 1)));
    }
    return t;
  }

  // ---------- 選択の妥当性（演算の優先順位） ----------
  const isAdd = op => op === '+' || op === '-';
  const isMul = op => op === '*' || op === '/';
  function precedenceOK(items, i, j) {
    const inner = items.slice(i + 1, j + 1).map(t => t.op);
    const hasAdd = inner.some(isAdd);
    const before = items[i].op, after = items[j + 1] ? items[j + 1].op : null;
    if (hasAdd) {
      if (isMul(before)) return false;
      if (isMul(after)) return false;
    }
    return true;
  }

  // ---------- 符号の正規化・括弧の自動解除 ----------
  function combineOp(op, tk) {
    // tk.op は null 前提。tk が負の数なら符号を吸収
    if (tk.t === 'num' && isNeg(tk.v) && (op === '+' || op === '-')) {
      return Object.assign(tk, { op: op === '+' ? '-' : '+', v: abs(tk.v) });
    }
    tk.op = op; return tk;
  }
  function normalize(items, isRoot) {
    for (let k = 0; k < items.length; k++) {
      let tk = items[k];
      if (tk.t === 'grp') {
        normalize(tk.items, false);
        if (tk.items.length === 1) {
          const inner = tk.items[0];
          if (tk.exp) {
            if (inner.t === 'num' && inner.v.d === 1) { items[k] = pw(tk.op, inner.v.n, tk.exp); }
          } else {
            inner.op = null; // 先頭なので null
            items[k] = combineOp(tk.op, inner);
          }
        } else if (tk.items.length > 1 && !tk.exp) {
          // 括弧の中が掛け算・割り算だけで、外側が + か先頭なら括弧を外せる
          const innerAllMul = tk.items.slice(1).every(t => isMul(t.op));
          const after = items[k + 1] ? items[k + 1].op : null;
          if (innerAllMul && (tk.op === null || tk.op === '+' || (tk.op === '-' && false)) ) {
            const lifted = tk.items; lifted[0] = combineOp(tk.op, Object.assign(lifted[0], { op: null }));
            items.splice(k, 1, ...lifted); k += lifted.length - 1; continue;
          }
          const innerAllAdd = tk.items.slice(1).every(t => isAdd(t.op));
          if (innerAllAdd && (tk.op === null || tk.op === '+') && !isMul(after)) {
            const lifted = tk.items; lifted[0] = combineOp(tk.op, Object.assign(lifted[0], { op: null }));
            items.splice(k, 1, ...lifted); k += lifted.length - 1; continue;
          }
        }
      }
      tk = items[k];
      if (tk.t === 'num') {
        if (tk.op === '+' && isNeg(tk.v)) { tk.op = '-'; tk.v = abs(tk.v); }
        else if (tk.op === '-' && isNeg(tk.v)) { tk.op = '+'; tk.v = abs(tk.v); }
      }
    }
    if (items.length && items[0].op !== null) {
      const f = items[0];
      if (f.op === '-' && f.t === 'num') { f.v = neg(f.v); f.op = null; }
      else if (f.op === '+') f.op = null;
    }
    return items;
  }

  // ---------- パス操作 ----------
  function getGroup(root, path) { let g = root; for (const p of path) g = g[p].items; return g; }

  // 置換: items[i..j] を式 E（先頭op null）で置き換える
  function spliceExpr(items, i, j, E) {
    const before = items[i].op, after = items[j + 1] ? items[j + 1].op : null;
    const hasTopAdd = E.slice(1).some(t => isAdd(t.op));
    let canSplice;
    if (!hasTopAdd) canSplice = before !== '/' && !(before === '-' && false);
    else canSplice = (before === null || before === '+') && !isMul(after);
    if (!hasTopAdd && before === '-') canSplice = true;
    if (canSplice) {
      E[0] = combineOp(before, Object.assign(E[0], { op: null }));
      if (i === 0 && E[0].op === '+') E[0].op = null;
      items.splice(i, j - i + 1, ...E);
    } else {
      items.splice(i, j - i + 1, grp(before, E));
    }
  }

  // ---------- ハンマー（計算） ----------
  function hammer(root, sel) {
    const items = getGroup(root, sel.path);
    const { i, j } = sel;
    const part = items.slice(i, j + 1);
    if (!part.every(t => t.t === 'num' || t.t === 'pow')) return { ok: false, msg: 'Σや括弧が残っている部分は計算できない' };
    if (part.length === 1 && part[0].t !== 'pow') return { ok: false, msg: 'となり合う2つのタイルを選んでね' };
    if (part.length > 2) return { ok: false, msg: 'ハンマーは1回に1つの計算だけ（2タイルまで）' };
    if (!precedenceOK(items, i, j)) return { ok: false, msg: '×・÷ が優先！ その順番では計算できない' };
    const before = items[i].op;
    let tok;
    if (before === null || isAdd(before)) {
      const v = evalFlat(part, before === '-' ? -1 : 1);
      if (!v) return { ok: false, msg: '0では割れない' };
      tok = num(before === null ? null : (isNeg(v) ? '-' : '+'), before === null ? v : abs(v));
    } else {
      // × か ÷ で始まる連続した掛け算
      let m = F(1);
      for (const t of part) { const v = valOf(t); m = t.op === '*' ? mul(m, v) : div(m, v); if (!m) return { ok: false, msg: '0では割れない' }; }
      // m は「掛ける量」
      if (m.n === 0) tok = num('*', F(0));
      else if (m.d === 1 || m.n === 1 && false) tok = num('*', m);
      else if (m.n === 1) tok = num('/', F(m.d));
      else tok = num('*', m);
    }
    if (part.some(t => t.dec)) tok.dec = true;
    items.splice(i, j - i + 1, tok);
    normalize(root, true);
    return { ok: true, newIds: [tok.id] };
  }

  // ---------- 技 ----------
  const TECHS = [
    { key: 'dainyu', name: 'ダイニュウ', formula: 'aₙ の n に番号を入れる',
      when: '「aₙ = 3n＋1 の第5項」のように、一般項（aₙ の式）がわかっていて、何番目かの項を求めたいとき。',
      how: '式の n に、求めたい番号（第5項なら 5）をそのまま入れる。',
      why: 'aₙ は「第 n 項」という意味。n＝5 を入れたものが第5項 a₅ になる。一般項は「何番目でも計算できる公式」。',
      use: ["「aₙ = ◯ の第n項」のタイルをタップ", "ダイニュウ を押す → n に番号が入った式に変わる", "×（累乗）→ ＋ の順にハンマーで計算"],
      ex: ['aₙ = 3n＋1 の第5項', '3×5＋1', '＝ 16'] },
    { key: 'toosa', name: 'トウサ', formula: '第n項 → 最初＋(n−1)×差',
      when: '「◯, ◯, ◯, … の第n項」のタイルで、となり同士の差がぜんぶ同じとき（等差数列）。',
      how: '第n項を「最初の数＋(n−1)×差」に変える。',
      why: '第1項から第n項までは、差を (n−1) 回足せばたどり着く。第1項にはまだ1回も足していないので n ではなく n−1。',
      use: ["「◯, ◯, … の第n項」のタイルをタップ", "トウサ を押す → 「最初＋(n−1)×差」に変わる", "(n−1) → 掛け算 → 足し算 の順にハンマーで計算"],
      ex: ['3, 7, 11, 15, … の第10項', '3＋(10−1)×4', '＝ 3＋36 ＝ 39'] },
    { key: 'gauss', name: 'ガウス', formula: '(最初＋最後)×個数÷2',
      when: '＋でつながった数が同じ数ずつ増えているとき（例：3＋5＋7＋9）。または「◯, ◯, … の第1〜n項の和」のタイルが等差数列のとき。',
      how: '並んだ数をまとめて「(最初の数＋最後の数)×個数÷2」に変える。',
      why: '最初と最後、2番目と最後から2番目…とペアにすると、どのペアも合計が同じになる。ペアは「個数÷2」組できる。',
      use: ["並んだ数をはしからはしまで全部選ぶ（「和」のタイルなら1つタップ）", "ガウス を押す → 「(最初＋最後)×個数÷2」に変わる", "カッコの中 → ×個数 → ÷2 の順にハンマーで計算"],
      ex: ['3＋5＋7＋9', '(3＋9)×4÷2', '12×4÷2 ＝ 24'] },
    { key: 'toohi', name: 'トウヒ', formula: '第n項 → 最初×倍率^(n−1)',
      when: '「◯, ◯, ◯, … の第n項」のタイルで、となり同士が同じ数ずつ掛けて増えているとき（等比数列）。',
      how: '第n項を「最初の数×倍率の(n−1)乗」に変える。',
      why: '第1項から第n項までは、倍率を (n−1) 回掛ければたどり着く。等差の「足す」が「掛ける」に変わっただけ。',
      use: ["「◯, ◯, … の第n項」のタイルをタップ", "トウヒ を押す → 「最初×倍率ⁿ⁻¹」に変わる", "「最初」と「倍率ⁿ⁻¹」の2つを選んでハンマー（累乗もいっしょに計算される）"],
      ex: ['2, 6, 18, … の第6項（3倍ずつ）', '2×3⁵', '＝ 2×243 ＝ 486'] },
    { key: 'geo', name: 'ジオメトリ', formula: '最初×(倍率^個数 − 1)÷(倍率 − 1)',
      when: '＋でつながった数が、同じ数ずつ「掛けて」増えているとき。（例：3, 6, 12, 24 は 2 倍ずつ）「第1〜n項の和」のタイルや、Σの右が 5·2ᵏ⁻¹ の形のときも使える。',
      how: '「最初の数×(倍率の個数乗 − 1)÷(倍率 − 1)」に変える。倍率が 2 なら ÷(2−1) は ÷1 なので省略する。',
      why: 'S＝3＋6＋12＋24 と、全体を2倍した 2S＝6＋12＋24＋48 を並べて引くと、真ん中が全部消えて S＝48−3 だけが残る。これを式にしたもの。',
      use: ["並んだ数を全部選ぶ（「和」のタイルやΣのタイルなら1つタップ）", "ジオメトリ を押す → 「最初×(倍率ⁿ−1)÷(倍率−1)」に変わる", "カッコの中（倍率ⁿ − 1）→ 掛け算 → 割り算 の順にハンマー"],
      ex: ['3＋6＋12＋24（2倍ずつ・4個）', '3×(2⁴ − 1)', '＝ 3×15 ＝ 45'] },
    { key: 'sk', name: 'シグマワン', formula: 'Σk → n×(n＋1)÷2',
      when: 'Σの右が k だけで、Σの下が k=1 のとき。',
      how: 'Σk を「n×(n＋1)÷2」に変える。n はΣの上に書いてある数。',
      why: 'Σk は「k に 1, 2, 3, …, n を入れて全部足す」という意味。つまり 1＋2＋…＋n。これをガウスと同じ考え方で一気に計算する。',
      use: ["Σk のタイルをタップ", "シグマワン を押す → 「n×(n＋1)÷2」に変わる", "(n＋1) → n×(n＋1) → ÷2 の順にハンマー"],
      ex: ['Σ（k=1〜10）k　＝ 1＋2＋…＋10', '10×(10＋1)÷2', '＝ 55'] },
    { key: 'split', name: 'スプリット', formula: 'Σ(2k＋1) → 2×Σk ＋ 1×個数',
      when: 'Σの右が「2k＋1」「k²−k」のように、いくつかの部分がくっついているとき。',
      how: '部分ごとに別々のΣに分ける。k の前の数（2k なら 2）はΣの外に出して「2×Σk」にする。数字だけの部分（＋1 など）は「その数×個数」になる。',
      why: 'Σ(2k＋1) ＝ (2＋1)＋(4＋1)＋(6＋1)＋…。「2, 4, 6, …」だけ集めると 2×(1＋2＋3＋…)、「＋1」だけ集めると 1 が個数ぶんある。',
      use: ["Σ(2k＋1) のような、中身がくっついたΣのタイルをタップ", "スプリット を押す → 「2×Σk ＋ 1×10」のように分かれる", "分かれた Σk・Σk² などに、シグマワン・ツー・スリーを使う"],
      ex: ['Σ（k=1〜10）(2k＋1)', '2×Σk ＋ 1×10', 'Σk はシグマワンで計算'] },
    { key: 'sk2', name: 'シグマツー', formula: 'Σk² → n×(n＋1)×(2n＋1)÷6',
      when: 'Σの右が k² だけで、Σの下が k=1 のとき。',
      how: 'Σk² を「n×(n＋1)×(2n＋1)÷6」に変える。n はΣの上の数。',
      why: 'Σk² は 1²＋2²＋3²＋…＋n²（1＋4＋9＋…）のこと。この足し算の答えは必ずこの式になる。教科書の公式そのもの。',
      use: ["Σk² のタイルをタップ", "シグマツー を押す → 「n×(n＋1)×(2n＋1)÷6」に変わる", "カッコを1つずつハンマーで計算して、最後に ÷6"],
      ex: ['Σ（k=1〜6）k²　＝ 1＋4＋9＋16＋25＋36', '6×(6＋1)×(2×6＋1)÷6', '＝ 6×7×13÷6 ＝ 91'] },
    { key: 'sk3', name: 'シグマスリー', formula: 'Σk³ → {n×(n＋1)÷2}²',
      when: 'Σの右が k³ だけで、Σの下が k=1 のとき。',
      how: 'Σk³ を「{n×(n＋1)÷2}²」に変える。カッコの中はシグマワンと同じ式。',
      why: '1³＋2³＋…＋n³ は、1＋2＋…＋n の答えを2乗したものと同じになる。だからシグマワンの式を2乗するだけ。',
      use: ["Σk³ のタイルをタップ", "シグマスリー を押す → 「{n×(n＋1)÷2}²」に変わる", "カッコの中を計算すると ◯² になる → それを選んでハンマー"],
      ex: ['Σ（k=1〜5）k³　＝ 1＋8＋27＋64＋125', '{5×(5＋1)÷2}²', '＝ 15² ＝ 225'] },
    { key: 'kaisa', name: 'カイサ', formula: 'aₙ → a₁＋Σ(k=1〜n−1) bₖ',
      when: '「◯, ◯, ◯, … の第n項」のタイルで、差も比もそろっていないとき。となり同士の差（階差）を並べると、等差か等比になっている。',
      how: '第n項を「最初の数＋Σ（k=1〜n−1）階差」に変える。階差の一般項 bₖ は自動で見つけてΣの中に入れる。',
      why: '第1項に、階差を1つ目から (n−1) 個目まで全部足すと第n項になる。足すのは n−1 個なので、Σの上は n−1。',
      use: ["「◯, ◯, … の第n項」のタイルをタップ", "カイサ を押す → 「最初＋Σ(k=1〜n−1)(階差)」に変わる", "できたΣに スプリット → シグマワン など第3章の技を使う"],
      ex: ['1, 2, 5, 10, 17, … の第10項（差は 1, 3, 5, 7 …）', '1＋Σ（k=1〜9）(2k−1)', '→ スプリットとシグマワンで計算'] },
  ];

  function applyTech(root, key, sel) {
    const items = getGroup(root, sel.path);
    const { i, j } = sel;
    const part = items.slice(i, j + 1);
    const fail = msg => ({ ok: false, msg });
    let E = null;
    const single = part.length === 1 ? part[0] : null;

    if (key === 'dainyu') {
      if (!single || single.t !== 'gen') return fail('「aₙ = ◯ の第n項」のタイルを1つ選んでね');
      const f = single.f, n = single.n; E = [];
      if (f.kind === 'geo') { if (f.a !== 1) E.push(num(null, f.a)); E.push(pw(E.length ? '*' : null, f.r, n - 1)); }
      else for (let p = 3; p >= 0; p--) {
        const a = f.c[p]; if (!a) continue;
        const first = E.length === 0, op = first ? null : (a > 0 ? '+' : '-'), A = first ? a : Math.abs(a);
        if (p === 0) E.push(num(op, A));
        else if (p === 1) { if (A === 1 && !(first && a < 0)) E.push(num(op, n)); else { E.push(num(op, A)); E.push(num('*', n)); } }
        else { if (A === 1 && !(first && a < 0)) E.push(pw(op, n, p)); else { E.push(num(op, A)); E.push(pw('*', n, p)); } }
      }
      spliceExpr(items, i, j, E); signOnly(root);
      const idsD = []; E.forEach(t => idsD.push(t.id));
      return { ok: true, newIds: idsD };
    }
    if (single && single.t === 'gen') return fail('一般項のタイルは ダイニュウ（n に数を入れる）で！');
    if (single && single.t === 'seq') {
      const q = single, inf = seqInfo(q.terms), n = q.n, a0 = q.terms[0];
      const dl = inf.diffs.join(', ');
      if (key === 'toosa' || key === 'toohi' || key === 'kaisa') {
        if (q.sum) return fail('これは「和」のタイル。和は ガウス か ジオメトリ で！');
        if (key === 'toosa') {
          if (inf.kind !== 'arith') return fail(`差が ${dl} でそろっていない。等差数列じゃない`);
          E = [num(null, a0), grp('+', [num(null, n), num('-', 1)]), num('*', inf.d)];
        } else if (key === 'toohi') {
          if (inf.kind !== 'geo') return fail(inf.kind === 'arith' ? '差がそろっている＝等差数列。トウサを使おう' : '比がそろっていない。等比数列じゃない');
          E = [num(null, a0), pw('*', inf.r, n - 1)];
        } else {
          if (inf.kind === 'arith') return fail('差がそろっている＝等差数列。トウサで一発！');
          if (inf.kind === 'geo') return fail('比がそろっている＝等比数列。トウヒで一発！');
          const b = inf.b;
          if (b.kind === 'diff') return fail('階差も規則的じゃない…');
          const f = b.kind === 'arith' ? poly(b.a - b.d, b.d) : geoF(b.a, b.r);
          E = [num(null, a0), sig('+', 1, n - 1, f)];
        }
      } else if (key === 'gauss') {
        if (!q.sum) return fail('これは「第n項」のタイル。第n項は トウサ で！');
        if (inf.kind !== 'arith') return fail(`差が ${dl} でそろっていない。等差数列じゃない`);
        E = [grp(null, [num(null, a0), seqT('+', q.terms, n, false)]), num('*', n), num('/', 2)];
      } else if (key === 'geo') {
        if (!q.sum) return fail('これは「第n項」のタイル。第n項は トウヒ で！');
        if (inf.kind !== 'geo') return fail('比がそろっていない。等比数列じゃない');
        E = geoExpr(a0, inf.r, n);
      } else return fail('数列のタイルには トウサ・トウヒ・カイサ・ガウス・ジオメトリ を使おう');
      spliceExpr(items, i, j, E); signOnly(root);
      const ids0 = []; (function walk(x) { x.forEach(t => { ids0.push(t.id); if (t.items) walk(t.items); }); })(E);
      return { ok: true, newIds: ids0 };
    }
    if (key === 'toosa' || key === 'toohi' || key === 'kaisa') return fail('「◯, ◯, … の第n項」のタイルを選んでね');

    if (key === 'gauss' || (key === 'geo' && !(single && single.t === 'sig'))) {
      if (part.length < 3) return fail('3つ以上の数を選んでね');
      if (!part.every(t => t.t === 'num' && t.v.d === 1)) return fail('整数のタイルだけを選んでね');
      if (!part.slice(1).every(t => t.op === '+')) return fail('＋でつながった数だけに使える');
      if (!(items[i].op === null || items[i].op === '+')) return fail('先頭の符号に注意');
      if (!precedenceOK(items, i, j)) return fail('×・÷ が隣にあるので使えない');
      const v = part.map(t => t.v.n);
      if (key === 'gauss') {
        const d = v[1] - v[0];
        if (!v.every((x, k) => k === 0 || x - v[k - 1] === d)) return fail('等差数列になっていない（差がそろっていない）');
        E = [grp(null, [num(null, v[0]), num('+', v[v.length - 1])]), num('*', v.length), num('/', 2)];
      } else {
        if (v[0] === 0) return fail('等比数列になっていない');
        const r = v[1] / v[0];
        if (!Number.isInteger(r) || r === 1 || r === 0) return fail('等比数列になっていない（比がそろっていない）');
        if (!v.every((x, k) => k === 0 || x === v[k - 1] * r)) return fail('等比数列になっていない（比がそろっていない）');
        E = geoExpr(v[0], r, v.length);
      }
    } else {
      if (!single || single.t !== 'sig') return fail('Σのタイルを1つだけ選んでね');
      const s = single, f = s.f, n = s.to;
      if (key === 'shift') {
        if (s.from === 1) return fail('もう k=1 から始まっている');
        E = [sig(null, 1, s.to, clone(f)), sig('-', 1, s.from - 1, clone(f))];
      } else if (key === 'split') {
        if (f.kind !== 'poly') return fail('多項式のΣにだけ使える');
        const c = f.c, nz = c.filter(x => x !== 0).length;
        const monic1 = nz === 1 && c[0] === 0 && c.slice(1).some(x => x === 1);
        if (monic1) return fail('これ以上バラせない。公式の技を使おう');
        E = [];
        for (let p = 3; p >= 0; p--) {
          const a = c[p]; if (!a) continue;
          const first = E.length === 0;
          const op = first ? null : (a > 0 ? '+' : '-');
          const A = first ? a : Math.abs(a);
          if (p > 0) {
            const S = sig(null, s.from, s.to, poly(...[0, 1, 2, 3].map(q => q === p ? 1 : 0)));
            if (A === 1 && !(first && a < 0)) { S.op = op; E.push(S); }
            else { E.push(num(op, A)); S.op = '*'; E.push(S); }
          } else {
            E.push(num(op, A));
            if (s.from === 1) E.push(num('*', s.to));
            else E.push(grp('*', [num(null, s.to), num('-', s.from), num('+', 1)]));
          }
        }
      } else if (key === 'sk' || key === 'sk2' || key === 'sk3') {
        if (f.kind !== 'poly') return fail('この形のΣには使えない');
        const p = key === 'sk' ? 1 : key === 'sk2' ? 2 : 3;
        const want = [0, 0, 0, 0]; want[p] = 1;
        if (!f.c.every((x, q) => x === want[q])) {
          const nz = f.c.filter(x => x !== 0).length;
          if (nz > 1 || f.c[p] !== 1) return fail('まずスプリットでΣをバラそう');
          return fail('このΣは k' + (f.c[1] ? '' : f.c[2] ? '²' : '³') + ' の和。別の公式を使おう');
        }
        if (s.from !== 1) return fail('k=1 から始まっていない。まずシフト！');
        if (p === 1) E = [num(null, n), grp('*', [num(null, n), num('+', 1)]), num('/', 2)];
        if (p === 2) E = [num(null, n), grp('*', [num(null, n), num('+', 1)]), grp('*', [num(null, 2), num('*', n), num('+', 1)]), num('/', 6)];
        if (p === 3) E = [grp(null, [num(null, n), grp('*', [num(null, n), num('+', 1)]), num('/', 2)], 2)];
      } else if (key === 'geo') {
        if (f.kind !== 'geo') return fail('等比数列のΣにだけ使える');
        if (s.from !== 1) return fail('k=1 から始まっていない。まずシフト！');
        E = geoExpr(f.a, f.r, n);
      } else if (key === 'tele') {
        if (f.kind !== 'tele') return fail('1/k(k+1) の形のΣにだけ使える');
        E = s.from === 1
          ? [num(null, 1), num('-', 1), grp('/', [num(null, n), num('+', 1)])]
          : [num(null, 1), num('/', s.from), num('-', 1), grp('/', [num(null, n), num('+', 1)])];
      } else return fail('この技は使えない');
    }
    spliceExpr(items, i, j, E);
    // 技で作った直後は括弧の自動解除をしない（見せるため）→ 符号だけ整える
    signOnly(root);
    const ids = []; (function walk(a) { a.forEach(t => { ids.push(t.id); if (t.items) walk(t.items); }); })(E);
    return { ok: true, newIds: ids };
  }
  function geoExpr(a, r, n) {
    const E = [num(null, a), grp('*', [pw(null, r, n), num('-', 1)])];
    if (r !== 2) E.push(grp('/', [num(null, r), num('-', 1)]));
    return E;
  }
  function signOnly(items) {
    items.forEach((tk, k) => {
      if (tk.items) signOnly(tk.items);
      if (tk.t === 'num') {
        if (tk.op === '+' && isNeg(tk.v)) { tk.op = '-'; tk.v = abs(tk.v); }
        else if (tk.op === '-' && isNeg(tk.v)) { tk.op = '+'; tk.v = abs(tk.v); }
      }
    });
    if (items.length && items[0].op === '+') items[0].op = null;
  }

  const markDec = items => { items.forEach(t => { if (t.t === 'num') t.dec = true; if (t.items) markDec(t.items); }); return items; };
  const isSolved = root => root.length === 1 && root[0].t === 'num' && root[0].op === null;

  return { markDec, seqInfo, F, parse, hammer, applyTech, normalize, evalAll, isSolved, TECHS, clone, reid, precedenceOK, getGroup, valOf, ipow };
})();
if (typeof module !== 'undefined') module.exports = Engine;
