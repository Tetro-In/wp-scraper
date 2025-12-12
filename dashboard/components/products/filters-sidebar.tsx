'use client'

import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MultiSelectFilter,
  RangeFilterControl,
  TimespanFilter,
  NonEmptyFilter,
  ProductFilters,
  DEFAULT_FILTERS,
  FilterOptions,
  hasActiveFilters,
} from './filter-controls'

interface FiltersSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  filterOptions: FilterOptions | null
}

export function FiltersSidebar({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  filterOptions,
}: FiltersSidebarProps) {
  // Local state for editing (to allow cancel)
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters)

  // Sync local filters when prop changes or sheet opens
  useEffect(() => {
    if (open) {
      setLocalFilters(filters)
    }
  }, [open, filters])

  const handleApply = () => {
    onFiltersChange(localFilters)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setLocalFilters(filters)
    onOpenChange(false)
  }

  const handleClearAll = () => {
    setLocalFilters(DEFAULT_FILTERS)
  }

  const updateFilter = <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  const modelOptions = (filterOptions?.models || []).map((m) => ({
    value: m,
    label: m,
  }))

  const colorOptions = (filterOptions?.colors || []).map((c) => ({
    value: c,
    label: c,
  }))

  const warrantyOptions = (filterOptions?.warranties || []).map((w) => ({
    value: w,
    label: w,
  }))

  const sellerOptions = (filterOptions?.sellers || []).map((s) => ({
    value: s.phone,
    label: s.name || s.phone,
  }))

  const priceRange = filterOptions?.priceRange || { min: 0, max: 200000 }
  const storageRange = filterOptions?.storageRange || { min: 0, max: 1024 }
  const batteryRange = filterOptions?.batteryRange || { min: 0, max: 100 }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:max-w-[400px] flex flex-col">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            {hasActiveFilters(localFilters) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-muted-foreground"
              >
                Clear All
              </Button>
            )}
          </div>
          <SheetDescription>
            Filter products by various criteria
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Active Products Filter */}
            <TimespanFilter
              label="Active Products"
              value={localFilters.activeInDays}
              onChange={(value) => updateFilter('activeInDays', value)}
            />

            <Separator />

            {/* Non-Empty Columns Filter */}
            <NonEmptyFilter
              selected={localFilters.nonEmptyColumns}
              onChange={(value) => updateFilter('nonEmptyColumns', value)}
            />

            <Separator />

            {/* Model Filter */}
            <MultiSelectFilter
              label="Model"
              options={modelOptions}
              selected={localFilters.models}
              onChange={(value) => updateFilter('models', value)}
              placeholder="All models"
              searchPlaceholder="Search models..."
            />

            <Separator />

            {/* Price Range Filter */}
            <RangeFilterControl
              label="Price Range"
              min={priceRange.min}
              max={priceRange.max}
              step={1000}
              value={localFilters.priceRange}
              onChange={(value) => updateFilter('priceRange', value)}
              formatValue={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />

            <Separator />

            {/* Storage Range Filter */}
            <RangeFilterControl
              label="Storage (GB)"
              min={storageRange.min}
              max={storageRange.max}
              step={8}
              value={localFilters.storageRange}
              onChange={(value) => updateFilter('storageRange', value)}
              unit=" GB"
            />

            <Separator />

            {/* Battery Health Filter */}
            <RangeFilterControl
              label="Battery Health (%)"
              min={batteryRange.min}
              max={batteryRange.max}
              step={1}
              value={localFilters.batteryRange}
              onChange={(value) => updateFilter('batteryRange', value)}
              unit="%"
            />

            <Separator />

            {/* Color Filter */}
            <MultiSelectFilter
              label="Color"
              options={colorOptions}
              selected={localFilters.colors}
              onChange={(value) => updateFilter('colors', value)}
              placeholder="All colors"
              searchPlaceholder="Search colors..."
            />

            <Separator />

            {/* Warranty Filter */}
            <MultiSelectFilter
              label="Warranty"
              options={warrantyOptions}
              selected={localFilters.warranties}
              onChange={(value) => updateFilter('warranties', value)}
              placeholder="All warranties"
              searchPlaceholder="Search warranties..."
            />

            <Separator />

            {/* Seller Filter */}
            <MultiSelectFilter
              label="Seller"
              options={sellerOptions}
              selected={localFilters.sellers}
              onChange={(value) => updateFilter('sellers', value)}
              placeholder="All sellers"
              searchPlaceholder="Search sellers..."
            />
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={handleCancel}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
