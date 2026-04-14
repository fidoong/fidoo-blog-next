'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { navConfig } from '@/config/nav'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Tag,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useUIStore } from '@/lib/stores/ui-store'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Tag,
  Users,
  Settings,
}

interface AdminSidebarProps {
  user: {
    role: string
  }
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar } = useUIStore()

  const filteredNav = navConfig.admin.filter((item) => {
    if (item.href === '/users' || item.href === '/settings') {
      return user.role === 'ADMIN'
    }
    if (item.href === '/comments') {
      return ['MODERATOR', 'ADMIN'].includes(user.role)
    }
    return true
  })

  return (
    <aside
      className={cn(
        'relative border-r bg-background transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="absolute -right-3 top-4 h-6 w-6 rounded-full border bg-background"
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </Button>

      <nav className="flex flex-col gap-2 p-4">
        {filteredNav.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard
          const isActive = pathname.startsWith(item.href)

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  !sidebarOpen && 'justify-center px-2'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span className="ml-2">{item.title}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
