import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const motion = document.documentElement.classList.contains('motion')
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s))

/* ---------------- Chrome: header, progress, nav ---------------- */
function chrome() {
  const header = $('[data-nav]')!
  const bar = $('.progress span')!
  const links = $$<HTMLAnchorElement>('.nav a')
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight
    const p = max > 0 ? scrollY / max : 0
    header.classList.toggle('is-scrolled', scrollY > 20)
    bar.style.transform = `scaleX(${p})`
  }
  update()
  addEventListener('scroll', update, { passive: true })
  addEventListener('resize', update)
  links.forEach((a) => {
    const sec = $(a.getAttribute('href')!)
    if (!sec) return
    ScrollTrigger.create({
      trigger: sec, start: 'top 50%', end: 'bottom 50%',
      onToggle: (st) => a.classList.toggle('is-active', st.isActive),
    })
  })
}

/* ---------------- Smooth scroll ---------------- */
function smooth() {
  const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!
      const el = id.length > 1 ? $(id) : null
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el, { offset: id === '#top' ? 0 : -10, duration: 1.4 })
    }),
  )
  ;(window as any).__lenis = lenis
}

/* ---------------- Hero ---------------- */
function heroIntro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
  tl.from('[data-intro-line]', { yPercent: 115, duration: 1.4, stagger: 0.12 }, 0.1)
    .from('[data-intro]', { autoAlpha: 0, y: 16, duration: 1.1, stagger: 0.1 }, 0.35)
    .fromTo('[data-hero-portrait]', { clipPath: 'inset(14% 10% 14% 10% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.8 }, 0.15)
    .from('[data-hero-portrait] img', { scale: 1.28, duration: 2.2 }, 0.15)
    .from('.hero__cue', { autoAlpha: 0, duration: 1 }, 1)
}

function heroScroll(mm: gsap.MatchMedia) {
  mm.add('(min-width: 901px)', () => {
    const portrait = $('[data-hero-portrait]')!
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
    })
    tl.to('[data-hero-text]', { yPercent: -18, autoAlpha: 0, ease: 'power2.in', duration: 0.55 }, 0)
      .to('.hero__cue', { autoAlpha: 0, duration: 0.15 }, 0)
      .to(portrait, {
        x: () => { const r = portrait.getBoundingClientRect(); return innerWidth / 2 - (r.left + r.width / 2) },
        scale: () => Math.min(1.55, (innerHeight * 0.86) / portrait.offsetHeight),
        ease: 'power2.inOut', duration: 1,
      }, 0)
      .to('[data-hero-portrait] img', { filter: 'brightness(0.5)', ease: 'none', duration: 0.6 }, 0.4)
      .fromTo('[data-hero-aside]', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.62)
  })
}

/* ---------------- Reveals (only below the fold; above-fold content is never hidden) ---------------- */
function reveals() {
  $$('[data-reveal]').forEach((el) => {
    if (el.getBoundingClientRect().top < innerHeight * 0.95) return
    gsap.from(el, {
      autoAlpha: 0, y: 34, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
  })
}

/* ---------------- Masked image reveals ---------------- */
function masks() {
  $$('[data-mask]').forEach((el) => {
    const img = $('img', el)
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 35%', scrub: 0.8 } })
      .fromTo(el, { clipPath: 'inset(10% 7% 10% 7% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', ease: 'none' }, 0)
      .fromTo(img, { scale: 1.18 }, { scale: 1, ease: 'none' }, 0)
  })
}

function parallax() {
  $$('[data-parallax]').forEach((el) => {
    gsap.fromTo(el, { yPercent: -7 }, {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: el.parentElement!, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  })
}

/* ---------------- Philadelphia: sticky crossfade ---------------- */
function city(mm: gsap.MatchMedia) {
  const steps = $$('[data-city-step]')
  const imgs = $$('[data-city-img]')
  const ticks = $$('.city__ticks li')
  const caption = $('[data-city-caption]')!
  const set = (i: number) => {
    imgs.forEach((im, k) => im.classList.toggle('is-active', k === i))
    ticks.forEach((t, k) => t.classList.toggle('is-active', k === i))
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i))
    caption.textContent = steps[i].dataset.caption || ''
  }
  set(0)
  mm.add('(min-width: 901px)', () => {
    steps.forEach((s, i) =>
      ScrollTrigger.create({
        trigger: s, start: 'top 60%', end: 'bottom 60%',
        onToggle: (st) => st.isActive && set(i),
      }),
    )
  })
}

/* ---------------- Constitution: scroll-linked zoom-out ---------------- */
function constitution(mm: gsap.MatchMedia) {
  const pic = $('[data-const-doc] .pic')!
  gsap.set(pic, { transformOrigin: '50% 50%' })
  // Zoom inside a fixed frame. Focus point (fx, fy) is a fraction of the page; “We the People” sits top-left.
  const zoom = (s: number, fx: number, fy: number) => ({ scale: s, xPercent: (0.5 - fx) * 100 * s, yPercent: (0.5 - fy) * 100 * s })
  const build = (s: number, fx: number, fy: number) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '[data-const]', start: 'top top', end: 'bottom bottom', scrub: 0.7 } })
    tl.fromTo(pic, zoom(s, fx, fy), { scale: 1, xPercent: 0, yPercent: 0, ease: 'power2.inOut', duration: 1 }, 0.08)
      .fromTo('[data-const-text]', { y: 30 }, { y: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out' }, 0)
      .to({}, { duration: 0.1 })
    return tl
  }
  mm.add('(min-width: 901px)', () => { build(2.8, 0.23, 0.185) })
  mm.add('(max-width: 900px)', () => { build(2.4, 0.245, 0.215) })
}

/* ---------------- Career: horizontal pinned track ---------------- */
function career(mm: gsap.MatchMedia) {
  mm.add('(min-width: 901px)', () => {
    const section = $('[data-career]')!
    const track = $('[data-career-track]')!
    const dist = () => Math.max(0, track.scrollWidth - innerWidth)
    const size = () => { section.style.height = `${dist() + innerHeight * 1.15}px` }
    size()
    ScrollTrigger.addEventListener('refreshInit', size)
    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true } })
    tl.to(track, { x: () => -dist(), ease: 'none', duration: 1 }, 0.07)
      .fromTo('[data-career-bar]', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 }, 0.07)
      .to({}, { duration: 0.07 })
    return () => { ScrollTrigger.removeEventListener('refreshInit', size); section.style.height = '' }
  })
}

/* ---------------- Counters ---------------- */
function counters() {
  $$('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count)
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => {
        const o = { v: 0 }
        gsap.to(o, {
          v: target, duration: target > 1000 ? 2.2 : 1.6, ease: 'expo.out',
          onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-US') },
        })
      },
    })
  })
}

/* ---------------- Character: scroll-scrubbed word highlight ---------------- */
function words() {
  const el = $('[data-words]')
  if (!el) return
  const parts = (el.textContent || '').trim().split(/(\s+)/)
  el.innerHTML = parts.map((p) => (/\s+/.test(p) ? p : `<span class="w">${p}</span>`)).join('')
  const ws = $$('.w', el)
  ScrollTrigger.create({
    trigger: el, start: 'top 78%', end: 'bottom 48%', scrub: true,
    onUpdate: (st) => {
      const n = Math.round(st.progress * ws.length)
      ws.forEach((w, i) => w.classList.toggle('on', i < n))
    },
  })
}

/* ---------------- Boot ---------------- */
chrome()
const city0 = () => city(gsap.matchMedia())
if (motion) {
  smooth()
  const mm = gsap.matchMedia()
  heroIntro()
  heroScroll(mm)
  reveals()
  masks()
  parallax()
  city(mm)
  constitution(mm)
  career(mm)
  counters()
  words()
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
  addEventListener('load', () => ScrollTrigger.refresh())
} else {
  city0()
}
