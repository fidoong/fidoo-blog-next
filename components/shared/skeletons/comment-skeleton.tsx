import { Skeleton } from '@/components/ui/skeleton'

export interface CommentSkeletonProps {
  count?: number
}

export function CommentSkeleton({ count = 3 }: CommentSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </>
  )
}
