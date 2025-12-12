'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { SavedView } from '@/hooks/use-saved-views'
import { ChevronDown, FolderOpen, Plus, Star, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface SavedViewsDropdownProps {
  views: SavedView[]
  currentViewId: string | null
  onSelectView: (view: SavedView) => void
  onSaveNewView: () => void
  onDeleteView: (id: string) => Promise<boolean>
  onSetDefaultView: (id: string) => Promise<boolean>
  isLoading?: boolean
}

export function SavedViewsDropdown({
  views,
  currentViewId,
  onSelectView,
  onSaveNewView,
  onDeleteView,
  onSetDefaultView,
  isLoading,
}: SavedViewsDropdownProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewToDelete, setViewToDelete] = useState<SavedView | null>(null)

  const handleDeleteClick = (e: React.MouseEvent, view: SavedView) => {
    e.stopPropagation()
    setViewToDelete(view)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (viewToDelete) {
      await onDeleteView(viewToDelete.id)
      setViewToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleSetDefault = async (e: React.MouseEvent, view: SavedView) => {
    e.stopPropagation()
    await onSetDefaultView(view.id)
  }

  const currentView = views.find((v) => v.id === currentViewId)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            {currentView ? currentView.name : 'Saved Views'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[250px]">
          <DropdownMenuLabel>Saved Views</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">Loading...</div>
          ) : views.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No saved views yet
            </div>
          ) : (
            <DropdownMenuRadioGroup
              value={currentViewId || ''}
              onValueChange={(value) => {
                const view = views.find((v) => v.id === value)
                if (view) onSelectView(view)
              }}
            >
              {views.map((view) => (
                <DropdownMenuRadioItem
                  key={view.id}
                  value={view.id}
                  className="flex items-center justify-between pr-2"
                >
                  <div className="flex items-center gap-2">
                    {view.isDefault && (
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    )}
                    <span className="truncate max-w-[140px]">{view.name}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {!view.isDefault && (
                      <button
                        className="p-1 hover:bg-accent rounded"
                        onClick={(e) => handleSetDefault(e, view)}
                        title="Set as default"
                      >
                        <Star className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      className="p-1 hover:bg-accent rounded text-destructive"
                      onClick={(e) => handleDeleteClick(e, view)}
                      title="Delete view"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSaveNewView}>
            <Plus className="h-4 w-4 mr-2" />
            Save current view...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete saved view?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{viewToDelete?.name}&rdquo;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
