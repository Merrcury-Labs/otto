import { z } from "zod";

/**
 * Schema for AI generation requests (slash commands).
 */
export const generateRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  context: z
    .enum(["lesson", "quiz", "course-description", "general"])
    .default("general"),
  /** Text before the cursor, for context */
  beforeCursor: z.string().max(5000).optional(),
  /** Text after the cursor, for context */
  afterCursor: z.string().max(5000).optional(),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

/**
 * Schema for AI autocomplete requests (ghost text).
 */
export const autocompleteRequestSchema = z.object({
  /** Text before the cursor in the current paragraph */
  prefix: z.string().min(1).max(1000),
  /** Paragraph context (surrounding paragraphs) */
  context: z.string().max(2000).optional(),
});

export type AutocompleteRequest = z.infer<typeof autocompleteRequestSchema>;

/**
 * Schema for AI edit requests (selection-based tools).
 */
export const editRequestSchema = z.object({
  /** The selected text to edit */
  selectedText: z.string().min(1).max(5000),
  /** The action to perform */
  action: z.enum([
    "summarize",
    "expand",
    "simplify",
    "rewrite",
    "fix-grammar",
  ]),
  /** Content context */
  context: z
    .enum(["lesson", "quiz", "course-description", "general"])
    .default("general"),
});

export type EditRequest = z.infer<typeof editRequestSchema>;

/**
 * Schema for AI flashcard generation requests.
 */
export const flashcardGenerationSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().describe("The question or prompt side of the flashcard"),
      back: z.string().describe("The answer or explanation side of the flashcard"),
      hint: z.string().optional().describe("An optional hint to help the student"),
      tags: z.array(z.string()).optional().describe("Relevant topic tags"),
    })
  ),
});

export const generateFlashcardsRequestSchema = z.object({
  lessonContent: z.string().min(10).max(10000),
  lessonTitle: z.string().min(1).max(200),
  cardCount: z.number().min(1).max(20).default(5),
  context: z
    .enum(["lesson", "quiz", "course-description", "general"])
    .default("lesson"),
});

export type GenerateFlashcardsRequest = z.infer<
  typeof generateFlashcardsRequestSchema
>;
