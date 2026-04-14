import Link from 'next/link'
import { getPosts } from '@/lib/actions/posts'
import { getCategories } from '@/lib/actions/categories'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Calendar, Eye, Heart } from 'lucide-react'

interface BlogContentProps {
  searchParams: { page?: string; category?: string }
}

export async function BlogContent({ searchParams }: BlogContentProps) {
  const page = parseInt(searchParams.page || '1')
  const category = searchParams.category

  const [{ posts, totalPages }, categories] = await Promise.all([
    getPosts({ page, limit: 10, category }),
    getCategories(),
  ])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">文章列表</h1>
          {category && (
            <Badge variant="secondary">
              {categories.find((c) => c.id === category)?.name}
            </Badge>
          )}
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              暂无文章
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {(post.category as { name?: string })?.name ?? '-'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag.id} className="mr-2">
                              #{tag.name}
                            </span>
                          ))}
                        </span>
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-xl font-semibold hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                      </Link>
                      {post.excerpt && (
                        <p className="text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={(post.author as { avatar?: string })?.avatar || ''} />
                            <AvatarFallback>
                              {(post.author as { name?: string })?.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {(post.author as { name?: string })?.name || (post.author as { username?: string })?.username}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likesCount}
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
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/blog?page=${p}${category ? `&category=${category}` : ''}`}
              >
                <Button
                  variant={p === page ? 'default' : 'outline'}
                  size="sm"
                >
                  {p}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">分类</h3>
            <div className="flex flex-wrap gap-2">
              <Link href="/blog">
                <Button
                  variant={!category ? 'secondary' : 'ghost'}
                  size="sm"
                >
                  全部
                </Button>
              </Link>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/blog?category=${cat.id}`}>
                  <Button
                    variant={category === cat.id ? 'secondary' : 'ghost'}
                    size="sm"
                  >
                    {cat.name}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
