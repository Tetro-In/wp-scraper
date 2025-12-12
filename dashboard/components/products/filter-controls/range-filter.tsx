'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RangeFilterValue } from './filter-types'

interface RangeFilterProps {
  label: string
  min: number
  max: number
  step?: number
  value: RangeFilterValue
  onChange: (value: RangeFilterValue) => void
  formatValue?: (value: number) => string
  unit?: string
}

export function RangeFilterControl({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (v) => String(v),
  unit = '',
}: RangeFilterProps) {
  // Local state for slider (to avoid too many updates)
  const [localValue, setLocalValue] = useState<number[]>([
    value.min ?? min,
    value.max ?? max,
  ])

  // Sync local value when prop changes
  useEffect(() => {
    setLocalValue([value.min ?? min, value.max ?? max])
  }, [value.min, value.max, min, max])

  const handleSliderChange = (newValue: number[]) => {
    setLocalValue(newValue)
  }

  const handleSliderCommit = (newValue: number[]) => {
    const newMin = newValue[0] === min ? null : newValue[0]
    const newMax = newValue[1] === max ? null : newValue[1]
    onChange({ min: newMin, max: newMax })
  }

  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? null : Number(e.target.value)
    if (val === null || (!isNaN(val) && val >= min && val <= (localValue[1] || max))) {
      onChange({ min: val, max: value.max })
    }
  }

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? null : Number(e.target.value)
    if (val === null || (!isNaN(val) && val <= max && val >= (localValue[0] || min))) {
      onChange({ min: value.min, max: val })
    }
  }

  const handleClear = () => {
    setLocalValue([min, max])
    onChange({ min: null, max: null })
  }

  const isActive = value.min !== null || value.max !== null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {isActive && (
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

      <Slider
        min={min}
        max={max}
        step={step}
        value={localValue}
        onValueChange={handleSliderChange}
        onValueCommit={handleSliderCommit}
        className="py-2"
      />

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            type="number"
            placeholder={`Min ${unit}`}
            value={value.min ?? ''}
            onChange={handleMinInput}
            min={min}
            max={localValue[1]}
            className="h-8 text-sm"
          />
        </div>
        <span className="text-muted-foreground">-</span>
        <div className="flex-1">
          <Input
            type="number"
            placeholder={`Max ${unit}`}
            value={value.max ?? ''}
            onChange={handleMaxInput}
            min={localValue[0]}
            max={max}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatValue(min)}{unit}</span>
        <span>{formatValue(max)}{unit}</span>
      </div>
    </div>
  )
}
