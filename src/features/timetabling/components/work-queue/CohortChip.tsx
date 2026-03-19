import { Badge } from '@/components/ui/badge'
import type { Cohort } from '@/features/timetabling/types'

interface CohortChipProps {
  cohort: Cohort
  onSelect: (cohortId: string) => void
}

const dotColor: Record<Cohort['status'], string> = {
  conflict: 'bg-destructive',
  ready: 'bg-green-500',
  published: 'bg-muted-foreground',
  pending: 'bg-blue-500',
}

export function CohortChip({ cohort, onSelect }: CohortChipProps) {
  return (
    <Badge
      variant="outline"
      className="cursor-pointer gap-1.5 hover:bg-muted/50"
      onClick={() => onSelect(cohort.id)}
    >
      <span className={`size-1.5 rounded-full ${dotColor[cohort.status]}`} />
      {cohort.label}
      {cohort.status === 'conflict' && cohort.conflictCount != null && (
        <span className="text-destructive">
          · {cohort.conflictCount} {cohort.conflictCount === 1 ? 'conflict' : 'conflicts'}
        </span>
      )}
      {cohort.status === 'published' && (
        <span className="text-muted-foreground">· published</span>
      )}
    </Badge>
  )
}
