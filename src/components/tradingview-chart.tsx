'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'

interface TradingViewChartProps {
  symbol?: string
  interval?: string
  height?: number | string
  className?: string
}

/**
 * TradingView Advanced Chart (web-component embed).
 * Loads the official tv-advanced-chart.js module and renders the
 * <tv-advanced-chart> custom element with XAUUSD as default symbol.
 */
export function TradingViewChart({
  symbol = 'OANDA:XAUUSD',
  interval = '5',
  height = 560,
  className,
}: TradingViewChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const widgetRef = React.useRef<HTMLElement | null>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Load the TradingView widget script once.
  React.useEffect(() => {
    if (!containerRef.current) return

    const existing = document.querySelector(
      'script[src="https://widgets.tradingview-widget.com/w/en/tv-advanced-chart.js"]'
    )

    const createWidget = () => {
      if (!containerRef.current) return
      // Clear any previous widget (e.g. when theme changes we recreate)
      containerRef.current.innerHTML = ''

      const el = document.createElement('tv-advanced-chart') as HTMLElement
      el.setAttribute('symbol', symbol)
      el.setAttribute('interval', interval)
      el.setAttribute('allow-symbol-change', 'true')
      el.setAttribute('hide-side-toolbar', 'false')
      el.setAttribute('hide-top-toolbar', 'false')
      el.setAttribute(
        'theme',
        mounted && resolvedTheme === 'light' ? 'light' : 'dark'
      )
      el.setAttribute('details', 'false')
      el.setAttribute('hotlist', 'false')
      el.setAttribute('calendar', 'false')
      el.style.width = '100%'
      el.style.height = '100%'
      el.style.display = 'block'

      containerRef.current.appendChild(el)
      widgetRef.current = el
    }

    if (existing) {
      createWidget()
    } else {
      const script = document.createElement('script')
      script.src =
        'https://widgets.tradingview-widget.com/w/en/tv-advanced-chart.js'
      script.type = 'module'
      script.async = true
      script.onload = createWidget
      document.head.appendChild(script)
    }

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, interval, resolvedTheme, mounted])

  return (
    <div
      className={className}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div
        ref={containerRef}
        className="h-full w-full rounded-xl overflow-hidden"
        style={{ minHeight: 320 }}
      />
    </div>
  )
}
