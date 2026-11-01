'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Download, FileCode2, Terminal } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { pineScriptCode } from '@/lib/pine-script'

export function PineScriptSection() {
  const { toast } = useToast()
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pineScriptCode)
      setCopied(true)
      toast({
        title: 'Copied to clipboard',
        description: 'Paste it into the TradingView Pine Editor.',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Use the Download button instead.',
        variant: 'destructive',
      })
    }
  }

  return (
    <section
      id="pine"
      className="border-y border-border/40 bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-3 border-primary/40 text-primary">
              <FileCode2 className="mr-1.5 h-3 w-3" />
              Pine Script v5 · Indicator
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Copy the Indicator Code
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This plots EMAs, the pullback band, session shading, LONG / SHORT
              labels, SL + TP lines and a live dashboard — all from the rules above.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCopy} variant="default">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy code
                </>
              )}
            </Button>
            <Button asChild variant="outline">
              <a href="/api/pine-script" download>
                <Download className="mr-2 h-4 w-4" />
                Download .pine
              </a>
            </Button>
          </div>
        </div>

        {/* How to install */}
        <Card className="mb-6 border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">How to install in TradingView</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              {[
                { n: 1, t: 'Open Pine Editor', d: 'Bottom panel of any TradingView chart.' },
                { n: 2, t: 'Paste the code', d: 'Replace the default template entirely.' },
                { n: 3, t: 'Click "Add to chart"', d: 'Compile is automatic for v5.' },
                { n: 4, t: 'Switch to M5 + OANDA:XAUUSD', d: 'Tune inputs in the indicator settings.' },
              ].map((s) => (
                <li
                  key={s.n}
                  className="rounded-lg border border-border/50 bg-background/40 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary ring-1 ring-primary/30">
                      {s.n}
                    </span>
                    <span className="font-medium">{s.t}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{s.d}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Code block */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-xl border border-border/60 bg-[#1e1e1e]"
        >
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="ml-2 font-mono text-xs text-white/70">
                xauusd_m5_golden_scalper.pine
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wide text-white/40">
              pine v5
            </span>
          </div>
          <div
            className="code-scroll max-h-[32rem] overflow-auto"
            style={{ fontSize: '12.5px', lineHeight: '1.6' }}
          >
            <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              showLineNumbers
              wrapLongLines={false}
              customStyle={{
                margin: 0,
                background: 'transparent',
                padding: '16px 20px',
              }}
            >
              {pineScriptCode}
            </SyntaxHighlighter>
          </div>
        </motion.div>

        <p className="mt-4 text-xs text-muted-foreground">
          Note: Pine Script does not have an official Pine language highlighter in
          common libraries, so syntax is shown with a JavaScript-like highlighter.
          The code itself is valid Pine v5 and compiles in TradingView.
        </p>
      </div>
    </section>
  )
}
