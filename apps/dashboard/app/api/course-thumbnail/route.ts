import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { orgByOwnerQuery } from "@/lib/graphql/orgs";
import { executeGraphqlRequest } from "@/lib/graphql/schema";
import {
  uploadCourseThumbnail,
  validateCourseThumbnail,
} from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "org") {
      return NextResponse.json(
        { error: "Only organization users can upload course thumbnails." },
        { status: 403 },
      );
    }

    // A course does not exist yet during creation, so scope the upload to the
    // authenticated user's existing organization instead of a course ID.
    const { result } = await executeGraphqlRequest(
      {
        query: orgByOwnerQuery,
        operationName: "OrgByOwner",
        variables: { ownerUserId: session.user.id },
      },
      { headers: request.headers },
    );
    const org =
      "data" in result && result.data
        ? (result.data as { orgByOwner?: { id?: string | number } | null })
            .orgByOwner
        : null;
    if (!org?.id) {
      return NextResponse.json(
        { error: "Create an organization before uploading course thumbnails." },
        { status: 409 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("thumbnail");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Choose an image to upload." },
        { status: 400 },
      );
    }

    const validationError = validateCourseThumbnail(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const thumbnailUrl = await uploadCourseThumbnail(
      Buffer.from(await file.arrayBuffer()),
      String(org.id),
      file.type,
    );
    return NextResponse.json({ thumbnailUrl });
  } catch (error) {
    console.error("Course thumbnail upload failed:", error);
    return NextResponse.json(
      { error: "Unable to upload thumbnail." },
      { status: 500 },
    );
  }
}
