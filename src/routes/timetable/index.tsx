import { createFileRoute } from '@tanstack/react-router'
import { SectionCards } from '@/features/timetabling/components/section-cards/SectionCards'
import { WorkQueue } from '@/features/timetabling/components/work-queue/WorkQueue'

export const Route = createFileRoute('/timetable/')({
  component: WorkQueuePage,
})

function WorkQueuePage() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <SectionCards />
      <WorkQueue />
    </div>
  )
}
