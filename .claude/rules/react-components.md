# React Component Rules

## Role

You are a senior React engineer building a component-driven UI. You enforce clean separation between UI components, pages, and data-fetching services. Every component is typed, styled with Tailwind, and internationalized.

## Context

Frontend lives in `frontend/src/`. Components are organized by role under `src/components/`. Pages live in `src/pages/admin/` and `src/pages/client/`. All network requests go through `src/services/`. Global state is managed by Zustand in `src/store/`. Styling uses Tailwind CSS exclusively.

```
src/components/
├── ui/       Button, Spinner, Badge, Pagination, Modal, Shimmer
├── layout/   Navbar, Sidebar, PageShell
└── shared/   Timer, ProgressBar, LanguageToggle, QuestionCard
```

## Task

When writing or modifying components:
- Place reusable primitives in `ui/`, app-chrome in `layout/`, domain widgets in `shared/`
- Place page-level components in `src/pages/admin/` or `src/pages/client/`
- Define prop types as a named interface above the component
- Apply Tailwind utilities directly in `className` — no CSS files, no CSS Modules
- Use `clsx` for conditional class merging
- Wrap all user-facing strings with `t()` from `useTranslation`
- Route network requests through `src/services/` — never call `fetch`, `axios`, or `api` directly
- Use Zustand stores for global state (auth, exam session); `useState` for local UI state

## Constraints

- **Never** call `fetch`, `axios`, or `api` directly inside a component or hook
- **Never** hardcode user-facing strings — always use `t('key')`
- **Never** write CSS files, CSS Modules, or static inline `style` objects
- **Never** manually concatenate class strings — use `clsx`
- **Never** default-export anonymous components
- **Never** use `any` for prop types
- One component per file; file name must match the component name exactly (`QuestionCard.tsx` → `QuestionCard`)
- Component names must be `PascalCase`
- Dynamic JS-computed values (e.g., pixel widths) may use inline `style` — static values may not
- Extend colors/fonts/spacing in `tailwind.config.ts` — never use raw hex in classnames

## Output Format

```tsx
// Prop interface — named, above the component
interface QuestionCardProps {
  question: Question;
  onSelect: (choiceId: number) => void;
}

// Component — named export, PascalCase
export function QuestionCard({ question, onSelect }: QuestionCardProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      ...
    </div>
  );
}

// Conditional classes — use clsx
<div className={clsx('rounded border p-4', isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')}>

// API call — through service
const handleSubmit = async () => {
  const result = await examService.submitExam(sessionId, answers);
};
```

Bad patterns to reject:

```tsx
// Bad — direct axios in component
const result = await axios.post('/api/v1/exams/sessions/1/submit/', answers);

// Bad — hardcoded string
<h1>試験開始</h1>

// Bad — inline static style
<button style={{ backgroundColor: '#2563eb' }}>

// Bad — manual string concat
<div className={'rounded ' + (active ? 'bg-blue-600' : 'bg-gray-200')}>

// Bad — any props
function Card({ data }: { data: any }) {}
```
