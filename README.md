# Blog Fidoo

一个基于 Next.js App Router 构建的现代化博客系统，支持 Markdown 编辑、无限滚动文章列表、评论互动、点赞收藏、用户关注以及基于角色的权限管理（RBAC）。

## ✨ 功能特性

- **用户认证**：邮箱/密码登录 + OAuth（GitHub、Google）
- **角色权限**：USER / AUTHOR / MODERATOR / ADMIN 四级 RBAC 权限
- **内容管理**：文章创建、编辑、发布、分类、标签
- **Markdown 编辑器**：基于 CodeMirror 6，支持实时预览和代码高亮
- **互动系统**：评论（含嵌套回复）、文章点赞、收藏、用户关注
- **文章列表**：无限滚动 + 预加载优化，支持分类筛选
- **响应式布局**：适配移动端和桌面端
- **暗黑模式**：支持亮色/暗色主题切换

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | [Next.js 15.2.3](https://nextjs.org/) (App Router) |
| UI 库 | [React 19.2.4](https://react.dev/) |
| 样式 | [Tailwind CSS v4](https://tailwindcss.com/) |
| 组件库 | [shadcn/ui](https://ui.shadcn.com/) |
| 数据库 | [PostgreSQL](https://www.postgresql.org/) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| 认证 | [Next-Auth v4](https://next-auth.js.org/) |
| 状态管理 | [Zustand](https://github.com/pmndrs/zustand) + [TanStack Query](https://tanstack.com/query) |
| 表单 | [React Hook Form](https://www.react-hook-form.com/) + [Zod](https://zod.dev/) |
| Markdown | [react-markdown](https://github.com/remarkjs/react-markdown) + [rehype-highlight](https://github.com/rehypejs/rehype-highlight) |
| 编辑器 | [@uiw/react-codemirror](https://uiwjs.github.io/react-codemirror/) |
| 图标 | [lucide-react](https://lucide.dev/) |
| 包管理器 | [pnpm](https://pnpm.io/) |

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/) & Docker Compose（可选，用于快速部署）

### 1. 克隆项目

```bash
git clone https://github.com/fidoong/fidoo-blog-next.git
cd fidoo-blog-next
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，至少填写以下必填项：

```env
# 数据库连接字符串
DATABASE_URL="postgresql://user:password@localhost:5432/blogdb"

# NextAuth 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"

# OAuth 登录（可选）
GITHUB_ID="your-github-app-id"
GITHUB_SECRET="your-github-app-secret"
GOOGLE_ID="your-google-client-id"
GOOGLE_SECRET="your-google-client-secret"
```

> **提示**：生产环境请使用强随机字符串作为 `NEXTAUTH_SECRET`。

### 4. 启动数据库

#### 方式 A：使用 Docker（推荐开发环境）

```bash
pnpm docker:dev:up
```

这会启动一个 PostgreSQL 容器，端口映射为 `5435:5432`。

#### 方式 B：使用本地 PostgreSQL

确保本地 PostgreSQL 服务已启动，并创建好对应的数据库。

### 5. 数据库迁移与初始化

```bash
# 推送 Schema 到数据库
pnpm db:push

# 初始化默认数据（管理员账号、示例分类等）
pnpm db:seed
```

### 6. 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可访问。

默认管理员账号：`admin@example.com` / `admin123`

## 🐳 Docker 部署

### 一键启动完整应用（含 PostgreSQL）

```bash
docker-compose up -d
```

应用将在 `http://localhost:3000` 运行。首次启动时会自动执行数据库迁移和种子脚本。

### 常用 Docker 命令

```bash
# 停止应用
docker-compose down

# 停止并删除所有数据（包括数据库卷）
docker-compose down -v

# 重新构建镜像
docker-compose up -d --build

# 查看日志
docker-compose logs -f app
```

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── (admin)/           # 管理后台路由组
│   ├── (auth)/            # 认证路由组（登录、注册）
│   ├── api/               # API 路由
│   ├── blog/              # 博客前台（文章列表、详情）
│   ├── tags/              # 标签列表与详情
│   ├── write/             # 写文章
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式（Tailwind v4）
├── components/
│   ├── ui/                # shadcn/ui 组件
│   ├── blog/              # 博客业务组件
│   ├── editor/            # Markdown 编辑器
│   └── layout/            # Header、Footer
├── lib/
│   ├── actions/           # Server Actions
│   ├── auth/              # 认证配置与 RBAC
│   ├── db/                # 数据库连接与 Schema
│   ├── hooks/             # 自定义 React Hooks
│   └── stores/            # Zustand stores
├── types/                 # TypeScript 类型定义
├── scripts/               # 数据库种子脚本
├── docker-compose.yml     # 生产 Docker 编排
├── docker-compose.dev.yml # 开发环境数据库
└── proxy.ts               # 请求拦截代理（替代 middleware.ts）
```

## 🔧 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 运行 ESLint |
| `pnpm db:push` | 推送 Schema 变更到数据库 |
| `pnpm db:migrate` | 执行 Drizzle 迁移 |
| `pnpm db:studio` | 打开 Drizzle Studio |
| `pnpm db:seed` | 执行数据库种子脚本 |
| `pnpm docker:dev:up` | 启动开发数据库容器 |
| `pnpm docker:up` | 一键启动完整 Docker 应用 |

## 🔐 环境变量说明

| 变量 | 说明 | 必填 |
|------|------|:--:|
| `DATABASE_URL` | PostgreSQL 连接字符串 | ✅ |
| `NEXTAUTH_URL` | 应用根 URL | ✅ |
| `NEXTAUTH_SECRET` | NextAuth 加密密钥 | ✅ |
| `GITHUB_ID` | GitHub OAuth Client ID | ❌ |
| `GITHUB_SECRET` | GitHub OAuth Client Secret | ❌ |
| `GOOGLE_ID` | Google OAuth Client ID | ❌ |
| `GOOGLE_SECRET` | Google OAuth Client Secret | ❌ |

## 🌐 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com/) 导入项目
3. 配置环境变量（`DATABASE_URL`、`NEXTAUTH_SECRET`、`NEXTAUTH_URL` 等）
4. 连接 PostgreSQL 数据库（推荐 [Vercel Postgres](https://vercel.com/storage/postgres) 或 [Neon](https://neon.tech/)）
5. 在构建后执行 `pnpm db:migrate` 和 `pnpm db:seed`
6. 部署

## 👥 角色权限

| 角色 | 权限范围 |
|------|----------|
| **USER** | 阅读文章、评论、点赞、收藏、编辑个人资料 |
| **AUTHOR** | USER + 创建/编辑/删除自己的文章、进入 Dashboard |
| **MODERATOR** | AUTHOR + 管理所有文章和评论 |
| **ADMIN** | 全部权限 |

## ⚠️ 注意事项

- **Next.js 15 变更**：项目使用 `proxy.ts` 替代传统的 `middleware.ts` 进行路由拦截和权限校验。
- **shadcn/ui (Base UI)**：组件不支持 `asChild` prop，链接按钮请使用 `<Link><Button /></Link>` 模式。
- **图片域名**：`next.config.ts` 中允许了所有 `https://**` 域名用于开发方便，生产环境建议收紧为实际使用的 CDN 域名。

## 📄 许可证

[MIT](./LICENSE)
