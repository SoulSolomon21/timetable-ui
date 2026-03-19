import type { DepartmentDraft, DepartmentStatus } from '@/features/timetabling/types'
import {
  AlertTriangleIcon,
  CheckCheckIcon,
  ChevronRightIcon,
  ClockIcon,
  Loader2Icon,
  PlayCircleIcon,
  SparklesIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from '@/features/timetabling/utils'
import { DepartmentExpanded } from './DepartmentExpanded'

const statusIconStyles: Record<DepartmentStatus, string> = {
  conflict: 'border-destructive/30 bg-destructive/10 text-destructive',
  ready:
    'border-green-200 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-950 dark:text-green-400',
  pending:
    'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400',
  waiting: 'border-border bg-muted/50 text-muted-foreground',
  published: 'border-border bg-muted/50 text-muted-foreground',
}

const statusIcons: Record<DepartmentStatus, React.ElementType> = {
  conflict: AlertTriangleIcon,
  ready: CheckCheckIcon,
  pending: SparklesIcon,
  waiting: Loader2Icon,
  published: CheckCheckIcon,
}

interface DepartmentRowProps {
  dept: DepartmentDraft
  onCohortSelect: (deptId: string, cohortId: string) => void
  onGenerateRequest: (deptId: string) => void
}

export function DepartmentRow({ dept, onCohortSelect, onGenerateRequest }: DepartmentRowProps) {
  const [expanded, setExpanded] = useState(false)

  const isExpandable = dept.status === 'conflict' || dept.status === 'ready'
  const isPending = dept.status === 'pending'
  const isInactive = dept.status === 'waiting' || dept.status === 'published'

  const Icon = statusIcons[dept.status]

  return (
    <div>
      <div
        className={`flex items-center gap-4 px-4 py-3 transition-colors ${
          isExpandable ? 'cursor-pointer hover:bg-muted/50' : 'cursor-default'
        } ${isInactive ? 'opacity-60' : ''}`}
        onClick={isExpandable ? () => setExpanded(e => !e) : undefined}
      >
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-md border ${statusIconStyles[dept.status]}`}
        >
          <Icon className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{dept.name}</span>

            {dept.status === 'conflict' && !!dept.conflictCount && (
              <Badge variant="destructive" className="gap-1 text-xs">
                <AlertTriangleIcon className="size-3" />
                {dept.conflictCount}
                {' '}
                {dept.conflictCount === 1 ? 'conflict' : 'conflicts'}
              </Badge>
            )}

            {dept.status === 'ready' && (
              <Badge variant="outline" className="gap-1 text-xs text-green-700 dark:text-green-400">
                <CheckCheckIcon className="size-3" />
                No conflicts
              </Badge>
            )}

            {dept.status === 'pending' && (
              <Badge variant="outline" className="gap-1 text-xs text-blue-700 dark:text-blue-400">
                <SparklesIcon className="size-3" />
                Assignments ready
              </Badge>
            )}
          </div>

          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
            {dept.unitCount != null && (
              <span>
                {dept.unitCount}
                {' '}
                units
              </span>
            )}

            {dept.studentCount != null && (
              <span>
                {dept.studentCount.toLocaleString()}
                {' '}
                students
              </span>
            )}

            {dept.generatedAt && (
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3" />
                Draft
                {' '}
                {formatDistanceToNow(dept.generatedAt, { addSuffix: true })}
              </span>
            )}

            {dept.assignmentsApprovedAt && (
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3" />
                Approved
                {' '}
                {formatDistanceToNow(dept.assignmentsApprovedAt, { addSuffix: true })}
              </span>
            )}

            {dept.publishedAt && (
              <span>
                Published
                {formatDistanceToNow(dept.publishedAt, { addSuffix: true })}
              </span>
            )}
          </div>
        </div>

        {isExpandable && (
          <ChevronRightIcon
            className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
              expanded ? 'rotate-90' : ''
            }`}
          />
        )}

        {isPending && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onGenerateRequest(dept.id)
            }}
          >
            <PlayCircleIcon className="size-3.5" />
            Generate
          </Button>
        )}
      </div>

      {isExpandable && expanded && (
        <DepartmentExpanded
          dept={dept}
          onCohortSelect={cohortId => onCohortSelect(dept.id, cohortId)}
        />
      )}
    </div>
  )
}
