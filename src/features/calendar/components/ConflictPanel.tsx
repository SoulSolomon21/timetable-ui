import type { GroupedConflicts, IEnrichedConflict } from '@/features/calendar/helpers/ConflictHelpers'
import { AlertTriangle, ChevronRight, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTimetable } from '@/features/calendar/contexts/TimetableContext'
import {
  CONFLICT_TYPE_META,
  conflictEntityId,
  conflictEntityLabel,
  conflictTimeLabel,
  enrichConflicts,
  groupConflictsByType,

} from '@/features/calendar/helpers/ConflictHelpers'
import { cn } from '@/lib/utils'

// ─── Component ────────────────────────────────────────────────────────────────

interface ConflictPanelProps {
  className?: string
}

export function ConflictPanel({ className }: ConflictPanelProps) {
  const { conflicts, slots, setFilterDimension, setSelectedId } = useTimetable()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const enriched = useMemo(
    () => enrichConflicts(conflicts, slots),
    [conflicts, slots],
  )

  const grouped = useMemo(
    () => groupConflictsByType(enriched),
    [enriched],
  )

  const totalCount = enriched.length

  // ── Collapsed state — just a thin strip with a badge ──
  if (isCollapsed) {
    return (
      <CollapsedStrip
        count={totalCount}
        onExpand={() => setIsCollapsed(false)}
        className={className}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex w-64 shrink-0 flex-col',
        'rounded-md border border-border bg-background',
        'overflow-hidden',
        className,
      )}
    >
      {/* ── Header ── */}
      <PanelHeader
        count={totalCount}
        onCollapse={() => setIsCollapsed(true)}
      />

      {/* ── Body ── */}
      {totalCount === 0
        ? (
            <EmptyState />
          )
        : (
            <ScrollArea className="flex-1">
              <div className="flex flex-col">
                {grouped.map(group => (
                  <ConflictGroup
                    key={group.type}
                    group={group}
                    onNavigate={(conflict) => {
                      // Switch the filter dimension and entity so the
                      // week grid shows the conflicting slots in context
                      const meta = CONFLICT_TYPE_META[conflict.type]
                      setFilterDimension(meta.filterDimension)
                      setSelectedId(conflictEntityId(conflict))
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PanelHeader({
  count,
  onCollapse,
}: {
  count: number
  onCollapse: () => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-2">
      <div className="flex items-center gap-2">
        <AlertTriangle
          className="text-red-500 shrink-0"
          style={{ width: 13, height: 13 }}
        />
        <span className="text-xs font-medium">Conflicts</span>

        {count > 0 && (
          <span className="rounded-full bg-red-100 px-1.5 py-px text-[10px] font-medium tabular-nums text-red-700 dark:bg-red-900/50 dark:text-red-300">
            {count}
          </span>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onCollapse}
        title="Collapse conflict panel"
      >
        <PanelRightClose style={{ width: 13, height: 13 }} />
      </Button>
    </div>
  )
}

function ConflictGroup({
  group,
  onNavigate,
}: {
  group: GroupedConflicts[number]
  onNavigate: (conflict: IEnrichedConflict) => void
}) {
  return (
    <div>
      {/* Group heading */}
      <div className="bg-muted/30 px-3 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {group.meta.label}
          <span className="ml-1.5 tabular-nums">{group.conflicts.length}</span>
        </span>
      </div>

      {/* Conflict rows */}
      {group.conflicts.map(conflict => (
        <ConflictRow
          key={conflict.id}
          conflict={conflict}
          accentColor={group.meta.accentColor}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )
}

function ConflictRow({
  conflict,
  accentColor,
  onNavigate,
}: {
  conflict: IEnrichedConflict
  accentColor: string
  onNavigate: (conflict: IEnrichedConflict) => void
}) {
  const entityLabel = conflictEntityLabel(conflict)
  const timeLabel = conflictTimeLabel(conflict)

  return (
    <div
      className={cn(
        'relative flex flex-col gap-1 border-b border-border px-3 py-2.5',
        'border-l-2',
        accentColor,
        'transition-colors hover:bg-muted/30',
      )}
    >
      {/* Entity + time */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-[11px] font-medium text-foreground">
          {entityLabel}
        </span>
        <span className="shrink-0 tabular-nums text-[10px] text-muted-foreground">
          {timeLabel}
        </span>
      </div>

      {/* Course codes — what's clashing */}
      <p className="text-[10px] text-muted-foreground truncate">
        {conflict.slotA.course.code}
        <span className="mx-1 text-border">vs</span>
        {conflict.slotB.course.code}
      </p>

      {/* Navigate button */}
      <button
        onClick={() => onNavigate(conflict)}
        className={cn(
          'mt-0.5 flex items-center gap-0.5 self-end',
          'text-[10px] text-muted-foreground',
          'rounded px-1.5 py-0.5',
          'hover:bg-muted hover:text-foreground',
          'transition-colors',
        )}
      >
        View
        {' '}
        {CONFLICT_TYPE_META[conflict.type].filterDimension}
        <ChevronRight style={{ width: 10, height: 10 }} />
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-10">
      <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/40">
        <AlertTriangle
          className="text-green-600 dark:text-green-400"
          style={{ width: 16, height: 16 }}
        />
      </div>
      <p className="text-center text-xs text-muted-foreground">
        No conflicts detected in the current timetable.
      </p>
    </div>
  )
}

function CollapsedStrip({
  count,
  onExpand,
  className,
}: {
  count: number
  onExpand: () => void
  className?: string
}) {
  return (
    <button
      onClick={onExpand}
      title="Expand conflict panel"
      className={cn(
        'flex w-8 shrink-0 flex-col items-center justify-start gap-2',
        'rounded-md border border-border bg-background py-3',
        'hover:bg-muted/40 transition-colors',
        className,
      )}
    >
      <PanelRightOpen style={{ width: 13, height: 13 }} className="text-muted-foreground" />
      {count > 0 && (
        <span className="rounded-full bg-red-100 px-1 py-px text-[9px] font-medium tabular-nums text-red-700 dark:bg-red-900/50 dark:text-red-300">
          {count}
        </span>
      )}
    </button>
  )
}
