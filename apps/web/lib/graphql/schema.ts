import { buildSchema, graphql } from "graphql";
import {
  courses,
  quizzes,
  quizCategories,
  weeklyStats,
  userStats,
} from "@/lib/data";
import {
  adminCoursesQuery,
  courseQuery,
  publishedCoursesQuery,
} from "@/lib/graphql/courses";
import { dashboardQuery, quizzesQuery } from "@/lib/graphql/quizzes";

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
    thumbnail: String
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

const MAX_GRAPHQL_QUERY_LENGTH = 12_000;
const MAX_GRAPHQL_VARIABLES_LENGTH = 250_000;

const registeredOperations = new Map(
  Object.entries({
    PublishedCourses: publishedCoursesQuery,
    AdminCourses: adminCoursesQuery,
    Course: courseQuery,
    Quizzes: quizzesQuery,
    Dashboard: dashboardQuery,
  }).map(([operationName, query]) => [
    operationName,
    query.replace(/\s+/g, " ").trim(),
  ]),
);

const normalizeCourse = (course: (typeof courses)[number]) => ({
  ...course,
  status: course.status.toUpperCase(),
});

const rootValue = {
  courses({ status, search, category, level }: CoursesArgs) {
    const normalizedStatus = status?.toLowerCase();
    const normalizedSearch = search?.trim().toLowerCase();

    return courses
      .filter(
        (course) => !normalizedStatus || course.status === normalizedStatus,
      )
      .filter(
        (course) =>
          !normalizedSearch ||
          course.title.toLowerCase().includes(normalizedSearch) ||
          course.description.toLowerCase().includes(normalizedSearch),
      )
      .filter(
        (course) =>
          !category || category === "All" || course.category === category,
      )
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
      .filter(
        (quiz) => completed === undefined || quiz.isCompleted === completed,
      )
      .filter(
        (quiz) =>
          !normalizedSearch ||
          quiz.title.toLowerCase().includes(normalizedSearch) ||
          quiz.category.toLowerCase().includes(normalizedSearch),
      )
      .filter(
        (quiz) => !category || category === "All" || quiz.category === category,
      );
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

const getOperationName = (body: GraphqlRequestBody) => {
  if (body.operationName) return body.operationName;

  return body.query?.match(/\bquery\s+([_A-Za-z][_0-9A-Za-z]*)/)?.[1];
};

const getGraphqlValidationError = (body: GraphqlRequestBody) => {
  if (!body.query) return "GraphQL query is required.";
  if (body.query.length > MAX_GRAPHQL_QUERY_LENGTH)
    return "GraphQL query is too large.";
  if (/\b__(?:schema|type)\b/.test(body.query))
    return "GraphQL introspection is disabled.";

  const operationName = getOperationName(body);
  if (!operationName) return "GraphQL operationName is required.";

  const registeredQuery = registeredOperations.get(operationName);
  if (!registeredQuery) return "GraphQL operation is not registered.";

  if (body.query.replace(/\s+/g, " ").trim() !== registeredQuery) {
    return "GraphQL query does not match the registered operation.";
  }

  const variablesLength = JSON.stringify(body.variables ?? {}).length;
  if (variablesLength > MAX_GRAPHQL_VARIABLES_LENGTH) {
    return "GraphQL variables are too large.";
  }

  return null;
};

const graphqlErrorResult = (message: string) => ({
  errors: [{ message }],
});

export async function executeGraphqlRequest(body: GraphqlRequestBody) {
  const validationError = getGraphqlValidationError(body);

  if (validationError) {
    return {
      result: graphqlErrorResult(validationError),
      status: 400,
    };
  }

  const query = body.query;

  if (!query) {
    return {
      result: graphqlErrorResult("GraphQL query is required."),
      status: 400,
    };
  }

  const result = await graphql({
    schema,
    source: query,
    variableValues: body.variables,
    operationName: body.operationName,
    rootValue,
  });

  return {
    result,
    status: result.errors ? 400 : 200,
  };
}
