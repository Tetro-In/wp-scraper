'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductFilters, ColumnKey, countActiveFilters } from './filter-controls/filter-types'

interface SaveViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: {
    name: string
    description?: string
    isDefault: boolean
  }) => Promise<void>
  currentConfig: {
    filters: ProductFilters
    columns: ColumnKey[]
    sortKey: string | null
    sortDir: 'asc' | 'desc' | null
  }
}

export function SaveViewDialog({
  open,
  onOpenChange,
  onSave,
  currentConfig,
}: SaveViewDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return

    setIsSaving(true)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        isDefault,
      })
      // Reset form
      setName('')
      setDescription('')
      setIsDefault(false)
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  const activeFiltersCount = countActiveFilters(currentConfig.filters)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save View</DialogTitle>
          <DialogDescription>
            Save your current filters and column settings as a reusable view.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., High-value iPhones"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., iPhone 14+ with good battery"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked as boolean)}
            />
            <Label htmlFor="isDefault" className="font-normal cursor-pointer">
              Set as default view
            </Label>
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
            <p className="font-medium">This view includes:</p>
            <ul className="text-muted-foreground space-y-0.5">
              <li>• {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied</li>
              <li>• {currentConfig.columns.length} column{currentConfig.columns.length !== 1 ? 's' : ''} selected</li>
              {currentConfig.sortKey && (
                <li>
                  • Sorted by {currentConfig.sortKey} ({currentConfig.sortDir})
                </li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save View'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
