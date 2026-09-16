import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--no-sandbox'] });

async function shot(page, name) {
  await page.screenshot({ path: '/workspace/screenshots/' + name, fullPage: name.includes('full') });
}

const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on('pageerror', e => console.log('ERR', e.message));
page.on('console', m => { if (m.type()==='error') console.log('CERR', m.text()); });

await page.goto('http://127.0.0.1:8080/zashkvary', { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
console.log('starfall on reload', await page.locator('[data-testid="starfall"]').count());

await page.goto('http://127.0.0.1:8080/about', { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const title = page.locator('h2', { hasText: 'Жизнь Юрца' });
for (let i=0;i<5;i++) await title.click();
await page.waitForTimeout(900);
console.log('storm', await page.locator('.egg-storm').count(), 'starfall', await page.locator('[data-testid="starfall"]').count(), 'groza title', await page.locator('.starfall-title').innerText().catch(()=>'-'));
await page.screenshot({ path: '/workspace/screenshots/ach-groza.png' });
await page.waitForTimeout(3200);

const tab = await browser.newPage({ viewport: { width: 820, height: 1100 } });
await tab.goto('http://127.0.0.1:8080/zashkvary', { waitUntil: 'networkidle' });
await tab.waitForTimeout(500);
const cols = await tab.evaluate(() => {
  const el = document.querySelector('.ach-board');
  const st = getComputedStyle(el);
  return st.gridTemplateColumns;
});
console.log('tablet cols', cols);
await tab.screenshot({ path: '/workspace/screenshots/ach-tablet.png', fullPage: true });

await browser.close();
