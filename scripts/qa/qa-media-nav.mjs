import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("/tmp/qa-screenshots", { recursive: true });
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(25000);

function navLabels(locator) {
  return locator.evaluateAll((els) =>
    els.map((el) => (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim()),
  );
}

await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const homeNav = await navLabels(page.locator("nav a"));
const homeSub = await page.locator('nav[aria-label="Разделы медиа"]').count();
console.log("HOME NAV", homeNav);
console.log("HOME SUBNAV COUNT", homeSub);

await page.getByRole("link", { name: "Медиа" }).click();
await page.waitForTimeout(500);
console.log("HUB URL", page.url());
const hubSub = await navLabels(page.locator('nav[aria-label="Разделы медиа"] a'));
console.log("HUB SUBNAV", hubSub);
await page.screenshot({ path: "/tmp/qa-screenshots/media-hub-now.png" });

await page.getByRole("link", { name: "Видео", exact: true }).click();
await page.waitForTimeout(600);
console.log("VIDEO URL", page.url());
const videoH2 = await page.locator("h2").first().textContent();
console.log("VIDEO H2", videoH2);
await page.evaluate(() => window.scrollTo(0, 1200));
await page.waitForTimeout(200);
const y1 = await page.evaluate(() => window.scrollY);
console.log("VIDEO SCROLLED", y1);
await page.screenshot({ path: "/tmp/qa-screenshots/media-video-scrolled.png" });

await page.getByRole("link", { name: "Shorts" }).click();
await page.waitForTimeout(600);
console.log("SHORTS URL", page.url());
const shortsH2 = await page.locator("h2").first().textContent();
console.log("SHORTS H2", shortsH2);
await page.evaluate(() => window.scrollTo(0, 700));
await page.waitForTimeout(200);
const shortsY = await page.evaluate(() => window.scrollY);
console.log("SHORTS SCROLLED", shortsY);

await page.getByRole("link", { name: "Видео", exact: true }).click();
await page.waitForTimeout(700);
const yRestore = await page.evaluate(() => window.scrollY);
console.log("VIDEO RESTORED", yRestore);

await page.getByRole("link", { name: "Видео", exact: true }).click();
await page.waitForTimeout(700);
const yTop = await page.evaluate(() => window.scrollY);
console.log("VIDEO REPEAT TOP", yTop);
await page.screenshot({ path: "/tmp/qa-screenshots/media-video-top.png" });

await page.getByRole("link", { name: "Песни" }).click();
await page.waitForTimeout(500);
console.log("SONGS URL", page.url(), await page.locator("h2").first().textContent());
await page.getByRole("link", { name: "Другое" }).click();
await page.waitForTimeout(500);
console.log("OTHER URL", page.url(), await page.locator("h2").first().textContent());
await page.screenshot({ path: "/tmp/qa-screenshots/media-other-now.png" });

await page.getByRole("link", { name: "Сборник" }).click();
await page.waitForTimeout(400);
const homeSub2 = await page.locator('nav[aria-label="Разделы медиа"]').count();
console.log("BACK HOME SUBNAV", homeSub2);

await page.goto("http://127.0.0.1:8080/about", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const about = await page.locator("main").innerText();
console.log("ABOUT HAS SAGASBORNIK", about.includes("сага · сборник") || about.includes("сага · сборник"));
console.log("ABOUT SUBTITLE", (await page.locator("main p").allTextContents()).slice(0, 4));
console.log("ABOUT HAS 479", about.includes("t.me/yurec_xuec/479"));
console.log("ABOUT HAS AUTHOR", about.includes("Автор: Константин Смирнов"));
console.log("ABOUT HAS GROK", about.includes("Сборка: Grok"));
console.log("ABOUT HAS VERSION", /Версия 1\./.test(about));
await page.screenshot({ path: "/tmp/qa-screenshots/about-now.png", fullPage: true });

await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Визиты" }).click();
await page.waitForTimeout(400);
const visits = await page.locator("main a h2").allTextContents();
console.log("VISITS", visits);
await page.screenshot({ path: "/tmp/qa-screenshots/visits-now.png" });

await browser.close();
console.log("QA DONE");
