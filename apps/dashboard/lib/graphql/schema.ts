import {
  adminCoursesQuery,
  createCourseMutation,
  createLessonMutation,
  createModuleMutation,
  updateCourseMutation,
  updateLessonMutation,
  updateModuleMutation,
} from "./courses";
import {
  adminQuizzesQuery,
  createQuizMutation,
  createQuestionMutation,
} from "./quizzes";

export type GraphqlRequestBody = {
  query?: string;
  variables?: Record<string, unknown>;
  operationName?: string;
};

type GraphqlResponse = {
  data?: unknown;
  errors?: Array<{ message: string }>;
};

type ExecuteGraphqlOptions = {
  headers?: Headers;
};

const DEFAULT_SERVER_URL = "http://127.0.0.1:8000";
const MAX_GRAPHQL_QUERY_LENGTH = 12_000;
const MAX_GRAPHQL_VARIABLES_LENGTH = 1_000_000;
const GRAPHQL_REQUEST_TIMEOUT_MS = 15_000;

const registeredOperations = new Map(
  Object.entries({
    AdminCourses: adminCoursesQuery,
    AdminQuizzes: adminQuizzesQuery,
    CreateQuiz: createQuizMutation,
    CreateQuestion: createQuestionMutation,
    CreateCourse: createCourseMutation,
    UpdateCourse: updateCourseMutation,
    CreateModule: createModuleMutation,
    UpdateModule: updateModuleMutation,
    CreateLesson: createLessonMutation,
    UpdateLesson: updateLessonMutation,
  }).map(([operationName, query]) => [
    operationName,
    query.replace(/\s+/g, " ").trim(),
  ]),
);

const getBackendGraphqlUrl = () => {
  if (process.env.BACKEND_GRAPHQL_URL) {
    return process.env.BACKEND_GRAPHQL_URL;
  }

  const serverUrl = process.env.SERVER_URL ?? DEFAULT_SERVER_URL;
  return new URL("/graphql", serverUrl).toString();
};

const getForwardedHeaders = (headers?: Headers) => {
  const forwardedHeaders = new Headers({
    "Content-Type": "application/json",
  });

  const authorization = headers?.get("authorization");
  const cookie = headers?.get("cookie");

  if (authorization) {
    forwardedHeaders.set("Authorization", authorization);
  }

  if (cookie) {
    forwardedHeaders.set("Cookie", cookie);
  }

  return forwardedHeaders;
};

const getOperationName = (body: GraphqlRequestBody) => {
  if (body.operationName) return body.operationName;

  return body.query?.match(
    /\b(?:query|mutation)\s+([_A-Za-z][_0-9A-Za-z]*)/,
  )?.[1];
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

const sanitizeGraphqlResult = (result: GraphqlResponse): GraphqlResponse => {
  if (!result.errors?.length) return result;

  return {
    data: result.data,
    errors: result.errors.map(() => ({
      message: "GraphQL request failed.",
    })),
  };
};

export async function executeGraphqlRequest(
  body: GraphqlRequestBody,
  options: ExecuteGraphqlOptions = {},
) {
  const validationError = getGraphqlValidationError(body);

  if (validationError) {
    return {
      result: graphqlErrorResult(validationError),
      status: 400,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    GRAPHQL_REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(getBackendGraphqlUrl(), {
      method: "POST",
      headers: getForwardedHeaders(options.headers),
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type");
    const result = contentType?.includes("application/json")
      ? ((await response.json()) as GraphqlResponse)
      : (() => {
          console.error("Backend returned non-JSON. Content-Type:", contentType, "Status:", response.status);
          return {
            errors: [
              {
                message: "Backend GraphQL endpoint returned a non-JSON response.",
              },
            ],
          };
        })();

    if (result.errors?.length) {
      console.error("Backend GraphQL errors", result.errors);
    }

    console.log("Backend GraphQL response status:", response.status, "data:", JSON.stringify(result).slice(0, 500));

    return {
      result: sanitizeGraphqlResult(result),
      status: response.status,
    };
  } catch (error) {
    console.error("Unable to reach backend GraphQL endpoint", error);

    return {
      result: graphqlErrorResult("Unable to reach backend GraphQL endpoint."),
      status: 502,
    };
  } finally {
    clearTimeout(timeout);
  }
}
