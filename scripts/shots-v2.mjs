import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
const URL = process.argv[2] || 'http://127.0.0.1:4173/'
const prefix = process.argv[3] || 'v2'
const wait = (p, ms) => p.waitForTimeout(ms)

async function scrollTo(page, y) {
  await page.evaluate((y) => { const l = window.__lenis; if (l) l.scrollTo(y, { immediate: true }); else window.scrollTo(0, y) }, y)
}
async function progressive(page) {
  const H = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y <= H; y += 300) { await scrollTo(page, y); await wait(page, 60) }
  await wait(page, 600)
}
async function posOf(page, sel, frac = 0) {
  return page.evaluate(([sel, frac]) => {
    const el = document.querySelector(sel); const r = el.getBoundingClientRect()
    const top = r.top + scrollY
    return Math.round(top + (el.offsetHeight - innerHeight) * frac)
  }, [sel, frac])
}
async function shot(page, name, y, settle = 1100) {
  if (y != null) { await scrollTo(page, y); await wait(page, settle) }
  await page.screenshot({ path: path.join(out, `${prefix}-${name}.png`) })
  console.log('saved', `${prefix}-${name}.png`)
}

const browser = await chromium.launch()
for (const [kind, vp, opts] of [['desktop', { width: 1440, height: 900 }, {}], ['mobile', { width: 390, height: 844 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
  const ctx = await browser.newContext({ viewport: vp, ...opts })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
  await wait(page, 2400)
  await shot(page, `${kind}-hero`, null)
  await progressive(page)
  if (kind === 'desktop') await shot(page, `${kind}-hero-scroll`, await posOf(page, '[data-hero]', 0.75))
  await shot(page, `${kind}-pericles`, await posOf(page, '#pericles', 0) + 40)
  await shot(page, `${kind}-city`, await posOf(page, '[data-city-step="2"]', 0) - (kind === 'desktop' ? 260 : 60))
  await shot(page, `${kind}-constitution-start`, await posOf(page, '[data-const]', 0.02))
  await shot(page, `${kind}-constitution-mid`, await posOf(page, '[data-const]', 0.5))
  await shot(page, `${kind}-constitution-end`, await posOf(page, '[data-const]', 1))
  await shot(page, `${kind}-career-mid`, await posOf(page, '[data-career]', kind === 'desktop' ? 0.5 : 0))
  await shot(page, `${kind}-elector`, await posOf(page, '#elector', 0.5), 2600)
  await shot(page, `${kind}-washington`, await posOf(page, '#washington', 0) + 80)
  await shot(page, `${kind}-community`, await posOf(page, '#community', 0) + 60)
  await shot(page, `${kind}-character`, await posOf(page, '#character', 0.5), 1400)
  await shot(page, `${kind}-closing`, await posOf(page, '#close', 0.5))
  await scrollTo(page, 0); await wait(page, 800)
  await page.screenshot({ path: path.join(out, `${prefix}-${kind}-full.png`), fullPage: true })
  console.log('saved full', kind, 'errors:', errors)
  await ctx.close()
}
await browser.close()
