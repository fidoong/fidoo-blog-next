'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { tags, postsToTags } from '@/lib/db/schema'
import { requirePermission } from '@/lib/auth/server-permissions'
import { Permission } from '@/lib/auth/rbac'
import { tagFormSchema } from '@/types/forms'
import { eq, ilike, desc, count } from 'drizzle-orm'
import { z } from 'zod'

// 获取所有标签
export async function getTags() {
  return db.query.tags.findMany({
    orderBy: (tags, { asc }) => [asc(tags.name)],
  })
}

// 获取热门标签
export async function getPopularTags(limit = 20) {
  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      postCount: count(postsToTags.postId),
    })
    .from(tags)
    .leftJoin(postsToTags, eq(tags.id, postsToTags.tagId))
    .groupBy(tags.id, tags.name, tags.slug)
    .orderBy(desc(count(postsToTags.postId)))
    .limit(limit)

  return result
}

// 搜索标签
export async function searchTags(query: string, limit = 10) {
  return db.query.tags.findMany({
    where: ilike(tags.name, `%${query}%`),
    limit,
  })
}

// 获取标签详情
export async function getTagBySlug(slug: string) {
  return db.query.tags.findFirst({
    where: eq(tags.slug, slug),
  })
}

// 创建标签
export async function createTag(data: z.infer<typeof tagFormSchema>) {
  await requirePermission(Permission.SETTINGS_UPDATE)
  const validated = tagFormSchema.parse(data)

  const existing = await db.query.tags.findFirst({
    where: eq(tags.slug, validated.slug),
  })

  if (existing) {
    throw new Error('Slug already exists')
  }

  const [tag] = await db.insert(tags).values(validated).returning()

  revalidatePath('/tags')
  return tag
}

// 更新标签
export async function updateTag(
  tagId: string,
  data: z.infer<typeof tagFormSchema>
) {
  await requirePermission(Permission.SETTINGS_UPDATE)
  const validated = tagFormSchema.parse(data)

  const [tag] = await db
    .update(tags)
    .set(validated)
    .where(eq(tags.id, tagId))
    .returning()

  revalidatePath('/tags')
  return tag
}

// 删除标签
export async function deleteTag(tagId: string) {
  await requirePermission(Permission.SETTINGS_UPDATE)
  await db.delete(tags).where(eq(tags.id, tagId))

  revalidatePath('/tags')
  return { success: true }
}
