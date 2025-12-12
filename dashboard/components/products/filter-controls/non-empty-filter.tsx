'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { NON_EMPTY_FILTERABLE_COLUMNS, NonEmptyFilterableColumn } from './filter-types'

interface NonEmptyFilterProps {
  selected: NonEmptyFilterableColumn[]
  onChange: (selected: NonEmptyFilterableColumn[]) => void
}

export function NonEmptyFilter({ selected, onChange }: NonEmptyFilterProps) {
  const handleToggle = (key: NonEmptyFilterableColumn) => {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key))
    } else {
      onChange([...selected, key])
    }
  }

  const handleSelectAll = () => {
    onChange(NON_EMPTY_FILTERABLE_COLUMNS.map((col) => col.key))
  }

  const handleClear = () => {
    onChange([])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Show Only Non-Empty</label>
        {selected.length > 0 && (
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

      <p className="text-xs text-muted-foreground">
        Filter to show only products with data in selected columns
      </p>

      <div className="flex gap-2 mb-2">
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleSelectAll}>
          Select All
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleClear}>
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {NON_EMPTY_FILTERABLE_COLUMNS.map((column) => (
          <div key={column.key} className="flex items-center space-x-2">
            <Checkbox
              id={`nonempty-${column.key}`}
              checked={selected.includes(column.key)}
              onCheckedChange={() => handleToggle(column.key)}
            />
            <Label
              htmlFor={`nonempty-${column.key}`}
              className="text-sm font-normal cursor-pointer"
            >
              {column.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
