import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PageLayoutProps {
  title?: string
  description?: string
  actions?: ReactNode
  sidebar?: ReactNode
  children: ReactNode
  className?: string
}

export function PageLayout({
  title,
  description,
  actions,
  sidebar,
  children,
  className,
}: PageLayoutProps) {
  return (
    <div className={cn('container mx-auto py-8 px-4', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {(title || description || actions) && (
            <div className="flex items-center justify-between">
              <div>
                {title && <h1 className="text-3xl font-bold">{title}</h1>}
                {description && (
                  <p className="text-muted-foreground mt-2">{description}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </div>
        {sidebar && <aside className="space-y-6">{sidebar}</aside>}
      </div>
    </div>
  )
}
