import type { RefObject } from 'react'
import type { IAcademicPeriod } from '@/features/calendar/helpers/WeekGridHelpers'
import type { TDayOfWeek } from '@/features/calendar/types'
import type { IDragItem } from '@/features/calendar/types/dnd'
import { useRef } from 'react'
import { useDrop } from 'react-dnd'
import { useTimetable } from '@/features/calendar/contexts/TimetableContext'
import {
  DEFAULT_ACADEMIC_PERIODS,

} from '@/features/calendar/helpers/WeekGridHelpers'
import { DRAG_TYPE_SLOT } from '@/features/calendar/types/dnd'

interface UseCellDropOptions {
  dayOfWeek: TDayOfWeek
  periodIdx: number // 0-based index into the periods array
  periods?: IAcademicPeriod[]
}

interface UseCellDropResult {
  dropRef: RefObject<HTMLDivElement | null>
  isOver: boolean
  canDrop: boolean
}

export function useCellDrop({
  dayOfWeek,
  periodIdx,
  periods = DEFAULT_ACADEMIC_PERIODS,
}: UseCellDropOptions): UseCellDropResult {
  const dropRef = useRef<HTMLDivElement>(null)
  const { rescheduleSlot } = useTimetable()

  const [{ isOver, canDrop }, connectDrop] = useDrop<
    IDragItem,
    void,
    { isOver: boolean, canDrop: boolean }
  >({
    accept: DRAG_TYPE_SLOT,

    canDrop: (item) => {
      // Reject if the slot would overflow past the last period.
      // e.g. a 2-period slot can't start on the last period row.
      const lastValidPeriodIdx = periods.length - item.durationPeriods
      if (periodIdx > lastValidPeriodIdx)
        return false

      // Reject if nothing has actually changed — dropping onto the same cell
      const isSamePosition
        = item.originalDayOfWeek === dayOfWeek
          && periods[periodIdx].startTime === item.originalStartTime
      if (isSamePosition)
        return false

      return true
    },

    drop: (item) => {
      const newStartTime = periods[periodIdx].startTime

      // Compute new endTime by walking forward durationPeriods steps.
      // If the slot runs to the edge of the configured day, cap at the
      // last period's endTime.
      const endPeriodIdx = Math.min(
        periodIdx + item.durationPeriods,
        periods.length,
      )
      const newEndTime
        = endPeriodIdx < periods.length
          ? periods[endPeriodIdx].startTime
          : (periods.at(-1)?.endTime ?? periods.at(-1).endTime)

      // 1. Optimistic update — moves the card instantly in the UI
      rescheduleSlot(item.slotId, dayOfWeek, newStartTime, newEndTime)

      // 2. rescheduleSlot calls onReschedule (wired to your mutation in the page)
      //    The mutation handles the API call + rollback on error.
      //    See timetable-context.tsx — onReschedule is fired inside rescheduleSlot.
    },

    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  connectDrop(dropRef)

  return { dropRef, isOver, canDrop }
}
