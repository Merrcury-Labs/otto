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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
    return (
        <div className="mx-auto max-w-5xl animate-in fade-in duration-700">
            <div className="flex flex-col gap-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences.</p>
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
                                className="w-full justify-start rounded-xl px-4 py-3 text-sm font-bold tracking-tight data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all hover:bg-muted/50 group"
                            >
                                <tab.icon className="mr-3 size-4 text-muted-foreground group-data-[state=active]:text-primary transition-colors" />
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
                                        <p className="text-sm text-muted-foreground leading-relaxed">This information will be displayed publicly to other community members.</p>
                                    </div>

                                    <div className="flex flex-col gap-8">
                                        <div className="flex items-center gap-6">
                                            <div className="relative group cursor-pointer">
                                                <Avatar className="size-24 ring-4 ring-background shadow-xl">
                                                    <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60" />
                                                    <AvatarFallback>M</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Camera className="size-6 text-white" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex gap-3">
                                                    <Button size="sm" className="rounded-xl font-bold">Change Avatar</Button>
                                                    <Button size="sm" variant="outline" className="rounded-xl font-bold">Remove</Button>
                                                </div>
                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">JPG, GIF or PNG. 1MB Max.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="display-name" className="text-xs uppercase tracking-widest text-muted-foreground/60">Display Name</Label>
                                                <Input id="display-name" defaultValue="Morné" className="bg-card/40 border-none rounded-xl h-11 px-4 placeholder:text-muted-foreground/40 focus-visible:ring-primary/40" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="username" className="text-xs uppercase tracking-widest text-muted-foreground/60">Username</Label>
                                                <Input id="username" defaultValue="@mornelabs" className="bg-card/40 border-none rounded-xl h-11 px-4 placeholder:text-muted-foreground/40 focus-visible:ring-primary/40" />
                                            </div>
                                            <div className="col-span-full flex flex-col gap-2">
                                                <Label htmlFor="bio" className="text-xs uppercase tracking-widest text-muted-foreground/60">Bio</Label>
                                                <textarea
                                                    id="bio"
                                                    className="min-h-[120px] w-full bg-card/40 border-none rounded-2xl p-4 text-sm placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-primary/40 outline-none resize-none"
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
                                        <p className="text-sm text-muted-foreground leading-relaxed">Manage your email and security preferences.</p>
                                    </div>

                                    <div className="flex flex-col gap-10">
                                        <div className="flex items-center justify-between p-6 rounded-2xl bg-card/30 border border-border/50">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                    <Mail className="size-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">Email Address</span>
                                                    <span className="text-xs text-muted-foreground">mornie@example.com</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="font-bold text-primary rounded-lg text-xs tracking-tighter uppercase">Change</Button>
                                        </div>

                                        <div className="flex items-center justify-between p-6 rounded-2xl bg-card/30 border border-border/50 transition-all hover:bg-card/40">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                    <ShieldCheck className="size-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">Password</span>
                                                    <span className="text-xs text-muted-foreground">Last updated 3 months ago</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="font-bold text-primary rounded-lg text-xs tracking-tighter uppercase">Reset</Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 mt-4">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Danger Zone</h4>
                                        <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/5 flex items-center justify-between">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-destructive">Delete Account</span>
                                                <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data.</p>
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
                                        <p className="text-sm text-muted-foreground leading-relaxed">Choose which updates you'd like to receive in your inbox.</p>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {[
                                            { title: "Course Progress", desc: "Get updates on your course progression and milestones." },
                                            { title: "Community Mentions", desc: "Receive alerts when someone mentions you in a discussion." },
                                            { title: "New Course Alerts", desc: "Stay informed when new courses related to your interests are published." },
                                            { title: "Weekly Recap", desc: "A summary of your learning activity and community stats." },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between py-6 border-b border-border/40 last:border-0">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold">{item.title}</span>
                                                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">{item.desc}</p>
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
                                        <p className="text-sm text-muted-foreground leading-relaxed">Customize your viewing experience on the platform.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-4 p-6 rounded-3xl bg-card/30 border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <Moon className="size-4 text-primary" />
                                                <span className="text-sm font-bold">Theme</span>
                                            </div>
                                            <div className="flex gap-2 p-1 bg-background/50 rounded-2xl">
                                                {[
                                                    { id: "light", icon: Sun, label: "Light" },
                                                    { id: "dark", icon: Moon, label: "Dark" },
                                                    { id: "system", icon: Smartphone, label: "System" },
                                                ].map((theme) => (
                                                    <button
                                                        key={theme.id}
                                                        className={`flex flex-1 items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${theme.id === 'dark' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                                                    >
                                                        <theme.icon className="size-3.5" />
                                                        {theme.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 p-6 rounded-3xl bg-card/30 border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <Languages className="size-4 text-primary" />
                                                <span className="text-sm font-bold">Language</span>
                                            </div>
                                            <div className="relative group">
                                                <div className="w-full flex items-center justify-between py-3 px-4 bg-background/50 rounded-2xl cursor-pointer">
                                                    <span className="text-sm font-medium">English (US)</span>
                                                    <ChevronRight className="size-4 opacity-40 group-hover:translate-x-0.5 transition-transform" />
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
