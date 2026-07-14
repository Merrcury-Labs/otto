/**
 * Parse a Hocuspocus document name to extract the entity type and ID.
 *
 * Document naming convention:
 *   lesson-{uuid}       → { type: "lesson", id: "{uuid}" }
 *   question-{uuid}     → { type: "question", id: "{uuid}" }
 *   course-desc-{uuid}  → { type: "course-description", id: "{uuid}" }
 */
export function parseDocumentName(
  documentName: string
): { type: string; id: string } | null {
  // Course description: "course-desc-{uuid}"
  const courseDescMatch = documentName.match(/^course-desc-(.+)$/);
  if (courseDescMatch && courseDescMatch[1]) {
    return { type: "course-description", id: courseDescMatch[1] };
  }

  // Other entities: "{type}-{uuid}"
  const match = documentName.match(/^(\w+)-([0-9a-f-]+)$/i);
  if (match && match[1] && match[2]) {
    return { type: match[1], id: match[2] };
  }

  return null;
}
