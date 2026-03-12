import type { FlatEntry } from './utils'
import type { LegacyDepartmentResponse } from '@/utils/models'
import { BookOpen, Check, MapPin } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { FACULTY_TYPE_COLORS, toTitleCase } from './utils'

interface Props {
  data: LegacyDepartmentResponse[]
  flatOptions: FlatEntry[]
  onSelect: (item: FlatEntry) => void
  selected: FlatEntry | null
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
      <div
        className={cn(
          'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mt-2 shrink-0 transition-colors',
          done
            ? 'bg-teal-500 text-white'
            : active
              ? 'bg-stone-800 text-white'
              : 'bg-stone-200 text-stone-500',
        )}
      >
        {done ? <Check className="h-3 w-3" /> : number}
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
          {label}
        </p>
        {children}
      </div>
    </div>
  )
}

function SteppedMode({ data, flatOptions, onSelect, selected }: Props) {
  const [campus, setCampus] = useState('')
  const [faculty, setFaculty] = useState('')
  const [dept, setDept] = useState('')

  const campuses = useMemo(
    () => data.map(c => c.campusName).filter((c): c is string => !!c),
    [data],
  )

  const faculties = useMemo(() => {
    if (!campus)
      return []
    const found = data.find(c => c.campusName === campus)
    if (!found)
      return []
    const seen = new Set<string>()
    return (found.faculties ?? []).filter((f) => {
      if (!f.facultyName || seen.has(f.facultyName))
        return false
      seen.add(f.facultyName)
      return true
    })
  }, [campus, data])

  const departments = useMemo(() => {
    if (!campus || !faculty)
      return []
    const found = data.find(c => c.campusName === campus)
    if (!found)
      return []
    return (found.faculties ?? [])
      .filter(f => f.facultyName === faculty)
      .flatMap(f => f.departments ?? [])
  }, [campus, faculty, data])

  function handleCampusChange(val: string) {
    setCampus(val)
    setFaculty('')
    setDept('')
  }

  function handleFacultyChange(val: string) {
    setFaculty(val)
    setDept('')
  }

  function handleDeptChange(val: string) {
    setDept(val)
    const match = flatOptions.find(
      o => o.campus === campus && o.faculty === faculty && String(o.id) === val,
    )
    if (match)
      onSelect(match)
  }

  const selectedFacultyData = faculties.find(f => f.facultyName === faculty)

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-stone-500 font-medium tracking-wide uppercase">
        Browse step by step
      </p>

      {/* Step 1 — Campus */}
      <StepWrapper number={1} label="Campus" active done={!!campus}>
        <Select value={campus} onValueChange={handleCampusChange}>
          <SelectTrigger className="w-full h-10 text-sm border-stone-200 focus:ring-teal-500 focus:border-teal-400">
            <SelectValue placeholder="Select a campus…" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {campuses.map(c => (
                <SelectItem key={c} value={c} className="text-sm">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-stone-400" />
                    {toTitleCase(c)}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </StepWrapper>

      {/* Step 2 — Faculty */}
      <StepWrapper number={2} label="Faculty / School" active={!!campus} done={!!faculty}>
        <Select value={faculty} onValueChange={handleFacultyChange} disabled={!campus}>
          <SelectTrigger className="w-full h-10 text-sm border-stone-200 focus:ring-teal-500 focus:border-teal-400">
            <SelectValue placeholder={campus ? 'Select a faculty…' : 'Select campus first'} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {faculties.map(f => (
                <SelectItem key={f.facultyName} value={f.facultyName!} className="text-sm">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-stone-400" />
                    {f.facultyName}
                    {f.facultyType && (
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0 rounded-full border font-medium',
                          FACULTY_TYPE_COLORS[f.facultyType],
                        )}
                      >
                        {f.facultyType}
                      </span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Faculty meta — shown once a faculty is picked */}
        {selectedFacultyData?.facultyType && (
          <p className="text-xs text-stone-400 mt-1.5 flex items-center gap-1">
            <span
              className={cn(
                'inline-block px-1.5 py-0.5 rounded border text-[10px] font-medium',
                FACULTY_TYPE_COLORS[selectedFacultyData.facultyType],
              )}
            >
              {selectedFacultyData.facultyType}
            </span>
            <span>
              {departments.length}
              {' '}
              department
              {departments.length !== 1 ? 's' : ''}
            </span>
          </p>
        )}
      </StepWrapper>

      {/* Step 3 — Department */}
      <StepWrapper number={3} label="Department" active={!!faculty} done={!!dept}>
        <Select value={dept} onValueChange={handleDeptChange} disabled={!faculty}>
          <SelectTrigger className="w-full h-10 text-sm border-stone-200 focus:ring-teal-500 focus:border-teal-400">
            <SelectValue placeholder={faculty ? 'Select a department…' : 'Select faculty first'} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {departments.map(d => (
                <SelectItem key={d.id} value={String(d.id)} className="text-sm">
                  {d.name ? toTitleCase(d.name) : `Department ${d.id}`}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </StepWrapper>
    </div>
  )
}

export default SteppedMode
