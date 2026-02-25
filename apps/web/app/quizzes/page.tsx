"use client"

import * as React from "react"
import {
    Trophy,
    Clock,
    BarChart3,
    CheckCircle2,
    Lock,
    Play,
    Search,
    Filter,
    ArrowUpRight,
    Star,
    Award
} from "lucide-react"
import { quizzes, quizCategories, userStats } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function QuizzesPage() {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedCategory, setSelectedCategory] = React.useState("All")

    const filteredQuizzes = React.useMemo(() => {
        return quizzes.filter(quiz => {
            const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === "All" || quiz.category === selectedCategory
            return matchesSearch && matchesCategory
        })
    }, [searchQuery, selectedCategory])

    const completedQuizzes = quizzes.filter(q => q.isCompleted)
    const avgScore = completedQuizzes.length > 0
        ? Math.round(completedQuizzes.reduce((acc, q) => acc + q.score, 0) / completedQuizzes.length)
        : 0

    return (
        <div className="mx-auto max-w-7xl animate-in fade-in duration-700">
            <div className="flex flex-col gap-10 pb-20">
                {/* Header Section */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                            Assessment Hub
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Quizzes & Challenges</h1>
                        <p className="max-w-[600px] text-lg text-muted-foreground leading-relaxed">
                            Test your knowledge, earn points, and unlock exclusive certifications.
                        </p>
                    </div>

                    {/* Quick Analytics Strip */}
                    <div className="flex gap-4 rounded-3xl border bg-card/30 p-6 shadow-sm backdrop-blur-sm">
                        <div className="flex flex-col gap-1 pr-6 border-r border-border/50">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Avg. Score</span>
                            <span className="text-2xl font-black text-primary">{avgScore}%</span>
                        </div>
                        <div className="flex flex-col gap-1 pr-6 border-r border-border/50">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Completed</span>
                            <span className="text-2xl font-black">{completedQuizzes.length}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Pts</span>
                            <span className="text-2xl font-black text-amber-500">{userStats.totalPoints}</span>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between border-y border-border/40 py-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                        <Input
                            placeholder="Search quizzes..."
                            className="bg-card/40 pl-9 border-none focus-visible:ring-1 focus-visible:ring-primary/50 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                        {quizCategories.map(cat => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? "secondary" : "ghost"}
                                size="sm"
                                className="rounded-full px-5 font-bold text-[10px] uppercase tracking-wider"
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Main Quiz Grid */}
                    <div className="lg:col-span-8">
                        <section className="flex flex-col gap-8">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {filteredQuizzes.map((quiz) => (
                                    <div key={quiz.id} className="group relative flex flex-col overflow-hidden rounded-3xl border bg-card/40 backdrop-blur-sm transition-all hover:bg-card hover:shadow-2xl hover:shadow-primary/5">
                                        {/* Image Header with Badge */}
                                        <div className="relative h-32 overflow-hidden">
                                            <img
                                                src={quiz.image}
                                                alt={quiz.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                                            <div className="absolute top-4 left-4">
                                                <Badge variant="secondary" className="bg-background/80 backdrop-blur-md font-black text-[9px] uppercase tracking-widest px-2.5 py-1">
                                                    {quiz.difficulty}
                                                </Badge>
                                            </div>
                                            {quiz.isCompleted && (
                                                <div className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
                                                    <CheckCircle2 className="size-4" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-5 p-6">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                                                    {quiz.category}
                                                </span>
                                                <h3 className="text-lg font-bold tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                                                    {quiz.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                                                <div className="flex items-center gap-1.5">
                                                    <BarChart3 className="size-3.5 text-blue-500" />
                                                    {quiz.questions} Qs
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="size-3.5 text-orange-500" />
                                                    {quiz.duration}
                                                </div>
                                                {quiz.isCompleted && (
                                                    <div className="flex items-center gap-1.5 text-green-500">
                                                        <Star className="size-3.5 fill-current" />
                                                        {quiz.bestScore}%
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                className="w-full h-11 rounded-2xl font-bold tracking-tight transition-all active:scale-95 group/btn"
                                                variant={quiz.isCompleted ? "outline" : "default"}
                                            >
                                                {quiz.isCompleted ? (
                                                    <span className="flex items-center gap-2">Retake Quiz <ArrowUpRight className="size-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" /></span>
                                                ) : (
                                                    <span className="flex items-center gap-2">Start Assessment <Play className="size-3 fill-current" /></span>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {filteredQuizzes.length === 0 && (
                                    <div className="col-span-full py-20 text-center opacity-50">
                                        <Search className="size-12 mx-auto mb-4 text-muted-foreground" />
                                        <h3 className="text-xl font-bold">No quizzes found</h3>
                                        <p className="text-sm">Try adjusting your filters or search terms.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar section */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        {/* Achievements Cards */}
                        <section className="rounded-[2.5rem] border bg-card/20 p-8 shadow-sm backdrop-blur-md">
                            <div className="mb-8 flex items-center justify-between">
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Achievements</h3>
                                <Award className="size-4 text-amber-500" />
                            </div>

                            <div className="flex flex-col gap-6">
                                {[
                                    { title: "Hooks Master", desc: "Score 90%+ in React Hooks", icon: Trophy, color: "text-amber-500", progress: 100 },
                                    { title: "Fast Thinker", desc: "Complete 5 quizzes under 10m", icon: Clock, color: "text-blue-500", progress: 60 },
                                    { title: "Architect", desc: "Pass all Design Pattern quizzes", icon: Star, color: "text-purple-500", progress: 30 },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex size-10 items-center justify-center rounded-2xl bg-${item.color.split('-')[1]}-500/10 ${item.color} ring-1 ring-current/20`}>
                                                <item.icon className="size-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold leading-tight">{item.title}</span>
                                                <span className="text-[10px] font-medium text-muted-foreground leading-tight mt-0.5">{item.desc}</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-secondary/50 overflow-hidden">
                                            <div
                                                className={`h-full bg-primary transition-all duration-1000`}
                                                style={{ width: `${item.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="mt-8 w-full rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                                View All Badges
                            </Button>
                        </section>

                        {/* Leaderboard CTA */}
                        <div className="group relative overflow-hidden rounded-[2.5rem] bg-neutral-900 p-8 text-neutral-50 shadow-2xl transition-all hover:-translate-y-1">
                            <div className="absolute -right-12 -bottom-12 size-40 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100" />
                            <div className="relative z-10">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">Competitive</h4>
                                <h3 className="mt-4 text-2xl font-black leading-tight tracking-tight">Climb the Leaderboard</h3>
                                <p className="mt-2 text-sm text-neutral-400 leading-relaxed font-medium">
                                    Compete with peers, share scores, and prove your mastery across the community.
                                </p>
                                <Button className="mt-8 w-full bg-white text-black font-black hover:bg-white/90 rounded-2xl h-12 shadow-xl shadow-white/5">
                                    Join Global Rank
                                </Button>
                            </div>
                        </div>

                        {/* Recent Performance Recap */}
                        <section className="rounded-3xl border border-dashed border-border/60 bg-transparent p-6">
                            <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                                <BarChart3 className="size-3" />
                                Last Session Recap
                            </h4>
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                    Your precision improved by <span className="text-green-500 font-bold">+8%</span> in the <span className="text-foreground">Architecture</span> category. Keep focusing on pattern recognition!
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
