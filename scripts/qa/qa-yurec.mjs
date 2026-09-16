import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
mkdirSync("/tmp/qa-screenshots", { recursive: true });
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(20000);

await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const chips = await page.locator("button").allTextContents();
console.log("CHIPS", chips.filter(t => /Все|Серии|Песни|Визит|Бонус|Спец|Наброс|Случайн/.test(t)));
const nav = await page.locator("nav a").allTextContents();
console.log("NAV", nav.map(t => t.replace(/\s+/g, " ").trim()));
await page.screenshot({ path: "/tmp/qa-screenshots/home-game-nav.png", fullPage: false });

await page.goto("http://127.0.0.1:8080/game", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const title = await page.locator("h2").first().textContent();
console.log("GAME TITLE", title);
const start = page.getByRole("button", { name: /Начать день/ });
console.log("START VISIBLE", await start.isVisible());
await page.screenshot({ path: "/tmp/qa-screenshots/game-title.png", fullPage: false });
await start.click();
await page.waitForTimeout(400);
const scene = await page.locator("h2").first().textContent();
console.log("SCENE", scene);
const choices = await page.locator("main button").allTextContents();
console.log("CHOICES", choices);
await page.screenshot({ path: "/tmp/qa-screenshots/game-play.png", fullPage: false });
if (choices.length) {
  await page.locator("main button").first().click();
  await page.waitForTimeout(400);
  console.log("AFTER", await page.locator("h2").first().textContent());
  await page.screenshot({ path: "/tmp/qa-screenshots/game-branch.png", fullPage: false });
}

await page.goto("http://127.0.0.1:8080/story/sms-year", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const h1 = await page.locator("h1").first().textContent();
console.log("SMS TITLE", h1);
const bubbles = await page.locator("ol li").count();
console.log("SMS BUBBLES", bubbles);
await page.screenshot({ path: "/tmp/qa-screenshots/sms-special.png", fullPage: false });

await page.goto("http://127.0.0.1:8080/?kind=no", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Бонусы" }).click();
await page.waitForTimeout(300);
const cards = await page.locator("main a h2").allTextContents();
console.log("SPEC CARDS", cards);
await page.screenshot({ path: "/tmp/qa-screenshots/spec-filter.png", fullPage: false });

await browser.close();
console.log("QA DONE");
