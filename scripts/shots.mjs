import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '..', 'screenshots');
const local = 'http://127.0.0.1:4173/';
const publicUrl = 'https://mil-baptist-motorola-send.trycloudflare.com/';

async function shoot(page, name) {
  await page.screenshot({ path: path.join(out, name), type: 'png' });
  console.log('saved', name);
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  const desk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desk.goto(local, { waitUntil: 'networkidle', timeout: 60000 });
  await desk.waitForTimeout(1400);
  await shoot(desk, 'desktop-hero.png');

  await desk.evaluate(() => document.querySelector('#counsel')?.scrollIntoView({ block: 'start' }));
  await desk.waitForTimeout(900);
  await shoot(desk, 'desktop-counsel.png');

  await desk.evaluate(() => document.querySelector('#service')?.scrollIntoView({ block: 'start' }));
  await desk.waitForTimeout(900);
  await shoot(desk, 'desktop-service.png');

  const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mob.goto(local, { waitUntil: 'networkidle', timeout: 60000 });
  await mob.waitForTimeout(1400);
  await shoot(mob, 'mobile-hero.png');

  await mob.evaluate(() => document.querySelector('#character')?.scrollIntoView({ block: 'start' }));
  await mob.waitForTimeout(900);
  await shoot(mob, 'mobile-character.png');

  const pub = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pub.goto(publicUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await pub.waitForTimeout(1600);
  await shoot(pub, 'public-tunnel-hero.png');

  await browser.close();
}

run().catch((e) => { console.error(e); process.exit(1); });
