import type { FlatEntry } from './utils'
import type { DepartmentEntry, FacultyGroup, LegacyDepartmentResponse } from '@/utils/models'
import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { cn } from '@/lib/utils'
import { toTitleCase } from './utils'

interface Props {
  data: LegacyDepartmentResponse[]
  flatOptions: FlatEntry[]
  onSelect: (item: FlatEntry) => void
  selected: FlatEntry | null
}

interface Option {
  id: string
  label: string
}

function StepWrapper({
  number,
  label,
  active,
  done,
  children,
}: {
  number: number
  label: string
  active: boolean
  done: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex items-start gap-3 transition-opacity duration-200', !active && 'opacity-40 pointer-events-none')}>
      <div className={cn(
        'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mt-2 shrink-0 transition-colors',
        done ? 'bg-teal-500 text-white' : active ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-500',
      )}
      >
        {done ? <Check className="h-3 w-3" /> : number}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">{label}</p>
        {children}
      </div>
    </div>
  )
}

function SteppedMode({ data, flatOptions, onSelect }: Props) {
  const [campus, setCampus] = useState<Option | null>(null)
  const [faculty, setFaculty] = useState<Option | null>(null)
  const [dept, setDept] = useState<Option | null>(null)

  const campusOptions = useMemo<Option[]>(
    () => data
      .map(c => c.campusName)
      .filter((c): c is string => !!c)
      .map(c => ({ id: c, label: toTitleCase(c) })),
    [data],
  )

  const facultyOptions = useMemo<Option[]>(() => {
    if (!campus) 
return []
    const found = data.find(c => c.campusName === campus.id)
    if (!found) 
return []
    const seen = new Set<string>()
    return (found.faculties ?? [])
      .filter((f): f is FacultyGroup & { facultyName: string } => {
        if (!f.facultyName || seen.has(f.facultyName)) 
return false
        seen.add(f.facultyName)
        return true
      })
      .map(f => ({ id: f.facultyName, label: f.facultyName }))
  }, [campus, data])

  const departmentOptions = useMemo<Option[]>(() => {
    if (!campus || !faculty) 
return []
    const found = data.find(c => c.campusName === campus.id)
    if (!found) 
return []
    return (found.faculties ?? [])
      .filter(f => f.facultyName === faculty.id)
      .flatMap(f => f.departments ?? [])
      .filter((d): d is DepartmentEntry & { id: number, name: string } =>
        d.id !== undefined && d.name !== undefined,
      )
      .map(d => ({ id: String(d.id), label: toTitleCase(d.name) }))
  }, [campus, faculty, data])

  function handleCampusChange(option: Option | null) {
    setCampus(option)
    setFaculty(null)
    setDept(null)
  }

  function handleFacultyChange(option: Option | null) {
    setFaculty(option)
    setDept(null)
  }

  function handleDeptChange(option: Option | null) {
    setDept(option)
    if (!option) 
return
    const match = flatOptions.find(
      o => o.campus === campus?.id && o.faculty === faculty?.id && String(o.id) === option.id,
    )
    if (match) 
onSelect(match)
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-stone-500 font-medium tracking-wide uppercase">
        Browse step by step
      </p>

      <StepWrapper number={1} label="Campus" active done={!!campus}>
        <Combobox
          items={campusOptions}
          itemToStringValue={o => o.label}
          value={campus}
          onValueChange={handleCampusChange}
        >
          <ComboboxInput placeholder="Select a campus…" />
          <ComboboxContent>
            <ComboboxEmpty>No campuses found.</ComboboxEmpty>
            <ComboboxList>
              {option => (
                <ComboboxItem key={option.id} value={option}>
                  {option.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </StepWrapper>

      <StepWrapper number={2} label="Faculty / School" active={!!campus} done={!!faculty}>
        <Combobox
          items={facultyOptions}
          itemToStringValue={o => o.label}
          value={faculty}
          onValueChange={handleFacultyChange}
          disabled={!campus}
        >
          <ComboboxInput placeholder={campus ? 'Select a faculty…' : 'Select campus first'} />
          <ComboboxContent>
            <ComboboxEmpty>No faculties found.</ComboboxEmpty>
            <ComboboxList>
              {option => (
                <ComboboxItem key={option.id} value={option}>
                  {option.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </StepWrapper>

      <StepWrapper number={3} label="Department" active={!!faculty} done={!!dept}>
        <Combobox
          items={departmentOptions}
          itemToStringValue={o => o.label}
          value={dept}
          onValueChange={handleDeptChange}
          disabled={!faculty}
        >
          <ComboboxInput placeholder={faculty ? 'Select a department…' : 'Select faculty first'} />
          <ComboboxContent>
            <ComboboxEmpty>No departments found.</ComboboxEmpty>
            <ComboboxList>
              {option => (
                <ComboboxItem key={option.id} value={option}>
                  {option.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </StepWrapper>
    </div>
  )
}

export default SteppedMode
