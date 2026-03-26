import type { TDayOfWeek } from '@/features/calendar/types'
import type { IDragItem } from '@/features/calendar/types/dnd'
import { useDrop } from 'react-dnd'
import { cn } from '@/lib/utils'
import { ItemTypes } from '../../types'

interface DroppableTimeBlockProps {
  dayOfWeek: TDayOfWeek
  hour: number
  children: React.ReactNode
}

export function DroppableTimeBlock({ dayOfWeek, periodIdx, children }: DroppableTimeBlockProps) {
  // const { updateEvent } = useUpdateEvent()

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.TIMETABLE_SLOT,
      drop: (item: { event: IEvent }) => {
        const droppedEvent = item.event;

        const eventStartDate = parseISO(droppedEvent.startDate);
        const eventEndDate = parseISO(droppedEvent.endDate);

        const eventDurationMs = differenceInMilliseconds(eventEndDate, eventStartDate);

        const newStartDate = new Date(date);
        newStartDate.setHours(hour, minute, 0, 0);
        const newEndDate = new Date(newStartDate.getTime() + eventDurationMs);

        updateEvent({
          ...droppedEvent,
          startDate: newStartDate.toISOString(),
          endDate: newEndDate.toISOString(),
        });

        return { moved: true };
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [date, hour, minute, updateEvent]
  );

  return (
    <div ref={drop as unknown as React.RefObject<HTMLDivElement>} className={cn('h-6', isOver && canDrop && 'bg-accent/50')}>
      {children}
    </div>
  )
}
