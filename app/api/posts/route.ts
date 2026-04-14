import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { and, eq, desc, ilike, count } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const category = searchParams.get('category') || undefined
  const search = searchParams.get('search') || undefined

  const offset = (page - 1) * limit

  try {
    const postsList = await db.query.posts.findMany({
      where: (posts, { and, eq, ilike }) => {
        const conditions = [eq(posts.published, true)]

        if (search) {
          conditions.push(ilike(posts.title, `%${search}%`))
        }

        if (category) {
          conditions.push(eq(posts.categoryId, category))
        }

        return and(...conditions)
      },
      with: {
        author: {
          columns: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
        tags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: desc(posts.createdAt),
      limit,
      offset,
    })

    // 转换标签格式
    const formattedPosts = postsList.map((post) => ({
      ...post,
      tags: post.tags.map((pt) => pt.tag),
    }))

    // 获取总数
    const [totalResult] = await db
      .select({ count: count() })
      .from(posts)
      .where(
        and(
          eq(posts.published, true),
          search ? ilike(posts.title, `%${search}%`) : undefined,
          category ? eq(posts.categoryId, category) : undefined
        )
      )

    return NextResponse.json({
      posts: formattedPosts,
      total: totalResult.count,
      totalPages: Math.ceil(totalResult.count / limit),
      page,
      hasMore: page * limit < totalResult.count,
    })
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
