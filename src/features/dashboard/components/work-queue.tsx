import { formatDistanceToNow } from 'date-fns'

import {
  AlertTriangleIcon,
  CheckCheckIcon,
  ChevronRightIcon,
  ClockIcon,
  Loader2Icon,
  PlayCircleIcon,
  SparklesIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// --- Types ---

type DepartmentStatus = 'conflict' | 'ready' | 'pending' | 'waiting' | 'published'

interface DepartmentDraft {
  id: string
  name: string
  status: DepartmentStatus
  cohortCount: number
  unitCount?: number
  conflictCount?: number
  studentCount?: number
  generatedAt?: Date
  publishedAt?: Date
  assignmentsApprovedAt?: Date
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
    id: 'nurs',
    name: 'Nursing',
    status: 'pending',
    cohortCount: 4,
    unitCount: 22,
    assignmentsApprovedAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: 'the',
    name: 'Theology',
    status: 'pending',
    cohortCount: 2,
    unitCount: 10,
    assignmentsApprovedAt: new Date(Date.now() - 1000 * 60 * 200),
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
  pending: {
    label: 'Ready to generate',
    description: 'Teaching assignments approved — no timetable draft yet',
    icon: SparklesIcon,
  },
  waiting: {
    label: 'Awaiting teaching assignments',
    description: 'Assignments not yet approved in Alpha-MIS',
    icon: Loader2Icon,
  },
  published: {
    label: 'Published',
    description: 'Timetable is live for students and lecturers',
    icon: CheckCheckIcon,
  },
}

const statusOrder: DepartmentStatus[] = ['conflict', 'ready', 'pending', 'waiting', 'published']

// --- Sub-components ---

function StatusIcon({ status }: { status: DepartmentStatus }) {
  const { icon: Icon } = statusConfig[status]

  const styles: Record<DepartmentStatus, string> = {
    conflict: 'border-destructive/30 bg-destructive/10 text-destructive',
    ready: 'border-green-200 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-950 dark:text-green-400',
    pending: 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400',
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
  onOpen,
  onGenerate,
}: {
  dept: DepartmentDraft
  onOpen: () => void
  onGenerate: () => void
}) {
  const isNavigable = dept.status === 'conflict' || dept.status === 'ready'
  const isPending = dept.status === 'pending'
  const isInactive = dept.status === 'waiting' || dept.status === 'published'

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 transition-colors first:rounded-t-none last:rounded-b-lg ${
        isNavigable
          ? 'cursor-pointer hover:bg-muted/50'
          : 'cursor-default'
      }`}
      onClick={isNavigable ? onOpen : undefined}
    >
      <StatusIcon status={dept.status} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`truncate text-sm font-medium ${isInactive ? 'text-muted-foreground' : ''}`}>
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

          {dept.status === 'pending' && (
            <Badge variant="outline" className="gap-1 text-xs text-blue-700 dark:text-blue-400">
              <SparklesIcon className="size-3" />
              Assignments ready
            </Badge>
          )}
        </div>

        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {dept.cohortCount}
            {' '}
            {dept.cohortCount === 1 ? 'cohort' : 'cohorts'}
          </span>

          {dept.unitCount != null && (
            <>
              <span>·</span>
              <span>
                {dept.unitCount}
                {' '}
                units
              </span>
            </>
          )}

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
                Draft generated
                {' '}
                {formatDistanceToNow(dept.generatedAt, { addSuffix: true, includeSeconds: true })}
              </span>
            </>
          )}

          {dept.assignmentsApprovedAt && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3" />
                Approved
                {' '}
                {formatDistanceToNow(dept.assignmentsApprovedAt, { addSuffix: true, includeSeconds: true })}
              </span>
            </>
          )}

          {dept.publishedAt && (
            <>
              <span>·</span>
              <span>
                Published
                {' '}
                {formatDistanceToNow(dept.publishedAt, { addSuffix: true, includeSeconds: true })}
              </span>
            </>
          )}
        </div>
      </div>

      {isNavigable && (
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      )}

      {isPending && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          onClick={(e) => {
            e.stopPropagation()
            onGenerate()
          }}
        >
          <PlayCircleIcon className="size-3.5" />
          Generate
        </Button>
      )}
    </div>
  )
}

function WorkQueueSection({
  status,
  departments,
  onDepartmentOpen,
  onDepartmentGenerate,
}: {
  status: DepartmentStatus
  departments: DepartmentDraft[]
  onDepartmentOpen: (dept: DepartmentDraft) => void
  onDepartmentGenerate: (dept: DepartmentDraft) => void
}) {
  if (departments.length === 0)
    return null

  const config = statusConfig[status]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{config.label}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
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
              onOpen={() => onDepartmentOpen(dept)}
              onGenerate={() => onDepartmentGenerate(dept)}
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
    { conflict: [], ready: [], pending: [], waiting: [], published: [] },
  )

  function handleDepartmentOpen(dept: DepartmentDraft) {
    // TODO: router.push(`/timetable/${dept.id}/draft`)
    console.log('Opening draft for', dept.name)
  }

  function handleDepartmentGenerate(dept: DepartmentDraft) {
    // TODO: POST /api/timetable/generate { departmentId: dept.id }
    // then optimistically move dept to 'conflict' or 'ready' once draft returns
    console.log('Triggering generation for', dept.name)
  }

  const hasWork = statusOrder.some(s => grouped[s].length > 0)

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      {statusOrder.map(status => (
        <WorkQueueSection
          key={status}
          status={status}
          departments={grouped[status]}
          onDepartmentOpen={handleDepartmentOpen}
          onDepartmentGenerate={handleDepartmentGenerate}
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
