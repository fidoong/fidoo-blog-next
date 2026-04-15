import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, PenLine, ArrowLeft, Mail } from 'lucide-react'
import { sizes, typography } from '@/lib/constants'

export const metadata = {
  title: '权限不足',
}

export default function UnauthorizedPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-14rem)] px-4 py-12">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">需要创作权限</CardTitle>
          <CardDescription>
            您当前的角色暂不能发布文章，需要申请成为作者
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <div className="flex items-start gap-3">
              <PenLine className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">作者权限说明</p>
                <p className={typography.muted}>
                  成为作者后，您可以发布文章、管理自己的内容，并参与社区内容建设。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <a 
            href="mailto:admin@example.com?subject=申请成为作者"
            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Mail className={sizes.iconWithText} />
            申请成为作者
          </a>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              <ArrowLeft className={sizes.iconWithText} />
              返回首页
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
