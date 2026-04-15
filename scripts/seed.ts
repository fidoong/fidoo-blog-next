import { db, pool } from '@/lib/db'
import {
  users,
  categories,
  tags,
  posts,
  postsToTags,
  comments,
  likes,
  commentLikes,
  bookmarks,
  follows,
} from '@/lib/db/schema'
import bcrypt from 'bcryptjs'

const coverImages = {
  tech: [
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=800&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80',
  ],
  life: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  ],
  design: [
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80',
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&q=80',
    'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
  ],
  ai: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
  ],
}

function estimateReadingTime(content: string) {
  return Math.max(1, Math.ceil(content.length / 250))
}

function createPostMarkdown(title: string, sections: { h2: string; bullets: string[] }[]) {
  let md = `# ${title}\n\n`
  for (const s of sections) {
    md += `## ${s.h2}\n\n`
    for (const b of s.bullets) md += `- ${b}\n`
    md += '\n'
  }
  return md
}

async function seed() {
  console.log('🌱 Seeding database...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('password123', 10)

  // ==================== Users ====================
  const userSeeds = [
    {
      email: 'admin@example.com',
      username: 'admin',
      name: 'Administrator',
      role: 'ADMIN' as const,
      passwordHash: adminPassword,
      avatar: null,
      bio: '系统管理员，负责博客运维',
      github: 'admin-user',
      twitter: null,
      website: null,
    },
    {
      email: 'xiaolin@example.com',
      username: 'xiaolin',
      name: '林小雨',
      role: 'AUTHOR' as const,
      passwordHash: userPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaolin',
      bio: '前端开发者，热爱 React 和 UI 设计',
      github: 'xiaolin-dev',
      twitter: 'xiaolin_dev',
      website: 'https://xiaolin.dev',
    },
    {
      email: 'haoran@example.com',
      username: 'haoran',
      name: '张浩然',
      role: 'AUTHOR' as const,
      passwordHash: userPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=haoran',
      bio: '全栈工程师，Node.js 和 Go 爱好者',
      github: 'haoran-zhang',
      twitter: 'haoran_zh',
      website: 'https://haoran.dev',
    },
    {
      email: 'siqi@example.com',
      username: 'siqi',
      name: '王思琪',
      role: 'AUTHOR' as const,
      passwordHash: userPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=siqi',
      bio: '后端架构师，数据库和分布式系统专家',
      github: 'siqi-wang',
      twitter: 'siqi_w',
      website: 'https://siqi.dev',
    },
    {
      email: 'mingyuan@example.com',
      username: 'mingyuan',
      name: '陈明远',
      role: 'AUTHOR' as const,
      passwordHash: userPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mingyuan',
      bio: 'DevOps 工程师，云原生实践者',
      github: 'mingyuan-chen',
      twitter: 'mingyuan_c',
      website: null,
    },
    {
      email: 'zixuan@example.com',
      username: 'zixuan',
      name: '刘子轩',
      role: 'USER' as const,
      passwordHash: userPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zixuan',
      bio: '在读大学生，正在学习前端开发',
      github: 'zixuan-liu',
      twitter: null,
      website: null,
    },
    {
      email: 'jingwen@example.com',
      username: 'jingwen',
      name: '赵静雯',
      role: 'USER' as const,
      passwordHash: userPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jingwen',
      bio: '产品经理，对技术充满好奇',
      github: 'jingwen-zhao',
      twitter: 'jingwen_pm',
      website: null,
    },
    {
      email: 'kaiwen@example.com',
      username: 'kaiwen',
      name: '周凯文',
      role: 'USER' as const,
      passwordHash: userPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kaiwen',
      bio: '后端开发新手，喜欢 Python 和数据分析',
      github: 'kaiwen-zhou',
      twitter: null,
      website: null,
    },
    {
      email: 'mengting@example.com',
      username: 'mengting',
      name: '李梦婷',
      role: 'MODERATOR' as const,
      passwordHash: userPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mengting',
      bio: '社区运营，维护良好的技术交流氛围',
      github: 'mengting-li',
      twitter: 'mengting_com',
      website: null,
    },
  ]

  let usersCreated = 0
  for (const u of userSeeds) {
    const result = await db.insert(users).values(u).onConflictDoNothing().returning({ id: users.id })
    if (result.length > 0) usersCreated++
  }
  console.log(`✅ ${usersCreated} users created`)

  // ==================== Categories ====================
  const categorySeeds = [
    { name: '技术', slug: 'tech', description: '技术文章和教程', icon: '💻' },
    { name: '生活', slug: 'life', description: '生活随笔和感悟', icon: '🌟' },
    { name: '随笔', slug: 'notes', description: '随手记录和想法', icon: '📝' },
    { name: '设计', slug: 'design', description: '设计与创意', icon: '🎨' },
    { name: '后端', slug: 'backend', description: '后端开发技术', icon: '⚙️' },
    { name: '人工智能', slug: 'ai', description: 'AI 与机器学习', icon: '🤖' },
    { name: 'DevOps', slug: 'devops', description: '运维与基础设施', icon: '🚀' },
  ]

  let categoriesCreated = 0
  for (const c of categorySeeds) {
    const result = await db.insert(categories).values(c).onConflictDoNothing().returning({ id: categories.id })
    if (result.length > 0) categoriesCreated++
  }
  console.log(`✅ ${categoriesCreated} categories created`)

  // ==================== Tags ====================
  const tagSeeds = [
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
    { name: 'Rust', slug: 'rust', description: 'Rust 语言' },
    { name: 'Kubernetes', slug: 'kubernetes', description: 'K8s' },
    { name: '前端工程化', slug: 'frontend-engineering', description: '工程化实践' },
    { name: '后端架构', slug: 'backend-architecture', description: '架构设计' },
    { name: 'DevOps', slug: 'devops', description: 'DevOps' },
    { name: '机器学习', slug: 'machine-learning', description: 'ML' },
    { name: '开源', slug: 'open-source', description: '开源项目' },
    { name: '面试', slug: 'interview', description: '面试经验' },
    { name: '职场', slug: 'career', description: '职业发展' },
    { name: '健康', slug: 'health', description: '身心健康' },
    { name: '效率工具', slug: 'productivity', description: '工具推荐' },
  ]

  let tagsCreated = 0
  for (const t of tagSeeds) {
    const result = await db.insert(tags).values(t).onConflictDoNothing().returning({ id: tags.id })
    if (result.length > 0) tagsCreated++
  }
  console.log(`✅ ${tagsCreated} tags created`)

  // ==================== Fetch references ====================
  const allUsers = await db.query.users.findMany()
  const allCategories = await db.query.categories.findMany()
  const allTags = await db.query.tags.findMany()

  const adminUser = allUsers.find((u) => u.username === 'admin')
  const getCatId = (slug: string) => allCategories.find((c) => c.slug === slug)?.id || allCategories[0].id
  const getTagIds = (slugs: string[]) => allTags.filter((t) => slugs.includes(t.slug)).map((t) => t.id)

  // ==================== Posts ====================
  const postDefinitions = [
    // 1
    {
      title: 'Next.js 16 新特性详解：Turbopack 完全指南',
      slug: 'nextjs-16-features-turbopack',
      excerpt: '深入了解 Next.js 16 带来的革命性变化，包括 Turbopack 稳定版、Server Actions 改进等。',
      content: createPostMarkdown('Next.js 16 新特性详解：Turbopack 完全指南', [
        { h2: 'Turbopack 稳定版', bullets: ['比 Webpack 快 700 倍，比 Vite 快 10 倍','使用 Rust 编写，为开发环境提供极致性能'] },
        { h2: 'Server Actions 改进', bullets: ['支持更多服务端交互场景','无需创建额外 API 路由'] },
        { h2: '部分预渲染', bullets: ['静态页面中嵌入动态内容','实现最佳用户体验'] },
        { h2: '总结', bullets: ['更好的开发体验和更快的构建速度','值得所有 Next.js 项目升级'] },
      ]),
      categorySlug: 'tech',
      tagSlugs: ['nextjs', 'react'],
      authorUsername: 'admin',
      published: true,
      views: 1289,
      coverImage: coverImages.tech[0],
    },
    // 2
    {
      title: 'TypeScript 5.8 新功能与最佳实践',
      slug: 'typescript-5-8-features',
      excerpt: 'TypeScript 5.8 带来了更强大的类型推断和新的语法特性，让代码更加健壮。',
      content: createPostMarkdown('TypeScript 5.8 新功能与最佳实践', [
        { h2: '更智能的类型推断', bullets: ['编译器更好地理解代码意图','条件类型和泛型处理更简洁'] },
        { h2: '性能优化', bullets: ['编译速度提升 15%','大型项目反馈循环更短'] },
        { h2: '新语法特性', bullets: ['更好的装饰器支持','改进的 JSDoc 解析','更严格的类型检查选项'] },
        { h2: '实际应用', bullets: ['重构代码使其更加类型安全','减少显式类型注解'] },
      ]),
      categorySlug: 'tech',
      tagSlugs: ['typescript', 'nodejs'],
      authorUsername: 'admin',
      published: true,
      views: 892,
      coverImage: coverImages.tech[1],
    },
    // 3
    {
      title: 'React Server Components 深入解析',
      slug: 'react-server-components-deep-dive',
      excerpt: '深入理解 React Server Components 的工作原理，以及如何在项目中正确使用。',
      content: createPostMarkdown('React Server Components 深入解析', [
        { h2: '什么是 Server Components', bullets: ['在服务器端渲染的 React 组件','不向客户端发送任何 JavaScript 代码'] },
        { h2: '与 Client Components 的区别', bullets: ['Server Components 可访问服务器端资源','Client Components 可访问浏览器 API','两者可以无缝组合使用'] },
        { h2: '最佳实践', bullets: ['尽可能使用 Server Components','只在需要客户端交互的地方使用 Client Components'] },
        { h2: '性能优势', bullets: ['减少发送到客户端的 JavaScript','显著提高首屏加载速度'] },
      ]),
      categorySlug: 'tech',
      tagSlugs: ['react', 'nextjs'],
      authorUsername: 'xiaolin',
      published: true,
      views: 2156,
      coverImage: coverImages.tech[2],
    },
    // 4
    {
      title: 'Docker 容器化部署完全指南',
      slug: 'docker-deployment-guide',
      excerpt: '从零开始学习 Docker，掌握容器化部署的核心概念和实战技巧。',
      content: createPostMarkdown('Docker 容器化部署完全指南', [
        { h2: '什么是 Docker', bullets: ['开源的容器化平台','将应用及其依赖打包到轻量级容器中'] },
        { h2: '核心概念', bullets: ['镜像：应用的只读模板','容器：镜像的运行实例','Dockerfile：定义构建步骤','Docker Compose：多容器编排'] },
        { h2: '实战示例', bullets: ['创建 Node.js 应用的 Docker 配置','多阶段构建优化镜像体积'] },
        { h2: '部署策略', bullets: ['使用 Docker Swarm 或 Kubernetes 进行编排','实现大规模容器管理'] },
      ]),
      categorySlug: 'backend',
      tagSlugs: ['docker', 'nodejs', 'linux'],
      authorUsername: 'mingyuan',
      published: true,
      views: 1567,
      coverImage: coverImages.tech[5],
    },
    // 5
    {
      title: 'PostgreSQL vs MySQL：2024年如何选择',
      slug: 'postgresql-vs-mysql-2024',
      excerpt: '对比两款最流行的开源数据库，从性能、功能、生态等多角度分析，帮助你做出正确选择。',
      content: createPostMarkdown('PostgreSQL vs MySQL：2024年如何选择', [
        { h2: 'PostgreSQL 优势', bullets: ['更强大的 SQL 支持和高级数据类型','更好的扩展性和并发控制'] },
        { h2: 'MySQL 优势', bullets: ['简单易用，学习曲线平缓','广泛的社区支持和成熟的生态系统'] },
        { h2: '性能对比', bullets: ['复杂查询场景 PostgreSQL 更优','简单读写 MySQL 略快'] },
        { h2: '结论', bullets: ['PostgreSQL 适合复杂应用和地理信息','MySQL 适合快速开发和已有生态'] },
      ]),
      categorySlug: 'backend',
      tagSlugs: ['database', 'nodejs'],
      authorUsername: 'siqi',
      published: true,
      views: 3421,
      coverImage: coverImages.tech[3],
    },
    // 6
    {
      title: 'Tailwind CSS 4.0 新特性实战',
      slug: 'tailwind-css-4-features',
      excerpt: '探索 Tailwind CSS 4.0 的重大更新，包括更快的构建速度和新的主题系统。',
      content: createPostMarkdown('Tailwind CSS 4.0 新特性实战', [
        { h2: '零配置', bullets: ['不再需要 tailwind.config.js','所有配置通过 CSS 变量完成'] },
        { h2: '更快的构建速度', bullets: ['基于 Rust 的新引擎','构建速度提升 10 倍'] },
        { h2: '新的主题系统', bullets: ['CSS 变量主题支持','运行时主题切换','更简单的暗色模式配置'] },
        { h2: '迁移指南', bullets: ['更新依赖、转换配置文件、测试调试'] },
      ]),
      categorySlug: 'tech',
      tagSlugs: ['css', 'react'],
      authorUsername: 'xiaolin',
      published: true,
      views: 1876,
      coverImage: coverImages.tech[4],
    },
    // 7
    {
      title: 'Go 语言微服务架构实战',
      slug: 'go-microservices-architecture',
      excerpt: '使用 Go 语言构建高性能微服务，包括服务发现、负载均衡和分布式追踪。',
      content: createPostMarkdown('Go 语言微服务架构实战', [
        { h2: '为什么选择 Go', bullets: ['编译速度快，二进制部署无依赖','goroutine 和 channel 原生并发支持'] },
        { h2: '服务发现', bullets: ['使用 Consul 或 etcd 实现服务注册和发现'] },
        { h2: 'API 网关', bullets: ['使用 Kong 或自研网关处理认证、限流、日志'] },
        { h2: '监控和追踪', bullets: ['集成 Prometheus 和 Jaeger','实现全面的可观测性'] },
      ]),
      categorySlug: 'backend',
      tagSlugs: ['go', 'docker'],
      authorUsername: 'haoran',
      published: true,
      views: 2341,
      coverImage: coverImages.tech[6],
    },
    // 8
    {
      title: 'AI 辅助编程：ChatGPT 与 Copilot 对比',
      slug: 'ai-coding-assistant-comparison',
      excerpt: '深度对比主流 AI 编程助手，看看哪个更适合你的开发 workflow。',
      content: createPostMarkdown('AI 辅助编程：ChatGPT 与 Copilot 对比', [
        { h2: 'GitHub Copilot', bullets: ['实时代码补全，深度集成 IDE','适合日常编码和重复性代码'] },
        { h2: 'ChatGPT / Claude', bullets: ['更长上下文，可解释代码和架构设计','适合代码审查和学习教学'] },
        { h2: '实际测试', bullets: ['算法实现、调试帮助、代码重构、文档生成'] },
        { h2: '最佳实践', bullets: ['结合使用两者，发挥各自优势'] },
      ]),
      categorySlug: 'tech',
      tagSlugs: ['ai', 'typescript'],
      authorUsername: 'admin',
      published: true,
      views: 4521,
      coverImage: coverImages.tech[7],
    },
    // 9
    {
      title: '现代 UI 设计趋势 2024',
      slug: 'ui-design-trends-2024',
      excerpt: '探索今年最流行的 UI 设计趋势，包括玻璃拟态、新拟态和极简主义。',
      content: createPostMarkdown('现代 UI 设计趋势 2024', [
        { h2: '玻璃拟态', bullets: ['半透明、模糊背景效果继续流行','创造层次感和现代感'] },
        { h2: '新拟态', bullets: ['柔和阴影效果创造浮雕视觉','适合突出材质感的场景'] },
        { h2: '极简主义', bullets: ['更干净的布局、更多留白、更克制的配色'] },
        { h2: '工具推荐', bullets: ['Figma 协作设计','Framer 原型制作','Rive 复杂动画'] },
      ]),
      categorySlug: 'design',
      tagSlugs: ['ui-design', 'css'],
      authorUsername: 'xiaolin',
      published: true,
      views: 1654,
      coverImage: coverImages.design[0],
    },
    // 10
    {
      title: '设计系统的构建与维护',
      slug: 'design-system-guide',
      excerpt: '从 0 到 1 构建企业级设计系统，包括组件库、设计令牌和文档规范。',
      content: createPostMarkdown('设计系统的构建与维护', [
        { h2: '什么是设计系统', bullets: ['可复用的组件和清晰的标准','支持数字产品开发'] },
        { h2: '核心组成部分', bullets: ['设计令牌：颜色、字体、间距、圆角','组件库：基础、复合、业务组件'] },
        { h2: '文档和指南', bullets: ['使用规范、设计原则、最佳实践'] },
        { h2: '实施策略', bullets: ['从小规模开始，逐步扩展，持续迭代'] },
      ]),
      categorySlug: 'design',
      tagSlugs: ['ui-design', 'react'],
      authorUsername: 'xiaolin',
      published: true,
      views: 987,
      coverImage: coverImages.design[1],
    },
    // 11
    {
      title: '我的编程学习之路：从零到全栈',
      slug: 'my-coding-journey-fullstack',
      excerpt: '从初学者到全栈开发者的成长历程，分享我的经验和心得，希望能给你一些启发。',
      content: createPostMarkdown('我的编程学习之路：从零到全栈', [
        { h2: '入门阶段', bullets: ['学习 HTML/CSS/JavaScript','做个人简历、Todo、天气应用等小项目'] },
        { h2: '迷茫期', bullets: ['前端框架众多，最终选择 React','因为社区活跃和工作机会多'] },
        { h2: '进阶成长', bullets: ['学习 React、Node.js 全栈开发','完成第一个商业项目，开始写技术博客'] },
        { h2: '心得体会', bullets: ['坚持练习、项目驱动、社区参与、持续学习'] },
      ]),
      categorySlug: 'life',
      tagSlugs: ['reading', 'react', 'nodejs'],
      authorUsername: 'admin',
      published: true,
      views: 3256,
      coverImage: coverImages.life[2],
    },
    // 12
    {
      title: '远程工作三年：我的经验与反思',
      slug: 'remote-work-3-years',
      excerpt: '疫情后远程工作成为常态，分享我三年远程工作的真实体验和心得。',
      content: createPostMarkdown('远程工作三年：我的经验与反思', [
        { h2: '优点', bullets: ['时间灵活，避开高峰期','节省通勤时间','环境舒适'] },
        { h2: '挑战', bullets: ['文字沟通效率低，容易产生误解','工作和生活边界模糊','有时会感到孤独'] },
        { h2: '我的解决方案', bullets: ['建立固定工作时间表','设置专门办公空间','定期参加线下活动'] },
        { h2: '总结', bullets: ['远程工作需要自律，但也能带来更好的生活质量'] },
      ]),
      categorySlug: 'life',
      tagSlugs: ['life', 'reading'],
      authorUsername: 'admin',
      published: true,
      views: 2134,
      coverImage: coverImages.life[0],
    },
    // 13
    {
      title: '程序员的咖啡指南',
      slug: 'programmer-coffee-guide',
      excerpt: '作为程序员，咖啡是续命神器。分享我的咖啡入门指南和冲煮心得。',
      content: createPostMarkdown('程序员的咖啡指南', [
        { h2: '咖啡豆的选择', bullets: ['埃塞俄比亚：花香、果酸','哥伦比亚：平衡、坚果','巴西：醇厚、巧克力'] },
        { h2: '烘焙度', bullets: ['浅烘：酸度高，风味丰富','中烘：平衡，适合入门','深烘：苦味重，提神效果好'] },
        { h2: '冲煮方法', bullets: ['手冲：最纯粹的方式','意式浓缩：浓郁强烈','冷萃：低酸度，适合夏天'] },
        { h2: '我的日常', bullets: ['早晨一杯手冲，下午一杯意式'] },
      ]),
      categorySlug: 'life',
      tagSlugs: ['life'],
      authorUsername: 'admin',
      published: true,
      views: 1567,
      coverImage: coverImages.life[1],
    },
    // 14
    {
      title: '2024 年技术书单推荐',
      slug: '2024-tech-book-recommendations',
      excerpt: '精选今年值得一读的技术书籍，涵盖编程、架构、AI 等多个领域。',
      content: createPostMarkdown('2024 年技术书单推荐', [
        { h2: '编程基础', bullets: ['《代码整洁之道》：写出可读可维护的代码','《设计模式》：每个程序员的必读经典'] },
        { h2: '系统架构', bullets: ['《数据密集型应用系统设计》：深入浅出分布式系统','《构建微服务》：微服务架构实战指南'] },
        { h2: 'AI 与机器学习', bullets: ['《动手学深度学习》：理论与实践结合'] },
        { h2: '软技能', bullets: ['《程序员修炼之道》：技术与职业发展建议'] },
      ]),
      categorySlug: 'life',
      tagSlugs: ['reading', 'ai'],
      authorUsername: 'admin',
      published: true,
      views: 2890,
      coverImage: coverImages.life[4],
    },
    // 15
    {
      title: '周末登山：逃离代码，拥抱自然',
      slug: 'weekend-hiking-escape',
      excerpt: '程序员的周末应该怎么过？我的答案是去山里走走，让大脑彻底放松。',
      content: createPostMarkdown('周末登山：逃离代码，拥抱自然', [
        { h2: '为什么选择登山', bullets: ['身体锻炼，改善久坐问题','大脑休息，远离屏幕','登顶成就感'] },
        { h2: '入门建议', bullets: ['舒适的登山鞋、双肩背包','水和食物、防晒用品','新手选择成熟路线'] },
        { h2: '我常去的路线', bullets: ['北京：香山、八达岭','杭州：九溪、龙井','成都：青城山、都江堰'] },
        { h2: '写在最后', bullets: ['工作重要，但健康更重要'] },
      ]),
      categorySlug: 'life',
      tagSlugs: ['travel', 'life'],
      authorUsername: 'admin',
      published: true,
      views: 1890,
      coverImage: coverImages.life[3],
    },
    // 16
    {
      title: '从 Vue 迁移到 React 的一些思考',
      slug: 'vue-to-react-migration',
      excerpt: '团队决定将项目从 Vue 迁移到 React，记录这个过程中的思考和经验。',
      content: createPostMarkdown('从 Vue 迁移到 React 的一些思考', [
        { h2: '为什么要迁移', bullets: ['Vue 2 即将停止维护','团队 React 经验更丰富','React 生态更加丰富'] },
        { h2: '迁移策略', bullets: ['渐进式迁移，新功能用 React','旧功能逐步替换','微前端架构过渡'] },
        { h2: '学到的经验', bullets: ['不要低估迁移成本','团队培训很重要','文档是关键'] },
        { h2: '结论', bullets: ['没有最好的框架，只有最适合团队的框架'] },
      ]),
      categorySlug: 'notes',
      tagSlugs: ['vue', 'react'],
      authorUsername: 'haoran',
      published: true,
      views: 1456,
      coverImage: coverImages.tech[8],
    },
    // 17
    {
      title: 'CSS 变量在大型项目中的实践',
      slug: 'css-variables-in-large-projects',
      excerpt: '分享我们在大型项目中使用 CSS 变量的经验，包括主题切换和设计令牌的实现。',
      content: createPostMarkdown('CSS 变量在大型项目中的实践', [
        { h2: '为什么选择 CSS 变量', bullets: ['运行时动态修改','利用 CSS 级联特性实现局部覆盖','减少重复'] },
        { h2: '实际应用', bullets: ['主题切换：通过 data-theme 改变变量值','设计令牌：统一管理 spacing、color'] },
        { h2: '最佳实践', bullets: ['命名要有意义','提供合理的默认值','文档化所有变量'] },
        { h2: '性能考虑', bullets: ['CSS 变量的性能开销很小，可以放心使用'] },
      ]),
      categorySlug: 'notes',
      tagSlugs: ['css'],
      authorUsername: 'xiaolin',
      published: true,
      views: 987,
      coverImage: coverImages.design[2],
    },
    // 18
    {
      title: 'Python 数据分析入门指南',
      slug: 'python-data-analysis-guide',
      excerpt: '非程序员也能学会的数据分析入门教程，使用 Python 进行数据处理。',
      content: createPostMarkdown('Python 数据分析入门指南', [
        { h2: '为什么选择 Python', bullets: ['语法简单，易于学习','丰富的数据分析库','活跃的社区支持'] },
        { h2: '核心库介绍', bullets: ['Pandas：DataFrame 数据处理','NumPy：高效数组操作','Matplotlib：数据可视化'] },
        { h2: '入门示例', bullets: ['读取 CSV、查看 head、describe 统计分析'] },
        { h2: '学习资源', bullets: ['《Python 数据分析》、Kaggle 教程、YouTube 视频'] },
      ]),
      categorySlug: 'tech',
      tagSlugs: ['python', 'ai'],
      authorUsername: 'kaiwen',
      published: true,
      views: 2345,
      coverImage: coverImages.tech[9],
    },
    // 19
    {
      title: '代码审查的艺术',
      slug: 'art-of-code-review',
      excerpt: '如何做好代码审查？分享我的经验和 checklist，帮助团队提高代码质量。',
      content: createPostMarkdown('代码审查的艺术', [
        { h2: '为什么要做 Code Review', bullets: ['早期发现 Bug，降低修复成本','团队成员互相学习','保持代码风格一致性'] },
        { h2: 'Review Checklist', bullets: ['功能性：是否实现需求、边界条件、错误处理','可读性：命名、函数长度、注释'] },
        { h2: 'Review 礼仪', bullets: ['对事不对人','解释原因','给予肯定','及时响应'] },
        { h2: '工具推荐', bullets: ['GitHub Pull Requests','GitLab Merge Requests'] },
      ]),
      categorySlug: 'notes',
      tagSlugs: ['reading'],
      authorUsername: 'siqi',
      published: true,
      views: 1123,
      coverImage: coverImages.tech[1],
    },
    // 20
    {
      title: '未发布：Rust 学习笔记（连载中）',
      slug: 'rust-learning-notes-draft',
      excerpt: '正在学习 Rust，这是一篇还没写完的笔记。',
      content: createPostMarkdown('Rust 学习笔记', [
        { h2: '所有权系统', bullets: ['Rust 最独特的特性','编译时保证内存安全'] },
        { h2: '借用与生命周期', bullets: ['避免悬垂指针','理解 &str 和 String 的区别'] },
        { h2: '并发安全', bullets: ['所有权模型天然避免数据竞争'] },
      ]),
      categorySlug: 'notes',
      tagSlugs: ['rust'],
      authorUsername: 'admin',
      published: false,
      views: 0,
      coverImage: coverImages.tech[0],
    },
    // 21
    {
      title: 'React 19 Actions 完全指南',
      slug: 'react-19-actions-guide',
      excerpt: '深入了解 React 19 Actions 新特性，简化表单和异步状态管理。',
      content: createPostMarkdown('React 19 Actions 完全指南', [
        { h2: 'Actions 简介', bullets: ['处理异步状态更新的新方式','统一了 pending、error、success 等状态'] },
        { h2: 'useActionState', bullets: ['简化表单状态管理','自动处理提交中的 loading 状态'] },
        { h2: 'useOptimistic', bullets: ['提供乐观更新的原生支持','无需手动管理回滚逻辑'] },
        { h2: '最佳实践', bullets: ['优先使用 Server Actions','在客户端配合 useTransition 使用'] },
      ]),
      categorySlug: 'tech',
      tagSlugs: ['react', 'nextjs'],
      authorUsername: 'xiaolin',
      published: true,
      views: 3421,
      coverImage: coverImages.tech[0],
    },
    // 22
    {
      title: 'Zustand 与 Redux：2024 状态管理选择',
      slug: 'zustand-vs-redux-2024',
      excerpt: '对比两款主流 React 状态管理库，帮助你在新项目中做出正确选择。',
      content: createPostMarkdown('Zustand 与 Redux：2024 状态管理选择', [
        { h2: 'Zustand 优势', bullets: ['轻量、无样板代码','Hooks 风格的 API 非常直观'] },
        { h2: 'Redux 优势', bullets: ['Redux DevTools 调试体验极佳','中间件生态丰富'] },
        { h2: '2024 选择建议', bullets: ['小项目用 Zustand','大项目用 Redux Toolkit'] },
        { h2: '迁移建议', bullets: ['可以逐步替换，无需一次性重写'] },
      ]),
      categorySlug: 'tech',
      tagSlugs: ['react', 'typescript'],
      authorUsername: 'xiaolin',
      published: true,
      views: 2789,
      coverImage: coverImages.tech[2],
    },
    // 23
    {
      title: 'Next.js App Router 迁移实战',
      slug: 'nextjs-app-router-migration',
      excerpt: '记录我们将一个大型项目从 Pages Router 迁移到 App Router 的全过程。',
      content: createPostMarkdown('Next.js App Router 迁移实战', [
        { h2: '迁移准备', bullets: ['理解 Pages Router 和 App Router 的核心差异','评估迁移成本和收益'] },
        { h2: '常见坑', bullets: ['Server Component 中误用客户端 API','缓存策略变化导致数据不更新'] },
        { h2: '性能提升', bullets: ['预渲染和流式传输带来更好的首屏体验'] },
        { h2: '团队经验', bullets: ['完善的迁移文档和团队培训至关重要'] },
      ]),
      categorySlug: 'tech',
      tagSlugs: ['nextjs', 'react'],
      authorUsername: 'xiaolin',
      published: true,
      views: 3156,
      coverImage: coverImages.tech[3],
    },
    // 24
    {
      title: 'Drizzle ORM：类型安全的数据库之旅',
      slug: 'drizzle-orm-guide',
      excerpt: '介绍 Drizzle ORM 的设计理念，以及如何在项目中享受类型安全的数据库操作。',
      content: createPostMarkdown('Drizzle ORM：类型安全的数据库之旅', [
        { h2: 'Drizzle 特点', bullets: ['类型安全、SQL-like 的查询 API','更接近 SQL，学习成本低'] },
        { h2: '与 ORM 对比', bullets: ['比传统 ORM 更轻量','没有隐式查询和魔法'] },
        { h2: '实战示例', bullets: ['CRUD 操作、关系查询、迁移管理'] },
        { h2: '适用场景', bullets: ['追求类型安全和 SQL 透明度的团队'] },
      ]),
      categorySlug: 'backend',
      tagSlugs: ['database', 'typescript'],
      authorUsername: 'haoran',
      published: true,
      views: 1987,
      coverImage: coverImages.tech[4],
    },
    // 25
    {
      title: 'Prisma 还是 Drizzle？一年后我的选择',
      slug: 'prisma-vs-drizzle-one-year',
      excerpt: '同时使用 Prisma 和 Drizzle 一年后，分享我的真实体验和选型建议。',
      content: createPostMarkdown('Prisma 还是 Drizzle？一年后我的选择', [
        { h2: 'Prisma 优势', bullets: ['成熟生态、直观 API、强大的 Client'] },
        { h2: 'Drizzle 优势', bullets: ['轻量、无查询引擎、完全 SQL 透明'] },
        { h2: '一年实践', bullets: ['快速原型用 Prisma','性能敏感场景用 Drizzle'] },
        { h2: '迁移成本', bullets: ['Schema 转换需要一定工作量，但查询层迁移较平滑'] },
      ]),
      categorySlug: 'backend',
      tagSlugs: ['database', 'nodejs'],
      authorUsername: 'haoran',
      published: true,
      views: 2567,
      coverImage: coverImages.tech[5],
    },
    // 26
    {
      title: 'Kubernetes 入门：从 Docker 到 K8s',
      slug: 'kubernetes-beginner-guide',
      excerpt: '零基础入门 Kubernetes，理解容器编排的核心概念和基本操作。',
      content: createPostMarkdown('Kubernetes 入门：从 Docker 到 K8s', [
        { h2: '为什么需要 K8s', bullets: ['Docker 解决了单容器部署，但多容器管理复杂','K8s 提供自动扩缩容、服务发现、故障恢复'] },
        { h2: '核心概念', bullets: ['Pod：最小调度单元','Service：暴露应用的网络入口','Deployment：管理 Pod 副本'] },
        { h2: 'minikube 实战', bullets: ['本地搭建单节点 K8s 集群','部署第一个 Nginx 应用'] },
        { h2: '学习路径', bullets: ['官方文档、CKAD 认证、实际项目演练'] },
      ]),
      categorySlug: 'devops',
      tagSlugs: ['docker', 'kubernetes'],
      authorUsername: 'mingyuan',
      published: true,
      views: 2890,
      coverImage: coverImages.tech[6],
    },
    // 27
    {
      title: 'Git 高级技巧：Rebase 与 Cherry-pick',
      slug: 'git-advanced-tips',
      excerpt: '掌握 Git 高级命令，让你的版本控制更加得心应手。',
      content: createPostMarkdown('Git 高级技巧：Rebase 与 Cherry-pick', [
        { h2: 'Rebase', bullets: ['整理提交历史，保持线性','交互式 rebase 修改、合并、删除提交'] },
        { h2: 'Cherry-pick', bullets: ['将特定提交应用到其他分支','适合 hotfix 场景'] },
        { h2: 'Bisect', bullets: ['二分查找引入 Bug 的提交','快速定位问题'] },
        { h2: '团队协作', bullets: ['避免在公共分支使用 force push','rebase 前确认没有他人基于该分支工作'] },
      ]),
      categorySlug: 'tech',
      tagSlugs: ['nodejs', 'frontend-engineering'],
      authorUsername: 'haoran',
      published: true,
      views: 1765,
      coverImage: coverImages.tech[7],
    },
    // 28
    {
      title: 'Node.js Stream 处理大文件',
      slug: 'nodejs-stream-large-files',
      excerpt: '使用 Node.js Stream 高效处理大文件，避免内存溢出。',
      content: createPostMarkdown('Node.js Stream 处理大文件', [
        { h2: '为什么用 Stream', bullets: ['无需一次性将文件读入内存','适合处理 GB 级文件'] },
        { h2: 'Readable 和 Writable', bullets: ['通过 pipe 连接流','实现数据的逐步处理'] },
        { h2: '实战示例', bullets: ['大文件复制、CSV 数据清洗、日志分析'] },
        { h2: '背压机制', bullets: ['自动调节读写速度，防止内存溢出'] },
      ]),
      categorySlug: 'backend',
      tagSlugs: ['nodejs', 'backend-architecture'],
      authorUsername: 'haoran',
      published: true,
      views: 2134,
      coverImage: coverImages.tech[8],
    },
    // 29
    {
      title: 'WebAssembly：浏览器的第二语言',
      slug: 'webassembly-intro',
      excerpt: '了解 WebAssembly 如何让浏览器运行高性能代码，以及在前端工程中的应用场景。',
      content: createPostMarkdown('WebAssembly：浏览器的第二语言', [
        { h2: 'WASM 简介', bullets: ['浏览器中运行接近原生速度的二进制代码','C、C++、Rust 等语言可编译为 WASM'] },
        { h2: 'Rust to WASM', bullets: ['wasm-pack 工具链简化构建过程','与 JavaScript 无缝互操作'] },
        { h2: '应用场景', bullets: ['图像处理、视频编解码、游戏引擎、加密计算'] },
        { h2: '性能对比', bullets: ['在计算密集型任务中比 JS 快 10-30 倍'] },
      ]),
      categorySlug: 'tech',
      tagSlugs: ['rust', 'react'],
      authorUsername: 'xiaolin',
      published: true,
      views: 1654,
      coverImage: coverImages.tech[9],
    },
    // 30
    {
      title: 'Edge Runtime 实战指南',
      slug: 'edge-runtime-guide',
      excerpt: '对比 Edge Runtime 和 Serverless，探索边缘计算的实战应用场景。',
      content: createPostMarkdown('Edge Runtime 实战指南', [
        { h2: 'Edge 与 Serverless', bullets: ['Edge 启动时间更短，地理分布更广','Serverless 适合长任务和完整 Node API'] },
        { h2: 'Vercel Edge Functions', bullets: ['低延迟的全球分发','适合轻量级计算'] },
        { h2: '限制', bullets: ['包大小限制','不支持部分 Node.js 内置模块'] },
        { h2: '适用场景', bullets: ['用户鉴权、A/B 测试、地理位置个性化'] },
      ]),
      categorySlug: 'backend',
      tagSlugs: ['backend-architecture', 'nodejs'],
      authorUsername: 'siqi',
      published: true,
      views: 2345,
      coverImage: coverImages.tech[0],
    },
    // 31
    {
      title: 'Redis 缓存策略详解',
      slug: 'redis-caching-strategies',
      excerpt: '从缓存穿透到雪崩，全面掌握 Redis 缓存策略和最佳实践。',
      content: createPostMarkdown('Redis 缓存策略详解', [
        { h2: '缓存策略', bullets: ['Cache Aside：最常用的读写策略','Write Through：同步写缓存和数据库'] },
        { h2: '常见问题', bullets: ['缓存穿透：查询不存在的数据','缓存击穿：热点 key 过期','缓存雪崩：大量 key 同时过期'] },
        { h2: '布隆过滤器', bullets: ['高效判断元素是否可能存在','解决缓存穿透问题'] },
        { h2: '最佳实践', bullets: ['设置合理的过期时间','监控缓存命中率','做好降级方案'] },
      ]),
      categorySlug: 'backend',
      tagSlugs: ['database', 'backend-architecture'],
      authorUsername: 'siqi',
      published: true,
      views: 3123,
      coverImage: coverImages.tech[1],
    },
    // 32
    {
      title: 'REST API 设计规范',
      slug: 'rest-api-design-guide',
      excerpt: '总结 RESTful API 设计的最佳实践，让你的接口更加规范和易用。',
      content: createPostMarkdown('REST API 设计规范', [
        { h2: 'URL 设计', bullets: ['使用名词表示资源，避免动词','合理版本控制如 /v1/users'] },
        { h2: 'HTTP 方法', bullets: ['GET 查询、POST 创建、PUT 全量更新、PATCH 部分更新、DELETE 删除'] },
        { h2: '状态码', bullets: ['200 成功、201 创建、400 请求错误、401 未授权、404 不存在、500 服务器错误'] },
        { h2: '认证与安全', bullets: ['JWT Token 认证','接口限流防止滥用','HTTPS 强制传输'] },
      ]),
      categorySlug: 'backend',
      tagSlugs: ['backend-architecture', 'nodejs'],
      authorUsername: 'haoran',
      published: true,
      views: 2876,
      coverImage: coverImages.tech[2],
    },
    // 33
    {
      title: '消息队列选型：Kafka vs RabbitMQ',
      slug: 'kafka-vs-rabbitmq',
      excerpt: '对比两款主流消息队列，从架构设计到运维成本的全面分析。',
      content: createPostMarkdown('消息队列选型：Kafka vs RabbitMQ', [
        { h2: 'Kafka', bullets: ['高吞吐、日志型、持久化能力强','适合事件流和大数据管道'] },
        { h2: 'RabbitMQ', bullets: ['灵活路由、协议丰富、功能全面','适合传统企业消息队列'] },
        { h2: '使用场景', bullets: ['用户行为日志用 Kafka','订单状态通知用 RabbitMQ'] },
        { h2: '运维成本', bullets: ['Kafka 集群搭建和调优更复杂','RabbitMQ 管理界面更友好'] },
      ]),
      categorySlug: 'backend',
      tagSlugs: ['backend-architecture', 'go'],
      authorUsername: 'siqi',
      published: true,
      views: 2567,
      coverImage: coverImages.tech[3],
    },
    // 34
    {
      title: 'Figma Auto Layout 进阶',
      slug: 'figma-auto-layout-advanced',
      excerpt: '深入掌握 Figma Auto Layout，提升设计效率和组件规范性。',
      content: createPostMarkdown('Figma Auto Layout 进阶', [
        { h2: '基础概念', bullets: ['框架、内边距、间距的理解','方向和对齐方式'] },
        { h2: '响应式设计', bullets: ['自动调整大小实现自适应','固定与填充的结合使用'] },
        { h2: '嵌套技巧', bullets: ['复杂列表和卡片的布局','多层 Auto Layout 的组合'] },
        { h2: '组件化', bullets: ['结合 Variants 构建可复用组件','统一设计系统的布局规范'] },
      ]),
      categorySlug: 'design',
      tagSlugs: ['ui-design', 'css'],
      authorUsername: 'xiaolin',
      published: true,
      views: 1456,
      coverImage: coverImages.design[0],
    },
    // 35
    {
      title: '设计中的留白艺术',
      slug: 'art-of-whitespace',
      excerpt: '探讨留白在设计中的重要性，以及如何通过负空间提升界面质感。',
      content: createPostMarkdown('设计中的留白艺术', [
        { h2: '什么是留白', bullets: ['负空间是设计中未被元素占据的区域','能有效引导用户视线'] },
        { h2: '微留白与宏留白', bullets: ['微留白：字距、行距、按钮内边距','宏留白：板块之间的大片空白'] },
        { h2: '呼吸感', bullets: ['避免信息过载','让页面有呼吸的空间'] },
        { h2: '案例分析', bullets: ['Apple 的产品页','Notion 的简洁界面'] },
      ]),
      categorySlug: 'design',
      tagSlugs: ['ui-design', 'css'],
      authorUsername: 'jingwen',
      published: true,
      views: 1234,
      coverImage: coverImages.design[1],
    },
    // 36
    {
      title: 'Dark Mode 设计完全指南',
      slug: 'dark-mode-design-guide',
      excerpt: '从配色到层级，系统讲解 Dark Mode 设计的核心原则和实现方法。',
      content: createPostMarkdown('Dark Mode 设计完全指南', [
        { h2: '配色原则', bullets: ['降低对比度，避免纯黑背景','使用深灰作为基础色'] },
        { h2: '层级表达', bullets: ['通过不同透明度或色值区分层级','避免过多阴影'] },
        { h2: '图片处理', bullets: ['暗色模式下图片亮度可能需要微调','考虑使用 mask 或滤镜'] },
        { h2: '实现方式', bullets: ['CSS 变量定义两套主题','使用 prefers-color-scheme 媒体查询'] },
      ]),
      categorySlug: 'design',
      tagSlugs: ['ui-design', 'css'],
      authorUsername: 'xiaolin',
      published: true,
      views: 1987,
      coverImage: coverImages.design[3],
    },
    // 37
    {
      title: '程序员的健康管理',
      slug: 'developer-health-guide',
      excerpt: '久坐、熬夜、用眼过度？这份程序员健康指南请收好。',
      content: createPostMarkdown('程序员的健康管理', [
        { h2: '颈椎与腰椎', bullets: ['升降桌和人体工学椅是长期投资','每小时起身活动 5 分钟'] },
        { h2: '眼睛保护', bullets: ['20-20-20 法则：每 20 分钟看 20 英尺外 20 秒','室内光线充足，屏幕亮度适中'] },
        { h2: '运动建议', bullets: ['每周至少 150 分钟中等强度运动','游泳、跑步、瑜伽都是好选择'] },
        { h2: '心理健康', bullets: ['学会说 no，避免 burnout','培养工作之外的兴趣爱好'] },
      ]),
      categorySlug: 'life',
      tagSlugs: ['health', 'life'],
      authorUsername: 'mengting',
      published: true,
      views: 3421,
      coverImage: coverImages.life[5],
    },
    // 38
    {
      title: '如何构建个人知识库',
      slug: 'personal-knowledge-base',
      excerpt: '从工具选择到方法论，分享我构建个人知识库的经验。',
      content: createPostMarkdown('如何构建个人知识库', [
        { h2: '工具选择', bullets: ['Notion：全能型知识管理','Obsidian：本地优先、双链笔记','Logseq：大纲式思维工具'] },
        { h2: 'PARA 方法', bullets: ['Project 项目、Area 领域、Resource 资源、Archive 归档'] },
        { h2: '定期回顾', bullets: ['每周整理 inbox','每月回顾和归档过期内容'] },
        { h2: '输出倒逼输入', bullets: ['写博客、做分享是检验理解的好方式'] },
      ]),
      categorySlug: 'life',
      tagSlugs: ['productivity', 'reading'],
      authorUsername: 'jingwen',
      published: true,
      views: 2678,
      coverImage: coverImages.life[4],
    },
    // 39
    {
      title: '技术焦虑与终身学习',
      slug: 'tech-anxiety-lifelong-learning',
      excerpt: '面对快速变化的技术世界，如何保持平和心态并持续成长？',
      content: createPostMarkdown('技术焦虑与终身学习', [
        { h2: '焦虑来源', bullets: ['技术更新快，总有学不完的东西','35岁危机和行业竞争压力'] },
        { h2: '核心能力', bullets: ['解决问题的能力比掌握某个框架更重要','学习能力才是最核心的竞争力'] },
        { h2: '深耕与广度', bullets: ['在某一领域深耕成为专家','同时保持对相邻领域的了解'] },
        { h2: '终身学习', bullets: ['保持好奇心，把学习当作习惯而非任务'] },
      ]),
      categorySlug: 'notes',
      tagSlugs: ['career', 'reading'],
      authorUsername: 'zixuan',
      published: true,
      views: 2890,
      coverImage: coverImages.life[2],
    },
    // 40
    {
      title: '开源贡献初学者指南',
      slug: 'open-source-beginner-guide',
      excerpt: '想参与开源但不知道从何开始？这份指南帮你迈出第一步。',
      content: createPostMarkdown('开源贡献初学者指南', [
        { h2: '为什么参与', bullets: ['学习优秀代码、结识志同道合的开发者','为简历增添亮点'] },
        { h2: '入门方式', bullets: ['从文档修正和测试用例开始','不要一上来就尝试重构核心代码'] },
        { h2: '找到合适项目', bullets: ['关注 Good First Issue 标签','选择自己日常使用的项目'] },
        { h2: '礼仪规范', bullets: ['尊重维护者时间','提交前阅读贡献指南','保持礼貌和耐心'] },
      ]),
      categorySlug: 'notes',
      tagSlugs: ['open-source', 'reading'],
      authorUsername: 'mingyuan',
      published: true,
      views: 2134,
      coverImage: coverImages.tech[4],
    },
    // 41
    {
      title: 'LLM 应用开发入门',
      slug: 'llm-app-development',
      excerpt: '从大模型基础到 RAG，快速入门 LLM 应用开发。',
      content: createPostMarkdown('LLM 应用开发入门', [
        { h2: '大模型基础', bullets: ['理解 Prompt Engineering 的核心原则','学会给模型设定角色和约束'] },
        { h2: '框架选择', bullets: ['LangChain：灵活的链式调用','LlamaIndex：专注于 RAG 和文档问答'] },
        { h2: 'RAG 架构', bullets: ['文档切分、向量化、检索增强生成','解决大模型幻觉和知识时效性问题'] },
        { h2: '部署优化', bullets: ['模型量化降低显存占用','使用 vLLM 等推理加速框架'] },
      ]),
      categorySlug: 'ai',
      tagSlugs: ['ai', 'machine-learning'],
      authorUsername: 'kaiwen',
      published: true,
      views: 3567,
      coverImage: coverImages.ai[0],
    },
    // 42
    {
      title: 'LangChain 快速上手',
      slug: 'langchain-quickstart',
      excerpt: '用 LangChain 构建你的第一个 LLM 应用。',
      content: createPostMarkdown('LangChain 快速上手', [
        { h2: '核心概念', bullets: ['Chain：将多个调用串联起来','Agent：让模型自主决策使用工具','Memory：在多轮对话中保持上下文'] },
        { h2: '快速上手', bullets: ['安装 langchain 和 OpenAI 集成包','实现一个简单的问答链'] },
        { h2: '工具集成', bullets: ['接入搜索引擎、数据库、外部 API'] },
        { h2: '局限性', bullets: ['复杂链路的调试较困难','版本更新快，文档有时滞后'] },
      ]),
      categorySlug: 'ai',
      tagSlugs: ['ai', 'python'],
      authorUsername: 'kaiwen',
      published: true,
      views: 2890,
      coverImage: coverImages.ai[1],
    },
    // 43
    {
      title: '用 Python 做数据可视化',
      slug: 'python-data-visualization',
      excerpt: '从 Matplotlib 到 Plotly，掌握 Python 数据可视化的核心工具。',
      content: createPostMarkdown('用 Python 做数据可视化', [
        { h2: 'Matplotlib 基础', bullets: ['折线图、柱状图、散点图','自定义样式和主题'] },
        { h2: 'Seaborn 进阶', bullets: ['统计图表、热力图、分布图','与 Pandas DataFrame 无缝集成'] },
        { h2: 'Plotly 交互', bullets: ['网页端可交互图表','支持悬停、缩放、筛选'] },
        { h2: '实战项目', bullets: ['销售数据分析仪表板','用户行为漏斗可视化'] },
      ]),
      categorySlug: 'ai',
      tagSlugs: ['python', 'machine-learning'],
      authorUsername: 'kaiwen',
      published: true,
      views: 2345,
      coverImage: coverImages.ai[2],
    },
  ]

  // ==================== Insert Posts ====================
  let postsCreated = 0
  const createdPosts: { id: string; slug: string; published: boolean }[] = []

  for (const pd of postDefinitions) {
    const existing = await db.query.posts.findFirst({
      where: (p, { eq }) => eq(p.slug, pd.slug),
    })

    if (!existing) {
      const author = allUsers.find((u) => u.username === pd.authorUsername) || adminUser
      const [post] = await db.insert(posts).values({
        title: pd.title,
        slug: pd.slug,
        excerpt: pd.excerpt,
        content: pd.content,
        coverImage: pd.coverImage,
        published: pd.published,
        featured: Math.random() < 0.15,
        views: pd.views,
        likesCount: 0,
        commentsCount: 0,
        readingTime: estimateReadingTime(pd.content),
        authorId: author!.id,
        categoryId: getCatId(pd.categorySlug),
        publishedAt: pd.published
          ? new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365)
          : null,
      }).returning()

      createdPosts.push(post)

      const tagIds = getTagIds(pd.tagSlugs)
      if (tagIds.length > 0) {
        await db.insert(postsToTags).values(
          tagIds.map((id) => ({ postId: post.id, tagId: id }))
        )
      }
      postsCreated++
    } else {
      createdPosts.push(existing)
    }
  }
  console.log(`✅ ${postsCreated} posts created`)

  // ==================== Social Data ====================
  const publishedPosts = createdPosts.filter((p) => p.published)
  const commentPool = [
    '写得太好了，受益匪浅！',
    '刚好在学习这个，收藏了。',
    '第三节讲得很透彻，解决了我的困惑。',
    '实践了一下，确实很有帮助。',
    '期待下一篇！',
    '这篇文章解决了我困扰很久的问题。',
    '可以分享一下源码或 demo 吗？',
    '总结得很到位，转给同事看看。',
    '收藏了，回头慢慢看。',
    '作者能不能再深入讲讲性能优化部分？',
    '有点不同意见，欢迎讨论。',
    '小白问一句，这个和 XXX 有什么区别？',
    '已经应用到项目里了，效果拔群！',
    '配图很有设计感，求出处。',
    '翻译质量很高，原文出处是？',
  ]

  const replyPool = [
    '谢谢支持！',
    '源码在 GitHub 上，欢迎 star。',
    '同意，这也是我实践下来的感受。',
    '关于性能优化，我会再写一篇详细讲。',
    '有问题随时交流！',
    '很高兴对你有帮助。',
  ]

  let commentsCreated = 0
  for (const post of publishedPosts) {
    const numComments = Math.floor(Math.random() * 6)
    for (let i = 0; i < numComments; i++) {
      const author = allUsers[Math.floor(Math.random() * allUsers.length)]
      const commentResult = await db.insert(comments).values({
        content: commentPool[Math.floor(Math.random() * commentPool.length)],
        authorId: author.id,
        postId: post.id,
        parentId: null,
      }).returning()
      const comment = (commentResult as { id: string }[])[0]
      commentsCreated++

      if (Math.random() < 0.35) {
        const replyAuthor = allUsers[Math.floor(Math.random() * allUsers.length)]
        await db.insert(comments).values({
          content: replyPool[Math.floor(Math.random() * replyPool.length)],
          authorId: replyAuthor.id,
          postId: post.id,
          parentId: comment.id,
        })
        commentsCreated++
      }
    }
  }
  console.log(`✅ ${commentsCreated} comments created`)

  let likesCreated = 0
  for (const post of publishedPosts) {
    const numLikes = Math.floor(Math.random() * 36) + 5
    const shuffled = [...allUsers].sort(() => 0.5 - Math.random())
    for (let i = 0; i < Math.min(numLikes, shuffled.length); i++) {
      const result = await db.insert(likes).values({
        userId: shuffled[i].id,
        postId: post.id,
      }).onConflictDoNothing()
      if (result.rowCount && result.rowCount > 0) likesCreated++
    }
  }
  console.log(`✅ ${likesCreated} likes created`)

  let bookmarksCreated = 0
  for (const post of publishedPosts) {
    const numBookmarks = Math.floor(Math.random() * 9)
    const shuffled = [...allUsers].sort(() => 0.5 - Math.random())
    for (let i = 0; i < Math.min(numBookmarks, shuffled.length); i++) {
      const result = await db.insert(bookmarks).values({
        userId: shuffled[i].id,
        postId: post.id,
      }).onConflictDoNothing()
      if (result.rowCount && result.rowCount > 0) bookmarksCreated++
    }
  }
  console.log(`✅ ${bookmarksCreated} bookmarks created`)

  let followsCreated = 0
  for (const u of allUsers) {
    const numFollows = Math.floor(Math.random() * 5) + 1
    const targets = allUsers.filter((x) => x.id !== u.id).sort(() => 0.5 - Math.random()).slice(0, numFollows)
    for (const t of targets) {
      const result = await db.insert(follows).values({
        followerId: u.id,
        followingId: t.id,
      }).onConflictDoNothing()
      if (result.rowCount && result.rowCount > 0) followsCreated++
    }
  }
  console.log(`✅ ${followsCreated} follows created`)

  // Comment likes
  const allComments = await db.query.comments.findMany()
  let commentLikesCreated = 0
  for (const comment of allComments) {
    const num = Math.floor(Math.random() * 6)
    const shuffled = [...allUsers].sort(() => 0.5 - Math.random())
    for (let i = 0; i < Math.min(num, shuffled.length); i++) {
      const result = await db.insert(commentLikes).values({
        userId: shuffled[i].id,
        commentId: comment.id,
      }).onConflictDoNothing()
      if (result.rowCount && result.rowCount > 0) commentLikesCreated++
    }
  }
  console.log(`✅ ${commentLikesCreated} comment likes created`)

  // Sync counts: posts.likesCount, posts.commentsCount, comments.likesCount
  await db.execute(`
    UPDATE posts
    SET likes_count = (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id)
  `)

  await db.execute(`
    UPDATE posts
    SET comments_count = (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id)
  `)

  await db.execute(`
    UPDATE comments
    SET likes_count = (SELECT COUNT(*) FROM comment_likes WHERE comment_likes.comment_id = comments.id)
  `)

  console.log('✅ Synced like/comment counts')

  console.log('🎉 Seed completed!')
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e)
  process.exit(1)
}).finally(() => {
  pool.end()
})
