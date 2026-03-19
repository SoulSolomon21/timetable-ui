import type { TDayOfWeek } from '../../types'
import type { IAcademicPeriod, IGridPlacement, TWeekDay } from '@/features/calendar/helpers/WeekGridHelpers'
import type { ITimetableSlot } from '@/features/calendar/interfaces'
import { useMemo } from 'react'
import { TeachingSlotCard } from '@/features/calendar/components/TeachingSlotCard'
import { useTimetable } from '@/features/calendar/contexts/TimetableContext'
import {
  DEFAULT_ACADEMIC_PERIODS,
  getGridPlacement,
  getLongestSlot,
  getPeriodSpan,
  groupSlotsByPosition,
  HEADER_ROW_HEIGHT,

  PERIOD_HEIGHT_PX,
  TIME_COL_WIDTH,

  WEEK_DAYS,
} from '@/features/calendar/helpers/WeekGridHelpers'
import { cn } from '@/lib/utils'
import { useCellDrop } from '../../hooks/useCellDrop'

// ─── Props ────────────────────────────────────────────────────────────────────

interface TimetableWeekViewProps {
  // Override the default period set (e.g. for faculties with different hours)
  periods?: IAcademicPeriod[]
  // Called when the user clicks a slot card — open your detail/edit dialog here
  onSlotClick?: (slot: ITimetableSlot) => void
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TimetableWeekView({
  periods = DEFAULT_ACADEMIC_PERIODS,
  onSlotClick,
}: TimetableWeekViewProps) {
  const { visibleSlots } = useTimetable()

  // Groups slots by (dayOfWeek, startTime) — slots sharing a key
  // are rendered side-by-side inside a shared container.
  const slotGroups = useMemo(
    () => groupSlotsByPosition(visibleSlots, periods),
    [visibleSlots, periods],
  )

  // CSS grid template strings
  const gridTemplateColumns = `${TIME_COL_WIDTH} repeat(5, 1fr)`
  const gridTemplateRows = `${HEADER_ROW_HEIGHT} repeat(${periods.length}, ${PERIOD_HEIGHT_PX}px)`

  return (
    // Outer container: rounded border, clips the sticky header's corners
    <div className="overflow-hidden rounded-md border border-border">
      {/* Scroll container: both axes so sticky elements work correctly */}
      <div className="overflow-auto">
        <div
          className="relative grid"
          style={{
            gridTemplateColumns,
            gridTemplateRows,
            // Minimum width prevents the grid from collapsing below legibility
            minWidth: 640,
          }}
        >
          {/* ── Layer 1: sticky corner ── */}
          <CornerCell />

          {/* ── Layer 1: sticky day header cells (row 1, cols 2–6) ── */}
          {WEEK_DAYS.map(day => (
            <DayHeaderCell key={day.dayOfWeek} day={day} />
          ))}

          {/* ── Layer 1: sticky time label cells (col 1, rows 2–N+1) ── */}
          {periods.map((period, periodIdx) => (
            <TimeLabelCell
              key={period.startTime}
              period={period}
              periodIdx={periodIdx}
            />
          ))}

          {/* ── Layer 0: background cells — borders and lunch shading ── */}
          {WEEK_DAYS.map(day =>
            periods.map((period, periodIdx) => (
              <BackgroundCell
                key={`bg-${day.dayOfWeek}-${periodIdx}`}
                column={day.dayOfWeek + 2}
                row={periodIdx + 2}
                dayOfWeek={day.dayOfWeek}
                periodIdx={periodIdx}
                periods={periods}
                isLastColumn={day.dayOfWeek === 4}
                isLastRow={periodIdx === periods.length - 1}
                isLunchHour={period.startTime === '13:00'}
              />
            )),
          )}

          {/* ── Layer 2: slot containers (one per unique day+startTime combo) ── */}
          {Array.from(slotGroups.entries(), ([key, slots]) => {
            const longest = getLongestSlot(slots, periods)
            const firstSlot = slots[0]

            const placement = getGridPlacement(
              firstSlot.dayOfWeek,
              firstSlot.startTime,
              longest.endTime, // container spans the tallest slot
              periods,
            )

            return (
              <SlotGroupContainer
                key={key}
                slots={slots}
                placement={placement}
                periods={periods}
                onSlotClick={onSlotClick}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Top-left corner — sticky in both axes so headers don't scroll away
function CornerCell() {
  return (
    <div
      className="sticky left-0 top-0 z-20 border-b border-r border-border bg-background"
      style={{ gridColumn: 1, gridRow: 1 }}
    />
  )
}

// Mon / Tue / ... column headers — sticky so they stay visible on vertical scroll
function DayHeaderCell({ day }: { day: TWeekDay }) {
  return (
    <div
      className={cn(
        'sticky top-0 z-20 flex items-center justify-center',
        'border-b border-border bg-background px-2',
        day.dayOfWeek !== 4 && 'border-r',
      )}
      style={{
        gridColumn: day.dayOfWeek + 2,
        gridRow: 1,
      }}
    >
      {/* Responsive: show full name on wider screens, short on narrow */}
      <span className="hidden text-xs font-medium text-muted-foreground sm:block">
        {day.label}
      </span>
      <span className="text-xs font-medium text-muted-foreground sm:hidden">
        {day.short}
      </span>
    </div>
  )
}

// 8:00, 9:00... time labels — sticky so they stay visible on horizontal scroll
function TimeLabelCell({
  period,
  periodIdx,
}: {
  period: IAcademicPeriod
  periodIdx: number
}) {
  return (
    <div
      className={cn(
        'sticky left-0 z-10',
        'flex items-start justify-end',
        'border-b border-r border-border bg-background',
        'pr-2 pt-1',
      )}
      style={{
        gridColumn: 1,
        gridRow: periodIdx + 2,
      }}
    >
      <span className="text-[11px] tabular-nums leading-none text-muted-foreground">
        {period.label}
      </span>
    </div>
  )
}

// Background cells — provide the grid lines and lunch-hour shading.
// These are purely presentational and sit at z-0 below slot cards.
function BackgroundCell({
  column,
  row,
  periodIdx,
  dayOfWeek,
  periods,
  isLastColumn,
  isLastRow,
  isLunchHour,
}: {
  column: number
  row: number
  periodIdx: number
  dayOfWeek: TDayOfWeek
  periods: IAcademicPeriod[]
  isLastColumn: boolean
  isLastRow: boolean
  isLunchHour: boolean
}) {
  const { dropRef, isOver, canDrop } = useCellDrop({ dayOfWeek, periodIdx, periods })

  return (
    <div
      ref={dropRef} // ← add this
      className={cn(
        !isLastColumn && 'border-r',
        !isLastRow && 'border-b',
        'border-border transition-colors duration-100',
        isLunchHour && 'bg-muted/20',
        // Drop target feedback
        isOver && canDrop && 'bg-primary/10',
        isOver && !canDrop && 'bg-destructive/10',
      )}
      style={{ gridColumn: column, gridRow: row }}
    />
  )
}

// Container for one or more slots starting at the same day+time.
// Single slot: fills the container.
// Multiple slots (conflict): flex-row side-by-side tiling.
function SlotGroupContainer({
  slots,
  placement,
  periods,
  onSlotClick,
}: {
  slots: ITimetableSlot[]
  placement: IGridPlacement
  periods: IAcademicPeriod[]
  onSlotClick?: (slot: ITimetableSlot) => void
}) {
  return (
    <div
      // z-10 sits above background cells (z-0) but below sticky headers (z-20)
      className="z-10 flex gap-0.5 p-0.5"
      style={{
        gridColumn: placement.column,
        gridRow: `${placement.rowStart} / span ${placement.rowSpan}`,
      }}
    >
      {slots.map((slot) => {
        // Each card's height is a fraction of the container's total height,
        // proportional to the slot's own span vs the container span.
        // A 1-period slot inside a 2-period container sits in the top half.
        const slotSpan = getPeriodSpan(slot.startTime, slot.endTime, periods)
        const heightPct = (slotSpan / placement.rowSpan) * 100

        return (
          <div
            key={slot.id}
            className="self-start min-w-0"
            style={{
              flex: '1 1 0', // equal width shares among tiled slots
              height: `${heightPct}%`,
            }}
          >
            <TeachingSlotCard
              slot={slot}
              className="h-full"
              onClick={onSlotClick}
            />
          </div>
        )
      })}
    </div>
  )
}
