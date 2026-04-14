import { db, pool } from '@/lib/db'
import { users, categories, tags, posts, postsToTags } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'

// Unsplash 图片 - 各种主题的高质量图片
const coverImages = {
  tech: [
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80', // code
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', // laptop
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', // coding
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80', // tech
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', // team
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80', // programming
    'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=800&q=80', // AI
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', // network
  ],
  life: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', // mountain
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80', // lake
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', // coffee
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80', // workspace
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80', // books
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', // beach
  ],
  design: [
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80', // design
    'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80', // creative
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&q=80', // UI
    'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800&q=80', // wireframe
  ]
}

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const adminResult = await db.insert(users).values({
      email: 'admin@example.com',
      username: 'admin',
      name: 'Administrator',
      role: 'ADMIN',
      passwordHash: adminPassword,
    }).onConflictDoNothing().returning({ id: users.id })
    
    if (adminResult.length > 0) {
      console.log('✅ Admin user created (admin@example.com / admin123)')
    } else {
      console.log('ℹ️ Admin user already exists, skipping')
    }

    // Create default categories
    const defaultCategories = [
      { name: '技术', slug: 'tech', description: '技术文章和教程', icon: '💻' },
      { name: '生活', slug: 'life', description: '生活随笔和感悟', icon: '🌟' },
      { name: '随笔', slug: 'notes', description: '随手记录和想法', icon: '📝' },
      { name: '设计', slug: 'design', description: '设计与创意', icon: '🎨' },
      { name: '后端', slug: 'backend', description: '后端开发技术', icon: '⚙️' },
    ]
    
    let categoriesCreated = 0
    for (const cat of defaultCategories) {
      const result = await db.insert(categories).values(cat).onConflictDoNothing().returning({ id: categories.id })
      if (result.length > 0) categoriesCreated++
    }
    console.log(`✅ ${categoriesCreated} categories created`)

    // Create more tags
    const defaultTags = [
      { name: 'React', slug: 'react', description: 'React 相关' },
      { name: 'Next.js', slug: 'nextjs', description: 'Next.js 相关' },
      { name: 'TypeScript', slug: 'typescript', description: 'TypeScript 相关' },
      { name: 'Node.js', slug: 'nodejs', description: 'Node.js 相关' },
      { name: '数据库', slug: 'database', description: '数据库相关' },
      { name: 'CSS', slug: 'css', description: 'CSS 样式' },
      { name: 'Vue', slug: 'vue', description: 'Vue.js' },
      { name: 'AI', slug: 'ai', description: '人工智能' },
      { name: 'Docker', slug: 'docker', description: '容器化' },
      { name: 'Linux', slug: 'linux', description: 'Linux 系统' },
      { name: 'Go', slug: 'go', description: 'Go 语言' },
      { name: 'Python', slug: 'python', description: 'Python' },
      { name: '阅读', slug: 'reading', description: '阅读笔记' },
      { name: '旅行', slug: 'travel', description: '旅行日记' },
      { name: 'UI设计', slug: 'ui-design', description: 'UI 设计' },
    ]
    
    let tagsCreated = 0
    for (const tag of defaultTags) {
      const result = await db.insert(tags).values(tag).onConflictDoNothing().returning({ id: tags.id })
      if (result.length > 0) tagsCreated++
    }
    console.log(`✅ ${tagsCreated} tags created`)

    // Get admin user and categories for creating posts
    const adminUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, 'admin'),
    })
    
    const allCategories = await db.query.categories.findMany()
    const allTags = await db.query.tags.findMany()
    
    const getTagIds = (slugs: string[]) => allTags.filter(t => slugs.includes(t.slug)).map(t => t.id)
    
    if (adminUser && allCategories.length > 0) {
      const techCategory = allCategories.find(c => c.slug === 'tech')?.id || allCategories[0].id
      const lifeCategory = allCategories.find(c => c.slug === 'life')?.id || allCategories[0].id
      const notesCategory = allCategories.find(c => c.slug === 'notes')?.id || allCategories[0].id
      const designCategory = allCategories.find(c => c.slug === 'design')?.id || allCategories[0].id
      const backendCategory = allCategories.find(c => c.slug === 'backend')?.id || allCategories[0].id

      // Create sample posts with covers
      const samplePosts = [
        // ========== 技术文章 ==========
        {
          title: 'Next.js 16 新特性详解：Turbopack 完全指南',
          slug: 'nextjs-16-features-turbopack',
          excerpt: '深入了解 Next.js 16 带来的革命性变化，包括 Turbopack 稳定版、Server Actions 改进等。',
          content: `# Next.js 16 新特性详解：Turbopack 完全指南

Next.js 16 带来了很多令人兴奋的新特性，让我们一起来看看：

## Turbopack 稳定版

Turbopack 现在已经稳定，比 Webpack 快 700 倍，比 Vite 快 10 倍。它使用 Rust 编写，为开发环境提供了极致的性能体验。

## Server Actions 改进

Server Actions 现在支持更多场景，让服务端交互更加简单。我们可以直接在组件中调用服务端函数，无需创建额外的 API 路由。

## 部分预渲染（Partial Prerendering）

这是一个革命性的功能，允许静态页面中嵌入动态内容，实现最佳的用户体验。

## 总结

Next.js 16 是一个值得升级的版本，它带来了更好的开发体验和更快的构建速度。`,
          categoryId: techCategory,
          tagIds: getTagIds(['nextjs', 'react']),
          published: true,
          views: 1289,
          coverImage: coverImages.tech[0],
        },
        {
          title: 'TypeScript 5.8 新功能与最佳实践',
          slug: 'typescript-5-8-features',
          excerpt: 'TypeScript 5.8 带来了更强大的类型推断和新的语法特性，让代码更加健壮。',
          content: `# TypeScript 5.8 新功能与最佳实践

TypeScript 5.8 正式发布，带来了多项改进，让我们的开发体验更上一层楼。

## 更智能的类型推断

编译器现在能更好地理解代码意图，特别是在处理条件类型和泛型时。这使得我们可以编写更简洁的代码，而不需要显式的类型注解。

## 性能优化

编译速度提升了 15%，这对于大型项目来说意义重大。更快的编译速度意味着更短的反馈循环，提高开发效率。

## 新的语法特性

- 更好的装饰器支持
- 改进的 JSDoc 解析
- 更严格的类型检查选项

## 实际应用

在实际项目中，我们可以利用这些新特性来重构代码，使其更加类型安全。`,
          categoryId: techCategory,
          tagIds: getTagIds(['typescript', 'nodejs']),
          published: true,
          views: 892,
          coverImage: coverImages.tech[1],
        },
        {
          title: 'React Server Components 深入解析',
          slug: 'react-server-components-deep-dive',
          excerpt: '深入理解 React Server Components 的工作原理，以及如何在项目中正确使用。',
          content: `# React Server Components 深入解析

React Server Components（RSC）是 React 生态系统中的一个重要创新，它改变了我们构建 React 应用的方式。

## 什么是 Server Components

Server Components 是在服务器端渲染的 React 组件，它们不会向客户端发送任何 JavaScript 代码。这意味着更小的 bundle 体积和更快的首屏加载速度。

## 与 Client Components 的区别

- Server Components 可以访问服务器端资源（数据库、文件系统等）
- Client Components 可以访问浏览器 API 和 React 状态
- 两者可以无缝组合使用

## 最佳实践

1. 尽可能使用 Server Components
2. 只在需要客户端交互的地方使用 Client Components
3. 合理规划组件边界

## 性能优势

通过减少发送到客户端的 JavaScript，我们可以显著提高应用的加载性能。`,
          categoryId: techCategory,
          tagIds: getTagIds(['react', 'nextjs']),
          published: true,
          views: 2156,
          coverImage: coverImages.tech[2],
        },
        {
          title: 'Docker 容器化部署完全指南',
          slug: 'docker-deployment-guide',
          excerpt: '从零开始学习 Docker，掌握容器化部署的核心概念和实战技巧。',
          content: `# Docker 容器化部署完全指南

Docker 已经成为现代应用部署的标准工具。本文将带你从零开始，掌握 Docker 的核心概念。

## 什么是 Docker

Docker 是一个开源的容器化平台，它允许开发者将应用及其依赖打包到一个轻量级、可移植的容器中。

## 核心概念

- **镜像（Image）**：应用的只读模板
- **容器（Container）**：镜像的运行实例
- **Dockerfile**：定义镜像构建步骤的脚本
- **Docker Compose**：多容器编排工具

## 实战示例

让我们创建一个简单的 Node.js 应用的 Docker 配置：

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## 部署策略

学习如何使用 Docker Swarm 或 Kubernetes 进行大规模容器编排。`,
          categoryId: backendCategory,
          tagIds: getTagIds(['docker', 'nodejs', 'linux']),
          published: true,
          views: 1567,
          coverImage: coverImages.tech[5],
        },
        {
          title: 'PostgreSQL vs MySQL：2024年如何选择',
          slug: 'postgresql-vs-mysql-2024',
          excerpt: '对比两款最流行的开源数据库，从性能、功能、生态等多角度分析，帮助你做出正确选择。',
          content: `# PostgreSQL vs MySQL：2024年如何选择

选择正确的数据库对项目的成功至关重要。让我们深入对比这两款最流行的开源数据库。

## PostgreSQL 优势

- **更强大的 SQL 支持**：完整的 SQL 标准实现
- **高级数据类型**：数组、JSON、地理信息等
- **更好的扩展性**：支持自定义类型、函数、操作符
- **并发控制**：MVCC 实现更加成熟

## MySQL 优势

- **简单易用**：学习曲线平缓
- **广泛的社区支持**：丰富的文档和工具
- **成熟的生态系统**：大量的第三方解决方案
- **复制功能**：主从复制配置简单

## 性能对比

在大多数场景下，两者的性能差异不大。但在特定场景下：
- 复杂查询：PostgreSQL 更优
- 简单读写：MySQL 略快

## 结论

- 选择 PostgreSQL：复杂应用、地理信息、需要高级功能
- 选择 MySQL：简单应用、快速开发、已有 MySQL 生态`,
          categoryId: backendCategory,
          tagIds: getTagIds(['database', 'nodejs']),
          published: true,
          views: 3421,
          coverImage: coverImages.tech[3],
        },
        {
          title: 'Tailwind CSS 4.0 新特性实战',
          slug: 'tailwind-css-4-features',
          excerpt: '探索 Tailwind CSS 4.0 的重大更新，包括更快的构建速度和新的主题系统。',
          content: `# Tailwind CSS 4.0 新特性实战

Tailwind CSS 4.0 是一个里程碑版本，带来了许多令人期待的改进。

## 零配置

新版本的核心理念是"零配置"。不再需要 tailwind.config.js，所有配置都可以通过 CSS 变量完成。

## 更快的构建速度

基于 Rust 的新引擎让构建速度提升了 10 倍，即使是大型项目也能在毫秒级完成构建。

## 新的主题系统

更加灵活的主题系统，支持：
- CSS 变量主题
- 运行时主题切换
- 更简单的暗色模式配置

## 迁移指南

从 v3 迁移到 v4 的步骤：
1. 更新依赖
2. 转换配置文件
3. 测试和调试

## 实战项目

让我们用一个真实的项目来演示新特性的使用。`,
          categoryId: techCategory,
          tagIds: getTagIds(['css', 'react']),
          published: true,
          views: 1876,
          coverImage: coverImages.tech[4],
        },
        {
          title: 'Go 语言微服务架构实战',
          slug: 'go-microservices-architecture',
          excerpt: '使用 Go 语言构建高性能微服务，包括服务发现、负载均衡和分布式追踪。',
          content: `# Go 语言微服务架构实战

Go 语言因其出色的性能和并发支持，成为构建微服务的理想选择。

## 为什么选择 Go

- **编译速度快**：快速迭代开发
- **二进制部署**：单文件部署，无依赖
- **并发原生支持**：goroutine 和 channel
- **性能优秀**：接近 C++ 的性能

## 微服务组件

### 服务发现
使用 Consul 或 etcd 实现服务注册和发现。

### API 网关
使用 Kong 或自研网关统一处理认证、限流、日志。

### 通信协议
- gRPC 用于内部服务通信
- REST/HTTP 用于外部接口

## 监控和追踪

集成 Prometheus 和 Jaeger，实现全面的可观测性。`,
          categoryId: backendCategory,
          tagIds: getTagIds(['go', 'docker']),
          published: true,
          views: 2341,
          coverImage: coverImages.tech[6],
        },
        {
          title: 'AI 辅助编程：ChatGPT 与 Copilot 对比',
          slug: 'ai-coding-assistant-comparison',
          excerpt: '深度对比主流 AI 编程助手，看看哪个更适合你的开发 workflow。',
          content: `# AI 辅助编程：ChatGPT 与 Copilot 对比

AI 正在改变编程的方式。让我们深入对比两款最流行的 AI 编程助手。

## GitHub Copilot

### 优势
- 实时代码补全
- 深度集成 IDE
- 基于上下文理解

### 适用场景
- 日常编码
- 重复性代码
- 学习新 API

## ChatGPT / Claude

### 优势
- 更长的上下文
- 可以解释代码
- 帮助设计架构

### 适用场景
- 代码审查
- 架构设计
- 学习和教学

## 实际测试

我们在几个真实场景下测试了两者的表现：
1. 算法实现
2. 调试帮助
3. 代码重构
4. 文档生成

## 最佳实践

结合使用两者，发挥各自优势。`,
          categoryId: techCategory,
          tagIds: getTagIds(['ai', 'typescript']),
          published: true,
          views: 4521,
          coverImage: coverImages.tech[7],
        },
        // ========== 设计文章 ==========
        {
          title: '现代 UI 设计趋势 2024',
          slug: 'ui-design-trends-2024',
          excerpt: '探索今年最流行的 UI 设计趋势，包括玻璃拟态、新拟态和极简主义。',
          content: `# 现代 UI 设计趋势 2024

设计趋势不断演进，了解最新趋势有助于我们创建现代化的用户界面。

## 玻璃拟态（Glassmorphism）

半透明、模糊背景的效果继续流行。它创造了层次感和现代感。

## 新拟态（Neumorphism）

柔和的阴影效果，创造出类似浮雕的视觉效果。适合需要突出材质感的场景。

## 极简主义

少即是多的理念回归。更干净的布局、更多的留白、更克制的配色。

## 动效设计

微交互和页面过渡动画变得更加重要，提升用户体验。

## 工具推荐

- Figma：协作设计
- Framer：原型制作
- Rive：复杂动画`,
          categoryId: designCategory,
          tagIds: getTagIds(['ui-design', 'css']),
          published: true,
          views: 1654,
          coverImage: coverImages.design[0],
        },
        {
          title: '设计系统的构建与维护',
          slug: 'design-system-guide',
          excerpt: '从 0 到 1 构建企业级设计系统，包括组件库、设计令牌和文档规范。',
          content: `# 设计系统的构建与维护

一个优秀的设计系统可以提高团队协作效率，保证产品一致性。

## 什么是设计系统

设计系统是一组可复用的组件和清晰的标准，由组织根据既定规则构建，以支持数字产品的开发。

## 核心组成部分

### 设计令牌（Design Tokens）
- 颜色
- 字体
- 间距
- 圆角

### 组件库
- 基础组件：Button、Input、Card
- 复合组件：Modal、Form、Table
- 业务组件：ProductCard、UserProfile

### 文档和指南
- 使用规范
- 设计原则
- 最佳实践

## 实施策略

1. 从小规模开始
2. 逐步扩展
3. 持续迭代
4. 团队培训`,
          categoryId: designCategory,
          tagIds: getTagIds(['ui-design', 'react']),
          published: true,
          views: 987,
          coverImage: coverImages.design[1],
        },
        // ========== 生活文章 ==========
        {
          title: '我的编程学习之路：从零到全栈',
          slug: 'my-coding-journey-fullstack',
          excerpt: '从初学者到全栈开发者的成长历程，分享我的经验和心得，希望能给你一些启发。',
          content: `# 我的编程学习之路：从零到全栈

回顾这几年的编程学习历程，有很多想分享的。希望我的经验能帮助到正在学习编程的你。

## 入门阶段（2019）

最初学习 HTML/CSS/JavaScript，做了很多小项目：
- 个人简历网站
- Todo 应用
- 天气查询应用

## 迷茫期

学习了一段时间后，感到迷茫。前端框架这么多，该选哪个？

最终选择了 React，因为它的社区活跃，工作机会多。

## 进阶成长（2020-2021）

后来学习 React、Node.js，开始接触全栈开发。

- 完成第一个商业项目
- 开始写技术博客
- 参与开源项目

## 心得体会

1. **坚持练习**：编程是技能，需要大量练习
2. **项目驱动**：通过实际项目学习效果最好
3. **社区参与**：多和他人交流，进步更快
4. **持续学习**：技术更新快，保持好奇心`,
          categoryId: lifeCategory,
          tagIds: getTagIds(['reading', 'react', 'nodejs']),
          published: true,
          views: 3256,
          coverImage: coverImages.life[2],
        },
        {
          title: '远程工作三年：我的经验与反思',
          slug: 'remote-work-3-years',
          excerpt: '疫情后远程工作成为常态，分享我三年远程工作的真实体验和心得。',
          content: `# 远程工作三年：我的经验与反思

远程工作改变了我的生活方式。三年来，我经历了很多，也学到了很多。

## 优点

### 时间灵活
可以自由安排工作时间，避开高峰期，提高效率。

### 节省通勤
每天节省 2 小时通勤时间，可以更好地平衡工作与生活。

### 环境舒适
在家可以打造最适合自己的工作环境。

## 挑战

### 沟通成本
文字沟通效率低，容易产生误解。

### 边界模糊
工作和生活的界限变得模糊，容易过度工作。

### 孤独感
缺少面对面交流，有时会感到孤独。

## 我的解决方案

1. 建立固定的工作时间表
2. 设置专门的办公空间
3. 定期参加线下活动
4. 主动与同事视频交流

## 总结

远程工作需要自律，但也能带来更好的生活质量。`,
          categoryId: lifeCategory,
          tagIds: getTagIds(['life', 'reading']),
          published: true,
          views: 2134,
          coverImage: coverImages.life[0],
        },
        {
          title: '程序员的咖啡指南',
          slug: 'programmer-coffee-guide',
          excerpt: '作为程序员，咖啡是续命神器。分享我的咖啡入门指南和冲煮心得。',
          content: `# 程序员的咖啡指南

写代码和喝咖啡似乎是绝配。让我分享一些咖啡入门知识。

## 咖啡豆的选择

### 产区风味
- **埃塞俄比亚**：花香、果酸
- **哥伦比亚**：平衡、坚果
- **巴西**：醇厚、巧克力

### 烘焙度
- 浅烘：酸度高，风味丰富
- 中烘：平衡，适合入门
- 深烘：苦味重，提神效果好

## 冲煮方法

### 手冲
最纯粹的方式，可以体验咖啡豆的原始风味。

### 意式浓缩
浓郁强烈，适合制作拿铁、卡布奇诺。

### 冷萃
低酸度，适合夏天，咖啡因含量高。

## 我的日常

早晨一杯手冲，下午一杯意式，完美的一天。`,
          categoryId: lifeCategory,
          tagIds: getTagIds(['life']),
          published: true,
          views: 1567,
          coverImage: coverImages.life[1],
        },
        {
          title: '2024 年技术书单推荐',
          slug: '2024-tech-book-recommendations',
          excerpt: '精选今年值得一读的技术书籍，涵盖编程、架构、AI 等多个领域。',
          content: `# 2024 年技术书单推荐

阅读是提升技术能力的重要途径。这里是我今年读过的几本好书。

## 编程基础

### 《代码整洁之道》
经典中的经典，教你如何写出可读、可维护的代码。

### 《设计模式：可复用面向对象软件的基础》
设计模式的圣经，每个程序员都应该读一遍。

## 系统架构

### 《数据密集型应用系统设计》
深入浅出地讲解分布式系统的核心概念。

### 《构建微服务》
微服务架构的实战指南。

## AI 与机器学习

### 《动手学深度学习》
理论与实践结合，适合入门深度学习。

## 软技能

### 《程序员修炼之道》
不仅是技术，还有职业发展的建议。

## 阅读建议

不要贪多，选择几本深入阅读，实践书中的内容。`,
          categoryId: lifeCategory,
          tagIds: getTagIds(['reading', 'ai']),
          published: true,
          views: 2890,
          coverImage: coverImages.life[4],
        },
        {
          title: '周末登山：逃离代码，拥抱自然',
          slug: 'weekend-hiking-escape',
          excerpt: '程序员的周末应该怎么过？我的答案是去山里走走，让大脑彻底放松。',
          content: `# 周末登山：逃离代码，拥抱自然

长时间面对电脑，身心都会疲惫。周末去山里走走，是我最好的放松方式。

## 为什么选择登山

### 身体锻炼
久坐是程序员的健康杀手。登山可以锻炼全身，特别是心肺功能。

### 大脑休息
远离屏幕，让大脑从代码中解脱出来。

### 成就感
登顶的那一刻，所有的疲惫都值得。

## 入门建议

### 装备
- 舒适的登山鞋
- 双肩背包
- 水和食物
- 防晒用品

### 路线选择
新手建议选择成熟路线，不要冒险。

## 我常去的路线

- 北京：香山、八达岭
- 杭州：九溪、龙井
- 成都：青城山、都江堰

## 写在最后

工作重要，但健康更重要。适时放下键盘，去户外走走吧。`,
          categoryId: lifeCategory,
          tagIds: getTagIds(['travel', 'life']),
          published: true,
          views: 1890,
          coverImage: coverImages.life[3],
        },
        // ========== 随笔 ==========
        {
          title: '从 Vue 迁移到 React 的一些思考',
          slug: 'vue-to-react-migration',
          excerpt: '团队决定将项目从 Vue 迁移到 React，记录这个过程中的思考和经验。',
          content: `# 从 Vue 迁移到 React 的一些思考

最近团队决定将项目从 Vue 2 迁移到 React。这是一个重大决定，我想记录一下过程中的思考。

## 为什么要迁移

### Vue 2 的生命周期
Vue 2 即将停止维护，而升级到 Vue 3 的成本也很高。

### 团队技能栈
团队中有更多 React 经验的开发者。

### 生态考虑
React 的生态系统更加丰富，特别是在某些特定领域。

## 迁移策略

### 渐进式迁移
不一次性重写，而是：
1. 新功能用 React 开发
2. 旧功能逐步替换
3. 使用微前端架构过渡

## 学到的经验

1. **不要低估迁移成本**：即使是渐进式迁移，工作量也很大
2. **团队培训很重要**：确保所有人都能熟练使用新框架
3. **文档是关键**：详细记录迁移过程中的决策

## 结论

没有最好的框架，只有最适合团队的框架。`,
          categoryId: notesCategory,
          tagIds: getTagIds(['vue', 'react']),
          published: true,
          views: 1456,
        },
        {
          title: 'CSS 变量在大型项目中的实践',
          slug: 'css-variables-in-large-projects',
          excerpt: '分享我们在大型项目中使用 CSS 变量的经验，包括主题切换和设计令牌的实现。',
          content: `# CSS 变量在大型项目中的实践

CSS 变量（自定义属性）是现代 CSS 的重要特性。在我们的项目中，它发挥了重要作用。

## 为什么选择 CSS 变量

### 运行时切换
与预处理器变量不同，CSS 变量可以在运行时动态修改。

### 级联和继承
可以利用 CSS 的级联特性，实现局部覆盖。

### 减少重复
定义一次，多处使用。

## 实际应用

### 主题切换
\`\`\`css
:root {
  --primary-color: #3b82f6;
  --bg-color: #ffffff;
}

[data-theme="dark"] {
  --primary-color: #60a5fa;
  --bg-color: #1f2937;
}
\`\`\`

### 设计令牌
\`\`\`css
:root {
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
}
\`\`\`

## 最佳实践

1. 命名要有意义
2. 提供合理的默认值
3. 文档化所有变量

## 性能考虑

CSS 变量的性能开销很小，可以放心使用。`,
          categoryId: notesCategory,
          tagIds: getTagIds(['css']),
          published: true,
          views: 987,
        },
        {
          title: 'Python 数据分析入门指南',
          slug: 'python-data-analysis-guide',
          excerpt: '非程序员也能学会的数据分析入门教程，使用 Python 进行数据处理。',
          content: `# Python 数据分析入门指南

数据分析是一项越来越重要的技能。即使是非程序员，也可以用 Python 轻松入门。

## 为什么选择 Python

- 语法简单，易于学习
- 丰富的数据分析库
- 活跃的社区支持

## 核心库介绍

### Pandas
数据处理的基础库，提供了 DataFrame 数据结构。

### NumPy
数值计算的基础，提供高效的数组操作。

### Matplotlib
数据可视化的标准库。

## 入门示例

\`\`\`python
import pandas as pd

# 读取数据
df = pd.read_csv('data.csv')

# 查看数据
print(df.head())

# 统计分析
print(df.describe())
\`\`\`

## 学习资源

- 《Python 数据分析》
- Kaggle 教程
- YouTube 视频教程

## 总结

数据分析不难，关键是动手实践。`,
          categoryId: techCategory,
          tagIds: getTagIds(['python', 'ai']),
          published: true,
          views: 2345,
        },
        {
          title: '代码审查的艺术',
          slug: 'art-of-code-review',
          excerpt: '如何做好代码审查？分享我的经验和 checklist，帮助团队提高代码质量。',
          content: `# 代码审查的艺术

代码审查是保证代码质量的重要环节。做好 code review 需要技巧和经验。

## 为什么要做 Code Review

### 发现 Bug
早期发现问题，降低修复成本。

### 知识共享
团队成员互相学习，了解项目各个部分。

### 保持一致性
确保代码风格和设计模式的一致性。

## Review Checklist

### 功能性
- [ ] 代码是否实现了需求
- [ ] 边界条件是否处理
- [ ] 错误处理是否完善

### 可读性
- [ ] 命名是否清晰
- [ ] 函数是否简短
- [ ] 注释是否必要且准确

### 性能
- [ ] 是否有明显的性能问题
- [ ] 是否避免了不必要的计算

## Review 礼仪

1. **对事不对人**：评论代码，不评论人
2. **解释原因**：说明为什么需要修改
3. **给予肯定**：好的代码要表扬
4. **及时响应**：不要让 PR 长时间等待

## 工具推荐

- GitHub Pull Requests
- GitLab Merge Requests
- Phabricator`,
          categoryId: notesCategory,
          tagIds: getTagIds(['reading']),
          published: true,
          views: 1123,
        },
        // ========== 草稿 ==========
        {
          title: '未发布：Rust 学习笔记（连载中）',
          slug: 'rust-learning-notes-draft',
          excerpt: '正在学习 Rust，这是一篇还没写完的笔记。',
          content: `# Rust 学习笔记

正在学习 Rust 中，记录一些心得...

## 所有权系统

Rust 的所有权系统是它最独特的特性...

（待续）`,
          categoryId: notesCategory,
          tagIds: getTagIds([]),
          published: false,
          views: 0,
        },
      ]
      
      let postsCreated = 0
      for (const postData of samplePosts) {
        const existing = await db.query.posts.findFirst({
          where: (posts, { eq }) => eq(posts.slug, postData.slug),
        })
        
        if (!existing) {
          const { tagIds, ...postInsert } = postData
          const readingTime = Math.ceil(postInsert.content.length / 200)
          
          const [post] = await db.insert(posts).values({
            ...postInsert,
            authorId: adminUser.id,
            readingTime,
            publishedAt: postInsert.published ? new Date() : null,
          }).returning()
          
          if (tagIds.length > 0) {
            await db.insert(postsToTags).values(
              tagIds.map(tagId => ({ postId: post.id, tagId }))
            )
          }
          postsCreated++
        }
      }
      console.log(`✅ ${postsCreated} sample posts created`)
    }

    console.log('🎉 Seed completed!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seed()
