import type { FlatEntry } from './program-pickers/utils'
import { useNavigate } from '@tanstack/react-router'
import { GraduationCap, MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useGetDepartments } from '@/utils/api'
import SearchMode from './program-pickers/search-mode'
import SteppedMode from './program-pickers/stepped-mode'
import { flattenData, toTitleCase } from './program-pickers/utils'

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
  const navigate = useNavigate()

  const departmentsList = data?.data

  const handleConfirm = () => {
    navigate({ to: '/dashboard/programs/$programId', params: { programId: `${selected?.id}` } })
  }

  if (!departmentsList) {
    return null
  }

  const flatOptions = flattenData(departmentsList)

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md">
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
                onClick={() => handleConfirm()}
              >
                Confirm Selection
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
