type GraphqlResponse<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

type GraphqlRequestOptions = {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
};

export async function graphqlFetch<TData>({
  query,
  variables,
  operationName,
}: GraphqlRequestOptions): Promise<TData> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
      operationName,
    }),
  });

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new Error(
      `GraphQL endpoint returned non-JSON response (status ${response.status}).`
    );
  }

  const result = (await response.json()) as GraphqlResponse<TData>;

  if (!response.ok || result.errors?.length) {
    throw new Error(result.errors?.[0]?.message ?? "Unable to run GraphQL query");
  }

  if (!result.data) {
    throw new Error("GraphQL response did not include data.");
  }

  return result.data;
}
