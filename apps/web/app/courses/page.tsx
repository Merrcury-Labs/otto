"use client"

import * as React from "react"
import {
    BookOpen,
    Clock,
    GraduationCap,
    PlayCircle,
    Search,
    SlidersHorizontal,
    Star,
    Trophy,
    X
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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

const categories = ["All", ...Array.from(new Set(courses.map(c => c.category)))]
const levels = ["All", "Beginner", "Intermediate", "Advanced"]

export default function CoursesPage() {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedCategory, setSelectedCategory] = React.useState("All")
    const [selectedLevel, setSelectedLevel] = React.useState("All")

    const filteredCourses = React.useMemo(() => {
        return courses.filter(course => {
            const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === "All" || course.category === selectedCategory
            const matchesLevel = selectedLevel === "All" || course.level === selectedLevel

            return matchesSearch && matchesCategory && matchesLevel
        })
    }, [searchQuery, selectedCategory, selectedLevel])

    const clearFilters = () => {
        setSearchQuery("")
        setSelectedCategory("All")
        setSelectedLevel("All")
    }

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Your Courses</h1>
                <p className="text-muted-foreground">
                    Continue where you left off or start a new learning journey.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        className="pl-9 h-11"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-secondary"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(category)}
                                className="h-9 rounded-full px-4"
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                    <div className="h-6 w-px bg-border hidden md:block" />
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                        {levels.map((level) => (
                            <Button
                                key={level}
                                variant={selectedLevel === level ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedLevel(level)}
                                className="h-9 rounded-full px-4"
                            >
                                {level}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.map((course) => (
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

                                <a
                                    href={`/courses/${course.id}`}
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                >
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
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 rounded-full bg-secondary p-4">
                        <Search className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold">No courses found</h3>
                    <p className="mt-2 text-muted-foreground">
                        Try adjusting your search or filters to find what you're looking for.
                    </p>
                    <Button
                        variant="link"
                        onClick={clearFilters}
                        className="mt-4"
                    >
                        Clear all filters
                    </Button>
                </div>
            )}
        </div>
    )
}

