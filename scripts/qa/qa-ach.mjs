import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(20000);

await page.goto('http://127.0.0.1:8080/about', { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.screenshot({ path: '/workspace/screenshots/ach-about.png', fullPage: true });
const btn = page.getByText(/Зашквары двора/);
console.log('about button', await btn.count());

await page.goto('http://127.0.0.1:8080/zashkvary', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const cards = page.locator('.ach-board button');
console.log('cards', await cards.count());
await page.screenshot({ path: '/workspace/screenshots/ach-locked.png', fullPage: true });

await cards.nth(0).click();
await page.waitForTimeout(300);
console.log('hint', await page.getByText('Пока закрыто').count(), await page.getByText('Дочитай любой рассказ').count());
await page.screenshot({ path: '/workspace/screenshots/ach-hint.png' });
await page.getByText('Закрыть').click();

// unlock first two via storage then reload
await page.evaluate(() => {
  localStorage.setItem('yurec-read', JSON.stringify(['s01e00','visit-413','visit-454']));
  localStorage.removeItem('yurec-achievements');
});
await page.goto('http://127.0.0.1:8080/zashkvary', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const fall = page.locator('[data-testid="starfall"]');
console.log('starfall', await fall.count(), 'title', await page.locator('.starfall-title').innerText().catch(()=>'-'));
await page.screenshot({ path: '/workspace/screenshots/ach-starfall.png' });
await page.waitForTimeout(3200);
console.log('starfall after', await fall.count());
await page.screenshot({ path: '/workspace/screenshots/ach-opened.png', fullPage: true });

await cards.nth(0).click();
await page.waitForTimeout(300);
console.log('opened modal', await page.getByText('Первая рюмка').count(), await page.getByText('Горло обожгло').count());
await page.screenshot({ path: '/workspace/screenshots/ach-open-modal.png' });

await browser.close();
