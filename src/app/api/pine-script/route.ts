import { NextRequest, NextResponse } from 'next/server'
import { pineScriptCode } from '@/lib/pine-script'

export async function GET(_req: NextRequest) {
  return new NextResponse(pineScriptCode, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition':
        'attachment; filename="xauusd_m5_golden_scalper.pine"',
    },
  })
}
