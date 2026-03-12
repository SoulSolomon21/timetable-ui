import type { FlatEntry } from './program-pickers/utils'
import { GraduationCap, MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useGetDepartments } from '@/utils/api'
import SearchMode from './program-pickers/search-mode'
import SteppedMode from './program-pickers/stepped-mode'
import { flattenData, toTitleCase } from './program-pickers/utils'

const RAW_DATA = [{ campusName: 'MAIN CAMPUS', faculties: [{ facultyName: 'School of Business', facultyType: 'SCHOOL', departments: [{ id: 137, name: 'Postgraduate' }, { id: 125, name: 'Undergraduate' }] }, { facultyName: 'Faculty of Business', facultyType: 'FACULTY', departments: [{ id: 4, name: 'Department of Business and Finance' }, { id: 6, name: 'Department of Economics and Statistics' }, { id: 11, name: 'Academic Faculties' }, { id: 5, name: 'Department of Management and Entrepreneurship' }] }, { facultyName: 'School of Research and Postgraduate Studies', facultyType: null, departments: [{ id: 123, name: 'Graduate Publications' }, { id: 32, name: 'Graduate Research & Training' }] }, { facultyName: 'School of Social Sciences', facultyType: 'SCHOOL', departments: [{ id: 126, name: 'Undergraduate' }, { id: 127, name: 'Postgraduate' }] }, { facultyName: 'School of Law', facultyType: 'SCHOOL', departments: [{ id: 130, name: 'Undergraduate' }, { id: 131, name: 'Postgraduate' }] }, { facultyName: 'School of Education', facultyType: 'SCHOOL', departments: [{ id: 133, name: 'Undergraduate' }, { id: 134, name: 'Postgraduate' }] }, { facultyName: 'Faculty of Engineering, Design and Technology', facultyType: null, departments: [{ id: 1, name: 'Department of Computing and Technology' }, { id: 2, name: 'Department of Engineering and Environment' }, { id: 24, name: 'Department of Visual Arts and Design' }] }, { facultyName: 'Bishop Tucker School of Divinity and Theology', facultyType: 'FACULTY', departments: [{ id: 17, name: 'Foundation Studies' }, { id: 21, name: 'Divinity' }, { id: 20, name: 'Child Development and Children\'s Ministry' }, { id: 37, name: 'Divinity (namugongo )' }, { id: 38, name: 'Divinity (Bishop Allison)' }, { id: 39, name: 'Divinity (Mcallister College-Kyogyera )' }, { id: 108, name: 'Department of Theology' }] }, { facultyName: 'Faculty of Journalism, Media and Communication', facultyType: 'FACULTY', departments: [{ id: 35, name: 'Communication' }, { id: 16, name: 'Journalism And Media Studies' }] }, { facultyName: 'Faculty of Agricultural Sciences', facultyType: null, departments: [{ id: 3, name: 'Department of Agricultural and Biological Sciences' }, { id: 113, name: 'Department of Natural Resource Economics and Agribusiness' }, { id: 112, name: 'Department of Food and Nutritional Sciences' }] }, { facultyName: 'Faculty of Public Health, Nursing and Midwifery', facultyType: 'FACULTY', departments: [{ id: 105, name: 'Department of Nursing & Midwifery' }, { id: 70, name: 'Department of Public Health' }, { id: 110, name: 'Department of Maternal and Child Health' }] }, { facultyName: 'Faculty of Law', facultyType: 'FACULTY', departments: [{ id: 15, name: 'Law' }] }, { facultyName: 'Bishop Tucker School of Divinity and Theology', facultyType: 'SCHOOL', departments: [{ id: 141, name: 'Undergraduate' }, { id: 142, name: 'Postgraduate' }] }, { facultyName: 'School of Journalism, Media and Communication', facultyType: 'SCHOOL', departments: [{ id: 135, name: 'Undergraduate' }, { id: 136, name: 'Postgraduate' }] }, { facultyName: 'Faculty of Education', facultyType: 'FACULTY', departments: [{ id: 114, name: 'Uganda Studies Program' }, { id: 22, name: 'Education' }, { id: 23, name: 'Languages and Literature' }, { id: 25, name: 'Library Studies' }] }, { facultyName: 'Faculty of Social Sciences', facultyType: 'FACULTY', departments: [{ id: 26, name: 'Social Works and Social Administration' }, { id: 27, name: 'Development Studies' }, { id: 28, name: 'Public Administration And Governance' }, { id: 29, name: 'Counseling' }] }] }, { campusName: 'KAMPALA CAMPUS', faculties: [{ facultyName: 'School of Law', facultyType: 'SCHOOL', departments: [{ id: 132, name: 'Undergraduate' }] }, { facultyName: 'School of Medicine', facultyType: null, departments: [{ id: 79, name: 'Medicine' }] }, { facultyName: 'Faculty of Business', facultyType: 'FACULTY', departments: [{ id: 12, name: 'Department of Business and Finance' }, { id: 13, name: 'Department of Economics and Statistics' }, { id: 14, name: 'Department of Management and Entrepreneurship' }] }, { facultyName: 'School of Dentistry', facultyType: null, departments: [{ id: 97, name: 'Dentistry' }] }, { facultyName: 'Faculty of Social Sciences', facultyType: 'FACULTY', departments: [{ id: 33, name: 'Social Works And Administration' }, { id: 34, name: 'Public Administration And Governance' }] }, { facultyName: 'Faculty of Law', facultyType: 'FACULTY', departments: [{ id: 30, name: 'Law' }] }, { facultyName: 'Faculty of Engineering, Design and Technology', facultyType: null, departments: [{ id: 31, name: 'Department Of Computing And Technology' }] }, { facultyName: 'Faculty of Public Health, Nursing and Midwifery', facultyType: 'FACULTY', departments: [{ id: 107, name: 'Department Of Public Health' }] }, { facultyName: 'Faculty of Journalism, Media and Communication', facultyType: 'FACULTY', departments: [{ id: 121, name: 'Journalism And Media Studies' }, { id: 122, name: 'Communication' }] }] }, { campusName: 'MBALE UNIVERSITY COLLEGE', faculties: [{ facultyName: 'School of Business', facultyType: 'SCHOOL', departments: [{ id: 145, name: 'Undergraduate' }] }, { facultyName: 'Faculty of Social Sciences', facultyType: 'FACULTY', departments: [{ id: 60, name: 'Social Sciences' }] }, { facultyName: 'School of Social Sciences', facultyType: 'SCHOOL', departments: [{ id: 148, name: 'Undergraduate' }] }, { facultyName: 'Bishop Tucker School of Divinity and Theology', facultyType: 'SCHOOL', departments: [{ id: 147, name: 'Undergraduate' }] }, { facultyName: 'School of Education', facultyType: 'SCHOOL', departments: [{ id: 146, name: 'Undergraduate' }] }, { facultyName: 'Faculty of Business', facultyType: 'FACULTY', departments: [{ id: 61, name: 'Business' }] }, { facultyName: 'Faculty of Education', facultyType: 'FACULTY', departments: [{ id: 58, name: 'Education' }] }, { facultyName: 'Bishop Tucker School of Divinity and Theology', facultyType: 'FACULTY', departments: [{ id: 62, name: 'Theology' }] }, { facultyName: 'Faculty of Engineering, Design and Technology', facultyType: null, departments: [{ id: 59, name: 'Department Of Computing And Technology' }] }] }, { campusName: 'BISHOP BARHAM UNIVERSITY COLLEGE KABALE', faculties: [{ facultyName: 'School of Education', facultyType: 'SCHOOL', departments: [{ id: 138, name: 'Undergraduate' }] }, { facultyName: 'Faculty of Engineering, Design and Technology', facultyType: null, departments: [{ id: 42, name: 'Department Of Engineering And Environment' }, { id: 41, name: 'Department Of Computing And Technology' }] }, { facultyName: 'Bishop Tucker School of Divinity and Theology', facultyType: 'SCHOOL', departments: [{ id: 169, name: 'Undergraduate' }] }, { facultyName: 'School of Social Sciences', facultyType: 'SCHOOL', departments: [{ id: 139, name: 'Undergraduate' }] }, { facultyName: 'School of Business', facultyType: 'SCHOOL', departments: [{ id: 144, name: 'Undergraduate' }] }, { facultyName: 'School of Journalism, Media and Communication', facultyType: 'SCHOOL', departments: [{ id: 143, name: 'Undergraduate' }] }, { facultyName: 'Bishop Tucker School of Divinity and Theology', facultyType: 'FACULTY', departments: [{ id: 51, name: 'Divinity' }, { id: 50, name: 'Child Development And Children\'s Ministry' }] }, { facultyName: 'Faculty of Business', facultyType: 'FACULTY', departments: [{ id: 40, name: 'Department Of Business And Finance' }, { id: 44, name: 'Department Of Management And Entrepreneurship' }, { id: 45, name: 'Department Of Economics And Statistics' }, { id: 46, name: 'Academic Faculties' }] }, { facultyName: 'Faculty of Education', facultyType: 'FACULTY', departments: [{ id: 36, name: 'Education' }, { id: 63, name: 'Languages' }] }, { facultyName: 'Faculty of Social Sciences', facultyType: 'FACULTY', departments: [{ id: 52, name: 'Development Studies' }, { id: 53, name: 'Social Works And Social Administration' }, { id: 54, name: 'Public Administration And Governance' }, { id: 64, name: 'Counseling' }] }, { facultyName: 'Faculty of Agricultural Sciences', facultyType: null, departments: [{ id: 43, name: 'Department Of Agricultural And Biological Sciences' }] }, { facultyName: 'Faculty of Journalism, Media and Communication', facultyType: 'FACULTY', departments: [{ id: 55, name: 'Journalism And Media Studies' }] }] }, { campusName: 'ARUA CAMPUS', faculties: [{ facultyName: 'Bishop Tucker School of Divinity and Theology', facultyType: 'FACULTY', departments: [{ id: 101, name: 'Divinity And Theology' }] }, { facultyName: 'School of Social Sciences', facultyType: 'SCHOOL', departments: [{ id: 151, name: 'Undergraduate' }] }, { facultyName: 'School of Business', facultyType: 'SCHOOL', departments: [{ id: 152, name: 'Undergraduate' }] }, { facultyName: 'School of Education', facultyType: 'SCHOOL', departments: [{ id: 150, name: 'Undergraduate' }] }, { facultyName: 'Bishop Tucker School of Divinity and Theology', facultyType: 'SCHOOL', departments: [{ id: 149, name: 'Undergraduate' }] }, { facultyName: 'Faculty of Engineering, Design and Technology', facultyType: null, departments: [{ id: 102, name: 'Department Of Computing And Technology' }] }, { facultyName: 'Faculty of Education', facultyType: 'FACULTY', departments: [{ id: 78, name: 'Education' }] }, { facultyName: 'Faculty of Social Sciences', facultyType: 'FACULTY', departments: [{ id: 100, name: 'Social Work' }] }, { facultyName: 'Faculty of Business', facultyType: 'FACULTY', departments: [{ id: 99, name: 'Business' }] }] }]

// ─── Selection Preview ────────────────────────────────────────────────────────
interface SelectionPreviewProps {
  selected: FlatEntry | null
  onClear: () => void
}

function SelectionPreview({ selected, onClear }: SelectionPreviewProps) {
  if (!selected)
    return null
  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shrink-0">
        <GraduationCap className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider mb-0.5">
          Selected
        </p>
        <p className="text-sm font-semibold text-stone-800 truncate">
          {toTitleCase(selected.department)}
        </p>
        <p className="text-xs text-stone-500 truncate">{selected.faculty}</p>
        <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
          <MapPin className="h-2.5 w-2.5" />
          {toTitleCase(selected.campus)}
        </p>
        <p className="text-[10px] text-teal-400 font-mono mt-1">
          ID:
          {' '}
          {selected.id}
        </p>
      </div>
      <button
        onClick={onClear}
        className="text-stone-400 hover:text-stone-600 mt-0.5 shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function ProgramPicker() {
  const [mode, setMode] = useState('search')
  const [selected, setSelected] = useState<FlatEntry | null>(null)
  const { data } = useGetDepartments()

  const departmentsList = data?.data

  if (!departmentsList) {
    return null
  }

  const flatOptions = flattenData(departmentsList)

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #f5f0eb 0%, #ede8e0 50%, #e8e3db 100%)' }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-amber-400" />
            </div>
            <span
              className="text-xs font-bold tracking-[0.2em] uppercase text-stone-500"
              style={{ fontFamily: '\'Georgia\', serif' }}
            >
              UCU · Alpha-MIS
            </span>
          </div>
          <h1
            className="text-2xl font-bold text-stone-800 mt-2 leading-tight"
            style={{ fontFamily: '\'Georgia\', serif' }}
          >
            Select a Department
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {flatOptions.length}
            {' '}
            departments across
            {' '}
            {RAW_DATA.length}
            {' '}
            campuses
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/60 border border-stone-100 overflow-hidden">
          {/* Mode Toggle */}
          <div className="flex border-b border-stone-100 bg-stone-50">
            <button
              onClick={() => setMode('search')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold tracking-wide uppercase transition-all',
                mode === 'search'
                  ? 'text-stone-800 border-b-2 border-stone-800 bg-white -mb-px'
                  : 'text-stone-400 hover:text-stone-600',
              )}
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
            <button
              onClick={() => setMode('stepped')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold tracking-wide uppercase transition-all',
                mode === 'stepped'
                  ? 'text-stone-800 border-b-2 border-stone-800 bg-white -mb-px'
                  : 'text-stone-400 hover:text-stone-600',
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Browse
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            {mode === 'search'
              ? (
                  <SearchMode
                    flatOptions={flatOptions}
                    onSelect={setSelected}
                    selected={selected}
                  />
                )
              : (
                  <SteppedMode
                    data={departmentsList}
                    flatOptions={flatOptions}
                    onSelect={setSelected}
                    selected={selected}
                  />
                )}

            {/* Selection Preview */}
            {selected && (
              <>
                <Separator className="my-4" />
                <SelectionPreview selected={selected} onClear={() => setSelected(null)} />
              </>
            )}

            {/* Confirm */}
            {selected && (
              <Button
                className="w-full mt-3 bg-stone-800 hover:bg-stone-700 text-white text-sm font-semibold h-10 rounded-lg"
                onClick={() => alert(`Confirmed: ${selected.department} (ID: ${selected.id})`)}
              >
                Confirm Selection
              </Button>
            )}
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-stone-400 mt-4">
          All data loaded client-side · Zero additional API calls
        </p>
      </div>
    </div>
  )
}
