export async function uploadThumbnail(file: File): Promise<string> {
  const formData = new FormData();
  formData.set("thumbnail", file);

  const response = await fetch("/api/course-thumbnail", {
    method: "POST",
    body: formData,
  });
  const result = (await response.json()) as {
    thumbnailUrl?: string;
    error?: string;
  };

  if (!response.ok || !result.thumbnailUrl) {
    throw new Error(result.error || "Unable to upload thumbnail.");
  }

  return result.thumbnailUrl;
}
