import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { CalendarDaysIcon } from 'lucide-react'
import { SemesterCombobox } from '@/features/timetabling/components/semester-combobox/SemesterCombobox'

export const Route = createFileRoute('/timetable')({
  component: TimetableLayout,
})

// TODO: replace local semester state with a context provider or search param
function TimetableLayout() {
  return (
    <div className="@container/main flex min-h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center border-b px-4 lg:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <CalendarDaysIcon className="size-5" />
          <span>UCU Timetable</span>
        </div>

        <nav className="ml-8 flex items-center gap-1 text-sm">
          <Link
            to="/timetable"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&.active]:bg-muted [&.active]:text-foreground"
          >
            Scheduling
          </Link>
          <span className="rounded-md px-3 py-1.5 text-muted-foreground/50 cursor-not-allowed">
            Rooms
          </span>
          <span className="rounded-md px-3 py-1.5 text-muted-foreground/50 cursor-not-allowed">
            Lecturers
          </span>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <SemesterCombobox />
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            TO
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
