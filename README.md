# Blog Fidoo

基于 Next.js 16 + React 19 + Tailwind CSS v4 构建的现代化博客系统。

## 技术栈

- **框架**: Next.js 16.2.3 (App Router)
- **UI 库**: React 19.2.4
- **样式**: Tailwind CSS v4
- **组件**: shadcn/ui (Base UI)
- **数据库**: PostgreSQL + Drizzle ORM
- **认证**: Next-Auth v4
- **状态管理**: Zustand
- **数据获取**: TanStack Query
- **编辑器**: CodeMirror 6

## 功能特性

- ✅ 用户认证（邮箱/密码 + OAuth: GitHub, Google）
- ✅ 角色权限管理（USER/AUTHOR/MODERATOR/ADMIN）
- ✅ 文章管理（创建、编辑、发布）
- ✅ Markdown 编辑器 + 实时预览
- ✅ 代码高亮
- ✅ 分类和标签系统
- ✅ 评论系统
- ✅ 文章点赞和收藏
- ✅ 用户关注
- ✅ 响应式设计
- ✅ 暗黑模式支持

## 快速开始（Docker）

### 方式一：一键部署（推荐）

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd blog-fidoo

# 2. 一键启动（包含 PostgreSQL 数据库）
docker-compose up -d

# 3. 访问 http://localhost:3000
# 默认管理员: admin@example.com / admin123
```

### 方式二：开发环境（分离部署）

```bash
# 1. 启动 PostgreSQL 容器
pnpm docker:dev:up
# 或: docker-compose -f docker-compose.dev.yml up -d

# 2. 配置环境变量
cp .env.docker .env.local

# 3. 执行数据库迁移
pnpm db:push

# 4. 初始化数据（可选）
pnpm db:seed

# 5. 启动开发服务器
pnpm dev

# 6. 访问 http://localhost:3000
```

### 方式三：手动部署

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.docker .env.local
# 编辑 .env.local，配置数据库连接

# 3. 数据库迁移
pnpm db:push

# 4. 初始化数据
pnpm db:seed

# 5. 启动
pnpm dev
```

## Docker 命令参考

```bash
# 开发环境（仅数据库）
pnpm docker:dev:up      # 启动开发数据库
pnpm docker:dev:down    # 停止开发数据库

# 生产环境（完整应用）
pnpm docker:build       # 构建镜像
pnpm docker:up          # 启动应用
pnpm docker:down        # 停止应用
pnpm docker:logs        # 查看日志

# 或使用 docker-compose 直接操作
docker-compose up -d           # 启动
docker-compose down            # 停止
docker-compose down -v         # 停止并删除数据卷
docker-compose logs -f app     # 查看应用日志
docker-compose logs -f postgres # 查看数据库日志
```

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── (admin)/           # 管理后台路由组
│   ├── (auth)/            # 认证路由组
│   ├── api/               # API 路由
│   ├── blog/              # 博客前台
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/                # shadcn/ui 组件
│   └── ...                # 业务组件
├── lib/                   # 工具函数和配置
│   ├── actions/           # Server Actions
│   ├── auth/              # 认证相关
│   ├── db/                # 数据库配置
│   ├── hooks/             # 自定义 Hooks
│   └── stores/            # Zustand stores
├── config/                # 配置文件
├── scripts/               # 脚本文件
│   └── seed.ts            # 数据库初始化脚本
├── docker-compose.yml     # Docker 生产配置
├── docker-compose.dev.yml # Docker 开发配置
├── Dockerfile             # 应用镜像构建
└── .env.docker            # Docker 环境变量模板
```

## 数据库 Schema

- **users**: 用户表
- **posts**: 文章表
- **categories**: 分类表
- **tags**: 标签表
- **posts_to_tags**: 文章-标签关联表
- **comments**: 评论表
- **likes**: 文章点赞表
- **comment_likes**: 评论点赞表
- **bookmarks**: 收藏表
- **follows**: 关注表

## 角色权限

| 角色 | 权限 |
|------|------|
| USER | 阅读文章、评论、点赞、收藏 |
| AUTHOR | USER + 创建/编辑自己的文章 |
| MODERATOR | AUTHOR + 管理所有文章/评论 |
| ADMIN | 全部权限 |

## 环境变量说明

| 变量 | 说明 | 必填 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | ✅ |
| `NEXTAUTH_URL` | 应用 URL | ✅ |
| `NEXTAUTH_SECRET` | 加密密钥（随机字符串） | ✅ |
| `GITHUB_ID` | GitHub OAuth Client ID | ❌ |
| `GITHUB_SECRET` | GitHub OAuth Client Secret | ❌ |
| `GOOGLE_ID` | Google OAuth Client ID | ❌ |
| `GOOGLE_SECRET` | Google OAuth Client Secret | ❌ |

## 开发注意事项

1. **Next.js 16 变更**:
   - `middleware.ts` 已改为 `proxy.ts` 导出 `proxy` 函数
   - Server Actions 暂不支持 `'use cache'` 指令

2. **shadcn/ui (Base UI)**:
   - 组件不支持 `asChild` prop
   - 使用 `<Link><Button /></Link>` 模式替代

3. **数据获取**:
   - 所有异步页面组件需要 Suspense 边界

## 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 添加 PostgreSQL 数据库（推荐 Vercel Postgres）
5. 部署

### 自建服务器（Docker）

```bash
# 克隆代码
git clone <repo>
cd blog-fidoo

# 配置环境变量（可选：修改 docker-compose.yml 中的环境变量）

# 一键启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 停止和清理

```bash
# 停止容器
docker-compose down

# 停止并删除所有数据（包括数据库）
docker-compose down -v

# 重新构建镜像
docker-compose up -d --build
```

## 许可证

MIT
