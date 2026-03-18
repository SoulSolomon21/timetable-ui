import { createFileRoute } from '@tanstack/react-router'

import { SectionCards } from '@/components/section-cards'
import WorkQueue from '@/features/dashboard/components/work-queue'

export const Route = createFileRoute('/dashboard/')({ component: Page })

export default function Page() {
  return (
    <>
      <SectionCards />
      <WorkQueue />
    </>
  )
}
