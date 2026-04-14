'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createPost, updatePost, deletePost } from '@/lib/actions/posts'
import type { PostFormData } from '@/types/forms'

/**
 * 创建文章 Mutation
 */
export function useCreatePost() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('文章创建成功')
      router.push(`/blog/${post.slug}`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '创建失败')
    },
  })
}

/**
 * 更新文章 Mutation
 */
export function useUpdatePost(postId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: PostFormData) => updatePost(postId, data),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('文章更新成功')
      router.push(`/blog/${post.slug}`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '更新失败')
    },
  })
}

/**
 * 删除文章 Mutation
 */
export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('文章删除成功')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '删除失败')
    },
  })
}
