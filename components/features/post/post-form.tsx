'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { postFormSchema } from '@/types/forms'
import { MarkdownEditor } from '@/components/editor'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { Category, Tag } from '@/types/models'
import { Loader2 } from 'lucide-react'
import { useCreatePost, useUpdatePost } from '@/lib/hooks/use-post-mutations'

interface PostFormProps {
  post?: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    coverImage: string | null
    published: boolean
    categoryId: string
    tags: Tag[]
  }
  categories: Category[]
  allTags: Tag[]
}

export function PostForm({ post, categories, allTags }: PostFormProps) {
  const router = useRouter()
  const [content, setContent] = useState(post?.content || '')
  const createMutation = useCreatePost()
  const updateMutation = useUpdatePost(post?.id || '')

  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      excerpt: post?.excerpt || '',
      content: post?.content || '',
      coverImage: post?.coverImage || '',
      published: post?.published || false,
      categoryId: post?.categoryId || '',
      tagIds: post?.tags?.map((t) => t.id) || [],
    },
  })

  const onSubmit = async (values: z.infer<typeof postFormSchema>) => {
    const data = { ...values, content } as z.infer<typeof postFormSchema>
    if (post) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const generateSlug = () => {
    const title = form.getValues('title')
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50)
      form.setValue('slug', slug)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>标题</FormLabel>
                <FormControl>
                  <Input placeholder="文章标题" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  Slug
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateSlug}
                  >
                    自动生成
                  </Button>
                </FormLabel>
                <FormControl>
                  <Input placeholder="article-slug" {...field} />
                </FormControl>
                <FormDescription>
                  URL 友好的标识符，只包含小写字母、数字和连字符
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>摘要</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="文章摘要，用于列表展示..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>可选，如果不填写将自动从正文提取</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>封面图</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/image.jpg"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>分类</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="">选择分类</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">立即发布</FormLabel>
                  <FormDescription>
                    关闭则为草稿状态，仅自己可见
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tagIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标签</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {allTags.map((tag) => {
                  const isSelected = field.value?.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        const newValue = isSelected
                          ? field.value?.filter((id) => id !== tag.id) || []
                          : [...(field.value || []), tag.id]
                        field.onChange(newValue)
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
              <FormDescription>点击选择标签，可多选</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>正文内容</FormLabel>
          <div className="mt-2 border rounded-lg overflow-hidden">
            <MarkdownEditor
              initialValue={content}
              onChange={setContent}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            取消
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {post ? '更新文章' : '创建文章'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
