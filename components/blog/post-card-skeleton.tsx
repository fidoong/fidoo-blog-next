import { Card, CardContent } from '@/components/ui/card'

interface PostCardSkeletonProps {
  count?: number
}

export function PostCardSkeleton({ count = 3 }: PostCardSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-2">
                {/* Category and tags */}
                <div className="flex items-center gap-2">
                  <div className="h-4 w-14 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                </div>

                {/* Title */}
                <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />

                {/* Excerpt */}
                <div className="h-3.5 w-full bg-muted rounded animate-pulse" />

                {/* Meta info */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-14 bg-muted rounded animate-pulse" />
                </div>
              </div>

              {/* Cover image */}
              <div className="hidden sm:block">
                <div className="w-24 h-16 bg-muted rounded-md animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function LoadMoreSkeleton() {
  return (
    <div className="space-y-3 mt-3">
      <PostCardSkeleton count={2} />
    </div>
  )
}
