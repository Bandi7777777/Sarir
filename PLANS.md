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

NOT ask the user “should I continue?” unless there is a blocking error.

Keep the app buildable at every step.

Follow the shared layouts and design system defined in AGENTS.md.
