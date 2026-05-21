# frontend/src/components/

Reusable UI components shared across multiple pages.

## Purpose

Components here are generic and page-agnostic. They are used by both admin and client pages.

## Examples

| Component | Purpose |
|-----------|---------|
| `Button.tsx` | Primary / secondary / danger button variants |
| `Modal.tsx` | Generic modal dialog wrapper |
| `Spinner.tsx` | Loading indicator |
| `Badge.tsx` | Status badge (Pass / Fail / Easy / Medium / Hard) |
| `Timer.tsx` | Countdown timer display |
| `ProgressBar.tsx` | Exam progress indicator |
| `Pagination.tsx` | Page navigation for lists |
| `Table.tsx` | Sortable data table |
| `LanguageToggle.tsx` | Japanese / English switcher |

## Suggested Subfolders

```
components/
├── ui/        Primitive UI elements (Button, Input, Badge, Modal)
├── layout/    Layout wrappers (Navbar, Sidebar, PageShell)
└── shared/    Domain-aware shared components (Timer, QuestionCard)
```
