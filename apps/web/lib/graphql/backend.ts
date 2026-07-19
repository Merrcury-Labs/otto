type BackendGraphqlResponse<TData> = {
	data?: TData;
	errors?: Array<{ message: string }>;
};

type BackendGraphqlRequestOptions = {
	query: string;
	variables?: Record<string, unknown>;
	operationName?: string;
};

const GRAPHQL_REQUEST_TIMEOUT_MS = 15_000;

const getBackendGraphqlUrl = () => {
	if (process.env.BACKEND_GRAPHQL_URL) {
		return process.env.BACKEND_GRAPHQL_URL;
	}

	const backendUrl = process.env.BE_URL;
	if (!backendUrl) {
		throw new Error(
			"BE_URL must be set when BACKEND_GRAPHQL_URL is not configured.",
		);
	}

	return new URL("/graphql", backendUrl).toString();
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
