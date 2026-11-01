'use client'

import * as React from 'react'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ScreenshotInput } from '@/components/portfolio/screenshot-input'
import {
  type TradeSide,
  type TradeResult,
  type ImageKind,
  signedAmount,
} from '@/lib/trade-types'
import { cn } from '@/lib/utils'

export interface TradeFormValues {
  dateStr: string
  timeStr: string
  side: TradeSide
  result: TradeResult
  magnitude: string
  comment: string
  imageUrl: string
  imageKind: ImageKind
}

function toDateInput(date: Date | undefined): string | undefined {
  if (!date) return undefined
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

interface Props {
  values: TradeFormValues
  onChange: (patch: Partial<TradeFormValues>) => void
  calDate: Date | undefined
  onCalDateChange: (d: Date | undefined) => void
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {children}
      </span>
      <span className="h-px flex-1 bg-border/40" />
    </div>
  )
}

export function TradeFields({ values, onChange, calDate, onCalDateChange }: Props) {
  const amount = React.useMemo(
    () => signedAmount(values.result, parseFloat(values.magnitude) || 0),
    [values.result, values.magnitude]
  )

  const handleDateChange = (d: Date | undefined) => {
    onCalDateChange(d)
    if (d) onChange({ dateStr: toDateInput(d) || '' })
  }

  return (
    <div className="space-y-5">
      {/* WHEN */}
      <div>
        <SectionLabel>When</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="tf-date" className="mb-1.5 block text-xs text-muted-foreground">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  id="tf-date"
                  type="button"
                  className="flex h-9 w-full items-center justify-start rounded-md border border-input bg-background px-3 text-sm font-normal ring-offset-background transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  <span className={cn(!values.dateStr && 'text-muted-foreground')}>
                    {values.dateStr || 'Pick a date'}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={calDate}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="tf-time" className="mb-1.5 block text-xs text-muted-foreground">
              Time
            </Label>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="tf-time"
                type="time"
                step={60}
                value={values.timeStr}
                onChange={(e) => onChange({ timeStr: e.target.value })}
                className="pl-8"
              />
            </div>
          </div>
        </div>
      </div>

      {/* POSITION */}
      <div>
        <SectionLabel>Position</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Side</Label>
            <ToggleGroup
              type="single"
              value={values.side}
              onValueChange={(v) => v && onChange({ side: v as TradeSide })}
              className="w-full"
            >
              <ToggleGroupItem
                value="BUY"
                className="flex-1 data-[state=on]:bg-emerald-500 data-[state=on]:text-white"
              >
                BUY
              </ToggleGroupItem>
              <ToggleGroupItem
                value="SELL"
                className="flex-1 data-[state=on]:bg-rose-500 data-[state=on]:text-white"
              >
                SELL
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Result</Label>
            <ToggleGroup
              type="single"
              value={values.result}
              onValueChange={(v) => v && onChange({ result: v as TradeResult })}
              className="w-full"
            >
              <ToggleGroupItem
                value="TP"
                className="flex-1 data-[state=on]:bg-emerald-500 data-[state=on]:text-white"
              >
                TP
              </ToggleGroupItem>
              <ToggleGroupItem
                value="SL"
                className="flex-1 data-[state=on]:bg-rose-500 data-[state=on]:text-white"
              >
                SL
              </ToggleGroupItem>
              <ToggleGroupItem
                value="BE"
                className="flex-1 data-[state=on]:bg-muted-foreground data-[state=on]:text-white"
              >
                BE
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      {/* RISK */}
      <div>
        <SectionLabel>Risk &amp; Reward</SectionLabel>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="tf-amount" className="mb-1.5 block text-xs text-muted-foreground">
              Amount ($)
            </Label>
            <Input
              id="tf-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={values.result === 'BE' ? '0' : values.magnitude}
              disabled={values.result === 'BE'}
              onChange={(e) => onChange({ magnitude: e.target.value })}
              placeholder="90.00"
            />
          </div>
          <div className="flex-shrink-0 rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-right">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Signed
            </div>
            <div
              className={cn(
                'font-mono text-sm font-bold',
                amount > 0
                  ? 'text-emerald-500'
                  : amount < 0
                  ? 'text-rose-500'
                  : 'text-muted-foreground'
              )}
            >
              {values.result === 'BE'
                ? '$0.00'
                : amount >= 0
                ? `+$${amount.toFixed(2)}`
                : `-$${Math.abs(amount).toFixed(2)}`}
            </div>
          </div>
        </div>
      </div>

      {/* NOTES & SCREENSHOT */}
      <div>
        <SectionLabel>Notes &amp; Screenshot</SectionLabel>
        <Textarea
          value={values.comment}
          onChange={(e) => onChange({ comment: e.target.value })}
          placeholder="What did you see? Why did you enter? What was the outcome?"
          rows={2}
          className="resize-y"
          maxLength={500}
        />
        <div className="mt-3">
          <ScreenshotInput
            imageUrl={values.imageUrl}
            imageKind={values.imageKind}
            onChange={(url, kind) =>
              onChange({ imageUrl: url, imageKind: kind })
            }
          />
        </div>
      </div>
    </div>
  )
}
