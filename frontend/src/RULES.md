# Rules — frontend/src/

## File Placement
- Page-specific code → `pages/admin/` or `pages/client/`
- Shared UI → `components/`
- Shared logic → `hooks/`
- API calls → `services/`
- Global state → `store/`
- TypeScript types → `types/`
- Translations → `i18n/`

## App.tsx
- Only route definitions and provider composition live here
- No business logic, API calls, or rendering beyond routing

## main.tsx
- Only ReactDOM mount, provider wrapping, and global CSS import
- No component logic here

## No Cross-Contamination
- `components/` must NOT import from `pages/`
- `services/` must NOT import from `components/` or `pages/`
- `store/` must NOT import from `pages/` or `components/`
