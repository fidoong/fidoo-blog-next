'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { postFormSchema } from '@/types/forms'
import { createPost } from '@/lib/actions/posts'
import { MarkdownEditor } from '@/components/editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

import { Category, Tag } from '@/lib/db'
import { toast } from 'sonner'
import {
  Loader2,
  ChevronLeft,
  Eye,
  Settings,
  ImageIcon,
  Hash,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WriteFormProps {
  categories: Category[]
  allTags: Tag[]
  user: {
    name?: string | null
    image?: string | null
  }
}

export function WriteForm({ categories, allTags, user }: WriteFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [content, setContent] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDraftSaving, setIsDraftSaving] = useState(false)

  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImage: '',
      published: false,
      categoryId: '',
      tagIds: [],
    },
  })

  // 自动保存草稿到 localStorage
  useEffect(() => {
    const saved = localStorage.getItem('write-draft')
    if (saved) {
      try {
        const draft = JSON.parse(saved)
        form.reset(draft)
        setContent(draft.content || '')
        toast.info('已恢复上次草稿')
      } catch {
        // ignore
      }
    }
  }, [form])

  // 自动保存
  useEffect(() => {
    const interval = setInterval(() => {
      const values = form.getValues()
      if (values.title || content) {
        localStorage.setItem(
          'write-draft',
          JSON.stringify({ ...values, content })
        )
        setLastSaved(new Date())
      }
    }, 30000) // 30秒自动保存

    return () => clearInterval(interval)
  }, [form, content])

  const generateSlug = useCallback(() => {
    const title = form.getValues('title')
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50)
      form.setValue('slug', slug)
    }
  }, [form])

  const onSubmit = async (values: z.infer<typeof postFormSchema>) => {
    startTransition(async () => {
      try {
        await createPost({ ...values, content })
        localStorage.removeItem('write-draft')
        toast.success('文章发布成功！')
        router.push('/dashboard')
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '发布失败')
      }
    })
  }

  const saveDraft = async () => {
    setIsDraftSaving(true)
    const values = form.getValues()
    localStorage.setItem('write-draft', JSON.stringify({ ...values, content }))
    setTimeout(() => {
      setIsDraftSaving(false)
      setLastSaved(new Date())
      toast.success('草稿已保存')
    }, 500)
  }

  const title = form.watch('title')
  const selectedTagIds = form.watch('tagIds') || []

  return (
    <div className="flex flex-col min-h-screen">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">返回</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {title || '无标题'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-muted-foreground hidden md:inline">
                草稿已保存 {lastSaved.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={saveDraft}
              disabled={isDraftSaving}
            >
              {isDraftSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                '保存草稿'
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className={cn(showSettings && 'bg-muted')}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isPending}
              size="sm"
              className="gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              发布
            </Button>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧编辑区 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full px-4 py-6 lg:px-8">
              {/* 标题输入 */}
              <div className="mb-4">
                <Input
                  placeholder="输入文章标题..."
                  className="border-0 bg-transparent text-4xl font-bold placeholder:text-muted-foreground/40 focus-visible:ring-0 px-0 h-auto py-2"
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive mt-2">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* 摘要输入 */}
              <div className="mb-6">
                <Textarea
                  placeholder="添加文章摘要（可选，用于列表展示）..."
                  className="border-0 bg-transparent resize-none placeholder:text-muted-foreground/40 focus-visible:ring-0 px-0 min-h-[50px] text-base text-muted-foreground"
                  {...form.register('excerpt')}
                />
              </div>

              {/* 正文编辑器 - 占满剩余空间 */}
              <div className="min-h-[600px]">
                <MarkdownEditor
                  initialValue={content}
                  onChange={setContent}
                />
              </div>
              
              {/* 底部留白 */}
              <div className="h-20" />
            </div>
          </div>
        </main>

        {/* 右侧设置面板 */}
        <aside
          className={cn(
            'w-80 border-l bg-muted/30 transition-all duration-300 overflow-y-auto',
            showSettings ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-80 hidden lg:block'
          )}
        >
          <div className="p-6 space-y-6">
            {/* 发布设置 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                发布设置
              </h3>
              <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">立即发布</p>
                  <p className="text-xs text-muted-foreground">
                    关闭则为草稿状态
                  </p>
                </div>
                <Switch
                  checked={form.watch('published')}
                  onCheckedChange={(checked) =>
                    form.setValue('published', checked)
                  }
                />
              </div>
            </div>

            {/* URL 设置 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">链接设置</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="article-slug"
                    className="flex-1"
                    {...form.register('slug')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateSlug}
                    className="shrink-0"
                  >
                    生成
                  </Button>
                </div>
                {form.formState.errors.slug && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            {/* 分类 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-4 w-4" />
                分类
              </h3>
              <select
                value={form.watch('categoryId')}
                onChange={(e) => form.setValue('categoryId', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">选择分类</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.categoryId && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            {/* 标签 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">标签</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        const newValue = isSelected
                          ? selectedTagIds.filter((id) => id !== tag.id)
                          : [...selectedTagIds, tag.id]
                        form.setValue('tagIds', newValue)
                      }}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs transition-colors border',
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:border-muted-foreground'
                      )}
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 封面图 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                封面图
              </h3>
              <Input
                placeholder="https://example.com/image.jpg"
                {...form.register('coverImage')}
              />
              {form.watch('coverImage') && (
                <div className="aspect-video rounded-lg border bg-muted overflow-hidden">
                  <img
                    src={form.watch('coverImage')}
                    alt="封面预览"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* 作者信息 */}
            <div className="pt-6 border-t">
              <div className="flex items-center gap-3">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || ''}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {user.name?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{user.name || '匿名用户'}</p>
                  <p className="text-xs text-muted-foreground">作者</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
