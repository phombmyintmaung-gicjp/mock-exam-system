# Rules — frontend/src/types/

- No `any` types — every API response and store value must have an explicit interface
- Types that map to backend models must match the API response shape exactly
- Use `type` for unions and aliases; use `interface` for object shapes
- Enums should use string literal unions (`'admin' | 'employee'`) over TypeScript `enum` for better serialization
- Do NOT put component prop types here — define those inline or co-locate with the component
- Import types from here using `import type { ... }` to avoid accidental runtime imports
- Keep one domain per file — do NOT put all types in a single `index.ts`
