'use client'

import * as React from 'react'
import { Check, ChevronDown, Plus, X, Search as SearchIcon } from 'lucide-react'
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
  inferCategory,
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
 * Professional instrument picker with a dedicated "+ Add" button.
 *
 * - Grouped by category (Metals, Indices, Energy, Forex, Crypto, Other)
 * - Search by symbol or full name
 * - "+ Add" button in the top-right corner opens an inline form to
 *   add a brand-new instrument (persists to localStorage)
 * - Selected instrument highlighted with a check mark
 * - Custom (user-added) instruments can be removed via hover × button
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
  const customInstruments = useInstrumentsStore((s) => s.custom)

  const customSymbols = React.useMemo(
    () => new Set(customInstruments.map((c) => c.symbol)),
    [customInstruments]
  )

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  // Inline add-form state
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [newSymbol, setNewSymbol] = React.useState('')
  const [addError, setAddError] = React.useState('')
  const addInputRef = React.useRef<HTMLInputElement>(null)

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

  const handleSelect = (symbol: string) => {
    onChange(symbol)
    setOpen(false)
    setQuery('')
    setShowAddForm(false)
  }

  const handleRemoveCustom = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    removeCustom(symbol)
    if (selected?.symbol === symbol) onChange('')
  }

  // --- Inline add form handlers ---
  const handleOpenAddForm = () => {
    setShowAddForm(true)
    setNewSymbol('')
    setAddError('')
    // Focus the input after the DOM updates
    setTimeout(() => addInputRef.current?.focus(), 50)
  }

  const handleConfirmAdd = () => {
    const sym = newSymbol.trim().toUpperCase().replace(/\s+/g, '')
    if (sym.length < 2) {
      setAddError('At least 2 characters')
      return
    }
    if (sym.length > 16) {
      setAddError('Max 16 characters')
      return
    }
    if (!/^[A-Za-z0-9]+$/.test(sym)) {
      setAddError('Letters and numbers only')
      return
    }
    // Check if already exists
    if (instruments.some((i) => i.symbol === sym)) {
      setAddError(`${sym} already exists`)
      return
    }
    const added = addCustom(sym)
    if (added) {
      handleSelect(added)
    }
  }

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirmAdd()
    } else if (e.key === 'Escape') {
      setShowAddForm(false)
      setNewSymbol('')
      setAddError('')
    }
  }

  const handleClosePopover = (o: boolean) => {
    setOpen(o)
    if (!o) {
      setQuery('')
      setShowAddForm(false)
      setNewSymbol('')
      setAddError('')
    }
  }

  return (
    <Popover open={open} onOpenChange={handleClosePopover}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls="instrument-select-list"
          className={cn(
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
        className="p-0"
        style={{ width: 'min(18rem, calc(100vw - 2rem))', maxWidth: 'calc(100vw - 2rem)' }}
        collisionPadding={8}
      >
        {/* Header bar: search + Add button */}
        <div className="flex items-center gap-1 border-b px-2 py-1.5">
          <div className="flex flex-1 items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-2 py-1">
            <SearchIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-5 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          {/* + Add button (top-right corner) */}
          <button
            type="button"
            onClick={handleOpenAddForm}
            disabled={showAddForm}
            className={cn(
              'flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors',
              showAddForm
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border/50 bg-background text-muted-foreground hover:border-primary/40 hover:text-primary'
            )}
            title="Add new instrument"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        {/* Inline add form (shows when "+ Add" is clicked) */}
        {showAddForm && (
          <div className="border-b bg-muted/20 px-3 py-2.5">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              New instrument symbol
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={addInputRef}
                type="text"
                value={newSymbol}
                onChange={(e) => {
                  setNewSymbol(e.target.value)
                  setAddError('')
                }}
                onKeyDown={handleAddKeyDown}
                placeholder="e.g. EURUSD"
                maxLength={16}
                className="h-8 flex-1 rounded-md border border-border/50 bg-background px-2 text-sm font-mono outline-none focus:border-primary/40"
              />
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewSymbol(''); setAddError('') }}
                className="flex h-8 items-center justify-center rounded-md border border-border/50 px-2 text-xs text-muted-foreground hover:bg-accent"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {addError ? (
              <p className="mt-1 text-[11px] text-rose-500">{addError}</p>
            ) : (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {newSymbol.trim() ? (
                  <>Category: <span className="font-medium">{inferCategory(newSymbol)}</span> · Enter to confirm, Esc to cancel</>
                ) : (
                  <>Type a symbol · Enter to confirm, Esc to cancel</>
                )}
              </p>
            )}
          </div>
        )}

        {/* Instrument list */}
        <Command shouldFilter={false} loop>
          <CommandList id="instrument-select-list">
            {filtered.length === 0 ? (
              <CommandEmpty>
                {query
                  ? `No instruments matching "${query}"`
                  : 'No instruments. Click "+ Add" to create one.'}
              </CommandEmpty>
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { SearchIcon as Search }
