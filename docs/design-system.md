# FlowGate Design System

Frontend foundation for the FlowGate procurement approvals modular monolith.

Stack: Laravel 13 React starter kit, Inertia 3, React 19, TypeScript, Tailwind CSS 4, shadcn/Radix, Lucide.

This document covers presentation tokens, reusable primitives, RTL/LTR usage, status presentation, accessibility, and page composition guidance. It does **not** define backend workflow, authorization, or domain rules.

## Goals

- Restrained enterprise/admin UI suitable for dense operational work
- Arabic-first, fully RTL and LTR capable from the same components
- One component system only (no second UI kit or icon set)
- Presentation concerns stay in the frontend; business totals and workflow decisions remain server-owned

## Directory structure

```text
resources/js/
├── components/
│   ├── ui/          # primitives / design-system building blocks
│   ├── layout/      # app shell, navigation, layout templates
│   └── shared/      # cross-cutting non-domain widgets (auth helpers, etc.)
├── features/
│   ├── purchase-requests/
│   ├── approvals/
│   ├── notifications/
│   └── administration/
├── pages/           # Inertia page entrypoints
├── hooks/
├── lib/             # utilities + presentation helpers
└── types/
```

### Placement rules

| Kind                                               | Location            |
| -------------------------------------------------- | ------------------- |
| Buttons, inputs, table, dialog, badges             | `components/ui`     |
| Sidebar, headers, breadcrumbs, locale switcher     | `components/layout` |
| Auth helpers, settings widgets reused across pages | `components/shared` |
| Domain-specific table/forms for a module           | `features/<module>` |
| Route-facing screens                               | `pages`             |

## Tokens

Tokens live in `resources/css/app.css` as CSS variables and Tailwind v4 `@theme` mappings.

### Color roles

- Surfaces: `--background`, `--card`, `--popover`, `--sidebar`
- Text: `--foreground`, `--muted-foreground`
- Actions: `--primary`, `--secondary`, `--accent`, `--destructive`
- Feedback: `--success`, `--warning`, `--info`
- Chrome: `--border`, `--input`, `--ring`

Prefer semantic classes (`bg-background`, `text-muted-foreground`, `border-border`) over raw color values.

### Status colors (presentation only)

| Status    | Token prefix          |
| --------- | --------------------- |
| draft     | `--status-draft*`     |
| pending   | `--status-pending*`   |
| approved  | `--status-approved*`  |
| rejected  | `--status-rejected*`  |
| completed | `--status-completed*` |
| cancelled | `--status-cancelled*` |

Each status exposes background, foreground, and border tokens for light and dark themes.

### Spacing

Semantic spacing tokens:

- `--spacing-page`
- `--spacing-section`
- `--spacing-stack`
- `--spacing-inline`
- `--spacing-tight`

Page composition should favor compact operational density, not marketing hero spacing.

### Typography

- Base font stack includes `Noto Sans Arabic` first for Arabic-first rendering
- Keep titles tight (`text-xl` / `text-2xl` max in authenticated pages)
- Prefer `text-sm` for table and filter controls

### Radius and elevation

- Base radius: `0.5rem` (8px)
- Small and medium derivatives: 6px via `--radius-sm` / `--radius-md`
- Larger radius utilities are capped at 8px; full circles are reserved for
  avatars and inherently circular controls
- Shadows: `--elevation-xs|sm|md` mapped to `shadow-xs|sm|md`
- Avoid oversized rounded shapes and decorative glass/gradient chrome

### Focus

Interactive controls use a visible focus ring:

```text
focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
```

Do not remove focus styles. Icon-only controls must include an accessible name.

## Primitives

Existing starter primitives are preserved and extended. Prefer these instead of long Tailwind strings in pages.

| Primitive    | Path                          | Notes                                                      |
| ------------ | ----------------------------- | ---------------------------------------------------------- |
| Button       | `components/ui/button`        | default / outline / secondary / ghost / destructive / link |
| IconButton   | `components/ui/icon-button`   | requires `label` for accessibility                         |
| Input        | `components/ui/input`         | disabled / invalid / focus states                          |
| Textarea     | `components/ui/textarea`      | same state treatment as input                              |
| Select       | `components/ui/select`        | Radix select                                               |
| Checkbox     | `components/ui/checkbox`      |                                                            |
| Dialog       | `components/ui/dialog`        |                                                            |
| DropdownMenu | `components/ui/dropdown-menu` |                                                            |
| Badge        | `components/ui/badge`         | generic badge                                              |
| StatusBadge  | `components/ui/status-badge`  | maps presentation statuses only                            |
| Table        | `components/ui/table`         | scannable dense table                                      |
| Pagination   | `components/ui/pagination`    | RTL-aware chevrons                                         |
| FormField    | `components/ui/form-field`    | label + description + ARIA error wiring                    |
| Alert        | `components/ui/alert`         | default / destructive / success / warning / info           |
| EmptyState   | `components/ui/empty-state`   | dashed empty region                                        |
| Skeleton     | `components/ui/skeleton`      | loading placeholders                                       |
| Toast        | `components/ui/sonner`        | flash + imperative toasts                                  |
| PageHeader   | `components/ui/page-header`   | title, description, actions, meta                          |
| FilterBar    | `components/ui/filter-bar`    | filter fields + action slot                                |

### Composition pattern

```tsx
<PageHeader title="..." description="..." actions={...} />
<FilterBar actions={...}>
  <FilterField label="...">{/* control */}</FilterField>
</FilterBar>
<div className="rounded-md border bg-card">
  <Table>...</Table>
</div>
```

## Status presentation

Central config: `resources/js/lib/status/presentation.ts`

Rules:

1. Status keys are presentation labels only: `draft`, `pending`, `approved`, `rejected`, `completed`, `cancelled`
2. The config provides bilingual labels, short descriptions, and CSS classes
3. It must **not** infer next steps, allowed transitions, permissions, or totals
4. Use `StatusBadge` or `getPresentationStatus()` for rendering
5. Backend review states (`pending_manager_review` and
   `pending_procurement_review`) map to the neutral `pending` presentation tone;
   this is a visual alias only

```tsx
import { StatusBadge } from '@/components/ui/status-badge';

<StatusBadge status="pending" locale="ar" />;
```

## Appearance switcher

Reusable control: `components/shared/appearance-switcher.tsx`

- Uses `useAppearance()` only — no separate theme state
- Shared option labels live in `lib/appearance.ts`
- Surface it on welcome, auth layouts, and authenticated top bar
- Settings appearance tabs remain the expanded control for the same options

## Appearance defaults

- First-time visitors default to **light**
- Explicit `light` / `dark` / `system` choices are preserved once selected
- HTML bootstrap (`app.blade.php` + `HandleAppearance`) and React (`initializeTheme`) use the same rule
- `system` follows the OS only after the user chooses it deliberately

## RTL / LTR

- Default locale is Arabic (`ar`) with `dir="rtl"`
- Locale/direction is managed by `hooks/use-direction.tsx`
- `initializeDirection('ar')` runs from `app.tsx`
- `LocaleSwitcher` in the app header toggles `ar` / `en`
- Prefer logical CSS utilities: `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`, `start-*`, `end-*`
- Chevron icons that imply direction should use `rtl:rotate-180` when needed
- The application sidebar moves to the right in RTL and back to the left in LTR

Do not hard-code left/right layout for operational chrome unless a physical direction is truly required.

## Accessibility checklist

- Every icon-only button has `aria-label` / visible `sr-only` text
- Form controls associate labels via `htmlFor` / `FormField`
- Errors use `role="alert"` where appropriate
- Loading regions expose `role="status"` / polite live text when useful
- Focus rings remain visible on keyboard navigation
- Contrast comes from semantic token pairs; avoid low-contrast gray-on-gray text for primary content
- Tables keep header cells as `th` and maintain a clear reading order in both directions

## Authenticated preview

`pages/dashboard.tsx` is a presentation-only shell that demonstrates:

- App sidebar and header
- Page header + filter bar
- Status legend and badges
- Scannable table
- Loading / empty / error affordances
- Arabic/English direction switching
- Preview total as a preformatted display string

Preview data lives in `features/purchase-requests/preview-data.ts` and is clearly labeled as UI demo data. React must not become the source of truth for monetary totals or workflow state.

## Usage guidance

1. Build pages from primitives and feature components, not one-off utility soup
2. Keep domain logic and final calculations on the server
3. Store no authoritative procurement state in React beyond ephemeral UI controls
4. Prefer bilingual label maps colocated with presentation config when both locales are needed
5. When adding a new status appearance, extend the central presentation config and tokens together
6. When adding a repeated control pattern, promote it into `components/ui` or `components/shared`

## Out of scope (by design)

- Backend policies, gates, and authorization
- Workflow transitions and approval rules
- Database schema / migrations
- Server-owned totals and audit calculations
- Second component libraries or alternate icon systems
