'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Loader2 } from 'lucide-react'
import { useCommentForm } from '@/lib/hooks/use-comment-form'

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
  const { form, isPending, onSubmit } = useCommentForm({
    postId,
    parentId,
    onSuccess,
  })

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
