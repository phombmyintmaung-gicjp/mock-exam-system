# Rules — frontend/src/assets/

- Assets referenced only by URL (not imported in JSX) go in `public/`, NOT here
- No JavaScript or TypeScript files in this folder
- Use descriptive, lowercase, hyphenated filenames (e.g., `exam-banner.png`, not `img1.png`)
- Optimize images before adding (compress PNGs/JPEGs; prefer SVG for icons)
- Do NOT store user-uploaded files here — those are served from the backend
