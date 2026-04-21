'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layouts/container'
import { Package2, LogIn, LogOut, LayoutDashboard, FilePlus2 } from 'lucide-react'

export function LandingHeader() {
  const { data: session, status } = useSession() || {}
  const loggedIn = status === 'authenticated'

  return (
    <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-md">
      <Container size="lg">
        <div className="h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Package2 className="h-4 w-4" />
            </div>
            <span className="font-display font-semibold">ALM Portal</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link href="/request/new"><FilePlus2 className="h-4 w-4" /> New request</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/docs">SharePoint guide</Link>
            </Button>
          </nav>
          <div className="flex items-center gap-2">
            {loggedIn ? (
              <>
                <span className="hidden sm:block text-sm text-muted-foreground">{session?.user?.email ?? ''}</span>
                <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link href="/login"><LogIn className="h-4 w-4" /> Sign in</Link></Button>
                <Button asChild size="sm"><Link href="/signup">Get started</Link></Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  )
}
