'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Eye, Heart } from 'lucide-react'
import type { PostWithRelations } from '@/types/models'

interface PostCardProps {
  post: PostWithRelations
}

export function PostCard({ post }: PostCardProps) {
  const author = post.author as {
    id?: string
    username?: string
    name?: string
    avatar?: string
  }

  const category = post.category as { name?: string } | null

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {category?.name && (
                <Badge variant="secondary">{category.name}</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag.id} className="mr-2">
                    #{tag.name}
                  </span>
                ))}
              </span>
            </div>
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-xl font-semibold hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h2>
            </Link>
            {post.excerpt && (
              <p className="text-muted-foreground line-clamp-2">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 pt-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={author?.avatar || ''} />
                  <AvatarFallback>
                    {author?.name?.[0] ||
                      author?.username?.[0] ||
                      'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {author?.name || author?.username}
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
              className="w-32 h-24 object-cover rounded-lg hidden sm:block flex-shrink-0"
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
