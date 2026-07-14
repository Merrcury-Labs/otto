# Security Notes

## GraphQL endpoints

The frontend apps expose GraphQL routes at:

- `apps/dashboard/app/api/graphql/route.ts`
- `apps/web/app/api/graphql/route.ts`

Both routes enforce request body size limits and reject malformed JSON before execution.

The dashboard route is a proxy to the backend GraphQL service. It only forwards registered operations declared in `apps/dashboard/lib/graphql/courses.ts` and `apps/dashboard/lib/graphql/quizzes.ts`. Posted GraphQL documents must match the registered operation text after whitespace normalization. Introspection requests are rejected at the proxy.

The web route executes an in-process mock schema. It also only accepts registered operations declared in `apps/web/lib/graphql/courses.ts` and `apps/web/lib/graphql/quizzes.ts`, and rejects introspection requests.

## Error handling

Dashboard backend GraphQL errors are logged server-side and returned to clients as a generic failure message. This avoids leaking backend validation details, hostnames, stack-derived messages, or database errors through the browser-facing proxy.

## Remaining responsibilities

The backend must still enforce authentication and authorization for every query and mutation. The dashboard proxy forwards only `Authorization` and `Cookie` headers to the backend, but it is not a substitute for object-level backend permission checks.

Cookie-authenticated mutations should also be protected by backend CSRF/origin checks. The frontend proxy limits the accepted operation set, but CSRF defense belongs at the trust boundary that owns the session.

Large binary assets should not be sent through GraphQL as base64 data URLs long term. Prefer uploading files to object storage or a dedicated upload endpoint, then storing a URL or object key through GraphQL.

## Adding GraphQL operations

When adding a new GraphQL operation:

1. Add the operation as a named query or mutation constant.
2. Register it in the relevant `registeredOperations` map.
3. Keep list queries lean; use detail queries for nested records or large text fields.
4. Avoid returning raw backend error messages to clients.
