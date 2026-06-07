"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@repo/ui/sidebar";
import {
  ChartBar,
  ChartLine,
  Users,
  BookOpen,
  Faders,
  House,
  TrendUp,
  Brain,
} from "@phosphor-icons/react";
import { ThemeToggle } from "../components/theme-toggle";

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader
          className="border-b border-sidebar-border/10 px-4 py-4 bg-sidebar"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary"
            >
              <House className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span
                className="text-sm font-semibold text-sidebar-foreground"
                style={{ letterSpacing: '-0.11px' }}
              >
                Otto
              </span>
              <span
                className="text-xs text-sidebar-foreground/55"
              >
                Dashboard
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="bg-sidebar">
          <SidebarGroup>
            <SidebarGroupLabel
              className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/55"
            >
              Overview
            </SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="cursor-btn-hover focus-warm transition-all duration-150"
                >
                  <Link href="/">
                    <House className="h-4 w-4 text-sidebar-foreground" />
                    <span className="text-sidebar-foreground">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="cursor-btn-hover focus-warm transition-all duration-150"
                >
                  <a href="#">
                    <ChartLine className="h-4 w-4 text-sidebar-foreground" />
                    <span className="text-sidebar-foreground">Progress</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="cursor-btn-hover focus-warm transition-all duration-150"
                >
                  <a href="#">
                    <TrendUp className="h-4 w-4 text-sidebar-foreground" />
                    <span className="text-sidebar-foreground">Analytics</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel
              className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/55"
            >
              Learning
            </SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="cursor-btn-hover focus-warm transition-all duration-150"
                >
                  <a href="/courses">
                    <BookOpen className="h-4 w-4 text-sidebar-foreground" />
                    <span className="text-sidebar-foreground">Courses</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="cursor-btn-hover focus-warm transition-all duration-150"
                >
                  <a href="/quizzes">
                    <Brain className="h-4 w-4 text-sidebar-foreground" />
                    <span className="text-sidebar-foreground">Quizzes</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="cursor-btn-hover focus-warm transition-all duration-150"
                >
                  <a href="#">
                    <Users className="h-4 w-4 text-sidebar-foreground" />
                    <span className="text-sidebar-foreground">Community</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel
              className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/55"
            >
              Reports
            </SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="cursor-btn-hover focus-warm transition-all duration-150"
                >
                  <a href="#">
                    <ChartBar className="h-4 w-4 text-sidebar-foreground" />
                    <span className="text-sidebar-foreground">Statistics</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter
          className="border-t border-sidebar-border/10 px-4 py-4 bg-sidebar"
        >
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="text-xs text-sidebar-foreground/55">Theme</span>
            <ThemeToggle />
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="cursor-btn-hover focus-warm transition-all duration-150"
              >
                <a href="/settings">
                  <Faders className="h-4 w-4 text-sidebar-foreground" />
                  <span className="text-sidebar-foreground">Settings</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header
          className="flex h-16 shrink-0 items-center gap-2 px-4 border-b border-border/10 bg-background"
        >
          <SidebarTrigger className="-ml-1 cursor-btn-hover focus-warm transition-all duration-150" />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 text-foreground"
            >
              JD
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
