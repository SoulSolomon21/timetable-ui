import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/timetable/$departmentId/$cohortId/conflict/$conflictId',
)({
  component: ConflictResolutionPage,
})

function ConflictResolutionPage() {
  const { departmentId, cohortId, conflictId } = Route.useParams()

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-sm text-muted-foreground">
        {departmentId} / {cohortId} / conflict {conflictId}
      </p>
      <p className="text-lg font-medium">Conflict resolution panel coming soon</p>
      {/*
        TODO: this will render as a side panel overlaid on the timetable grid,
        not as a standalone full page. Layout approach to be revisited when
        the big-calendar grid view is built.
      */}
    </div>
  )
}
