import { createAuthClient } from "better-auth/react";

export type AuthClient = ReturnType<typeof createAuthClient>;

export function createClientAuth(): AuthClient {
  return createAuthClient();
}
