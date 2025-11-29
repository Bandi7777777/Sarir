# PLANS

## Iteration: List/Form Refactors (Frontend)

- Personnel lists/forms: migrated to shared layouts/components; logic preserved. **Done**
- Drivers lists/forms: migrated to shared layouts/components; added CSV export/refresh hooks. **Done**
- Contracts lists/forms: moved to `ListPageLayout`/`FormPageLayout`, using shared list scaffolding and shared `ContractForm`; inline edit/delete/export flows kept. **Done**
- Vehicles lists/forms: migrated to `ListPageLayout`/`FormPageLayout` with shared list scaffolding and shared `VehicleForm`; map/chart widgets kept working on existing stubs. **Done**
- Board lists/forms: migrated to `ListPageLayout`/`FormPageLayout` with shared list scaffolding and shared `BoardForm`; filters, KPIs, dialogs, PDF/iCal flows preserved. **Done**
- Dashboard/Reports: dashboard uses `DashboardPageLayout` with organized header/KPI/content; reports page refactored to the same layout with split components (toolbar/table/charts/export) and preserved filters/exports. **Done**
- Navigation/Theme: unified shell via `app/layout.tsx` + `LayoutClient` with shared `Sidebar`/`Topbar` and centralized shell background/spacing tokens across pages. **Done**

### Follow-ups

- Flesh out contracts detail/view pages and wire real APIs instead of mock state.
- Unify validation/zod schemas for contracts similar to `PersonForm`.
- Revisit list pagination/empty states for contracts once backend connects.
- Wire vehicles list/register to real APIs, and add vehicle detail pages.
- Harden map typings (Leaflet/cluster) once backend geo data is finalized.
- Wire board list/register to real APIs and add board meeting/detail pages; consider stronger validation for board forms and reusable PDF templates.
- Optimize dashboard/reports charts for performance and tighten chart data typings; consider saving report presets/filters.
- Continue theme tokenization to replace remaining hard-coded hex colors in leaf components; polish nav responsiveness and finish lint cleanup later.
- Complete remaining lint fixes flagged in legacy areas.

## Progress note
- Sarir color tokens rebuilt (primary/accent, light/dark surfaces, border/text) with RTL Persian typography; data-page drives light CRUD vs dark dashboard/report themes.
- Shell updated: right-side glass sidebar and compact topbar tuned for both themes; LayoutClient now applies theme tokens to the body as well.
- Shared UI atoms/layouts restyled (buttons, inputs, cards, badges, pagination, filter/table shells, page/form/list layouts) for slimmer spacing and tokenized colors; login page refreshed to the light minimal style.
- `pnpm build` from packages/frontend passes; Next.js noted multiple lockfiles when inferring workspace root.
- Latest: spacing/radius scaled down across Dashboard/List/Form layouts, FilterBar, TableShell; sidebar/topbar glass softened while keeping RTL/right rail. Dashboard/report toolbars + KPI tiles now use consistent Persian labels and compact padding; light list/form pages remain minimal, dark analytics pages keep subtle glass without heavy glow. `pnpm build` remains green and main routes render after the polish.
- Current: sidebar/topbar shadows reduced, button/input/card sizing standardized to the compact scale, login wrapper moved to a light gradient card while preserving text; dark analytics pages stay dark, CRUD pages stay light. Build stays green.
- [x] Login page rebuilt as a centered two-column hero/form card with curved boundary, truck-road animation, and scoped styling.
- 2025-02-21 Codex: Deep polish of /login (curved light panel, dark hero with road + horizontal truck motion, compact form card).
