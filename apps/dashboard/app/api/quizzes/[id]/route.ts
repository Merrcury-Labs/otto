import { executeRestRequest } from "../../../../lib/rest/schema";

type QuizRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function handler(request: Request, context: QuizRouteContext) {
  const { id } = await context.params;

  return executeRestRequest(request, ["quizzes", id], {
    headers: request.headers,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
