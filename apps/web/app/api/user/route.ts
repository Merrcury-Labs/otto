import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage, deleteImage, validateImageFile } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    // 1. Verify user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // 3. Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // 4. Delete old image from R2 if one exists
    if (session.user.image) {
      await deleteImage(session.user.image);
    }

    // 5. Upload new image to R2
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await uploadImage(buffer, session.user.id, file.type);

    // 6. Update user image in better-auth
    await auth.api.updateUser({
      headers: request.headers,
      body: { image: imageUrl },
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Profile image upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // 1. Verify user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Delete image from R2 if one exists
    if (session.user.image) {
      await deleteImage(session.user.image);
    }

    // 3. Clear user image in better-auth
    await auth.api.updateUser({
      headers: request.headers,
      body: { image: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile image deletion failed:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
