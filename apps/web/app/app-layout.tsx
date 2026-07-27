"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { HeaderActions } from "@/components/header-actions"
import { PageHeaderTitle } from "@/components/page-header-title"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // No layout for auth pages and onboarding
  if (pathname === "/login" || pathname === "/signup" || pathname === "/onboarding") {
    return <>{children}</>
  }

  // Immersive full-height layout for learn & quiz-taking pages — no sidebar, no header
  const isImmersivePage = pathname.includes("/learn") || pathname.includes("/take") || pathname.includes("/study")

  if (isImmersivePage) {
    return <>{children}</>
  }

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="h-svh min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-1 border-b border-border bg-secondary/95 px-3 backdrop-blur sm:h-16 sm:gap-2 sm:px-4">
          <SidebarTrigger className="-ml-1 size-10" />
          <Separator
            orientation="vertical"
            className="mr-1 h-4 sm:mr-2"
          />
          <PageHeaderTitle />
          <HeaderActions />
        </header>
        <main className="min-w-0 flex-1 bg-background px-3 py-4 sm:p-5 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
