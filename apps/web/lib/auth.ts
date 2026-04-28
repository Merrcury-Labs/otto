import { betterAuth } from "better-auth";
import { connection } from "next/server";
import { Pool } from "pg";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    emailAndPassword: {
        enabled: true,
    },
    secret: process.env.BETTER_AUTH_SECRET,
    database: new Pool({
        connectionString: process.env.connection_string,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    }),
})