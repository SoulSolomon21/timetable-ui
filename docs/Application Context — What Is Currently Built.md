# UCU Timetable UI — Application Context

> **Purpose of this document:** Project-wide inventory of everything currently implemented in this
> application. Use this as the reference before starting any new feature work so you understand
> what already exists, where it lives, and how the pieces connect.
>
> Last updated: 2026-03-19

---

## What this application is

The UCU Timetable UI is a standalone React/TypeScript application — a "bubble" — that sits next to
Uganda Christian University's main Alpha-MIS system. It is the tool used by a **timetabling officer**
to review auto-generated department timetable drafts, resolve scheduling conflicts, and publish
finalized timetables for students and lecturers.

It is **not** a general event calendar. It is a **weekly template timetable editor** — slots are
positioned by day-of-week and time string, not ISO dates. This distinction shapes every data model
and layout decision in the codebase.

### Tech stack

| Concern | Technology |
|---|---|
| Framework | React 19 + TypeScript (strict, no `any`) |
| Routing | TanStack Router (directory-based file routes) |
| Server state | TanStack Query (configured, not yet wired to API) |
| UI primitives | shadcn/ui + Tailwind CSS |
| Drag and drop | react-dnd with HTML5Backend |
| Date utilities | date-fns |
| Build | Vite |

---

## Architecture overview

The application follows the **Bulletproof React** feature-based architecture:

```
src/
├── app/                          # (router entry point is src/router.tsx — not yet moved)
├── components/ui/                # shadcn primitives — never modified
├── features/
│   ├── timetabling/              # Work queue, section cards, semester picker
│   └── calendar/                 # Week grid, drag-drop, conflict detection
├── routes/                       # TanStack Router file routes (thin — import from features)
│   ├── __root.tsx
│   ├── dashboard/                # Existing dashboard (separate concern, not described here)
│   └── timetable/                # All timetabling screens
├── lib/utils.ts                  # cn(), shared formatters
└── hooks/                        # Global hooks (use-mobile, use-breadcrumbs)
```

Route files are **thin** — they import from `src/features/` and render. No business logic or
component definitions live in route files.

---

## Feature: Timetabling (`src/features/timetabling/`)

This feature owns the outer shell of the timetable section: the work queue, semester picker, and
section summary cards.

### Types (`src/features/timetabling/types/index.ts`)

The canonical domain types for the timetabling officer's view of the world. Every component in this
feature uses these — never inline or local types.

```
DepartmentStatus  = 'conflict' | 'ready' | 'pending' | 'waiting' | 'published'
CohortStatus      = 'conflict' | 'ready' | 'published' | 'pending'
SemesterName      = 'Easter' | 'Trinity' | 'Advent'

Cohort            { id, label, status, conflictCount? }
Program           { id, name, code, cohorts: Cohort[] }
DepartmentDraft   { id, name, status, programs, conflictCount?, studentCount?,
                    unitCount?, generatedAt?, publishedAt?, assignmentsApprovedAt? }
Semester          { id, name, year, startDate, endDate }
```

**`DepartmentStatus` semantics:**
- `conflict` — a draft exists but has unresolved scheduling conflicts
- `ready` — a draft exists with no conflicts, waiting for the officer to publish
- `pending` — teaching assignments are approved in Alpha-MIS but no draft has been generated yet
- `waiting` — assignments have not yet been approved in Alpha-MIS
- `published` — timetable is live for students and lecturers

### Utils (`src/features/timetabling/utils/index.ts`)

Re-exports `formatDistanceToNow` from date-fns. All feature components import this from here rather
than directly from date-fns so the import path is consistent and the wrapper can be extended later.

### Components

#### Work Queue (`src/features/timetabling/components/work-queue/`)

The primary dashboard view. Displays all departments for the selected semester, grouped by status,
so the timetabling officer can see at a glance what needs attention.

**`WorkQueue.tsx`** — top-level orchestrator.
- Holds mock `DepartmentDraft[]` data (marked with TODO to replace with `useQuery`)
- Groups departments by `DepartmentStatus` in the fixed order: conflict → ready → pending →
  waiting → published
- `handleCohortSelect(deptId, cohortId)` navigates to `/timetable/$departmentId/$cohortId`
- `handleGenerateRequest(deptId)` is a stub (TODO: POST to API)
- Renders an empty state card if all groups are empty

**`WorkQueueSection.tsx`** — a labelled card grouping departments of the same status.
- Returns `null` if its department list is empty (clean, no empty sections rendered)
- Shows a section header (label, description, department count badge) and a list of `DepartmentRow`
  components separated by subtle dividers

**`DepartmentRow.tsx`** — a single department row with inline expansion.
- Expandable for `conflict` and `ready` departments (local `useState` for open/close)
- Not expandable for `waiting` and `published` (rendered at reduced opacity)
- Pending departments show a "Generate" button instead of expansion
- Chevron rotates 90° on expand using a CSS transition (`transition-transform duration-200`)
- When expanded, renders `DepartmentExpanded` below the header

**`DepartmentExpanded.tsx`** — the inline expansion panel showing programs and cohorts.
- Receives a `DepartmentDraft` and renders its `programs` array
- Each program: fixed-width name (200px, truncated) on the left, `CohortChip` row on the right
- Footer: draft generation time and student count on the left, "Full overview →" link on the right
  navigating to `/timetable/$departmentId`

**`CohortChip.tsx`** — a small pill for a single cohort.
- Coloured status dot: red for conflict, green for ready, muted for published
- Conflict count appended: "Year 1 · 2 conflicts"
- Published state appended: "Year 1 · published"
- On click: calls `onSelect(cohortId)` — the parent handles navigation

#### Section Cards (`src/features/timetabling/components/section-cards/SectionCards.tsx`)

A row of summary stat cards displayed above the work queue on the `/timetable` page. Shows
high-level numbers for the current semester (e.g. total departments, conflicts, etc.). Content is
currently populated from the existing stats-cards component.

#### Semester Combobox (`src/features/timetabling/components/semester-combobox/SemesterCombobox.tsx`)

A searchable combobox displayed in the timetable topbar for switching the active academic semester.
- Uses the `Semester` type from `src/features/timetabling/types`
- Currently hardcodes Easter/Trinity/Advent semesters for 2024–2026 (TODO: replace with
  `useQuery(semestersQuery)`)
- Uses the custom `Combobox` + `Item` shadcn primitives from `src/components/ui/`

---

## Feature: Calendar (`src/features/calendar/`)

This feature is the timetable grid itself — the week view, drag-and-drop rescheduling, filter
system, and conflict panel. It is self-contained: the route page mounts the providers and the
feature handles all internal state.

### Design principle

Slots are weekly templates, not dated events. `ITimetableSlot.dayOfWeek` is an integer (0=Mon,
4=Fri) and `startTime`/`endTime` are 24-hour strings ("08:00"). There are no ISO dates, no
`Date` objects, and no timezone concerns inside the calendar feature.

### Types (`src/features/calendar/types/index.ts`)

```
TView            = 'week' | 'day' | 'month' | 'year' | 'agenda'
TFilterDimension = 'lecturer' | 'room' | 'program'
TDayOfWeek       = 0 | 1 | 2 | 3 | 4         (Mon–Fri only)
TSessionType     = 'lecture' | 'tutorial' | 'lab' | 'seminar' | 'exam'
TBadgeVariant    = 'dot' | 'colored' | 'mixed'
TSlotColor       = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'yellow'
TConflictType    = 'room_double_booked' | 'lecturer_double_booked' | 'program_overlap'
```

DnD types (`src/features/calendar/types/dnd.ts`):

```
DRAG_TYPE_SLOT  — string constant identifying the drag item type for react-dnd
IDragItem       { type, slotId, originalDayOfWeek, originalStartTime, originalEndTime,
                  durationPeriods }
```

### Interfaces (`src/features/calendar/interfaces/index.ts`)

The full domain model for the calendar. These are denormalized read projections — the UI never
joins data:

```
ILecturer   { id, name, title?, department?, picturePath? }
IRoom       { id, name, building?, capacity?, type? }
IProgram    { id, name, code?, year?, semester? }
ICourse     { id, code, title, creditUnits? }

ITimetableSlot {
  id, course, lecturer, room, program,
  dayOfWeek: TDayOfWeek,
  startTime: string,   // "08:00"
  endTime: string,     // "10:00"
  sessionType: TSessionType,
  color: TSlotColor,
  hasConflict?: boolean,     // populated by context, not the domain
  conflictIds?: string[]
}

IConflict {
  id,                         // "${slotA.id}::${slotB.id}::type"
  type: TConflictType,
  slotIds: [string, string],
  dayOfWeek, startTime, description
}

ITimetableFilter { dimension: TFilterDimension, selectedId: string | null }
```

### Context (`src/features/calendar/contexts/TimetableContext.tsx`)

The central nervous system of the calendar. Holds all mutable state and exposes derived
computations as stable references via `useMemo`.

**State held:**
- `slots`, `lecturers`, `rooms`, `programs` — raw data injected by the provider
- `selectedDate`, `view`, `badgeVariant` — view state
- `filter: ITimetableFilter` — active dimension + selected entity

**Derived state (computed in useMemo):**
- `visibleSlots` — filtered by the current `filter`
- `conflicts` — all pairwise conflicts detected across the full slot list
- `conflictsBySlotId` — `Map<string, IConflict[]>` for O(1) lookup per slot card

**Actions exposed:**
- `setFilterDimension(dimension)` — switches dimension, resets selectedId to null
- `setSelectedId(id | null)` — sets entity filter within current dimension
- `rescheduleSlot(slotId, dayOfWeek, startTime, endTime)` — optimistic state update, then calls
  `onReschedule?.(...)` prop (wired to the mutation in the page component)
- `addSlot`, `removeSlot`, `updateSlot`

**Conflict detection** runs inside `useMemo([slots])` — pure O(n²) pairwise scan checking room,
lecturer, and program overlap for every slot pair on the same day and time. At most 300 slots per
timetable makes this negligible. The `conflictsBySlotId` Map indexes results for O(1) card lookups.

**`onReschedule` pattern:** The provider accepts an optional `onReschedule` prop. `rescheduleSlot`
applies an optimistic update immediately, then calls the prop. If the mutation fails, the React
Query `onError` handler calls `rescheduleSlot` again with original values to roll back.

### Helpers

**`SlotColors.ts`** — Maps `TSlotColor` → Tailwind class strings for card background, left accent
border, course code text, and conflict ring. Also maps `TSessionType` → badge label/colour.
`getSlotDurationPeriods(startTime, endTime)` — computes how many 1-hour periods a slot spans.
All Tailwind classes appear as complete strings (not interpolated) so JIT can scan them.

**`FilterEntities.ts`** — `getFilterEntities(dimension, lecturers, rooms, programs)` converts the
active entity list into `IFilterEntity[]` (`{ id, label, sublabel }`) for the combobox.
`getFilterLabel(...)` returns a human-readable summary for the FilterSummaryBar.

**`WeekGridHelpers.ts`** — All grid math, fully decoupled from JSX:
```
DEFAULT_ACADEMIC_PERIODS  — 08:00–18:00, hourly
WEEK_DAYS                 — Mon–Fri with label/short/narrow/dayOfWeek
PERIOD_HEIGHT_PX = 80     — single source of truth for row height
TIME_COL_WIDTH = "56px"
HEADER_ROW_HEIGHT = "44px"

getPeriodIndex(startTime, periods)          → 0-based index, -1 if outside day
getPeriodSpan(startTime, endTime, periods)  → number of rows to span
groupSlotsByPosition(slots, periods)        → Map<"day-periodIdx", ITimetableSlot[]>
getGridPlacement(dayOfWeek, startTime, endTime, periods) → { column, rowStart, rowSpan }
getLongestSlot(slots, periods)             → slot with largest span in a group
```
The CSS grid uses `gridTemplateColumns: "56px repeat(5, 1fr)"` and
`gridTemplateRows: "44px repeat(N, 80px)"`. Slots are placed with `gridColumn: dayOfWeek + 2`
and `gridRow: periodIndex + 2 / span rowSpan`. No absolute positioning, no pixel arithmetic.

**`ConflictHelpers.ts`** — `enrichConflicts(conflicts, slots)` joins raw conflict records with full
slot objects to produce `IEnrichedConflict[]`. `groupConflictsByType(enriched)` groups into the
three conflict types in fixed priority order (room → lecturer → program). `conflictEntityLabel`,
`conflictEntityId`, `conflictTimeLabel` produce display strings and filter IDs for the panel.

### Hooks

**`useSlotDrag(slot, periods?)`** — wraps react-dnd `useDrag`. Returns `{ dragRef, isDragging }`.
Attaches the ref to the card's root div. `canDrag` returns false for exam slots (they cannot be
rescheduled). The `IDragItem` payload includes `durationPeriods` pre-computed at drag start.

**`useCellDrop({ dayOfWeek, periodIdx, periods? })`** — wraps react-dnd `useDrop`. Returns
`{ dropRef, isOver, canDrop }`. Each background cell in the grid calls this hook (N×5 active drop
targets simultaneously). `canDrop` rejects overflow (slot would extend past the last period) and
same-position drops. On a valid drop: computes `newEndTime` by walking forward `durationPeriods`
steps, then calls `rescheduleSlot`.

### Components

**`TimetableDndProvider`** (`components/dnd/TimetableDNDProvider.tsx`) — thin wrapper around
react-dnd `DndProvider` with `HTML5Backend`. Must be the outermost wrapper in the tree — both drag
sources and drop targets must share the same react-dnd manager instance.

**`TeachingSlotCard`** (`components/TeachingSlotCard.tsx`) — the event tile rendered in every grid
cell. Two layout modes:
- Compact (1-period, 80px): course code + room + session badge only
- Full (2+ periods): adds course title + lecturer name

Reads `conflictsBySlotId.get(slot.id)` for O(1) conflict lookup. Applies `ring-2 ring-inset
ring-red-400` and a `ConflictBadge` when conflicts exist. `useSlotDrag` is called inside to make
the card a drag source. `formatLecturerShort` converts "Dr. John Mukasa" → "Dr. Mukasa".

**`TimetableWeekView`** (`components/week-and-day-view/TimetableWeekView.tsx`) — the main grid.
Renders five layers in a single CSS grid:
1. Sticky corner cell (z-20) — top-left, clips behind scrolled content
2. Day header cells (z-20, sticky top) — Mon–Fri labels, own internal sticky headers
3. Time label cells (z-10, sticky left) — 08:00, 09:00… row labels
4. Background cells (z-0) — one per (day, period), each a `useCellDrop` drop target, lunch
   shading at 13:00
5. Slot group containers (z-10) — one per unique (day, startTime) group, spanning grid rows

When multiple slots share the same start time (conflict scenario), they are tiled side-by-side
using `flex-row` with `flex: "1 1 0"` on each card.

**`FilterSwitcher`** (`components/header/FilterSwitcher.tsx`) — two parts:
- Dimension tab bar (custom `role="tablist"`, not shadcn Tabs): Lecturer / Room / Program. Clicking
  calls `setFilterDimension()` which also resets `selectedId` to null.
- Entity combobox (shadcn `Popover` + `Command`): searches by label + sublabel concatenated so
  fuzzy search works across both fields. Shows a clear (X) button when a filter is active.

**`FilterSummaryBar`** (`components/header/FilterSummaryBar.tsx`) — narrow bar showing the current
filter label, visible slot count, and conflict count scoped to visible slots only. Has
`aria-live="polite"` for accessibility.

**`ConflictPanel`** (`components/ConflictPanel.tsx`) — collapsible side panel alongside the grid:
- Collapsed: `w-8` vertical strip with just an icon and conflict count badge
- Expanded: `w-64` panel showing grouped conflict rows
- Each conflict row: shared resource name, time anchor, two clashing course codes
- "View [entity] →" button calls `setFilterDimension` + `setSelectedId` together, instantly
  refiltering the grid to show the conflicting cards in context
- Type order: room → lecturer → program (room conflicts hardest to resolve, highest priority)
- Empty state: green-tinted checkmark area when no conflicts detected

### Mock data (`src/features/calendar/mocks/`)

22 slots across Mon–Fri covering: Computer Science (blue), Business Administration (green),
Engineering (purple), Education (orange), Theology (yellow), Health Sciences (teal).

Three intentional conflicts for testing:
- `s4` + `s5`: Dr. Mukasa assigned to two rooms simultaneously on Monday 14:00 → `lecturer_double_booked`
- `s15` + `s16`: Two courses both in LT1 on Thursday 08:00 → `room_double_booked`
- `s21` + `s22`: Two courses overlapping for BED Year 2 on Friday 14:00 → `program_overlap`

These exercise the full conflict detection, badge rendering, and conflict panel stack.

---

## Route tree (`src/routes/timetable/`)

All route files are thin — no logic, only imports from features and layout composition.

```
/timetable                           route.tsx   TimetableLayout
/timetable/                          index.tsx   WorkQueuePage
/timetable/$departmentId             route.tsx   DepartmentLayout
/timetable/$departmentId/            index.tsx   DepartmentHubPage
/timetable/$departmentId/$cohortId   route.tsx   CohortLayout
/timetable/$departmentId/$cohortId/  index.tsx   TimetableGridPage   ← calendar lives here
/timetable/$departmentId/$cohortId/publish.tsx   PublishReviewPage
/timetable/$departmentId/$cohortId/conflict/$conflictId.tsx  ConflictResolutionPage (stub)
```

### `/timetable` — TimetableLayout

The outermost shell for all timetabling screens. Renders a fixed topbar with:
- UCU Timetable wordmark + CalendarDaysIcon
- Nav links: Scheduling (active), Rooms (disabled stub), Lecturers (disabled stub)
- `SemesterCombobox` from `src/features/timetabling/components/semester-combobox/`
- Timetabling Officer avatar (initials "TO")
- `<Outlet />` below for child routes

### `/timetable/` — WorkQueuePage

The main dashboard. Renders:
1. `SectionCards` — summary stats row at the top
2. `WorkQueue` — the full work queue with all department sections

### `/timetable/$departmentId` — DepartmentLayout

Minimal breadcrumb layout: "Work queue / [departmentId]" (raw param for now, TODO: loader for
human-readable name). Renders `<Outlet />`.

### `/timetable/$departmentId/` — DepartmentHubPage

Full department overview page. Renders:
1. **Department header card** — avatar with initials, department name, meta (semester, programs,
   cohorts, lecturers), status badges, "Publish all ready" button (TODO: wire to API)
2. **Stats row** — 4-card grid: total cohorts, unresolved conflicts, students affected, lecturers
   assigned (hardcoded mock values, TODO)
3. **Programs section** — one card per program, each with cohort rows showing:
   - Status bar (thin colour-coded fill indicating conflict/ready/published)
   - Conflict count or status text
   - "Open grid →" / "View →" button navigating to the cohort timetable

### `/timetable/$departmentId/$cohortId` — CohortLayout

The calendar shell. Renders a full-viewport layout with:

**Topbar (`h-12`):**
- Breadcrumb: Work queue → [departmentId] → [cohortId]
- Right: conflict count button (destructive, shows count when > 0), Export PDF button, Publish
  cohort button (green styling, disabled when conflicts exist, links to publish page when clear)

**Left sidebar (`w-52`, scrollable):**
- **Cohorts** — navigation list for all cohorts in this department. Active cohort highlighted.
  Each item shows a coloured status dot.
- **Conflicts (N)** — shown when `conflictCount > 0`. Cards linking to the conflict panel route.
- **Legend** — colour key for the programs visible in the grid.

Both the conflict count and mock cohort/conflict lists are hardcoded with TODO comments to be
replaced by loader data.

**Calendar area (flex-1):** Renders `<Outlet />` — the calendar page fills this space.

### `/timetable/$departmentId/$cohortId/` — TimetableGridPage

The live timetable grid. Renders:

```
TimetableDndProvider
  └── TimetableProvider (slots, lecturers, rooms, programs)
        ├── FilterSummaryBar + FilterSwitcher  (top bar inside the area)
        └── flex-row:
              ├── TimetableWeekView  (flex-1, overflow-auto)
              └── ConflictPanel      (fixed-width, collapsible)
```

All data is mock (TODO: wire `onReschedule` to a mutation, replace mock data with API query).

### `/timetable/$departmentId/$cohortId/publish` — PublishReviewPage

Full publish review page inside the cohort layout. Renders:
1. **Status banner** — green card with checkmark when all conflicts resolved, destructive when not
2. **Course unit table** — shadcn Table with columns: Course unit, Slots, Room, Lecturer (mock rows)
3. **What happens on publish** — card listing 4 consequences (students, lecturers, rooms, Alpha-MIS)
4. **Warning alert** — note about lecturer preferences not captured in the draft
5. **Sticky footer** — draft metadata + "Back to grid" + "Publish cohort" button

All values are hardcoded mock data (TODO: replace with loader).

### `/timetable/$departmentId/$cohortId/conflict/$conflictId` — ConflictResolutionPage

Stub only. Renders a centred placeholder in the calendar area. Final behaviour: will render as a
right-side panel overlaid on the timetable grid (layout approach TBD when the calendar is wired).

---

## Shared components (`src/components/ui/`)

shadcn primitives installed and available:

| Component | Notes |
|---|---|
| `Alert`, `AlertTitle`, `AlertDescription` | Used in publish review page |
| `Avatar` | Available |
| `Badge` | Used throughout |
| `Breadcrumb` (+ sub-components) | Used in layout topbars |
| `Button` | Used throughout |
| `Card` (+ sub-components) | Used throughout |
| `Checkbox` | Available |
| `Command` | Used inside FilterSwitcher combobox |
| `Combobox` (+ sub-components) | Custom — used in SemesterCombobox |
| `Dialog` | Available |
| `Drawer` | Available |
| `DropdownMenu` | Available |
| `Input`, `InputGroup` | Available |
| `Item`, `ItemContent`, `ItemTitle` | Custom — used in SemesterCombobox |
| `Label` | Available |
| `Popover` | Used inside FilterSwitcher |
| `ScrollArea` | Used in cohort sidebar |
| `Select` | Available |
| `Separator` | Available |
| `Sheet` | Available |
| `Skeleton` | Available |
| `Sonner` (toast) | Available |
| `Table` (+ sub-components) | Used in publish review page |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Available |
| `Textarea` | Available |
| `Toggle`, `ToggleGroup` | Available |
| `Tooltip` (+ sub-components) | Available |

---

## Open TODOs (by category)

### Data wiring (most critical path)
- All mock data in `WorkQueue.tsx` → replace with `useQuery(departmentDraftsQuery(semesterId))`
- `SemesterCombobox` → replace mock semesters with `useQuery(semestersQuery)`
- `TimetableGridPage` → wire `onReschedule` prop to a TanStack Query mutation
- `TimetableGridPage` → replace `MOCK_SLOTS`, `MOCK_LECTURERS`, `MOCK_ROOMS`, `MOCK_PROGRAMS`
  with API data keyed on `departmentId` + `cohortId` + `semesterId`
- All publish review page values → replace with loader data
- Department hub page values → replace with loader data

### Loaders (breadcrumbs + names)
- `/timetable/$departmentId` breadcrumb shows raw param — needs loader to resolve department name
- `/timetable/$departmentId/$cohortId` breadcrumb shows raw params — needs loader for both
- `CohortLayout` sidebar mock cohort list → replace with loader data
- `CohortLayout` conflict list → replace with live conflict data from context or loader
- `CohortLayout` `conflictCount` hardcoded to 2 → wire from context

### Stubs
- `handleGenerateRequest` in `WorkQueue.tsx` → POST `/api/timetable/generate`
- `handleSlotClick` in calendar → open slot detail/edit dialog
- "Export PDF" button → not implemented
- "Week template" button → week-picker or template selector not designed yet
- "Publish all ready" on department hub → not wired
- "Publish cohort" action → not wired (button exists, no mutation)
- Rooms nav link in timetable topbar → screen not built
- Lecturers nav link in timetable topbar → screen not built
- `src/server/timetable.ts` → all server functions are stubs returning empty arrays

### Infrastructure
- `src/router.tsx` → should move to `src/app/router.tsx` but requires Vite config update
- Semester context → currently local state in layout; should be a URL search param or context
  provider so semester selection persists across route changes
- Stale redirect shim at `$departmentId/conflict/$conflictId/index.tsx` → delete once TanStack
  Router codegen no longer references it

---

## What is explicitly NOT in scope yet

- Room scheduling screen
- Lecturer schedule screen
- Slot detail / edit dialog
- Any real API integration (all data is mock)
- Authentication / user session
- Student-facing or lecturer-facing timetable views
- PDF export
- Multi-week or dated views (the grid is a weekly template only)
