import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

import { auth } from "@/lib/auth";
import { backendGraphqlFetch } from "@/lib/graphql/backend";

const pool = new Pool({
  host: process.env.DB_HOST || process.env.HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "otto_admin",
  password: process.env.DB_PASSWORD || process.env.PASSWORD || "8390dfjdkHjh737",
  database: process.env.DB_NAME || process.env.DATABASE || "otto",
  options: "-c search_path=lms_auth",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const orgByOwnerQuery = /* GraphQL */ `
  query OrgByOwner($ownerUserId: String!) {
    orgByOwner(ownerUserId: $ownerUserId) {
      id
    }
  }
`;

const studentByUserIdQuery = /* GraphQL */ `
  query StudentByUserId($userId: String!) {
    studentByUserId(userId: $userId) {
      id
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role in better-auth DB
    const roleResult = await pool.query(
      `SELECT role FROM "user" WHERE id = $1`,
      [session.user.id],
    );
    const role = roleResult.rows[0]?.role ?? null;

    // Check if user has an org in Django
    let hasOrg = false;
    try {
      const orgResult = await backendGraphqlFetch<{
        orgByOwner: { id: string } | null;
      }>({
        query: orgByOwnerQuery,
        operationName: "OrgByOwner",
        variables: { ownerUserId: session.user.id },
      });
      hasOrg = !!orgResult.orgByOwner;
    } catch {
      // Org check failed — might not have any org
    }

    // Check if user has a student record in Django
    let hasStudent = false;
    try {
      const studentResult = await backendGraphqlFetch<{
        studentByUserId: { id: string } | null;
      }>({
        query: studentByUserIdQuery,
        operationName: "StudentByUserId",
        variables: { userId: session.user.id },
      });
      hasStudent = !!studentResult.studentByUserId;
    } catch {
      // Student check failed — might not have a record
    }

    return NextResponse.json({ role, hasOrg, hasStudent });
  } catch (error) {
    console.error("Onboarding check error:", error);
    return NextResponse.json(
      { error: "Failed to check onboarding status" },
      { status: 500 },
    );
  }
}
