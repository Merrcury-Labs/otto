import { createOpenAI } from "@ai-sdk/openai";

/**
 * AI provider instance — provider-agnostic via Vercel AI SDK.
 *
 * To swap providers, change the import and factory:
 *   import { createAnthropic } from "@ai-sdk/anthropic";
 *   export const provider = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
 */
export const provider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Default model to use for AI features.
 * Override with AI_MODEL env var.
 */
export const defaultModel = process.env.AI_MODEL ?? "gpt-4o-mini";
