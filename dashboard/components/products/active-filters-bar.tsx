'use client'

import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ProductFilters,
  DEFAULT_FILTERS,
  hasActiveFilters,
  ACTIVE_TIME_OPTIONS,
  NON_EMPTY_FILTERABLE_COLUMNS,
  NonEmptyFilterableColumn,
} from './filter-controls/filter-types'

interface ActiveFiltersBarProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  onSaveView?: () => void
}

export function ActiveFiltersBar({
  filters,
  onFiltersChange,
  onSaveView,
}: ActiveFiltersBarProps) {
  if (!hasActiveFilters(filters)) {
    return null
  }

  const removeFilter = <K extends keyof ProductFilters>(
    key: K,
    value?: string
  ) => {
    if (Array.isArray(filters[key]) && value) {
      // Remove single value from array
      onFiltersChange({
        ...filters,
        [key]: (filters[key] as string[]).filter((v) => v !== value),
      })
    } else if (key === 'priceRange' || key === 'storageRange' || key === 'batteryRange') {
      // Reset range filter
      onFiltersChange({
        ...filters,
        [key]: { min: null, max: null },
      })
    } else {
      // Reset to default
      onFiltersChange({
        ...filters,
        [key]: DEFAULT_FILTERS[key],
      })
    }
  }

  const clearAll = () => {
    onFiltersChange(DEFAULT_FILTERS)
  }

  const formatRange = (
    min: number | null,
    max: number | null,
    prefix = '',
    suffix = ''
  ) => {
    if (min !== null && max !== null) {
      return `${prefix}${min}${suffix} - ${prefix}${max}${suffix}`
    }
    if (min !== null) {
      return `≥ ${prefix}${min}${suffix}`
    }
    if (max !== null) {
      return `≤ ${prefix}${max}${suffix}`
    }
    return ''
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg">
      <span className="text-sm font-medium text-muted-foreground">
        Active filters:
      </span>

      {/* Active In Days */}
      {filters.activeInDays !== null && (
        <Badge variant="secondary" className="gap-1">
          Active: {ACTIVE_TIME_OPTIONS.find((o) => o.value === filters.activeInDays)?.label}
          <button
            className="ml-1 hover:bg-muted rounded-full"
            onClick={() => removeFilter('activeInDays')}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Models */}
      {filters.models.map((model) => (
        <Badge key={model} variant="secondary" className="gap-1">
          Model: {model}
          <button
            className="ml-1 hover:bg-muted rounded-full"
            onClick={() => removeFilter('models', model)}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Colors */}
      {filters.colors.map((color) => (
        <Badge key={color} variant="secondary" className="gap-1">
          Color: {color}
          <button
            className="ml-1 hover:bg-muted rounded-full"
            onClick={() => removeFilter('colors', color)}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Warranties */}
      {filters.warranties.map((warranty) => (
        <Badge key={warranty} variant="secondary" className="gap-1">
          Warranty: {warranty}
          <button
            className="ml-1 hover:bg-muted rounded-full"
            onClick={() => removeFilter('warranties', warranty)}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Sellers */}
      {filters.sellers.length > 0 && (
        <Badge variant="secondary" className="gap-1">
          Sellers: {filters.sellers.length}
          <button
            className="ml-1 hover:bg-muted rounded-full"
            onClick={() => removeFilter('sellers')}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Price Range */}
      {(filters.priceRange.min !== null || filters.priceRange.max !== null) && (
        <Badge variant="secondary" className="gap-1">
          Price: {formatRange(filters.priceRange.min, filters.priceRange.max, '₹')}
          <button
            className="ml-1 hover:bg-muted rounded-full"
            onClick={() => removeFilter('priceRange')}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Storage Range */}
      {(filters.storageRange.min !== null || filters.storageRange.max !== null) && (
        <Badge variant="secondary" className="gap-1">
          Storage: {formatRange(filters.storageRange.min, filters.storageRange.max, '', 'GB')}
          <button
            className="ml-1 hover:bg-muted rounded-full"
            onClick={() => removeFilter('storageRange')}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Battery Range */}
      {(filters.batteryRange.min !== null || filters.batteryRange.max !== null) && (
        <Badge variant="secondary" className="gap-1">
          Battery: {formatRange(filters.batteryRange.min, filters.batteryRange.max, '', '%')}
          <button
            className="ml-1 hover:bg-muted rounded-full"
            onClick={() => removeFilter('batteryRange')}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* isActive */}
      {filters.isActive !== null && (
        <Badge variant="secondary" className="gap-1">
          Status: {filters.isActive ? 'Active' : 'Inactive'}
          <button
            className="ml-1 hover:bg-muted rounded-full"
            onClick={() => removeFilter('isActive')}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Non-empty columns */}
      {filters.nonEmptyColumns.map((column) => {
        const columnLabel = NON_EMPTY_FILTERABLE_COLUMNS.find((c) => c.key === column)?.label || column
        return (
          <Badge key={column} variant="secondary" className="gap-1">
            Has: {columnLabel}
            <button
              className="ml-1 hover:bg-muted rounded-full"
              onClick={() => removeFilter('nonEmptyColumns', column)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )
      })}

      <div className="flex-1" />

      {onSaveView && (
        <Button variant="ghost" size="sm" onClick={onSaveView}>
          Save View
        </Button>
      )}

      <Button variant="ghost" size="sm" onClick={clearAll}>
        Clear All
      </Button>
    </div>
  )
}
