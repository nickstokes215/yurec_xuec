import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import test from "node:test";
import assert from "node:assert/strict";

const code = readFileSync(new URL("../public/game/secret-gate.js", import.meta.url), "utf8");
const sandbox = { window: {} };
sandbox.window = sandbox;
runInContext(code, createContext(sandbox));
const Gate = sandbox.YurecGate;

test("затвор грузится и чужие слова не проходят", () => {
  assert.equal(typeof Gate.paid, "function");
  assert.equal(typeof Gate.dev, "function");
  assert.equal(typeof Gate.cheat, "function");
  assert.equal(Gate.paid(""), false);
  assert.equal(Gate.paid("xyz"), false);
  assert.equal(Gate.dev("nope"), false);
  assert.equal(Gate.cheat("нет"), false);
  assert.equal(Gate.sticky("нет"), false);
  assert.equal(Gate.life("нет"), false);
});

test("в файле нет открытых констант-паролей", () => {
  assert.equal(/PAID_PASS|DEV_PASS|CHEAT\s*=/.test(code), false);
  assert.equal(code.includes("shotman.dvor.2021"), true);
});
