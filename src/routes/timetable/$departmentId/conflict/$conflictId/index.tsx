// This file is intentionally empty.
// Conflict resolution lives at /timetable/$departmentId/$cohortId/conflict/$conflictId
// See: src/routes/timetable/$departmentId/$cohortId/conflict/$conflictId.tsx
//
// TODO: remove this file once TanStack Router codegen no longer references it.
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/timetable/$departmentId/conflict/$conflictId/',
)({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/timetable/$departmentId', params: { departmentId: params.departmentId } })
  },
  component: () => null,
})
