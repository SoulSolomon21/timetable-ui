export interface TVisibleHours { from: number, to: number }
export interface TLecturingHours { [key: number]: { from: number, to: number } }

export const DRAG_TYPE_SLOT = 'TIMETABLE_SLOT' as const

export const ItemTypes = {
  TIMETABLE_SLOT: 'TIMETABLE_SLOT'
}
