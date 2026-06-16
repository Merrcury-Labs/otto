import { NextResponse } from "next/server";
import {
  executeGraphqlRequest,
  type GraphqlRequestBody,
} from "../../../lib/graphql/schema";

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
    }
  );

export async function POST(request: Request) {
  let body: GraphqlRequestBody;

  try {
    body = (await request.json()) as GraphqlRequestBody;
  } catch (error) {
    console.error("GraphQL API received invalid JSON", error);

    return graphqlErrorResponse("Request body must be valid JSON.", 400);
  }

  try {
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
