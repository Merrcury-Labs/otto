"use client"

import * as React from "react"
import Link from "next/link"
import { Bell, LogOut, Moon, Sun, User, Settings as SettingsIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { signOutAction } from "@/app/actions/auth"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

function getInitials(name?: string | null, email?: string | null) {
    const source = name?.trim() || email?.split("@")[0] || "User"
    const parts = source.split(/\s+/).filter(Boolean)

    if (parts.length > 1) {
        return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase()
    }

    return source.slice(0, 2).toUpperCase()
}

export function HeaderActions() {
    const { data: session, isPending } = authClient.useSession()
    const { theme, setTheme } = useTheme()
    const user = session?.user
    const name = user?.name || "User"
    const email = user?.email || ""
    const image = user?.image || undefined
    const initials = getInitials(user?.name, user?.email)

    return (
        <div className="ml-auto flex items-center gap-4">
            {/* Theme toggle */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-primary" />
                        <span className="sr-only">Notifications</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold tracking-tight">Notifications</h4>
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
                                Mark all as read
                            </Button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {[
                                {
                                    title: "New course available",
                                    description: "Introduction to Next.js 15 is now live!",
                                    time: "2h ago",
                                },
                                {
                                    title: "Quiz completed",
                                    description: "You scored 95% on the React basics quiz.",
                                    time: "5h ago",
                                },
                            ].map((notif, i) => (
                                <div key={i} className="flex flex-col gap-1 rounded-lg p-2 transition-colors hover:bg-muted/50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{notif.title}</span>
                                        <span className="text-[10px] text-muted-foreground">{notif.time}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{notif.description}</p>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                            View all notifications
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            {/* User Profile */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={image} alt={name} />
                            <AvatarFallback>{isPending ? "..." : initials}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{isPending ? "Loading..." : name}</p>
                            {email ? (
                                <p className="text-xs leading-none text-muted-foreground">
                                    {email}
                                </p>
                            ) : null}
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/settings">
                            <User className="mr-2 h-4 w-4" />
                            <span>Account</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/settings">
                            <SettingsIcon className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <form action={signOutAction}>
                        <DropdownMenuItem asChild className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                            <button type="submit" className="w-full">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign out</span>
                            </button>
                        </DropdownMenuItem>
                    </form>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
