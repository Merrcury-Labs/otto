"use client"

import * as React from "react"
import {
    BookOpen,
    CheckCircle2,
    Clock,
    Trophy,
    TrendingUp,
    ArrowUpRight,
    Play,
    Loader2,
    BarChart3,
    FileText,
    Users,
} from "lucide-react"
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
import { useRouter } from "next/navigation"

function getGreetingTime(): string {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
}

export default function DashboardPage() {
    const router = useRouter()
    const [courseList, setCourseList] = React.useState<DisplayCourse[]>([])
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

                // Fetch published quizzes with student progress
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
    }, [isSessionLoading, user])

    // Derived student-centric stats
    const completedQuizzes = quizList.filter(q => q.isCompleted)
    const completedQuizzesCount = completedQuizzes.length
    const studentAvgScore = completedQuizzes.length > 0
        ? Math.round(completedQuizzes.reduce((acc, q) => acc + q.bestScore, 0) / completedQuizzes.length)
        : 0
    const totalPoints = completedQuizzes.reduce((acc, q) => acc + Math.round(q.bestScore), 0)
    const incompleteQuizzes = quizList.filter(q => !q.isCompleted)

    return (
        <div className="mx-auto max-w-7xl animate-in fade-in duration-700">
            <div className="flex flex-col gap-12 pb-20">
                {/* Hero / Greeting Section */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
                        <span className="h-px w-8 bg-muted-foreground/30" />
                        {getGreetingTime()}, {user?.name?.split(' ')[0] || 'Learner'}
                    </div>
                    <h1 className="text-4xl text-muted-foreground dark:text-white font-extrabold tracking-tight lg:text-5xl">
                        Your <span className="text-primary">Learning Hub</span>
                    </h1>
                    <p className="max-w-[600px] text-lg text-muted-foreground/90 dark:text-muted-foreground/50 leading-relaxed">
                        Track your progress, take quizzes, and explore courses.
                    </p>
                </div>

                {/* Student Stats Row */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: "Quizzes Completed", value: completedQuizzesCount, icon: CheckCircle2, color: "text-green-500" },
                        { label: "Avg. Score", value: `${studentAvgScore}%`, icon: TrendingUp, color: "text-blue-500" },
                        { label: "Courses Available", value: courseList.length, icon: BookOpen, color: "text-primary" },
                        { label: "Total Points", value: totalPoints, icon: Trophy, color: "text-amber-500" },
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
                    {/* Left Column */}
                    <div className="flex flex-col gap-8 lg:col-span-8">
                        {/* Quizzes to Try */}
                        <section className="flex flex-col gap-6">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-xl font-bold tracking-tight">Quizzes to Try</h3>
                                <Button variant="ghost" size="sm" className="font-bold text-primary group" asChild>
                                    <a href="/quizzes">
                                        All Quizzes <ArrowUpRight className="ml-1 size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </a>
                                </Button>
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : incompleteQuizzes.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {incompleteQuizzes.slice(0, 6).map((quiz) => (
                                        <div key={quiz.id} className="group flex flex-col gap-5 rounded-2xl border bg-card/40 p-5 transition-all hover:bg-card hover:shadow-lg hover:shadow-primary/5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                                                        {quiz.category || quiz.courseTitle}
                                                    </span>
                                                    <h4 className="mt-1 text-base font-bold tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                                                        {quiz.title}
                                                    </h4>
                                                </div>
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                                                    <FileText className="size-4 text-primary" />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                                                <span className="flex items-center gap-1">
                                                    <BarChart3 className="size-3" />
                                                    {quiz.questions} Qs
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    {quiz.duration}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="size-3" />
                                                    {quiz.difficulty}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em]">
                                                <div className="flex items-center gap-1 text-blue-500">
                                                    <BarChart3 className="size-3" />
                                                    Avg {quiz.avgScore > 0 ? `${quiz.avgScore}%` : '—'}
                                                </div>
                                                <div className="flex items-center gap-1 text-amber-500">
                                                    <Trophy className="size-3" />
                                                    Pass {quiz.passingScore}%
                                                </div>
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Users className="size-3" />
                                                    {quiz.attempts} {quiz.attempts === 1 ? 'attempt' : 'attempts'}
                                                </div>
                                            </div>

                                            <Button
                                                className="w-full h-10 rounded-xl font-bold tracking-tight text-sm"
                                                onClick={() => router.push(`/quizzes/${quiz.id}/take`)}
                                            >
                                                <span className="flex items-center gap-2">
                                                    Start Quiz <Play className="size-3 fill-current" />
                                                </span>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : quizList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
                                    <FileText className="size-12 text-muted-foreground/40 mb-4" />
                                    <h3 className="text-lg font-bold">No quizzes available yet</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Check back soon for new quizzes!</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
                                    <CheckCircle2 className="size-12 text-green-500/60 mb-4" />
                                    <h3 className="text-lg font-bold">All caught up!</h3>
                                    <p className="text-sm text-muted-foreground mt-1">You&apos;ve completed all available quizzes.</p>
                                </div>
                            )}
                        </section>

                        {/* Explore Courses */}
                        <section className="flex flex-col gap-6">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-xl font-bold tracking-tight">Explore Courses</h3>
                                <Button variant="ghost" size="sm" className="font-bold text-primary group" asChild>
                                    <a href="/courses">
                                        Browse all <ArrowUpRight className="ml-1 size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </a>
                                </Button>
                            </div>

                            {courseList.length > 0 ? (
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
                            ) : (
                                <div className="rounded-2xl border border-dashed py-12 text-center">
                                    <BookOpen className="mx-auto mb-3 size-10 text-muted-foreground/40" />
                                    <h4 className="font-bold">No courses available yet</h4>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Published courses will appear here.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar - Right */}
                    <div className="flex flex-col gap-8 lg:col-span-4">
                        {/* Your Progress */}
                        {completedQuizzes.length > 0 && (
                            <div className="rounded-3xl border bg-card/20 p-8 shadow-sm">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-lg font-bold tracking-tight">Your Progress</h3>
                                    <Trophy className="size-4 text-muted-foreground/60" />
                                </div>

                                <div className="flex flex-col gap-4">
                                    {completedQuizzes.slice(0, 5).map((quiz) => (
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
                                    {completedQuizzes.length > 5 && (
                                        <Button variant="ghost" className="w-full rounded-xl text-xs text-muted-foreground" asChild>
                                            <a href="/quizzes">View All Results</a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Dynamic CTA */}
                        {completedQuizzesCount === 0 ? (
                            <div className="relative group overflow-hidden rounded-3xl bg-neutral-900 p-8 text-neutral-50 shadow-2xl">
                                <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/20 blur-3xl" />
                                <div className="relative z-10">
                                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">Get Started</h4>
                                    <h3 className="mt-4 text-2xl font-bold leading-snug">Take Your First Quiz</h3>
                                    <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                                        Test your knowledge and earn your first points.
                                    </p>
                                    <Button className="mt-8 w-full bg-white text-black font-black hover:bg-white/90 rounded-2xl h-12 shadow-xl shadow-white/5" asChild>
                                        <a href="/quizzes">Browse Quizzes</a>
                                    </Button>
                                </div>
                            </div>
                        ) : completedQuizzesCount < quizList.length ? (
                            <div className="relative group overflow-hidden rounded-3xl bg-neutral-900 p-8 text-neutral-50 shadow-2xl">
                                <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/20 blur-3xl transition-all group-hover:bg-primary/40" />
                                <div className="relative z-10">
                                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">Progress</h4>
                                    <h3 className="mt-4 text-2xl font-bold leading-snug">Keep Going!</h3>
                                    <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                                        You&apos;ve completed {completedQuizzesCount} of {quizList.length} quizzes. {quizList.length - completedQuizzesCount} remaining.
                                    </p>
                                    <div className="mt-8 flex flex-col gap-3">
                                        <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-800">
                                            <div className="h-full bg-primary" style={{ width: `${(completedQuizzesCount / quizList.length) * 100}%` }} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                            {Math.round((completedQuizzesCount / quizList.length) * 100)}% Completion
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative group overflow-hidden rounded-3xl bg-neutral-900 p-8 text-neutral-50 shadow-2xl">
                                <div className="absolute -right-8 -top-8 size-32 rounded-full bg-green-500/20 blur-3xl" />
                                <div className="relative z-10">
                                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">Achievement</h4>
                                    <h3 className="mt-4 text-2xl font-bold leading-snug">All Quizzes Complete!</h3>
                                    <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                                        Outstanding work. You&apos;ve completed every quiz with an average of {studentAvgScore}%.
                                    </p>
                                    <Button className="mt-8 w-full bg-white text-black font-black hover:bg-white/90 rounded-2xl h-12 shadow-xl shadow-white/5" asChild>
                                        <a href="/courses">Explore Courses</a>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
