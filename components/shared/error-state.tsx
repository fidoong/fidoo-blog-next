import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { sizes } from '@/lib/constants'

export interface ErrorStateProps {
  error: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  return (
    <Card className={className}>
      <CardContent className="py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">出错了</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className={sizes.iconWithText} />
            重试
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
