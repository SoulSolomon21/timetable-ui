import { createFileRoute } from '@tanstack/react-router'
import DepartmentPicker from '@/components/program-picker'

export const Route = createFileRoute('/dashboard/departments/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DepartmentPicker />
}
