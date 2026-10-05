// Responsive image pipeline: AVIF + WebP + JPEG at multiple widths, LQIP, manifest.
import sharp from 'sharp'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(root, 'assets-src')
const OUT = path.join(root, 'public', 'img')
sharp.cache(false)
sharp.concurrency(2)

// name -> { file, widths, crop? }
const items = {
  'mark-hero':        { file: 'mark-cozen-hires.jpg', widths: [480, 800, 1286] },
  'mark-cs':          { file: 'mark-cs-2026.jpg',     widths: [610] },
  'mark-square':      { file: 'mark-cops-square.jpg', widths: [480, 900] },
  'independence-hall':{ file: 'independence-hall.jpg', widths: [640, 1024, 1600, 2400] },
  'assembly-room':    { file: 'assembly-room.jpg',     widths: [640, 1024, 1600, 2400] },
  'city-hall':        { file: 'city-hall.jpg',         widths: [640, 1024, 1600] },
  'skyline-dusk':     { file: 'skyline-dusk.jpg',      widths: [800, 1280, 1920, 2800] },
  'constitution':     { file: 'constitution.jpg',      widths: [800, 1400, 2400] },
  'capitol':          { file: 'capitol.jpg',           widths: [640, 1024, 1600] },
  'harrisburg':       { file: 'harrisburg.jpg',        widths: [800, 1280, 1920, 2800] },
  'western-wall':     { file: 'western-wall.jpg',      widths: [800, 1280, 1920, 2600] },
  'pericles':         { file: 'pericles.jpg',          widths: [480, 800, 1300] },
  'philly-night':     { file: 'philly-night.jpg',      widths: [800, 1280, 1920, 2800] },
}

await fs.rm(OUT, { recursive: true, force: true })
await fs.mkdir(OUT, { recursive: true })
const manifest = {}
for (const [name, cfg] of Object.entries(items)) {
  const input = path.join(SRC, cfg.file)
  const base = sharp(input, { limitInputPixels: false }).rotate()
  const meta = await base.metadata()
  const W = meta.width, H = meta.height
  const widths = cfg.widths.filter((w) => w <= W)
  if (!widths.includes(Math.min(W, cfg.widths.at(-1)))) widths.push(Math.min(W, cfg.widths.at(-1)))
  const uniq = [...new Set(widths)].sort((a, b) => a - b)
  for (const w of uniq) {
    const r = () => sharp(input, { limitInputPixels: false }).rotate().resize({ width: w })
    await r().avif({ quality: 50, effort: 4 }).toFile(path.join(OUT, `${name}-${w}.avif`))
    await r().webp({ quality: 74 }).toFile(path.join(OUT, `${name}-${w}.webp`))
    await r().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${name}-${w}.jpg`))
  }
  const lq = await sharp(input, { limitInputPixels: false }).rotate().resize({ width: 24 }).webp({ quality: 40 }).toBuffer()
  const { dominant } = await sharp(input, { limitInputPixels: false }).stats()
  manifest[name] = {
    w: W, h: H, widths: uniq,
    lqip: `data:image/webp;base64,${lq.toString('base64')}`,
    color: `rgb(${dominant.r},${dominant.g},${dominant.b})`,
  }
  console.log(name, W + 'x' + H, uniq.join(','))
}
await fs.writeFile(path.join(root, 'src', 'images.json'), JSON.stringify(manifest, null, 1))
console.log('done')
