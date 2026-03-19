import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import type { DepartmentDraft } from '@/features/timetabling/types'
import { formatDistanceToNow } from '@/features/timetabling/utils'
import { CohortChip } from './CohortChip'

interface DepartmentExpandedProps {
  dept: DepartmentDraft
  onCohortSelect: (cohortId: string) => void
}

export function DepartmentExpanded({ dept, onCohortSelect }: DepartmentExpandedProps) {
  const navigate = useNavigate()

  return (
    <div className="border-t border-border/50 bg-muted/20 px-4 py-3">
      <div className="flex flex-col gap-2">
        {dept.programs.map(program => (
          <div key={program.id} className="flex items-start gap-3">
            <span className="w-[200px] shrink-0 truncate text-sm text-muted-foreground">
              {program.name}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {program.cohorts.map(cohort => (
                <CohortChip key={cohort.id} cohort={cohort} onSelect={onCohortSelect} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {dept.generatedAt && (
            <span>
              Draft generated {formatDistanceToNow(dept.generatedAt, { addSuffix: true })}
            </span>
          )}
          {dept.studentCount != null && (
            <span>{dept.studentCount.toLocaleString()} students</span>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-auto p-0 text-xs"
          onClick={() =>
            navigate({
              to: '/timetable/$departmentId',
              params: { departmentId: dept.id },
            })
          }
        >
          Full overview →
        </Button>
      </div>
    </div>
  )
}
