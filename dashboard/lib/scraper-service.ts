import { spawn, ChildProcess } from 'child_process'
import path from 'path'
import { prisma } from './prisma'
import * as cron from 'node-cron'

type ScraperStatus = 'RUNNING' | 'COMPLETED' | 'FAILED' | 'AUTH_REQUIRED'
type TriggerType = 'MANUAL' | 'SCHEDULED'

interface ScraperOutput {
  type: 'stdout' | 'stderr' | 'status' | 'complete'
  data: string
  timestamp: Date
}

type OutputCallback = (output: ScraperOutput) => void

class ScraperService {
  private currentProcess: ChildProcess | null = null
  private currentRunId: number | null = null
  private outputBuffer: string[] = []
  private listeners: Set<OutputCallback> = new Set()
  private scheduledTask: cron.ScheduledTask | null = null

  isRunning(): boolean {
    return this.currentProcess !== null
  }

  getCurrentRunId(): number | null {
    return this.currentRunId
  }

  subscribe(callback: OutputCallback): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private broadcast(output: ScraperOutput) {
    this.listeners.forEach((cb) => cb(output))
  }

  async startScraper(triggerType: TriggerType): Promise<{ runId: number; error?: string }> {
    if (this.isRunning()) {
      return { runId: -1, error: 'Scraper is already running' }
    }

    // Create a new run record
    const run = await prisma.scraperRun.create({
      data: {
        status: 'RUNNING',
        triggerType,
      },
    })

    this.currentRunId = run.id
    this.outputBuffer = []

    // Path to the scraper script
    const scraperPath = path.resolve(process.cwd(), '../gpt')

    this.broadcast({
      type: 'status',
      data: `Starting scraper (Run #${run.id})...`,
      timestamp: new Date(),
    })

    try {
      // Spawn the scraper process
      this.currentProcess = spawn('npm', ['start'], {
        cwd: scraperPath,
        shell: true,
        env: { ...process.env },
      })

      this.currentProcess.stdout?.on('data', (data: Buffer) => {
        const text = data.toString()
        this.outputBuffer.push(text)
        this.broadcast({
          type: 'stdout',
          data: text,
          timestamp: new Date(),
        })
      })

      this.currentProcess.stderr?.on('data', (data: Buffer) => {
        const text = data.toString()
        this.outputBuffer.push(`[ERROR] ${text}`)
        this.broadcast({
          type: 'stderr',
          data: text,
          timestamp: new Date(),
        })
      })

      this.currentProcess.on('close', async (code) => {
        const output = this.outputBuffer.join('')
        let status: ScraperStatus = code === 0 ? 'COMPLETED' : 'FAILED'

        // Check if auth was required
        if (output.includes('scan QR code') || output.includes('QR code')) {
          status = 'AUTH_REQUIRED'
        }

        // Parse stats from output
        const sellersMatch = output.match(/(\d+) seller\(s\)/)
        const productsMatch = output.match(/Saved (\d+) products/)

        await prisma.scraperRun.update({
          where: { id: run.id },
          data: {
            status,
            completedAt: new Date(),
            output,
            errorMessage: code !== 0 ? `Process exited with code ${code}` : null,
            sellersProcessed: sellersMatch ? parseInt(sellersMatch[1]) : 0,
            productsScraped: productsMatch ? parseInt(productsMatch[1]) : 0,
          },
        })

        this.broadcast({
          type: 'complete',
          data: `Scraper finished with status: ${status}`,
          timestamp: new Date(),
        })

        this.currentProcess = null
        this.currentRunId = null
      })

      this.currentProcess.on('error', async (error) => {
        await prisma.scraperRun.update({
          where: { id: run.id },
          data: {
            status: 'FAILED',
            completedAt: new Date(),
            output: this.outputBuffer.join(''),
            errorMessage: error.message,
          },
        })

        this.broadcast({
          type: 'stderr',
          data: `Process error: ${error.message}`,
          timestamp: new Date(),
        })

        this.currentProcess = null
        this.currentRunId = null
      })

      return { runId: run.id }
    } catch (error) {
      await prisma.scraperRun.update({
        where: { id: run.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      this.currentProcess = null
      this.currentRunId = null

      return { runId: run.id, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  stopScraper(): boolean {
    if (this.currentProcess) {
      this.currentProcess.kill('SIGTERM')
      return true
    }
    return false
  }

  async initScheduler() {
    try {
      // Get or create scheduler config
      let config = await prisma.schedulerConfig.findUnique({ where: { id: 1 } })

      if (!config) {
        config = await prisma.schedulerConfig.create({
          data: {
            id: 1,
            enabled: false,
            cronExpr: '0 9,21 * * *', // 9am and 9pm
          },
        })
      }

      if (config.enabled && cron.validate(config.cronExpr)) {
        this.startScheduler(config.cronExpr)
      }
    } catch (error) {
      // Database might not be initialized yet (during build or first run)
      console.log('Scheduler init skipped - database not ready:', (error as Error).message)
    }
  }

  startScheduler(cronExpr: string) {
    if (this.scheduledTask) {
      this.scheduledTask.stop()
    }

    if (!cron.validate(cronExpr)) {
      console.error('Invalid cron expression:', cronExpr)
      return
    }

    this.scheduledTask = cron.schedule(cronExpr, async () => {
      console.log('Scheduled scraper run starting...')
      await this.startScraper('SCHEDULED')
    })

    console.log(`Scheduler started with cron: ${cronExpr}`)
  }

  stopScheduler() {
    if (this.scheduledTask) {
      this.scheduledTask.stop()
      this.scheduledTask = null
    }
  }

  async updateSchedulerConfig(enabled: boolean, cronExpr: string) {
    await prisma.schedulerConfig.upsert({
      where: { id: 1 },
      update: { enabled, cronExpr },
      create: { id: 1, enabled, cronExpr },
    })

    if (enabled && cron.validate(cronExpr)) {
      this.startScheduler(cronExpr)
    } else {
      this.stopScheduler()
    }
  }

  async getSchedulerConfig() {
    try {
      const config = await prisma.schedulerConfig.findUnique({ where: { id: 1 } })
      return config || { id: 1, enabled: false, cronExpr: '0 9,21 * * *' }
    } catch {
      // Database might not be initialized yet
      return { id: 1, enabled: false, cronExpr: '0 9,21 * * *' }
    }
  }
}

// Singleton instance
export const scraperService = new ScraperService()

// Initialize scheduler on module load (server-side only)
if (typeof window === 'undefined') {
  scraperService.initScheduler().catch(console.error)
}
