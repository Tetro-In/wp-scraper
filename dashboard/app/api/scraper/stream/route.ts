import { scraperService } from '@/lib/scraper-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', data: 'Stream connected', timestamp: new Date() })}\n\n`)
      )

      // Subscribe to scraper output
      const unsubscribe = scraperService.subscribe((output) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(output)}\n\n`))
        } catch {
          // Stream may be closed
        }
      })

      // Send current status
      const isRunning = scraperService.isRunning()
      const runId = scraperService.getCurrentRunId()
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: 'status',
            data: isRunning ? `Scraper running (Run #${runId})` : 'Scraper idle',
            timestamp: new Date(),
          })}\n\n`
        )
      )

      // Cleanup on close
      const cleanup = () => {
        unsubscribe()
      }

      // Handle abort
      return cleanup
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
