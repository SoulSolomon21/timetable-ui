import type { TConflictType, TDayOfWeek, TSessionType, TSlotColor } from '@/features/calendar/types'

// ─── Core domain read models ────────────────────────────────────────────────
// These are VIEW PROJECTIONS — shaped for the UI, not the domain aggregate.
// Your ACL translates TeachingAssignment + Room + Lecturer → ITimetableSlot.

export interface ILecturer {
  id: string
  name: string
  title?: string // "Dr.", "Prof.", "Mr." etc.
  department?: string
  picturePath?: string // avatar — same as IUser.picturePath in original
}

export interface IRoom {
  id: string
  name: string // "LT1", "Lab 3B", "Seminar Room 4"
  building?: string // "Main Block", "Science Block"
  capacity?: number
  type?: 'lecture_hall' | 'lab' | 'seminar_room' | 'exam_hall'
}

export interface IProgram {
  id: string
  name: string // "BSc Computer Science", "BBA Year 2"
  code?: string // "BSCS", "BBA"
  year?: number // year of study: 1, 2, 3, 4
  semester?: number // 1 or 2
}

export interface ICourse {
  id: string
  code: string // "CSC 2301"
  title: string // "Data Structures and Algorithms"
  creditUnits?: number
}

// ─── The primary UI entity ───────────────────────────────────────────────────
// This replaces IEvent. Notice: NO startDate/endDate ISO strings.
// Timetable slots live in a weekly template, not on specific calendar dates.

export interface ITimetableSlot {
  id: string
  course: ICourse
  lecturer: ILecturer
  room: IRoom
  program: IProgram

  // Template-week positioning (not a specific date)
  dayOfWeek: TDayOfWeek // 0 = Mon, 5 = Sat
  startTime: string // "08:00" — 24hr, matches UCU period boundaries
  endTime: string // "10:00"

  sessionType: TSessionType
  color: TSlotColor // derived from department/faculty in your ACL

  // Conflict state — populated by your conflict detection logic, not the domain
  hasConflict?: boolean
  conflictIds?: string[] // IDs of the other slots it conflicts with
}

// ─── Conflict descriptor ──────────────────────────────────────────────────────
// Computed in the context from the slot list. The UI renders this as an overlay.

export interface IConflict {
  id: string // generated: `${slotA.id}::${slotB.id}`
  type: TConflictType
  slotIds: [string, string] // the two clashing slot IDs
  dayOfWeek: TDayOfWeek
  startTime: string
  description: string // human-readable: "LT1 double-booked at 08:00 Mon"
}

// ─── Filter state ────────────────────────────────────────────────────────────
// Replaces the single selectedUserId. One active filter per dimension.

export interface ITimetableFilter {
  dimension: 'lecturer' | 'room' | 'program'
  selectedId: string | null // null = show all
}

// ─── Context data shape ───────────────────────────────────────────────────────
// This is what CalendarProvider accepts as props — your data-fetching layer
// (React Query) resolves these and passes them down.

export interface ITimetableProviderData {
  slots: ITimetableSlot[]
  lecturers: ILecturer[]
  rooms: IRoom[]
  programs: IProgram[]
}
