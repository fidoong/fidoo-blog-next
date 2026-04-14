export interface BlogComment {
  id: string
  content: string
  authorId: string
  postId: string
  parentId: string | null
  likesCount: number
  createdAt: Date
  author: {
    id: string
    username: string
    name: string | null
    avatar: string | null
  }
  replies?: BlogComment[]
}
