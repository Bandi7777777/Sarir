# Codex Agent Instructions for SARIR

## Project overview

This local workspace is the SARIR monorepo.

- Backend: FastAPI under `packages/backend` (apps/*, core/*, Alembic).
- Frontend: Next.js App Router under `packages/frontend` (UI in `src/app/**`, shared components in `src/components/**`).
- Styling: Tailwind CSS + custom CSS variables for brand colors (e.g., `--brand-primary`, `--brand-accent`).

You must work ONLY on this local workspace. Do NOT use any remote repos or URLs.

## High-level UI goals

- Build a small internal design system:
  - Shared UI atoms: `Button`, `Input`, `Select`, `Checkbox`, `TextArea`, `Badge`, `Alert`, `Card`, `Dialog/Modal`, `Table`, `Skeleton`, `EmptyState`, `Spinner`.
  - Layout primitives: `Page`, `PageHeader`, `FormPageLayout`, `ListPageLayout`, `DashboardPageLayout`, `DetailPageLayout`.
- Make all **forms**, **lists**, **dashboards**, and **settings** pages:
  - Use the shared layouts/components instead of ad-hoc JSX.
  - Share consistent spacing, typography, headers, and action areas.
- Use section-based theming:
  - Personnel, board, vehicles, etc. should use theme CSS variables (no random hex colors).
- Clean up legacy UI:
  - Remove `.bak` files, old `*_Impl` wrappers, unused sidebars/topbars, and dead components.
- Keep the app buildable:
  - `lint` + `build` must pass after each batch of changes.

## Constraints and rules

- Do NOT change core business logic or data contracts unless absolutely necessary.
- Do NOT add hacks like default-export shims or disabling lint on build.
- Always:
  - Prefer readability and maintainability over clever tricks.
  - Keep components reasonably small and focused.
  - Use Tailwind + theme variables consistently for styling.
- Work incrementally in small, safe batches and keep the dev build working.

## Current progress (snapshot)

- Backend auth & security: **done**.
- Auth UI:
  - Login form uses shared inputs and helpers: **done**.
- Shared layouts:
  - `Page`, `FormPageLayout`, `ListPageLayout`, `DashboardPageLayout`: **created**.
- Forms:
  - Personnel and driver register pages wrapped in `FormPageLayout`: **done**.
  - Shared `PersonForm` at `packages/frontend/src/components/personnel/PersonForm.tsx` is now configurable for personnel/driver variants (variant-specific zod schemas, duplicate checks, Excel helpers, shared UI styling, RTL); personnel register uses the personnel variant.
  - Driver register page now uses `FormPageLayout` + `PersonForm` (driver variant) via `_RegisterDriverImpl.tsx`.
- List scaffolding:
  - `ListHeader`, `FilterBar`, `ListActionBar`, `TableShell`: **created**.
- Type/import cleanup:
  - `searchParams` typed via `PageProps`; UI imports standardized to named exports across list/auth pages; build passes: **done**.
- Personnel list:
  - Migrated to `ListPageLayout` + shared scaffolding; logic preserved; build passing: **partially done**.
- Drivers list:
  - Rebuilt on `ListPageLayout` + `FilterBar`/`ListActionBar`/`TableShell`; search/filter/pagination preserved; added register link action, CSV export, refresh, and compact stats/cards.
- Dashboard visuals corrected: layout now uses a balanced grid with KPIs, charts, tables, and reminders without oversized donuts.
- Dashboard runtime: /dashboard Internal Server Error fixed; page now renders with the updated layout and brand theme.
- Dashboard runtime regression after the light shell/theme refactor was diagnosed and fixed; /dashboard now renders correctly again.
- Dashboard composition refined: tabs/header/actions/KPI row/grid cleaned up with consistent spacing and Sarir brand colors applied systematically to tabs, buttons, badges, and cards.
- Reports page now mirrors the dashboard layout (title, toolbar, KPI cards, content grid) with white cards, consistent spacing, and brand-aligned actions/filters.
- Reports toolbar/table/charts updated to use Sarir teal/accent systematically (primary/outline buttons, neutral inputs, teal chart palette, light table hover).
- All placeholder "????" labels replaced with meaningful Persian text across dashboard/reports.
- Shell switched to a dark Sarir brand theme (teal + accent on dark neutrals) with glassy surfaces and high-contrast text.
- Sidebar rebuilt as a full-height icon nav with hoverable submenus exposing all major pages.
- Runtime 500s on /dashboard and /reports were debugged and fixed; dark theme + sidebar remain intact with minimal runtime tweaks only.
- Visual system:
  - Global brand palette refreshed (teal #07657E + accent #F89C2A with lighter tints), Vazirmatn as the primary UI font, glass/gradient shell, and shared buttons/inputs/cards aligned to the new theme.
- Visual polish:
  - Dashboard, Reports, auth, and the main lists/registers (personnel, drivers, vehicles, contracts, board) now use the cohesive glassmorphism system with consistent spacing, headers, and table/filter styles.
- ESLint:
  - Installed; core UI areas (layouts/ui/personnel/drivers/vehicles/board/dashboard/reports/contracts) now lint-clean or have explicit ignores; lint still fails in legacy/complex areas (tools import worker, stats, map, notifications) tracked for later.
- Shell background is now a light, brand-based gradient on white instead of dark glass.
- Base surfaces standardized to white with a soft muted surface token for subtle sections.
- Text tokens anchored to dark neutral (#1D252E) with muted secondary tone for body copy.
- Brand teal softened via a light tint token for backgrounds and pills.
- Accent orange reserved for highlights and chips rather than large blocks.
- Sidebar uses an airy white panel with teal active rail and smaller shadows.
- Sidebar hover states are lighter and brand aligned without heavy gloss.
- Topbar flattened to a white bar with border/shadow instead of translucent chrome.
- Home badge simplified to a white tile with teal icon treatment.
- LayoutClient wraps pages in a simple centered container over the soft gradient.
- Cards now use white backgrounds, light borders, and gentle shadows (no blur glass).
- Filter bar and table shells restyled to white surfaces without backdrop blur.
- Dashboard tabs restyled as pill buttons with teal active state and outlined inactive tabs.
- Dashboard header aligns title/subtitle on the right with muted supportive text.
- Search and add-person actions sit in one clean row with a rounded input and teal button.
- KPI summary card uses white surface with brand chips for status tags.
- KPI tiles use white tiles, muted labels, and dark neutral numbers.
- Latest employees list rows are white with soft shadows for readability.
- Reminders list uses white cards and clearer controls for importance/removal.
- Donut charts recolored to brand teal tints plus accent orange, no dark segments.
- Calendar and quick-action panels sit on white cards with consistent spacing.
- Dashboard grids now use consistent gap-6 spacing between sections.
- No backend or data-flow changes were made-visual/layout tweaks only.
- Dark neon/glass Sarir skin applied consistently across dashboard/reports/auth and the main lists/forms; remaining "" placeholders were replaced with real Farsi labels and the sidebar/login shells now match the refreshed theme.
- Neon/glass tokens retuned for darker teal gradients with route-scoped accents; sidebar is pinned on the RTL right with glass flyouts, and key screens (login/dashboard/reports/personnel) use the unified shell without empty black gutters.
- Sidebar is now right-aligned, full-height, and glassy with Sarir teal/orange accents; /login, /dashboard, /reports, /personnel/list share the cohesive dark neon Sarir theme with per-page accent variations; major Farsi "" placeholders were replaced with readable labels.
- Snapshot: Sidebar right-aligned glass rail with Sarir teal/orange glow; /login, /dashboard, /reports, /personnel/list all share the dark neon Sarir theme with per-page accent tweaks, and previously blank/placeholder Farsi labels are now real text.
- Latest pass: dark neon/glass tokens tightened again, sidebar kept on the RTL right with teal glow, and login/dashboard/reports/personnel list now share the refreshed Sarir shell with cleaned-up Farsi labels.

## ExecPlans

- For large UI refactors, follow the ExecPlan in `PLANS.md`.
- At the start of each new Codex session (CLI or VS Code), first read `AGENTS.md` and `PLANS.md`, then continue from the next iteration.
