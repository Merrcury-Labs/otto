"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Cards,
  Faders,
  House,
  TrendUp,
  Brain,
  Notebook,
  SignOut,
  User,
  GearSix,
} from "@phosphor-icons/react";
import { ThemeToggle } from "../components/theme-toggle";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "U";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length > 1) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [hasOrg, setHasOrg] = useState<boolean | null>(null);

  // Check if user has an org
  useEffect(() => {
    async function checkOrg() {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(
          `/api/org/check?ownerUserId=${session.user.id}`,
        );
        if (response.ok) {
          const data = await response.json();
          setHasOrg(!!data.org);
        } else {
          setHasOrg(false);
        }
      } catch {
        setHasOrg(false);
      }
    }

    if (session?.user) {
      checkOrg();
    }
  }, [session?.user]);

  // Redirect to org creation if user has no org
  useEffect(() => {
    if (
      hasOrg === false &&
      pathname !== "/create-org" &&
      pathname !== "/login"
    ) {
      router.push("/create-org");
    }
  }, [hasOrg, pathname, router]);

  if (pathname === "/login" || pathname === "/create-org") {
    return <>{children}</>;
  }

  const user = session?.user;
  const initials = getInitials(user?.name, user?.email);

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
                  <a href="/flashcards">
                    <Cards className="h-4 w-4 text-sidebar-foreground" />
                    <span className="text-sidebar-foreground">Flash Cards</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="cursor-btn-hover focus-warm transition-all duration-150"
                >
                  <Link href="/editor">
                    <Notebook className="h-4 w-4 text-sidebar-foreground" />
                    <span className="text-sidebar-foreground">Editor</span>
                  </Link>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium bg-surface-300 text-foreground cursor-pointer hover:bg-surface-400 focus-warm transition-all duration-150 outline-none focus:ring-2 focus:ring-ring/20"
                >
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {isPending ? "Loading..." : (user?.name || "User")}
                    </p>
                    {user?.email ? (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    ) : null}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/settings" className="flex items-center gap-2 cursor-pointer">
                    <GearSix className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
                  onSelect={async () => {
                    await authClient.signOut();
                    document.cookie = "user_role=; path=/; max-age=0";
                    window.location.href = "/login";
                  }}
                >
                  <SignOut className="h-4 w-4 mr-2" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
