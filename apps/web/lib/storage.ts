import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? "otto-profile-pictures";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";

function getR2Client(): S3Client {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error(
      "Missing R2 configuration. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables."
    ); 
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File is too large. Maximum size is 1MB.";
  }
  return null;
}

function getExtension(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };
  return map[contentType] ?? "jpg";
}

export async function uploadImage(
  buffer: Buffer,
  userId: string,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const ext = getExtension(contentType);
  const key = `avatars/${userId}/${timestamp}-${random}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  if (!imageUrl || !R2_PUBLIC_URL) return;

  // Only delete images that belong to our R2 bucket
  if (!imageUrl.startsWith(R2_PUBLIC_URL)) return;

  const key = imageUrl.replace(`${R2_PUBLIC_URL}/`, "");
  if (!key) return;

  try {
    const client = getR2Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
  } catch (error) {
    // Log but don't throw — deletion failure shouldn't block uploads
    console.error("Failed to delete old image from R2:", error);
  }
}
