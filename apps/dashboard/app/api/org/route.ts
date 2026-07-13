import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { executeGraphqlRequest } from "@/lib/graphql/schema";
import { createOrgMutation } from "@/lib/graphql/orgs";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, logo, website } = body as {
      name: string;
      description?: string | null;
      logo?: string;
      website?: string | null;
    };

    if (!name) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 },
      );
    }

    const { result, status } = await executeGraphqlRequest(
      {
        query: createOrgMutation,
        operationName: "CreateOrg",
        variables: {
          name,
          description: description || null,
          logo: logo || "",
          website: website || null,
          ownerUserId: session.user.id,
        },
      },
      { headers: request.headers },
    );

    if (result.errors?.length) {
      return NextResponse.json(
        { error: result.errors[0]?.message ?? "GraphQL error" },
        { status: status ?? 500 },
      );
    }

    const orgData = "data" in result ? result.data : null;

    return NextResponse.json({ org: orgData });
  } catch (error) {
    console.error("Create org error:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 },
    );
  }
}
