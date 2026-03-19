// The original had 5 views. For a timetable, week and day are your workhorses.
// Keep the others as valid types so the ClientContainer doesn't blow up immediately —
// you can strip the dead views later once the core is wired up.
export type TView = 'week' | 'day' | 'month' | 'year' | 'agenda'

// The three lenses through which a university timetable is read.
// This replaces the single selectedUserId filter with a proper dimension switcher.
export type TFilterDimension = 'lecturer' | 'room' | 'program'

// UCU's academic day. 0 = Mon, 4 = Fri. Matches date-fns getDay() - 1
// (date-fns uses 0=Sun, so you'll offset when rendering).
// Capped at 4 — UCU is a Mon–Fri institution; the week grid renders 5 columns only.
export type TDayOfWeek = 0 | 1 | 2 | 3 | 4

// The nature of the teaching session — drives icon/label in the slot card.
export type TSessionType = 'lecture' | 'tutorial' | 'lab' | 'seminar' | 'exam'

// Kept from original for the badge variant selector — still useful for display density.
export type TBadgeVariant = 'dot' | 'colored' | 'mixed'

// Colour is derived from the department/faculty, not manually picked per event.
// These map to Tailwind colour classes you'll define in the slot card component.
export type TSlotColor
  = | 'blue' // e.g. Computer Science
    | 'green' // e.g. Business
    | 'purple' // e.g. Engineering
    | 'orange' // e.g. Education
    | 'red' // e.g. Law
    | 'teal' // e.g. Health Sciences
    | 'yellow' // e.g. Theology

// Conflict type — what caused the clash. The domain tells you; the UI just renders it.
export type TConflictType
  = | 'room_double_booked' // same room, same time
    | 'lecturer_double_booked' // same lecturer, same time
    | 'program_overlap' // same program/class, overlapping slots
