'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  // 侧边栏状态
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // 搜索对话框
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void

  // 阅读偏好
  fontSize: 'sm' | 'md' | 'lg'
  setFontSize: (size: 'sm' | 'md' | 'lg') => void

  // 编辑器状态
  editorMode: 'default' | 'vim' | 'emacs'
  setEditorMode: (mode: 'default' | 'vim' | 'emacs') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),

      fontSize: 'md',
      setFontSize: (size) => set({ fontSize: size }),

      editorMode: 'default',
      setEditorMode: (mode) => set({ editorMode: mode }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ fontSize: state.fontSize, editorMode: state.editorMode }),
    }
  )
)
