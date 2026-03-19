# UCU Timetable UI — Repository Structure & Work Queue Implementation

## Context

You are working on a university timetable scheduling application called the "bubble" — a
separate bounded context from the main Alpha-MIS system at Uganda Christian University.
This is a React/TypeScript application built with TanStack Router, shadcn/ui, and
date-fns. The application is for a timetabling officer who reviews auto-generated
department timetable drafts, resolves scheduling conflicts, and publishes finalized
timetables for students and lecturers.

Before writing a single line of implementation code, do the following:

---

## Step 1 — Study the Bulletproof React reference

Fetch and read the Bulletproof React repository to understand its recommended project
structure, conventions, and patterns:

  https://github.com/alan2207/bulletproof-react

Specifically focus on:

- The `src/` directory layout — how features, components, hooks, types, and lib are
  separated
- The feature-based folder structure under `src/features/` — each feature owns its
  own components, hooks, types, and api files
- How shared/global concerns (ui primitives, utils, config) are separated from
  feature-specific concerns
- The pattern for co-locating API calls, types, and components within a feature folder
- How route files are kept thin — they import from features, they don't contain logic

Do not proceed past Step 1 until you have read and understood this structure. You will
use it as the primary reference for all decisions about where code lives.

---

## Step 2 — Audit the current repository

Examine the current state of this repository:

- List the full directory tree from `src/`
- Identify what already exists and what is missing
- Identify anything that is misplaced relative to the Bulletproof React pattern
- Note any naming inconsistencies, files in the wrong layer, or missing index files
- Check `package.json` for installed dependencies and note any that are missing for
  the features we are about to build

Report your findings as a structured audit before making any changes. Do not move or
delete anything yet.

---

## Step 3 — Propose and confirm the target structure

Based on the Bulletproof React audit and the feature set of this application, propose
the full target directory structure. Use TanStack Router's directory route convention
throughout — every route segment is a folder, layout routes are `route.tsx` files
inside their folder, and leaf routes are `index.tsx` or named files inside their folder.

The application has the following feature domains:

**Timetabling** (primary feature):

- Work queue — dashboard showing all departments grouped by scheduling status
- Department hub — optional full-overview page per department
- Timetable grid — the big-calendar week view for a specific cohort
- Conflict resolution — side panel for resolving scheduling conflicts
- Publish review — final confirmation before a department goes live

**Shared infrastructure**:

- Semester selector — combobox in the app header for switching academic periods
- Layout — topbar, period context

The target structure should follow this shape, adapted from Bulletproof React:

```
src/
├── app/                          # App entry, providers, global config
│   └── router.tsx                # TanStack Router root definition
│
├── components/                   # Truly global, reusable UI components
│   └── ui/                       # shadcn primitives (do not modify these)
│
├── features/
│   └── timetabling/
│       ├── components/           # Feature-level shared components
│       │   ├── work-queue/
│       │   │   ├── WorkQueue.tsx
│       │   │   ├── WorkQueueSection.tsx
│       │   │   ├── DepartmentRow.tsx
│       │   │   ├── DepartmentExpanded.tsx
│       │   │   └── CohortChip.tsx
│       │   ├── section-cards/
│       │   │   └── SectionCards.tsx
│       │   └── semester-combobox/
│       │       └── SemesterCombobox.tsx
│       ├── hooks/
│       │   └── useDepartmentDraft.ts
│       ├── types/
│       │   └── index.ts
│       └── utils/
│           └── index.ts
│
├── routes/                       # TanStack Router directory-based routes (THIN)
│   ├── __root.tsx                # Root layout
│   └── timetable/
│       ├── route.tsx             # /timetable layout — topbar, semester context
│       ├── index.tsx             # /timetable — work queue page
│       └── $departmentId/
│           ├── route.tsx         # /timetable/$departmentId layout — dept chrome
│           ├── index.tsx         # /timetable/$departmentId — department hub
│           └── $cohortId/
│               ├── route.tsx     # /timetable/$departmentId/$cohortId layout
│               ├── index.tsx     # timetable grid
│               ├── publish.tsx   # publish review
│               └── conflict/
│                   └── $conflictId.tsx   # conflict resolution panel
│
└── lib/                          # Shared utilities, not feature-specific
    └── utils.ts                  # cn(), formatters, etc.
```

### How directory routes work in TanStack Router

Each folder represents a URL segment. The files inside it have specific roles:

- `route.tsx` — layout route for that segment. Renders shared chrome
  (topbar, breadcrumb, etc.) and an `<Outlet />`. Does not render page content itself.
- `index.tsx` — the leaf page rendered at exactly that URL segment,
  rendered inside the parent layout's `<Outlet />`.
- `$paramName/` — a dynamic segment folder. The param is available via
  `Route.useParams()` in any file inside it.
- Named files like `publish.tsx` or `$conflictId.tsx` — additional leaf routes
  at that segment level.

The router picks these up automatically via file-based routing. No manual route
registration is needed beyond the router configuration in `src/app/router.tsx`.

Present this structure and wait for confirmation before proceeding. If you identify
reasons to deviate from this structure based on what you found in the current repo,
explain them clearly.

---

## Step 4 — Restructure the repository

Once the structure is confirmed, restructure the existing repository to match. Rules:

- Move files to their correct locations — do not rewrite their contents yet
- Update all import paths that break as a result of moves
- Add `index.ts` barrel files where they aid imports, but do not over-barrel —
  route files import directly from feature paths, not through deep barrel chains
- Do not modify the `src/components/ui/` shadcn primitives — move them if needed
  but do not alter their contents
- After restructuring, verify the project still compiles with no TypeScript errors

---

## Step 5 — Implement the types

In `src/features/timetabling/types/index.ts`, define the following types. These are
the source of truth — every component in this feature uses these, never local types:

```typescript
export type DepartmentStatus = 
  | 'conflict'    // draft exists, has unresolved conflicts
  | 'ready'       // draft exists, no conflicts, awaiting publish
  | 'pending'     // assignments approved in Alpha-MIS, no draft generated yet
  | 'waiting'     // assignments not yet approved in Alpha-MIS
  | 'published'   // timetable is live

export type CohortStatus = 'conflict' | 'ready' | 'published' | 'pending'

export interface Cohort {
  id: string
  label: string          // e.g. "Year 1", "Cohort 2"
  status: CohortStatus
  conflictCount?: number
}

export interface Program {
  id: string
  name: string           // e.g. "BSc Computer Science"
  code: string           // e.g. "BSCS"
  cohorts: Cohort[]
}

export interface DepartmentDraft {
  id: string
  name: string
  status: DepartmentStatus
  programs: Program[]
  conflictCount?: number
  studentCount?: number
  unitCount?: number
  generatedAt?: Date
  publishedAt?: Date
  assignmentsApprovedAt?: Date
}

export type SemesterName = 'Easter' | 'Trinity' | 'Advent'

export interface Semester {
  id: string
  name: SemesterName
  year: number
  startDate: string
  endDate: string
}
```

---

## Step 6 — Implement the work queue feature

This is the primary implementation task. Build the following components in
`src/features/timetabling/components/work-queue/`:

### 6a — CohortChip.tsx

A small pill/chip component for a single cohort. It is the clickable element that
navigates the officer to the timetable grid for that cohort.

Requirements:

- Renders the cohort label (e.g. "Year 1")
- Shows a small coloured dot indicating status: red for conflict, green for ready,
  muted for published
- If status is 'conflict', appends the conflict count: "Year 1 · 2 conflicts"
- If status is 'published', appends "· published" in muted text
- Uses shadcn Badge or a custom pill — match the visual style from the wireframes
- On click, calls an `onSelect` prop: `(cohortId: string) => void`
- The parent (DepartmentExpanded) is responsible for navigation

### 6b — DepartmentExpanded.tsx

The inline expansion panel that appears below a department row when it is clicked open.

Requirements:

- Receives a `DepartmentDraft` and renders its `programs` array
- Each program is a row: program name on the left (fixed width, truncated), cohort
  chips on the right (wrapping flex)
- Program name column width: fixed at ~200px, does not shrink
- Cohort chips wrap naturally if there are many cohorts
- At the bottom, a footer shows:
  - Left: draft generation time and student count (muted text)
  - Right: "Full overview →" button that navigates to `/timetable/${dept.id}`
- Uses `formatDistanceToNow` from date-fns — imported from
  `src/features/timetabling/utils/index.ts`, not inline

### 6c — DepartmentRow.tsx

A single department row in the work queue. Can be collapsed (default) or expanded.

Requirements:

- Props: `dept: DepartmentDraft`, `onCohortSelect: (deptId, cohortId) => void`,
  `onGenerateRequest: (deptId) => void`
- Renders: status icon, department name, cohort/program/student meta, status badge,
  chevron or action button
- Clicking the row header toggles expansion state (local useState)
- When expanded, renders `<DepartmentExpanded>` below the header
- Chevron rotates 90deg when expanded — use a CSS transition, not JS
- For 'pending' status: row does NOT expand — a "Generate" button appears on the
  right and calls `onGenerateRequest`. No cohort chips exist yet.
- For 'waiting' and 'published' status: row is not clickable, opacity reduced
- Status icon colours:
  - conflict: destructive/danger palette
  - ready: green palette
  - pending: blue palette
  - waiting/published: muted

### 6d — WorkQueueSection.tsx

A labelled group of department rows sharing the same status.

Requirements:

- Props: `status: DepartmentStatus`, `departments: DepartmentDraft[]`,
  `onCohortSelect`, `onGenerateRequest`
- Returns null if `departments` is empty
- Renders a section header: status label, description, department count badge
- Renders a list of `<DepartmentRow>` components separated by a subtle divider
- Section labels and descriptions:
  - conflict: "Needs attention" / "Resolve conflicts before publishing is available"
  - ready: "Ready to review" / "Draft generated, no conflicts found"
  - pending: "Ready to generate" / "Teaching assignments approved — no draft yet"
  - waiting: "Awaiting teaching assignments" / "Assignments not yet approved in Alpha-MIS"
  - published: "Published" / "Timetable is live for students and lecturers"

### 6e — WorkQueue.tsx

The top-level work queue component. Orchestrates sections and handles navigation.

Requirements:

- Uses mock data for now — structured as `DepartmentDraft[]` with nested programs
  and cohorts. Include at least 2 departments per status group.
- Mark mock data clearly: `// TODO: replace with useQuery(departmentDraftsQuery(semesterId))`
- Groups departments by status using `statusOrder`:
  `['conflict', 'ready', 'pending', 'waiting', 'published']`
- `handleCohortSelect(deptId, cohortId)`: navigates to
  `/timetable/${deptId}/${cohortId}` using TanStack Router's `useNavigate`
- `handleGenerateRequest(deptId)`: logs for now with a TODO comment
- Empty state: if ALL groups are empty, shows a centred card
- Renders sections inside `flex flex-col gap-4 px-4 lg:px-6`

---

## Step 7 — Implement the route files

Create the following route files using the directory convention. Every route file
must be thin — import from `src/features/`, never define component logic inline.

### `src/routes/timetable/route.tsx` — timetable layout

This is the shared layout for every screen under `/timetable`. It renders:

- The application topbar: wordmark, nav links (Scheduling, Rooms, Lecturers),
  `<SemesterCombobox />`, user avatar initials
- `<Outlet />` below the topbar for child routes to render into
- Local state for the selected semester for now, with a TODO marking where a
  context provider or search param will replace it

```tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SemesterCombobox } from '@/features/timetabling/components/semester-combobox/SemesterCombobox'

export const Route = createFileRoute('/timetable')({
  component: TimetableLayout,
})

function TimetableLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header>...</header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
```

### `src/routes/timetable/index.tsx` — work queue page

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { SectionCards } from '@/features/timetabling/components/section-cards/SectionCards'
import { WorkQueue } from '@/features/timetabling/components/work-queue/WorkQueue'

export const Route = createFileRoute('/timetable/')({
  component: WorkQueuePage,
})

function WorkQueuePage() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <SectionCards />
      <WorkQueue />
    </div>
  )
}
```

### `src/routes/timetable/$departmentId/route.tsx` — department layout

Renders the department-scoped chrome shared by the hub, grid, and publish screens:

- Back link to `/timetable`
- Breadcrumb showing department name (from route params for now, loader later)
- `<Outlet />` for child routes
- Note: the conflict count badge and "Publish dept" button live here — stub them
  as static elements for now with TODO comments

### `src/routes/timetable/$departmentId/index.tsx` — department hub

Placeholder page. Shows:

- The `departmentId` param value
- A back link
- A "Department hub coming soon" message
- This route must exist as a valid destination because `DepartmentExpanded` links to it

### `src/routes/timetable/$departmentId/$cohortId/route.tsx` — cohort layout

Stub layout. Renders `<Outlet />` with a cohort-level topbar placeholder.

### `src/routes/timetable/$departmentId/$cohortId/index.tsx` — timetable grid

Stub page. Shows department and cohort params. Placeholder for the big-calendar
grid view. Include a comment: `// TODO: render adapted big-calendar week view`

### `src/routes/timetable/$departmentId/$cohortId/publish.tsx` — publish review

Stub page. Shows params and a "Publish review coming soon" placeholder.

### `src/routes/timetable/$departmentId/$cohortId/conflict/$conflictId.tsx` — conflict panel

Stub page. Shows conflict ID param and a "Conflict resolution panel coming soon"
placeholder. Note in a comment that this will render as a side panel over the grid,
not a full page — the layout approach will be revisited when the grid is built.

---

## Step 8 — Verify and report

After completing all steps:

1. Run `tsc --noEmit` and fix all TypeScript errors
2. Confirm all imports resolve correctly — no broken paths
3. List every file that was created, moved, or modified
4. List every TODO left in the code with its file path and line number
5. Flag any decisions that deviated from these instructions and explain why

---

## Constraints and rules throughout

- Never use `any` — all types must be explicit
- Route files must stay thin — no business logic, no inline component definitions
- Mock data lives in the feature component file, clearly marked with a TODO comment
- Do not install new dependencies without stating what you are installing and why
- Do not modify files inside `src/components/ui/` — these are shadcn primitives
- If unsure where something belongs, default to the Bulletproof React pattern
  studied in Step 1
- Use `Route.useParams()` inside route components to access URL params — never
  read from `window.location` directly
- Commit nothing — implement and report
