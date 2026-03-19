import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { AlertTriangleIcon, FileTextIcon } from 'lucide-react'
import { z } from 'zod'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// TODO: replace with data from loader once dept/cohort data is available
const conflictCount = 2

// TODO: replace with data from loader
const mockCohorts = [
  { id: 'bscs-y1-s1', label: 'Year 1:1', status: 'conflict' as const },
  { id: 'bscs-y2-s2', label: 'Year 2:2', status: 'ready' as const },
  { id: 'bscs-y3-s2', label: 'Year 3:2', status: 'conflict' as const },
  { id: 'bscs-y4-s1', label: 'Year 4:1', status: 'ready' as const },
]

// TODO: replace with data from loader
const mockConflicts = [
  { id: 'c1', type: 'Room double-booking', description: 'LT3 · Mon 09:00–11:00' },
  { id: 'c2', type: 'Lecturer clash', description: 'Dr. Opio · Tue 14:00–16:00' },
]

const statusDotColor: Record<string, string> = {
  conflict: 'bg-destructive',
  ready: 'bg-green-500',
  published: 'bg-muted-foreground',
  pending: 'bg-blue-500',
}

const viewSchema = z.object({
  view: z.enum(['cohort', 'lecturer', 'room']).default('cohort'),
})

export const Route = createFileRoute('/timetable/$departmentId/$cohortId')({
  validateSearch: (search: Record<string, unknown>) => viewSchema.parse(search),
  component: CohortLayout,
})

function CohortLayout() {
  const { departmentId, cohortId } = Route.useParams()
  const { view } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4 lg:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/timetable">Work queue</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                {/* TODO: replace raw param with department name from loader */}
                <Link to="/timetable/$departmentId" params={{ departmentId }}>
                  {departmentId}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {/* TODO: replace raw param with cohort label from loader */}
              <BreadcrumbPage>{cohortId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          {conflictCount > 0 && (
            <Button size="sm" variant="destructive" className="gap-1.5 text-xs">
              <AlertTriangleIcon className="size-3.5" />
              {conflictCount} conflicts
            </Button>
          )}

          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <FileTextIcon className="size-3.5" />
            Export PDF
          </Button>

          {conflictCount > 0 ? (
            <Button
              size="sm"
              disabled
              className="gap-1.5 border border-green-300 bg-green-50 text-xs text-green-800 opacity-50 hover:bg-green-100"
            >
              Publish cohort →
            </Button>
          ) : (
            <Link
              to="/timetable/$departmentId/$cohortId/publish"
              params={{ departmentId, cohortId }}
              search={{ view }}
            >
              <Button
                size="sm"
                className="gap-1.5 border border-green-300 bg-green-50 text-xs text-green-800 hover:bg-green-100"
              >
                Publish cohort →
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b px-4 lg:px-6">
        <Tabs
          value={view}
          onValueChange={v =>
            navigate({ search: prev => ({ ...prev, view: v as 'cohort' | 'lecturer' | 'room' }) })
          }
        >
          <TabsList className="h-7">
            <TabsTrigger value="cohort" className="text-xs">
              By cohort
            </TabsTrigger>
            <TabsTrigger value="lecturer" className="text-xs">
              By lecturer
            </TabsTrigger>
            <TabsTrigger value="room" className="text-xs">
              By room
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button size="sm" variant="outline" className="h-7 text-xs">
          {/* TODO: wire up week-picker or template selector */}
          Week template
        </Button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 border-r">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-4 p-3">
              {/* Cohorts */}
              <div>
                <p className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">Cohorts</p>
                <div className="flex flex-col gap-0.5">
                  {mockCohorts.map(c => (
                    <Link
                      key={c.id}
                      to="/timetable/$departmentId/$cohortId"
                      params={{ departmentId, cohortId: c.id }}
                      search={{ view }}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted ${
                        c.id === cohortId ? 'bg-muted font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${statusDotColor[c.status]}`}
                      />
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Conflicts */}
              {conflictCount > 0 && (
                <div>
                  <p className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">
                    Conflicts ({conflictCount})
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {mockConflicts.map(conflict => (
                      <Link
                        key={conflict.id}
                        to="/timetable/$departmentId/$cohortId/conflict/$conflictId"
                        params={{ departmentId, cohortId, conflictId: conflict.id }}
                        search={{ view }}
                        className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs transition-colors hover:bg-destructive/15"
                      >
                        <p className="font-medium text-destructive">{conflict.type}</p>
                        <p className="mt-0.5 text-muted-foreground">{conflict.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div>
                <p className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">Legend</p>
                <div className="flex flex-col gap-1.5 px-1">
                  {[
                    { color: '#534AB7', label: 'BSCS' },
                    { color: '#0F6E56', label: 'BSIT' },
                    { color: '#854F0B', label: 'BSSE' },
                    { color: '#E24B4A', label: 'Conflict' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                      <span
                        className="size-3 rounded-sm shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Calendar area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Day headers */}
          <div className="sticky top-0 z-10 grid grid-cols-[44px_repeat(5,1fr)] border-b bg-background">
            <div /> {/* time gutter spacer */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
              <div
                key={day}
                className="border-l px-2 py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
