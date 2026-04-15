import { PostCardSkeleton } from '@/components/shared/skeletons'
import { Card, CardContent } from '@/components/ui/card'

export default function BlogLoading() {
  return (
    <div className="page-container">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <div className="h-10 w-48 bg-muted rounded animate-pulse" />
          <PostCardSkeleton count={3} />
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="h-6 w-16 bg-muted rounded animate-pulse mb-4" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-16 bg-muted rounded animate-pulse"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
