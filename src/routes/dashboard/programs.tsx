import { createFileRoute } from '@tanstack/react-router'
import ProgramPicker from '@/components/program-picker'
import { useGetDepartments } from '@/utils/api'

export const Route = createFileRoute('/dashboard/programs')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useGetDepartments()

  const departmentsList = data?.data

  return (
    <div>
      <ProgramPicker />
    </div>
  )
}
