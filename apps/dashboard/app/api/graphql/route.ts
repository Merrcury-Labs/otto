import { NextRequest, NextResponse } from "next/server";
import {
  executeGraphqlRequest,
  type GraphqlRequestBody,
} from "../../../lib/graphql/schema";
import { auth } from "@/lib/auth";

// Course and lesson editor content is serialized into GraphQL string variables.
// Keep a bounded limit, but leave enough room for rich-text course content.
const MAX_GRAPHQL_BODY_BYTES = 4 * 1024 * 1024;

const graphqlErrorResponse = (message: string, status: number) =>
  NextResponse.json(
    {
      errors: [
        {
          message,
        },
      ],
    },
    {
      status,
    },
  );

const readGraphqlRequestBody = async (
  request: Request,
): Promise<GraphqlRequestBody> => {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > MAX_GRAPHQL_BODY_BYTES) {
    throw new Error("GraphQL request body is too large.");
  }

  const rawBody = await request.text();

  if (new TextEncoder().encode(rawBody).length > MAX_GRAPHQL_BODY_BYTES) {
    throw new Error("GraphQL request body is too large.");
  }

  return JSON.parse(rawBody) as GraphqlRequestBody;
};

// Operations that should be scoped to the user's org
const ORG_SCOPED_OPERATIONS = new Set([
  "AdminCourses",
  "CourseList",
  "AdminQuizzes",
  "Tutors",
  "CreateTutorForOwner",
]);

export async function POST(request: NextRequest) {
  let body: GraphqlRequestBody;

  try {
    body = await readGraphqlRequestBody(request);
  } catch (error) {
    console.error("GraphQL API received invalid JSON", error);

    const message =
      error instanceof Error && error.message.includes("too large")
        ? error.message
        : "Request body must be valid JSON.";

    return graphqlErrorResponse(
      message,
      message.includes("too large") ? 413 : 400,
    );
  }

  try {
    // Inject ownerUserId for org-scoped operations
    const operationName = body.operationName;
    if (operationName && ORG_SCOPED_OPERATIONS.has(operationName)) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (session?.user?.id) {
        body.variables = {
          ...body.variables,
          ownerUserId: session.user.id,
        };
      }
    }

    const { result, status } = await executeGraphqlRequest(body, {
      headers: request.headers,
    });

    if (result.errors?.length) {
      console.error("GraphQL API errors", result.errors);
    }

    return NextResponse.json(result, {
      status,
    });
  } catch (error) {
    console.error("GraphQL API request failed", error);

    return graphqlErrorResponse("Unable to process GraphQL request.", 500);
  }
}
