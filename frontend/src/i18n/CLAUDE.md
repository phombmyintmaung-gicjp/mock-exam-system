# frontend/src/i18n/

Translation files for Japanese / English UI localization using `react-i18next`.

## Files

| File | Language |
|------|---------|
| `ja.json` | Japanese (default) |
| `en.json` | English (toggle) |

## Key Format

`section.element` — matches the structure of the UI:

```json
{
  "exam": {
    "startButton": "試験を開始する",
    "submitButton": "提出する",
    "timeRemaining": "残り時間"
  },
  "admin": {
    "dashboard": {
      "title": "ダッシュボード"
    }
  },
  "common": {
    "loading": "読み込み中...",
    "error": "エラーが発生しました"
  }
}
```

## Scope

- Translates: all UI labels, buttons, messages, headings, navigation
- Does NOT translate: exam question text, answer choices (always English)

## Setup File

`index.ts` (or `i18n.ts`) — initializes `i18next` with both language files and sets Japanese as the default.
