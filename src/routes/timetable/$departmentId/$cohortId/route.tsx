import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/timetable/$departmentId/$cohortId')({
  component: CohortLayout,
})

function CohortLayout() {
  // TODO: render cohort-level topbar (cohort name, program, status chip)
  return <Outlet />
}
