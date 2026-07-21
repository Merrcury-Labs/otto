import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { executeGraphqlRequest } from "@/lib/graphql/schema";
import {
  createTutorForOwnerMutation,
  orgByOwnerQuery,
  tutorsQuery,
} from "@/lib/graphql/orgs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownerUserId = session.user.id;

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

    if (org) {
      const { result: tutorsResult } = await executeGraphqlRequest(
        {
          query: tutorsQuery,
          operationName: "Tutors",
          variables: { ownerUserId },
        },
        { headers: request.headers },
      );
      const tutors =
        "data" in tutorsResult && tutorsResult.data
          ? (tutorsResult.data as { tutors?: unknown[] }).tutors
          : null;

      // Backfill owners whose organizations predate automatic tutor creation.
      if (tutors?.length === 0 && session.user.name && session.user.email) {
        await executeGraphqlRequest(
          {
            query: createTutorForOwnerMutation,
            operationName: "CreateTutorForOwner",
            variables: {
              ownerUserId,
              name: session.user.name,
              email: session.user.email,
              bio: null,
              profilePicture: session.user.image ?? "",
            },
          },
          { headers: request.headers },
        );
      }
    }

    return NextResponse.json({ org });
  } catch (error) {
    console.error("Check org error:", error);
    return NextResponse.json(
      { error: "Failed to check org" },
      { status: 500 },
    );
  }
}
