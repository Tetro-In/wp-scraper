'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table2, Grid3x3 } from 'lucide-react'

interface ViewToggleProps {
  value: 'table' | 'cards'
  onValueChange: (value: 'table' | 'cards') => void
}

export function ViewToggle({ value, onValueChange }: ViewToggleProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => onValueChange((nextValue as 'table' | 'cards') ?? 'table')}
    >
      <TabsList>
        <TabsTrigger value="table">
          <Table2 className="mr-2 h-4 w-4" />
          Table
        </TabsTrigger>
        <TabsTrigger value="cards">
          <Grid3x3 className="mr-2 h-4 w-4" />
          Cards
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

