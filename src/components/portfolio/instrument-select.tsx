'use client'

import * as React from 'react'
import { Check, ChevronDown, Plus, Search, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  useInstrumentsStore,
  useAllInstruments,
  CATEGORY_ORDER,
  type InstrumentCategory,
  type Instrument,
} from '@/lib/instruments-store'
import { cn } from '@/lib/utils'

const CATEGORY_BADGE: Record<InstrumentCategory, string> = {
  Metals:   'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  Indices:  'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  Energy:   'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  Forex:    'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  Crypto:   'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400',
  Other:    'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400',
}

/**
 * A professional, combobox-style instrument picker.
 *
 * - Grouped by category (Metals, Indices, Energy, Forex, Crypto, Other)
 * - Search by symbol or full name
 * - Add a brand new instrument inline when the search has no match
 * - Selected instrument is highlighted with a check mark
 *
 * Renders inside `.journal` so it inherits the journal input styles for
 * the trigger, while the dropdown uses shadcn popover/command styles.
 */
export function InstrumentSelect({
  value,
  onChange,
  placeholder = 'Select instrument',
  className,
}: {
  value: string
  onChange: (symbol: string) => void
  placeholder?: string
  className?: string
}) {
  const instruments = useAllInstruments()
  const addCustom = useInstrumentsStore((s) => s.addCustom)
  const removeCustom = useInstrumentsStore((s) => s.removeCustom)
  // Select the raw custom array (stable reference from Zustand) and derive
  // the symbols set in useMemo — returning a fresh array from the selector
  // would trigger an infinite useSyncExternalStore loop in React 19.
  const customInstruments = useInstrumentsStore((s) => s.custom)

  const customSymbols = React.useMemo(
    () => new Set(customInstruments.map((c) => c.symbol)),
    [customInstruments]
  )

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  // Resolve the currently-selected instrument (for the trigger display).
  const selected = React.useMemo(
    () => instruments.find((i) => i.symbol === value.toUpperCase()) ?? null,
    [instruments, value]
  )

  // Filtered + grouped list based on the search query.
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return instruments
    return instruments.filter(
      (i) =>
        i.symbol.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q)
    )
  }, [instruments, query])

  const grouped = React.useMemo(() => {
    const map = new Map<InstrumentCategory, Instrument[]>()
    for (const i of filtered) {
      const arr = map.get(i.category) ?? []
      arr.push(i)
      map.set(i.category, arr)
    }
    return CATEGORY_ORDER
      .map((c) => ({ category: c, items: map.get(c) ?? [] }))
      .filter((g) => g.items.length > 0)
  }, [filtered])

  // Does the query look like a brand-new instrument?
  const trimmedQuery = query.trim()
  const exactMatch = instruments.some(
    (i) => i.symbol.toLowerCase() === trimmedQuery.toLowerCase()
  )
  const canAdd =
    trimmedQuery.length >= 2 &&
    trimmedQuery.length <= 16 &&
    !exactMatch &&
    /^[A-Za-z0-9]+$/.test(trimmedQuery)

  const handleSelect = (symbol: string) => {
    onChange(symbol)
    setOpen(false)
    setQuery('')
  }

  const handleAddNew = () => {
    if (!canAdd) return
    const symbol = addCustom(trimmedQuery)
    if (symbol) handleSelect(symbol)
  }

  const handleRemoveCustom = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    removeCustom(symbol)
    if (selected?.symbol === symbol) onChange('')
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery('') }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls="instrument-select-list"
          className={cn(
            // Mirror the .journal input styling, plus a leading icon + trailing chevron.
            'journal-input flex w-full items-center justify-between gap-2 rounded-lg border bg-[var(--j-card)] px-2.5 py-[7px] text-left text-[0.8125rem] transition-[border-color,box-shadow]',
            'border-[var(--j-line)] hover:border-[var(--j-acc)] focus-visible:border-[var(--j-acc)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--j-acc-bg)]',
            className
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected ? (
              <>
                <span className="truncate font-medium text-[var(--j-ink)]">
                  {selected.symbol}
                </span>
                <span
                  className={cn(
                    'hidden rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide sm:inline',
                    CATEGORY_BADGE[selected.category]
                  )}
                >
                  {selected.category}
                </span>
              </>
            ) : (
              <span className="text-[var(--j-mute)]">{placeholder}</span>
            )}
          </span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 flex-shrink-0 text-[var(--j-mute)] transition-transform',
              open && 'rotate-180'
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[min(20rem,var(--radix-popover-trigger-width))] p-0"
        style={{ minWidth: 260 }}
      >
        <Command shouldFilter={false} loop>
          <CommandInput
            placeholder="Search instrument or type a new symbol…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList id="instrument-select-list">
            {filtered.length === 0 && !canAdd ? (
              <CommandEmpty>No instruments found.</CommandEmpty>
            ) : (
              grouped.map((g, idx) => (
                <React.Fragment key={g.category}>
                  {idx > 0 && <CommandSeparator />}
                  <CommandGroup heading={g.category}>
                    {g.items.map((i) => {
                      const isCustom = customSymbols.has(i.symbol)
                      const isSelected = i.symbol === value.toUpperCase()
                      return (
                        <CommandItem
                          key={i.symbol}
                          value={`${i.symbol} ${i.name}`}
                          onSelect={() => handleSelect(i.symbol)}
                          className="group justify-between"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="font-mono text-xs font-semibold">
                              {i.symbol}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              {i.name}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            {isCustom && (
                              <button
                                type="button"
                                aria-label={`Remove ${i.symbol}`}
                                onClick={(e) => handleRemoveCustom(i.symbol, e)}
                                className="rounded p-0.5 text-muted-foreground/60 opacity-0 transition-opacity hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
                                tabIndex={-1}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                            <span
                              className={cn(
                                'rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide',
                                CATEGORY_BADGE[i.category]
                              )}
                            >
                              {i.category}
                            </span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            )}
                          </span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </React.Fragment>
              ))
            )}

            {/* Add new instrument inline */}
            {canAdd && (
              <>
                {filtered.length > 0 && <CommandSeparator />}
                <CommandGroup heading="Add new">
                  <CommandItem
                    value={`__add__${trimmedQuery}`}
                    onSelect={handleAddNew}
                    className="gap-2"
                  >
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm">
                      Add <span className="font-mono font-semibold">{trimmedQuery.toUpperCase()}</span> as a new instrument
                    </span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/* Convenience export for the empty (no-selection) trigger look. */
export { Search }
