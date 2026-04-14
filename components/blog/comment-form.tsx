'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { commentFormSchema } from '@/types/forms'
import { createComment } from '@/lib/actions/comments'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface CommentFormProps {
  postId: string
  parentId?: string
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
}

export function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = '写下你的评论...',
}: CommentFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: '',
      parentId,
    },
  })

  const onSubmit = async (values: z.infer<typeof commentFormSchema>) => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder={placeholder}
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              取消
            </Button>
          )}
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {parentId ? '回复' : '发布评论'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
