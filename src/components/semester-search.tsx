'use client'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item'

// --- Types ---

interface Semester {
  id: string
  name: 'Easter' | 'Trinity' | 'Advent'
  year: number
  startDate: string
  endDate: string
}

// --- Data ---

const semesters: Semester[] = [
  {
    id: 'easter-2024',
    name: 'Easter',
    year: 2024,
    startDate: 'Jan 2024',
    endDate: 'Apr 2024',
  },
  {
    id: 'trinity-2024',
    name: 'Trinity',
    year: 2024,
    startDate: 'Apr 2024',
    endDate: 'Aug 2024',
  },
  {
    id: 'advent-2024',
    name: 'Advent',
    year: 2024,
    startDate: 'Aug 2024',
    endDate: 'Dec 2024',
  },
  {
    id: 'easter-2025',
    name: 'Easter',
    year: 2025,
    startDate: 'Jan 2025',
    endDate: 'Apr 2025',
  },
  {
    id: 'trinity-2025',
    name: 'Trinity',
    year: 2025,
    startDate: 'Apr 2025',
    endDate: 'Aug 2025',
  },
  {
    id: 'advent-2025',
    name: 'Advent',
    year: 2025,
    startDate: 'Aug 2025',
    endDate: 'Dec 2025',
  },
  {
    id: 'easter-2026',
    name: 'Easter',
    year: 2026,
    startDate: 'Jan 2026',
    endDate: 'Apr 2026',
  },
  {
    id: 'trinity-2026',
    name: 'Trinity',
    year: 2026,
    startDate: 'Apr 2026',
    endDate: 'Aug 2026',
  },
  {
    id: 'advent-2026',
    name: 'Advent',
    year: 2026,
    startDate: 'Aug 2026',
    endDate: 'Dec 2026',
  },
]

// --- Component ---

export function SemesterCombobox() {
  return (
    <Combobox
      items={semesters}
      itemToStringLabel={(semester: Semester) => `${semester.name} ${semester.year}`}
    >
      <ComboboxInput placeholder="Search semesters..." />
      <ComboboxContent>
        <ComboboxEmpty>No semesters found.</ComboboxEmpty>
        <ComboboxList>
          {semester => (
            <ComboboxItem key={semester.id} value={semester}>
              <Item size="xs" className="p-0">
                <ItemContent>
                  <ItemTitle className="whitespace-nowrap">
                    {semester.name}
                    {' '}
                    {semester.year}
                  </ItemTitle>
                </ItemContent>
              </Item>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
