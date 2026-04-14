'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { requirePermission } from '@/lib/auth/server-permissions'
import { Permission } from '@/lib/auth/rbac'
import { categoryFormSchema } from '@/types/forms'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// 获取所有分类
export async function getCategories() {
  return db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
  })
}

// 获取分类详情
export async function getCategoryBySlug(slug: string) {
  return db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  })
}

// 创建分类
export async function createCategory(data: z.infer<typeof categoryFormSchema>) {
  await requirePermission(Permission.SETTINGS_UPDATE)
  const validated = categoryFormSchema.parse(data)

  const existing = await db.query.categories.findFirst({
    where: eq(categories.slug, validated.slug),
  })

  if (existing) {
    throw new Error('Slug already exists')
  }

  const [category] = await db.insert(categories).values(validated).returning()

  revalidatePath('/blog')
  return category
}

// 更新分类
export async function updateCategory(
  categoryId: string,
  data: z.infer<typeof categoryFormSchema>
) {
  await requirePermission(Permission.SETTINGS_UPDATE)
  const validated = categoryFormSchema.parse(data)

  const [category] = await db
    .update(categories)
    .set(validated)
    .where(eq(categories.id, categoryId))
    .returning()

  revalidatePath('/blog')
  return category
}

// 删除分类
export async function deleteCategory(categoryId: string) {
  await requirePermission(Permission.SETTINGS_UPDATE)
  await db.delete(categories).where(eq(categories.id, categoryId))

  revalidatePath('/blog')
  return { success: true }
}
