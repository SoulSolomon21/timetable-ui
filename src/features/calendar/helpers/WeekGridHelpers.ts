import type { ITimetableSlot } from '@/features/calendar/interfaces'
import type { TDayOfWeek } from '@/features/calendar/types'

// ─── Period definition ────────────────────────────────────────────────────────

export interface IAcademicPeriod {
  label: string // displayed in the time column: "8:00"
  startTime: string // "08:00" — matches ITimetableSlot.startTime exactly
  endTime: string // "09:00"
}

// Default UCU academic day — 8:00 to 18:00, hourly.
// Pass a custom array to TimetableWeekView to override (e.g. if UCU
// uses a different schedule for a specific semester or faculty).
export const DEFAULT_ACADEMIC_PERIODS: IAcademicPeriod[] = [
  { label: '8:00', startTime: '08:00', endTime: '09:00' },
  { label: '9:00', startTime: '09:00', endTime: '10:00' },
  { label: '10:00', startTime: '10:00', endTime: '11:00' },
  { label: '11:00', startTime: '11:00', endTime: '12:00' },
  { label: '12:00', startTime: '12:00', endTime: '13:00' },
  { label: '13:00', startTime: '13:00', endTime: '14:00' },
  { label: '14:00', startTime: '14:00', endTime: '15:00' },
  { label: '15:00', startTime: '15:00', endTime: '16:00' },
  { label: '16:00', startTime: '16:00', endTime: '17:00' },
  { label: '17:00', startTime: '17:00', endTime: '18:00' },
]

// ─── Day definitions ──────────────────────────────────────────────────────────

export const WEEK_DAYS = [
  { label: 'Monday', short: 'Mon', narrow: 'M', dayOfWeek: 0 as TDayOfWeek },
  { label: 'Tuesday', short: 'Tue', narrow: 'T', dayOfWeek: 1 as TDayOfWeek },
  { label: 'Wednesday', short: 'Wed', narrow: 'W', dayOfWeek: 2 as TDayOfWeek },
  { label: 'Thursday', short: 'Thu', narrow: 'Th', dayOfWeek: 3 as TDayOfWeek },
  { label: 'Friday', short: 'Fri', narrow: 'F', dayOfWeek: 4 as TDayOfWeek },
  { label: 'Saturday', short: 'Sat', narrow: 'S', dayOfWeek: 5 as TDayOfWeek },
] as const

export type TWeekDay = typeof WEEK_DAYS[number]

// ─── Layout constants ─────────────────────────────────────────────────────────

export const PERIOD_HEIGHT_PX = 80 // height of a single period row in px
export const TIME_COL_WIDTH = '56px'
export const HEADER_ROW_HEIGHT = '44px'

// ─── Period math ──────────────────────────────────────────────────────────────

// Returns the 0-based index of this startTime in the periods array.
// Returns -1 if the time is outside the configured academic day.
export function getPeriodIndex(
  startTime: string,
  periods: IAcademicPeriod[],
): number {
  return periods.findIndex(p => p.startTime === startTime)
}

// How many period rows does a slot span?
// "08:00" → "10:00" = 2 periods. Falls back to hour arithmetic if
// endTime is past the last period (e.g. an 18:00–19:00 evening slot).
export function getPeriodSpan(
  startTime: string,
  endTime: string,
  periods: IAcademicPeriod[],
): number {
  const startIdx = periods.findIndex(p => p.startTime === startTime)
  const endIdx = periods.findIndex(p => p.startTime === endTime)

  if (startIdx === -1)
    return 1

  if (endIdx === -1) {
    // endTime doesn't match a period start — compute by minutes
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const mins = (eh * 60 + em) - (sh * 60 + sm)
    return Math.max(1, Math.round(mins / 60))
  }

  return Math.max(1, endIdx - startIdx)
}

// ─── Slot grouping ────────────────────────────────────────────────────────────

// Slots that share the same (dayOfWeek, startTime) occupy the same
// grid cell and need to be tiled side-by-side. This groups them by
// a string key: "${dayOfWeek}-${periodIndex}".
//
// Slots whose startTime falls outside the configured periods are
// silently dropped — they can't be placed on the grid.
export function groupSlotsByPosition(
  slots: ITimetableSlot[],
  periods: IAcademicPeriod[],
): Map<string, ITimetableSlot[]> {
  const map = new Map<string, ITimetableSlot[]>()

  for (const slot of slots) {
    const periodIdx = getPeriodIndex(slot.startTime, periods)
    if (periodIdx === -1)
      continue

    const key = `${slot.dayOfWeek}-${periodIdx}`
    const existing = map.get(key) ?? []
    map.set(key, [...existing, slot])
  }

  return map
}

// ─── CSS grid placement ───────────────────────────────────────────────────────

export interface IGridPlacement {
  column: number // 1-indexed CSS grid column (col 1 = time labels, col 2 = Mon...)
  rowStart: number // 1-indexed CSS grid row (row 1 = day header, row 2 = first period...)
  rowSpan: number // how many rows to span
}

export function getGridPlacement(
  dayOfWeek: TDayOfWeek,
  startTime: string,
  endTime: string,
  periods: IAcademicPeriod[],
): IGridPlacement {
  const periodIdx = getPeriodIndex(startTime, periods)
  const span = getPeriodSpan(startTime, endTime, periods)

  return {
    column: dayOfWeek + 2, // +2: col 1 = time labels
    rowStart: periodIdx + 2, // +2: row 1 = day header
    rowSpan: Math.max(1, span),
  }
}

// Finds the slot with the longest span in a group — used to size the
// shared container when multiple slots share a start time.
export function getLongestSlot(
  slots: ITimetableSlot[],
  periods: IAcademicPeriod[],
): ITimetableSlot {
  return slots.reduce((longest, slot) => {
    const a = getPeriodSpan(slot.startTime, slot.endTime, periods)
    const b = getPeriodSpan(longest.startTime, longest.endTime, periods)
    return a > b ? slot : longest
  }, slots[0])
}
