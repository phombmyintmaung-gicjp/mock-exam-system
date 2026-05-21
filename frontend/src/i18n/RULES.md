# Rules — frontend/src/i18n/

- Every new user-facing string must have a translation key — no hardcoded text in components
- Every key added to `ja.json` MUST also be added to `en.json` in the same commit — never let them fall out of sync
- Key format is `section.element` — nest logically by UI area, not by component name
- Keys must be in camelCase (e.g., `startButton`, not `start_button` or `StartButton`)
- Do NOT add exam question text or answer choices here — they are stored in the database and served in English
- Do NOT delete or rename existing keys without updating every component that uses them
- If a string has dynamic values, use i18next interpolation: `"greeting": "こんにちは、{{name}}さん"`
