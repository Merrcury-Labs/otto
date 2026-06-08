# GraphQL

The web app exposes a local GraphQL endpoint at `/api/graphql`.

This is a repo-local API backed by the existing mock data in `apps/web/lib/data.ts`.
It does not require a separate backend service.

## Files

- `schema.ts` defines the executable GraphQL schema and resolvers.
- `client.ts` provides the browser/client fetch helper.
- `courses.ts` and `quizzes.ts` keep reusable operation strings.

## Example

```ts
const data = await graphqlFetch<{ courses: Course[] }>({
  query: publishedCoursesQuery,
});
```
