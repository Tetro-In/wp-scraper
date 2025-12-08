'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trash2, Clock, Play, Square, RefreshCw, Plus, X, AlertTriangle } from 'lucide-react'

interface SchedulerConfig {
  id: number
  enabled: boolean
  cronExpr: string
  updatedAt?: string
}

interface ScraperRun {
  id: number
  startedAt: string
  completedAt: string | null
  status: string
  triggerType: string
  errorMessage: string | null
  sellersProcessed: number
  productsScraped: number
}

// Convert cron expression to array of times (HH:MM format)
function cronToTimes(cronExpr: string): string[] {
  try {
    const parts = cronExpr.split(' ')
    if (parts.length !== 5) return ['09:00', '21:00']

    const minutes = parts[0]
    const hours = parts[1]

    // Parse hours (could be comma-separated like "9,21")
    const hourList = hours.split(',').map((h) => parseInt(h.trim()))
    const minute = parseInt(minutes) || 0

    return hourList.map((h) => {
      const hStr = h.toString().padStart(2, '0')
      const mStr = minute.toString().padStart(2, '0')
      return `${hStr}:${mStr}`
    })
  } catch {
    return ['09:00', '21:00']
  }
}

// Convert array of times to cron expression
function timesToCron(times: string[]): string {
  if (times.length === 0) return '0 9 * * *'

  // Parse times and group by minute
  const parsed = times.map((t) => {
    const [h, m] = t.split(':').map(Number)
    return { hour: h, minute: m }
  })

  // For simplicity, use the minute from the first time
  const minute = parsed[0]?.minute || 0
  const hours = parsed.map((p) => p.hour).sort((a, b) => a - b)

  return `${minute} ${hours.join(',')} * * *`
}

export default function PreferencesPage() {
  const [schedulerConfig, setSchedulerConfig] = useState<SchedulerConfig>({
    id: 1,
    enabled: false,
    cronExpr: '0 9,21 * * *',
  })
  const [scheduledTimes, setScheduledTimes] = useState<string[]>(['09:00', '21:00'])
  const [newTime, setNewTime] = useState('12:00')
  const [runs, setRuns] = useState<ScraperRun[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFlushing, setIsFlushing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [scraperStatus, setScraperStatus] = useState({ isRunning: false, currentRunId: null })
  const [showFlushDialog, setShowFlushDialog] = useState(false)
  const [flushConfirmText, setFlushConfirmText] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [configRes, runsRes, statusRes] = await Promise.all([
        fetch('/api/scheduler'),
        fetch('/api/scraper/runs'),
        fetch('/api/scraper/start'),
      ])

      if (configRes.ok) {
        const config = await configRes.json()
        setSchedulerConfig(config)
        setScheduledTimes(cronToTimes(config.cronExpr))
      }

      if (runsRes.ok) {
        const runsData = await runsRes.json()
        setRuns(runsData)
      }

      if (statusRes.ok) {
        const status = await statusRes.json()
        setScraperStatus(status)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFlushDatabase = async () => {
    if (flushConfirmText !== 'DELETE') return

    setIsFlushing(true)
    try {
      const res = await fetch('/api/preferences/flush', { method: 'POST' })
      if (res.ok) {
        setShowFlushDialog(false)
        setFlushConfirmText('')
        fetchData()
      } else {
        const data = await res.json()
        alert(`Error: ${data.error}`)
      }
    } catch {
      alert('Failed to flush database')
    } finally {
      setIsFlushing(false)
    }
  }

  const openFlushDialog = () => {
    setFlushConfirmText('')
    setShowFlushDialog(true)
  }

  const handleSaveScheduler = async () => {
    setIsSaving(true)
    try {
      const cronExpr = timesToCron(scheduledTimes)
      const res = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: schedulerConfig.enabled,
          cronExpr,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSchedulerConfig(data.config)
        alert('Scheduler configuration saved')
      } else {
        const data = await res.json()
        alert(`Error: ${data.error}`)
      }
    } catch {
      alert('Failed to save scheduler configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddTime = () => {
    if (!scheduledTimes.includes(newTime)) {
      const updated = [...scheduledTimes, newTime].sort()
      setScheduledTimes(updated)
    }
  }

  const handleRemoveTime = (time: string) => {
    setScheduledTimes(scheduledTimes.filter((t) => t !== time))
  }

  const handleStartScraper = async () => {
    try {
      const res = await fetch('/api/scraper/start', { method: 'POST' })
      if (res.ok) {
        fetchData()
      } else {
        const data = await res.json()
        alert(`Error: ${data.error}`)
      }
    } catch {
      alert('Failed to start scraper')
    }
  }

  const handleStopScraper = async () => {
    try {
      const res = await fetch('/api/scraper/start', { method: 'DELETE' })
      if (res.ok) {
        fetchData()
      }
    } catch {
      alert('Failed to stop scraper')
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800'
      case 'AUTH_REQUIRED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime12h = (time24: string) => {
    const [h, m] = time24.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`
  }

  if (isLoading) {
    return (
      <div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Preferences</h1>

      {/* Danger Zone - Flush Database */}
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-600 mb-4">
          Flush all data from the database. This will delete all sellers, products, history, and
          logs. This action cannot be undone.
        </p>
        <Button
          variant="destructive"
          onClick={openFlushDialog}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Flush Database
        </Button>
      </div>

      {/* Flush Confirmation Dialog */}
      <Dialog open={showFlushDialog} onOpenChange={setShowFlushDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Database Flush
            </DialogTitle>
            <DialogDescription className="pt-2">
              This will permanently delete all data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All sellers</li>
                <li>All products and product history</li>
                <li>All scan logs</li>
                <li>All scraper run history</li>
              </ul>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <p className="text-sm font-medium">
              Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded">DELETE</span> to
              confirm:
            </p>
            <Input
              value={flushConfirmText}
              onChange={(e) => setFlushConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="font-mono"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlushDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleFlushDatabase}
              disabled={flushConfirmText !== 'DELETE' || isFlushing}
            >
              {isFlushing ? 'Flushing...' : 'Flush All Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scheduler Configuration */}
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Scheduler Configuration
        </h2>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={schedulerConfig.enabled}
                onChange={(e) =>
                  setSchedulerConfig({ ...schedulerConfig, enabled: e.target.checked })
                }
                className="h-4 w-4"
              />
              <span>Enable Scheduler</span>
            </label>
          </div>

          {/* Scheduled Times */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Scheduled Run Times (daily):</label>

            {/* Current times */}
            <div className="flex flex-wrap gap-2">
              {scheduledTimes.length === 0 ? (
                <span className="text-sm text-muted-foreground">No times scheduled</span>
              ) : (
                scheduledTimes.map((time) => (
                  <div
                    key={time}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full text-sm"
                  >
                    <Clock className="h-3 w-3" />
                    <span>{formatTime12h(time)}</span>
                    <button
                      onClick={() => handleRemoveTime(time)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add new time */}
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTime}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Time
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              The scraper will run automatically at these times every day.
            </p>
          </div>

          <Button onClick={handleSaveScheduler} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      {/* Manual Scraper Control */}
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Manual Scraper Control</h2>

        <div className="flex items-center gap-4">
          {scraperStatus.isRunning ? (
            <>
              <span className="text-sm text-blue-600">
                Scraper running (Run #{scraperStatus.currentRunId})
              </span>
              <Button
                variant="destructive"
                onClick={handleStopScraper}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop Scraper
              </Button>
            </>
          ) : (
            <Button onClick={handleStartScraper} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start Scraper
            </Button>
          )}
          <Button variant="outline" onClick={fetchData} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Run History */}
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Scraper Run History</h2>

        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left py-2 px-3">Run ID</th>
                <th className="text-left py-2 px-3">Started At</th>
                <th className="text-left py-2 px-3">Completed At</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Trigger</th>
                <th className="text-left py-2 px-3">Sellers</th>
                <th className="text-left py-2 px-3">Products</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted-foreground">
                    No runs recorded yet
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-3">#{run.id}</td>
                    <td className="py-2 px-3">{new Date(run.startedAt).toLocaleString()}</td>
                    <td className="py-2 px-3">
                      {run.completedAt ? new Date(run.completedAt).toLocaleString() : '-'}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(run.status)}`}
                      >
                        {run.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">{run.triggerType}</td>
                    <td className="py-2 px-3">{run.sellersProcessed}</td>
                    <td className="py-2 px-3">{run.productsScraped}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
