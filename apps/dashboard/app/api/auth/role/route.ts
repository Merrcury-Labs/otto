import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

import { auth } from "@/lib/auth";

const pool = new Pool({
  host: process.env.DB_HOST || process.env.HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "otto_admin",
  password: process.env.DB_PASSWORD || process.env.PASSWORD || "8390dfjdkHjh737",
  database: process.env.DB_NAME || process.env.DATABASE || "otto",
  options: "-c search_path=lms_auth",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT role FROM "user" WHERE id = $1`,
      [session.user.id],
    );

    const role = result.rows[0]?.role ?? null;

    // Set the role cookie so middleware can use it
    const response = NextResponse.json({ role });
    if (role) {
      response.cookies.set("user_role", role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Get role error:", error);
    return NextResponse.json(
      { error: "Failed to get role" },
      { status: 500 },
    );
  }
}
