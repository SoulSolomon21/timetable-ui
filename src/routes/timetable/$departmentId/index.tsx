import type { CohortStatus } from '@/features/timetabling/types'
import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertTriangleIcon, CheckCircle2Icon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/timetable/$departmentId/')({
  component: DepartmentHubPage,
})

// TODO: replace with data from loader
const mockDept = {
  name: 'Computer Science',
  initials: 'CS',
  semester: 'Easter 2026',
  programCount: 2,
  cohortCount: 5,
  lecturerCount: 12,
  conflictCount: 4,
  readyCount: 2,
  studentCount: 274,
  generatedAt: new Date(Date.now() - 1000 * 60 * 120),
}

const mockPrograms = [
  {
    id: 'bscs',
    name: 'BSc Computer Science',
    code: 'BSCS',
    status: 'conflict' as CohortStatus,
    cohorts: [
      { id: 'bscs-y1', label: 'Year 1', status: 'conflict' as CohortStatus, conflictCount: 2 },
      { id: 'bscs-y2', label: 'Year 2', status: 'ready' as CohortStatus },
      { id: 'bscs-y3', label: 'Year 3', status: 'conflict' as CohortStatus, conflictCount: 1 },
    ],
  },
  {
    id: 'bsit',
    name: 'BSc Information Technology',
    code: 'BSIT',
    status: 'ready' as CohortStatus,
    cohorts: [
      { id: 'bsit-y1', label: 'Year 1', status: 'ready' as CohortStatus },
      { id: 'bsit-y2', label: 'Year 2', status: 'conflict' as CohortStatus, conflictCount: 1 },
    ],
  },
  {
    id: 'bsse',
    name: 'BSc Software Engineering',
    code: 'BSSE',
    status: 'published' as CohortStatus,
    cohorts: [
      { id: 'bsse-y1', label: 'Year 1', status: 'published' as CohortStatus },
      { id: 'bsse-y2', label: 'Year 2', status: 'published' as CohortStatus },
    ],
  },
]

const statusBarColor: Record<CohortStatus, string> = {
  conflict: 'bg-destructive',
  ready: 'bg-green-500',
  published: 'bg-muted-foreground/30',
  pending: 'bg-blue-400',
}

const programBadgeStyle: Record<CohortStatus, string> = {
  conflict: 'border-destructive/30 bg-destructive/10 text-destructive',
  ready: 'border-green-200 bg-green-50 text-green-700',
  published: 'border-border bg-muted/50 text-muted-foreground',
  pending: 'border-blue-200 bg-blue-50 text-blue-700',
}

function DepartmentHubPage() {
  const { departmentId } = Route.useParams()

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {/* Department header card */}
      <Card className="mb-6">
        <CardContent className="flex items-start gap-4 pt-6">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-semibold">
            {mockDept.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-medium">{mockDept.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {mockDept.semester} · {mockDept.programCount} programs · {mockDept.cohortCount}{' '}
              cohorts · {mockDept.lecturerCount} lecturers
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {mockDept.conflictCount > 0 && (
                <Badge variant="destructive" className="gap-1 text-xs">
                  <AlertTriangleIcon className="size-3" />
                  {mockDept.conflictCount} conflicts
                </Badge>
              )}
              {mockDept.readyCount > 0 && (
                <Badge
                  variant="outline"
                  className="gap-1 text-xs text-green-700 dark:text-green-400"
                >
                  <CheckCircle2Icon className="size-3" />
                  {mockDept.readyCount} ready
                </Badge>
              )}
            </div>
          </div>
          <div className="shrink-0">
            {/* TODO: enable and wire "Publish all ready" when there are ready cohorts */}
            <Button
              variant="outline"
              size="sm"
              disabled={mockDept.readyCount === 0}
              className="text-xs"
            >
              Publish all ready →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Total cohorts', value: mockDept.cohortCount, destructive: false },
          {
            label: 'Unresolved conflicts',
            value: mockDept.conflictCount,
            destructive: mockDept.conflictCount > 0,
          },
          { label: 'Students affected', value: mockDept.studentCount, destructive: false },
          { label: 'Lecturers assigned', value: mockDept.lecturerCount, destructive: false },
        ].map(stat => (
          <Card
            key={stat.label}
            className="bg-linear-to-t from-primary/5 to-card shadow-xs"
          >
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle
                className={`text-2xl font-semibold tabular-nums ${
                  stat.destructive ? 'text-destructive' : ''
                }`}
              >
                {stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Programs section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockPrograms.map(program => {
          const programStatus = program.cohorts.some(c => c.status === 'conflict')
            ? 'conflict'
            : program.cohorts.every(c => c.status === 'published')
              ? 'published'
              : 'ready'

          return (
            <Card key={program.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{program.name}</CardTitle>
                    <CardDescription>
                      {program.code} · {program.cohorts.length} cohorts
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${programBadgeStyle[programStatus]}`}
                  >
                    {programStatus === 'conflict'
                      ? 'Has conflicts'
                      : programStatus === 'published'
                        ? 'Published'
                        : 'Ready'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {program.cohorts.map(cohort => (
                    <div key={cohort.id} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-sm text-muted-foreground">
                        {cohort.label}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full w-full rounded-full ${statusBarColor[cohort.status]}`}
                        />
                      </div>
                      <span
                        className={`w-20 shrink-0 text-right text-xs ${
                          cohort.status === 'conflict'
                            ? 'text-destructive'
                            : cohort.status === 'ready'
                              ? 'text-green-700'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {cohort.status === 'conflict' && cohort.conflictCount != null
                          ? `${cohort.conflictCount} conflicts`
                          : cohort.status === 'ready'
                            ? 'Ready'
                            : 'Published'}
                      </span>
                      <Link
                        to="/timetable/$departmentId/$cohortId"
                        params={{ departmentId, cohortId: cohort.id }}
                        search={{ view: 'cohort' }}
                      >
                        <Button variant="ghost" size="sm" className="h-auto px-2 py-0.5 text-xs">
                          {cohort.status === 'published' ? 'View →' : 'Open grid →'}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
