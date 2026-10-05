import { chromium } from 'playwright'
const b = await chromium.launch()
for (const [k, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp, reducedMotion: 'reduce' })
  const p = await ctx.newPage()
  await p.goto(process.argv[2], { waitUntil: 'networkidle' })
  await p.waitForTimeout(800)
  // invisible-content audit without any scrolling
  const hidden = await p.evaluate(() => [...document.querySelectorAll('main h1,main h2,main h3,main p,main li,main img')]
    .filter((e) => { const s = getComputedStyle(e); return s.opacity === '0' || s.visibility === 'hidden' }).map((e) => e.tagName + ':' + (e.textContent || e.getAttribute('alt') || '').slice(0, 40)))
  console.log(k, 'reduced-motion hidden elements:', hidden.length, hidden.slice(0, 5))
  await p.screenshot({ path: `screenshots/v2-${k}-reduced-motion-full.png`, fullPage: true })
  await ctx.close()
}
// motion mode, no scroll: what is hidden at first paint?
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } })
const p = await ctx.newPage(); await p.goto(process.argv[2], { waitUntil: 'networkidle' }); await p.waitForTimeout(2500)
const vis = await p.evaluate(() => [...document.querySelectorAll('main h1,main h2,main p,main img')].filter((e) => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 }).filter((e) => getComputedStyle(e).opacity === '0').length)
console.log('motion mobile: hidden elements inside first viewport:', vis)
await b.close()
