import type { TDayOfWeek } from '@/features/calendar/types';

// The single drag item type for the whole timetable grid.
// Carried by react-dnd from mousedown on the card to mouseup on a cell.
export const DRAG_TYPE_SLOT = 'TIMETABLE_SLOT' as const

export interface IDragItem {
  type: typeof DRAG_TYPE_SLOT
  slotId: string
  originalDayOfWeek: TDayOfWeek
  originalStartTime: string // "08:00"
  originalEndTime: string // "10:00"
  // Pre-computed so the drop handler doesn't need to re-derive it
  durationPeriods: number
}
