/**
 * Слова-ключи в исходниках не хранятся.
 * Сверяем SHA-256(соль + ввод) с заранее посчитанными хешами.
 *
 * Это не банковский сейф: клиентское приложение всегда можно обойти.
 * Зато grep по репозиторию больше не выдаёт заветное слово одним взглядом.
 */

const SALT = "shotman.dvor.2021";

const HASH = {
  paid: "7230259e85191679f3a49e3733bb8832e4b55a6448e3878d81372241d19e6a14",
  dev: "d0e40de8149446e6c06f9e70e7e9cf8d32834ab6e842d5a3112fae0b151896ba",
  cheat: "6afa1fe1be0ed6d03d9821ea68ac1e53c55afad51a567d6942fd1912dfb7a900",
  sticky: "3f11fe3bb8da21265933dc605210cfd4b91a568c58f59886f0e62c80b976cb53",
  life: "f7d1db7622822a84084a78e935bf1ac486bb42e508200a7ac73b76d7be96dbf6",
} as const;

function utf8Bytes(s: string): Uint8Array {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else if (c >= 0xd800 && c <= 0xdbff) {
      const c2 = s.charCodeAt(++i);
      const cp = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
      out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
  }
  return new Uint8Array(out);
}

function sha256hex(message: string): string {
  const bytes = utf8Bytes(message);
  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  const bitLen = bytes.length * 8;
  const blockCount = Math.ceil((bytes.length + 1 + 8) / 64);
  const buf = new Uint8Array(blockCount * 64);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(buf.length - 8, Math.floor(bitLen / 0x100000000));
  view.setUint32(buf.length - 4, bitLen >>> 0);
  const W = new Uint32Array(64);
  const rr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  for (let i = 0; i < buf.length; i += 64) {
    for (let t = 0; t < 16; t++) W[t] = view.getUint32(i + t * 4);
    for (let t = 16; t < 64; t++) {
      const s0 = rr(W[t - 15], 7) ^ rr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
      const s1 = rr(W[t - 2], 17) ^ rr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }
    let a = H[0],
      b = H[1],
      c = H[2],
      d = H[3],
      e = H[4],
      f = H[5],
      g = H[6],
      h = H[7];
    for (let t = 0; t < 64; t++) {
      const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
      const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }
  let out = "";
  for (let i = 0; i < 8; i++) out += H[i].toString(16).padStart(8, "0");
  return out;
}

function digest(value: string): string {
  return sha256hex(SALT + "|" + value);
}

function trim(s: string): string {
  return String(s ?? "").trim();
}

function cheatNorm(s: string): string {
  return trim(s)
    .toLowerCase()
    .replace(/ё/g, "е");
}

export function matchPaid(input: string): boolean {
  return digest(trim(input)) === HASH.paid;
}

export function matchDev(input: string): boolean {
  return digest(trim(input)) === HASH.dev;
}

export function matchCheat(input: string): boolean {
  return digest(cheatNorm(input)) === HASH.cheat;
}

export function matchSticky(input: string): boolean {
  return digest(cheatNorm(input)) === HASH.sticky;
}

export function matchLife(input: string): boolean {
  return digest(cheatNorm(input)) === HASH.life;
}

export type YurecGateApi = {
  paid: (s: string) => boolean;
  dev: (s: string) => boolean;
  cheat: (s: string) => boolean;
  sticky: (s: string) => boolean;
  life: (s: string) => boolean;
};

declare global {
  interface Window {
    YurecGate?: YurecGateApi;
  }
}

if (typeof window !== "undefined") {
  window.YurecGate = {
    paid: matchPaid,
    dev: matchDev,
    cheat: matchCheat,
    sticky: matchSticky,
    life: matchLife,
  };
}

