import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostBySlug } from '@/lib/actions/posts'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, Eye, Heart, Clock, Share2 } from 'lucide-react'
import { EditorPreview } from '@/components/editor'

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return { title: '文章未找到' }
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <article>
            {/* Header */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{(post.category as { name?: string })?.name ?? '-'}</Badge>
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/tags/${tag.slug}`}>
                    <Badge variant="outline">#{tag.name}</Badge>
                  </Link>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold">{post.title}</h1>

              {post.excerpt && (
                <p className="text-lg text-muted-foreground">{post.excerpt}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={(post.author as { avatar?: string })?.avatar || ''} />
                    <AvatarFallback>
                      {(post.author as { name?: string })?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">
                    {(post.author as { name?: string })?.name || (post.author as { username?: string })?.username}
                  </span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString('zh-CN')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.views} 阅读
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readingTime} 分钟
                </span>
              </div>

              {/* Cover Image */}
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              )}
            </div>

            <Separator className="my-8" />

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <EditorPreview content={post.content} />
            </div>

            <Separator className="my-8" />

            {/* Footer Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="mr-2 h-4 w-4" />
                  {post.likesCount}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  分享
                </Button>
              </div>
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={(post.author as { avatar?: string })?.avatar || ''} />
                  <AvatarFallback>
                    {(post.author as { name?: string })?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {(post.author as { name?: string })?.name || (post.author as { username?: string })?.username}
                  </h3>
                  {(post.author as { bio?: string })?.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {(post.author as { bio?: string }).bio}
                    </p>
                  )}
                </div>
              </div>
              <Button className="w-full" variant="outline">
                关注作者
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
