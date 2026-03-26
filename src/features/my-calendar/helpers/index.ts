import type { TLecturingHours, TVisibleHours } from '../types'
import type { TWeekDay } from '@/features/calendar/helpers/WeekGridHelpers'

export function getVisibleHours(visibleHours: TVisibleHours) {
  let earliestEventHour = visibleHours.from
  let latestEventHour = visibleHours.to

  // singleDayEvents.forEach((event) => {
  //   const startHour = parseISO(event.startDate).getHours()
  //   const endTime = parseISO(event.endDate)
  //   const endHour = endTime.getHours() + (endTime.getMinutes() > 0 ? 1 : 0)
  //   if (startHour < earliestEventHour)
  //     earliestEventHour = startHour
  //   if (endHour > latestEventHour)
  //     latestEventHour = endHour
  // })

  latestEventHour = Math.min(latestEventHour, 24)

  const hours = Array.from({ length: latestEventHour - earliestEventHour }, (_, i) => i + earliestEventHour)

  return { hours, earliestEventHour, latestEventHour }
}

export function isLectureHour(day: Date, hour: number, lectureHours: TLecturingHours) {
  // get the index of the day in the  WEEK_DAYS array. but the lectureHours and weekday have no overlap, so what to do???????
  // const dayIndex =

  const dayIndex = day.getDay() as keyof typeof lectureHours
  const dayHours = lectureHours[dayIndex]
  return hour >= dayHours.from && hour < dayHours.to
}
