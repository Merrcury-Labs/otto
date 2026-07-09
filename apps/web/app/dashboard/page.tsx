"use client"

import * as React from "react"
import {
    BookOpen,
    CheckCircle2,
    Clock,
    GraduationCap,
    Trophy,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Search,
    Play,
    Loader2,
    BarChart3,
    FileText,
    Users,
} from "lucide-react"
import { courses, quizzes as mockQuizzes, weeklyStats, userStats as mockUserStats } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { graphqlFetch } from "@/lib/graphql/client"
import { publishedCoursesQuery, studentByUserIdQuery } from "@/lib/graphql/courses"
import {
    publishedQuizzesWithProgressQuery,
    publishedQuizzesQuery,
} from "@/lib/graphql/quizzes"
import {
    type BackendCourse,
    type BackendQuiz,
    type BackendQuizProgress,
    type DisplayCourse,
    type DisplayQuiz,
    normalizeCourse,
    normalizeQuiz,
} from "@/lib/graphql/normalize"
import { authClient } from "@/lib/auth-client"

export default function DashboardPage() {
    const enrolledCourses = courses.filter(c => c.progress > 0)

    const [courseList, setCourseList] = React.useState<DisplayCourse[]>(
        enrolledCourses.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            instructor: c.instructor,
            duration: c.duration,
            level: c.level,
            category: c.category,
            status: c.status.toUpperCase(),
            progress: c.progress,
            rating: c.rating,
            lessons: c.lessons,
            thumbnail: c.image,
            image: c.image,
            students: 0,
            prerequisites: [],
            modules: [],
        }))
    )
    const [activeCourseCount, setActiveCourseCount] = React.useState(enrolledCourses.length)
    const [quizList, setQuizList] = React.useState<DisplayQuiz[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    const { data: session, isPending: isSessionLoading } = authClient.useSession()
    const user = session?.user

    // Load courses and quizzes from backend
    React.useEffect(() => {
        if (isSessionLoading) return

        let mounted = true

        async function loadData() {
            try {
                const coursesPromise = graphqlFetch<{ courses: BackendCourse[] }>({
                    query: publishedCoursesQuery,
                }).catch(() => null)

                // Resolve student ID for quiz progress
                let studentId: string | null = null
                if (user) {
                    try {
                        const result = await graphqlFetch<{ studentByUserId: { id: string } | null }>({
                            query: studentByUserIdQuery,
                            operationName: "StudentByUserId",
                            variables: { userId: user.id },
                        })
                        studentId = result.studentByUserId?.id ?? null
                    } catch (err) {
                        console.error("Failed to resolve student ID for dashboard", err)
                    }
                }

                // Fetch all quizzes — admin view shows published AND draft
                const quizzesPromise = studentId
                    ? graphqlFetch<{
                        quizzes: BackendQuiz[]
                        studentQuizProgress: BackendQuizProgress[]
                    }>({
                        query: publishedQuizzesWithProgressQuery,
                        operationName: "PublishedQuizzesWithProgress",
                        variables: { studentId },
                    })
                    : graphqlFetch<{ quizzes: BackendQuiz[] }>({
                        query: publishedQuizzesQuery,
                        operationName: "PublishedQuizzes",
                    })

                const [coursesResult, quizzesResult] = await Promise.all([coursesPromise, quizzesPromise])

                if (!mounted) return

                if (coursesResult) {
                    const normalized = coursesResult.courses.map(normalizeCourse)
                    setCourseList(normalized)
                    setActiveCourseCount(normalized.length)
                }

                if (quizzesResult) {
                    const progressByQuizId = new Map<string, BackendQuizProgress>()
                    const studentProgress = ("studentQuizProgress" in quizzesResult)
                        ? quizzesResult.studentQuizProgress as BackendQuizProgress[]
                        : []
                    for (const p of studentProgress) {
                        progressByQuizId.set(String(p.quiz.id), p)
                    }

                    const normalizedQuizzes = ((quizzesResult as { quizzes: BackendQuiz[] }).quizzes ?? []).map((q) =>
                        normalizeQuiz(q, progressByQuizId.get(String(q.id)))
                    )
                    setQuizList(normalizedQuizzes)
                }
            } catch (err) {
                console.error("Failed to load dashboard data from backend", err)
            } finally {
                if (mounted) setIsLoading(false)
            }
        }

        loadData()

        return () => {
            mounted = false
        }
    }, [user])

    // Derived quiz stats
    const publishedCount = quizList.filter(q => q.status === "PUBLISHED").length
    const draftCount = quizList.filter(q => q.status === "DRAFT").length
    const totalAttempts = quizList.reduce((acc, q) => acc + q.attempts, 0)
    const overallAvgScore = quizList.length > 0
        ? Math.round(quizList.reduce((acc, q) => acc + q.avgScore, 0) / quizList.length)
        : 0

    return (
        <div className="mx-auto max-w-7xl animate-in fade-in duration-700">
            <div className="flex flex-col gap-12 pb-20">
                {/* Header Section */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
                        <span className="h-px w-8 bg-muted-foreground/30" />
                        Admin Dashboard
                    </div>
                    <h1 className="text-4xl text-muted-foreground dark:text-white font-extrabold tracking-tight lg:text-5xl">
                        Quiz <span className="text-primary">Overview</span>
                    </h1>
                    <p className="max-w-[600px] text-lg text-muted-foreground/90 dark:text-muted-foreground/50 leading-relaxed">
                        Manage and monitor all quizzes across your platform.
                    </p>
                </div>

                {/* Main Stats Row */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: "Total Quizzes", value: quizList.length, icon: FileText, color: "text-primary" },
                        { label: "Published", value: publishedCount, icon: CheckCircle2, color: "text-green-500" },
                        { label: "Total Attempts", value: totalAttempts, icon: Users, color: "text-blue-500" },
                        { label: "Avg. Score", value: `${overallAvgScore}%`, icon: BarChart3, color: "text-amber-500" },
                    ].map((stat, i) => (
                        <div key={i} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card/40 p-6 transition-all hover:bg-card hover:shadow-xl hover:shadow-primary/5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-muted-foreground/80 dark:text-muted-foreground/50">{stat.label}</span>
                                <stat.icon className={`size-5 ${stat.color} opacity-80`} />
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <h2 className="text-4xl font-bold tracking-tight">{stat.value}</h2>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Quiz Table - Left */}
                    <div className="flex flex-col gap-8 lg:col-span-8">
                        <section className="flex flex-col gap-6">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-xl font-bold tracking-tight">All Quizzes</h3>
                                <Button variant="ghost" size="sm" className="font-bold text-primary group" asChild>
                                    <a href="/quizzes">
                                        Quiz Hub <ArrowUpRight className="ml-1 size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </a>
                                </Button>
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : quizList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
                                    <FileText className="size-12 text-muted-foreground/40 mb-4" />
                                    <h3 className="text-lg font-bold">No quizzes found</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Create quizzes from the admin panel to see them here.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {quizList.map((quiz) => (
                                        <div key={quiz.id} className="group flex items-center gap-5 rounded-2xl border bg-card/40 p-5 transition-all hover:bg-card hover:shadow-md">
                                            {/* Status indicator */}
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                                                <FileText className="size-4 text-primary" />
                                            </div>

                                            {/* Title & meta */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold leading-tight truncate">{quiz.title}</p>
                                                    <Badge
                                                        variant={quiz.status === "PUBLISHED" ? "default" : "secondary"}
                                                        className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0"
                                                    >
                                                        {quiz.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{quiz.description}</p>
                                                <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen className="size-3" />
                                                        {quiz.questions} Qs
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="size-3" />
                                                        {quiz.duration}
                                                    </span>
                                                    <span>{quiz.courseTitle}</span>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="hidden sm:flex items-center gap-6 shrink-0">
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="text-lg font-bold">{quiz.attempts}</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Attempts</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="text-lg font-bold">{quiz.avgScore > 0 ? `${quiz.avgScore}%` : "—"}</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Avg Score</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="text-lg font-bold">{quiz.passingScore}%</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Pass</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Courses section */}
                        <section className="flex flex-col gap-6">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-xl font-bold tracking-tight">Available Courses</h3>
                                <Button variant="ghost" size="sm" className="font-bold text-primary group" asChild>
                                    <a href="/courses">
                                        Browse all <ArrowUpRight className="ml-1 size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </a>
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {courseList.slice(0, 4).map((course) => (
                                    <div key={course.id} className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card/40 transition-all hover:bg-card hover:shadow-lg hover:shadow-primary/5">
                                        <div className="p-6">
                                            <div className="mb-4 flex items-center justify-between">
                                                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                                                    {course.category}
                                                </span>
                                                <div className="size-8 rounded-full bg-secondary/50 flex items-center justify-center">
                                                    <Play className="size-3 text-foreground" />
                                                </div>
                                            </div>
                                            <h4 className="text-lg font-bold leading-tight line-clamp-1">{course.title}</h4>
                                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                                            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                                                <span>{course.lessons} lessons</span>
                                                <span>•</span>
                                                <span>{course.level}</span>
                                            </div>
                                        </div>
                                        <Button className="rounded-none h-12 border-t font-bold tracking-tight bg-transparent hover:bg-primary hover:text-primary-foreground text-foreground transition-all border-none group" asChild>
                                            <a href={`/courses/${course.id}`} className="flex items-center justify-center gap-2">
                                                View Course
                                                <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar - Right */}
                    <div className="flex flex-col gap-8 lg:col-span-4">
                        {/* Quiz stats summary */}
                        <div className="rounded-3xl border bg-card/20 p-8 shadow-sm">
                            <div className="mb-8 flex items-center justify-between">
                                <h3 className="text-lg font-bold tracking-tight">Quiz Stats</h3>
                                <BarChart3 className="size-4 text-muted-foreground/60" />
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-9 items-center justify-center rounded-xl bg-green-500/10">
                                            <CheckCircle2 className="size-4 text-green-500" />
                                        </div>
                                        <span className="text-sm font-medium">Published</span>
                                    </div>
                                    <span className="text-lg font-bold">{publishedCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10">
                                            <FileText className="size-4 text-amber-500" />
                                        </div>
                                        <span className="text-sm font-medium">Draft</span>
                                    </div>
                                    <span className="text-lg font-bold">{draftCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10">
                                            <Users className="size-4 text-blue-500" />
                                        </div>
                                        <span className="text-sm font-medium">Total Attempts</span>
                                    </div>
                                    <span className="text-lg font-bold">{totalAttempts}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                                            <Trophy className="size-4 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium">Overall Avg</span>
                                    </div>
                                    <span className="text-lg font-bold">{overallAvgScore}%</span>
                                </div>
                            </div>

                            <Button variant="outline" className="mt-8 w-full rounded-xl border-dashed font-bold tracking-tight hover:bg-primary/5 hover:border-primary/50" asChild>
                                <a href="/quizzes">Manage Quizzes</a>
                            </Button>
                        </div>

                        {/* Student progress (if logged in) */}
                        {quizList.some(q => q.isCompleted) && (
                            <div className="rounded-3xl border bg-card/20 p-8 shadow-sm">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-lg font-bold tracking-tight">Your Progress</h3>
                                    <Trophy className="size-4 text-muted-foreground/60" />
                                </div>

                                <div className="flex flex-col gap-4">
                                    {quizList
                                        .filter(q => q.isCompleted)
                                        .slice(0, 5)
                                        .map((quiz) => (
                                            <div key={quiz.id} className="flex items-center gap-4 rounded-2xl bg-background/40 p-4 transition-all hover:bg-background">
                                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs ring-1 ring-primary/20">
                                                    {quiz.bestScore}%
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold leading-tight truncate">{quiz.title}</p>
                                                    <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider mt-1">
                                                        {quiz.date}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        <div className="relative group overflow-hidden rounded-3xl bg-neutral-900 p-8 text-neutral-50 shadow-2xl">
                            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/20 blur-3xl transition-all group-hover:bg-primary/40" />
                            <div className="relative z-10">
                                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">Next Goal</h4>
                                <h3 className="mt-4 text-2xl font-bold leading-snug">Expert Certification</h3>
                                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                                    You're very close! Finish your next module to unlock the verified certificate.
                                </p>
                                <div className="mt-8 flex flex-col gap-3">
                                    <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-800">
                                        <div className="h-full bg-primary" style={{ width: '88%' }} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">88% Completion</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
