'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { postFormSchema } from '@/types/forms'
import { useAutosave, restoreAutosaved } from './use-autosave'
import { useFormSlug } from './use-form-slug'
import { useCreatePost, useUpdatePost } from './use-post-mutations'
import { toast } from 'sonner'
import type { PostWithRelations } from '@/types/models'

interface UsePostFormOptions {
  post?: PostWithRelations
  autosave?: boolean
  autosaveKey?: string
}

interface UsePostFormReturn {
  form: ReturnType<typeof useForm<z.infer<typeof postFormSchema>>>
  content: string
  setContent: (content: string) => void
  isPending: boolean
  lastSaved: Date | null
  generateSlug: () => void
  handleSubmit: () => void
  forceSave: () => void
  restoreDraft: () => void
  clearDraft: () => void
}

/**
 * 文章表单逻辑 Hook
 * 统一处理表单状态、自动保存、Slug 生成、提交等逻辑
 */
export function usePostForm(options: UsePostFormOptions = {}): UsePostFormReturn {
  const { post, autosave = false, autosaveKey = 'post-draft' } = options

  const [content, setContent] = useState(post?.content || '')
  const hasRestoredRef = useRef(false)

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
      categoryId: post?.category?.id || '',
      tagIds: post?.tags?.map((t) => t.id) || [],
    },
  })

  const { lastSaved, forceSave, clearSaved } = useAutosave({
    enabled: autosave && !post,
    data: { ...form.watch(), content },
    key: autosaveKey,
    interval: 30000,
  })

  const { generateSlug } = useFormSlug({
    form,
    sourceField: 'title',
    targetField: 'slug',
  })

  const restoreDraft = () => {
    const draft = restoreAutosaved<z.infer<typeof postFormSchema>>(autosaveKey)
    if (draft) {
      form.reset(draft)
      setContent(draft.content || '')
      toast.info('已恢复上次草稿')
    }
  }

  const clearDraft = () => {
    clearSaved()
    toast.success('草稿已清除')
  }

  const handleSubmit = form.handleSubmit((data) => {
    const formData = { ...data, content } as z.infer<typeof postFormSchema>
    if (post) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
      clearSaved()
    }
  })

  useEffect(() => {
    if (hasRestoredRef.current) return
    if (autosave && !post) {
      restoreDraft()
      hasRestoredRef.current = true
    }
  }, [autosave, post])

  return {
    form,
    content,
    setContent,
    isPending,
    lastSaved,
    generateSlug,
    handleSubmit,
    forceSave,
    restoreDraft,
    clearDraft,
  }
}
