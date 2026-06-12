# Skill: new-component

Create a new React component following the project's conventions for typing,
styling, i18n, and state management.

## Checklist

- [ ] File placed in the correct directory (`ui/`, `layout/`, `shared/`, or `pages/`)
- [ ] File name matches component name exactly (`QuestionCard.tsx` → `QuestionCard`)
- [ ] Named export (never default-export anonymous component)
- [ ] Props defined as a named interface above the component
- [ ] All user-facing strings use `t('section.key')` — no hardcoded text
- [ ] Both `ja.json` and `en.json` updated with new translation keys
- [ ] Tailwind classes only — no CSS files, no `style={{}}` for static values
- [ ] `clsx` used for conditional class merging
- [ ] API calls go through `src/services/` — never direct `axios`/`fetch`
- [ ] Global state from Zustand; local UI state from `useState`
- [ ] No `any` types

## Directory guide

| Directory | What goes there |
|-----------|----------------|
| `src/components/ui/` | Generic primitives: Button, Spinner, Badge, Modal, Pagination, Shimmer |
| `src/components/layout/` | App chrome: Navbar, Sidebar, PageShell, PrivateRoute |
| `src/components/shared/` | Domain widgets: Timer, ProgressBar, QuestionCard, LanguageToggle |
| `src/pages/admin/` | Full admin pages (Dashboard, Questions, UserManagement, etc.) |
| `src/pages/client/` | Full employee pages (ExamSelect, ExamSession, Results, etc.) |

## Component template

```tsx
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import type { SomeType } from '@/types/some';   // @/ alias — never relative cross-dir

// 1. Named prop interface — above the component, not inline
interface MyComponentProps {
  value: SomeType;
  isActive: boolean;
  onChange: (value: SomeType) => void;
}

// 2. Named export — PascalCase, matching the file name
export function MyComponent({ value, isActive, onChange }: MyComponentProps) {
  const { t } = useTranslation();

  // 3. Local UI state with useState
  const [isOpen, setIsOpen] = useState(false);

  return (
    // 4. Tailwind only — clsx for conditionals
    <div className={clsx('rounded-xl border p-4', isActive && 'border-blue-500 bg-blue-50')}>
      {/* 5. All text via t() */}
      <h2 className="text-lg font-semibold">{t('section.title')}</h2>
    </div>
  );
}
```

## i18n — always update both files together

When adding strings, add to **both** files in the same change:

```jsonc
// src/i18n/ja.json  — add under the correct section
{ "section": { "title": "日本語テキスト" } }

// src/i18n/en.json  — add the matching key
{ "section": { "title": "English Text" } }
```

Key format: `section.elementName` — dot-separated, lowercase camelCase per segment.
Exam content (question text, choices, explanations) is exempt — render as-is from backend.

## State decision tree

```
Is the state shared across multiple pages?
  YES → Zustand store (authStore or examSessionStore)
  NO  → Is it UI-only (modal, hover, form field)?
          YES → useState inside the component
          NO  → Does it combine store + service logic?
                  YES → custom hook in src/hooks/
                  NO  → useState
```

## API calls — always through services

```tsx
// Good — handler calls service, writes result to store if needed
const handleSubmit = async () => {
  const result = await examService.submitExam(sessionId, answers);
  // then navigate or update local state
};

// Bad — direct axios in component
const res = await axios.post('/api/v1/exams/sessions/1/submit', answers);
```

## Bad patterns

```tsx
// Bad — hardcoded string
<button>試験開始</button>

// Bad — anonymous default export
export default function () { ... }

// Bad — any prop
function Card({ data }: { data: any }) {}

// Bad — static inline style
<div style={{ color: '#2563eb' }}>

// Bad — manual class concatenation
<div className={'rounded ' + (active ? 'bg-blue-600' : 'bg-gray-200')}>

// Bad — relative cross-directory import
import type { User } from '../../types/user';   // use @/types/user
```
