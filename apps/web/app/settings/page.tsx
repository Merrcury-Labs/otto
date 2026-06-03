"use client"

import * as React from "react"
import {
    User,
    Bell,
    Lock,
    Settings as SettingsIcon,
    Moon,
    Sun,
    Smartphone,
    Mail,
    CreditCard,
    ChevronRight,
    Camera,
    ShieldCheck,
    Languages
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Wait until mounted on client to prevent hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <div className="mx-auto max-w-5xl animate-in fade-in duration-700" style={{ fontFamily: 'var(--font-ui)' }}>
            <div className="flex flex-col gap-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-hero" style={{ fontFamily: 'var(--font-display)' }}>Settings</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Manage your account settings and preferences.</p>
                </div>

                <Tabs defaultValue="profile" className="flex flex-col lg:flex-row gap-12">
                    {/* Navigation Sidebar */}
                    <TabsList className="flex lg:flex-col items-start justify-start bg-transparent h-auto p-0 gap-2 lg:w-64">
                        {[
                            { id: "profile", label: "Profile", icon: User },
                            { id: "account", label: "Account", icon: Lock },
                            { id: "notifications", label: "Notifications", icon: Bell },
                            { id: "preferences", label: "Preferences", icon: SettingsIcon },
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="w-full justify-start rounded-xl px-4 py-3 text-sm font-bold tracking-tight transition-all hover:rounded-xl group"
                                style={{ backgroundColor: 'transparent', ':hover': { backgroundColor: 'var(--surface-400)' } }}
                            >
                                <tab.icon className="mr-3 size-4 transition-colors" style={{ color: 'var(--muted-foreground)' }} />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Content Areas */}
                    <div className="flex-1">
                        {/* Profile Section */}
                        <TabsContent value="profile" className="mt-0 focus-visible:ring-0">
                            <div className="flex flex-col gap-10">
                                <section className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-lg font-bold">Public Profile</h3>
                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>This information will be displayed publicly to other community members.</p>
                                    </div>

                                    <div className="flex flex-col gap-8">
                                        <div className="flex items-center gap-6">
                                            <div className="relative group cursor-pointer">
                                                <Avatar className="size-24 shadow-xl" style={{ ring: '4px solid var(--surface-200)' }}>
                                                    <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60" />
                                                    <AvatarFallback>M</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute inset-0 flex items-center justify-center rounded-full transition-opacity opacity-0 group-hover:opacity-100" style={{ backgroundColor: 'rgba(38, 37, 30, 0.4)' }}>
                                                    <Camera className="size-6" style={{ color: 'var(--surface-200)' }} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex gap-3">
                                                    <Button size="sm" className="rounded-xl font-bold">Change Avatar</Button>
                                                    <Button size="sm" variant="outline" className="rounded-xl font-bold">Remove</Button>
                                                </div>
                                                <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>JPG, GIF or PNG. 1MB Max.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="display-name">Display Name</Label>
                                                <Input id="display-name" defaultValue="Morné" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="username">Username</Label>
                                                <Input id="username" defaultValue="@mornelabs" />
                                            </div>
                                            <div className="col-span-full flex flex-col gap-2">
                                                <Label htmlFor="bio">Bio</Label>
                                                <textarea
                                                    id="bio"
                                                    className="min-h-[120px] w-full p-4 text-sm outline-none resize-none rounded-lg"
                                                    style={{ backgroundColor: 'transparent', border: '1px solid var(--border-primary)', color: 'var(--foreground)' }}
                                                    placeholder="Tell the community about yourself..."
                                                    defaultValue="Passionate learner and software engineer exploring the frontiers of AI and web development."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-4">
                                        <Button className="rounded-xl px-8 font-bold">Save Changes</Button>
                                    </div>
                                </section>
                            </div>
                        </TabsContent>

                        {/* Account Section */}
                        <TabsContent value="account" className="mt-0 focus-visible:ring-0">
                            <div className="flex flex-col gap-10">
                                <section className="flex flex-col gap-8">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-lg font-bold">Account Security</h3>
                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>Manage your email and security preferences.</p>
                                    </div>

                                    <div className="flex flex-col gap-10">
                                        <div className="flex items-center justify-between p-6 rounded-2xl" style={{ backgroundColor: 'var(--surface-100)', border: '1px solid var(--border-primary)' }}>
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                                    <Mail className="size-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">Email Address</span>
                                                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>mornie@example.com</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="font-bold rounded-lg text-xs tracking-tighter uppercase" style={{ color: 'var(--color-accent)' }}>Change</Button>
                                        </div>

                                        <div className="flex items-center justify-between p-6 rounded-2xl transition-all" style={{ backgroundColor: 'var(--surface-100)', border: '1px solid var(--border-primary)', ':hover': { backgroundColor: 'var(--surface-300)' } }}>
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                                    <ShieldCheck className="size-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">Password</span>
                                                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Last updated 3 months ago</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="font-bold rounded-lg text-xs tracking-tighter uppercase" style={{ color: 'var(--color-accent)' }}>Reset</Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 mt-4">
                                        <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Danger Zone</h4>
                                        <div className="p-6 rounded-2xl flex items-center justify-between" style={{ border: '1px solid var(--color-error)', backgroundColor: 'var(--color-error)/5' }}>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold" style={{ color: 'var(--color-error)' }}>Delete Account</span>
                                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Permanently delete your account and all associated data.</p>
                                            </div>
                                            <Button variant="destructive" size="sm" className="rounded-xl font-bold">Delete</Button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </TabsContent>

                        {/* Notifications Section */}
                        <TabsContent value="notifications" className="mt-0 focus-visible:ring-0">
                            <div className="flex flex-col gap-10">
                                <section className="flex flex-col gap-8">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-lg font-bold">Email Notifications</h3>
                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>Choose which updates you'd like to receive in your inbox.</p>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {[
                                            { title: "Course Progress", desc: "Get updates on your course progression and milestones." },
                                            { title: "Community Mentions", desc: "Receive alerts when someone mentions you in a discussion." },
                                            { title: "New Course Alerts", desc: "Stay informed when new courses related to your interests are published." },
                                            { title: "Weekly Recap", desc: "A summary of your learning activity and community stats." },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between py-6" style={{ borderBottom: i < 3 ? '1px solid var(--border-primary)' : 'none' }}>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold">{item.title}</span>
                                                    <p className="text-xs leading-relaxed max-w-sm" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
                                                </div>
                                                <Switch defaultChecked={i < 2} />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </TabsContent>

                        {/* Preferences Section */}
                        <TabsContent value="preferences" className="mt-0 focus-visible:ring-0">
                            <div className="flex flex-col gap-10">
                                <section className="flex flex-col gap-8">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-lg font-bold">Interface Preferences</h3>
                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>Customize your viewing experience on the platform.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-4 p-6 rounded-3xl" style={{ backgroundColor: 'var(--surface-100)', border: '1px solid var(--border-primary)' }}>
                                            <div className="flex items-center gap-3">
                                                <Moon className="size-4" style={{ color: 'var(--color-accent)' }} />
                                                <span className="text-sm font-bold">Theme</span>
                                            </div>
                                            <div className="flex gap-2 p-1 rounded-2xl" style={{ backgroundColor: 'var(--surface-200)' }}>
                                                {[
                                                    { id: "light", icon: Sun, label: "Light" },
                                                    { id: "dark", icon: Moon, label: "Dark" },
                                                    { id: "system", icon: Smartphone, label: "System" },
                                                ].map((t) => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => setTheme(t.id)}
                                                        className={`flex flex-1 items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${theme === t.id ? 'shadow-lg' : ''}`}
                                                        style={{
                                                            backgroundColor: theme === t.id ? 'var(--color-accent)' : 'transparent',
                                                            color: theme === t.id ? 'white' : 'var(--muted-foreground)',
                                                            boxShadow: theme === t.id ? 'var(--shadow-card)' : 'none'
                                                        }}
                                                    >
                                                        <t.icon className="size-3.5" />
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 p-6 rounded-3xl" style={{ backgroundColor: 'var(--surface-100)', border: '1px solid var(--border-primary)' }}>
                                            <div className="flex items-center gap-3">
                                                <Languages className="size-4" style={{ color: 'var(--color-accent)' }} />
                                                <span className="text-sm font-bold">Language</span>
                                            </div>
                                            <div className="relative group">
                                                <div className="w-full flex items-center justify-between py-3 px-4 rounded-2xl cursor-pointer" style={{ backgroundColor: 'var(--surface-200)' }}>
                                                    <span className="text-sm font-medium">English (US)</span>
                                                    <ChevronRight className="size-4 transition-transform" style={{ opacity: '0.4' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}
