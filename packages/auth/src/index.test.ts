import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock pg.Pool as a class constructor that captures config
const poolInstances: Record<string, unknown>[] = [];
vi.mock("pg", () => ({
  Pool: vi.fn().mockImplementation(function (this: Record<string, unknown>, config: Record<string, unknown>) {
    Object.assign(this, config);
    poolInstances.push(this);
  }),
}));

// Mock better-auth to pass through its config as a plain object for assertions
vi.mock("better-auth", () => ({
  betterAuth: vi.fn().mockImplementation((config: Record<string, unknown>) => config),
}));

// Mock better-auth/next-js plugin
vi.mock("better-auth/next-js", () => ({
  nextCookies: vi.fn().mockReturnValue({ id: "next-cookies" }),
}));

describe("createAuth", () => {
  beforeEach(() => {
    poolInstances.length = 0;
    vi.stubEnv("BETTER_AUTH_SECRET", "test-secret");
    vi.stubEnv("DB_HOST", "localhost");
    vi.stubEnv("DB_USER", "test_user");
    vi.stubEnv("DB_PASSWORD", "test_pass");
    vi.stubEnv("DB_NAME", "test_db");
  });

  it("passes the baseURL to betterAuth", async () => {
    const { createAuth } = await import("./index");
    const result = createAuth("http://localhost:3000") as Record<string, unknown>;
    expect(result.baseURL).toBe("http://localhost:3000");
  });

  it("enables emailAndPassword", async () => {
    const { createAuth } = await import("./index");
    const result = createAuth("http://localhost:3000") as Record<string, unknown>;
    expect(result.emailAndPassword).toEqual({ enabled: true });
  });

  it("passes the BETTER_AUTH_SECRET from env", async () => {
    const { createAuth } = await import("./index");
    const result = createAuth("http://localhost:3000") as Record<string, unknown>;
    expect(result.secret).toBe("test-secret");
  });

  it("includes the nextCookies plugin", async () => {
    const { createAuth } = await import("./index");
    const result = createAuth("http://localhost:3000") as Record<string, unknown>;
    expect(result.plugins).toHaveLength(1);
  });

  it("configures the database pool with env vars", async () => {
    const { createAuth } = await import("./index");
    createAuth("http://localhost:3000");
    const pool = poolInstances[0] as Record<string, unknown>;
    expect(pool.host).toBe("localhost");
    expect(pool.user).toBe("test_user");
    expect(pool.password).toBe("test_pass");
    expect(pool.database).toBe("test_db");
  });

  it("sets the lms_auth search_path", async () => {
    const { createAuth } = await import("./index");
    createAuth("http://localhost:3000");
    const pool = poolInstances[0] as Record<string, unknown>;
    expect(pool.options).toBe("-c search_path=lms_auth");
  });

  it("adds a role additional field on user", async () => {
    const { createAuth } = await import("./index");
    const result = createAuth("http://localhost:3000") as Record<string, unknown>;
    const user = result.user as Record<string, unknown>;
    const fields = user.additionalFields as Record<string, unknown>;
    expect(fields.role).toEqual({
      type: "string",
      required: false,
      input: false,
    });
  });
});
