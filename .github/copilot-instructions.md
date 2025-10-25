## Project snapshot (what to know immediately)

- Tech: React (v19) + Vite. Entrypoint: `src/main.jsx`.
- Dev server: `npm run dev` (calls `vite`). Build: `npm run build`. Preview: `npm run preview`.
- Lint: `npm run lint` (ESLint configured).
- The app is a client-only SPA — there is no backend; `src/services/api.js` and `src/lib/db.js` provide an in-app API backed by localStorage.

## Big-picture architecture

- UI: `src/pages/*` (pages) + `src/components/*` (shared UI). Routing is in `src/App.jsx` using `react-router-dom`.
- Data layer: `src/services/api.js` exposes async functions (createDeal, listDeals, listTasks, etc.). These call `src/lib/db.js` (localStorage key-value store) and `src/lib/rules.js` (rules → events → tasks).
- Rules & schema: `src/lib/rules.js` defines `deriveEvents`/`eventsToTasks`. `src/schemas/newDealSchema.json` describes the new-deal form structure.
- Assets: `src/assets/` (css, images). Vite alias `@` maps to `src` (see `vite.config.js`), so imports like `@/lib/rules` are valid.

## Project-specific conventions & gotchas

- Router selection: `src/main.jsx` chooses Router by environment: BrowserRouter in dev, HashRouter in production — be careful when adding routes or linking (see `Router = import.meta.env.MODE === 'production' ? HashRouter : BrowserRouter`).
- Local persistence keys: `src/lib/db.js` uses `hm_deals` and `hm_tasks` in localStorage; to reset state use `db.clearAll()`.
- Inline styles: many components (Header, TopNav, App) use inline JS styles and small scoped style blocks inside components — changing them can affect layout globally. Prefer minimal changes or replicate existing style patterns.
- Naming/case: imports are case-sensitive on some systems. Check exact file names (some comments reference exact case). Also note a few route path inconsistencies (e.g., `Header.jsx` uses `/part-exchange` while `TopNav.jsx` uses `/part-ex`) — align routes if you add new navigation.
- UUID use: code uses `crypto.randomUUID()` in several places and a safe fallback in `src/lib/rules.js` — preserve this approach for IDs.

## How to make typical changes

- To add a page: create `src/pages/YourPage.jsx`, export default a function component, then add a `<Route path="/your-path" element={<YourPage/>} />` in `src/App.jsx`. Update nav links in `src/components/TopNav.jsx` or `src/components/Header.jsx` to expose it.
- To add a server-like behavior: update `src/services/api.js` — this file is the single place the UI calls for data; it coordinates the `db` and `rules` modules.
- To add business rules or map answers → tasks, edit `src/lib/rules.js`. It returns simple task objects with `{id, dealId, type, title, status}`.
- To change persisted shape: update `src/lib/db.js` usages and any consumers in `src/services/api.js` and pages that read/write deals/tasks.

## Debugging and developer workflows

- Start dev site: `npm run dev` and open the app. Use browser DevTools — data and tasks are in localStorage (keys above).
- Quick state reset: in console `import { db } from '/src/lib/db.js'; db.clearAll();` or run the same from app code.
- No test runner in `package.json`. Add tests if required; currently the project relies on manual verification.

## Files to inspect for context (high value)

- `src/main.jsx` — router choice and app mount
- `src/App.jsx` — routes and main layout
- `src/services/api.js` — simulated API surface used by pages
- `src/lib/db.js` — localStorage persistence
- `src/lib/rules.js` — rules → events → tasks mapping
- `src/schemas/newDealSchema.json` — new-deal form schema
- `src/components/Header.jsx`, `src/components/TopNav.jsx` — navigation patterns and inline-style approach
- `src/pages/PartEx.jsx` — an example multi-tab form using local state and submit placeholder

## Example snippets (how components interact)

- Create deal (from UI) → calls `createDeal(answers)` in `src/services/api.js` → saves deal in `db.saveDeal` and generates tasks via `deriveEvents`/`eventsToTasks`.
- Part-exchange form (`src/pages/PartEx.jsx`) uses local `useState` and calls a placeholder submit handler; real submit should call `createDeal`.

## If you're an AI coding agent: do this first

1. Run `npm run dev` to confirm the app loads. 2. Inspect `src/services/api.js` to understand the app API surface. 3. Read `src/lib/db.js` and `src/lib/rules.js` to learn persistence and business rules. 4. Before changing routes, open `src/App.jsx`, `Header.jsx`, and `TopNav.jsx` to avoid path/name mismatches.

If anything here is unclear or you'd like me to expand specific sections (examples of common edits, or to align inconsistent route names), tell me which area and I will update the file.
