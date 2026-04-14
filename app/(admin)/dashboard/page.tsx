import { Suspense } from 'react'
import { DashboardContent } from './dashboard-content'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-10 w-40 bg-muted rounded animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-4 w-24 bg-muted rounded animate-pulse mb-4" />
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full bg-muted rounded animate-pulse mb-4" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
