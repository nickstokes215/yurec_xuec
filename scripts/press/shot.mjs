import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const dir = "/workspace/scripts/press";
const outPress = "/workspace/public/press";
const outCalls = "/workspace/public/calls";
await mkdir(outPress, { recursive: true });
await mkdir(outCalls, { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 900, height: 1272 }, deviceScaleFactor: 2 });

await page.goto("file://" + path.join(dir, "paper.html"), { waitUntil: "networkidle" });
await page.waitForTimeout(800);
for (let i = 1; i <= 8; i++) {
  const el = page.locator("#p" + i);
  await el.screenshot({ path: path.join(outPress, `p${i}.jpg`), type: "jpeg", quality: 82 });
  console.log("press", i);
}

await page.goto("file://" + path.join(dir, "call.html"), { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.locator("#c1").screenshot({ path: path.join(outCalls, "c1.jpg"), type: "jpeg", quality: 82 });
console.log("call 1");
await browser.close();
