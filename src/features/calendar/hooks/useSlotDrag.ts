import type { RefObject } from 'react'
import type { ITimetableSlot } from '@/features/calendar/interfaces'
import type { IDragItem } from '@/features/calendar/types/dnd'
import { useRef } from 'react'
import { useDrag } from 'react-dnd'
import { DEFAULT_ACADEMIC_PERIODS, getPeriodSpan } from '@/features/calendar/helpers/WeekGridHelpers'
import { DRAG_TYPE_SLOT } from '@/features/calendar/types/dnd'

interface UseSlotDragResult {
  // Attach to the drag source element (the card's root div)
  dragRef: RefObject<HTMLDivElement | null>
  isDragging: boolean
}

export function useSlotDrag(
  slot: ITimetableSlot,
  periods = DEFAULT_ACADEMIC_PERIODS,
): UseSlotDragResult {
  const dragRef = useRef<HTMLDivElement>(null)

  const [{ isDragging }, connectDrag] = useDrag<
    IDragItem,
    void,
    { isDragging: boolean }
  >({
    type: DRAG_TYPE_SLOT,

    item: (): IDragItem => ({
      type: DRAG_TYPE_SLOT,
      slotId: slot.id,
      originalDayOfWeek: slot.dayOfWeek,
      originalStartTime: slot.startTime,
      originalEndTime: slot.endTime,
      durationPeriods: getPeriodSpan(slot.startTime, slot.endTime, periods),
    }),

    // Prevent dragging exam slots — those shouldn't be rescheduled by DnD
    canDrag: () => slot.sessionType !== 'exam',

    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  // Connect the ref to react-dnd
  connectDrag(dragRef)

  return { dragRef, isDragging }
}
