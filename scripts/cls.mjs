import { chromium } from 'playwright'
const b = await chromium.launch()
for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const p = await (await b.newContext({ viewport: vp })).newPage()
  await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: 'layout-shift', buffered: true }) })
  const t0 = Date.now(); await p.goto(process.argv[2], { waitUntil: 'load' }); const load = Date.now() - t0
  for (let y = 0; y < 14000; y += 400) { await p.mouse.wheel(0, 400); await p.waitForTimeout(60) }
  await p.waitForTimeout(800)
  const r = await p.evaluate(() => ({ cls: window.__cls, imgs: performance.getEntriesByType('resource').filter(e => e.initiatorType === 'img').length, bytes: Math.round(performance.getEntriesByType('resource').reduce((a, e) => a + (e.transferSize || 0), 0) / 1024) }))
  console.log(vp.width, { loadMs: load, ...r })
}
await b.close()
