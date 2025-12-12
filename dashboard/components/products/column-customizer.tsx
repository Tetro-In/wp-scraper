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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ALL_COLUMNS,
  ColumnKey,
  DEFAULT_VISIBLE_COLUMNS,
} from './filter-controls/filter-types'

interface ColumnCustomizerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visibleColumns: ColumnKey[]
  onColumnsChange: (columns: ColumnKey[]) => void
}

export function ColumnCustomizer({
  open,
  onOpenChange,
  visibleColumns,
  onColumnsChange,
}: ColumnCustomizerProps) {
  // Local state for editing
  const [localColumns, setLocalColumns] = useState<Set<ColumnKey>>(
    new Set(visibleColumns)
  )

  // Sync local state when prop changes or sheet opens
  useEffect(() => {
    if (open) {
      setLocalColumns(new Set(visibleColumns))
    }
  }, [open, visibleColumns])

  const handleApply = () => {
    // Maintain order from ALL_COLUMNS
    const orderedColumns = ALL_COLUMNS
      .filter((col) => localColumns.has(col.key))
      .map((col) => col.key)
    onColumnsChange(orderedColumns)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setLocalColumns(new Set(visibleColumns))
    onOpenChange(false)
  }

  const handleReset = () => {
    setLocalColumns(new Set(DEFAULT_VISIBLE_COLUMNS))
  }

  const handleSelectAll = () => {
    setLocalColumns(new Set(ALL_COLUMNS.map((col) => col.key)))
  }

  const handleDeselectAll = () => {
    setLocalColumns(new Set())
  }

  const toggleColumn = (key: ColumnKey) => {
    setLocalColumns((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  // Group columns
  const basicColumns = ALL_COLUMNS.filter((col) => col.group === 'basic')
  const deviceColumns = ALL_COLUMNS.filter((col) => col.group === 'device')
  const metadataColumns = ALL_COLUMNS.filter((col) => col.group === 'metadata')

  const renderColumnGroup = (
    title: string,
    columns: typeof ALL_COLUMNS
  ) => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="space-y-2">
        {columns.map((column) => (
          <div key={column.key} className="flex items-center space-x-2">
            <Checkbox
              id={column.key}
              checked={localColumns.has(column.key)}
              onCheckedChange={() => toggleColumn(column.key)}
            />
            <Label
              htmlFor={column.key}
              className="text-sm font-normal cursor-pointer"
            >
              {column.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[350px] sm:max-w-[350px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Customize Columns</SheetTitle>
          <SheetDescription>
            Select which columns to display in the table
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-2 py-3">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeselectAll}>
            Deselect All
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </div>

        <Separator />

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {renderColumnGroup('Basic Information', basicColumns)}
            <Separator />
            {renderColumnGroup('Device Details', deviceColumns)}
            <Separator />
            {renderColumnGroup('Metadata', metadataColumns)}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleApply}
            disabled={localColumns.size === 0}
          >
            Apply ({localColumns.size} columns)
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
