'use client'

import { Button } from '@/components/ui/button'
import { ACTIVE_TIME_OPTIONS } from './filter-types'
import { cn } from '@/lib/utils'

interface TimespanFilterProps {
  label: string
  value: number | null
  onChange: (value: number | null) => void
}

export function TimespanFilter({ label, value, onChange }: TimespanFilterProps) {
  const handleClear = () => {
    onChange(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {value !== null && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {ACTIVE_TIME_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-8',
              value === option.value && 'bg-primary text-primary-foreground'
            )}
            onClick={() => onChange(value === option.value ? null : option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {value !== null && (
        <p className="text-xs text-muted-foreground">
          Showing products modified in the last {value} days
        </p>
      )}
    </div>
  )
}
