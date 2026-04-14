<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# blog-fidoo 项目指南

本文档面向 AI 编程助手，旨在快速建立对项目结构、技术栈和开发规范的系统认知。项目的主要自然语言是**中文**。

---

## 项目概述

`blog-fidoo` 是一个基于 Next.js App Router 构建的现代化博客系统，支持文章发布、Markdown 编辑、分类标签、评论互动、点赞收藏、用户关注以及基于角色的权限管理（RBAC）。

### 核心功能

- 用户认证：邮箱/密码登录 + OAuth（GitHub、Google）
- 角色权限：USER / AUTHOR / MODERATOR / ADMIN 四级角色
- 内容管理：文章创建、编辑、发布、分类、标签
- 互动系统：评论、点赞、收藏、关注
- Markdown 编辑器（CodeMirror 6）+ 实时预览 + 代码高亮
- 响应式布局 + 暗黑模式支持

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 15.2.3 (App Router) |
| UI 库 | React 19.2.4 |
| 样式 | Tailwind CSS v4 + `tw-animate-css` |
| 组件库 | shadcn/ui (`style: base-nova`, Base UI 底层) |
| 数据库 | PostgreSQL 16 |
| ORM | Drizzle ORM + `pg` (node-postgres) |
| 认证 | Next-Auth v4 |
| 状态管理 | Zustand + TanStack Query |
| 表单 | React Hook Form + Zod |
| Markdown | `react-markdown` + `rehype-highlight` + `remark-gfm` |
| 编辑器 | `@uiw/react-codemirror` (CodeMirror 6) |
| 图标 | `lucide-react` |
| 编译优化 | `babel-plugin-react-compiler` 1.0.0 |
| 包管理器 | pnpm |

---

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── (admin)/           # 管理后台路由组（dashboard、posts）
│   ├── (auth)/            # 认证路由组（login、register）
│   ├── api/               # API 路由（auth、posts）
│   ├── blog/              # 博客前台（列表、文章详情）
│   ├── posts/edit/[id]/   # 文章编辑页
│   ├── tags/              # 标签列表与详情
│   ├── write/             # 写文章
│   ├── about/             # 关于页面
│   ├── unauthorized/      # 无权限提示页
│   ├── layout.tsx         # 根布局（注入 SessionProvider、ThemeProvider）
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式（Tailwind v4 配置入口）
├── components/
│   ├── ui/                # shadcn/ui 组件
│   ├── admin/             # 后台专用组件
│   ├── blog/              # 博客业务组件（PostCard、Comment、LikeButton 等）
│   ├── editor/            # Markdown 编辑器相关
│   ├── layout/            # Header、Footer
│   ├── shared/            # 通用共享组件
│   ├── providers.tsx      # ThemeProvider + Toaster 包装器
│   └── session-provider.tsx
├── lib/
│   ├── actions/           # Server Actions（posts、comments、likes、bookmarks、categories、tags）
│   ├── auth/              # 认证配置、RBAC、服务端权限检查
│   ├── db/                # 数据库连接（node-postgres Pool）与 Schema
│   ├── hooks/             # 自定义 React Hooks
│   ├── stores/            # Zustand stores
│   ├── validations/       # Zod 校验 Schema（与 types/forms.ts 配合使用）
│   └── utils.ts           # `cn()` 工具函数
├── config/                # 站点配置（site.ts、nav.ts）
├── types/                 # TypeScript 类型定义
├── scripts/               # 数据库种子脚本等
├── proxy.ts               # 替代 middleware.ts 的请求拦截器
├── drizzle.config.ts      # Drizzle Kit 配置
├── docker-compose.yml     # 生产环境 Docker 编排
├── docker-compose.dev.yml # 开发环境仅 PostgreSQL
└── Dockerfile             # 多阶段构建镜像
```

### 路径别名

`tsconfig.json` 中配置了 `"@/*": "./*"`，因此所有内部导入都应使用 `@/components/ui/button` 这样的形式，避免相对路径 `../../`。

---

## 常用命令

```bash
# 开发
pnpm dev              # 启动开发服务器（Turbopack）

# 构建与运行
pnpm build            # 生产构建
pnpm start            # 启动生产服务器

# 代码检查
pnpm lint             # ESLint（Flat Config 格式）

# 数据库操作
pnpm db:generate      # 生成 Drizzle 迁移文件
pnpm db:migrate       # 执行迁移
pnpm db:push          # 直接推送 schema 变更（开发常用）
pnpm db:studio        # 打开 Drizzle Studio
pnpm db:seed          # 执行 scripts/seed.ts，初始化默认数据

# Docker
pnpm docker:dev:up    # 启动开发数据库（docker-compose.dev.yml）
pnpm docker:dev:down  # 停止开发数据库
pnpm docker:up        # 一键启动完整应用（docker-compose.yml）
pnpm docker:down      # 停止完整应用
pnpm docker:build     # 构建 Docker 镜像
```

---

## 开发规范与代码风格

### 语言与注释

- **界面语言**：中文（`zh-CN`）
- **代码注释**：使用中文注释说明业务逻辑

### TypeScript

- `strict: true` 已开启，不允许隐式 `any`
- 组件优先使用函数声明式组件
- Server Actions 文件顶部必须标注 `'use server'`
- 客户端组件文件顶部必须标注 `'use client'`

### 样式

- 使用 Tailwind CSS v4，配置集中在 `app/globals.css`
- 使用 `@import "tailwindcss"` 和 `@theme inline` 语法
- 主题变量同时支持 `:root`（亮色）和 `.dark`（暗色）
- 组件 class 组合统一使用 `cn()` 工具（`clsx` + `tailwind-merge`）

### 组件规范

- **shadcn/ui 组件**：存放在 `components/ui/`，通过 `npx shadcn add` 管理
- **Base UI 限制**：组件不支持 `asChild` prop。如需按钮链接，使用 `<Link href="..."><Button>...</Button></Link>` 模式，不要用 `<Button asChild>`
- **异步页面组件**：所有异步页面（`async function Page()`）需要在合适位置提供 `Suspense` 边界

### 数据获取

- **写操作（增删改）**：统一放在 `lib/actions/*.ts`，使用 Server Actions
- **读操作**：页面级数据获取可直接在 `page.tsx` 中调用 `db.query` 或 Server Actions
- **缓存刷新**：Server Actions 中使用 `revalidatePath()` 清除页面缓存

---

## 认证与权限

### 认证方式

Next-Auth v4 配置在 `lib/auth/config.ts`，支持三种 Provider：
1. **Credentials**：邮箱 + 密码（bcryptjs 哈希比对）
2. **GitHub OAuth**：可选，需配置 `GITHUB_ID` / `GITHUB_SECRET`
3. **Google OAuth**：可选，需配置 `GOOGLE_ID` / `GOOGLE_SECRET`

Session 策略为 **JWT**，有效期 30 天。JWT 中注入了 `role` 和 `username`。

### 角色与权限（RBAC）

定义在 `lib/auth/rbac.ts`：

| 角色 | 权限范围 |
|------|----------|
| USER | 阅读、评论、点赞、收藏、编辑个人资料 |
| AUTHOR | USER + 创建/编辑/删除自己的文章、进入 Dashboard |
| MODERATOR | AUTHOR + 管理所有文章/评论 |
| ADMIN | 全部权限 |

### 服务端权限检查

`lib/auth/server-permissions.ts` 提供以下辅助函数：

- `requireAuth()` — 要求登录
- `requirePermission(permission)` — 要求特定权限
- `requireResourceAccess(ownerId)` — 要求是当前资源所有者，或拥有 `POST_MANAGE_ALL`
- `requireMinimumRole(role)` — 要求至少某一级角色

**注意**：这些函数内部调用 `getServerSession(authConfig)`，只能在服务端环境（Server Actions、API Routes、Server Components）中使用。

---

## 数据库与 Schema

### 连接方式

使用 `pg`（node-postgres）的 `Pool` 进行连接，全局单例挂载在 `globalThis` 上避免热更新时重复创建。定义在 `lib/db/index.ts`。

### 环境变量

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/blogdb"
```

### 主要表结构

`lib/db/schema.ts` 定义了以下表：

- `users` — 用户
- `categories` — 文章分类
- `tags` — 标签
- `posts` — 文章
- `posts_to_tags` — 文章-标签多对多关联
- `comments` — 评论（支持嵌套回复 `parentId`）
- `likes` — 文章点赞
- `comment_likes` — 评论点赞
- `bookmarks` — 文章收藏
- `follows` — 用户关注关系

角色枚举：`roleEnum('role', ['USER', 'AUTHOR', 'MODERATOR', 'ADMIN'])`

### Drizzle Kit

- 配置文件：`drizzle.config.ts`
- 迁移输出目录：`./drizzle`
- 方言：`postgresql`

---

## Next.js 特殊约定

### `proxy.ts` 替代 `middleware.ts`

项目没有 `middleware.ts`，而是在根目录使用 `proxy.ts` 导出默认的 `proxy` 函数：

```ts
export default async function proxy(request: Request) { ... }
export const config = { matcher: [...] }
```

它负责：
- 公开路由放行（`/blog`、`/tags`、`/about`、`/login`、`/api/auth` 等）
- `/dashboard` 等受保护路由检查登录状态
- `/admin` 路径要求登录

### Server Actions 限制

- **暂不支持 `'use cache'` 指令**

### 图片域名

`next.config.ts` 中已配置远程图片：
- `avatars.githubusercontent.com`
- `lh3.googleusercontent.com`
- 以及所有 `https://**`（开发方便，但生产环境建议收紧）

---

## 测试策略

**当前项目未配置自动化测试框架**（无 Jest、Vitest、Playwright 等）。

若需要新增测试，建议在 `package.json` 中引入测试工具，并新建 `__tests__/` 或 `*.test.ts` 文件。

---

## 部署与 Docker

### Vercel 部署

1. 连接 Git 仓库
2. 设置环境变量（`DATABASE_URL`、`NEXTAUTH_SECRET`、`NEXTAUTH_URL` 等）
3. 配置 PostgreSQL 数据库（推荐 Vercel Postgres 或外部服务）
4. 执行 `pnpm db:migrate` 和 `pnpm db:seed`

### Docker 自托管

```bash
# 一键启动完整应用（含 PostgreSQL）
docker-compose up -d
```

Dockerfile 采用多阶段构建：
1. **builder 阶段**：`node:20-alpine`，安装 pnpm、构建应用、生成迁移
2. **runner 阶段**：仅复制生产必要文件，安装生产依赖 + `drizzle-kit` + `tsx`
3. 启动时自动等待数据库就绪 → 执行迁移 → 执行种子 → 启动 Next.js

开发数据库独立使用 `docker-compose.dev.yml`，端口映射为 `5435:5432`。

---

## 安全注意事项

1. **环境变量**：`.env.local` 和 `.env.docker` 包含数据库连接字符串和 OAuth 密钥，已加入 `.gitignore`，切勿提交到版本控制。
2. **密码哈希**：用户密码使用 `bcryptjs` 加盐哈希存储，禁止明文保存。
3. **SQL 注入**：所有数据库查询通过 Drizzle ORM 参数化执行，禁止直接拼接 SQL 字符串。
4. **输入校验**：所有表单和 API 参数均经过 Zod Schema 校验（`types/forms.ts`）。
5. **权限校验**：任何涉及数据修改的 Server Action / API Route 必须调用 `requireAuth()` 或 `requireResourceAccess()`，不能仅依赖前端隐藏按钮。
6. **Next-Auth Secret**：生产环境必须将 `NEXTAUTH_SECRET` 替换为强随机字符串。
7. **图片域名**：`next.config.ts` 当前允许所有 `https://**` 域名，生产部署建议收紧为实际使用的 CDN 域名。
