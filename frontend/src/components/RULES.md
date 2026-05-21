# Rules — frontend/src/components/

- Components here must be reusable across BOTH admin and client pages
- If a component is only used in one page, keep it co-located inside that page's folder
- One component per file; filename must match the component name in PascalCase
- Components must NOT make direct API calls — receive data via props or use hooks from `src/hooks/`
- Components must NOT import from `src/pages/`
- All user-facing strings must use `t('key')` — no hardcoded text
- Export as named export, not default export, for easier refactoring
