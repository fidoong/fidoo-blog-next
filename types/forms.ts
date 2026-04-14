import { z } from 'zod'

// ============================================
// 文章表单 Schema
// ============================================

export const postFormSchema = z.object({
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(200, '标题最多200字符'),

  slug: z
    .string()
    .min(1, 'Slug 不能为空')
    .max(200, 'Slug 最多200字符')
    .regex(
      /^[a-z0-9-]+$/,
      '只能使用小写字母、数字和连字符'
    ),

  excerpt: z
    .string()
    .max(500, '摘要最多500字符')
    .optional()
    .or(z.literal('')),

  content: z
    .string()
    .min(1, '内容不能为空')
    .max(50000, '内容最多50000字符'),

  coverImage: z
    .string()
    .url('请输入有效的图片 URL')
    .optional()
    .or(z.literal('')),

  published: z.boolean(),

  categoryId: z
    .string()
    .uuid('请选择分类'),

  tagIds: z.array(z.string().uuid())
})

export type PostFormData = z.infer<typeof postFormSchema>

// ============================================
// 评论表单 Schema
// ============================================

export const commentFormSchema = z.object({
  content: z
    .string()
    .min(1, '评论内容不能为空')
    .max(2000, '评论最多2000字符'),
  parentId: z.string().uuid().optional(),
})

export type CommentFormData = z.infer<typeof commentFormSchema>

// ============================================
// 用户资料表单
// ============================================

export const profileFormSchema = z.object({
  name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  github: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
})

export type ProfileFormData = z.infer<typeof profileFormSchema>

// ============================================
// 登录/注册表单
// ============================================

export const loginFormSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
})

export type LoginFormData = z.infer<typeof loginFormSchema>

export const registerFormSchema = z
  .object({
    username: z
      .string()
      .min(3, '用户名至少3位')
      .max(20, '用户名最多20位')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        '只能使用字母、数字、下划线和连字符'
      ),
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码至少6位'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerFormSchema>

// ============================================
// 分类/标签表单
// ============================================

export const categoryFormSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(100),
  slug: z
    .string()
    .min(1, 'Slug 不能为空')
    .regex(/^[a-z0-9-]+$/, '只能使用小写字母、数字和连字符'),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  sortOrder: z.number().default(0),
})

export type CategoryFormData = z.infer<typeof categoryFormSchema>

export const tagFormSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(50),
  slug: z
    .string()
    .min(1, 'Slug 不能为空')
    .regex(/^[a-z0-9-]+$/, '只能使用小写字母、数字和连字符'),
  description: z.string().max(500).optional(),
})

export type TagFormData = z.infer<typeof tagFormSchema>
