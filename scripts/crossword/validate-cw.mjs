import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("src/data/crossword.json", "utf8"));

function validate(p) {
  const g = Array.from({ length: p.rows }, () => Array(p.cols).fill(null));
  const err = [];
  for (const w of p.words) {
    if (!w.answer || !w.clue) err.push("empty " + w.n);
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.dir === "down" ? w.r + i : w.r;
      const c = w.dir === "across" ? w.c + i : w.c;
      if (r < 0 || c < 0 || r >= p.rows || c >= p.cols) {
        err.push(`${w.answer} OOB ${r},${c}`);
        continue;
      }
      const ch = w.answer[i];
      if (g[r][c] && g[r][c] !== ch) err.push(`${w.answer} clash ${r},${c} ${g[r][c]} vs ${ch}`);
      g[r][c] = ch;
    }
  }
  for (const k of p.keys) {
    if (!g[k.r]?.[k.c]) err.push("key empty " + k.r + "," + k.c);
  }
  const got = p.keys.map((k) => g[k.r][k.c]).slice().sort().join("");
  const need = p.secret.split("").slice().sort().join("");
  if (got !== need) err.push("keys " + got + " != " + need);
  if (p.keys.length !== p.secret.length) err.push("key count");
  const isolated = p.words.filter((w) => {
    return !p.words.some((o) => o !== w && shares(w, o));
  });
  if (isolated.length) err.push("isolated " + isolated.map((w) => w.answer).join(","));
  return { err, g };
}
function shares(a, b) {
  const cells = (w) => {
    const s = new Set();
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.dir === "down" ? w.r + i : w.r;
      const c = w.dir === "across" ? w.c + i : w.c;
      s.add(r + "," + c);
    }
    return s;
  };
  const A = cells(a), B = cells(b);
  for (const x of A) if (B.has(x)) return true;
  return false;
}

let fails = 0;
for (const p of data) {
  const { err, g } = validate(p);
  const lines = g.map((row) => row.map((ch) => ch || "·").join(""));
  if (err.length) {
    fails++;
    console.log("FAIL", p.id, p.secret, err.join(" | "));
  } else {
    console.log("OK", p.id, p.secret, p.words.length + "w", p.rows + "x" + p.cols);
  }
  if (p.id.startsWith("crossword-1") && Number(p.id.split("-")[1]) >= 11) console.log(lines.join("\n"));
}
if (fails) process.exit(1);
console.log("all", data.length);
