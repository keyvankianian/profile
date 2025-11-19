# Profile archive

Vite (vanilla JS) drives the static archive so we can keep the existing markup and functionality while gaining a modern build
pipeline.

## Getting started

```bash
npm install
npm run dev
```

The site is available on <http://localhost:5173>. All JSON data files live in `public/data/` and media assets (images, video files
and PDFs) sit inside `public/assets/` so they can be fetched at runtime without extra imports.

## Available scripts

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start the Vite development server |
| `npm run build`   | Produce the production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint with the shared config |

The legacy `style.css` has been moved to `src/style.css` and imported from `src/main.js` so future refactors into CSS modules or
component-scoped styles can build upon it easily.

## Deployment

The site is deployed to GitHub Pages from the `gh-pages` artifact created in CI. Every push to `main` automatically triggers the
`Deploy site to GitHub Pages` workflow (`.github/workflows/deploy.yml`), which:

1. Installs dependencies with `npm ci` on Node.js 20.
2. Runs `npm run build` to emit the static site into `dist/`.
3. Publishes the build output via `actions/upload-pages-artifact` and `actions/deploy-pages`.

The Vite config (`vite.config.js`) uses a relative `base` (`'./'`) so the compiled bundle works whether it is hosted at the
repository path on GitHub Pages, a custom domain root or even opened directly from the file system.
