import type { FlatEntry } from './utils'
import { Check, MapPin } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { toTitleCase } from './utils'

interface Props {
  flatOptions: FlatEntry[]
  onSelect: (item: FlatEntry) => void
  selected: FlatEntry | null
}

export type GroupedPrograms = Record<string, FlatEntry[]>

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
    <Command className="max-w rounded-lg border space-y-2">
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Try 'Computing Kampala' or 'Public Health'…"
      />
      <CommandList>
        <CommandEmpty className="py-8 text-sm text-center">
          No results
          {query.trim() !== '' && totalResults === 0 && (
            ` for "${query}"`
          )}
        </CommandEmpty>
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
                    'group rounded-md flex justify-between items-center w-full text-[0.8125rem] leading-normal text-primary gap-4 cursor-pointer p-3 m-1',
                    'aria-checked:bg-accent-foreground/50',
                    selected?.id === item.id && 'bg-accent-foreground/10',
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {toTitleCase(item.department)}
                    </span>
                    <p className="text-xs text-accent-foreground truncate mt-0.5">{item.faculty}</p>
                  </div>
                  <div className="flex items-center">
                    {selected?.id === item.id && <Check className="mr-3 size-4 " />}
                  </div>
                </CommandItem>
              ))
            }
          </CommandGroup>
        ))}
      </CommandList>
      {query.trim() !== '' && totalResults > 0 && (
        <p className="text-xs text-accent-foreground text-right p-1.5">
          {totalResults}
          {' '}
          result
          {totalResults !== 1 ? 's' : ''}
        </p>
      )}
    </Command>
  )
}

export default SearchMode
