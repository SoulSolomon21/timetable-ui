import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/timetable/$departmentId/conflict/$conflictId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/timetable/$departmentId/conflict/$conflictId/"!</div>
}
