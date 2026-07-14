import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

import { auth } from "@/lib/auth";
import { backendGraphqlFetch } from "@/lib/graphql/backend";

const registerStudentMutation = /* GraphQL */ `
  mutation RegisterStudent($name: String!, $email: String!, $userId: String) {
    registerStudent(name: $name, email: $email, userId: $userId) {
      id
      name
      email
      userID
    }
  }
`;

const pool = new Pool({
  host: process.env.DB_HOST || process.env.HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "otto_admin",
  password: process.env.DB_PASSWORD || process.env.PASSWORD || "8390dfjdkHjh737",
  database: process.env.DB_NAME || process.env.DATABASE || "otto",
  options: "-c search_path=lms_auth",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { role } = body as { role: "student" | "org" };

    if (!role || !["student", "org"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'student' or 'org'." },
        { status: 400 },
      );
    }

    // Update the user's role directly in the database
    await pool.query(
      `UPDATE "user" SET role = $1 WHERE id = $2`,
      [role, session.user.id],
    );

    // If student, create Django Student record
    if (role === "student") {
      await backendGraphqlFetch({
        query: registerStudentMutation,
        operationName: "RegisterStudent",
        variables: {
          name: session.user.name,
          email: session.user.email,
          userId: session.user.id,
        },
      });
    }

    // Set a role cookie so middleware can check it without a DB query
    const response = NextResponse.json({ success: true, role });
    response.cookies.set("user_role", role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 },
    );
  }
}
