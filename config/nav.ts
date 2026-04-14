export const navConfig = {
  main: [
    { title: '首页', href: '/' },
    { title: '文章', href: '/blog' },
    { title: '标签', href: '/tags' },
    { title: '关于', href: '/about' },
  ],
  admin: [
    { title: '仪表盘', href: '/dashboard', icon: 'LayoutDashboard' },
    { title: '文章管理', href: '/posts', icon: 'FileText' },
    { title: '评论管理', href: '/comments', icon: 'MessageSquare' },
    { title: '标签管理', href: '/tags', icon: 'Tag' },
    { title: '用户管理', href: '/users', icon: 'Users' },
    { title: '系统设置', href: '/settings', icon: 'Settings' },
  ],
}

export type NavConfig = typeof navConfig
