// This file is intentionally empty.
// Publish review lives at /timetable/$departmentId/$cohortId/publish
// See: src/routes/timetable/$departmentId/$cohortId/publish.tsx
//
// TODO: remove this file once TanStack Router codegen no longer references it.
// It is kept here temporarily to avoid a broken routeTree during transition.
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/timetable/$departmentId/publish')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/timetable/$departmentId', params })
  },
  component: () => null,
})
