"use client";

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
          className="border-b px-4 py-4"
          style={{ backgroundColor: '#e6e5e0', borderColor: 'rgba(38, 37, 30, 0.1)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#26251e' }}
            >
              <House className="h-5 w-5" style={{ color: '#f2f1ed' }} />
            </div>
            <div className="flex flex-col">
              <span
                className="text-sm font-semibold"
                style={{ color: '#26251e', letterSpacing: '-0.11px' }}
              >
                Otto
              </span>
              <span
                className="text-xs"
                style={{ color: 'rgba(38, 37, 30, 0.55)' }}
              >
                Dashboard
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent style={{ backgroundColor: '#e6e5e0' }}>
          <SidebarGroup>
            <SidebarGroupLabel
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'rgba(38, 37, 30, 0.55)' }}
            >
              Overview
            </SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="cursor-btn-hover focus-warm transition-all duration-150"
                >
                  <a href="/">
                    <House className="h-4 w-4" style={{ color: '#26251e' }} />
                    <span style={{ color: '#26251e' }}>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="cursor-btn-hover focus-warm transition-all duration-150"
                >
                  <a href="#">
                    <ChartLine className="h-4 w-4" style={{ color: '#26251e' }} />
                    <span style={{ color: '#26251e' }}>Progress</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="cursor-btn-hover focus-warm transition-all duration-150"
                >
                  <a href="#">
                    <TrendUp className="h-4 w-4" style={{ color: '#26251e' }} />
                    <span style={{ color: '#26251e' }}>Analytics</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'rgba(38, 37, 30, 0.55)' }}
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
                    <BookOpen className="h-4 w-4" style={{ color: '#26251e' }} />
                    <span style={{ color: '#26251e' }}>Courses</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="cursor-btn-hover focus-warm transition-all duration-150"
                >
                  <a href="/quizzes">
                    <Brain className="h-4 w-4" style={{ color: '#26251e' }} />
                    <span style={{ color: '#26251e' }}>Quizzes</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="cursor-btn-hover focus-warm transition-all duration-150"
                >
                  <a href="#">
                    <Users className="h-4 w-4" style={{ color: '#26251e' }} />
                    <span style={{ color: '#26251e' }}>Community</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'rgba(38, 37, 30, 0.55)' }}
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
                    <ChartBar className="h-4 w-4" style={{ color: '#26251e' }} />
                    <span style={{ color: '#26251e' }}>Statistics</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter
          className="border-t px-4 py-4"
          style={{ backgroundColor: '#e6e5e0', borderColor: 'rgba(38, 37, 30, 0.1)' }}
        >
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="cursor-btn-hover focus-warm transition-all duration-150"
              >
                <a href="/settings">
                  <Faders className="h-4 w-4" style={{ color: '#26251e' }} />
                  <span style={{ color: '#26251e' }}>Settings</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset style={{ backgroundColor: '#f2f1ed' }}>
        <header
          className="flex h-16 shrink-0 items-center gap-2 px-4"
          style={{ borderBottom: '1px solid rgba(38, 37, 30, 0.1)', backgroundColor: '#f2f1ed' }}
        >
          <SidebarTrigger className="-ml-1 cursor-btn-hover focus-warm transition-all duration-150" />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium cursor-btn-hover focus-warm transition-all duration-150"
              style={{
                backgroundColor: '#ebeae5',
                color: '#26251e',
              }}
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
