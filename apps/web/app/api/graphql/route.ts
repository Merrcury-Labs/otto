import { NextResponse } from "next/server";
import {
  executeGraphqlRequest,
  type GraphqlRequestBody,
} from "@/lib/graphql/schema";

const MAX_GRAPHQL_BODY_BYTES = 350_000;

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

export async function POST(request: Request) {
  let body: GraphqlRequestBody;

  try {
    body = await readGraphqlRequestBody(request);
  } catch (error) {
    console.error("GraphQL API received invalid JSON", error);

    const message =
      error instanceof Error && error.message.includes("too large")
        ? error.message
        : "Request body must be valid JSON.";

    return graphqlErrorResponse(message, 400);
  }

  const { result, status } = await executeGraphqlRequest(body, {
    headers: request.headers as Headers,
  });

  return NextResponse.json(result, {
    status,
  });
}
