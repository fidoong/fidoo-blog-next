import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTagBySlug } from '@/lib/actions/tags'
import { getPostsByTagSlug } from '@/lib/actions/posts'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Eye, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TagPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params
  const tag = await getTagBySlug(slug)

  if (!tag) {
    return { title: '标签未找到' }
  }

  return {
    title: `${tag.name} | Fidoo Blog`,
    description: `浏览所有关于 ${tag.name} 的文章`,
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params
  const tag = await getTagBySlug(slug)

  if (!tag) {
    notFound()
  }

  const { posts, total } = await getPostsByTagSlug(slug)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/tags">
          <Button variant="ghost" className="mb-6 -ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回标签列表
          </Button>
        </Link>

        {/* Tag Header */}
        <div className="mb-8">
          <Badge className="text-lg px-4 py-1 mb-4">#{tag.name}</Badge>
          {tag.description && (
            <p className="text-muted-foreground">{tag.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            共 {total} 篇文章
          </p>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">该标签下暂无文章</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-muted-foreground line-clamp-2 mb-4">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={(post.author as { avatar?: string })?.avatar || ''} />
                              <AvatarFallback className="text-xs">
                                {(post.author as { name?: string })?.name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span>{(post.author as { name?: string })?.name || (post.author as { username?: string })?.username}</span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.views}
                          </span>
                        </div>
                      </div>
                      {post.coverImage && (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-32 h-24 object-cover rounded-lg hidden sm:block"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
