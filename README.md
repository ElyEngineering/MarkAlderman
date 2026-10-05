# Quiet Counsel

A friend’s tribute to Mark L. Alderman — Philadelphia lawyer, counselor, and citizen. The site is a single long-scroll page (hero, Pericles, Philadelphia, the Constitution, career, Washington, character) with smooth scrolling and chapter motion.

**Stack:** [Vite](https://vitejs.dev/) 5, TypeScript, [GSAP](https://gsap.com/) (ScrollTrigger), and [Lenis](https://github.com/darkroomengineering/lenis). Type is Inter and Instrument Serif via Fontsource.

## Run

```bash
npm install
npm run dev      # local preview
npm run build    # required-file check, then tsc && vite build → dist/
npm run preview  # serve the production build
```

`index.html` uses `<x-pic>` placeholders. `vite.config.ts` rewrites them into responsive `<picture>` elements (AVIF, WebP, JPEG) from `src/images.json` and fills the credits list from `assets-src/credits.json`. Optimized images the site serves are already in `public/img/`. The raw `assets-src/` tree (originals and `credits.json`) is not in this repository; a production build needs `assets-src/credits.json` present for the credits plugin. `npm run build` runs `prebuild` (`sh scripts/check-required-files`) first and exits with `Missing required file: assets-src/credits.json` when that file is absent. Future sites: copy `scripts/check-required-files` and the npm `prebuild` script so the same check runs before Vite.

Factual claims and image credits are recorded in `sources.md`.

## Layout

| Path | Role |
|---|---|
| `index.html` | Page markup and chapter structure |
| `src/main.ts` | Scroll, navigation, and GSAP motion |
| `src/style.css` | Layout and type |
| `src/images.json` | Responsive image manifest |
| `public/img/` | Optimized images served by the site |
| `scripts/` | Image processing and screenshot helpers |
| `sources.md` | Source notes for copy and image credits |
| `RUN.md` / `TEARDOWN.sh` / `STATUS.txt` | Notes from a temporary preview |
