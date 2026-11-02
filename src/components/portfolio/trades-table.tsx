'use client'

import * as React from 'react'
import {
  Trash2,
  Pencil,
  ArrowDownUp,
  Loader2,
  Inbox,
  ImageIcon,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useDeleteTrade } from '@/hooks/use-trades'
import { type Trade } from '@/lib/trade-types'
import { useToast } from '@/hooks/use-toast'
import { EditTradeDialog } from '@/components/portfolio/edit-trade-dialog'
import { ImageModal } from '@/components/portfolio/image-modal'
import { cn } from '@/lib/utils'

type SortKey = 'date' | 'time' | 'instrument' | 'lotSize' | 'side' | 'result' | 'amount'

function fmtDate(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

function fmtTime(iso: string): string {
  const d = new Date(iso)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function fmtMoney(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toFixed(2)}`
}

const sideBadge: Record<string, string> = {
  BUY: 'bg-[var(--j-win-bg)] text-[var(--j-win)] ring-[var(--j-win)]/40',
  SELL: 'bg-[var(--j-loss-bg)] text-[var(--j-loss)] ring-[var(--j-loss)]/40',
}

const resultBadge: Record<string, string> = {
  TP: 'bg-[var(--j-win)] text-white',
  SL: 'bg-[var(--j-loss)] text-white',
  BE: 'bg-[var(--j-be)] text-white',
}

function SortHeader({
  k,
  label,
  sortKey,
  sortDir,
  onToggle,
  className,
}: {
  k: SortKey
  label: string
  sortKey: SortKey
  sortDir: 'asc' | 'desc'
  onToggle: (k: SortKey) => void
  className?: string
}) {
  return (
    <TableHead className={className}>
      <button
        onClick={() => onToggle(k)}
        className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide hover:text-foreground"
      >
        {label}
        <ArrowDownUp
          className={cn(
            'h-3 w-3 transition-opacity',
            sortKey === k ? 'opacity-100 text-primary' : 'opacity-30'
          )}
        />
      </button>
    </TableHead>
  )
}

export function TradesTable({ trades }: { trades: Trade[] }) {
  const { toast } = useToast()
  const del = useDeleteTrade()
  const [sortKey, setSortKey] = React.useState<SortKey>('date')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc')

  // edit dialog state
  const [editTrade, setEditTrade] = React.useState<Trade | null>(null)
  // image modal state
  const [imageState, setImageState] = React.useState<{ src: string; title: string } | null>(null)

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(k)
      setSortDir('desc')
    }
  }

  const sorted = React.useMemo(() => {
    const arr = [...trades]
    arr.sort((a, b) => {
      let av: string | number
      let bv: string | number
      switch (sortKey) {
        case 'date':
        case 'time':
          av = new Date(a.tradeAt).getTime()
          bv = new Date(b.tradeAt).getTime()
          break
        case 'instrument':
          av = (a.instrument || '').toLowerCase()
          bv = (b.instrument || '').toLowerCase()
          break
        case 'lotSize':
          av = a.lotSize ?? -1
          bv = b.lotSize ?? -1
          break
        case 'side':
          av = a.side
          bv = b.side
          break
        case 'result':
          av = a.result
          bv = b.result
          break
        case 'amount':
          av = a.amount
          bv = b.amount
          break
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [trades, sortKey, sortDir])

  const handleDelete = async (id: string) => {
    try {
      await del.mutateAsync(id)
      toast({ title: 'Trade deleted' })
    } catch (e) {
      toast({
        title: 'Delete failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const net = sorted.reduce((s, t) => s + t.amount, 0)

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/40 py-16 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm font-medium">No trades match your filters</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Adjust the filters above or add a new trade.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Edit dialog */}
      {editTrade && (
        <EditTradeDialog
          trade={editTrade}
          open={!!editTrade}
          onOpenChange={(o) => !o && setEditTrade(null)}
        />
      )}

      {/* Image modal */}
      {imageState && (
        <ImageModal
          open={!!imageState}
          onOpenChange={(o) => !o && setImageState(null)}
          src={imageState.src}
          title={imageState.title}
        />
      )}

      {/* Summary bar ABOVE the table */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-4 py-2.5 shadow-sm">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-foreground">
            {sorted.length}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            trade{sorted.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Net
          </span>
          <span
            className={cn(
              'font-mono text-base font-bold',
              net > 0 ? 'text-[var(--j-win)]' : net < 0 ? 'text-[var(--j-loss)]' : 'text-[var(--j-mute)]'
            )}
          >
            {fmtMoney(net)}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="scroll-gold max-h-[40rem] overflow-auto">
          <Table style={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
              <TableRow className="border-border/60 hover:bg-transparent">
                <SortHeader k="date" label="Date" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} className="w-[130px]" />
                <SortHeader k="time" label="Time" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} className="w-[60px]" />
                <SortHeader k="instrument" label="Instrument" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} className="w-[90px]" />
                <SortHeader k="lotSize" label="Lot" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} className="w-[56px] text-right" />
                <SortHeader k="side" label="Side" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} className="w-[60px]" />
                <SortHeader k="result" label="Result" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} className="w-[56px]" />
                <SortHeader k="amount" label="Amount" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} className="w-[80px] text-right" />
                <TableHead>Comment</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((t) => (
                <TableRow key={t.id} className="border-border/40">
                  <TableCell className="font-mono text-xs">
                    {fmtDate(t.tradeAt)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {fmtTime(t.tradeAt)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {t.instrument ? (
                      <span className="font-medium text-foreground">{t.instrument}</span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {t.lotSize != null ? t.lotSize : <span className="text-muted-foreground/40">—</span>}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ring-1',
                        sideBadge[t.side]
                      )}
                    >
                      {t.side}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                        resultBadge[t.result]
                      )}
                    >
                      {t.result}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-mono text-sm font-semibold',
                      t.amount > 0
                        ? 'text-[var(--j-win)]'
                        : t.amount < 0
                        ? 'text-[var(--j-loss)]'
                        : 'text-[var(--j-mute)]'
                    )}
                  >
                    {fmtMoney(t.amount)}
                  </TableCell>
                  <TableCell className="overflow-hidden">
                    <div className="flex flex-col items-center gap-1">
                      {t.comment ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="max-w-full truncate text-center text-xs text-muted-foreground">
                                {t.comment}
                              </span>
                            </TooltipTrigger>
                            {t.comment.length > 50 && (
                              <TooltipContent className="max-w-xs">
                                {t.comment}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}

                      {/* Screenshot display */}
                      {t.imageUrl && (
                        t.imageKind === 'link' ? (
                          <a
                            href={t.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-fit items-center gap-1 rounded-md border border-border/50 bg-background px-1.5 py-0.5 text-[10px] font-medium text-primary transition-colors hover:bg-primary/10"
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                            screenshot
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setImageState({
                                src: t.imageUrl!,
                                title: `${t.side} ${t.result} · ${fmtDate(t.tradeAt)} ${fmtTime(t.tradeAt)}`,
                              })
                            }
                            className="inline-flex w-fit items-center gap-1 rounded-md border border-border/50 bg-background px-1.5 py-0.5 text-[10px] font-medium text-primary transition-colors hover:bg-primary/10"
                          >
                            <ImageIcon className="h-2.5 w-2.5" />
                            View Image
                          </button>
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-center gap-0.5">
                      {/* EDIT (pen) — left of delete */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                              aria-label="Edit trade"
                              onClick={() => setEditTrade(t)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* DELETE */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                            aria-label="Delete trade"
                          >
                            {del.isPending && del.variables === t.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this trade?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t.side} · {t.result} · {fmtDate(t.tradeAt)}{' '}
                              {fmtTime(t.tradeAt)} — this cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(t.id)}
                              className="bg-rose-500 text-white hover:bg-rose-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
