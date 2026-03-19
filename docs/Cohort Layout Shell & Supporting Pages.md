# UCU Timetable — Cohort Layout Shell & Supporting Pages

## Context

This is the UCU timetable bubble application. You are implementing the cohort-level
layout shell and three supporting pages: the department hub, the publish review page,
and a stub for the conflict panel. The big-calendar week view component will be
implemented separately — your job is to build everything around it so it can be
dropped in cleanly.

The application uses:

- TanStack Router (directory-based file routes)
- shadcn/ui for all UI primitives
- Tailwind CSS
- TypeScript (strict, no `any`)
- date-fns for date formatting
- Types from `src/features/timetabling/types/index.ts`

Before writing any code, read the existing codebase structure to understand what
already exists, then implement the following in order.

---

## Step 1 — Read and understand what exists

Examine these files before touching anything:

- `src/features/timetabling/types/index.ts` — the type definitions
- `src/features/timetabling/components/work-queue/` — existing work queue components
- `src/routes/timetable/` — the existing route tree
- `src/components/ui/` — available shadcn primitives

List the shadcn components that are already installed. You will use these rather than
building custom components. The ones most relevant to this work are:
`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`,
`Badge`, `Button`, `Separator`, `Breadcrumb`, `Alert`, `AlertTitle`,
`AlertDescription`, `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`,
`TableCell`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `ScrollArea`,
`Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger`

If any of these are not installed, install them with the shadcn CLI before proceeding:
`npx shadcn@latest add <component-name>`

---

## Step 2 — Cohort route layout

### File: `src/routes/timetable/$departmentId/$cohortId/route.tsx`

This is the layout shell that wraps the timetable grid. The big-calendar component
will be rendered via `<Outlet />` in the main calendar area. Build everything except
the calendar itself.

### Topbar

Use shadcn `Breadcrumb` components for navigation:

```
Work queue / Computer Science / BSCS Year 1
```

- "Work queue" links to `/timetable`
- "Computer Science" links to `/timetable/$departmentId`
- "BSCS Year 1" is the current page (not a link)
- Use `Route.useParams()` to get `departmentId` and `cohortId`
- For now, display the raw param values in the breadcrumb — a loader will resolve
  human-readable names later. Add a TODO comment marking this.

Right side of topbar contains three elements in a row:

1. Conflict count button — conditionally rendered. When conflictCount > 0, renders
   a destructive/danger styled Button showing "⚠ N conflicts". When 0, renders
   nothing. Hardcode `conflictCount = 2` for now with a TODO to wire from state.
2. "Export PDF" Button variant outline
3. "Publish cohort →" Button — disabled when conflictCount > 0, enabled when 0.
   Links to `./publish` when enabled. Uses the green success styling from the
   wireframe (border-green, bg-green-50, text-green-800 in light mode). Use
   Tailwind classes directly — do not create a new variant.

### Toolbar (below topbar, above calendar)

A secondary row containing:

1. Three-way view toggle — use shadcn `Tabs` with `TabsList` and `TabsTrigger`.
   Values: `cohort`, `lecturer`, `room`. Labels: "By cohort", "By lecturer",
   "By room". The selected value should be a TanStack Router search param so the
   view persists in the URL. Define the search param schema:

```ts
   validateSearch: zodValidator(z.object({
     view: z.enum(['cohort', 'lecturer', 'room']).default('cohort'),
   }))
```

   Use `useNavigate` and `useSearch` to read and update it.

2. A "Week template" Button variant outline on the right with a TODO comment
   marking where a week-picker or template selector will go.

### Two-column layout

Below the toolbar, render a flex row that fills the remaining viewport height:

**Left sidebar** (fixed width `w-52`, shrink-0, border-right):

Use `ScrollArea` from shadcn to make the sidebar independently scrollable.

Section 1 — "Cohorts": A list of cohort items. Each item shows the cohort label
and a small coloured status dot. The active cohort (current route param) is
highlighted with `bg-muted`. Clicking a cohort navigates to
`/timetable/$departmentId/$cohortId`. Hardcode 4 mock cohorts for now with a TODO.

Section 2 — "Conflicts (N)": Only rendered when conflictCount > 0. Shows a list
of conflict summary cards. Each card uses a destructive/danger background, shows a
conflict type title and a short description (room name + time). Clicking a conflict
card navigates to `./conflict/$conflictId`. Hardcode 2 mock conflicts for now.

Section 3 — "Legend": Four small rows showing the colour coding for each program/
status. Each row is a small coloured square (matching the event colours used in the
calendar) next to a label. The colours are:

- Purple `#534AB7` — BSCS
- Teal `#0F6E56` — BSIT
- Amber `#854F0B` — BSSE
- Red `#E24B4A` — Conflict

**Right calendar area** (flex-1):

This area is where `<Outlet />` renders. The child route (the calendar page) fills
this space entirely. Add a sticky day-header row at the top showing Mon–Fri column
headers, matching the wireframe. This header lives in the layout (not in the
calendar page) so it persists regardless of which child route is active.

```tsx
<div className="sticky top-0 z-10 grid grid-cols-[44px_repeat(5,1fr)] border-b bg-background">
  <div /> {/* time gutter spacer */}
  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
    <div key={day} className="border-l px-2 py-2 text-center text-xs font-medium text-muted-foreground">
      {day}
    </div>
  ))}
</div>
<div className="flex-1 overflow-auto">
  <Outlet />
</div>
```

The `<Outlet />` area has `overflow-auto` so the calendar can scroll vertically
within this container. The topbar and toolbar remain sticky above it.

### Overall height management

The shell must fill the full viewport height without the page scrolling. Use this
structure:

```tsx
<div className="flex h-screen flex-col overflow-hidden">
  <header>...</header>         {/* topbar, h-12 */}
  <div>...</div>               {/* toolbar, h-10 */}
  <div className="flex flex-1 overflow-hidden">
    <aside>...</aside>         {/* sidebar, overflow via ScrollArea */}
    <div className="flex flex-1 flex-col overflow-hidden">
      <div>...</div>           {/* day header, sticky */}
      <div className="flex-1 overflow-auto">
        <Outlet />             {/* calendar renders here */}
      </div>
    </div>
  </div>
</div>
```

---

## Step 3 — Timetable grid stub

### File: `src/routes/timetable/$departmentId/$cohortId/index.tsx`

This is a placeholder that the calendar will replace. For now it renders a centred
message inside the calendar area:

```tsx
<div className="flex h-full items-center justify-center flex-col gap-2 text-muted-foreground">
  <p className="text-sm font-medium">Timetable grid</p>
  <p className="text-xs">big-calendar week view renders here</p>
</div>
```

No other logic. The layout chrome above already provides the day headers.

---

## Step 4 — Publish review page

### File: `src/routes/timetable/$departmentId/$cohortId/publish.tsx`

Build the full publish review page. Use shadcn components throughout.

### Layout

The page renders inside the cohort layout's `<Outlet />` — it replaces the calendar
grid area. It should scroll independently. Use a `max-w-3xl mx-auto` content
container with `py-6 px-4` padding so it doesn't stretch too wide on large screens.

### Status banner

A `Card` with a green left-border accent (`border-l-4 border-l-green-500`) showing:

- Icon: a green checkmark circle (use `CheckCircle2Icon` from lucide-react)
- Title: "All conflicts resolved — ready to publish"
- Description: cohort name, semester, unit count, student count

If there were conflicts (add a `hasUnresolvedConflicts` bool, hardcoded false for
now), show a destructive version instead with an AlertTriangleIcon and the message
"Resolve all conflicts before publishing".

### Course unit summary

Use shadcn `Table` with columns: Course unit, Slots, Room, Lecturer.

Hardcode 5 mock rows matching the wireframe. Each slot in the Slots column is a
small `Badge` variant outline. Each row should look clean — no zebra striping,
just a subtle border-bottom between rows.

### What happens on publish

Use a `Card` with a list of four items. Each item is a flex row with:

- A small green checkbox icon (a `div` with the check styling, not a real checkbox)
- A primary line of text
- A secondary muted line beneath it

The four items are:

1. "N students can view their timetable" / "Visible in the student portal immediately"
2. "N lecturers notified of their schedule" / lecturer names joined with commas
3. "Room bookings locked in the room system" / room names joined with commas
4. "Alpha-MIS notified via SchedulePublished event" / "ACL forwards the event to
   the main system"

### Warning alert

Use shadcn `Alert` with `variant="warning"` (or the closest available variant —
check what variants are installed). Content:

- Title: "Note — lecturer preferences not captured"
- Body: "Some lecturers have informal scheduling preferences on file with the
  support team. These were not factored into this draft. Review manually if needed
  before publishing."

### Action footer

A sticky footer at the bottom of the page (not the viewport — sticky within the
scroll container):

```tsx
<div className="sticky bottom-0 border-t bg-background px-4 py-3 flex items-center justify-between">
  <span className="text-sm text-muted-foreground">
    {cohortLabel} · {semesterLabel} · draft generated {timeAgo}
  </span>
  <div className="flex gap-2">
    <Button variant="outline" onClick={() => router.history.back()}>
      Back to grid
    </Button>
    <Button 
      disabled={hasUnresolvedConflicts}
      className="bg-green-50 border border-green-300 text-green-800 hover:bg-green-100"
    >
      Publish cohort →
    </Button>
  </div>
</div>
```

---

## Step 5 — Department hub page

### File: `src/routes/timetable/$departmentId/index.tsx`

Build the full department hub. This page renders inside the department-level layout.

### Department header card

A `Card` showing:

- Left: a large avatar `div` (48px, rounded-lg, muted background) with a placeholder
  emoji or initials derived from the department name
- Center: department name (large, font-medium), meta line (semester, program count,
  cohort count, lecturer count), and a row of badges (conflict count in destructive,
  ready count in green, draft age in muted)
- Right: a "Publish all ready →" Button (disabled if no ready cohorts, TODO comment)

### Stats row

Four `Card` components in a `grid-cols-4` grid. Use the same
`bg-linear-to-t from-primary/5 to-card` gradient pattern from the existing
`SectionCards` component. Stats:

1. Total cohorts
2. Unresolved conflicts (value in destructive color when > 0)
3. Students affected
4. Lecturers assigned

Hardcode the values for now with a TODO.

### Programs section

Below the stats, a list of program cards. Each program card is a `Card` with:

**Card header**: program name, program code + cohort count (muted), status badge
(destructive if conflicts, green if all ready, muted if all published).

**Card content**: a list of cohort rows. Each cohort row is a flex row containing:

- Cohort label (e.g. "Year 1") — `w-20` fixed, text-sm text-muted-foreground
- A progress-like status bar: a thin `h-1.5` track div with a fill div. Fill color:
  - conflict: `bg-destructive`
  - ready: `bg-green-500`
  - published: `bg-muted-foreground/30`
    The bar always renders full width — it's a status indicator, not a real progress bar.
- Status text — right-aligned, text-xs. "N conflicts" in destructive, "Ready" in
  green-700, "Published" in muted.
- Action button — text-xs Button variant ghost: "Open grid →" for conflict/ready,
  "View →" for published. Navigates to `/timetable/$departmentId/$cohortId`.

Hardcode 3 programs with 2–3 cohorts each. TODO comment for data loading.

---

## Step 6 — Conflict panel stub

### File: `src/routes/timetable/$departmentId/$cohortId/conflict/$conflictId.tsx`

Stub only. Renders a centred placeholder in the calendar area:

```tsx
<div className="flex h-full items-center justify-center flex-col gap-2 text-muted-foreground p-8">
  <p className="text-sm font-medium">Conflict resolution panel</p>
  <p className="text-xs font-mono">{conflictId}</p>
  <p className="text-xs">Side panel implementation coming — will render over the timetable grid</p>
</div>
```

Add a prominent comment at the top of the file explaining the intended final
behaviour: this route will eventually render as a right-side panel overlaid on the
timetable grid rather than replacing it. The layout approach (portal, drawer, or
nested outlet) will be decided when the calendar is implemented.

---

## Step 7 — Department layout

### File: `src/routes/timetable/$departmentId/route.tsx`

If this file is currently a stub, build it out now.

Renders:

- Topbar with `Breadcrumb`: "Work queue / Computer Science" — "Work queue" links to
  `/timetable`, department name is the current page
- `<Outlet />` filling the remaining space

No sidebar at this level — the department hub and cohort layouts have their own
chrome. Keep this layout minimal.

---

## Step 8 — Verify and report

1. Run `tsc --noEmit` — fix all type errors
2. Navigate to each route in the browser and confirm it renders without crashing
3. Confirm breadcrumb links work at each level
4. List every TODO left in the code with file path and line number
5. List every shadcn component that was installed during this work
6. Flag any deviations from these instructions and explain why
