# UI ExecPlan for SARIR

This ExecPlan defines how Codex should continue the SARIR UI refactor across multiple sessions, without needing repeated explanations from the user.

Codex MUST:
- Read `AGENTS.md` and this file at the start of each session.
- Work ONLY inside the local workspace.
- Follow these iterations in order.
- Keep the app buildable after each iteration (run lint + build).
- Never apply giant multi-file changes in a single step that risk breaking the build.

---

## ✅ Iteration 0 — Foundation (DONE)

- Shared layout primitives created:
  - Page, PageHeader
  - FormPageLayout
  - ListPageLayout
  - DashboardPageLayout
- Shared UI atoms created:
  - EmptyState, Button, Input, Card, etc.
- Login form updated.
- Personnel/Driver register wrapped in FormPageLayout.
- List scaffolding created:
  - ListHeader, FilterBar, ListActionBar, TableShell.
- ESLint installed.

**Status:** Foundation + shared layouts/atoms complete; initial import/type cleanup in place.

---

## 🔵 Iteration 1 — Personnel (List + Forms)

Goal: Fully migrate the Personnel feature to the new design system.

### Tasks:
1. Personnel list: wired to `ListPageLayout` + `ListHeader`/`FilterBar`/`ListActionBar`/`TableShell`; logic (react-table, filters, dialogs, KPIs) preserved. Build currently passes.
2. Shared `PersonForm`: extract shared personnel fields/validation and reuse in register/edit pages.
3. Refactor Personnel register/edit pages to use `PersonForm` + `FormPageLayout`.
4. Run lint/build; fix regressions while deferring legacy lint debt.

**Status:** Personnel list partially migrated (layout + scaffolding wired, build passing); remaining: extract `PersonForm` and finish personnel forms refactor.

**Note:** Lint still has many legacy violations; handle in a later cleanup phase or separately from the core UI refactor.

🟢 Iteration 2 — Drivers (List + Forms)

Goal: Apply the same UI patterns used in Iteration 1.

Tasks:
1. Driver list: migrated to `ListPageLayout` + shared list scaffolding (FilterBar/ListActionBar/TableShell); search/filter/pagination preserved. **(done)**
2. Driver register: wired to `PersonForm` (driver variant) inside `FormPageLayout`; duplicate checks, Excel helper, shared styling applied. **(done)**
3. Remaining: hook any driver edit pages to the same `PersonForm` variant and refine UX as needed; legacy lint cleanup is deferred to a later phase.

**Status:** Core flows (list + create) completed; edit pages can reuse the shared form in a follow-up; lint debt remains for later cleanup.

🟡 Iteration 3 — Vehicles, Board, Contracts

For EACH module:

Refactor list pages to ListPageLayout + shared components.

Refactor any forms to FormPageLayout + shared field components.

Replace hex colors with theme tokens.

Run lint + build.

Process one domain at a time.

🔴 Iteration 4 — Dashboards & Reports

Apply DashboardPageLayout.

Normalize StatCards, KPI blocks, charts, breadcrumbs.

Remove inline styling; use theme variables.

Run lint + build.

⚙️ Iteration 5 — Navigation & Theming Cleanup

Consolidate Sidebar:

Use ONE version only.

Remove legacy sidebars.

Consolidate Topbar:

Use ONE shared Topbar.

Remove unused variations.

Theming:

Replace all hex colors with CSS variables.

Make section-based themes fully consistent.

Ensure dark/light works globally.

Remove:

.bak files

*_Impl wrappers

Dead components

Final lint + build.

🎉 Iteration 6 — Final Quality Pass

Unify spacing, typography, layout hierarchy.

Confirm all forms/lists/dashboards share consistent design.

Run final lint + build.

Output a Final Summary:

Major changes

UI components created

Remaining TODOs (if any)

RULE: Codex Automatic Behavior

Codex should:

Automatically continue to the next iteration after finishing one.

NOT ask the user "should I continue?" unless there is a blocking error.

Keep the app buildable at every step.

Follow the shared layouts and design system defined in AGENTS.md.

Progress note:
- Core lint/style cleanup for shared layouts, UI atoms, personnel/drivers/vehicles/board/dashboard/reports/contracts is now in place (clean or explicitly suppressed where intentional).
- Remaining lint debt deferred: tools/import pages and xlsx.worker, stats pages, map utilities, some API routes/legacy pages.
- Dashboard visual corrections done: content now uses the new design system with balanced grid/KPIs/charts instead of oversized donut layouts.
- Dashboard Internal Server Error resolved; runtime now stable without altering the design system.
- Visual polish pass completed for the core surfaces (shell, auth, Dashboard/Reports, personnel/drivers/vehicles/contracts/board lists & forms) with the new brand/light glass theme; optional follow-ups: dark mode, deeper tokenization, and secondary page refinements.
- UI/UX phase:
  - Shell + dashboard visual refinement with real brand colors is done.
  - Future optional work: polish other pages + potential dark mode.
  - Second /dashboard Internal Server Error after the light theme pass is resolved with minimal runtime fixes (design system retained).
- Dashboard + Reports layout/brand refinement completed; dark theme and professional sidebar applied. Next optional step: align personnel/drivers/vehicles/contracts/board pages with the same system.
- Runtime stability for /dashboard and /reports after dark-theme/sidebar refactor is confirmed; continue aligning remaining sections next.
- Neon/glass dark Sarir theme aligned across dashboard/reports/login and the main list/register flows; Farsi placeholders replaced; sidebar/login refreshed; remaining work: secondary page theming + legacy lint cleanup.
- Route-scoped neon/glass accents added (dashboard/reports/fleet/personnel), sidebar anchored on the RTL right with glass flyouts, and empty-black layouts on login/reports/personnel lists cleaned up; next: refine secondary pages + legacy lint debt.
- Current polish iteration: neon/glass theme tightened, sidebar right-aligned with Sarir accents, key pages (login/dashboard/reports/personnel list) aligned with per-page accents and Farsi labels; remaining optional work: full dark/light switcher, secondary page polish, global lint cleanup.
- UI polish iteration complete: neon/glass Sarir theme aligned across login/dashboard/reports/personnel list with right-anchored sidebar, localized Farsi labels, and per-page accents. Remaining optional work: add a dark/light switcher, polish secondary pages, and finish global lint cleanup.
- Latest: dark neon Sarir shell + glass cards tightened; sidebar stays right and glowy; login/dashboard/reports/personnel list aligned on the refreshed theme with cleaned Farsi labels. Still open: optional dark/light switcher, secondary page polish, and lingering lint debt.
