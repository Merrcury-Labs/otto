type BackendGraphqlResponse<TData> = {
	data?: TData;
	errors?: Array<{ message: string }>;
};

type BackendGraphqlRequestOptions = {
	query: string;
	variables?: Record<string, unknown>;
	operationName?: string;
};

const DEFAULT_SERVER_URL = "http://127.0.0.1:8000";
const GRAPHQL_REQUEST_TIMEOUT_MS = 15_000;

const getBackendGraphqlUrl = () => {
	if (process.env.BACKEND_GRAPHQL_URL) {
		return process.env.BACKEND_GRAPHQL_URL;
	}

	const serverUrl = process.env.SERVER_URL ?? DEFAULT_SERVER_URL;
	return new URL("/graphql", serverUrl).toString();
};

export async function backendGraphqlFetch<TData>({
	query,
	variables,
	operationName,
}: BackendGraphqlRequestOptions): Promise<TData> {
	const controller = new AbortController();
	const timeout = setTimeout(
		() => controller.abort(),
		GRAPHQL_REQUEST_TIMEOUT_MS,
	);

	try {
		const response = await fetch(getBackendGraphqlUrl(), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				query,
				variables,
				operationName,
			}),
			cache: "no-store",
			signal: controller.signal,
		});

		const result = (await response.json()) as BackendGraphqlResponse<TData>;

		if (!response.ok || result.errors?.length) {
			throw new Error(
				result.errors?.[0]?.message ?? "Unable to run backend GraphQL mutation",
			);
		}

		if (!result.data) {
			throw new Error("Backend GraphQL response did not include data.");
		}

		return result.data;
	} finally {
		clearTimeout(timeout);
	}
}
