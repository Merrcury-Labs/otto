import { createAuth } from "@repo/auth";

export const auth = createAuth(
  process.env.BETTER_AUTH_URL || "http://localhost:3002",
);
