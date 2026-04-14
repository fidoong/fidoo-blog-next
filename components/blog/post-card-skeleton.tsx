import { Card, CardContent } from '@/components/ui/card'

interface PostCardSkeletonProps {
  count?: number
}

export function PostCardSkeleton({ count = 3 }: PostCardSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                {/* Category and tags */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                </div>

                {/* Title */}
                <div className="h-7 w-3/4 bg-muted rounded animate-pulse" />

                {/* Excerpt */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>

              {/* Cover image */}
              <div className="hidden sm:block">
                <div className="w-32 h-24 bg-muted rounded-lg animate-pulse" />
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
    <div className="space-y-4 mt-4">
      <PostCardSkeleton count={2} />
    </div>
  )
}
