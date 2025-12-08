import { NextRequest, NextResponse } from 'next/server'
import { scraperService } from '@/lib/scraper-service'

export async function GET() {
  try {
    const config = await scraperService.getSchedulerConfig()
    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get scheduler config' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { enabled, cronExpr } = body

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled must be a boolean' },
        { status: 400 }
      )
    }

    if (typeof cronExpr !== 'string' || !cronExpr.trim()) {
      return NextResponse.json(
        { error: 'cronExpr must be a non-empty string' },
        { status: 400 }
      )
    }

    await scraperService.updateSchedulerConfig(enabled, cronExpr)
    const config = await scraperService.getSchedulerConfig()

    return NextResponse.json({
      success: true,
      config,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update scheduler config' },
      { status: 500 }
    )
  }
}
