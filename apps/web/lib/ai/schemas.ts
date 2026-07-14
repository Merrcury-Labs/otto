import { z } from "zod";

/**
 * Schema for AI explanation requests.
 * Validates that the request contains the card's front and back content,
 * with an optional context (e.g., course name, topic).
 */
export const explanationRequestSchema = z.object({
  front: z.string().min(1).max(1000),
  back: z.string().min(1).max(2000),
  context: z.string().max(500).optional(),
});

export type ExplanationRequest = z.infer<typeof explanationRequestSchema>;
