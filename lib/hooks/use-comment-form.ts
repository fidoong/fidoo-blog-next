'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { commentFormSchema } from '@/types/forms'
import { createComment } from '@/lib/actions/comments'
import { toast } from 'sonner'

interface UseCommentFormOptions {
  postId: string
  parentId?: string
  onSuccess?: () => void
}

interface UseCommentFormReturn {
  form: ReturnType<typeof useForm<z.infer<typeof commentFormSchema>>>
  isPending: boolean
  onSubmit: (values: z.infer<typeof commentFormSchema>) => void
}

/**
 * 评论表单逻辑 Hook
 */
export function useCommentForm(
  options: UseCommentFormOptions
): UseCommentFormReturn {
  const { postId, parentId, onSuccess } = options

  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: '',
      parentId,
    },
  })

  const onSubmit = (values: z.infer<typeof commentFormSchema>) => {
    startTransition(async () => {
      try {
        await createComment(postId, values)
        toast.success(parentId ? '回复成功' : '评论成功')
        form.reset()
        onSuccess?.()
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          toast.error('请先登录后再评论')
        } else {
          toast.error('发布失败，请重试')
        }
      }
    })
  }

  return {
    form,
    isPending,
    onSubmit,
  }
}
