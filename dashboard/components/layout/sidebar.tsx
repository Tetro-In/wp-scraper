'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users,
  Package,
  History,
  FileText,
  BarChart3,
  LayoutDashboard,
  Settings,
  KeyRound
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Sellers', href: '/sellers', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'History', href: '/product-history', icon: History },
  { name: 'Logs', href: '/scan-logs', icon: FileText },
  { name: 'Metrics', href: '/metrics', icon: BarChart3 },
  { name: 'Auth', href: '/auth', icon: KeyRound },
  { name: 'Settings', href: '/preferences', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-20 flex-col border-r bg-background">
      <div className="flex h-14 items-center justify-center border-b">
        <LayoutDashboard className="h-6 w-6" />
      </div>
      <nav className="flex-1 flex flex-col items-center gap-1 px-2 py-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-full py-2 px-1 rounded-md text-xs font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] leading-tight">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

