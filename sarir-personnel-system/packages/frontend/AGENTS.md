# Codex Agent Instructions for SARIR

## Project overview

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
- Contracts:
  - Contracts list and forms use `ListPageLayout`/`FormPageLayout` plus shared list/form UI components; behavior preserved during migration.
- Vehicles:
  - Vehicles list now uses `ListPageLayout` + `ListHeader` + `FilterBar` + `ListActionBar` + `TableShell`, keeping filters, pagination, KPIs, and map/chart widgets aligned with existing Leaflet/recharts stubs.
  - Vehicles register flow uses `FormPageLayout` and a shared `VehicleForm` component for create/edit UX.
- Board:
  - Board list uses `ListPageLayout` + `ListHeader` + `FilterBar` + `ListActionBar` + `TableShell`, preserving filters, KPIs, animations, dialogs, and CSV export.
  - Board register flow uses `FormPageLayout` with shared UI atoms and a reusable `BoardForm`; PDF generation, templates, signature, tasks/votes, and iCal export are intact.
- Dashboard:
  - Main dashboard now uses `DashboardPageLayout` with structured header, KPI row, and organized content (latest employees, quick actions, reminders, calendars, donuts).
- Reports:
  - Reports page aligned to `DashboardPageLayout`, split into toolbar/table/charts components; filters, virtualized table, exports, and dialogs remain functional.
- Navigation/Theme:
  - Root `app/layout.tsx` now renders a single shell via `LayoutClient` with shared `Sidebar` + `Topbar` + `PageFrame` base, common providers, and unified background/spacing tokens.
  - All List/Form/Dashboard/Reports pages inherit the shell and shared layout components with consistent brand colors and spacing.
- ESLint:
  - Installed; build now passes, but lint still fails due to legacy violations to be cleaned up separately.

## ExecPlans

- For large UI refactors, follow the ExecPlan in `PLANS.md`.
- At the start of each new Codex session (CLI or VS Code), first read `AGENTS.md` and `PLANS.md`, then continue from the next iteration.
