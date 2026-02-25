export const courses = [
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

export const quizzes = [
    {
        id: 1,
        title: "React Hooks Master Quiz",
        score: 95,
        date: "2024-03-20",
        duration: "15m",
        category: "Development",
    },
    {
        id: 2,
        title: "SQL Performance Tuning",
        score: 82,
        date: "2024-03-18",
        duration: "25m",
        category: "Database",
    },
    {
        id: 3,
        title: "Clean Architecture Patterns",
        score: 100,
        date: "2024-03-15",
        duration: "30m",
        category: "Architecture",
    },
]

export const weeklyStats = [
    { day: "Mon", hours: 2.5, lessons: 3 },
    { day: "Tue", hours: 4.1, lessons: 5 },
    { day: "Wed", hours: 1.5, lessons: 2 },
    { day: "Thu", hours: 3.2, lessons: 4 },
    { day: "Fri", hours: 5.0, lessons: 7 },
    { day: "Sat", hours: 2.0, lessons: 2 },
    { day: "Sun", hours: 1.2, lessons: 1 },
]

export const userStats = {
    totalPoints: 1250,
    averageScore: 92,
    certificates: 4,
    streak: 12,
}
