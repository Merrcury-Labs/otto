import type { Course } from "./types";

export const courses: Course[] = [
  {
    id: 1,
    title: "React Fundamentals",
    description: "Learn the basics of React including components, state, and hooks",
    status: "published",
    students: 234,
    quizzes: 12,
    progress: 75,
    duration: "12 hours",
    createdAt: "2024-04-25",
    updatedAt: "2 hours ago",
    thumbnail: "",
    prerequisites: ["Basic JavaScript knowledge", "Comfortable using a code editor"],
    tags: ["React", "Frontend", "Web Development"],
    modules: [
      {
        id: 101,
        title: "Getting Started With React",
        lessons: [
          {
            id: 1001,
            title: "What React Solves",
            type: "video",
            duration: "12 min",
            url: "https://example.com/react-intro",
          },
          {
            id: 1002,
            title: "Components and JSX",
            type: "text",
            duration: "18 min",
            content: "Learn how JSX maps to React elements and reusable UI components.",
          },
        ],
      },
      {
        id: 102,
        title: "State and Interactions",
        lessons: [
          {
            id: 1003,
            title: "Managing Local State",
            type: "video",
            duration: "20 min",
          },
          {
            id: 1004,
            title: "React Basics Checkpoint",
            type: "quiz",
            duration: "10 min",
            questions: [
              {
                id: 1,
                question: "Which hook stores local component state?",
                type: "multiple-choice",
                options: ["useState", "useMemo", "useRef"],
                correctAnswer: 0,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "TypeScript Advanced",
    description: "Deep dive into TypeScript advanced features and patterns",
    status: "published",
    students: 156,
    quizzes: 8,
    progress: 60,
    duration: "8 hours",
    createdAt: "2024-04-24",
    updatedAt: "1 day ago",
    thumbnail: "",
    prerequisites: ["TypeScript basics", "Experience with typed JavaScript projects"],
    tags: ["TypeScript", "Frontend", "Backend"],
    modules: [
      {
        id: 201,
        title: "Type Modeling",
        lessons: [
          {
            id: 2001,
            title: "Generics in Practice",
            type: "text",
            duration: "25 min",
            content: "Use generics to preserve relationships between inputs and outputs.",
          },
          {
            id: 2002,
            title: "Discriminated Unions",
            type: "code",
            duration: "30 min",
            content: "Refactor a loosely typed state machine into a discriminated union.",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Next.js App Router",
    description: "Build modern web applications with Next.js 13+",
    status: "draft",
    students: 0,
    quizzes: 5,
    progress: 30,
    duration: "10 hours",
    createdAt: "2024-04-23",
    updatedAt: "3 days ago",
    thumbnail: "",
    prerequisites: ["React fundamentals", "Basic server/client rendering concepts"],
    tags: ["Next.js", "React", "Full Stack"],
    modules: [
      {
        id: 301,
        title: "Routing Foundations",
        lessons: [
          {
            id: 3001,
            title: "Layouts and Pages",
            type: "video",
            duration: "16 min",
          },
          {
            id: 3002,
            title: "Server and Client Components",
            type: "text",
            duration: "22 min",
            content: "Understand where logic should run in App Router projects.",
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Database Design",
    description: "Master database design principles and SQL optimization",
    status: "published",
    students: 189,
    quizzes: 15,
    progress: 90,
    duration: "15 hours",
    createdAt: "2024-04-22",
    updatedAt: "5 days ago",
    thumbnail: "",
    prerequisites: ["Basic SQL", "Understanding of application data models"],
    tags: ["SQL", "Database", "Backend"],
    modules: [
      {
        id: 401,
        title: "Relational Modeling",
        lessons: [
          {
            id: 4001,
            title: "Entities and Relationships",
            type: "video",
            duration: "18 min",
          },
          {
            id: 4002,
            title: "Normalization Exercise",
            type: "code",
            duration: "35 min",
            content: "Normalize a product catalog schema.",
          },
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Python for Beginners",
    description: "Start your programming journey with Python",
    status: "draft",
    students: 0,
    quizzes: 3,
    progress: 20,
    duration: "6 hours",
    createdAt: "2024-04-21",
    updatedAt: "1 week ago",
    thumbnail: "",
    prerequisites: [],
    tags: ["Python", "Backend"],
    modules: [
      {
        id: 501,
        title: "Python Basics",
        lessons: [
          {
            id: 5001,
            title: "Variables and Types",
            type: "text",
            duration: "15 min",
            content: "Write your first Python values and expressions.",
          },
        ],
      },
    ],
  },
  {
    id: 6,
    title: "JavaScript ES6+",
    description: "Modern JavaScript features and best practices",
    status: "published",
    students: 312,
    quizzes: 10,
    progress: 85,
    duration: "9 hours",
    createdAt: "2024-04-20",
    updatedAt: "2 weeks ago",
    thumbnail: "",
    prerequisites: ["Basic programming concepts"],
    tags: ["JavaScript", "Frontend", "Web Development"],
    modules: [
      {
        id: 601,
        title: "Modern Syntax",
        lessons: [
          {
            id: 6001,
            title: "Destructuring and Spread",
            type: "video",
            duration: "14 min",
          },
          {
            id: 6002,
            title: "Async JavaScript",
            type: "quiz",
            duration: "12 min",
            questions: [
              {
                id: 1,
                question: "Which keyword pauses inside an async function?",
                type: "multiple-choice",
                options: ["await", "yield", "pause"],
                correctAnswer: 0,
              },
            ],
          },
        ],
      },
    ],
  },
];

export function getCourseById(id: number) {
  return courses.find((course) => course.id === id);
}
