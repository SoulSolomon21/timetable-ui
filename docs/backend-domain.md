# Backend Domain & API Reference

This document is the authoritative reference for the Spring Boot backend that powers this frontend. Read it before building any screen or API hook. It covers every endpoint, every request/response shape as TypeScript interfaces, all enum values, and the business rules the UI must enforce.

The backend base URL is `http://localhost:8080` in development.

---

## Domain overview

The system answers: **"When, where, and by whom is each course taught?"**

A **Timetable** is owned by a **Cohort** (a year/session group within a program). It holds **ScheduleEntries** — each entry places a teaching assignment into a `Slot` (day + hour block) with a room and delivery mode. The lifecycle is:

```
NOT_GENERATED → DRAFT → FORWARDED → PUBLISHED
                   ↑         |
                   └─────────┘  (return to draft from forwarded)

PUBLISHED → DRAFT  (unpublish for major revision)
```

The UI only allows publishing when there are **zero unresolved conflicts**.

---

## Enums

Use these exact string values when sending to or comparing with the API.

```ts
type TimetableStatus = "NOT_GENERATED" | "DRAFT" | "FORWARDED" | "PUBLISHED";

type ConflictType = "STAFF_CONFLICT" | "ROOM_CONFLICT" | "GROUP_CONFLICT";
// STAFF_CONFLICT  — same lecturer double-booked
// ROOM_CONFLICT   — same room double-booked
// GROUP_CONFLICT  — same cohort attending two overlapping entries

type DeliveryMode = "IN_PERSON" | "ONLINE";
// IN_PERSON → room is present; ONLINE → room is null

type AssignmentCategory = "MAIN_ASSIGNMENT" | "SECONDARY_ASSIGNMENT";

type RoomType = "LECTURE_ROOM" | "COMPUTER_LAB" | "SCIENCE_LAB" | "OFFICE" | "OTHER";

// Days returned by the API — backend uses Mon–Sat for the timetable grid
type ApiDayOfWeek =
  | "MONDAY" | "TUESDAY" | "WEDNESDAY"
  | "THURSDAY" | "FRIDAY" | "SATURDAY";
```

---

## API response types

These are the exact shapes returned by the backend. When Orval regenerates `src/lib/api/`, it will produce matching types — use those instead of re-declaring. These are here so you understand the structure before Orval is run.

### `TimetableListItem`
Returned by `GET /api/timetables`

```ts
interface TimetableListItem {
  id: string;
  programId: string;
  programName: string;
  semesterId: string;
  semesterName: string;
  year: number;       // cohort year, e.g. 1, 2, 3
  session: number;    // session number, e.g. 1, 2
  status: TimetableStatus;
  entryCount: number;
  unresolvedConflictCount: number;
}
```

**UI implications:**
- Show `badge-destructive` when `unresolvedConflictCount > 0`
- Show `badge-success` when `status === "PUBLISHED"`
- Show `badge-warning` when `status === "FORWARDED"`
- Show `badge-muted` when `status === "DRAFT"` or `"NOT_GENERATED"`
- A timetable with `status === "NOT_GENERATED"` has no entries yet

### `TimetableGridView`
Returned by `GET /api/timetables/:id`

```ts
interface TimetableGridView {
  timetableId: string;
  programName: string;
  semesterName: string;
  year: number;
  session: number;
  status: TimetableStatus;
  unresolvedConflictCount: number;
  viewportStart: string;   // "HH:mm", e.g. "08:00" — first visible hour
  viewportEnd: string;     // "HH:mm", e.g. "18:00" — last visible hour (exclusive)
  blockedWindows: BlockedWindowView[];
  slots: SlotView[];       // ALL hourly cells (Mon–Sat × viewport hours), empty and occupied
}
```

### `SlotView`
One hourly cell in the grid. The `slots` array covers every (day × hour) combination within the viewport.

```ts
interface SlotView {
  day: ApiDayOfWeek;
  startTime: string;    // "HH:mm", e.g. "09:00"
  endTime: string;      // "HH:mm", e.g. "10:00"
  blocked: boolean;     // true = institutionally blocked (Community Worship, Lunch)
  entry: EntryView | null; // null = empty slot
}
```

**UI implications:**
- Blocked slots render as non-interactive grey cells in the grid
- Empty non-blocked slots are where drag-and-drop targets live
- Slots are always 1 hour each; multi-hour classes are NOT represented as multiple spans in the current data model

### `EntryView`
A scheduled class occupying one slot.

```ts
interface EntryView {
  entryId: string;
  assignmentId: string;         // references the teaching assignment in Alpha-MIS
  courseName: string;           // e.g. "Introduction to Computer Science"
  courseCode: string;           // e.g. "CSC 2101"
  primaryLecturerName: string;
  tutorName: string | null;     // null if no tutor assigned
  roomName: string | null;      // null for ONLINE entries
  deliveryMode: DeliveryMode;
  category: AssignmentCategory;
  practical: boolean;           // true = lab/practical session
  hasConflict: boolean;
  conflictIds: string[];        // IDs of conflicts involving this entry (may be empty)
}
```

**UI implications:**
- Show a red border/badge on calendar events where `hasConflict === true`
- `conflictIds` lets you show a count badge without a separate API call
- `practical` entries can be styled differently (e.g. diagonal stripe, different icon)
- `deliveryMode === "ONLINE"` → no room chip; show a globe/wifi icon instead

### `BlockedWindowView`
An institutional time window where no classes should be scheduled.

```ts
interface BlockedWindowView {
  day: ApiDayOfWeek | null; // null means applies to ALL teaching days
  startTime: string;        // "HH:mm"
  endTime: string;          // "HH:mm"
  label: string;            // e.g. "Community Worship", "Lunch Break"
}
```

**Institution defaults** (always present unless overridden):
| Label | Day | Time |
|-------|-----|------|
| Community Worship | Tuesday | 12:00–13:00 |
| Community Worship | Thursday | 12:00–13:00 |
| Lunch Break | All days | 13:00–14:00 |

### `ConflictSummary`
Returned by `GET /api/timetables/:id/conflicts`

```ts
interface ConflictSummary {
  conflictId: string;
  conflictType: ConflictType;
  conflictingEntryId: string;   // the newly added entry
  incumbentEntryId: string;     // the existing entry it clashes with
  conflictingCourseName: string;
  incumbentCourseName: string;
  resolved: boolean;
  resolvedAt: string | null;    // ISO datetime, null if not resolved
}
```

**UI implications:**
- `resolved: false` entries must all be resolved before the Publish button is enabled
- Show conflict type as a chip: "Lecturer clash" / "Room clash" / "Group clash"
- The conflict panel shows both entries side-by-side so staff can decide which to move

### `CohortView`
Returned by `GET /api/cohorts`

```ts
interface CohortView {
  id: string;
  label: string;        // "ABBREVIATION YEAR:SESSION", e.g. "BSCS 1:2"
  programId: string;
  programName: string;
  year: number;
  session: number;
}
```

---

## API endpoints

### Timetable queries

```
GET  /api/timetables                    → TimetableListItem[]
     ?semesterId=<id>                   (optional filter)

GET  /api/timetables/:timetableId       → TimetableGridView
GET  /api/timetables/:timetableId/conflicts → ConflictSummary[]
```

### Timetable commands

All commands return `204 No Content` on success (except `POST /` which returns `201 Created` with the new ID as a plain string in the body).

```
POST   /api/timetables                              → 201, body: timetableId string
POST   /api/timetables/:id/entries                  → 201, body: entryId string
DELETE /api/timetables/:id/entries/:entryId         → 204
PATCH  /api/timetables/:id/entries/:entryId/move    → 204
POST   /api/timetables/:id/forward                  → 204
POST   /api/timetables/:id/return-to-draft          → 204
POST   /api/timetables/:id/publish                  → 204
POST   /api/timetables/:id/unpublish                → 204
POST   /api/timetables/:id/conflicts/:conflictId/resolve → 204
```

### Cohort endpoints

```
GET  /api/cohorts                       → CohortView[]
POST /api/cohorts/sync                  → plain string (count of newly created cohorts)
     ?departmentId=<id>&semesterId=<id>
```

### ACL / legacy data endpoints

These proxy requests to the legacy Alpha-MIS system. Use them to populate dropdowns and selectors — the data is reference data and changes infrequently.

```
GET /api/acl/departments   → LegacyDepartment[]
GET /api/acl/rooms         → LegacyCampusRoomGroup[]
GET /api/acl/assignments   → ApprovedAssignment[]
    ?semesterId=<id>
GET /api/acl/cohorts       → LegacyCohort[]
    ?departmentId=<id>&semesterId=<id>
```

---

## Request body shapes

### `CreateTimetableRequest`
```ts
interface CreateTimetableRequest {
  cohortId?: string;      // optional — links to local Cohort entity
  programId: string;      // required
  programName: string;    // required
  semesterId: string;     // required
  semesterName: string;   // required
  year: number;           // required, >= 1
  session: number;        // required, >= 1
}
```

### `PlaceEntryRequest`
```ts
interface PlaceEntryRequest {
  assignmentId: string;           // required — from ApprovedAssignment
  day: ApiDayOfWeek;              // required
  startTime: string;              // "HH:mm", must be on the hour
  endTime: string;                // "HH:mm", must be on the hour, after startTime
  deliveryMode: DeliveryMode;     // required
  roomId?: string;                // required if IN_PERSON, omit if ONLINE
  primaryLecturerId: string;      // required
  tutorId?: string;               // optional
  placedByStaffId: string;        // required — logged-in staff member
}
```

### `MoveEntryRequest`
```ts
interface MoveEntryRequest {
  newDay: ApiDayOfWeek;
  newStartTime: string;           // "HH:mm"
  newEndTime: string;             // "HH:mm"
  newDeliveryMode: DeliveryMode;
  newRoomId?: string;
}
```

### `PublishRequest`
```ts
interface PublishRequest {
  publishedByStaffId: string;     // required
}
```

### `ResolveConflictRequest`
```ts
interface ResolveConflictRequest {
  resolvedByStaffId: string;      // required
}
```

---

## Business rules the UI must enforce

These rules are also enforced server-side, but the UI should prevent invalid actions proactively.

### Publishing

- The **Publish** button must be disabled when `unresolvedConflictCount > 0`
- Show a tooltip explaining why: "Resolve all conflicts before publishing"
- Publishing is only allowed from `DRAFT` or `FORWARDED` status
- After publishing, the timetable becomes visible to students and lecturers

### Conflict resolution

- Conflicts are not auto-resolved — a staff member must explicitly call the resolve endpoint
- Moving an entry via `PATCH .../move` may create new conflicts; re-fetch conflicts after every move
- The conflict panel should show both the conflicting and incumbent entry so staff can decide which to reschedule

### Slot constraints

- Slots must be aligned to the hour (minutes = 0). Never send `startTime: "09:30"`.
- Do not allow placing entries into blocked windows (cells where `SlotView.blocked === true`)
- The working day is defined by `viewportStart`/`viewportEnd` in `TimetableGridView`

### Joint classes

- An entry with `EntryView.conflictIds` may be a joint class (multiple cohorts sharing one entry)
- `GROUP_CONFLICT` fires when two separate entries share at least one cohort — this is a real conflict requiring resolution, not a de-duplication artefact

### Delivery mode

- `IN_PERSON` entries always have a `roomName` — show it as a chip on the calendar event
- `ONLINE` entries have `roomName === null` — show a globe icon instead
- Never infer delivery mode from room presence — always use the explicit field

### Timetable status transitions (allowed actions by status)

| Status | Can edit entries | Can forward | Can return to draft | Can publish | Can unpublish |
|--------|-----------------|-------------|---------------------|-------------|---------------|
| NOT_GENERATED | No | No | No | No | No |
| DRAFT | Yes | Yes | No | Yes (if no conflicts) | No |
| FORWARDED | No | No | Yes | Yes (if no conflicts) | No |
| PUBLISHED | No | No | No | No | Yes |

---

## Cohort label format

The `CohortView.label` field is the canonical display string: `"ABBREVIATION YEAR:SESSION"`

Examples:
- `"BSCS 1:2"` — Bachelor of Science in Computer Science, Year 1, Session 2
- `"BCOM 3:1"` — Bachelor of Commerce, Year 3, Session 1

Use `label` for all display purposes. Never reconstruct it from `year`/`session` — the abbreviation comes from the program and is not derivable client-side.

---

## Error handling

The backend returns standard HTTP status codes:
- `400 Bad Request` — validation failure (e.g. blank required field, slot not on the hour)
- `404 Not Found` — timetable/entry/conflict not found
- `409 Conflict` — business rule violation (e.g. attempting to publish with unresolved conflicts, invalid status transition)
- `500 Internal Server Error` — unexpected error

For `400` and `409`, the response body is a problem detail with a `message` field. Display this message in a toast notification.

---

## Derived UI patterns

### Work queue screen

- Group `TimetableListItem[]` by department (use `GET /api/acl/departments` to get department names)
- Each department card shows: total timetables, how many are published, how many have conflicts
- A timetable is "ready to review" when `status === "FORWARDED"`

### Timetable grid screen

1. Call `GET /api/timetables/:id` → `TimetableGridView`
2. Filter `slots` where `entry !== null` to get occupied cells
3. Build a `Map<string, EntryView>` keyed by `"DAY:HH:mm"` for O(1) grid lookup
4. Render the viewport grid: columns = Mon–Sat, rows = one per hour between `viewportStart` and `viewportEnd`
5. Mark blocked cells with `SlotView.blocked === true`
6. Overlay entries; highlight entries with `hasConflict === true`

### Conflict panel

1. Call `GET /api/timetables/:id/conflicts`
2. Filter to `resolved === false` for the active list
3. For each conflict, look up both entries in the grid map to show them side-by-side
4. After resolving, invalidate the timetable query and conflicts query
