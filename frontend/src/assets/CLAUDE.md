# frontend/src/assets/

Static files that are imported directly inside JSX/TSX files.

## Contains

- Images (`.png`, `.jpg`, `.svg`, `.webp`)
- Icons (SVG icon files)
- Fonts (`.woff`, `.woff2`, `.ttf`)
- Any static asset referenced via an `import` statement

## Usage

```tsx
import logo from '@/assets/images/logo.svg';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow.svg';
```

## Suggested Subfolders

```
assets/
├── images/   Photos, illustrations, backgrounds
├── icons/    SVG icons
└── fonts/    Custom font files
```
