import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { executeGraphqlRequest } from "@/lib/graphql/schema";
import { orgByOwnerQuery } from "@/lib/graphql/orgs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownerUserId = request.nextUrl.searchParams.get("ownerUserId");

    if (!ownerUserId) {
      return NextResponse.json(
        { error: "ownerUserId is required" },
        { status: 400 },
      );
    }

    const { result } = await executeGraphqlRequest(
      {
        query: orgByOwnerQuery,
        operationName: "OrgByOwner",
        variables: { ownerUserId },
      },
      { headers: request.headers },
    );

    const org = ("data" in result && result.data
      ? (result.data as { orgByOwner?: unknown }).orgByOwner
      : null) ?? null;

    return NextResponse.json({ org });
  } catch (error) {
    console.error("Check org error:", error);
    return NextResponse.json(
      { error: "Failed to check org" },
      { status: 500 },
    );
  }
}
