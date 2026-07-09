"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { graphqlFetch } from "@/lib/graphql/client"
import { courseDetailQuery, courseDetailWithEnrollmentQuery, studentByUserIdQuery, enrollStudentMutation } from "@/lib/graphql/courses"
import {
    type BackendCourse,
    type DisplayCourse,
    normalizeCourse,
    flattenLessons,
} from "@/lib/graphql/normalize"
import { authClient } from "@/lib/auth-client"
import {
    BadgeCheck,
    ChevronDown,
    ChevronRight,
    Clock,
    Globe,
    PlayCircle,
    Star,
    Users,
    Zap,
    CheckCircle2,
    Lock,
    MessageSquare,
    Award,
    Video,
    BookOpen,
    Loader2,
} from "lucide-react"

type EnrollmentData = {
    id: string
    progress: number
    completed: boolean
} | null

export default function CourseLandingPage() {
    const { id } = useParams()
    const [openModules, setOpenModules] = React.useState<number[]>([0])
    const [course, setCourse] = React.useState<DisplayCourse | null>(null)
    const [isEnrolled, setIsEnrolled] = React.useState(false)
    const [enrollment, setEnrollment] = React.useState<EnrollmentData>(null)
    const [isEnrolling, setIsEnrolling] = React.useState(false)
    const [enrollError, setEnrollError] = React.useState<string | null>(null)
    const [studentId, setStudentId] = React.useState<string | null>(null)

    const { data: session } = authClient.useSession()
    const user = session?.user

    // Resolve Django student ID from Better Auth user ID
    React.useEffect(() => {
        let mounted = true

        async function resolveStudentId() {
            if (!user) {
                if (mounted) setStudentId(null)
                return
            }

            try {
                const result = await graphqlFetch<{ studentByUserId: { id: string } | null }>({
                    query: studentByUserIdQuery,
                    operationName: "StudentByUserId",
                    variables: { userId: user.id },
                })

                if (!mounted) return
                setStudentId(result.studentByUserId?.id ?? null)
            } catch {
                if (mounted) setStudentId(null)
            }
        }

        resolveStudentId()

        return () => {
            mounted = false
        }
    }, [user])

    // Load course details with enrollment status
    React.useEffect(() => {
        let mounted = true

        async function loadCourse() {
            try {
                if (studentId) {
                    const result = await graphqlFetch<{ courses: Array<BackendCourse & { isEnrolled: boolean; enrollment: EnrollmentData }> }>({
                        query: courseDetailWithEnrollmentQuery,
                        operationName: "CourseDetailWithEnrollment",
                        variables: { studentId },
                    })

                    if (!mounted) return

                    const backendCourse = result.courses.find(
                        (item) => String(item.id) === String(id)
                    )

                    if (backendCourse) {
                        setCourse(normalizeCourse(backendCourse))
                        setIsEnrolled(backendCourse.isEnrolled)
                        setEnrollment(backendCourse.enrollment)
                    } else {
                        setCourse(null)
                    }
                } else {
                    const result = await graphqlFetch<{ courses: BackendCourse[] }>({
                        query: courseDetailQuery,
                        operationName: "CourseDetail",
                    })

                    if (!mounted) return

                    const backendCourse = result.courses.find(
                        (item) => String(item.id) === String(id)
                    )

                    if (backendCourse) {
                        setCourse(normalizeCourse(backendCourse))
                        setIsEnrolled(false)
                        setEnrollment(null)
                    } else {
                        setCourse(null)
                    }
                }
            } catch {
                if (mounted) setCourse(null)
            }
        }

        if (id) loadCourse()

        return () => {
            mounted = false
        }
    }, [id, studentId])

    const handleEnroll = async () => {
        if (!user) {
            window.location.href = `/sign-in?callbackUrl=${encodeURIComponent(window.location.pathname)}`
            return
        }

        if (!studentId) {
            setEnrollError("Unable to identify student account. Please try again.")
            return
        }

        setIsEnrolling(true)
        setEnrollError(null)

        try {
            await graphqlFetch<{ enrollStudent: { id: string } }>({
                query: enrollStudentMutation,
                operationName: "EnrollStudent",
                variables: { studentId, courseId: String(id) },
            })

            setIsEnrolled(true)
        } catch (error) {
            setEnrollError(
                error instanceof Error ? error.message : "Failed to enroll. Please try again."
            )
        } finally {
            setIsEnrolling(false)
        }
    }

    const toggleModule = (index: number) => {
        setOpenModules(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        )
    }

    const firstLessonUrl = course?.modules?.length
        ? (() => {
            const all = flattenLessons(course.modules)
            const first = all[0]
            return first ? `/courses/${id}/learn?lesson=${first.id}` : `/courses/${id}`
        })()
        : `/courses/${id}`

    return (
        <div className="relative flex flex-col gap-8 pb-20" style={{ fontFamily: 'var(--font-ui)' }}>
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl" style={{ border: '1px solid var(--border-primary)' }}>
                {/* Hero background image */}
                {course?.image && (
                    <div className="absolute inset-0">
                        <img
                            src={course.image}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
                    </div>
                )}
                <div className="relative z-10 flex flex-col gap-6 lg:max-w-2xl p-8 md:p-12 lg:p-16">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: 'var(--color-gold)', color: 'white' }}>
                            <Star className="size-3 fill-white" />
                            Bestseller
                        </span>
                        <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>{course?.category} • {course?.level}</span>
                    </div>

                    <h1 className="text-hero md:text-section text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>
                        {course?.title ?? "Loading course..."}
                    </h1>

                    <p className="text-body-serif text-[var(--muted-foreground)]" style={{ fontFamily: 'var(--font-serif)' }}>
                        {course?.description ?? ""}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
                        {(course?.rating ?? 0) > 0 && (
                            <div className="flex items-center gap-2">
                                <Star className="size-4 fill-[var(--color-gold)]" style={{ color: 'var(--color-gold)' }} />
                                <span className="font-bold">{course!.rating}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Users className="size-4" style={{ color: 'var(--color-accent)' }} />
                            <span>{isEnrolled ? 'You are enrolled' : course?.students ? `${course.students.toLocaleString()} students enrolled` : 'Enroll today'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BadgeCheck className="size-4" style={{ color: 'var(--color-success)' }} />
                            <span>{course?.lessons ?? 0} lessons</span>
                        </div>
                    </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute right-0 top-0 hidden h-full w-1/3 overflow-hidden lg:block">
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to left, var(--color-accent)/5, transparent)' }} />
                    <Zap className="absolute -bottom-10 -right-10 size-96 rotate-12" style={{ color: 'var(--color-accent)' }} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                {/* Main Content */}
                <div className="flex flex-col gap-12 lg:col-span-2">

                    {/* Prerequisites */}
                    {course?.prerequisites && course.prerequisites.length > 0 && (
                        <section className="rounded-2xl p-8" style={{ backgroundColor: 'var(--surface-100)', border: '1px solid var(--border-primary)' }}>
                            <h2 className="mb-6 text-subheading" style={{ fontFamily: 'var(--font-display)' }}>Prerequisites</h2>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {course.prerequisites.map((prereq, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-1 size-5 shrink-0" style={{ color: 'var(--color-success)' }} />
                                        <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{prereq}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Enrollment progress (shown when enrolled) */}
                    {isEnrolled && enrollment && enrollment.progress > 0 && (
                        <section className="rounded-2xl p-8" style={{ backgroundColor: 'var(--surface-100)', border: '1px solid var(--border-primary)' }}>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-subheading" style={{ fontFamily: 'var(--font-display)' }}>Your Progress</h2>
                                <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>{Math.round(enrollment.progress)}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--surface-200)' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${enrollment.progress}%`, backgroundColor: 'var(--color-accent)' }}
                                />
                            </div>
                            {enrollment.completed && (
                                <p className="mt-3 flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-success)' }}>
                                    <CheckCircle2 className="size-4" />
                                    Course completed!
                                </p>
                            )}
                        </section>
                    )}

                    {/* Curriculum */}
                    {course?.modules && course.modules.length > 0 && (
                        <section>
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-subheading" style={{ fontFamily: 'var(--font-display)' }}>Course Content</h2>
                                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                    {course.modules.length} sections • {course.lessons} lessons
                                </div>
                            </div>

                            <div className="divide-y rounded-xl" style={{ border: '1px solid var(--border-primary)' }}>
                                {course.modules.map((module, idx) => {
                                    const isOpen = openModules.includes(idx)
                                    return (
                                        <div key={module.id} className="overflow-hidden">
                                            <button
                                                onClick={() => toggleModule(idx)}
                                                className="flex w-full items-center justify-between p-5 transition-hover"
                                                style={{ backgroundColor: 'var(--surface-100)' }}
                                            >
                                                <div className="flex items-center gap-3 text-left">
                                                    {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                                    <span className="font-semibold">{module.title}</span>
                                                </div>
                                                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                    {module.lessons.length} lessons
                                                </span>
                                            </button>
                                            {isOpen && (
                                                <div className="flex flex-col gap-1 p-2" style={{ backgroundColor: 'var(--surface-100)/50' }}>
                                                    {module.lessons.map((lesson) => (
                                                        <a
                                                            key={lesson.id}
                                                            href={`/courses/${id}/learn?lesson=${lesson.id}`}
                                                            className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                {lesson.type === "video" ? (
                                                                    <PlayCircle className="size-4" style={{ color: 'var(--color-accent)' }} />
                                                                ) : lesson.type === "quiz" ? (
                                                                    <BookOpen className="size-4" style={{ color: 'var(--color-accent)' }} />
                                                                ) : (
                                                                    <Lock className="size-4" style={{ color: 'var(--muted-foreground)' }} />
                                                                )}
                                                                <span className="text-sm font-medium">{lesson.title}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                {lesson.type === "video" && (
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>Video</span>
                                                                )}
                                                                {lesson.duration && (
                                                                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{lesson.duration}</span>
                                                                )}
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sticky Sidebar */}
                <div className="lg:relative lg:block">
                    <div className="sticky top-24 flex flex-col gap-6">
                        <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid var(--border-primary)', backgroundColor: 'var(--surface-100)', boxShadow: 'var(--shadow-card)' }}>
                            <div className="aspect-video relative">
                                {course?.thumbnail ? (
                                    <img
                                        src={course.thumbnail}
                                        alt={course?.title ?? "Course Preview"}
                                        className="h-full w-full object-cover"
                                        style={{ borderBottom: '1px solid var(--border-primary)' }}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                        <BookOpen className="size-10 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                                    <PlayCircle className="size-16" style={{ color: 'var(--surface-200)' }} />
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="mb-6 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">$49.99</span>
                                    <span className="text-sm line-through" style={{ color: 'var(--muted-foreground)' }}>$129.99</span>
                                    <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>62% OFF</span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {isEnrolled ? (
                                        <a
                                            href={firstLessonUrl}
                                            className="flex w-full items-center justify-center gap-2 py-3 text-sm font-bold transition-colors duration-150 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                                        >
                                            <PlayCircle className="size-4" />
                                            {enrollment && enrollment.progress > 0 ? "Continue Learning" : "Start Learning"}
                                        </a>
                                    ) : (
                                        <button
                                            onClick={handleEnroll}
                                            disabled={isEnrolling}
                                            className="flex w-full items-center justify-center gap-2 py-3 text-sm font-bold transition-colors duration-150 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isEnrolling ? (
                                                <>
                                                    <Loader2 className="size-4 animate-spin" />
                                                    Enrolling...
                                                </>
                                            ) : (
                                                <>
                                                    <BookOpen className="size-4" />
                                                    Enroll Now
                                                </>
                                            )}
                                        </button>
                                    )}
                                    {enrollError && (
                                        <p className="text-xs text-center text-red-500">{enrollError}</p>
                                    )}
                                </div>

                                <p className="mt-4 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                    30-Day Money-Back Guarantee
                                </p>

                                <div className="mt-8 flex flex-col gap-4">
                                    <h4 className="text-sm font-bold">This course includes:</h4>
                                    <div className="grid gap-3">
                                        {[
                                            { icon: Clock, text: `${course?.lessons ?? 0} lessons` },
                                            { icon: Award, text: "Certificate of completion" },
                                            { icon: Globe, text: "Full lifetime access" },
                                            { icon: Video, text: "Access on mobile and TV" },
                                            { icon: MessageSquare, text: "Q&A with Instructor" },
                                        ].map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                                <feature.icon className="size-4" />
                                                <span>{feature.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instructor card */}
                        <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--surface-100)', border: '1px solid var(--border-primary)' }}>
                            <div className="flex items-center gap-4">
                                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                    <Users className="size-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold">{course?.instructor ?? "Instructor"}</h4>
                                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Course Instructor</p>
                                </div>
                            </div>
                            {course?.students ? (
                                <p className="mt-4 text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                                    {course.students.toLocaleString()} students enrolled
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
