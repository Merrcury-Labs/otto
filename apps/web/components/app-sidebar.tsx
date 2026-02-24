"use client"

import * as React from "react"
import {
    BookOpen,
    LayoutDashboard,
    Settings,
    UserCheck,
    Users,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarMenuBadge,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Courses",
        url: "/courses",
        icon: BookOpen,
    },
    {
        title: "Community",
        url: "/community",
        icon: Users,
    },
    {
        title: "Audience",
        url: "/audience",
        icon: UserCheck,
    },
    {
        title: "Setup",
        url: "/setup",
        icon: Settings,
    },
]

export function AppSidebar() {
    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader className="flex flex-row items-center gap-2 p-4">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <span className="font-bold">O</span>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Otto</span>
                    <span className="text-xs text-muted-foreground">Learning Platform</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
