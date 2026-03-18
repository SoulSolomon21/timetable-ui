import { createFileRoute } from '@tanstack/react-router'
import { StatsCards } from '@/components/stats-cards'
import WorkQueue from '@/features/dashboard/components/work-queue'

export const Route = createFileRoute('/timetable/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <StatsCards />
      <WorkQueue />
    </>
  )
}
