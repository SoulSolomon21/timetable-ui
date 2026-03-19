import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { DepartmentDraft, DepartmentStatus } from '@/features/timetabling/types'
import { DepartmentRow } from './DepartmentRow'

const sectionConfig: Record<DepartmentStatus, { label: string; description: string }> = {
  conflict: {
    label: 'Needs attention',
    description: 'Resolve conflicts before publishing is available',
  },
  ready: {
    label: 'Ready to review',
    description: 'Draft generated, no conflicts found',
  },
  pending: {
    label: 'Ready to generate',
    description: 'Teaching assignments approved — no draft yet',
  },
  waiting: {
    label: 'Awaiting teaching assignments',
    description: 'Assignments not yet approved in Alpha-MIS',
  },
  published: {
    label: 'Published',
    description: 'Timetable is live for students and lecturers',
  },
}

interface WorkQueueSectionProps {
  status: DepartmentStatus
  departments: DepartmentDraft[]
  onCohortSelect: (deptId: string, cohortId: string) => void
  onGenerateRequest: (deptId: string) => void
}

export function WorkQueueSection({
  status,
  departments,
  onCohortSelect,
  onGenerateRequest,
}: WorkQueueSectionProps) {
  if (departments.length === 0) return null

  const config = sectionConfig[status]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{config.label}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {departments.length} {departments.length === 1 ? 'department' : 'departments'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {departments.map(dept => (
            <DepartmentRow
              key={dept.id}
              dept={dept}
              onCohortSelect={onCohortSelect}
              onGenerateRequest={onGenerateRequest}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
