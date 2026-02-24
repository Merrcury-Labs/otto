"use client"

import * as React from "react"
import {
    BookOpen,
    Clock,
    GraduationCap,
    PlayCircle,
    Star,
    Trophy
} from "lucide-react"

// Sample course data
const courses = [
    {
        id: 1,
        title: "Mastering React 19",
        description: "Deep dive into the latest React 19 features, including Server Components, Actions, and the new hooks interface.",
        instructor: "Sarah Drasner",
        duration: "12h 45m",
        level: "Advanced",
        category: "Development",
        progress: 75,
        rating: 4.9,
        lessons: 48,
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 2,
        title: "UI/UX Design Fundamentals",
        description: "Learn the core principles of design, color theory, typography, and how to create user-centric digital experiences.",
        instructor: "Gary Simon",
        duration: "8h 20m",
        level: "Beginner",
        category: "Design",
        progress: 30,
        rating: 4.7,
        lessons: 32,
        image: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 3,
        title: "Node.js Backend Architecture",
        description: "Build scalable and maintainable backend systems using Node.js, Express, and modern architectural patterns like Clean Architecture.",
        instructor: "Maximilian Schwarzmüller",
        duration: "15h 10m",
        level: "Intermediate",
        category: "Development",
        progress: 10,
        rating: 4.8,
        lessons: 56,
        image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 4,
        title: "Next.js 15 Deep Dive",
        description: "Explore the cutting edge of web development with Next.js 15, Turbopack, and the App Router architecture.",
        instructor: "Lee Robinson",
        duration: "10h 30m",
        level: "Advanced",
        category: "Development",
        progress: 0,
        rating: 5.0,
        lessons: 42,
        image: "https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 5,
        title: "Typescript Mastery",
        description: "Move from Javascript to Typescript and master advanced types, generics, and utility functions for robust code.",
        instructor: "Josh W. Comeau",
        duration: "6h 15m",
        level: "Intermediate",
        category: "Development",
        progress: 90,
        rating: 4.9,
        lessons: 28,
        image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 6,
        title: "Frontend Performance Optimization",
        description: "Learn how to make your web applications blazing fast with advanced performance monitoring and optimization techniques.",
        instructor: "Addy Osmani",
        duration: "9h 45m",
        level: "Advanced",
        category: "Performance",
        progress: 45,
        rating: 4.6,
        lessons: 35,
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60"
    }
]

export default function CoursesPage() {
    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Your Courses</h1>
                <p className="text-muted-foreground">
                    Continue where you left off or start a new learning journey.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
                    >
                        {/* Image Section */}
                        <div className="relative aspect-video overflow-hidden">
                            <img
                                src={course.image}
                                alt={course.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute left-2 top-2">
                                <span className="rounded-full bg-background/90 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
                                    {course.category}
                                </span>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex flex-1 flex-col p-5">
                            <div className="mb-2 flex items-center justify-between">
                                <span className={`text-xs font-bold uppercase tracking-wider ${course.level === 'Advanced' ? 'text-red-500' :
                                        course.level === 'Intermediate' ? 'text-blue-500' : 'text-green-500'
                                    }`}>
                                    {course.level}
                                </span>
                                <div className="flex items-center gap-1 text-sm font-medium">
                                    <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                                    {course.rating}
                                </div>
                            </div>

                            <h3 className="mb-2 line-clamp-1 text-xl font-bold">{course.title}</h3>
                            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                                {course.description}
                            </p>

                            <div className="mb-4 mt-auto flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="size-3.5" />
                                    {course.duration}
                                </div>
                                <div className="flex items-center gap-1">
                                    <PlayCircle className="size-3.5" />
                                    {course.lessons} Lessons
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium">{course.progress}% Complete</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${course.progress}%` }}
                                    />
                                </div>
                            </div>

                            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                                {course.progress > 0 ? (
                                    <>
                                        <PlayCircle className="size-4" />
                                        Continue Learning
                                    </>
                                ) : (
                                    <>
                                        <BookOpen className="size-4" />
                                        Start Course
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
