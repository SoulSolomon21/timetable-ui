import { createFileRoute } from '@tanstack/react-router'
import ProgramPicker from '@/components/program-picker'

export const Route = createFileRoute('/dashboard/programs/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProgramPicker />
}
