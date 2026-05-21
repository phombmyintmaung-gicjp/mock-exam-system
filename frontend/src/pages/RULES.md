# Rules — frontend/src/pages/

- Each file represents one route — keep pages focused on layout and orchestration
- Business logic belongs in `src/hooks/` or `src/services/`, not inside page components
- API calls must go through `src/services/` — never call axios/fetch directly in a page
- Page components must check role authorization before rendering sensitive content
- Co-locate page-specific sub-components inside the page's own subfolder if not reusable
- Never import from another page — shared UI goes to `src/components/`
