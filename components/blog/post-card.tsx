'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Eye, Heart } from 'lucide-react'
import type { PostSummary } from '@/types/models'

interface PostCardProps {
  post: PostSummary
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {post.category?.name && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {post.category.name}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag.id} className="mr-1.5">
                    #{tag.name}
                  </span>
                ))}
              </span>
            </div>
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1">
                {post.title}
              </h2>
            </Link>
            {post.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={post.author.avatar || ''} />
                  <AvatarFallback className="text-[10px]">
                    {post.author.name?.[0] ||
                      post.author.username?.[0] ||
                      'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {post.author.name || post.author.username}
                </span>
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(post.createdAt).toLocaleDateString('zh-CN')}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.views}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {post.likesCount}
              </span>
            </div>
          </div>
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-24 h-16 object-cover rounded-md hidden sm:block flex-shrink-0"
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
