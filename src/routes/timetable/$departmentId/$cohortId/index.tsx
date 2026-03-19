import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/timetable/$departmentId/$cohortId/')({
  component: TimetableGridPage,
})

function TimetableGridPage() {
  const { departmentId, cohortId } = Route.useParams()

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-sm text-muted-foreground">
        {departmentId}
        {' '}
        /
        {cohortId}
      </p>
      <p className="text-lg font-medium">Timetable grid</p>
      {/* TODO: render adapted big-calendar week view */}
    </div>
  )
}
