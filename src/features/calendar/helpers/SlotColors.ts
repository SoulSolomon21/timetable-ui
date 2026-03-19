import type { TSessionType, TSlotColor } from '@/features/calendar/types'

// Maps TSlotColor → Tailwind classes for the card surface and left accent border.
// Three variants per color: background (subtle), border-left (vivid), text (readable).
// All classes must be in your Tailwind safelist or used statically —
// Tailwind's JIT won't pick up dynamically constructed strings.

interface SlotColorClasses {
  bg: string // card background
  border: string // left accent border
  courseCode: string // course code text color (slightly more vivid than body)
  ring: string // conflict ring color
}

export const SLOT_COLOR_MAP: Record<TSlotColor, SlotColorClasses> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-l-blue-500',
    courseCode: 'text-blue-700 dark:text-blue-300',
    ring: 'ring-red-500',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-l-green-500',
    courseCode: 'text-green-700 dark:text-green-300',
    ring: 'ring-red-500',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-l-purple-500',
    courseCode: 'text-purple-700 dark:text-purple-300',
    ring: 'ring-red-500',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-l-orange-500',
    courseCode: 'text-orange-700 dark:text-orange-300',
    ring: 'ring-red-500',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-l-red-500',
    courseCode: 'text-red-700 dark:text-red-300',
    ring: 'ring-red-500',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    border: 'border-l-teal-500',
    courseCode: 'text-teal-700 dark:text-teal-300',
    ring: 'ring-red-500',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-l-yellow-500',
    courseCode: 'text-yellow-700 dark:text-yellow-300',
    ring: 'ring-red-500',
  },
}

// Session type → display label + Tailwind badge classes.
// The badge sits in the top-right corner of the card.

interface SessionTypeMeta {
  label: string
  badgeBg: string
  badgeText: string
}

export const SESSION_TYPE_META: Record<TSessionType, SessionTypeMeta> = {
  lecture: { label: 'LEC', badgeBg: 'bg-slate-100 dark:bg-slate-800', badgeText: 'text-slate-600 dark:text-slate-300' },
  tutorial: { label: 'TUT', badgeBg: 'bg-sky-100 dark:bg-sky-900/60', badgeText: 'text-sky-700 dark:text-sky-300' },
  lab: { label: 'LAB', badgeBg: 'bg-amber-100 dark:bg-amber-900/60', badgeText: 'text-amber-700 dark:text-amber-300' },
  seminar: { label: 'SEM', badgeBg: 'bg-violet-100 dark:bg-violet-900/60', badgeText: 'text-violet-700 dark:text-violet-300' },
  exam: { label: 'EXAM', badgeBg: 'bg-red-100 dark:bg-red-900/60', badgeText: 'text-red-700 dark:text-red-300' },
}

// Derive how many period rows a slot spans.
// Assumes fixed 1-hour periods. A 2-hour slot (08:00–10:00) spans 2 rows.
export function getSlotDurationPeriods(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM)
  return Math.max(1, Math.round(durationMinutes / 60))
}
