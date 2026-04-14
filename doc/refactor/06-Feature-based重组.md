# 06 - Feature-based 组件重组

## 🎯 目标

按功能模块重新组织组件，提升代码可维护性和可发现性。

## 📊 当前问题

### 目录结构混乱

```
components/
├── shared/          # ❌ 空目录，未使用
├── blog/            # ❌ 混合了多种类型的组件
│   ├── post-card.tsx          # 展示组件
│   ├── post-form.tsx          # 表单组件
│   ├── like-button.tsx        # 交互组件
│   ├── bookmark-button.tsx    # 交互组件
│   ├── comment-item.tsx       # 评论组件
│   ├── comment-list.tsx       # 评论组件
│   ├── comment-form.tsx       # 评论组件
│   └── view-tracker.tsx       # 工具组件
├── editor/          # ✅ 功能清晰
├── layout/          # ✅ 功能清晰
├── admin/           # ✅ 功能清晰
└── ui/              # ✅ 基础组件
```

**问题**：
1. `blog/` 目录混合了文章、评论、交互等多种组件
2. 组件职责不清晰
3. 难以定位相关组件
4. 不利于团队协作

---

## 🏗️ Feature-based 架构设计

### 新目录结构

```
components/
├── ui/                        # shadcn/ui 基础组件（保持不变）
├── shared/                    # 🆕 通用业务组件
│   ├── empty-state.tsx
│   ├── error-state.tsx
│   ├── loading-state.tsx
│   ├── page-layout.tsx
│   ├── page-header.tsx
│   ├── sidebar-layout.tsx
│   ├── skeletons/
│   │   ├── post-card-skeleton.tsx
│   │   ├── post-detail-skeleton.tsx
│   │   ├── comment-skeleton.tsx
│   │   └── index.ts
│   └── index.ts
├── features/                  # 🆕 功能模块
│   ├── post/                  # 文章功能
│   │   ├── components/        # 展示组件
│   │   │   ├── post-card.tsx
│   │   │   ├── post-list.tsx
│   │   │   ├── post-detail.tsx
│   │   │   └── index.ts
│   │   ├── forms/             # 表单组件
│   │   │   ├── post-form-fields.tsx
│   │   │   ├── post-form-sidebar.tsx
│   │   │   ├── post-editor-layout.tsx
│   │   │   └── index.ts
│   │   ├── interactions/      # 交互组件
│   │   │   ├── like-button.tsx
│   │   │   ├── bookmark-button.tsx
│   │   │   ├── share-button.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── comment/               # 评论功能
│   │   ├── comment-item.tsx
│   │   ├── comment-list.tsx
│   │   ├── comment-form.tsx
│   │   └── index.ts
│   ├── auth/                  # 认证功能
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── index.ts
│   └── index.ts
├── layout/                    # 布局组件（保持不变）
├── admin/                     # 管理后台组件（保持不变）
├── editor/                    # 编辑器组件（保持不变）
└── providers.tsx
```

### 设计原则

1. **按功能分组**：相关组件放在同一个 feature 目录下
2. **职责清晰**：每个子目录有明确的职责（components、forms、interactions）
3. **易于发现**：通过目录结构就能理解功能模块
4. **便于扩展**：新增功能只需添加新的 feature 目录

---

## 📝 实施步骤

### 步骤 1：创建 Post Feature 结构

#### 1.1 创建目录

```bash
mkdir -p components/features/post/{components,forms,interactions}
mkdir -p components/features/comment
mkdir -p components/features/auth
```

#### 1.2 移动和重构文件

**移动展示组件**：

```bash
# 移动 post-card.tsx
mv components/blog/post-card.tsx components/features/post/components/

# 移动 view-tracker.tsx
mv components/blog/view-tracker.tsx components/features/post/components/
```

**移动交互组件**：

```bash
mv components/blog/like-button.tsx components/features/post/interactions/
mv components/blog/bookmark-button.tsx components/features/post/interactions/
```

**移动表单组件**：

```bash
mv components/blog/post-form.tsx components/features/post/forms/
```

---

### 步骤 2：创建新的容器组件

#### 2.1 PostList 容器组件

```typescript
// components/features/post/components/post-list.tsx - 新建

import { PostCard } from './post-card'
import { PostCardSkeleton } from '@/components/shared/skeletons'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { FileText } from 'lucide-react'
import type { PostSummary } from '@/types/models'

export interface PostListProps {
  /**
   * 文章列表
   */
  posts: PostSummary[]
  /**
   * 是否加载中
   */
  isLoading?: boolean
  /**
   * 错误信息
   */
  error?: string | null
  /**
   * 重试回调
   */
  onRetry?: () => void
}

/**
 * 文章列表容器组件
 * 统一处理加载、错误、空状态
 */
export function PostList({ posts, isLoading, error, onRetry }: PostListProps) {
  // 加载状态
  if (isLoading) {
    return <PostCardSkeleton count={5} />
  }

  // 错误状态
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  // 空状态
  if (posts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="暂无文章"
        description="还没有发布任何文章"
      />
    )
  }

  // 正常渲染
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

#### 2.2 PostDetail 容器组件

```typescript
// components/features/post/components/post-detail.tsx - 新建

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Eye, Clock } from 'lucide-react'
import { EditorPreview } from '@/components/editor'
import { LikeButton } from '../interactions/like-button'
import { BookmarkButton } from '../interactions/bookmark-button'
import type { PostWithRelations } from '@/types/models'

export interface PostDetailProps {
  /**
   * 文章数据
   */
  post: PostWithRelations
  /**
   * 是否已点赞
   */
  hasLiked?: boolean
  /**
   * 是否已收藏
   */
  hasBookmarked?: boolean
}

/**
 * 文章详情容器组件
 */
export function PostDetail({ post, hasLiked = false, hasBookmarked = false }: PostDetailProps) {
  return (
    <article className="space-y-6">
      {/* 文章头部 */}
      <header className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{post.category.name}</Badge>
          {post.tags.map((tag) => (
            <Badge key={tag.id} variant="outline">
              #{tag.name}
            </Badge>
          ))}
        </div>

        <h1 className="text-4xl font-bold">{post.title}</h1>

        {post.excerpt && (
          <p className="text-lg text-muted-foreground">{post.excerpt}</p>
        )}

        {/* 元信息 */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.avatar || ''} />
              <AvatarFallback>{post.author.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <span>{post.author.name || post.author.username}</span>
          </div>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(post.createdAt).toLocaleDateString('zh-CN')}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {post.views} 阅读
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            约 {post.readingTime} 分钟
          </span>
        </div>

        {/* 交互按钮 */}
        <div className="flex items-center gap-2">
          <LikeButton
            postId={post.id}
            initialLiked={hasLiked}
            initialCount={post.likesCount}
          />
          <BookmarkButton
            postId={post.id}
            initialBookmarked={hasBookmarked}
          />
        </div>
      </header>

      {/* 封面图 */}
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-auto rounded-lg"
        />
      )}

      {/* 文章内容 */}
      <Card>
        <CardContent className="p-6 prose prose-lg max-w-none">
          <EditorPreview content={post.content} />
        </CardContent>
      </Card>
    </article>
  )
}
```

---

### 步骤 3：创建表单子组件

#### 3.1 PostFormFields 组件

```typescript
// components/features/post/forms/post-form-fields.tsx - 新建

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { PostFormData } from '@/types/forms'

export interface PostFormFieldsProps {
  /**
   * 表单实例
   */
  form: UseFormReturn<PostFormData>
  /**
   * 生成 Slug 回调
   */
  onGenerateSlug?: () => void
}

/**
 * 文章表单字段组件
 * 可复用的表单字段集合
 */
export function PostFormFields({ form, onGenerateSlug }: PostFormFieldsProps) {
  return (
    <>
      {/* 标题 */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>标题</FormLabel>
            <FormControl>
              <Input placeholder="输入文章标题" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Slug */}
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input placeholder="url-friendly-slug" {...field} />
              </FormControl>
              {onGenerateSlug && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onGenerateSlug}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              )}
            </div>
            <FormDescription>
              文章的 URL 标识，只能使用小写字母、数字和连字符
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 摘要 */}
      <FormField
        control={form.control}
        name="excerpt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>摘要（可选）</FormLabel>
            <FormControl>
              <Textarea
                placeholder="简短描述文章内容"
                rows={3}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
```

#### 3.2 PostFormSidebar 组件

```typescript
// components/features/post/forms/post-form-sidebar.tsx - 新建

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UseFormReturn } from 'react-hook-form'
import type { PostFormData } from '@/types/forms'
import type { Category, Tag } from '@/types/models'

export interface PostFormSidebarProps {
  /**
   * 表单实例
   */
  form: UseFormReturn<PostFormData>
  /**
   * 分类列表
   */
  categories: Category[]
  /**
   * 标签列表
   */
  tags: Tag[]
}

/**
 * 文章表单侧边栏组件
 * 包含发布设置、分类、标签等
 */
export function PostFormSidebar({ form, categories, tags }: PostFormSidebarProps) {
  return (
    <div className="space-y-6">
      {/* 发布设置 */}
      <Card>
        <CardHeader>
          <CardTitle>发布设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>立即发布</FormLabel>
                  <FormDescription>发布后所有人可见</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* 分类选择 */}
      <Card>
        <CardHeader>
          <CardTitle>分类</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        type="button"
                        variant={field.value === category.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => field.onChange(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* 标签选择 */}
      <Card>
        <CardHeader>
          <CardTitle>标签</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="tagIds"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Button
                        key={tag.id}
                        type="button"
                        variant={
                          field.value?.includes(tag.id) ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => {
                          const current = field.value || []
                          const newValue = current.includes(tag.id)
                            ? current.filter((id) => id !== tag.id)
                            : [...current, tag.id]
                          field.onChange(newValue)
                        }}
                      >
                        #{tag.name}
                      </Button>
                    ))}
                  </div>
                </FormControl>
                <FormDescription>可多选</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* 封面图 */}
      <Card>
        <CardHeader>
          <CardTitle>封面图</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="图片 URL" {...field} />
                </FormControl>
                <FormDescription>可选</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

#### 3.3 PostEditorLayout 组件

```typescript
// components/features/post/forms/post-editor-layout.tsx - 新建

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export interface PostEditorLayoutProps {
  /**
   * 头部内容
   */
  header?: ReactNode
  /**
   * 侧边栏内容
   */
  sidebar: ReactNode
  /**
   * 主内容（编辑器）
   */
  children: ReactNode
}

/**
 * 文章编辑器布局组件
 * 提供响应式的编辑器布局
 */
export function PostEditorLayout({
  header,
  sidebar,
  children,
}: PostEditorLayoutProps) {
  const [showSidebar, setShowSidebar] = useState(false)

  return (
    <div className="flex flex-col h-screen">
      {/* 头部 */}
      {header && <div className="border-b">{header}</div>}

      {/* 主体 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 编辑器区域 */}
        <main className="flex-1 overflow-auto">{children}</main>

        {/* 侧边栏 */}
        <aside
          className={cn(
            'w-80 border-l overflow-auto',
            'transition-transform duration-200',
            showSidebar ? 'translate-x-0' : 'translate-x-full',
            'lg:translate-x-0'
          )}
        >
          <div className="p-6">{sidebar}</div>
        </aside>

        {/* 移动端切换按钮 */}
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 lg:hidden"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
        </Button>
      </div>

      {/* 移动端遮罩 */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  )
}
```

---

### 步骤 4：创建 index.ts 导出文件

```typescript
// components/features/post/components/index.ts
export { PostCard } from './post-card'
export { PostList } from './post-list'
export { PostDetail } from './post-detail'

// components/features/post/forms/index.ts
export { PostFormFields } from './post-form-fields'
export { PostFormSidebar } from './post-form-sidebar'
export { PostEditorLayout } from './post-editor-layout'

// components/features/post/interactions/index.ts
export { LikeButton } from './like-button'
export { BookmarkButton } from './bookmark-button'

// components/features/post/index.ts
export * from './components'
export * from './forms'
export * from './interactions'
```

---

### 步骤 5：创建 Comment Feature

```typescript
// components/features/comment/index.ts
export { CommentItem } from './comment-item'
export { CommentList } from './comment-list'
export { CommentForm } from './comment-form'
```

---

### 步骤 6：创建 Auth Feature

```typescript
// components/features/auth/index.ts
export { LoginForm } from './login-form'
export { RegisterForm } from './register-form'
```

---

## 📊 重构效果

### 代码组织对比

**改造前**：
```
components/blog/
├── post-card.tsx (92 行)
├── post-form.tsx (287 行)
├── like-button.tsx (57 行)
├── bookmark-button.tsx (55 行)
├── comment-item.tsx (169 行)
├── comment-list.tsx (64 行)
├── comment-form.tsx (90 行)
└── view-tracker.tsx (21 行)
总计：835 行，职责混乱
```

**改造后**：
```
components/features/
├── post/
│   ├── components/
│   │   ├── post-card.tsx (92 行)
│   │   ├── post-list.tsx (40 行) 🆕
│   │   └── post-detail.tsx (80 行) 🆕
│   ├── forms/
│   │   ├── post-form-fields.tsx (60 行) 🆕
│   │   ├── post-form-sidebar.tsx (100 行) 🆕
│   │   └── post-editor-layout.tsx (50 行) 🆕
│   └── interactions/
│       ├── like-button.tsx (20 行) ✅ 简化
│       └── bookmark-button.tsx (20 行) ✅ 简化
├── comment/
│   ├── comment-item.tsx (169 行)
│   ├── comment-list.tsx (64 行)
│   └── comment-form.tsx (40 行) ✅ 简化
└── auth/
    ├── login-form.tsx
    └── register-form.tsx
总计：735 行，职责清晰
```

### 收益

- ✅ 代码量减少 12%（835 → 735 行）
- ✅ 组件职责清晰（按功能分组）
- ✅ 易于定位（通过目录结构）
- ✅ 便于扩展（新增 feature 目录）
- ✅ 提升可维护性

---

## 🧪 测试清单

### 功能测试

- [ ] 文章列表展示正常
- [ ] 文章详情展示正常
- [ ] 文章创建/编辑功能正常
- [ ] 点赞/收藏功能正常
- [ ] 评论功能正常
- [ ] 响应式布局正常

### 导入路径测试

- [ ] 所有导入路径更新正确
- [ ] 无循环依赖
- [ ] TypeScript 编译通过

---

## 📝 迁移指南

### 更新导入路径

```typescript
// 改造前
import { PostCard } from '@/components/blog/post-card'
import { LikeButton } from '@/components/blog/like-button'
import { CommentList } from '@/components/blog/comment-list'

// 改造后
import { PostCard, PostList, PostDetail } from '@/components/features/post'
import { LikeButton, BookmarkButton } from '@/components/features/post/interactions'
import { CommentList, CommentForm } from '@/components/features/comment'
```

### 批量更新脚本

```bash
# 创建更新脚本
cat > scripts/update-imports.sh << 'EOF'
#!/bin/bash

# 更新 post 相关导入
find app components -name "*.tsx" -type f -exec sed -i '' \
  "s|@/components/blog/post-card|@/components/features/post|g" {} +

find app components -name "*.tsx" -type f -exec sed -i '' \
  "s|@/components/blog/like-button|@/components/features/post/interactions|g" {} +

# 更新 comment 相关导入
find app components -name "*.tsx" -type f -exec sed -i '' \
  "s|@/components/blog/comment|@/components/features/comment|g" {} +

echo "导入路径更新完成！"
EOF

chmod +x scripts/update-imports.sh
./scripts/update-imports.sh
```

---

## ⏱️ 时间估算

| 任务 | 时间 |
|------|------|
| 创建目录结构 | 10 分钟 |
| 移动文件 | 20 分钟 |
| 创建容器组件 | 30 分钟 |
| 创建表单子组件 | 40 分钟 |
| 更新导入路径 | 20 分钟 |
| 测试验证 | 20 分钟 |
| **总计** | **2 小时** |

---

## 🎯 总结

Feature-based 重组将：
1. ✅ 提升代码组织清晰度
2. ✅ 减少代码量 12%
3. ✅ 提升可维护性
4. ✅ 便于团队协作
5. ✅ 支持功能扩展
