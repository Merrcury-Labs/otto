import type { Extension, onAuthenticatePayload } from "@hocuspocus/server";

/**
 * Authentication extension for Hocuspocus.
 *
 * Phase 2: Validates a shared secret token passed as a WebSocket query param.
 * Future: Will validate better-auth session tokens when dashboard auth is added.
 */
export class AuthExtension implements Extension {
  async onAuthenticate(data: onAuthenticatePayload): Promise<void> {
    const { token } = data;
    const secret = process.env.COLLAB_SECRET;

    // In development, allow connections without a token if no secret is configured
    if (!secret) {
      console.warn(
        "[collab] No COLLAB_SECRET set — allowing all connections (development only)"
      );
      return;
    }

    if (token !== secret) {
      throw new Error("Unauthorized: invalid collaboration token");
    }
  }
}
