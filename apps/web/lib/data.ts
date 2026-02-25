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

export const communityPosts = [
    {
        id: 1,
        author: {
            name: "Sarah Drasner",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop",
            role: "Instructor"
        },
        title: "The Future of React Server Components",
        content: "I've been experimenting with Next.js 15 and RSCs for a while now. The performance benefits are undeniable, but the mental model shift is real. What are your thoughts on 'use server' in larger teams?",
        tags: ["React", "Architecture", "NextJS"],
        likes: 124,
        comments: 42,
        date: "2h ago"
    },
    {
        id: 2,
        author: {
            name: "Gary Simon",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop",
            role: "Designer"
        },
        title: "Design Systems in 2024: Less is More",
        content: "We're seeing a shift back to extreme minimalism. High contrast, large whitespace, and subtle border-radii. I'm putting together a guide on how to build 'invisible' UIs.",
        tags: ["Design", "UI", "Minimalism"],
        likes: 89,
        comments: 15,
        date: "5h ago"
    },
    {
        id: 3,
        author: {
            name: "Lee Robinson",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop",
            role: "Vercel"
        },
        title: "Speeding up local development with Turbopack",
        content: "Turbopack is now stable in Next.js 15. If you haven't tried running with --turbo yet, you're missing out on 70% faster incremental builds.",
        tags: ["Performance", "Tooling", "Tips"],
        likes: 210,
        comments: 67,
        date: "1d ago"
    }
]

export const trendingTopics = [
    { name: "React19", posts: 142 },
    { name: "ServerComponents", posts: 98 },
    { name: "TailwindV4", posts: 76 },
    { name: "AIEngineering", posts: 234 },
    { name: "UXResearch", posts: 45 }
]

export const topContributors = [
    { name: "Alex Rivers", points: 8450, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop", rank: 1 },
    { name: "Elena Chen", points: 7200, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop", rank: 2 },
    { name: "Marcus Thorne", points: 6800, avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop", rank: 3 },
]
