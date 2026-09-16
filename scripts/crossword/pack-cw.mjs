function packOne(secret, words, rows, cols) {
  const W = words.slice();
  for (let i = W.length - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1));
    const t = W[i]; W[i] = W[k]; W[k] = t;
  }
  W.sort((a, b) => b.length - a.length);
  if (Math.random() < 0.5) {
    const x = W[0]; W[0] = W[1]; W[1] = x;
  }
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  const placed = [];
  function canPlace(word, r, c, dir) {
    if (r < 0 || c < 0) return false;
    if (dir === "across" && c + word.length > cols) return false;
    if (dir === "down" && r + word.length > rows) return false;
    let cross = 0;
    for (let i = 0; i < word.length; i++) {
      const rr = dir === "down" ? r + i : r;
      const cc = dir === "across" ? c + i : c;
      const ch = grid[rr][cc];
      if (ch && ch !== word[i]) return false;
      if (ch === word[i]) cross++;
    }
    if (placed.length && cross === 0) return false;
    return true;
  }
  function put(word, r, c, dir) {
    const undo = [];
    for (let i = 0; i < word.length; i++) {
      const rr = dir === "down" ? r + i : r;
      const cc = dir === "across" ? c + i : c;
      undo.push([rr, cc, grid[rr][cc]]);
      grid[rr][cc] = word[i];
    }
    return undo;
  }
  function revert(undo) { for (const [r, c, ch] of undo) grid[r][c] = ch; }

  const first = W[0];
  const fc = Math.max(0, Math.floor(Math.random() * Math.max(1, cols - first.length)));
  const fr = 2 + Math.floor(Math.random() * Math.max(1, rows - 8));
  put(first, fr, fc, "across");
  placed.push({ answer: first, r: fr, c: fc, dir: "across" });

  function slotsFor(word) {
    const out = [];
    for (const p of placed) {
      const other = p.dir === "across" ? "down" : "across";
      for (let i = 0; i < p.answer.length; i++) {
        for (let j = 0; j < word.length; j++) {
          if (p.answer[i] !== word[j]) continue;
          const r = p.dir === "across" ? p.r - j : p.r + i;
          const c = p.dir === "across" ? p.c + i : p.c - j;
          out.push({ r, c, dir: other });
        }
      }
    }
    for (let i = out.length - 1; i > 0; i--) {
      const k = Math.floor(Math.random() * (i + 1));
      const t = out[i]; out[i] = out[k]; out[k] = t;
    }
    return out;
  }
  let calls = 0;
  function rec(idx) {
    if (++calls > 8000) return false;
    if (idx >= W.length) return true;
    const word = W[idx];
    const slots = slotsFor(word).filter((s) => canPlace(word, s.r, s.c, s.dir));
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      const undo = put(word, s.r, s.c, s.dir);
      placed.push({ answer: word, r: s.r, c: s.c, dir: s.dir });
      if (rec(idx + 1)) return true;
      placed.pop();
      revert(undo);
    }
    return false;
  }
  if (!rec(1)) return null;
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c]) cells.push({ r, c, ch: grid[r][c] });
  const keys = [];
  const used = new Set();
  for (const ch of secret) {
    const hit = cells.find((x) => x.ch === ch && !used.has(x.r + "," + x.c));
    if (!hit) return null;
    used.add(hit.r + "," + hit.c);
    keys.push({ r: hit.r, c: hit.c });
  }
  placed.sort((a, b) => a.r - b.r || a.c - b.c);
  const seen = new Map();
  let n = 1;
  for (const p of placed) {
    const k = p.r + "," + p.c;
    if (!seen.has(k)) seen.set(k, n++);
    p.n = seen.get(k);
  }
  return { secret, rows, cols, keys, words: placed, grid };
}

const rest = [
  ["cw12", "ДИАБЕТ", ["КАПЕЛЬНИЦА", "БОЛЬНИЦА", "ДИАГНОЗ", "ИНСУЛИН", "ГЛЮКОЗА", "СПРАВКА", "ПАЛАТА", "ДИЕТА", "САХАР", "ХАЛАТ", "ТАПОК"]],
  ["cw15", "ГОСУСЛУГИ", ["УСЛУГА", "БЕЗЛИМИТ", "ОЧЕРЕДЬ", "КАБИНЕТ", "ПАРОЛЬ", "ПОРТАЛ", "ЛОГИН", "ГУДКИ", "ГОША", "КНОПКА", "ФЛАЙ"]],
];
for (const [name, secret, words] of rest) {
  let found = null;
  for (let drop = 0; drop <= 2 && !found; drop++) {
    const list = words.slice(0, words.length - drop);
    for (let i = 0; i < 400 && !found; i++) found = packOne(secret, list, 14, 14);
  }
  if (!found) { console.log(name, "FAIL"); continue; }
  console.log("===", name, found.words.length);
  console.log(found.grid.map((row) => row.map((ch) => ch || "·").join("")).join("\n"));
  console.log(JSON.stringify({ keys: found.keys, words: found.words.map((w) => ({ n: w.n, dir: w.dir, r: w.r, c: w.c, answer: w.answer })) }));
}
