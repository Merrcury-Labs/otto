"use client"

import * as React from "react"
import Image from "next/image"
import {
    BookOpen,
    Settings,
    Users,
    LayoutList,
    BarChart3,
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
    SidebarFooter,
} from "@/components/ui/sidebar"

function OttoDashboardIcon() {
    return (
        <Image
            src="/otto%20logo.png"
            alt=""
            width={16}
            height={16}
            className="size-4 shrink-0 rounded-sm object-contain"
        />
    )
}

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: OttoDashboardIcon,
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
        title: "Quizzes",
        url: "/quizzes",
        icon: LayoutList,
    },
    {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart3,
    },
]

export function AppSidebar() {
    return (
        <Sidebar collapsible="offcanvas">
            <SidebarHeader className="flex flex-row items-center gap-2 p-4">
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md bg-primary/5">
                    <Image
                        src="/otto%20logo.png"
                        alt="Otto"
                        width={32}
                        height={32}
                        className="size-8 object-contain"
                        priority
                    />
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
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Settings">
                            <a href="/settings">
                                <Settings />
                                <span>Settings</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
