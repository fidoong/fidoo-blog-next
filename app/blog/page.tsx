import { Suspense } from 'react'
import { BlogContent } from './blog-content'
import { getCategories } from '@/lib/actions/categories'
import { Card, CardContent } from '@/components/ui/card'

interface BlogPageProps {
  searchParams: Promise<{
    category?: string
  }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const categories = await getCategories()

  return (
    <div className="page-container">
      <Suspense fallback={<BlogSkeleton />}>
        <BlogContent
          category={params.category}
          categories={categories}
        />
      </Suspense>
    </div>
  )
}

function BlogSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-20 w-full bg-muted rounded animate-pulse" />
                <div className="flex gap-4">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
  )
}
