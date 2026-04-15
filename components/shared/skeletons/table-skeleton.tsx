import { Skeleton } from '@/components/ui/skeleton'

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="border rounded-lg">
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton
                key={j}
                className={`h-4 ${j === 0 ? 'w-1/4' : 'flex-1'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
