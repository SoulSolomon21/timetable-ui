'use client'

import {
  AlertTriangleIcon,
  CheckCheckIcon,
  ChevronRightIcon,
  ClockIcon,
  Loader2Icon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// --- Types ---

type DepartmentStatus = 'conflict' | 'ready' | 'waiting' | 'published'

interface DepartmentDraft {
  id: string
  name: string
  status: DepartmentStatus
  cohortCount: number
  conflictCount?: number
  studentCount?: number
  generatedAt?: Date
  publishedAt?: Date
}

// --- Mock data — replace with React Query / API call ---

const departments: DepartmentDraft[] = [
  {
    id: 'cs',
    name: 'Computer Science',
    status: 'conflict',
    cohortCount: 4,
    conflictCount: 3,
    studentCount: 274,
    generatedAt: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    id: 'ba',
    name: 'Business Administration',
    status: 'conflict',
    cohortCount: 6,
    conflictCount: 1,
    studentCount: 412,
    generatedAt: new Date(Date.now() - 1000 * 60 * 240),
  },
  {
    id: 'edu',
    name: 'Education',
    status: 'conflict',
    cohortCount: 3,
    conflictCount: 2,
    studentCount: 188,
    generatedAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 'eng',
    name: 'Engineering',
    status: 'ready',
    cohortCount: 5,
    conflictCount: 0,
    studentCount: 320,
    generatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'ss',
    name: 'Social Sciences',
    status: 'ready',
    cohortCount: 4,
    conflictCount: 0,
    studentCount: 295,
    generatedAt: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    id: 'law',
    name: 'Law',
    status: 'waiting',
    cohortCount: 3,
  },
  {
    id: 'med',
    name: 'Medicine',
    status: 'waiting',
    cohortCount: 5,
  },
  {
    id: 'arts',
    name: 'Arts & Design',
    status: 'published',
    cohortCount: 3,
    studentCount: 156,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
  },
]

// --- Helpers ---

function formatRelativeTime(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60)
  if (minutes < 60)
    return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)
    return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const statusConfig: Record<
  DepartmentStatus,
  {
    label: string
    description: string
    icon: React.ElementType
  }
> = {
  conflict: {
    label: 'Needs attention',
    description: 'Resolve conflicts before publishing is available',
    icon: AlertTriangleIcon,
  },
  ready: {
    label: 'Ready to review',
    description: 'Draft generated, no conflicts found',
    icon: CheckCheckIcon,
  },
  waiting: {
    label: 'Awaiting assignments',
    description: 'Assignments not yet approved in Alpha-MIS',
    icon: Loader2Icon,
  },
  published: {
    label: 'Published',
    description: 'Timetable is live for students and lecturers',
    icon: CheckCheckIcon,
  },
}

const statusOrder: DepartmentStatus[] = ['conflict', 'ready', 'waiting', 'published']

// --- Sub-components ---

function StatusIcon({ status }: { status: DepartmentStatus }) {
  const { icon: Icon } = statusConfig[status]

  const styles: Record<DepartmentStatus, string> = {
    conflict: 'border-destructive/30 bg-destructive/10 text-destructive',
    ready: 'border-green-200 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-950 dark:text-green-400',
    waiting: 'border-border bg-muted/50 text-muted-foreground',
    published: 'border-border bg-muted/50 text-muted-foreground',
  }

  return (
    <div className={`flex size-8 shrink-0 items-center justify-center rounded-md border ${styles[status]}`}>
      <Icon className="size-4" />
    </div>
  )
}

function DepartmentRow({
  dept,
  onClick,
}: {
  dept: DepartmentDraft
  onClick: () => void
}) {
  const isActionable = dept.status === 'conflict' || dept.status === 'ready'

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 transition-colors first:rounded-t-none last:rounded-b-lg ${
        isActionable
          ? 'cursor-pointer hover:bg-muted/50'
          : 'cursor-default'
      }`}
      onClick={isActionable ? onClick : undefined}
    >
      <StatusIcon status={dept.status} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`truncate text-sm font-medium ${!isActionable ? 'text-muted-foreground' : ''}`}>
            {dept.name}
          </span>
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
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {dept.cohortCount}
            {' '}
            {dept.cohortCount === 1 ? 'cohort' : 'cohorts'}
          </span>
          {dept.studentCount != null && (
            <>
              <span>·</span>
              <span>
                {dept.studentCount.toLocaleString()}
                {' '}
                students
              </span>
            </>
          )}
          {dept.generatedAt && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3" />
                Draft
                {' '}
                {formatRelativeTime(dept.generatedAt)}
              </span>
            </>
          )}
          {dept.publishedAt && (
            <>
              <span>·</span>
              <span>
                Published
                {' '}
                {formatRelativeTime(dept.publishedAt)}
              </span>
            </>
          )}
        </div>
      </div>

      {isActionable && (
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      )}
    </div>
  )
}

function WorkQueueSection({
  status,
  departments,
  onDepartmentClick,
}: {
  status: DepartmentStatus
  departments: DepartmentDraft[]
  onDepartmentClick: (dept: DepartmentDraft) => void
}) {
  if (departments.length === 0)
    return null

  const config = statusConfig[status]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
            <CardDescription className="text-xs">{config.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {departments.length}
            {' '}
            {departments.length === 1 ? 'department' : 'departments'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {departments.map(dept => (
            <DepartmentRow
              key={dept.id}
              dept={dept}
              onClick={() => onDepartmentClick(dept)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// --- Main component ---

function WorkQueue() {
  const grouped = statusOrder.reduce<Record<DepartmentStatus, DepartmentDraft[]>>(
    (acc, status) => {
      acc[status] = departments.filter(d => d.status === status)
      return acc
    },
    { conflict: [], ready: [], waiting: [], published: [] },
  )

  function handleDepartmentClick(dept: DepartmentDraft) {
    // TODO: router.push(`/timetable/${dept.id}/draft`)
    console.log('Opening draft for', dept.name)
  }

  const hasWork = grouped.conflict.length > 0 || grouped.ready.length > 0

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      {statusOrder.map(status => (
        <WorkQueueSection
          key={status}
          status={status}
          departments={grouped[status]}
          onDepartmentClick={handleDepartmentClick}
        />
      ))}

      {!hasWork && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <CheckCheckIcon className="size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">All departments up to date</p>
            <p className="text-xs text-muted-foreground">
              No drafts pending review for this period
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default WorkQueue
