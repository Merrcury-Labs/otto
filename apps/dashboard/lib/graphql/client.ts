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

  const result = (await response.json()) as GraphqlResponse<TData>;

  console.log(`graphqlFetch [${operationName ?? "unnamed"}] response:`, result);

  if (!response.ok || result.errors?.length) {
    throw new Error(result.errors?.[0]?.message ?? "Unable to run GraphQL query");
  }

  if (!result.data) {
    throw new Error("GraphQL response did not include data.");
  }

  return result.data;
}
