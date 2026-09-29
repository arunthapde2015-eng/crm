# AGENTS.md

Instructions for AI coding agents (Claude, etc.) working in this repository. Follow these rules for all code you write or modify. If an instruction here conflicts with an explicit user request, follow the user and mention the conflict.

## Project Overview

- **Framework:** React (function components + hooks only)
- **Language:** JavaScript (ES2022+), JSX in `.jsx` files
- **Build tool:** Vite
- **Package manager:** npm (do not mix lockfiles)
- **Linting / formatting:** ESLint + Prettier
- **Testing:** Vitest + React Testing Library

Before adding a new dependency, check whether the need can be met with existing code or the platform. Ask before adding large libraries (state managers, UI kits, form libraries).

---

## 1. Folder & File Organization

Use a **feature-based** structure. Code that belongs to one feature lives together; only truly shared code goes in top-level shared folders.

```
src/
├── app/                    # App shell: root component, providers, router setup
│   ├── App.jsx
│   ├── providers.jsx
│   └── routes.jsx
├── features/               # One folder per business feature/domain
│   └── auth/
│       ├── components/     # Components used only by this feature
│       │   ├── LoginForm.jsx
│       │   └── LoginForm.test.jsx
│       ├── hooks/          # Feature-specific hooks (useAuth.js)
│       ├── api/            # Feature API calls (authApi.js)
│       ├── utils/          # Feature-specific helpers
│       ├── constants.js
│       └── index.js        # Public API of the feature — export only what others need
├── components/             # Shared, reusable, generic UI (Button, Modal, Input)
│   └── Button/
│       ├── Button.jsx
│       ├── Button.module.css
│       ├── Button.test.jsx
│       └── index.js
├── pages/                  # Route-level components; compose features, minimal logic
├── hooks/                  # Shared custom hooks (useDebounce, useLocalStorage)
├── services/               # API client setup (fetch/axios instance, interceptors)
├── context/                # Global React contexts (theme, auth session)
├── utils/                  # Pure, framework-agnostic helper functions
├── constants/              # App-wide constants and config
├── styles/                 # Global styles, CSS variables, resets
├── assets/                 # Images, fonts, icons
└── main.jsx                # Entry point
```

### Rules

- **Colocate** a component's styles, tests, and sub-components next to it.
- A feature may import from shared folders (`components/`, `hooks/`, `utils/`), but **features must not import from each other's internals** — only through the feature's `index.js`.
- Shared folders (`components/`, `hooks/`, `utils/`) must never import from `features/` or `pages/`.
- Move code to a shared folder only when it's used by **two or more** features.
- Use the `@/` path alias for `src/` (configured in `vite.config.js` and `jsconfig.json`) instead of deep relative paths like `../../../`.
- Keep folder nesting shallow (≤ 4 levels under `src/`).

### Naming Conventions

| Item                    | Convention                             | Example                       |
| ----------------------- | -------------------------------------- | ----------------------------- |
| Component files & names | PascalCase                             | `UserCard.jsx`                |
| Hooks                   | camelCase, `use` prefix                | `useFetchUsers.js`            |
| Utilities / services    | camelCase                              | `formatDate.js`, `userApi.js` |
| Constants               | UPPER_SNAKE_CASE                       | `MAX_RETRIES`                 |
| Folders (non-component) | kebab-case or camelCase, be consistent | `user-profile/`               |
| CSS Modules             | Match component name                   | `UserCard.module.css`         |
| Tests                   | Same name + `.test.jsx`                | `UserCard.test.jsx`           |
| Event handler props     | `on` + Event                           | `onSubmit`, `onItemSelect`    |
| Event handler functions | `handle` + Event                       | `handleSubmit`                |
| Booleans                | `is` / `has` / `should` / `can`        | `isLoading`, `hasError`       |

- One component per file (small private helper components in the same file are fine if not exported).
- Prefer **named exports**; use default exports only where required (e.g. lazy-loaded route pages).

---

## 2. React Best Practices

### Components

- Use **function components and hooks** only. No class components.
- Keep components **small and single-purpose**. If a component exceeds ~200 lines or does more than one job, split it.
- Separate **container logic** (data fetching, state) from **presentational UI** — extract logic into custom hooks.
- Destructure props in the function signature and give defaults there:
  ```jsx
  export function Avatar({ src, alt = '', size = 'md' }) { ... }
  ```
- Avoid prop drilling beyond 2–3 levels; use composition (`children`) or Context instead.
- Prefer **composition over configuration** — avoid components with dozens of boolean props.

### State

- Keep state **as local as possible**; lift it only when siblings need it.
- **Don't store derived state.** Compute it during render (use `useMemo` only if expensive).
- Never mutate state directly; always produce new objects/arrays.
- Use the functional updater when the new state depends on the previous: `setCount(c => c + 1)`.
- Use `useReducer` for complex state with multiple related transitions.
- Use Context for low-frequency global values (theme, auth, locale) — not for rapidly changing data.
- For server data (fetching, caching, refetching), prefer a data-fetching library such as TanStack Query over hand-rolled `useEffect` fetching.

### Hooks

- Follow the **Rules of Hooks** — call hooks only at the top level of components/custom hooks.
- Always provide complete, correct dependency arrays. Do not silence `react-hooks/exhaustive-deps`.
- **You might not need an effect:** don't use `useEffect` to transform data for rendering or to respond to user events — do that in render or in event handlers. Use effects only to sync with external systems.
- Always clean up effects (subscriptions, timers, listeners, `AbortController` for fetches).
- Extract reusable stateful logic into custom hooks (`useXxx`).

### Performance

- Don't optimize prematurely. Reach for `React.memo`, `useMemo`, `useCallback` only when there's a measured or obvious need (expensive computations, memoized children, stable deps).
- Use **stable, unique `key`s** in lists (IDs, never array index for dynamic lists).
- Lazy-load route-level pages with `React.lazy` + `Suspense`.
- Avoid creating new objects/functions inline in props passed to memoized children.

### Rendering & JSX

- Keep JSX declarative; move complex conditions into well-named variables or helpers before `return`.
- Avoid nested ternaries in JSX. Use early returns for loading/error/empty states.
- Beware `{count && <X />}` rendering `0`; use `{count > 0 && <X />}`.
- Use fragments (`<>...</>`) instead of extra wrapper `div`s.

### Forms & Events

- Prefer controlled inputs for forms with validation; use a form library (e.g. React Hook Form) for large forms.
- Call `event.preventDefault()` explicitly in submit handlers.

### Error Handling

- Wrap major UI areas / routes in an **Error Boundary** with a user-friendly fallback.
- Handle loading, error, and empty states for every async UI.
- Never swallow errors silently; log or surface them.

### Accessibility (a11y)

- Use semantic HTML (`button`, `nav`, `main`, `label`) — not clickable `div`s.
- Every input needs an associated `<label>`; every meaningful image needs `alt` text.
- Ensure keyboard navigation and visible focus states.
- Use ARIA attributes only when semantic HTML isn't enough.

### Security

- Never use `dangerouslySetInnerHTML` with untrusted data; sanitize (e.g. DOMPurify) if unavoidable.
- Never commit secrets. Client-side env vars (`VITE_*`) are public — don't put secrets in them.
- Validate and encode any user input used in URLs.

---

## 3. Code Quality

- Code must pass `npm run lint` and `npm run format:check` with **zero errors** before a task is considered done.
- ESLint config should include: `eslint:recommended`, `plugin:react/recommended`, `plugin:react-hooks/recommended`, `plugin:jsx-a11y/recommended`, and `prettier`.
- Don't disable lint rules inline unless necessary; if you do, add a comment explaining why.
- No `console.log` in committed code (use `console.warn`/`console.error` deliberately, or a logger).
- No dead code, commented-out code, or unused imports/variables.
- Use `const` by default, `let` only when reassigning; never `var`.
- Use strict equality (`===`), optional chaining (`?.`), and nullish coalescing (`??`).
- Avoid magic numbers/strings — extract them to named constants.
- Document component props with **JSDoc** (or PropTypes) for shared components.

### Testing

- Write tests for new components, hooks, and utilities; update tests when changing behavior.
- Test **behavior, not implementation**: query by role/label/text (`getByRole`, `getByLabelText`), not by class names or internal state.
- Use `userEvent` over `fireEvent`.
- Mock network calls at the boundary (e.g. MSW), not internal functions.
- Run `npm test` and ensure all tests pass before finishing.

---

## 4. Readability & Maintainability

- **Names should explain intent.** Prefer `filteredActiveUsers` over `data2`; avoid unclear abbreviations.
- **Functions do one thing.** Keep them short (≲ 40 lines); extract helpers when logic grows.
- **Pure functions** for business logic, placed in `utils/` or feature `utils/`, so they're easy to test.
- **Early returns** over deep nesting.
- **Comments explain _why_, not _what_.** Code should be self-explanatory; comment non-obvious decisions, workarounds, and edge cases.
- **DRY, but not prematurely** — duplicate once, abstract on the third occurrence.
- **Consistent patterns:** before writing new code, look at how similar things are already done in the repo and match that style.
- **Import order:** (1) React / external libraries, (2) `@/` internal aliases, (3) relative imports, (4) styles. Separate groups with a blank line.
- Keep files focused; a file that needs scrolling through many unrelated sections should be split.
- Make **small, focused changes**. Don't refactor unrelated code in the same change unless asked.

---

## 5. Styling

- Use **CSS Modules** (`*.module.css`) for component styles unless the project adopts another approach (e.g. Tailwind) — then use only that one approach consistently.
- Define colors, spacing, and typography as CSS variables in `src/styles/`.
- Avoid inline `style` objects except for truly dynamic values.
- Build mobile-first and responsive.

---

## 6. Agent Workflow

1. **Understand first:** read relevant existing files and follow established patterns before writing code.
2. **Plan** non-trivial changes briefly before implementing.
3. **Implement** following the rules above; place new files in the correct folder.
4. **Verify:** run lint, format check, tests, and build (`npm run build`) where applicable.
5. **Report** what changed and anything left undone or uncertain — don't claim success without verification.

### Common Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm test             # Run tests
```
