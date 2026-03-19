/**
 * Conflict Resolution Panel
 *
 * FINAL BEHAVIOUR (not yet implemented):
 * This route will eventually render as a right-side panel overlaid on the
 * timetable grid rather than replacing it. The layout approach (portal,
 * drawer, or nested outlet) will be decided when the big-calendar grid view
 * is implemented. For now it renders as a standalone page inside the cohort
 * layout's <Outlet />.
 */
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/timetable/$departmentId/$cohortId/conflict/$conflictId',
)({
  component: ConflictResolutionPage,
})

function ConflictResolutionPage() {
  const { conflictId } = Route.useParams()

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
      <p className="text-sm font-medium">Conflict resolution panel</p>
      <p className="font-mono text-xs">{conflictId}</p>
      <p className="text-xs">
        Side panel implementation coming — will render over the timetable grid
      </p>
    </div>
  )
}
