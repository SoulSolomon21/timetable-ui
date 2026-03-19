import type { ILecturer, IProgram, IRoom, ITimetableFilter } from '@/features/calendar/interfaces'

// Unified entity shape for the combobox — we don't want the combobox
// to know about the underlying type, just id + label + optional sublabel.
export interface IFilterEntity {
  id: string
  label: string
  sublabel?: string // department, building, year/semester etc.
}

// Converts the three raw lists into a flat combobox-friendly list
// based on whichever dimension is currently active.
export function getFilterEntities(
  dimension: ITimetableFilter['dimension'],
  lecturers: ILecturer[],
  rooms: IRoom[],
  programs: IProgram[],
): IFilterEntity[] {
  switch (dimension) {
    case 'lecturer':
      return lecturers.toSorted((a, b) => a.name.localeCompare(b.name))
        .map(l => ({
          id: l.id,
          label: l.title ? `${l.title} ${l.name}` : l.name,
          sublabel: l.department,
        }))

    case 'room':
      return rooms.toSorted((a, b) => a.name.localeCompare(b.name))
        .map(r => ({
          id: r.id,
          label: r.name,
          // "Main Block · 120 seats" — only show what's present
          sublabel: [r.building, r.capacity ? `${r.capacity} seats` : undefined]
            .filter(Boolean)
            .join(' · ') || undefined,
        }))

    case 'program':
      return programs.toSorted((a, b) => a.name.localeCompare(b.name))
        .map(p => ({
          id: p.id,
          label: p.name,
          sublabel: [
            p.code,
            p.year ? `Year ${p.year}` : undefined,
            p.semester ? `Sem ${p.semester}` : undefined,
          ]
            .filter(Boolean)
            .join(' · ') || undefined,
        }))
  }
}

// The label shown in the summary bar for the current filter.
// "All lecturers" / "Dr. Mukasa" / "LT1" etc.
export function getFilterLabel(
  dimension: ITimetableFilter['dimension'],
  selectedId: string | null,
  lecturers: ILecturer[],
  rooms: IRoom[],
  programs: IProgram[],
): string {
  if (!selectedId) {
    const allLabels: Record<ITimetableFilter['dimension'], string> = {
      lecturer: 'All lecturers',
      room: 'All rooms',
      program: 'All programs',
    }
    return allLabels[dimension]
  }

  switch (dimension) {
    case 'lecturer': {
      const l = lecturers.find(x => x.id === selectedId)
      return l ? (l.title ? `${l.title} ${l.name}` : l.name) : 'Unknown lecturer'
    }
    case 'room': {
      const r = rooms.find(x => x.id === selectedId)
      return r?.name ?? 'Unknown room'
    }
    case 'program': {
      const p = programs.find(x => x.id === selectedId)
      return p?.name ?? 'Unknown program'
    }
  }
}
