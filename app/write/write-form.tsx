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
  Settings,
  ImageIcon,
  Hash,
  Sparkles,
  X,
  Link as LinkIcon,
  Tags,
  Eye,
  Save,
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
    }, 30000)

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
  const published = form.watch('published')
  const coverImage = form.watch('coverImage')

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="flex-none h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 lg:px-6 relative z-50">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div className="h-5 w-px bg-border" />
          <span className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-md">
            {title || '无标题'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-muted-foreground hidden lg:inline mr-2">
              已保存 {lastSaved.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={saveDraft}
            disabled={isDraftSaving}
            className="gap-1.5"
          >
            {isDraftSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">保存</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="gap-1.5 lg:hidden"
          >
            <Settings className="h-4 w-4" />
            设置
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
            size="sm"
            className="gap-1.5"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            发布
          </Button>
        </div>
      </header>

      {/* 主体内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧编辑区 - 占满剩余空间 */}
        <main className="flex-1 flex flex-col min-w-0 isolate">
          {/* 标题和元信息 */}
          <div className="flex-none px-6 lg:px-10 py-4 border-b bg-muted/20 relative z-0">
            <Input
              placeholder="输入文章标题..."
              className="border-0 bg-transparent text-2xl lg:text-3xl font-bold placeholder:text-muted-foreground/30 focus-visible:ring-0 px-0 h-auto py-1"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
            <Textarea
              placeholder="添加摘要（可选）..."
              className="border-0 bg-transparent resize-none placeholder:text-muted-foreground/30 focus-visible:ring-0 px-0 min-h-[40px] text-sm text-muted-foreground mt-1"
              {...form.register('excerpt')}
            />
          </div>

          {/* 编辑器 - 占满剩余空间 */}
          <div className="flex-1 overflow-hidden">
            <MarkdownEditor
              initialValue={content}
              onChange={setContent}
            />
          </div>
        </main>

        {/* 右侧设置面板 */}
        <aside
          className={cn(
            'fixed inset-y-0 right-0 z-40 w-80 bg-background border-l shadow-xl transform transition-transform duration-300 lg:static lg:transform-none lg:shadow-none lg:z-auto lg:w-72 xl:w-80',
            showSettings ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          )}
        >
          {/* 移动端关闭按钮 */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b">
            <span className="font-medium">文章设置</span>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-full overflow-y-auto p-5 space-y-6">
            {/* 发布状态 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Eye className="h-4 w-4 text-muted-foreground" />
                发布设置
              </h3>
              <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    {published ? '立即发布' : '保存为草稿'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {published ? '文章将对所有人可见' : '仅自己可见'}
                  </p>
                </div>
                <Switch
                  checked={published}
                  onCheckedChange={(checked) =>
                    form.setValue('published', checked)
                  }
                />
              </div>
            </div>

            {/* 分类 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                分类
              </h3>
              <select
                value={form.watch('categoryId')}
                onChange={(e) => form.setValue('categoryId', e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Tags className="h-4 w-4 text-muted-foreground" />
                标签
              </h3>
              <div className="flex flex-wrap gap-1.5">
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
                        'px-2.5 py-1 rounded-md text-xs transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      )}
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* URL 设置 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                文章链接
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="article-slug"
                  className="h-9 text-sm"
                  {...form.register('slug')}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={generateSlug}
                  className="shrink-0 h-9 px-3"
                >
                  生成
                </Button>
              </div>
            </div>

            {/* 封面图 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                封面图
              </h3>
              <Input
                placeholder="https://..."
                className="h-9 text-sm"
                {...form.register('coverImage')}
              />
              {coverImage && (
                <div className="aspect-video rounded-lg border bg-muted overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
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
            <div className="pt-4 border-t">
              <div className="flex items-center gap-3">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || ''}
                    className="h-9 w-9 rounded-full"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {user.name?.[0] || 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.name || '匿名用户'}</p>
                  <p className="text-xs text-muted-foreground">作者</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 移动端遮罩 */}
        {showSettings && (
          <div
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  )
}
