import { siteConfig } from '@/config/site'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Mail, Heart, Code, Coffee } from 'lucide-react'

export const metadata = {
  title: `关于 | ${siteConfig.name}`,
  description: `了解 ${siteConfig.name} 的故事`,
}

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">关于</h1>
          <p className="text-lg text-muted-foreground">
            欢迎来到 {siteConfig.name}
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">我们的故事</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {siteConfig.name} 是一个专注于技术分享的博客平台。我们致力于为广大开发者提供
                高质量的技术文章，涵盖前端、后端、移动端等多个领域。
              </p>
              <p className="text-muted-foreground leading-relaxed">
                无论你是刚入门的编程新手，还是经验丰富的技术专家，这里都有适合你的内容。
                我们相信知识分享的力量，期待与你一起成长。
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Code className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">技术文章</h3>
                <p className="text-sm text-muted-foreground">
                  精心撰写的技术教程和最佳实践
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 mx-auto mb-3 text-red-500" />
                <h3 className="font-semibold mb-2">活跃社区</h3>
                <p className="text-sm text-muted-foreground">
                  与志同道合的开发者交流讨论
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Coffee className="h-8 w-8 mx-auto mb-3 text-amber-500" />
                <h3 className="font-semibold mb-2">持续更新</h3>
                <p className="text-sm text-muted-foreground">
                  紧跟技术潮流，不断学习进步
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tech Stack */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">技术栈</h2>
              <div className="flex flex-wrap gap-2">
                {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Drizzle ORM'].map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-muted rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">联系我们</h2>
              <p className="text-muted-foreground mb-6">
                如果你有任何问题或建议，欢迎通过以下方式联系我们
              </p>
              <div className="flex gap-4">
                {siteConfig.links.github && (
                  <a
                    href={siteConfig.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    <span>GitHub</span>
                  </a>
                )}
                {siteConfig.links.twitter && (
                  <a
                    href={siteConfig.links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>X (Twitter)</span>
                  </a>
                )}
                <a
                  href={`mailto:${siteConfig.author.email}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span>Email</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-12" />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p className="mt-2">Made with ❤️ by {siteConfig.author.name}</p>
        </div>
      </div>
    </div>
  )
}
