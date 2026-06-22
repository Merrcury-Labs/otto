"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { HeaderActions } from "@/components/header-actions";
import { PageHeaderTitle } from "@/components/page-header-title";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/signup") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header
          className="flex h-16 shrink-0 items-center gap-2 border-b border-border-primary px-4"
          style={{ backgroundColor: "var(--surface-200)" }}
        >
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 h-4"
            style={{ borderColor: "var(--border-primary)" }}
          />
          <PageHeaderTitle />
          <HeaderActions />
        </header>
        <main className="p-4" style={{ backgroundColor: "var(--surface-200)" }}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
