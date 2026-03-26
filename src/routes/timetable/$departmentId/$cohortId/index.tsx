import { createFileRoute } from '@tanstack/react-router'
import { ConflictPanel } from '@/features/calendar/components/ConflictPanel'
import { TimetableDndProvider } from '@/features/calendar/components/dnd/TimetableDNDProvider'
import { FilterSummaryBar } from '@/features/calendar/components/header/FilterSummaryBar'
import { FilterSwitcher } from '@/features/calendar/components/header/FilterSwitcher'
import { TimetableWeekView } from '@/features/calendar/components/week-and-day-view/TimetableWeekView'
import { TimetableProvider } from '@/features/calendar/contexts/TimetableContext'
import { MOCK_LECTURERS, MOCK_PROGRAMS, MOCK_ROOMS, MOCK_SLOTS } from '@/features/calendar/mocks'
import CalendarWeekView from '@/features/my-calendar/components/week-view/calendar-week-view'

export const Route = createFileRoute('/timetable/$departmentId/$cohortId/')({
  component: TimetableGridPage,
})

function TimetableGridPage() {
  return (
    <TimetableDndProvider>
      <TimetableProvider
        slots={MOCK_SLOTS}
        lecturers={MOCK_LECTURERS}
        rooms={MOCK_ROOMS}
        programs={MOCK_PROGRAMS}
        // TODO: wire up actual reschedule hook
        // onReschedule={(slotId, dayOfWeek, startTime, endTime) =>
        //   reschedule({ data: { slotId, dayOfWeek, startTime, endTime } })}
      >
        <div className="flex h-full flex-col">
          {/* Filter bar */}
          <div className="flex shrink-0 items-center justify-between gap-4 border-b px-4 py-2">
            <FilterSummaryBar />
            <FilterSwitcher />
          </div>

          {/* Grid + conflict panel side by side */}
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-auto">
              <TimetableWeekView />
            </div>
            <ConflictPanel />
          </div>
          <CalendarWeekView />
        </div>
      </TimetableProvider>
    </TimetableDndProvider>
  )
}

function Playground() {
  return (
    <CalendarWeekView />
  )
}

export default Playground
