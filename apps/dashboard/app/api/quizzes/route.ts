import { executeRestRequest } from "../../../lib/rest/schema";

const PATH = ["quizzes"];

function handler(request: Request) {
  return executeRestRequest(request, PATH, {
    headers: request.headers,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
