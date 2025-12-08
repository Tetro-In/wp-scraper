import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description: string
  searchValue: string
  onSearchChange: (value: string) => void
  resultCount?: number
  totalCount?: number
}

export function PageHeader({
  title,
  description,
  searchValue,
  onSearchChange,
  resultCount,
  totalCount,
}: PageHeaderProps) {
  const showCounts =
    typeof resultCount === 'number' && typeof totalCount === 'number'

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>
      <div className="space-y-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        {showCounts && (
          <p className="text-sm text-muted-foreground">
            Showing {resultCount} of {totalCount} items
          </p>
        )}
      </div>
    </div>
  )
}

