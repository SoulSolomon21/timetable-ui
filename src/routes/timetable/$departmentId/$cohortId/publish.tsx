import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/timetable/$departmentId/$cohortId/publish')({
  component: PublishReviewPage,
})

function PublishReviewPage() {
  const { departmentId, cohortId } = Route.useParams()

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-sm text-muted-foreground">
        {departmentId}
        {' '}
        /
        {cohortId}
      </p>
      <p className="text-lg font-medium">Publish review coming soon</p>
    </div>
  )
}
