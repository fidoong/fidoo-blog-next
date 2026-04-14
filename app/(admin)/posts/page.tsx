import { Suspense } from 'react'
import { PostsContent } from './posts-content'

export default function PostsPage() {
  return (
    <Suspense fallback={<PostsSkeleton />}>
      <PostsContent />
    </Suspense>
  )
}

function PostsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-10 w-40 bg-muted rounded animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>

      <div className="border rounded-lg">
        <div className="p-4">
          <div className="h-8 w-full bg-muted rounded animate-pulse mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full bg-muted rounded animate-pulse mb-2" />
          ))}
        </div>
      </div>
    </div>
  )
}
