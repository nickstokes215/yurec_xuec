import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const dir = "/workspace/scripts/press";
const outPress = "/workspace/public/press";
await mkdir(outPress, { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 900, height: 1272 }, deviceScaleFactor: 2 });

await page.goto("file://" + path.join(dir, "paper52.html"), { waitUntil: "networkidle" });
await page.waitForTimeout(900);
for (let i = 1; i <= 8; i++) {
  const el = page.locator("#p" + i);
  await el.screenshot({ path: path.join(outPress, `p52-${i}.jpg`), type: "jpeg", quality: 82 });
  console.log("press52", i);
}
await browser.close();
