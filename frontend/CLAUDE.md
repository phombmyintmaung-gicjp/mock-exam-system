# frontend/

React (TypeScript) + Tailwind CSS frontend for the Mock Exam System.

## Purpose

Renders the UI for two user roles:
- **Admin** — manage questions, exams, settings, and monitor all users
- **Employee** — take mock exams, review results, track progress

## Entry Point

`src/App.tsx` — root component, defines all routes and wraps providers (Router, i18n, Store).

## Communication

All data fetching goes through `src/services/api.ts` (Axios instance with JWT interceptor).
Backend base URL: `/api/v1/`

## i18n

- UI defaults to Japanese; English toggle available
- Translation files: `src/i18n/ja.json` and `src/i18n/en.json`
- Exam questions and answer choices are always in English (not translated)

## Key Subdirectories

| Path | Role |
|------|------|
| `src/components/` | Reusable UI components |
| `src/pages/admin/` | Admin site pages |
| `src/pages/client/` | Employee site pages |
| `src/hooks/` | Custom React hooks |
| `src/services/` | API call functions |
| `src/store/` | Global state (auth, exam session) |
| `src/types/` | TypeScript interfaces and types |
| `src/i18n/` | Translation JSON files |
| `public/` | Static files served directly |

## Responsive Design

**READ THIS whenever creating or modifying any design-related file.**

All UI must be mobile-first and work correctly on screens as small as 375 px (iPhone SE). The design must feel native on mobile — not just "doesn't break."

### Core rules

- **Mobile-first**: write the base class for mobile, add `sm:` / `md:` / `lg:` to scale up. Never start desktop-first and try to shrink down.
- **Sidebar**: hidden on mobile by default, toggled via a hamburger button in the Navbar. Permanently visible on `lg:` and above. Implemented in `PageShell` + `Sidebar` + `Navbar` — do not bypass this pattern.
- **Page content padding**: `p-4` on mobile, `md:p-8` on desktop. Already set in `PageShell` — do not override at the page level.
- **Tables**: always wrap in `overflow-x-auto` and add `min-w-[640px]` to the `<table>` element. Never let a table overflow the viewport.
- **Page headers** (title + action button): stack vertically on mobile (`flex-col gap-3`), row on `sm:` (`sm:flex-row sm:items-center sm:justify-between`).
- **Two-column form grids**: `grid-cols-1 sm:grid-cols-2` — never `grid-cols-2` alone.
- **Button rows** in forms or results: use `flex flex-wrap gap-3` so buttons reflow rather than overflow.
- **No fixed pixel widths** that would cause overflow on a 375 px screen.
- **`max-w-*` with `mx-auto`**: acceptable for content columns — they collapse gracefully on small screens.

### Breakpoints

| Prefix | Min-width | Target |
|--------|-----------|--------|
| (none) | 0 px | Mobile phones (375 px+) |
| `sm:` | 640 px | Large phones / small tablets |
| `md:` | 768 px | Tablets |
| `lg:` | 1024 px | Desktops (sidebar shows permanently) |

### Quick checklist before finalizing any layout

- [ ] Does it work at 375 px without horizontal scroll (except intentional table scroll)?
- [ ] Does the header row not overflow or overlap at 375 px?
- [ ] Are tables wrapped in `overflow-x-auto`?
- [ ] Is any `grid-cols-2` guarded with `sm:` or larger?
- [ ] Does the sidebar hide on mobile and show on desktop?
