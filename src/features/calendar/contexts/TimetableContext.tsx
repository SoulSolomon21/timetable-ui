'use client'

import type { ReactNode } from 'react'
import type {
  IConflict,
  ILecturer,
  IProgram,
  IRoom,
  ITimetableFilter,
  ITimetableProviderData,
  ITimetableSlot,
} from '@/features/calendar/interfaces'
import type { TBadgeVariant, TDayOfWeek, TView } from '@/features/calendar/types'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// ─── Context shape ────────────────────────────────────────────────────────────

interface ITimetableContext {
  // ── View state (unchanged from original CalendarContext) ──
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  view: TView
  setView: (view: TView) => void
  badgeVariant: TBadgeVariant
  setBadgeVariant: (variant: TBadgeVariant) => void

  // ── Raw data ──
  slots: ITimetableSlot[]
  lecturers: ILecturer[]
  rooms: IRoom[]
  programs: IProgram[]

  // ── Multi-dimensional filter (replaces selectedUserId) ──
  filter: ITimetableFilter
  setFilterDimension: (dimension: ITimetableFilter['dimension']) => void
  setSelectedId: (id: string | null) => void

  // ── Derived: filtered slots for the current filter state ──
  visibleSlots: ITimetableSlot[]

  // ── Derived: conflict list (computed from all slots, not just visible) ──
  conflicts: IConflict[]
  conflictsBySlotId: Map<string, IConflict[]>

  // ── Slot actions (wire these to your API calls) ──
  rescheduleSlot: (slotId: string, dayOfWeek: number, startTime: string, endTime: string) => void
  addSlot: (slot: ITimetableSlot) => void
  removeSlot: (slotId: string) => void
  updateSlot: (slotId: string, patch: Partial<ITimetableSlot>) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const TimetableContext = createContext<ITimetableContext | null>(null)

// ─── Conflict detection ───────────────────────────────────────────────────────
// Pure function — runs over the full slot list. Returns all pairwise conflicts.
// Call this inside useMemo so it only recomputes when slots change.

function detectConflicts(slots: ITimetableSlot[]): IConflict[] {
  const conflicts: IConflict[] = []

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i]
      const b = slots[j]

      if (a.dayOfWeek !== b.dayOfWeek)
        continue

      // Overlap check: a starts before b ends AND b starts before a ends
      const overlaps = a.startTime < b.endTime && b.startTime < a.endTime
      if (!overlaps)
        continue

      if (a.room.id === b.room.id) {
        conflicts.push({
          id: `${a.id}::${b.id}::room`,
          type: 'room_double_booked',
          slotIds: [a.id, b.id],
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          description: `${a.room.name} double-booked at ${a.startTime}`,
        })
      }

      if (a.lecturer.id === b.lecturer.id) {
        conflicts.push({
          id: `${a.id}::${b.id}::lecturer`,
          type: 'lecturer_double_booked',
          slotIds: [a.id, b.id],
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          description: `${a.lecturer.name} double-booked at ${a.startTime}`,
        })
      }

      if (a.program.id === b.program.id) {
        conflicts.push({
          id: `${a.id}::${b.id}::program`,
          type: 'program_overlap',
          slotIds: [a.id, b.id],
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          description: `${a.program.name} has overlapping sessions at ${a.startTime}`,
        })
      }
    }
  }

  return conflicts
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface TimetableProviderProps extends ITimetableProviderData {
  children: ReactNode
  initialView?: TView
  onReschedule?: (slotId: string, dayOfWeek: number, startTime: string, endTime: string) => void
}

export function TimetableProvider({
  children,
  slots: initialSlots,
  lecturers,
  rooms,
  programs,
  initialView = 'week',
  onReschedule,
}: TimetableProviderProps) {
  const [slots, setSlots] = useState<ITimetableSlot[]>(initialSlots)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<TView>(initialView)
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>('colored')
  const [filter, setFilter] = useState<ITimetableFilter>({
    dimension: 'program',
    selectedId: null,
  })

  // ── Filter helpers ──
  const setFilterDimension = useCallback((dimension: ITimetableFilter['dimension']) => {
    setFilter({ dimension, selectedId: null }) // reset selection on dimension change
  }, [])

  const setSelectedId = useCallback((id: string | null) => {
    setFilter(prev => ({ ...prev, selectedId: id }))
  }, [])

  // ── Derived: visible slots ──
  const visibleSlots = useMemo(() => {
    if (!filter.selectedId)
      return slots

    return slots.filter((slot) => {
      switch (filter.dimension) {
        case 'lecturer': return slot.lecturer.id === filter.selectedId
        case 'room': return slot.room.id === filter.selectedId
        case 'program': return slot.program.id === filter.selectedId
      }
    })
  }, [slots, filter])

  // ── Derived: conflicts ──
  const conflicts = useMemo(() => detectConflicts(slots), [slots])

  // Index conflicts by slot ID for O(1) lookup in the render layer
  const conflictsBySlotId = useMemo(() => {
    const map = new Map<string, IConflict[]>()
    for (const conflict of conflicts) {
      for (const slotId of conflict.slotIds) {
        const existing = map.get(slotId) ?? []
        map.set(slotId, [...existing, conflict])
      }
    }
    return map
  }, [conflicts])

  // ── Slot actions ──
  // These update local state immediately (optimistic).
  // Wire your React Query mutations AROUND these — call mutate() then this.

  const rescheduleSlot = useCallback(
    (slotId: string, dayOfWeek: number, startTime: string, endTime: string) => {
    // 1. Optimistic local state update
      setSlots(prev =>
        prev.map(s =>
          s.id === slotId
            ? { ...s, dayOfWeek: dayOfWeek as TDayOfWeek, startTime, endTime }
            : s,
        ),
      )
      // 2. Fire the mutation callback wired in the page component
      onReschedule?.(slotId, dayOfWeek, startTime, endTime)
    },
    [onReschedule],
  )

  const addSlot = useCallback((slot: ITimetableSlot) => {
    setSlots(prev => [...prev, slot])
  }, [])

  const removeSlot = useCallback((slotId: string) => {
    setSlots(prev => prev.filter(s => s.id !== slotId))
  }, [])

  const updateSlot = useCallback((slotId: string, patch: Partial<ITimetableSlot>) => {
    setSlots(prev => prev.map(s => (s.id === slotId ? { ...s, ...patch } : s)))
  }, [])

  const value: ITimetableContext = {
    selectedDate,
    setSelectedDate,
    view,
    setView,
    badgeVariant,
    setBadgeVariant,
    slots,
    lecturers,
    rooms,
    programs,
    filter,
    setFilterDimension,
    setSelectedId,
    visibleSlots,
    conflicts,
    conflictsBySlotId,
    rescheduleSlot,
    addSlot,
    removeSlot,
    updateSlot,
  }

  return (
    <TimetableContext.Provider value={value}>
      {children}
    </TimetableContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTimetable() {
  const context = useContext(TimetableContext)
  if (!context) {
    throw new Error('useTimetable must be used inside a <TimetableProvider>')
  }
  return context
}
