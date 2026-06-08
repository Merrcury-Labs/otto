import { buildSchema, graphql } from "graphql";
import {
  courses,
  quizzes,
  quizCategories,
  weeklyStats,
  userStats,
} from "@/lib/data";

const schema = buildSchema(`
  enum CourseStatus {
    PUBLISHED
    DRAFT
    ARCHIVED
  }

  type Course {
    id: ID!
    title: String!
    description: String!
    instructor: String!
    duration: String!
    level: String!
    category: String!
    status: CourseStatus!
    progress: Int!
    rating: Float!
    lessons: Int!
    image: String!
  }

  type Quiz {
    id: ID!
    title: String!
    score: Int!
    bestScore: Int!
    date: String!
    duration: String!
    category: String!
    difficulty: String!
    questions: Int!
    isCompleted: Boolean!
    image: String!
  }

  type WeeklyStat {
    day: String!
    hours: Float!
    lessons: Int!
  }

  type UserStats {
    totalPoints: Int!
    averageScore: Int!
    certificates: Int!
    streak: Int!
  }

  type Query {
    courses(
      status: CourseStatus
      search: String
      category: String
      level: String
    ): [Course!]!
    course(id: ID!): Course
    quizzes(
      completed: Boolean
      search: String
      category: String
    ): [Quiz!]!
    quizCategories: [String!]!
    weeklyStats: [WeeklyStat!]!
    userStats: UserStats!
  }
`);

type CourseStatusInput = "PUBLISHED" | "DRAFT" | "ARCHIVED";

type CoursesArgs = {
  status?: CourseStatusInput;
  search?: string;
  category?: string;
  level?: string;
};

type CourseArgs = {
  id: string;
};

type QuizzesArgs = {
  completed?: boolean;
  search?: string;
  category?: string;
};

export type GraphqlRequestBody = {
  query?: string;
  variables?: Record<string, unknown>;
  operationName?: string;
};

const normalizeCourse = (course: (typeof courses)[number]) => ({
  ...course,
  status: course.status.toUpperCase(),
});

const rootValue = {
  courses({ status, search, category, level }: CoursesArgs) {
    const normalizedStatus = status?.toLowerCase();
    const normalizedSearch = search?.trim().toLowerCase();

    return courses
      .filter((course) => !normalizedStatus || course.status === normalizedStatus)
      .filter(
        (course) =>
          !normalizedSearch ||
          course.title.toLowerCase().includes(normalizedSearch) ||
          course.description.toLowerCase().includes(normalizedSearch)
      )
      .filter((course) => !category || category === "All" || course.category === category)
      .filter((course) => !level || level === "All" || course.level === level)
      .map(normalizeCourse);
  },
  course({ id }: CourseArgs) {
    const course = courses.find((item) => String(item.id) === id);

    return course ? normalizeCourse(course) : null;
  },
  quizzes({ completed, search, category }: QuizzesArgs) {
    const normalizedSearch = search?.trim().toLowerCase();

    return quizzes
      .filter((quiz) => completed === undefined || quiz.isCompleted === completed)
      .filter(
        (quiz) =>
          !normalizedSearch ||
          quiz.title.toLowerCase().includes(normalizedSearch) ||
          quiz.category.toLowerCase().includes(normalizedSearch)
      )
      .filter((quiz) => !category || category === "All" || quiz.category === category);
  },
  quizCategories() {
    return quizCategories;
  },
  weeklyStats() {
    return weeklyStats;
  },
  userStats() {
    return userStats;
  },
};

export async function executeGraphqlRequest(body: GraphqlRequestBody) {
  if (!body.query) {
    return {
      result: { errors: [{ message: "GraphQL query is required." }] },
      status: 400,
    };
  }

  const result = await graphql({
    schema,
    source: body.query,
    variableValues: body.variables,
    operationName: body.operationName,
    rootValue,
  });

  return {
    result,
    status: result.errors ? 400 : 200,
  };
}
