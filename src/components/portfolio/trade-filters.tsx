'use client'

import * as React from 'react'
import { Filter, RotateCcw, Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import { type TradeFilters } from '@/lib/trade-types'
import {
  useAllInstruments,
  CATEGORY_ORDER,
  type Instrument,
  type InstrumentCategory,
} from '@/lib/instruments-store'
import { useAllTrades } from '@/hooks/use-trades'
import { cn } from '@/lib/utils'

function toDateInput(date: Date | undefined): string | undefined {
  if (!date) return undefined
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

interface Props {
  filters: TradeFilters
  onChange: (f: TradeFilters) => void
  resultCount: number
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border/60 bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <CalendarIcon className="h-3 w-3" />
      {label}
    </button>
  )
}

export function TradeFilters({ filters, onChange, resultCount }: Props) {
  const [expanded, setExpanded] = React.useState(false)
  const hasActive =
    filters.side !== 'ALL' ||
    filters.result !== 'ALL' ||
    (filters.instrument && filters.instrument !== 'ALL') ||
    !!filters.fromDate ||
    !!filters.toDate

  const set = (patch: Partial<TradeFilters>) =>
    onChange({ ...filters, ...patch })

  const clear = () =>
    onChange({
      side: 'ALL',
      result: 'ALL',
      instrument: 'ALL',
      fromDate: undefined,
      toDate: undefined,
    })

  // Build the instrument list shown in the filter dropdown:
  //   defaults + user-added (from store) + any seen in existing trades (legacy)
  const storeInstruments = useAllInstruments()
  const { data: allTrades } = useAllTrades()

  const filterInstruments: { symbol: string; category?: InstrumentCategory }[] =
    React.useMemo(() => {
      const seen = new Map<string, InstrumentCategory | undefined>()
      for (const i of storeInstruments) seen.set(i.symbol.toUpperCase(), i.category)
      if (allTrades) {
        for (const t of allTrades) {
          const sym = (t.instrument || '').trim().toUpperCase()
          if (!sym) continue
          if (!seen.has(sym)) seen.set(sym, undefined)
        }
      }
      return [...seen.entries()]
        .map(([symbol, category]) => ({ symbol, category }))
        .sort((a, b) => a.symbol.localeCompare(b.symbol))
    }, [storeInstruments, allTrades])

  // Group the filter list by category (instruments without a known category go to "Other")
  const groupedFilter = React.useMemo(() => {
    const map = new Map<InstrumentCategory, { symbol: string }[]>()
    for (const i of filterInstruments) {
      const cat = i.category ?? 'Other'
      const arr = map.get(cat) ?? []
      arr.push({ symbol: i.symbol })
      map.set(cat, arr)
    }
    return CATEGORY_ORDER
      .map((c) => ({ category: c, items: map.get(c) ?? [] }))
      .filter((g) => g.items.length > 0)
  }, [filterInstruments])

  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm">
      {/* Header band — clickable to toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5 sm:px-5"
      >
        <Filter className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-sm font-semibold">Filters</h3>
        {hasActive && (
          <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            active
          </span>
        )}
        <span className="ml-auto flex items-center gap-2">
          <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {resultCount} match{resultCount === 1 ? '' : 'es'}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </span>
      </button>

      {/* Body — expand/collapse */}
      {expanded && (
        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-end lg:justify-between">
        {/* Left: date range + side + result + instrument */}
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {/* From date */}
          <div>
            <Label className="mb-1.5 block text-[11px] text-muted-foreground">
              From date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  className="w-full justify-start font-normal"
                >
                  <CalendarIcon className="mr-1.5 h-3 w-3 text-muted-foreground" />
                  {filters.fromDate || 'Any'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    filters.fromDate
                      ? new Date(filters.fromDate + 'T00:00:00')
                      : undefined
                  }
                  onSelect={(d) => set({ fromDate: toDateInput(d) })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* To date */}
          <div>
            <Label className="mb-1.5 block text-[11px] text-muted-foreground">
              To date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  className="w-full justify-start font-normal"
                >
                  <CalendarIcon className="mr-1.5 h-3 w-3 text-muted-foreground" />
                  {filters.toDate || 'Any'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    filters.toDate
                      ? new Date(filters.toDate + 'T00:00:00')
                      : undefined
                  }
                  onSelect={(d) => set({ toDate: toDateInput(d) })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Instrument */}
          <div>
            <Label className="mb-1.5 block text-[11px] text-muted-foreground">
              Instrument
            </Label>
            <Select
              value={filters.instrument || 'ALL'}
              onValueChange={(v) =>
                set({ instrument: v as TradeFilters['instrument'] })
              }
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="ALL">All instruments</SelectItem>
                {groupedFilter.map((g) => (
                  <React.Fragment key={g.category}>
                    <SelectItem
                      value={`__grp_${g.category}`}
                      disabled
                      className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70"
                    >
                      {g.category}
                    </SelectItem>
                    {g.items.map((it) => (
                      <SelectItem
                        key={it.symbol}
                        value={it.symbol}
                        className="pl-6 font-mono text-xs"
                      >
                        {it.symbol}
                      </SelectItem>
                    ))}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Side */}
          <div>
            <Label className="mb-1.5 block text-[11px] text-muted-foreground">
              Side
            </Label>
            <ToggleGroup
              type="single"
              value={filters.side || 'ALL'}
              onValueChange={(v) =>
                set({ side: (v as TradeFilters['side']) || 'ALL' })
              }
              className="w-full"
            >
              <ToggleGroupItem
                value="ALL"
                className="flex-1 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                All
              </ToggleGroupItem>
              <ToggleGroupItem
                value="BUY"
                className="flex-1 text-xs data-[state=on]:bg-emerald-500 data-[state=on]:text-white"
              >
                BUY
              </ToggleGroupItem>
              <ToggleGroupItem
                value="SELL"
                className="flex-1 text-xs data-[state=on]:bg-rose-500 data-[state=on]:text-white"
              >
                SELL
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Result */}
          <div>
            <Label className="mb-1.5 block text-[11px] text-muted-foreground">
              Result
            </Label>
            <Select
              value={filters.result || 'ALL'}
              onValueChange={(v) =>
                set({ result: v as TradeFilters['result'] })
              }
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All results</SelectItem>
                <SelectItem value="TP">TP · profit</SelectItem>
                <SelectItem value="SL">SL · loss</SelectItem>
                <SelectItem value="BE">Break-even</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right: clear */}
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            disabled={!hasActive}
            className={cn('w-full lg:w-auto', !hasActive && 'opacity-40')}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Clear filters
          </Button>
        </div>
      </div>
      )}
    </div>
  )
}
