# AGENTS.md

## Project Overview

Vue 3 SPA — экспериментальная площадка для тестирования компонентов, анимаций и таблиц.

**Stack:** Vue 3.5, TypeScript, Vite 7, Vue Router 4, Pinia, PrimeVue 4, VueUse

## Commands

```bash
npm run dev          # Development server (hot-reload)
npm run build        # Type-check + production build
npm run type-check   # TypeScript type checking (vue-tsc)
npm run lint         # ESLint with auto-fix
npm run format       # Prettier formatting
npm run preview      # Preview production build
```

## Conventions

- **Language:** TypeScript everywhere
- **Components:** `<script setup lang="ts">` with Composition API
- **Styles:** Scoped CSS (`<style lang="css" scoped>`)
- **Imports:** Use `@/` alias for `src/`
- **Components:** PascalCase filenames, auto-imported via `unplugin-vue-components`
- **PrimeVue:** Auto-imported (no manual imports needed)
- **No comments** in code unless explicitly requested

## Project Structure

```
src/
├── App.vue                    # Root component with page transitions
├── main.ts                    # Entry point
├── router/
│   └── index.ts               # Vue Router config
├── stores/
│   └── counter.ts             # Pinia store
├── components/                # Reusable components
├── hooks/                     # Composables (use* pattern)
├── services/                  # Data services / API layer
├── utils/                     # Utility functions
└── views/
    ├── HomeView.vue
    ├── tables/
    │   ├── TableExperiments.vue
    │   └── TableExperiments2.vue
    ├── animations/
    │   ├── ExperimentalAnim1.vue
    │   └── ExperimentalAnim2.vue
    └── pages/
        └── JournalOfTool.vue
```

## Routes

| Path | Name | Component |
|------|------|-----------|
| `/` | Home | HomeView |
| `/ExperimentalTable1` | ExperimentalTable1 | TableExperiments |
| `/ExperimentalTable2` | ExperimentalTable2 | TableExperiments2 |
| `/anim1` | ExperimentalAnim1 | ExperimentalAnim1 |
| `/anim2` | ExperimentalAnim2 | ExperimentalAnim2 |
| `/pages/journalEuqipment` | JournalPage | JournalOfTool |

## Key Libraries

- **PrimeVue 4** — UI components (auto-imported)
- **PrimeIcons** — icon set
- **@primeuix/themes** — theming (Aura theme)
- **@vueuse/core** — composables
- **animate.css** — animation library
- **pinia** — state management

## Important Notes

- PrimeVue components are auto-imported, do not manually import them
- Route paths starting with `/` in children are absolute (not nested) — use relative paths (`path: 'child'`) for nested routes
- `document.title` is set in `router.beforeEach` based on route meta
