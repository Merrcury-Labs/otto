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

export async function executeGraphqlRequest(
  body: GraphqlRequestBody,
  options: ExecuteGraphqlOptions = {}
) {
  if (!body.query) {
    return {
      result: { errors: [{ message: "GraphQL query is required." }] },
      status: 400,
    };
  }

  try {
    const response = await fetch(getBackendGraphqlUrl(), {
      method: "POST",
      headers: getForwardedHeaders(options.headers),
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type");
    const result = contentType?.includes("application/json")
      ? ((await response.json()) as GraphqlResponse)
      : {
          errors: [
            {
              message:
                "Backend GraphQL endpoint returned a non-JSON response.",
            },
          ],
        };

    return {
      result,
      status: response.status,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to reach backend GraphQL endpoint.";

    return {
      result: {
        errors: [
          {
            message,
          },
        ],
      },
      status: 502,
    };
  }
}
