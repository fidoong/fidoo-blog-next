import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function LoadingState({
  message = '加载中...',
  size = 'md',
  className,
}: LoadingStateProps) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <Loader2
        className={cn(
          'animate-spin text-muted-foreground mr-3',
          sizeMap[size]
        )}
      />
      <span className="text-muted-foreground">{message}</span>
    </div>
  )
}
