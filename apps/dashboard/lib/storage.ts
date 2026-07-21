import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export class ThumbnailStorageConfigurationError extends Error {
  constructor(missingVariables: string[]) {
    super(
      `Course thumbnail storage is missing: ${missingVariables.join(", ")}.`,
    );
    this.name = "ThumbnailStorageConfigurationError";
  }
}

export function validateCourseThumbnail(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Only JPG, PNG, GIF, and WebP images are supported.";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "Thumbnail must be 5MB or smaller.";
  }
  return null;
}

export async function uploadCourseThumbnail(
  contents: Buffer,
  orgId: string,
  contentType: string,
): Promise<string> {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket =
    process.env.R2_DASHBOARD ??
    process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

  const missingVariables = [
    !accountId && "R2_ACCOUNT_ID",
    !accessKeyId && "R2_ACCESS_KEY_ID",
    !secretAccessKey && "R2_SECRET_ACCESS_KEY",
    !bucket && "R2_DASHBOARD (or R2_BUCKET_NAME)",
    !publicUrl && "R2_PUBLIC_URL",
  ].filter((variable): variable is string => Boolean(variable));

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw new ThumbnailStorageConfigurationError(missingVariables);
  }

  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };
  const key = `courses/${orgId}/${crypto.randomUUID()}.${extensions[contentType] ?? "jpg"}`;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: contents,
      ContentType: contentType,
    }),
  );

  return `${publicUrl}/${key}`;
}
