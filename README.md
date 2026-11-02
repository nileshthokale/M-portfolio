# Nilesh — 3D Cybersecurity, Web & Data Science Portfolio

Personal portfolio website for **Nilesh Thokale** (Computer Science B.C.S., M.Sc. Data Science student in Maharashtra, India, and solo founder of [GoKaliFree — gokalifree.in](https://gokalifree.in)).

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npx --yes tsx --test src/lib/portfolioLogic.test.ts

# 3. Start development server on http://localhost:3000
npm run dev

# 4. Build for production
npm run build
```

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Build command: `npm run build` | Output directory: `dist`.
4. Optional: Set `RESEND_API_KEY` in Vercel Environment Variables if connecting `/api/contact` to Resend.

## How to Customize

- **All Text, Projects, Links & Testimonials**: Edit `src/data/portfolio.ts`.
  - Projects `02` and `03` are pre-wired in `PORTFOLIO_DATA.projects` so you can drop in new titles, descriptions, links, and tech stacks in seconds.
- **Colors & Fonts**: Edit CSS custom properties at the top of `src/index.css`:
  - `--bg-dark`: `#05060a`
  - `--bg-light`: `#eef0f5`
  - `--accent-pink`: `#ff4fa3`, `--accent-violet`: `#7b5cff`, `--accent-orange`: `#ff9a3c`
  - `--font-display`: `'Dela Gothic One'`
- **3D Hero Character / Sculpture**: Edit `src/components/HeroCharacter3D.tsx` (or pass a `.glb` model via `GLTFLoader` / Spline iframe).
