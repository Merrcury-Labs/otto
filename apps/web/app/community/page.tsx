"use client"

import * as React from "react"
import {
    MessageSquare,
    ThumbsUp,
    Share2,
    Search,
    Plus,
    TrendingUp,
    Users,
    MoreHorizontal,
    Hash,
    Filter
} from "lucide-react"
import { communityPosts, trendingTopics, topContributors } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CommunityPage() {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedTag, setSelectedTag] = React.useState<string | null>(null)

    const filteredPosts = React.useMemo(() => {
        return communityPosts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesTag = !selectedTag || post.tags.includes(selectedTag)
            return matchesSearch && matchesTag
        })
    }, [searchQuery, selectedTag])

    return (
        <div className="mx-auto max-w-7xl animate-in fade-in duration-700">
            <div className="flex flex-col gap-10 pb-20">
                {/* Header Section */}
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-extrabold tracking-tight">Community</h1>
                        <p className="text-muted-foreground">Share knowledge and connect with other learners.</p>
                    </div>
                    <Button className="h-11 rounded-full px-6 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                        <Plus className="mr-2 size-4" />
                        Create Post
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-card/30 p-4 rounded-2xl border border-border/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                        <Input
                            placeholder="Search discussions..."
                            className="bg-background/50 pl-9 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                        <Button
                            variant={!selectedTag ? "secondary" : "ghost"}
                            size="sm"
                            className="rounded-full px-4 font-bold text-xs uppercase tracking-wider"
                            onClick={() => setSelectedTag(null)}
                        >
                            All Posts
                        </Button>
                        {["React", "Design", "Performance", "Architecture"].map(tag => (
                            <Button
                                key={tag}
                                variant={selectedTag === tag ? "secondary" : "ghost"}
                                size="sm"
                                className="rounded-full px-4 font-bold text-xs uppercase tracking-wider"
                                onClick={() => setSelectedTag(tag)}
                            >
                                {tag}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                    {/* Main Feed */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (
                                <div key={post.id} className="group relative flex flex-col gap-6 rounded-3xl border bg-card/40 p-6 transition-all hover:bg-card hover:shadow-xl hover:shadow-primary/5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-10 ring-2 ring-primary/10">
                                                <AvatarImage src={post.author.avatar} />
                                                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{post.author.name}</span>
                                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{post.author.role} • {post.date}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="rounded-full">
                                            <MoreHorizontal className="size-4 text-muted-foreground" />
                                        </Button>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <h2 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors cursor-pointer">{post.title}</h2>
                                        <p className="text-muted-foreground/90 leading-relaxed line-clamp-3 italic">
                                            "{post.content}"
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="inline-flex items-center rounded-full bg-secondary/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-border/40 pt-4">
                                        <div className="flex items-center gap-4">
                                            <button className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                                                <ThumbsUp className="size-4" />
                                                {post.likes}
                                            </button>
                                            <button className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                                                <MessageSquare className="size-4" />
                                                {post.comments}
                                            </button>
                                        </div>
                                        <button className="text-muted-foreground hover:text-primary transition-colors">
                                            <Share2 className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                <Search className="size-12 mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-bold">No discussions found</h3>
                                <p className="text-sm">Try broadening your search or filters.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        {/* Trending Topics */}
                        <section className="rounded-3xl border bg-card/20 p-8">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Trending</h3>
                                <TrendingUp className="size-4 text-primary" />
                            </div>
                            <div className="flex flex-col gap-4">
                                {trendingTopics.map((topic) => (
                                    <div key={topic.name} className="group flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                                <Hash className="size-3.5" />
                                            </div>
                                            <span className="text-sm font-bold tracking-tight">{topic.name}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground/60">{topic.posts} posts</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Top Contributors */}
                        <section className="rounded-3xl border bg-card/20 p-8 shadow-sm">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Top Members</h3>
                                <Users className="size-4 text-muted-foreground/60" />
                            </div>
                            <div className="flex flex-col gap-6">
                                {topContributors.map((user) => (
                                    <div key={user.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Avatar className="size-9 ring-2 ring-background">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-white border-2 border-background">
                                                    {user.rank}
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold leading-none">{user.name}</span>
                                                <span className="text-[10px] font-medium text-muted-foreground mt-1">{user.points.toLocaleString()} pts</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-12 rounded-full bg-secondary overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${100 - user.rank * 10}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="mt-8 w-full rounded-2xl border-dashed font-bold text-xs uppercase tracking-widest hover:border-primary/50">
                                View Leaderboard
                            </Button>
                        </section>

                        {/* Community CTA */}
                        <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-2xl shadow-primary/20">
                            <div className="absolute -left-4 -bottom-4 size-24 rounded-full bg-white/10 blur-2xl" />
                            <div className="relative z-10">
                                <h3 className="text-xl font-extrabold tracking-tight">Support the community</h3>
                                <p className="mt-2 text-xs font-medium opacity-90 leading-relaxed">
                                    Help others by answering questions and earn exclusive badges and points.
                                </p>
                                <Button className="mt-6 w-full bg-white text-primary font-bold hover:bg-white/90 rounded-xl">
                                    View Active Questions
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
