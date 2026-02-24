"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import {
    BadgeCheck,
    ChevronDown,
    ChevronRight,
    Clock,
    Globe,
    Info,
    PlayCircle,
    Star,
    Users,
    Calendar,
    Zap,
    CheckCircle2,
    Lock,
    MessageSquare,
    Award,
    Video
} from "lucide-react"

// Sample curriculum data
const curriculum = [
    {
        title: "Introduction & Fundamentals",
        lessons: [
            { title: "Course Overview & Welcome", duration: "05:20", preview: true },
            { title: "Setting up your environment", duration: "12:15", preview: true },
            { title: "Basic Architecture Overview", duration: "18:40", preview: false },
        ]
    },
    {
        title: "Core Concepts & Principles",
        lessons: [
            { title: "Understanding React 19 Paradigms", duration: "25:10", preview: false },
            { title: "Deep Dive into Server Components", duration: "32:45", preview: false },
            { title: "Actions and Form Hooks", duration: "28:30", preview: false },
            { title: "State Management in 2026", duration: "45:00", preview: false },
        ]
    },
    {
        title: "Advanced Implementation",
        lessons: [
            { title: "Performance Optimization Techniques", duration: "42:15", preview: false },
            { title: "Secure Data Fetching with Tiptap", duration: "38:20", preview: false },
            { title: "Custom Middleware & Routing", duration: "31:10", preview: false },
        ]
    },
    {
        title: "Project: Building a Real-World App",
        lessons: [
            { title: "Design to Code Workflow", duration: "55:00", preview: false },
            { title: "Testing & Deployment Strategies", duration: "48:15", preview: false },
            { title: "Final Review & Certification", duration: "15:30", preview: false },
        ]
    }
]

export default function CourseLandingPage() {
    const { id } = useParams()
    const [openModules, setOpenModules] = React.useState<number[]>([0])

    const toggleModule = (index: number) => {
        setOpenModules(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        )
    }

    return (
        <div className="relative flex flex-col gap-8 pb-20">
            {/* Hero Section Wrapper - Full width style but inside layout padding */}
            <div className="relative overflow-hidden rounded-3xl bg-secondary/30 p-8 md:p-12 lg:p-16">
                <div className="relative z-10 flex flex-col gap-6 lg:max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            <Star className="size-3 fill-primary" />
                            Bestseller
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">Development • React</span>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                        Mastering Modern Tech: From Zero to Hero
                    </h1>

                    <p className="text-lg text-muted-foreground md:text-xl">
                        Learn the most in-demand skills of 2026 with real-world projects, expert instructors, and a curriculum designed for the future.
                    </p>

                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <Star className="size-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold">4.9</span>
                            <span className="text-muted-foreground">(12,450 ratings)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="size-4 text-primary" />
                            <span>45,321 students enrolled</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BadgeCheck className="size-4 text-green-500" />
                            <span>Last updated Feb 2026</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex -space-x-2 overflow-hidden">
                            {[1, 2, 3].map((i) => (
                                <img
                                    key={i}
                                    className="inline-block h-10 w-10 rounded-full ring-2 ring-background"
                                    src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=100&auto=format&fit=crop`}
                                    alt="Student"
                                />
                            ))}
                        </div>
                        <span className="text-sm font-medium">+15k others joined today</span>
                    </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute right-0 top-0 hidden h-full w-1/3 overflow-hidden lg:block">
                    <div className="absolute inset-0 bg-gradient-to-l from-primary/5 to-transparent" />
                    <Zap className="absolute -bottom-10 -right-10 size-96 rotate-12 text-primary/5" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                {/* Main Content */}
                <div className="flex flex-col gap-12 lg:col-span-2">

                    {/* What you'll learn */}
                    <section className="rounded-2xl border p-8">
                        <h2 className="mb-6 text-2xl font-bold">What you&apos;ll learn</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {[
                                "Modern architecture and best practices",
                                "Advanced state management techniques",
                                "Building scalable design systems",
                                "Performance optimization & accessibility",
                                "Deploying to serverless environments",
                                "Working with AI-assisted development"
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-green-500" />
                                    <span className="text-sm text-muted-foreground">{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Curriculum */}
                    <section>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Course Content</h2>
                            <div className="text-sm text-muted-foreground">
                                4 sections • 12 lessons • 10h 45m total length
                            </div>
                        </div>

                        <div className="divide-y rounded-xl border">
                            {curriculum.map((section, idx) => {
                                const isOpen = openModules.includes(idx)
                                return (
                                    <div key={idx} className="overflow-hidden">
                                        <button
                                            onClick={() => toggleModule(idx)}
                                            className="flex w-full items-center justify-between bg-card p-5 transition-hover hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-3 text-left">
                                                {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                                <span className="font-semibold">{section.title}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {section.lessons.length} lessons • {section.lessons.reduce((acc, l) => acc + parseInt(l.duration), 0)}m
                                            </span>
                                        </button>
                                        {isOpen && (
                                            <div className="flex flex-col gap-1 bg-card/50 p-2">
                                                {section.lessons.map((lesson, lIdx) => (
                                                    <div
                                                        key={lIdx}
                                                        className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            {lesson.preview ? (
                                                                <PlayCircle className="size-4 text-primary" />
                                                            ) : (
                                                                <Lock className="size-4 text-muted-foreground" />
                                                            )}
                                                            <span className="text-sm font-medium">{lesson.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {lesson.preview && (
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Preview</span>
                                                            )}
                                                            <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {/* Requirements */}
                    <section>
                        <h2 className="mb-4 text-2xl font-bold">Requirements</h2>
                        <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                            <li>Basic knowledge of Javascript or similar languages</li>
                            <li>A computer with internet access and VS Code installed</li>
                            <li>Desire to learn and build amazing things</li>
                        </ul>
                    </section>
                </div>

                {/* Sticky Sidebar */}
                <div className="lg:relative lg:block">
                    <div className="sticky top-24 flex flex-col gap-6">
                        <div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
                            <div className="aspect-video relative">
                                <img
                                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60"
                                    alt="Course Preview"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <PlayCircle className="size-16 text-white" />
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="mb-6 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">$49.99</span>
                                    <span className="text-sm text-muted-foreground line-through">$129.99</span>
                                    <span className="text-sm font-bold text-primary">62% OFF</span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90">
                                        Add to Cart
                                    </button>
                                    <button className="w-full rounded-lg border py-3 text-sm font-bold transition-colors hover:bg-muted">
                                        Buy Now
                                    </button>
                                </div>

                                <p className="mt-4 text-center text-xs text-muted-foreground">
                                    30-Day Money-Back Guarantee
                                </p>

                                <div className="mt-8 flex flex-col gap-4">
                                    <h4 className="text-sm font-bold">This course includes:</h4>
                                    <div className="grid gap-3">
                                        {[
                                            { icon: Clock, text: "10 hours on-demand video" },
                                            { icon: Award, text: "Certificate of completion" },
                                            { icon: Globe, text: "Full lifetime access" },
                                            { icon: Video, text: "Access on mobile and TV" },
                                            { icon: MessageSquare, text: "Q&A with Instructor" },
                                        ].map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <feature.icon className="size-4" />
                                                <span>{feature.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border p-6">
                            <div className="flex items-center gap-4">
                                <img
                                    className="size-12 rounded-full"
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop"
                                    alt="Instructor"
                                />
                                <div>
                                    <h4 className="text-sm font-bold">Alex Rivera</h4>
                                    <p className="text-xs text-muted-foreground">Senior Software Engineer</p>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                                Alex is a full-stack developer with over 10 years of experience building scalable web applications for top tech companies.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
