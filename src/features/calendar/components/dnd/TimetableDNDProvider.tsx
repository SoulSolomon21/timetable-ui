import type { ReactNode } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// Wraps the entire timetable UI in react-dnd's context.
// Must sit OUTSIDE TimetableProvider in the tree so both the
// drag sources (slot cards) and drop targets (background cells)
// share the same DnD manager instance.
//
// Usage in your page:
//   <TimetableDndProvider>
//     <TimetableProvider ...>
//       ...
//     </TimetableProvider>
//   </TimetableDndProvider>

interface TimetableDndProviderProps {
  children: ReactNode
}

export function TimetableDndProvider({ children }: TimetableDndProviderProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  )
}
