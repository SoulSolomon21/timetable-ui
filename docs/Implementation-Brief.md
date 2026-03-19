Here's the full implementation brief. Written to be pasted directly into a Claude Code agent's context.

---

## Timetable UI — Implementation Brief

### Background & intent

This implementation adapts the `lramos33/big-calendar` open-source calendar library (Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, react-dnd) into a domain-specific timetable UI for UCU's Alpha-MIS system. The project lives in a TanStack Start application with TanStack Query already configured.

The big-calendar library was chosen because it provides a well-structured week view time grid, drag-and-drop infrastructure, and a clean module boundary (`src/calendar/`) that makes adaptation straightforward. The adaptation is not a fork — it is a targeted replacement of the library's data model, context, and rendering components while keeping its grid layout engine and DnD primitives intact.

The core architectural constraint driving every decision:  **this is a weekly template timetable, not a dated event calendar** . Slots are positioned by day-of-week and time string, not ISO date. This distinction shapes the data model, the grid rendering, and the ACL boundary.

---

### File inventory

```
src/calendar/
├── types/
│   ├── index.ts                  — domain types (TView, TDayOfWeek, TSessionType, etc.)
│   └── dnd.ts                    — drag item type and IDragItem interface
├── interfaces/
│   └── index.ts                  — ILecturer, IRoom, IProgram, ICourse,
│                                    ITimetableSlot, IConflict, ITimetableFilter,
│                                    ITimetableProviderData
├── contexts/
│   └── timetable-context.tsx     — TimetableProvider, useTimetable hook
├── helpers/
│   ├── slot-colors.ts            — color/session type maps, getSlotDurationPeriods
│   ├── filter-entities.ts        — getFilterEntities, getFilterLabel
│   ├── week-grid-helpers.ts      — period math, grid placement, slot grouping
│   └── conflict-helpers.ts       — enrichConflicts, groupConflictsByType, label helpers
├── hooks/
│   ├── use-slot-drag.ts          — makes a slot card a react-dnd drag source
│   └── use-cell-drop.ts          — makes a background cell a react-dnd drop target
├── mocks/
│   ├── lecturers.ts              — 8 mock ILecturer records
│   ├── rooms.ts                  — 8 mock IRoom records
│   ├── programs.ts               — 8 mock IProgram records
│   ├── slots.ts                  — 22 mock ITimetableSlot records + 3 intentional conflicts
│   └── index.ts                  — barrel re-export
└── components/
    ├── teaching-slot-card.tsx    — the event tile rendered in every grid cell
    ├── conflict-panel.tsx        — collapsible side panel listing all conflicts
    ├── dnd/
    │   └── timetable-dnd-provider.tsx   — react-dnd HTML5Backend wrapper
    └── header/
        ├── filter-switcher.tsx          — dimension tabs + searchable entity combobox
        └── filter-summary-bar.tsx       — slot count + conflict count display
    └── week-and-day-view/
        └── timetable-week-view.tsx      — the main week grid component
```

---

### Data model

#### Core types (`src/calendar/types/index.ts`)

```typescript
type TView            = "week" | "day" | "month" | "year" | "agenda"
type TFilterDimension = "lecturer" | "room" | "program"
type TDayOfWeek       = 0 | 1 | 2 | 3 | 4           // 0 = Monday
type TSessionType     = "lecture" | "tutorial" | "lab" | "seminar" | "exam"
type TBadgeVariant    = "dot" | "colored" | "mixed"
type TSlotColor       = "blue"|"green"|"purple"|"orange"|"red"|"teal"|"yellow"
type TConflictType    = "room_double_booked"|"lecturer_double_booked"|"program_overlap"
```

**Why `TDayOfWeek = 0..4` instead of a full Date?** Timetable slots are weekly templates — they recur every week of a semester. Storing a specific ISO date would mean every slot needs to be re-dated when a semester starts or when the view scrolls to a new week. The `dayOfWeek` integer is the stable, week-agnostic anchor. The grid converts it to a display date on the fly using a reference week derived from the currently viewed date.

#### Core interfaces (`src/calendar/interfaces/index.ts`)

```typescript
interface ILecturer {
  id: string; name: string; title?: string;
  department?: string; picturePath?: string;
}

interface IRoom {
  id: string; name: string; building?: string;
  capacity?: number; type?: "lecture_hall"|"lab"|"seminar_room"|"exam_hall";
}

interface IProgram {
  id: string; name: string; code?: string;
  year?: number; semester?: number;
}

interface ICourse {
  id: string; code: string; title: string; creditUnits?: number;
}

interface ITimetableSlot {
  id: string;
  course: ICourse;
  lecturer: ILecturer;
  room: IRoom;
  program: IProgram;
  dayOfWeek: TDayOfWeek;
  startTime: string;           // "08:00" — 24hr
  endTime: string;             // "10:00"
  sessionType: TSessionType;
  color: TSlotColor;
  hasConflict?: boolean;       // populated by context, not the domain
  conflictIds?: string[];
}

interface IConflict {
  id: string;                  // "${slotA.id}::${slotB.id}::type"
  type: TConflictType;
  slotIds: [string, string];
  dayOfWeek: TDayOfWeek;
  startTime: string;
  description: string;
}

interface ITimetableFilter {
  dimension: "lecturer" | "room" | "program";
  selectedId: string | null;
}
```

**Why embed `ILecturer`, `IRoom`, `IProgram` fully inside `ITimetableSlot` instead of using IDs?** These are view projections, not domain aggregates. The UI layer should never need to join data — it receives a denormalised read model shaped for rendering. Your ACL (Anticorruption Layer) on the Spring Boot side is responsible for assembling these projections. The UI never touches raw Alpha-MIS entities.

**Why `startTime`/`endTime` as strings instead of `Date` objects?** String comparison (`"08:00" < "10:00"`) is sufficient for all overlap detection and grid positioning math. Date objects would require timezone handling, which is unnecessary and dangerous in a timetable context where all times are local UCU time.

---

### State management (`src/calendar/contexts/timetable-context.tsx`)

The context is the central nervous system of the timetable UI. It holds all mutable state and exposes derived computations as stable references.

#### What the context holds

```typescript
// Raw data (injected by the provider)
slots:     ITimetableSlot[]
lecturers: ILecturer[]
rooms:     IRoom[]
programs:  IProgram[]

// View state
selectedDate:   Date
view:           TView
badgeVariant:   TBadgeVariant

// Filter state (replaces big-calendar's single selectedUserId)
filter: ITimetableFilter   // { dimension, selectedId }

// Derived — computed inside useMemo, recomputed only when dependencies change
visibleSlots:       ITimetableSlot[]          // filtered by current filter
conflicts:          IConflict[]               // all pairwise conflicts in full slot list
conflictsBySlotId:  Map<string, IConflict[]>  // O(1) lookup per slot

// Actions
setFilterDimension(dimension)   // switches dimension, resets selectedId to null
setSelectedId(id | null)        // sets entity filter within current dimension
rescheduleSlot(...)             // optimistic update + fires onReschedule callback
addSlot / removeSlot / updateSlot
```

#### Conflict detection

Runs inside `useMemo([slots])`. It is a pure O(n²) pairwise scan — every slot pair is tested for same day + time overlap + shared resource. Three resource types are checked per overlapping pair: room, lecturer, program. This produces up to three separate `IConflict` records per slot pair.

**Why O(n²) and not a smarter algorithm?** A typical UCU timetable has at most 200–300 slots. O(n²) on 300 items is 90,000 iterations — negligible. A smarter bucketed approach (group by day+time, then check within buckets) would be harder to read and maintain for no meaningful performance gain. The `useMemo` ensures it only runs when `slots` changes, not on every render.

#### The `conflictsBySlotId` Map

After conflict detection, conflicts are indexed into a `Map<string, IConflict[]>` keyed by slot ID. This means `TeachingSlotCard` can call `conflictsBySlotId.get(slot.id)` in O(1) rather than filtering the conflict array on every card render. With 50+ cards on screen simultaneously this matters.

#### `onReschedule` callback pattern

The provider accepts an optional `onReschedule` prop. When `rescheduleSlot()` is called (triggered by a DnD drop), it:

1. Applies an optimistic state update to the local `slots` array immediately — the card moves on screen with zero latency.
2. Calls `onReschedule?.(slotId, dayOfWeek, startTime, endTime)` — this is wired in the page component to your React Query mutation.

The separation is intentional: the context owns local UI state, the page owns server state. If the mutation fails, the React Query `onError` handler calls `rescheduleSlot` again with the original values, rolling back the optimistic update.

---

### Helpers

#### `slot-colors.ts`

Maps `TSlotColor` → Tailwind class strings for card background, left accent border, course code text, and conflict ring. Also maps `TSessionType` → badge label and badge colour classes.

`getSlotDurationPeriods(startTime, endTime)` — computes how many 1-hour periods a slot spans. Used by `TeachingSlotCard` to switch between compact (1-period) and full (2+ periods) layout modes.

**Why Tailwind class strings in a map instead of dynamic class construction?** Tailwind's JIT compiler scans source files for class strings at build time. Dynamically constructed strings like ``bg-${color}-50`` are invisible to the scanner and produce no CSS. All classes must appear as complete strings in source. The map pattern is the canonical solution.

#### `filter-entities.ts`

`getFilterEntities(dimension, lecturers, rooms, programs)` — converts the active entity list into a flat `IFilterEntity[]` shape (`{ id, label, sublabel }`) that the combobox consumes without knowing the underlying type. The sublabel is composed from available metadata: for lecturers it's the department, for rooms it's building + capacity, for programs it's code + year + semester.

`getFilterLabel(...)` — returns a human-readable summary for the `FilterSummaryBar`: "All lecturers", "Dr. Mukasa", "LT1", "BSCS Yr2" etc.

#### `week-grid-helpers.ts`

The grid math lives here, entirely decoupled from JSX.

```typescript
DEFAULT_ACADEMIC_PERIODS  // 8:00–18:00, hourly — override per faculty if needed
WEEK_DAYS                 // Mon–Fri with label/short/narrow/dayOfWeek
PERIOD_HEIGHT_PX = 80     // single source of truth for row height
TIME_COL_WIDTH = "56px"
HEADER_ROW_HEIGHT = "44px"

getPeriodIndex(startTime, periods)         // → 0-based index, -1 if outside day
getPeriodSpan(startTime, endTime, periods) // → number of rows to span
groupSlotsByPosition(slots, periods)       // → Map<"day-periodIdx", ITimetableSlot[]>
getGridPlacement(dayOfWeek, startTime, endTime, periods) // → { column, rowStart, rowSpan }
getLongestSlot(slots, periods)             // → slot with largest span in a group
```

**Why group by `"day-periodIdx"` and not `"day-startTime"`?** Period index is stable across different period configurations. If a faculty uses 90-minute periods starting at 08:00, 09:30, 11:00 etc., two slots at "08:00" and "08:30" would produce different keys even though they'd never overlap. The index approach means the key always corresponds to a rendered row, regardless of period boundaries.

**The CSS grid layout** uses `gridTemplateColumns: "56px repeat(5, 1fr)"` and `gridTemplateRows: "44px repeat(N, 80px)"`. Slots are placed with `gridColumn: dayOfWeek + 2` (col 1 = time labels) and `gridRow: periodIndex + 2 / span rowSpan` (row 1 = day header). This is entirely standard CSS grid — no absolute positioning, no pixel arithmetic.

#### `conflict-helpers.ts`

`enrichConflicts(conflicts, slots)` — joins raw `IConflict` records (which only carry slot IDs) with the full slot objects. Produces `IEnrichedConflict[]` which carries `slotA` and `slotB` directly. Silently drops conflicts where a slot ID can't be resolved — defensive against stale state during mutations.

`groupConflictsByType(enriched)` — groups into the three conflict types in a fixed order: room first (hardest to resolve — you can't clone a room), then lecturer, then program.

`conflictEntityLabel(conflict)` — derives the shared resource name for the panel heading: room name, lecturer name with title, or program code + year.

`conflictEntityId(conflict)` — derives the ID to pass to `setSelectedId` when the user clicks "View [entity] →". This wires the conflict panel directly into the filter system.

---

### Components

#### `TeachingSlotCard`

The primary render unit. Every slot in the grid renders through this component.

**Layout modes:**

* Compact (1-period, 80px tall): course code + room + session badge only. Course title and lecturer name are hidden.
* Full (2+ periods, 160px+ tall): course code + course title + room + lecturer + session badge.

The mode switch is driven by `getSlotDurationPeriods`. The decision threshold is 1 period — anything longer gets the full layout. This is deliberate: a 1-hour slot at 80px tall genuinely cannot fit a 4-row layout legibly.

**Conflict rendering:** The card reads `conflictsBySlotId.get(slot.id)` from the context. If conflicts exist: a `ring-2 ring-inset ring-red-400` CSS ring is applied (inset so it doesn't push neighbouring cards), and a small `ConflictBadge` appears in the bottom-right corner showing "Conflict" or "N conflicts". The `ring-inset` is important — it draws inside the card's border box without affecting layout.

**Drag behaviour:** `useSlotDrag(slot)` is called inside the card. It returns a `dragRef` (attached to the card's root div) and `isDragging` (used to set `opacity-50` on the drag ghost). Exam slots have `canDrag: () => false` — they cannot be rescheduled by drag.

**`formatLecturerShort`:** Converts "Dr. John Mukasa" → "Dr. Mukasa" and "John Mukasa" → "J. Mukasa". This saves ~60px of horizontal space in narrow grid cells where the full name would overflow or truncate badly.

#### `FilterSwitcher`

Two parts rendered as a single component:

**Dimension tabs:** A custom tab bar (not shadcn Tabs — too heavy for a 3-item selector) using `role="tablist"` and `aria-selected`. Clicking a tab calls `setFilterDimension()` which switches the dimension and resets `selectedId` to null. The reset is crucial — without it, switching from Lecturer to Room while "Dr. Mukasa" is selected would leave a dangling ID that matches nothing.

**Entity combobox:** A shadcn `Popover` + `Command` (cmdk). The `CommandItem value` prop includes both `label` and `sublabel` concatenated — this makes cmdk's fuzzy search work across both fields. Searching "compu" surfaces "Dr. Mukasa" if his department is "Computer Science". Without the sublabel in value, you can only search by name.

The combobox trigger shows a clear button (X icon) when a filter is active. The X uses `e.stopPropagation()` to prevent clicking it from also opening the popover.

#### `FilterSummaryBar`

A narrow bar sitting between the header and the grid. Shows:

* Current filter label ("Viewing Dr. Mukasa" / "Viewing all rooms")
* Slot count for visible slots
* Conflict count scoped to visible slots only

**Why scope conflict count to visible slots?** If you're viewing Dr. Mukasa's schedule, you only care about conflicts that involve him. Showing the total timetable conflict count while filtered to a single lecturer is misleading noise. The scoped count is computed by building a `Set` of visible slot IDs and filtering the conflict list to those that contain at least one visible ID.

`aria-live="polite"` — the bar announces filter changes to screen readers without interrupting the user.

#### `TimetableWeekView`

The main grid. Renders four layers in a single CSS grid:

1. **Sticky corner** (z-20): top-left cell, sticky on both axes, clips behind both the day headers and time labels when scrolled.
2. **Day header cells** (z-20, sticky top): Mon–Fri column headers. Sticky so they remain visible when scrolling a long day.
3. **Time label cells** (z-10, sticky left): 8:00, 9:00... row labels. Sticky so they remain visible when scrolling horizontally on narrow screens.
4. **Background cells** (z-0): one per (day, period) combination. These are the drop targets — each one runs `useCellDrop`. They also carry the lunch hour shading (`bg-muted/20` at 13:00).
5. **Slot group containers** (z-10): one per unique (day, startTime) group. These span the appropriate grid rows using `gridRow: "N / span M"`.

**SlotGroupContainer:** When a single slot occupies a position, it fills the container 100%. When multiple slots share the same start time (a conflict scenario), they are tiled side-by-side using `flex-row` with `flex: "1 1 0"` on each card. The container spans the height of the longest slot in the group — shorter slots sit at `height: "${pct}%"` aligned to the top. This makes visual duration differences immediately legible without any special conflict-specific layout code.

**`minWidth: 640`** on the grid div prevents it from collapsing below legibility on small screens. The outer scroll container handles overflow.

#### `TimetableDndProvider`

A thin wrapper around react-dnd's `DndProvider` with `HTML5Backend`. It must sit **outside** `TimetableProvider` in the tree. React-dnd's drag manager is a singleton per `DndProvider` — both drag sources (slot cards) and drop targets (background cells) must share the same instance or drag events won't connect.

#### `useSlotDrag`

A hook that calls react-dnd's `useDrag` and attaches the result to a `useRef`. Returns `{ dragRef, isDragging }`.

The `IDragItem` payload carries `slotId`, original day/time, and `durationPeriods`. `durationPeriods` is pre-computed at drag start so the drop handler doesn't need to derive it from the slot list.

`canDrag: () => slot.sessionType !== "exam"` — exam slots are visually present but not draggable.

#### `useCellDrop`

A hook that calls react-dnd's `useDrop`. Each `BackgroundCell` in the week view calls this hook, so there are N×5 active drop targets simultaneously (N = number of periods).

`canDrop` validates two failure cases:

1. **Overflow:** `periodIdx > periods.length - item.durationPeriods`. A 2-hour lab dragged to the 17:00 row would need to span into 18:00+, which doesn't exist. The drop is rejected.
2. **Same position:** `originalDayOfWeek === dayOfWeek && periods[periodIdx].startTime === originalStartTime`. Dropping onto the same cell as the source is a no-op.

On a valid drop, `newEndTime` is computed by walking forward `durationPeriods` steps from the drop target's period index. If the slot lands right at the edge of the academic day, it caps at the last period's `endTime`.

`isOver && canDrop` → `bg-primary/10` (green-ish tint, valid drop zone)
`isOver && !canDrop` → `bg-destructive/10` (red tint, invalid drop zone)

#### `ConflictPanel`

A collapsible side panel that renders alongside the grid (not over it — it occupies real layout space in a `flex-row` container).

**Collapsed state:** Shrinks to a `w-8` vertical strip with just a `PanelRightOpen` icon and a conflict count badge. Expanding restores the full `w-64` panel.

**Conflict rows:** Each row shows the shared resource name, the time anchor ("Thu 8:00"), and the two clashing course codes ("CSC 2201 vs BBA 2205"). A "View [entity] →" button calls `setFilterDimension` + `setSelectedId` together — this instantly refilters the week grid to show just that entity's slots, letting the user see both conflicting cards with their red rings in full context.

**Type ordering:** Room conflicts first, then lecturer, then program. Room conflicts are hardest to resolve (rooms are a fixed physical resource), so they get top priority in the user's attention.

**Empty state:** Shows a green-tinted checkmark area with "No conflicts detected." The green icon on what is normally a red-themed component is intentional — it's a positive state indicator, not a warning.

---

### Mock data (`src/calendar/mocks/`)

22 slots across Mon–Fri, spanning UCU's main faculties: Computer Science (blue), Business Administration (green), Engineering (purple), Education (orange), Theology (yellow), Health Sciences (teal).

Three **intentional conflicts** are included for testing:

* `s4` and `s5`: Dr. Mukasa (l1) assigned to both LT1 and CS Lab 1 on Monday 14:00 → `lecturer_double_booked`
* `s15` and `s16`: Two different courses both assigned to LT1 on Thursday 08:00 → `room_double_booked`
* `s21` and `s22`: Two courses overlapping for the BED Year 2 program on Friday 14:00 → `program_overlap`

These cover all three conflict types and exercise the full conflict detection, conflict badge rendering, and conflict panel rendering stack.

---

### Integration points for the agent

**Things that are complete and should not be re-implemented:**

* The full type and interface layer
* The `TimetableProvider` and `useTimetable` hook
* All five helper modules
* All five hooks
* All components listed above
* The mock data set

**Things that are stubs waiting to be filled in:**

* `src/server/timetable.ts` — all server functions have `// TODO` bodies returning empty arrays or stub values. These need to be wired to the actual Alpha-MIS API client.
* `handleSlotClick` in the page component — currently `console.log`. Needs to open a slot detail/edit dialog.
* `onReschedule` in the page — the mutation hook (`useRescheduleSlot`) is defined but the server function it calls is a stub.

**The `onReschedule` prop** must be threaded from the page into `TimetableProvider`. The provider's `rescheduleSlot` action calls `onReschedule?.(...)` after its optimistic state update. Without this prop wired, DnD will move cards optimistically but never persist the change.

**Tailwind safelist** — all Tailwind classes in `SLOT_COLOR_MAP` and `SESSION_TYPE_META` must appear as complete strings in source (they do — they're in the map object literals). If you extract them to variables, Tailwind's JIT will not see them and the classes will be missing from the production bundle.

**`TimetableDndProvider` placement** — must wrap `TimetableProvider` in the component tree, not be nested inside it. Both share the same react-dnd manager context. Getting this wrong produces a silent failure where drag events fire but drops never register.

**Peer dependencies not yet installed** (if starting from a fresh project):

```bash
npm install react-dnd react-dnd-html5-backend
```

shadcn components used: `Button`, `Command`, `Popover`, `ScrollArea`. Install via `npx shadcn@latest add [component]` if not already present.
