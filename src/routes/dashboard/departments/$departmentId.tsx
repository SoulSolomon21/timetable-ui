import type { CohortColumnType } from '@/components/tables/cohort-tables/columns'
import { createFileRoute } from '@tanstack/react-router'
import { columns } from '@/components/tables/cohort-tables/columns'
import { DataTable } from '@/components/ui/data-table'
import { getGetCohortsQueryOptions, useGetCohorts } from '@/utils/api'

export const Route = createFileRoute('/dashboard/departments/$departmentId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const cohortsQueryOptions = getGetCohortsQueryOptions({ departmentId: Number.parseInt(params.departmentId), semesterId: 65 })
    context.queryClient.ensureQueryData(cohortsQueryOptions)
  },
})

function RouteComponent() {
  const { departmentId } = Route.useParams()

  const { data } = useGetCohorts({ departmentId: Number.parseInt(departmentId), semesterId: 65 })

  if (!data?.data.length) {
    return null
  }

  const cohorts = data?.data.map(({ programName, assignmentCount, label }) => ({
    programName,
    assignments: assignmentCount,
    label,
  })) as CohortColumnType[]

  return (
    <div>
      <DataTable columns={columns} data={cohorts} />
    </div>
  )
}
