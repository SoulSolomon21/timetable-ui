import type { FlatEntry } from './utils'
import { Check, MapPin, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { FACULTY_TYPE_COLORS, toTitleCase } from './utils'
import { Separator } from '../ui/separator'

interface Props {
  flatOptions: FlatEntry[]
  onSelect: (item: FlatEntry) => void
  selected: FlatEntry
}

type GroupedPrograms = Record<string, FlatEntry[]>

function SearchMode({ flatOptions, onSelect, selected }: Props) {
  const [query, setQuery] = useState('')

  const grouped = useMemo(() => {
    if (!query.trim())
      return {} as GroupedPrograms
    const q = query.toLowerCase()
    const filtered = flatOptions.filter(o => o.searchText.includes(q))

    return filtered.reduce<GroupedPrograms>((acc, item) => {
      (acc[item.campus] ??= []).push(item)
      return acc
    }, {})
  }, [query, flatOptions])

  const totalResults = Object.values(grouped).reduce((s, g) => s + g.length, 0)

  return (
    <div>
      <Command className="rounded-xl border border-stone-200 shadow-sm bg-white overflow-visible space-y-2">
        <div className="">
          <CommandInput
            placeholder="Try 'Computing Kampala' or 'Public Health'…"
            value={query}
            onValueChange={setQuery}
          />
          {/* {query && (
            <Button size={"icon-sm"} onClick={() => setQuery('')}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )} */}
        </div>
        <Separator />
        <CommandList className="max-h-72 overflow-y-auto">
          {query.trim() === '' && (
            <div className="py-10 text-center text-sm">
              Start typing to search…
            </div>
          )}
          {query.trim() !== '' && totalResults === 0 && (
            <CommandEmpty className="py-8 text-sm text-center">
              No results for "
              {query}
              "
            </CommandEmpty>
          )}
          {Object.entries(grouped).map(([campus, items]) => (
            <CommandGroup
              key={campus}
              heading={(
                <div className="flex items-center gap-1.5 py-1">
                  <MapPin className="h-3 w-3" />
                  <span className="text-[11px] font-semibold tracking-widest uppercase text-stone-500">
                    {toTitleCase(campus)}
                  </span>
                  <span className="ml-auto text-[10px] font-normal">{items.length}</span>
                </div>
              )}
            >
              {
                items.map(item => (
                  <CommandItem
                    key={item.id}
                    value={`${item.id}-${item.searchText}`}
                    onSelect={() => onSelect(item)}
                    className={cn(
                      'flex items-start gap-3 px-3 py-2.5 cursor-pointer rounded-lg mx-1 mb-0.5',
                      'hover:bg-stone-50 aria-selected:bg-teal-50',
                      selected?.id === item.id && 'bg-teal-50',
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-stone-800 truncate">
                          {toTitleCase(item.department)}
                        </span>
                        {item.facultyType && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] px-1.5 py-0 h-4 font-medium border shrink-0',
                              FACULTY_TYPE_COLORS[item.facultyType],
                            )}
                          >
                            {item.facultyType}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 truncate mt-0.5">{item.faculty}</p>
                    </div>
                    {selected?.id === item.id && <Check className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />}
                  </CommandItem>
                ))
              }
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
      {query.trim() !== '' && totalResults > 0 && (
        <p className="text-xs text-stone-400 text-right">
          {totalResults}
          {' '}
          result
          {totalResults !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}

export default SearchMode
