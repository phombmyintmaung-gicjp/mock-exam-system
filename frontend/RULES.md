# Rules — frontend/

## Component Naming
- Use `PascalCase` for all component files and function names
- One component per file; filename must match the component name

## API Calls
- NEVER call `fetch` or `axios` directly inside a component or hook
- ALL API calls must go through `src/services/`
- Use `async/await` — no `.then()` chains

## State
- Global state lives in `src/store/` only
- Local component state (`useState`) is fine for UI-only state (open/close, hover, etc.)

## Styling
- No inline styles unless dynamically computed
- Reuse existing class utilities before adding new ones

## i18n
- No hardcoded user-facing strings in components
- Always use `t('section.element')` from `react-i18next`
- Add every new key to BOTH `src/i18n/ja.json` AND `src/i18n/en.json`

## TypeScript
- No `any` types — define interfaces in `src/types/`
- All API response shapes must have a corresponding type

## Imports
- Absolute imports from `src/` (configured in `tsconfig.json`)
- Group imports: external libs → internal modules → relative files
