import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/timetable/$departmentId/$cohortId/')({
  component: TimetableGridPage,
})

function TimetableGridPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <p className="text-sm font-medium">Timetable grid</p>
      <p className="text-xs">big-calendar week view renders here</p>
      {/* TODO: render adapted big-calendar week view */}
    </div>
  )
}
