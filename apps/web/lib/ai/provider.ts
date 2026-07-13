import { createOpenAI } from "@ai-sdk/openai";

/**
 * AI provider instance for the student-facing web app.
 * Uses the same provider-agnostic Vercel AI SDK pattern as the dashboard.
 */
export const provider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Default model to use for AI features.
 * Override with AI_MODEL env var.
 */
export const defaultModel = process.env.AI_MODEL ?? "gpt-4o-mini";
