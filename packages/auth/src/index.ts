import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

export function createAuth(baseURL: string) {
  return betterAuth({
    baseURL,
    emailAndPassword: {
      enabled: true,
    },
    plugins: [nextCookies()],
    secret: process.env.BETTER_AUTH_SECRET,
    database: new Pool({
      host: process.env.DB_HOST || process.env.HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || "otto_admin",
      password: process.env.DB_PASSWORD || process.env.PASSWORD || "8390dfjdkHjh737",
      database: process.env.DB_NAME || process.env.DATABASE || "otto",
      options: "-c search_path=auth",
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    }),
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          input: false,
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
