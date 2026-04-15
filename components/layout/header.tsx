'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Search, PenLine, Menu, LogOut, User, LayoutDashboard, Settings, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUIStore } from '@/lib/stores/ui-store'
import { siteConfig } from '@/config/site'
import { navConfig } from '@/config/nav'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { sizes, typography } from '@/lib/constants'

export function Header() {
  const router = useRouter()
  const { data: session } = useSession()
  const { setSearchOpen } = useUIStore()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
      toast.success('已成功退出登录')
    } catch {
      toast.error('退出登录失败，请重试')
      setIsLoggingOut(false)
      setShowLogoutDialog(false)
    }
  }

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4">
          {/* Logo */}
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold">{siteConfig.name}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navConfig.main.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground/80"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex flex-1 items-center justify-end space-x-4">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">搜索</span>
            </Button>

            {/* Write Button - 所有登录用户可见 */}
            {session?.user && (
              <Link href="/write">
                <Button 
                  variant="default" 
                  size="sm"
                  className="hidden sm:flex bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm"
                >
                  <PenLine className={sizes.iconWithText} />
                  写文章
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="sm:hidden"
                >
                  <PenLine className="h-5 w-5" />
                  <span className="sr-only">写文章</span>
                </Button>
              </Link>
            )}

            {/* User Menu */}
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="relative h-8 w-8 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                    <AvatarFallback>{session.user.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{session.user.name}</p>
                      <p className={cn("w-[200px] truncate", typography.muted)}>
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/u/${session.user.username}`)}>
                    <User className={sizes.iconWithText} />
                    个人主页
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/write')}>
                    <PenLine className={sizes.iconWithText} />
                    写文章
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard className={sizes.iconWithText} />
                    我的文章
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className={sizes.iconWithText} />
                    设置
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-muted-foreground transition-colors hover:text-destructive focus:text-destructive"
                    onClick={handleLogoutClick}
                  >
                    <LogOut className={sizes.iconWithText} />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm">
                  登录
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">菜单</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出登录？</AlertDialogTitle>
            <AlertDialogDescription>
              退出后需要重新登录才能访问您的个人账户内容。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className={cn(sizes.iconWithText, "animate-spin")} />
                  退出中...
                </>
              ) : (
                <>
                  <LogOut className={sizes.iconWithText} />
                  确认退出
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
