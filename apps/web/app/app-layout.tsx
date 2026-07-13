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
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-secondary px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 h-4"
          />
          <PageHeaderTitle />
          <HeaderActions />
        </header>
        <div className="flex-1 bg-background p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
