'use client'

import { Hero } from '@/components/sections/hero'
import { ChartSection } from '@/components/sections/chart'
import { AnalysisSection } from '@/components/sections/analysis'
import { StrategySection } from '@/components/sections/strategy'
import { LiveResultsSection } from '@/components/sections/live-results'
import { PineScriptSection } from '@/components/sections/pine-script'

export function ResearchView() {
  return (
    <>
      <Hero />
      <ChartSection />
      <AnalysisSection />
      <StrategySection />
      <LiveResultsSection />
      <PineScriptSection />
    </>
  )
}
