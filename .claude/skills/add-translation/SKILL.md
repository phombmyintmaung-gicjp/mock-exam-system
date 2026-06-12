# Skill: add-translation

Add i18n translation keys to keep the app fully bilingual (Japanese / English).

## Rule: always update both files in the same change

A key present in `ja.json` but missing from `en.json` (or vice versa) is a bug.
Never defer i18n — a hardcoded string is always incomplete work.

## Files

| File | Language |
|------|---------|
| `frontend/src/i18n/ja.json` | Japanese (default) |
| `frontend/src/i18n/en.json` | English |

## Key format

`section.elementName` — dot-separated, lowercase camelCase per segment.

```
common.loading
common.cancel
auth.loginButton
exam.startButton
exam.timeRemaining
admin.dashboard.title
admin.questions.importButton
result.score
nav.profile
```

## Steps

1. Identify the correct section (see table below), or create a new one if none fits.
2. Add the key + **Japanese** value to `ja.json`.
3. Add the key + **English** value to `en.json`.
4. Use `t('section.key')` in the component.

## Component usage

```tsx
import { useTranslation } from 'react-i18next';

export function StartPage() {
  const { t } = useTranslation();
  return <button>{t('exam.startButton')}</button>;
}
```

Never access the i18n instance directly — always use `useTranslation()`.

## JSON structure — nested objects by section

```jsonc
// ja.json
{
  "common": {
    "loading": "読み込み中...",
    "cancel": "キャンセル"
  },
  "exam": {
    "startButton": "試験を開始する",
    "timeRemaining": "残り時間"
  }
}

// en.json  — identical structure, English values
{
  "common": {
    "loading": "Loading...",
    "cancel": "Cancel"
  },
  "exam": {
    "startButton": "Start Exam",
    "timeRemaining": "Time Remaining"
  }
}
```

## Existing sections

| Section | Covers |
|---------|--------|
| `common` | loading, error, submit, cancel, save, delete, confirm |
| `auth` | login, logout, email, password |
| `exam` | startButton, submitButton, timeRemaining, question, flagQuestion, nextQuestion, prevQuestion, selectCategory, examMode, studyMode |
| `result` | score, pass, fail, reviewAnswers, exportPdf, correct, incorrect |
| `admin.dashboard` | title |
| `admin.questions` | question management labels |
| `admin.users` | title |
| `profile` | title, history, weakAreas |
| `nav` | dashboard, questions, users, reports, examSelect, profile |

## Exempt content

Exam questions, answer choices, and explanations come from the backend and are
**always in English** — do not add translation keys for them. Render as-is.

## Bad patterns

```tsx
// Bad — hardcoded Japanese
<h1>試験開始</h1>

// Bad — hardcoded English
<button>Submit Exam</button>

// Bad — key only in ja.json, missing from en.json
```
