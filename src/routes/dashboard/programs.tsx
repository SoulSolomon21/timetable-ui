import { createFileRoute } from '@tanstack/react-router'
import ProgramPicker from '@/components/program-picker'
import { useGetDepartments, useGetRooms } from '@/utils/api'
import SearchMode from '@/components/program-pickers/search-mode'

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
