import type { IConflict, ITimetableSlot } from '@/features/calendar/interfaces'
import type { TConflictType } from '@/features/calendar/types'

// ─── Enriched conflict ────────────────────────────────────────────────────────
// A conflict from the context carries only slot IDs. This enriched shape
// resolves those IDs into the actual slot objects so the panel can render
// course codes, room names, lecturer names etc. without looking them up
// per-render in the component.

export interface IEnrichedConflict {
  id: string
  type: TConflictType
  description: string
  dayOfWeek: number
  startTime: string
  slotA: ITimetableSlot
  slotB: ITimetableSlot
}

// ─── Type metadata ────────────────────────────────────────────────────────────

interface ConflictTypeMeta {
  label: string // group heading in the panel
  accentColor: string // left border colour — Tailwind class
  filterDimension: 'room' | 'lecturer' | 'program'
}

export const CONFLICT_TYPE_META: Record<TConflictType, ConflictTypeMeta> = {
  room_double_booked: { label: 'Room conflicts', accentColor: 'bg-red-500', filterDimension: 'room' },
  lecturer_double_booked: { label: 'Lecturer conflicts', accentColor: 'bg-orange-500', filterDimension: 'lecturer' },
  program_overlap: { label: 'Program conflicts', accentColor: 'bg-violet-500', filterDimension: 'program' },
}

// Ordered so room conflicts appear first — they're hardest to resolve
// (you can split a class but you can't clone a room).
export const CONFLICT_TYPE_ORDER: TConflictType[] = [
  'room_double_booked',
  'lecturer_double_booked',
  'program_overlap',
]

// Day abbreviations for the panel rows
export const DAY_LABELS: Record<number, string> = {
  0: 'Mon',
  1: 'Tue',
  2: 'Wed',
  3: 'Thu',
  4: 'Fri',
}

// ─── Enrichment ───────────────────────────────────────────────────────────────

export function enrichConflicts(
  conflicts: IConflict[],
  slots: ITimetableSlot[],
): IEnrichedConflict[] {
  const slotMap = new Map(slots.map(s => [s.id, s]))

  return conflicts.reduce<IEnrichedConflict[]>((acc, conflict) => {
    const [idA, idB] = conflict.slotIds
    const slotA = slotMap.get(idA)
    const slotB = slotMap.get(idB)

    // Both slots must exist — a stale conflict referencing a deleted
    // slot ID is silently dropped rather than crashing the panel.
    if (!slotA || !slotB)
      return acc

    acc.push({ ...conflict, slotA, slotB })
    return acc
  }, [])
}

// ─── Grouping ─────────────────────────────────────────────────────────────────

export type GroupedConflicts = {
  type: TConflictType
  meta: ConflictTypeMeta
  conflicts: IEnrichedConflict[]
}[]

export function groupConflictsByType(
  enriched: IEnrichedConflict[],
): GroupedConflicts {
  return CONFLICT_TYPE_ORDER
    .map(type => ({
      type,
      meta: CONFLICT_TYPE_META[type],
      conflicts: enriched.filter(c => c.type === type),
    }))
    .filter(group => group.conflicts.length > 0)
}

// ─── Panel label helpers ──────────────────────────────────────────────────────

// "Thu 8:00" — shown as the conflict's time anchor in the panel row
export function conflictTimeLabel(conflict: IEnrichedConflict): string {
  return `${DAY_LABELS[conflict.dayOfWeek]} ${conflict.startTime}`
}

// The entity name that both slots share — shown as the conflict heading.
// For a room conflict: "LT1". Lecturer: "Dr. Mukasa". Program: "BBA Yr2".
export function conflictEntityLabel(conflict: IEnrichedConflict): string {
  switch (conflict.type) {
    case 'room_double_booked':
      return conflict.slotA.room.name

    case 'lecturer_double_booked': {
      const l = conflict.slotA.lecturer
      return l.title ? `${l.title} ${l.name}` : l.name
    }

    case 'program_overlap': {
      const p = conflict.slotA.program
      const yearLabel = p.year ? ` Yr${p.year}` : ''
      return `${p.code ?? p.name}${yearLabel}`
    }
  }
}

// The entity ID to pass to setSelectedId when the user clicks
// "View [entity] →" in the panel.
export function conflictEntityId(conflict: IEnrichedConflict): string {
  switch (conflict.type) {
    case 'room_double_booked': return conflict.slotA.room.id
    case 'lecturer_double_booked': return conflict.slotA.lecturer.id
    case 'program_overlap': return conflict.slotA.program.id
  }
}
