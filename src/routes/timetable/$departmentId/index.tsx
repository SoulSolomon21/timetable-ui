import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/timetable/$departmentId/')({
  component: DepartmentHubPage,
})

function DepartmentHubPage() {
  const { departmentId } = Route.useParams()

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-sm text-muted-foreground">Department ID: {departmentId}</p>
      <p className="text-lg font-medium">Department hub coming soon</p>
      <Link
        to="/timetable"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        ← Back to work queue
      </Link>
    </div>
  )
}
