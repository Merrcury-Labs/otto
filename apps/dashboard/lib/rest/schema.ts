type ExecuteRestOptions = {
  headers?: Headers;
};

const DEFAULT_SERVER_URL = "http://localhost:8080";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const getBackendRestUrl = (path: string[], search: string) => {
  const serverUrl =
    process.env.BACKEND_REST_URL ??
    process.env.SERVER_URL ??
    DEFAULT_SERVER_URL;

  const normalizedBase = serverUrl.endsWith("/") ? serverUrl : `${serverUrl}/`;
  const url = new URL(path.map(encodeURIComponent).join("/"), normalizedBase);
  url.search = search;

  return url;
};

const getForwardedHeaders = (headers?: Headers) => {
  const forwardedHeaders = new Headers();

  headers?.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();

    if (normalizedKey === "host" || HOP_BY_HOP_HEADERS.has(normalizedKey)) {
      return;
    }

    forwardedHeaders.set(key, value);
  });

  return forwardedHeaders;
};

const getResponseHeaders = (headers: Headers) => {
  const responseHeaders = new Headers();

  headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();

    if (HOP_BY_HOP_HEADERS.has(normalizedKey)) {
      return;
    }

    responseHeaders.set(key, value);
  });

  return responseHeaders;
};

export async function executeRestRequest(
  request: Request,
  path: string[] = [],
  options: ExecuteRestOptions = {}
) {
  try {
    const requestUrl = new URL(request.url);
    const backendUrl = getBackendRestUrl(path, requestUrl.search);
    const hasBody = request.method !== "GET" && request.method !== "HEAD";

    const response = await fetch(backendUrl, {
      method: request.method,
      headers: getForwardedHeaders(options.headers),
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: getResponseHeaders(response.headers),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to reach backend REST endpoint.";

    return Response.json(
      {
        errors: [
          {
            message,
          },
        ],
      },
      {
        status: 502,
      }
    );
  }
}
