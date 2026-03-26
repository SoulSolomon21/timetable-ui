import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WEEK_DAYS } from '@/features/calendar/helpers/WeekGridHelpers'
import { cn } from '@/lib/utils'
import { getVisibleHours } from '../../helpers'
import ScheduleLectureDialog from '../dialogs/schedule-lecture-dialog'
import { DroppableTimeBlock } from '../dnd/droppable-time-block'

const VISIBLE_HOURS = { from: 7, to: 20 }

const WORKING_HOURS = {
  0: { from: 0, to: 0 },
  1: { from: 8, to: 17 },
  2: { from: 8, to: 17 },
  3: { from: 8, to: 17 },
  4: { from: 8, to: 17 },
  5: { from: 8, to: 17 },
  6: { from: 8, to: 12 },
}

function CalendarWeekView() {
  const { hours, earliestEventHour, latestEventHour } = getVisibleHours(VISIBLE_HOURS)

  return (
    <>
      <div className="flex flex-col items-center justify-center border-b py-4 text-sm text-muted-foreground sm:hidden">
        <p>Weekly view is not available on smaller devices.</p>
        <p>Please switch to daily or monthly view.</p>
      </div>

      <div className="hidden flex-col sm:flex">
        <div>
          {/* Here we would have the multi-day events row. but its out of scope for now */}
          {/* Week header */}
          <div className="relative z-20 flex border-b">
            <div className="w-18"></div>
            <div className="grid flex-1 grid-cols-6 divide-x border-l">
              {WEEK_DAYS.map((day, index) => (
                <span key={index} className="py-2 text-center text-xs font-medium text-muted-foreground">
                  <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                    {day.label}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground sm:hidden">
                    {day.short}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <ScrollArea className="h-184" type="always">
            <div className="flex overflow-hidden">
              {/* Hours column */}
              <div className="relative w-18">
                {hours.map((hour, index) => (
                  <div key={hour} className="relative" style={{ height: '96px' }}>
                    <div className="absolute -top-3 right-2 flex h-6 items-center">
                      {index !== 0 && <span className="text-xs text-muted-foreground">{format(new Date().setHours(hour, 0, 0, 0), 'hh a')}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Week grid */}
              <div className="relative flex-1 border-l">
                <div className="grid grid-cols-6 divide-x">
                  {WEEK_DAYS.map((day, dayIndex) => {
                    return (
                      <div key={dayIndex} className="relative">
                        {hours.map((hour, index) => {
                        // TODO: return and implement the disabling method
                        // const isDisabled = !isLectureHour(day, hour, WORKING_HOURS)

                          return (
                            <div
                              key={hour}
                              className={
                                cn('relative',
                                // isDisabled && 'bg-calendar-disabled-hour'
                                )
                              }
                              style={{ height: '96px' }}
                            >
                              {index !== 0 && <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>}
                              {/* Drag And drop will be implemented last */}
                              {/* <DroppableTimeBlock dayOfWeek={0} periodIdx={0} hour={0}> */}
                              <ScheduleLectureDialog day={day.dayOfWeek} startTime={hour}>
                                <div className="absolute inset-x-0 top-0 h-full cursor-pointer transition-colors hover:bg-accent" />
                              </ScheduleLectureDialog>
                              {/* </DroppableTimeBlock> */}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

          </ScrollArea>
        </div>
      </div>
    </>
  )
}

export default CalendarWeekView
