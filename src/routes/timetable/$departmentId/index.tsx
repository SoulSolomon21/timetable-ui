import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/timetable/$departmentId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/timetable/$departmentId/"!</div>
}
