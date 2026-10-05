import { defineConfig, type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

const root = __dirname
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src/images.json'), 'utf8'))
const commons = JSON.parse(fs.readFileSync(path.join(root, 'assets-src/credits.json'), 'utf8'))

const attr = (s: string, k: string) => (s.match(new RegExp(`${k}="([^"]*)"`)) || [])[1]

function picture(tag: string) {
  const name = attr(tag, 'name')!
  const m = manifest[name]
  if (!m) throw new Error(`Unknown image ${name}`)
  const alt = attr(tag, 'alt') ?? ''
  const sizes = attr(tag, 'sizes') ?? '100vw'
  const cls = attr(tag, 'class') ?? ''
  const eager = tag.includes('eager')
  const set = (ext: string) => m.widths.map((w: number) => `./img/${name}-${w}.${ext} ${w}w`).join(', ')
  const mid = m.widths[Math.min(1, m.widths.length - 1)]
  const h = Math.round((m.h / m.w) * 1000)
  return `<picture class="pic ${cls}" style="--lqip:url('${m.lqip}');--pic-bg:${m.color}">` +
    `<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">` +
    `<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">` +
    `<img src="./img/${name}-${mid}.jpg" srcset="${set('jpg')}" sizes="${sizes}" width="1000" height="${h}" alt="${alt}" ` +
    `${eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async">` +
    `</picture>`
}

const own: Record<string, string> = {
  'mark-hero': 'Portrait of Mark L. Alderman — Cozen O’Connor (firm biography photo, cozen.com)',
  'mark-cs': 'Mark L. Alderman — Cozen O’Connor, via City & State Pennsylvania, 2026 Power 100',
  'mark-square': 'Mark L. Alderman — Cozen O’Connor Public Strategies (copublicstrategies.com)',
}
const label: Record<string, string> = {
  'independence-hall': 'Independence Hall', 'assembly-room': 'Assembly Room, Independence Hall',
  'city-hall': 'Philadelphia City Hall tower', 'skyline-dusk': 'Philadelphia skyline from the South Street Bridge',
  constitution: 'The Constitution of the United States, page 1 (National Archives)', capitol: 'U.S. Capitol dome',
  harrisburg: 'Pennsylvania State Capitol rotunda, Harrisburg', 'western-wall': 'Western Wall Plaza, Jerusalem',
  pericles: 'Bust of Pericles, Roman copy after Kresilas, Vatican Museums', 'philly-night': 'Center City Philadelphia',
}
function credits() {
  const li = Object.entries(own).map(([, v]) => `<li>${v}</li>`)
  for (const [k, c] of Object.entries<any>(commons)) {
    if (!label[k]) continue
    const lic = c.licenseUrl ? `<a href="${c.licenseUrl}" rel="noopener">${c.license}</a>` : c.license
    li.push(`<li>${label[k]} — ${c.artist || 'Unknown'}, <a href="${c.page}" rel="noopener">Wikimedia Commons</a>, ${lic}</li>`)
  }
  return `<ul class="credits">${li.join('')}</ul>`
}

const pics = (): Plugin => ({
  name: 'responsive-pictures',
  transformIndexHtml(html) {
    return html
      .replace(/<x-pic\b[^>]*><\/x-pic>/g, (t) => picture(t))
      .replace('<!--CREDITS-->', credits())
  },
})

export default defineConfig({
  base: './',
  plugins: [pics()],
  build: { outDir: 'dist', assetsInlineLimit: 4096, emptyOutDir: true },
})
