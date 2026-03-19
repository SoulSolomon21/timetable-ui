import type { ITimetableSlot } from '@/features/calendar/interfaces'
import { AlertTriangle, MapPin, User } from 'lucide-react'
import { useTimetable } from '@/features/calendar/contexts/TimetableContext'
import { getSlotDurationPeriods, SESSION_TYPE_META, SLOT_COLOR_MAP } from '@/features/calendar/helpers/SlotColors'
import { cn } from '@/lib/utils' // shadcn's cn utility
import { useSlotDrag } from '../hooks/useSlotDrag'

interface TeachingSlotCardProps {
  slot: ITimetableSlot
  // Height is controlled by the parent grid cell, but we need duration
  // to decide how much content to show (compact vs full layout).
  className?: string
  // Called when user clicks the card — open the slot detail dialog.
  onClick?: (slot: ITimetableSlot) => void
  // Whether this card is currently being dragged (DnD ghost state).
  isDragging?: boolean
}

export function TeachingSlotCard({
  slot,
  className,
  onClick,
}: Omit<TeachingSlotCardProps, 'isDragging'>) {
  const { dragRef, isDragging } = useSlotDrag(slot)
  const { conflictsBySlotId } = useTimetable()

  const colors = SLOT_COLOR_MAP[slot.color]
  const sessionMeta = SESSION_TYPE_META[slot.sessionType]
  const periods = getSlotDurationPeriods(slot.startTime, slot.endTime)

  // A slot has a conflict if it appears in the conflict index.
  const slotConflicts = conflictsBySlotId.get(slot.id) ?? []
  const hasConflict = slotConflicts.length > 0

  // Layout mode: single-period slots get a compact layout (one line, key info only).
  // Two or more periods get the full layout with all metadata rows.
  const isCompact = periods === 1

  return (
    <div
      role="button"
      ref={dragRef}
      tabIndex={0}
      onClick={() => onClick?.(slot)}
      onKeyDown={e => e.key === 'Enter' && onClick?.(slot)}
      className={cn(
        // Base card styles
        'relative flex flex-col h-full w-full overflow-hidden rounded-sm cursor-pointer',
        'border-l-4 border border-transparent select-none',
        'transition-opacity duration-150',

        // Color
        colors.bg,
        colors.border,

        // Conflict ring — drawn as a ring inset so it doesn't shift layout
        hasConflict && 'ring-2 ring-inset ring-red-400 dark:ring-red-500',

        // Dragging ghost — slightly transparent
        isDragging && 'opacity-50',

        // Hover — subtle lift effect without transform (transforms break DnD positioning)
        'hover:brightness-95 dark:hover:brightness-110',

        // Padding: tighter in compact mode
        isCompact ? 'px-1.5 py-0.5' : 'px-2 py-1.5 gap-0.5',

        className,
      )}
    >
      {/* ── Top row: course code + session type badge ── */}
      <div className="flex items-center justify-between gap-1 min-w-0">
        <span
          className={cn(
            'font-semibold truncate leading-tight',
            isCompact ? 'text-[11px]' : 'text-xs',
            colors.courseCode,
          )}
        >
          {slot.course.code}
        </span>

        <span
          className={cn(
            'shrink-0 rounded px-1 py-px font-medium leading-tight',
            isCompact ? 'text-[9px]' : 'text-[10px]',
            sessionMeta.badgeBg,
            sessionMeta.badgeText,
          )}
        >
          {sessionMeta.label}
        </span>
      </div>

      {/* ── Course title — hidden in compact mode ── */}
      {!isCompact && (
        <p className="text-[11px] text-foreground/80 leading-tight truncate">
          {slot.course.title}
        </p>
      )}

      {/* ── Room + Lecturer — full mode shows both, compact shows room only ── */}
      <div
        className={cn(
          'flex items-center gap-2 min-w-0',
          isCompact ? 'mt-0' : 'mt-auto',
        )}
      >
        {/* Room */}
        <span className="flex items-center gap-0.5 min-w-0 shrink-0">
          <MapPin
            className="text-muted-foreground shrink-0"
            style={{ width: 10, height: 10 }}
          />
          <span className="text-[10px] text-muted-foreground truncate">
            {slot.room.name}
          </span>
        </span>

        {/* Lecturer — hidden in compact mode to save space */}
        {!isCompact && (
          <span className="flex items-center gap-0.5 min-w-0">
            <User
              className="text-muted-foreground shrink-0"
              style={{ width: 10, height: 10 }}
            />
            <span className="text-[10px] text-muted-foreground truncate">
              {/* Show title + last name only to save space */}
              {formatLecturerShort(slot.lecturer.title, slot.lecturer.name)}
            </span>
          </span>
        )}
      </div>

      {/* ── Conflict badge — absolute top-left corner indicator ── */}
      {hasConflict && (
        <ConflictBadge
          conflicts={slotConflicts}
          isCompact={isCompact}
        />
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ConflictBadgeProps {
  conflicts: ReturnType<ReturnType<typeof useTimetable>['conflictsBySlotId']['get']> & {}
  isCompact: boolean
}

function ConflictBadge({ conflicts, isCompact }: ConflictBadgeProps) {
  // Build a tooltip-friendly description of all conflicts on this slot.
  // The Tooltip is a shadcn primitive — swap for your preferred one.
  const descriptions = conflicts?.map(c => c.description).join('\n') ?? ''

  return (
    <div
      title={descriptions} // native tooltip — replace with shadcn <Tooltip> when wiring up
      className={cn(
        'absolute bottom-0.5 right-0.5',
        'flex items-center gap-0.5 rounded px-1 py-px',
        'bg-red-100 dark:bg-red-900/60',
      )}
    >
      <AlertTriangle
        className="text-red-500 dark:text-red-400 shrink-0"
        style={{ width: 9, height: 9 }}
      />
      {!isCompact && (
        <span className="text-[9px] font-medium text-red-600 dark:text-red-400">
          {conflicts?.length === 1 ? 'Conflict' : `${conflicts?.length} conflicts`}
        </span>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// "Dr. John Mukasa" → "Dr. Mukasa"
// "John Mukasa" → "J. Mukasa"
function formatLecturerShort(title: string | undefined, fullName: string): string {
  const parts = fullName.trim().split(' ')
  const lastName = parts.at(-1)

  if (title)
    return `${title} ${lastName}`

  const firstName = parts[0]
  return `${firstName[0]}. ${lastName}`
}
