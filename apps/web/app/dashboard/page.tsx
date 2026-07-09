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
} from "lucide-react"
import { courses, quizzes as mockQuizzes, weeklyStats, userStats as mockUserStats } from "@/lib/data"
import { Button } from "@/components/ui/button"
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
    const [quizList, setQuizList] = React.useState<DisplayQuiz[]>(
        mockQuizzes.map((q) => ({
            id: q.id,
            title: q.title,
            description: "",
            score: q.score,
            bestScore: q.bestScore,
            date: q.date,
            duration: q.duration,
            category: q.category,
            difficulty: q.difficulty,
            questions: q.questions,
            isCompleted: q.isCompleted,
            image: q.image,
            attempts: 0,
            avgScore: 0,
            passingScore: 50,
            courseId: "",
            courseTitle: q.category,
        }))
    )
    const [isLoading, setIsLoading] = React.useState(true)

    const { data: session } = authClient.useSession()
    const user = session?.user

    // Load courses and quizzes from backend
    React.useEffect(() => {
        let mounted = true

        async function loadData() {
            try {
                // Load courses in parallel with student resolution
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

                // Fetch quizzes with or without progress
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

                // Update courses
                if (coursesResult) {
                    const normalized = coursesResult.courses.map(normalizeCourse)
                    setCourseList(normalized)
                    setActiveCourseCount(normalized.length)
                }

                // Update quizzes
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
                // Keep mock data fallback
            } finally {
                if (mounted) setIsLoading(false)
            }
        }

        loadData()

        return () => {
            mounted = false
        }
    }, [user])

    return (
        <div className="mx-auto max-w-7xl animate-in fade-in duration-700">
            <div className="flex flex-col gap-12 pb-20">
                {/* Header Section */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
                        <span className="h-px w-8 bg-muted-foreground/30" />
                        Learning Dashboard
                    </div>
                    <h1 className="text-4xl text-muted-foreground dark:text-white font-extrabold tracking-tight lg:text-5xl">
                        Welcome back, <span className="text-primary">Morné</span>
                    </h1>
                    <p className="max-w-[600px] text-lg text-muted-foreground/90 dark:text-muted-foreground/50 leading-relaxed">
                        You've completed 4 lessons this week. You're just <span className="font-semibold text-foreground">2 hours away</span> from hitting your weekly goal.
                    </p>
                </div>

                {/* Main Stats Row */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: "Points Earned", value: mockUserStats.totalPoints, icon: Trophy, color: "text-amber-500", trend: "+12%" },
                        { label: "Active Courses", value: activeCourseCount, icon: BookOpen, color: "text-primary" },
                        { label: "Completion Rate", value: `${mockUserStats.averageScore}%`, icon: GraduationCap, color: "text-blue-500" },
                        { label: "Learning Streak", value: `${mockUserStats.streak}d`, icon: Calendar, color: "text-orange-500" },
                    ].map((stat, i) => (
                        <div key={i} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card/40 p-6 transition-all hover:bg-card hover:shadow-xl hover:shadow-primary/5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-muted-foreground/80 dark:text-muted-foreground/50">{stat.label}</span>
                                <stat.icon className={`size-5 ${stat.color} opacity-80`} />
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <h2 className="text-4xl font-bold tracking-tight">{stat.value}</h2>
                                {stat.trend && (
                                    <span className="flex items-center text-xs font-bold text-green-500">
                                        <TrendingUp className="mr-1 size-3" />
                                        {stat.trend}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Activity Section - Left */}
                    <div className="flex flex-col gap-8 lg:col-span-8">
                        <section className="flex flex-col gap-6">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-xl font-bold tracking-tight text-muted-foreground dark:text-white">Weekly Engagement</h3>
                                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <div className="size-2 rounded-full bg-primary" />
                                        Hours Spent
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border bg-card/30 p-8 shadow-sm">
                                <div className="flex h-56 items-end justify-between gap-3 px-4 sm:gap-6">
                                    {weeklyStats.map((stat) => (
                                        <div key={stat.day} className="group relative flex flex-1 flex-col items-center gap-4">
                                            <div className="relative w-full flex-1">
                                                <div
                                                    className="absolute bottom-0 w-full rounded-full bg-gradient-to-t from-primary/80 to-primary/40 transition-all duration-500 ease-out group-hover:from-primary group-hover:to-primary/60"
                                                    style={{ height: `${(stat.hours / 6) * 100}%` }}
                                                />
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1.5 text-[10px] font-bold shadow-sm opacity-0 ring-1 ring-border transition-all group-hover:opacity-100 group-hover:-translate-y-1">
                                                    {stat.hours}h
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold tracking-wider text-muted-foreground/70 uppercase">
                                                {stat.day[0]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

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
                                            {course.progress > 0 && (
                                                <div className="mt-4 flex flex-col gap-2">
                                                    <div className="flex items-center justify-between font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
                                                        <span>Progression</span>
                                                        <span>{course.progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/40">
                                                        <div
                                                            className="h-full rounded-full bg-primary transition-all duration-1000"
                                                            style={{ width: `${course.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <Button className="rounded-none h-12 border-t font-bold tracking-tight bg-transparent hover:bg-primary hover:text-primary-foreground text-foreground transition-all border-none group" asChild>
                                            <a href={`/courses/${course.id}`} className="flex items-center justify-center gap-2">
                                                {course.progress > 0 ? "Resume Course" : "Start Course"}
                                                <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Meta & Quizzes - Right */}
                    <div className="flex flex-col gap-8 lg:col-span-4">
                        <div className="rounded-3xl border bg-card/20 p-8 shadow-sm">
                            <div className="mb-8 flex items-center justify-between">
                                <h3 className="text-lg font-bold tracking-tight">Recent Performance</h3>
                                <Trophy className="size-4 text-muted-foreground/60" />
                            </div>

                            <div className="flex flex-col gap-4">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : quizList.length > 0 ? (
                                    quizList
                                        .filter((q) => q.isCompleted)
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
                                        ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-muted-foreground">No completed quizzes yet</p>
                                )}

                                <Button variant="outline" className="mt-4 rounded-xl border-dashed font-bold tracking-tight hover:bg-primary/5 hover:border-primary/50" asChild>
                                    <a href="/quizzes">Full Quiz History</a>
                                </Button>
                            </div>
                        </div>

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
