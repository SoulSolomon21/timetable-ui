# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read first — backend domain

**Before building any screen or API hook, read [`docs/backend-domain.md`](docs/backend-domain.md).**
It contains every API endpoint, every request/response shape as TypeScript interfaces, all enum values, and the business rules that drive the UI. It is the single source of truth for what the backend provides and what constraints the frontend must respect.

---

## Commands

```bash
pnpm dev          # Start dev server on port 5173
pnpm build        # Production build
pnpm test         # Run tests with Vitest
pnpm lint         # Lint with ESLint
pnpm lint:fix     # Auto-fix lint issues
pnpm format       # Format with Prettier
pnpm typecheck    # Run tsc --noEmit
pnpm orval        # Regenerate API client from OpenAPI spec (requires backend on :8080)
```

Run a single test file: `pnpm vitest run src/path/to/file.test.ts`

---

## Project overview

The timetable bubble is a standalone React/TypeScript frontend for UCU's timetabling system. It is operated by scheduling staff who review AI-generated timetable drafts, resolve conflicts, and publish schedules. Once published, schedules are visible in the student portal via an event dispatched to Alpha-MIS.

The system talks to a Spring Boot backend via an Orval-generated API client (OpenAPI spec). Never hand-write API calls — always use the generated hooks from `src/lib/api/`.

---

## Visual spec

High-fidelity wireframes live at:

```
docs/docs/wireframes/timetable-wireframes.html
```

Open this file in a browser before building any screen. It is a fully navigable prototype covering all 6 screens. Use it to verify layout, component placement, and interaction flow before and after building. The wireframe is the layout spec — do not invent layout patterns not shown in it.

---

## Design system

### Theme and colors

All colors are driven by semantic Tailwind tokens defined in `src/styles/styles.css`. Never hardcode hex values or use arbitrary Tailwind color classes like `bg-[#BE123C]`. Use the semantic token classes instead:

```
bg-primary        text-primary        border-primary
bg-secondary      text-secondary      border-secondary
bg-accent         text-accent         border-accent
bg-destructive    text-destructive    border-destructive
bg-muted          text-muted          border-muted
bg-card           text-card
bg-background     text-foreground
```

This allows the entire visual theme to change from one place (`styles.css`) without touching component files.

**The one exception — calendar event block pastels.** These are data-driven colors unique to the calendar component and should be defined as local constants inside the timetable feature, not in `styles.css`:

```ts
// src/features/scheduling/components/timetable/event-colors.ts
export const EVENT_COLORS = {
  blue:   { bg: "#DBEAFE", text: "#1E40AF" },
  teal:   { bg: "#CCFBF1", text: "#0F766E" },
  amber:  { bg: "#FEF3C7", text: "#92400E" },
  purple: { bg: "#EDE9FE", text: "#5B21B6" },
  rose:   { bg: "#FFE4E6", text: "#9F1239" },
  green:  { bg: "#DCFCE7", text: "#15803D" },
  orange: { bg: "#FFEDD5", text: "#C2410C" },
  gray:   { bg: "#F3F4F6", text: "#374151" },  // for conflict/error states
} as const;
```

### Typography

- Font: DM Sans via Google Fonts (add to `index.html`)
- Weights used: 400 (body), 500 (labels/headings), 600 (large stats and page titles only)
- No hardcoded font-family — apply it once on `body` in `styles.css`

### Spacing and radius

- Cards: `rounded-lg` (12px), `border border-border`
- Elements: `rounded-md` (8px)
- Spacing rhythm: multiples of 4px via Tailwind scale (p-4, gap-3, etc.)

### Badge/status patterns

Use these consistently across all features:

```tsx
// Danger
<span className="badge-destructive">3 conflicts</span>

// Success
<span className="badge-success">Ready</span>

// Amber/warning
<span className="badge-warning">Review & publish</span>

// Neutral
<span className="badge-muted">Waiting</span>
```

Define `.badge-*` as `@layer components` utilities in `styles.css`.

---

## Project structure (bulletproof-react)

```
timetable-ui/
├── docs/
│   ├── backend-domain.md               ← API contracts, TypeScript types, business rules
│   └── docs/wireframes/
│       └── timetable-wireframes.html   ← interactive wireframe prototype
├── src/
│   ├── app/                            ← app shell, router, global providers
│   │   ├── router.tsx                  ← TanStack Router root config
│   │   ├── provider.tsx                ← wraps app in QueryClient, ToastProvider, etc.
│   │   └── app.tsx                     ← root component
│   ├── assets/                         ← static files (images, fonts, icons)
│   ├── components/                     ← shared UI used across features
│   │   └── ui/                         ← shadcn primitives (button, badge, card, etc.)
│   ├── config/                         ← env vars, app-wide constants
│   │   └── env.ts
│   ├── features/                       ← ONE FOLDER PER FEATURE (see below)
│   │   ├── scheduling/
│   │   ├── rooms/
│   │   └── lecturers/
│   ├── hooks/                          ← shared hooks used across features
│   ├── lib/
│   │   ├── api/                        ← Orval-generated API client (do not edit)
│   │   └── query-client.ts             ← TanStack Query configuration
│   ├── stores/                         ← global Zustand stores (if needed)
│   ├── styles/
│   │   └── styles.css                  ← Tailwind base + theme tokens + badge utilities
│   ├── testing/                        ← test utilities and mocks
│   ├── types/                          ← shared TypeScript types
│   └── utils/                          ← shared pure utility functions
├── CLAUDE.md                           ← this file
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

### Feature folder anatomy

Each feature under `src/features/` is fully self-contained:

```
src/features/scheduling/
├── api/            ← TanStack Query hooks wrapping the generated API client
├── components/     ← components used only in this feature
│   ├── timetable/  ← big-calendar integration and event display
│   ├── conflicts/  ← conflict panel and conflict list
│   ├── publish/    ← publish review screens
│   └── work-queue/ ← work queue / department cards
├── hooks/          ← hooks used only within this feature
├── stores/         ← feature-level Zustand stores (if needed)
├── types/          ← TypeScript types scoped to this feature
└── index.ts        ← public API — only export what other features/app needs
```

**Import rules (enforced):**
- `src/features/*` can import from `src/components`, `src/hooks`, `src/lib`, `src/types`, `src/utils`
- Features must NOT import from other features. Compose at the route/app level instead.
- `src/app` can import from features, but features must NOT import from `src/app`
- Always use the `@/` alias for src-relative imports (configured in `tsconfig.json`)

---

## Routing

TanStack Router with file-based routing. Route files live under `src/routes/`.

| Screen | Route file | Path |
|--------|-----------|------|
| Work Queue | `src/routes/index.tsx` | `/` |
| Department Overview | `src/routes/$department.tsx` | `/$department` |
| Timetable Grid | `src/routes/$department.$cohort.tsx` | `/$department/$cohort` |
| Conflict Panel | Sheet overlay on `$department.$cohort` route | `/$department/$cohort?conflict=<id>` |
| Publish Review (cohort) | `src/routes/$department.$cohort.publish.tsx` | `/$department/$cohort/publish` |
| Publish Review (dept) | `src/routes/$department.publish.tsx` | `/$department/publish` |

Route components are thin shells — they load data via route loaders or `useQuery`, then pass data to feature components. No business logic in route files.

---

## Calendar component (big-calendar)

The calendar is sourced from **https://github.com/lramos33/big-calendar**. It is a copy-paste library, not an npm package. Copy these folders into the repo:

```
src/calendar/          ← core calendar (components, contexts, helpers, interfaces, types)
src/hooks/             ← required hooks (use-disclosure, etc.)
```

Install its peer dependencies:
```bash
npm install date-fns
```

### How big-calendar is used in this project

The calendar has **two distinct use cases**:

**1. Timetable editor (scheduling staff view) — week view only**

Used in the Timetable Grid screen. Staff see the Mon–Sat week (the backend generates slots Mon–Sat), with events colour-coded by cohort. Conflicts are shown with a red border + badge. Clicking a conflict opens the conflict resolution panel.

```tsx
// src/features/scheduling/components/timetable/timetable-grid.tsx
import { CalendarProvider } from "@/calendar/contexts/calendar-context";
import { ClientContainer } from "@/calendar/components/client-container";

<CalendarProvider events={timetableEvents} users={lecturers}>
  <ClientContainer view="week" />
</CalendarProvider>
```

The visible hour range is driven by `viewportStart`/`viewportEnd` from the `TimetableGridView` API response (default 08:00–18:00). Blocked windows (Community Worship, Lunch) are marked on the grid as non-interactive grey cells.

**2. Schedule viewer (student / lecturer view) — all views**

Read-only mode by students and lecturers to view their published schedules. Supports week, day, month, and agenda views.

```tsx
<CalendarProvider events={publishedEvents} users={[]}>
  <ClientContainer view="week" />
</CalendarProvider>
```

### Mapping backend slots to calendar events

The `TimetableGridView` response contains a flat `slots` array. Each `SlotView` has `day`, `startTime`, `endTime`, `blocked`, and an optional `entry`. To render in big-calendar, convert each occupied slot to an `ITimetableEvent`:

```ts
// src/features/scheduling/types/timetable-event.ts
interface ITimetableEvent {
  id: string;           // entry.entryId
  title: string;        // entry.courseName + " — " + entry.courseCode
  description: string;  // entry.primaryLecturerName + " · " + entry.roomName
  startDate: string;    // ISO datetime (combine slot.day + slot.startTime with reference week)
  endDate: string;      // ISO datetime (combine slot.day + slot.endTime with reference week)
  color: EventColorKey; // derived from cohort, consistent across the timetable
  user: { id: string; name: string }; // primaryLecturerId + primaryLecturerName
  hasConflict: boolean; // entry.hasConflict
  conflictIds: string[]; // entry.conflictIds
}
```

Map cohort → color deterministically (e.g. stable sort of cohortId → index into EVENT_COLORS keys) so the same cohort always gets the same colour.

---

## shadcn/ui components to install before building

```bash
npx shadcn@latest add badge button card separator table tabs sheet progress avatar select scroll-area
```

---

## Key coding conventions

### TypeScript

- No `any`. No untyped props. No implicit return types on exported functions.
- Prefer `interface` over `type` for object shapes; use `type` for unions and aliases.
- All API response types come from the Orval-generated client — never redefine them.

### Components

- One component per file, PascalCase filename matching the export name.
- Props interfaces defined in the same file, above the component.
- No inline styles. Tailwind classes only (plus the semantic token classes from `styles.css`).
- Data fetching via `useQuery` hooks in `src/features/*/api/`, never inside JSX components.
- Keep components under ~150 lines. Extract sub-components if longer.

### State management

- Server state: TanStack Query (all API data)
- Local UI state: `useState` / `useReducer` inside components
- Shared UI state (e.g. active conflict, selected cohort): Zustand store in `src/features/scheduling/stores/`
- No prop drilling beyond 2 levels — use context or Zustand

### File naming

| File type | Convention |
|-----------|-----------|
| Components | `PascalCase.tsx` |
| Hooks | `use-kebab-case.ts` |
| Utilities | `kebab-case.ts` |
| Types | `kebab-case.types.ts` |
| API hooks | `use-get-timetables.ts`, `use-publish-timetable.ts` |

### Imports

Always use `@/` alias:
```ts
// Good
import { DepartmentCard } from "@/features/scheduling/components/work-queue/department-card";

// Bad
import { DepartmentCard } from "../../../features/scheduling/components/work-queue/department-card";
```

---

## Build order

Build one screen at a time, in this order. Each depends on the previous one existing:

1. **Work Queue** (`/`) — layout shell, nav, stat tiles, department card list with mock data
2. **Department Overview** (`/$department`) — breadcrumb nav, program cards, progress bars, routing to grid
3. **Timetable Grid** (`/$department/$cohort`) — big-calendar week view, sidebar with cohort list + conflict list
4. **Conflict Panel** (overlay on timetable grid) — shadcn Sheet, conflict detail, suggested fixes
5. **Publish Review — cohort** (`/$department/$cohort/publish`) — summary table, consequences checklist, warning banner
6. **Publish Review — dept** (`/$department/publish`) — cohort grid cards, same checklist pattern

After each screen: open `docs/docs/wireframes/timetable-wireframes.html`, compare the built screen to the wireframe, and list any discrepancies before moving on.

---

## Styles.css structure

The `src/styles/styles.css` file is the single source of truth for the visual theme. Its structure:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Define all semantic tokens here as CSS variables */
    --background: ...;
    --foreground: ...;
    --primary: ...;
    --primary-foreground: ...;
    --secondary: ...;
    --secondary-foreground: ...;
    --accent: ...;
    --accent-foreground: ...;
    --destructive: ...;
    --destructive-foreground: ...;
    --muted: ...;
    --muted-foreground: ...;
    --card: ...;
    --card-foreground: ...;
    --border: ...;
    --ring: ...;
    --radius: 0.5rem;
  }
}

@layer components {
  /* Badge utilities */
  .badge-base { @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium; }
  .badge-destructive { @apply badge-base bg-destructive/10 text-destructive border border-destructive/20; }
  .badge-success { @apply badge-base bg-green-50 text-green-700 border border-green-200; }
  .badge-warning { @apply badge-base bg-amber-50 text-amber-700 border border-amber-200; }
  .badge-muted { @apply badge-base bg-muted text-muted-foreground border border-border; }
  .badge-info { @apply badge-base bg-blue-50 text-blue-700 border border-blue-200; }
}
```

When a design change is needed (e.g. switching from a light to a dark theme), update the CSS variables in `:root` only. Components should not need touching.

---

## Do not

- Use `any` type
- Hardcode hex colors or arbitrary Tailwind values except in `event-colors.ts`
- Import across features (only compose at app/route level)
- Put data fetching inside JSX component bodies
- Edit generated files in `src/lib/api/`
- Invent layout patterns not shown in the wireframe
- Build multiple screens in one session
