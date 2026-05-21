# frontend/public/

Static files served directly by the dev/production server without bundling.

## Purpose

Contains assets that must be publicly accessible by URL without going through Webpack/Vite:
- `index.html` — HTML shell that React mounts into
- `favicon.ico` — browser tab icon
- `manifest.json` — PWA manifest (if applicable)
- Any assets referenced directly by URL in HTML (not in JSX)

## Note

Assets that are imported inside JSX (e.g., `import logo from './logo.svg'`) go in `src/assets/`, NOT here.
