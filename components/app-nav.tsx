'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layouts/container'
import { Package2, LayoutDashboard, FilePlus2, LogOut, FileText, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/request/new', label: 'New Request', icon: FilePlus2 },
  { href: '/docs', label: 'SharePoint Guide', icon: FileText },
]

export function AppNav() {
  const pathname = usePathname() ?? ''
  const { data: session, status } = useSession() || {}
  const loggedIn = status === 'authenticated'

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <Container size="lg">
        <div className="h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Package2 className="h-4 w-4" />
            </div>
            <span className="hidden sm:block font-display font-semibold">ALM Portal</span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            {loggedIn ? (
              <>
                <span className="hidden md:block text-xs text-muted-foreground truncate max-w-[160px]">{session?.user?.email ?? ''}</span>
                <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </>
            ) : (
              <Button asChild size="sm">
                <Link href="/login"><LogIn className="h-4 w-4" /> Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </Container>
    </header>
  )
}
