'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserPrefs {
  // 阅读历史
  readingHistory: string[]
  addToHistory: (postId: string) => void
  clearHistory: () => void

  // 收藏
  bookmarkedPosts: string[]
  toggleBookmark: (postId: string) => void
  isBookmarked: (postId: string) => boolean

  // 关注
  followedUsers: string[]
  toggleFollow: (userId: string) => void
  isFollowing: (userId: string) => boolean
}

export const useUserPrefs = create<UserPrefs>()(
  persist(
    (set, get) => ({
      readingHistory: [],
      addToHistory: (postId) => {
        const { readingHistory } = get()
        const newHistory = [
          postId,
          ...readingHistory.filter((id) => id !== postId),
        ].slice(0, 50)
        set({ readingHistory: newHistory })
      },
      clearHistory: () => set({ readingHistory: [] }),

      bookmarkedPosts: [],
      toggleBookmark: (postId) => {
        const { bookmarkedPosts } = get()
        const isBookmarked = bookmarkedPosts.includes(postId)
        if (isBookmarked) {
          set({
            bookmarkedPosts: bookmarkedPosts.filter((id) => id !== postId),
          })
        } else {
          set({ bookmarkedPosts: [...bookmarkedPosts, postId] })
        }
      },
      isBookmarked: (postId) => get().bookmarkedPosts.includes(postId),

      followedUsers: [],
      toggleFollow: (userId) => {
        const { followedUsers } = get()
        const isFollowing = followedUsers.includes(userId)
        if (isFollowing) {
          set({
            followedUsers: followedUsers.filter((id) => id !== userId),
          })
        } else {
          set({ followedUsers: [...followedUsers, userId] })
        }
      },
      isFollowing: (userId) => get().followedUsers.includes(userId),
    }),
    { name: 'user-prefs' }
  )
)
