import { buildSchema, graphql } from "graphql";
import { courses } from "../../app/courses/data";
import { quizzes } from "../../app/quizzes/data";

const schema = buildSchema(`
  enum ContentStatus {
    PUBLISHED
    DRAFT
    ARCHIVED
  }

  type Lesson {
    id: ID!
    title: String!
    type: String!
    duration: String
    url: String
    content: String
  }

  type CourseModule {
    id: ID!
    title: String!
    lessons: [Lesson!]!
  }

  type Course {
    id: ID!
    title: String!
    description: String!
    status: ContentStatus!
    students: Int!
    quizzes: Int!
    progress: Int!
    duration: String!
    createdAt: String!
    updatedAt: String!
    thumbnail: String!
    prerequisites: [String!]!
    tags: [String!]!
    modules: [CourseModule!]!
  }

  type QuizQuestion {
    id: ID!
    question: String!
    type: String!
    points: Int!
    options: [String!]!
    correctAnswer: String
    categories: [String!]
    hint: String
  }

  type Quiz {
    id: ID!
    title: String!
    description: String!
    status: ContentStatus!
    duration: String!
    courseId: String
    courseTitle: String
    attempts: Int!
    avgScore: Int!
    createdAt: String!
    updatedAt: String!
    questions: [QuizQuestion!]!
  }

  type CourseStats {
    total: Int!
    published: Int!
    students: Int!
    averageProgress: Int!
  }

  type QuizStats {
    total: Int!
    published: Int!
    attempts: Int!
    averageScore: Int!
  }

  type Query {
    courses(status: ContentStatus, search: String): [Course!]!
    course(id: ID!): Course
    courseStats: CourseStats!
    quizzes(status: ContentStatus, search: String): [Quiz!]!
    quiz(id: ID!): Quiz
    quizStats: QuizStats!
  }
`);

type ContentStatusInput = "PUBLISHED" | "DRAFT" | "ARCHIVED";

type ListArgs = {
  status?: ContentStatusInput;
  search?: string;
};

type DetailArgs = {
  id: string;
};

export type GraphqlRequestBody = {
  query?: string;
  variables?: Record<string, unknown>;
  operationName?: string;
};

const normalizeStatus = (status?: ContentStatusInput) => status?.toLowerCase();

const normalizeSearch = (search?: string) => search?.trim().toLowerCase();

const normalizeCourse = (course: (typeof courses)[number]) => ({
  ...course,
  status: course.status.toUpperCase(),
});

const normalizeQuiz = (quiz: (typeof quizzes)[number]) => ({
  ...quiz,
  status: quiz.status.toUpperCase(),
  questions: quiz.questions.map((question) => ({
    ...question,
    correctAnswer:
      question.correctAnswer === undefined
        ? null
        : JSON.stringify(question.correctAnswer),
  })),
});

const rootValue = {
  courses({ status, search }: ListArgs) {
    const requestedStatus = normalizeStatus(status);
    const requestedSearch = normalizeSearch(search);

    return courses
      .filter((course) => !requestedStatus || course.status === requestedStatus)
      .filter(
        (course) =>
          !requestedSearch ||
          course.title.toLowerCase().includes(requestedSearch) ||
          course.description.toLowerCase().includes(requestedSearch)
      )
      .map(normalizeCourse);
  },
  course({ id }: DetailArgs) {
    const course = courses.find((item) => String(item.id) === id);

    return course ? normalizeCourse(course) : null;
  },
  courseStats() {
    const total = courses.length;

    return {
      total,
      published: courses.filter((course) => course.status === "published").length,
      students: courses.reduce((sum, course) => sum + course.students, 0),
      averageProgress: Math.round(
        courses.reduce((sum, course) => sum + course.progress, 0) / total
      ),
    };
  },
  quizzes({ status, search }: ListArgs) {
    const requestedStatus = normalizeStatus(status);
    const requestedSearch = normalizeSearch(search);

    return quizzes
      .filter((quiz) => !requestedStatus || quiz.status === requestedStatus)
      .filter(
        (quiz) =>
          !requestedSearch ||
          quiz.title.toLowerCase().includes(requestedSearch) ||
          quiz.description.toLowerCase().includes(requestedSearch) ||
          quiz.courseTitle?.toLowerCase().includes(requestedSearch)
      )
      .map(normalizeQuiz);
  },
  quiz({ id }: DetailArgs) {
    const quiz = quizzes.find((item) => String(item.id) === id);

    return quiz ? normalizeQuiz(quiz) : null;
  },
  quizStats() {
    const published = quizzes.filter((quiz) => quiz.status === "published");

    return {
      total: quizzes.length,
      published: published.length,
      attempts: quizzes.reduce((sum, quiz) => sum + quiz.attempts, 0),
      averageScore: Math.round(
        published.reduce((sum, quiz) => sum + quiz.avgScore, 0) /
          Math.max(published.length, 1)
      ),
    };
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
