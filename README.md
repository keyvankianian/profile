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
