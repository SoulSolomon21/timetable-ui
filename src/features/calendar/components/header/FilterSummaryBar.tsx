import { AlertTriangle, LayoutGrid } from 'lucide-react'
import { useTimetable } from '@/features/calendar/contexts/TimetableContext'
import { getFilterLabel } from '@/features/calendar/helpers/FilterEntities'
import { cn } from '@/lib/utils'

export function FilterSummaryBar() {
  const {
    filter,
    visibleSlots,
    conflicts,
    lecturers,
    rooms,
    programs,
  } = useTimetable()

  const filterLabel = getFilterLabel(
    filter.dimension,
    filter.selectedId,
    lecturers,
    rooms,
    programs,
  )

  // Only count conflicts that involve at least one visible slot.
  // When filtered to a single lecturer, we only want to flag
  // conflicts that affect them — not the whole timetable.
  const visibleSlotIds = new Set(visibleSlots.map(s => s.id))
  const visibleConflictCount = conflicts.filter(c =>
    c.slotIds.some(id => visibleSlotIds.has(id)),
  ).length

  const isFiltered = filter.selectedId !== null

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-1.5 rounded-md text-xs',
        'border border-border bg-muted/30',
        'transition-colors duration-150',
      )}
      aria-live="polite" // screen reader announces filter changes
      aria-label="Current timetable filter"
    >
      {/* Grid icon */}
      <LayoutGrid
        className="text-muted-foreground shrink-0"
        style={{ width: 13, height: 13 }}
      />

      {/* Filter description */}
      <span className="text-muted-foreground">
        Viewing
        {' '}
        <span
          className={cn(
            'font-medium',
            isFiltered ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {filterLabel}
        </span>
      </span>

      {/* Separator */}
      <span className="text-border">·</span>

      {/* Slot count */}
      <span className="text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">
          {visibleSlots.length}
        </span>
        {' '}
        {visibleSlots.length === 1 ? 'slot' : 'slots'}
      </span>

      {/* Conflict count — only shown when there are conflicts */}
      {visibleConflictCount > 0 && (
        <>
          <span className="text-border">·</span>
          <span
            className="flex items-center gap-1 text-red-600 dark:text-red-400"
            title="Conflicts involve slots where the same room, lecturer, or program is double-booked"
          >
            <AlertTriangle style={{ width: 12, height: 12 }} />
            <span className="font-medium tabular-nums">
              {visibleConflictCount}
            </span>
            {' '}
            {visibleConflictCount === 1 ? 'conflict' : 'conflicts'}
          </span>
        </>
      )}
    </div>
  )
}

/**
 * Placing these in your header — in your existing TimetableHeader (or wherever the big-calendar header lives), replace the user avatar row with:
 *
 * <div className="flex items-center justify-between gap-4 p-3">
 *  // Left: date nav — keep as-is from big-calendar
 *  <CalendarNav />
 *  // Right: our new filter
 *  <FilterSwitcher />
 * </div>
 * //Below the header, above the grid
 * <div className="px-3 pb-2">
 *  <FilterSummaryBar />
 * </div>
 */
