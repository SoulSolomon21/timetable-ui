import type { ITimetableFilter } from '@/features/calendar/interfaces'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useTimetable } from '@/features/calendar/contexts/TimetableContext'
import { getFilterEntities } from '@/features/calendar/helpers/FilterEntities'
import { cn } from '@/lib/utils'

// ─── Dimension tab config ─────────────────────────────────────────────────────

const DIMENSIONS: {
  value: ITimetableFilter['dimension']
  label: string
  emptyText: string
  placeholder: string
}[] = [
  {
    value: 'lecturer',
    label: 'Lecturer',
    emptyText: 'No lecturers found.',
    placeholder: 'Search lecturers...',
  },
  {
    value: 'room',
    label: 'Room',
    emptyText: 'No rooms found.',
    placeholder: 'Search rooms...',
  },
  {
    value: 'program',
    label: 'Program',
    emptyText: 'No programs found.',
    placeholder: 'Search programs...',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function FilterSwitcher() {
  const {
    filter,
    setFilterDimension,
    setSelectedId,
    lecturers,
    rooms,
    programs,
  } = useTimetable()

  const [open, setOpen] = useState(false)

  const activeDimension = DIMENSIONS.find(d => d.value === filter.dimension)!

  const entities = getFilterEntities(
    filter.dimension,
    lecturers,
    rooms,
    programs,
  )

  // The label shown in the combobox trigger button.
  const selectedEntity = entities.find(e => e.id === filter.selectedId)
  const triggerLabel = selectedEntity?.label ?? `All ${activeDimension.label.toLowerCase()}s`

  function handleDimensionChange(dimension: ITimetableFilter['dimension']) {
    // setFilterDimension resets selectedId to null — defined in context.
    setFilterDimension(dimension)
    setOpen(false)
  }

  function handleSelect(entityId: string) {
    // Toggle: selecting the same item again clears the filter.
    setSelectedId(filter.selectedId === entityId ? null : entityId)
    setOpen(false)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation() // don't open the popover
    setSelectedId(null)
  }

  return (
    <div className="flex items-center gap-2">
      {/* ── Dimension tabs ── */}
      <div
        className={cn(
          'flex items-center rounded-md border border-border',
          'bg-muted/40 p-0.5 gap-0.5',
        )}
        role="tablist"
        aria-label="Filter dimension"
      >
        {DIMENSIONS.map((dim) => {
          const isActive = filter.dimension === dim.value
          return (
            <button
              key={dim.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleDimensionChange(dim.value)}
              className={cn(
                'rounded-sm px-2.5 py-1 text-xs font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {dim.label}
            </button>
          )
        })}
      </div>

      {/* ── Entity combobox ── */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={`Filter by ${activeDimension.label}`}
            className={cn(
              'h-8 min-w-45 max-w-65 justify-between',
              'text-xs font-normal',
              // Highlight the button when a filter is active
              filter.selectedId && 'border-primary/50 bg-primary/5 text-foreground',
            )}
          >
            <span className="truncate">{triggerLabel}</span>
            <div className="ml-2 flex items-center gap-1 shrink-0">
              {/* Clear button — only shown when a filter is active */}
              {filter.selectedId && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  onKeyDown={e => e.key === 'Enter' && handleClear(e as any)}
                  className={cn(
                    'rounded-full p-px',
                    'text-muted-foreground hover:text-foreground',
                    'hover:bg-muted transition-colors',
                  )}
                  aria-label="Clear filter"
                >
                  <X style={{ width: 12, height: 12 }} />
                </span>
              )}
              <ChevronsUpDown
                className="text-muted-foreground"
                style={{ width: 12, height: 12 }}
              />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-70 p-0"
          align="start"
          sideOffset={4}
        >
          <Command>
            <CommandInput
              placeholder={activeDimension.placeholder}
              className="h-8 text-xs"
            />
            <CommandList>
              <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                {activeDimension.emptyText}
              </CommandEmpty>
              <CommandGroup>
                {/* "View all" option at the top */}
                <CommandItem
                  value="__all__"
                  onSelect={() => {
                    setSelectedId(null)
                    setOpen(false)
                  }}
                  className="text-xs"
                >
                  <Check
                    className={cn(
                      'mr-2',
                      filter.selectedId === null ? 'opacity-100' : 'opacity-0',
                    )}
                    style={{ width: 14, height: 14 }}
                  />
                  <span className="font-medium">
                    All
                    {' '}
                    {activeDimension.label.toLowerCase()}
                    s
                  </span>
                </CommandItem>

                {/* Entity list */}
                {entities.map(entity => (
                  <CommandItem
                    key={entity.id}
                    value={`${entity.label} ${entity.sublabel ?? ''}`}
                    onSelect={() => handleSelect(entity.id)}
                    className="text-xs"
                  >
                    <Check
                      className={cn(
                        'mr-2 shrink-0',
                        filter.selectedId === entity.id
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                      style={{ width: 14, height: 14 }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{entity.label}</span>
                      {entity.sublabel && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {entity.sublabel}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
