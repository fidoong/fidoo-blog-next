import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { typography } from '@/lib/constants'

export function Footer() {
  // Use a static year to avoid prerender issues
  const year = 2024

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{siteConfig.name}</h3>
            <p className={typography.muted}>
              {siteConfig.description}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">导航</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  文章
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-muted-foreground hover:text-foreground">
                  标签
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  关于
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-3">资源</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/rss" className="text-muted-foreground hover:text-foreground">
                  RSS
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="text-muted-foreground hover:text-foreground">
                  站点地图
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-semibold mb-3">联系</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className={typography.muted}>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className={typography.muted}>
            Built with Next.js 16 & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  )
}
