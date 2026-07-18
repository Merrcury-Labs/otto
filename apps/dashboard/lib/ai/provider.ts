import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * AI providers — configured via AI_PROVIDER env var.
 *
 * Supported: "zai" (default) | "gemini"
 *
 * Each provider reads its own API key env var:
 *   Z.ai  → AI_API_KEY
 *   Gemini → GOOGLE_GENERATIVE_AI_API_KEY
 */

// ── Z.ai (OpenAI-compatible) ──────────────────────────────────────────

export const zaiProvider = createOpenAI({
  baseURL: process.env.AI_BASE_URL ?? "https://api.z.ai/v1",
  apiKey: process.env.AI_API_KEY,
});

// ── Google Gemini ─────────────────────────────────────────────────────

export const geminiProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY,
});

// ── Active provider & model ───────────────────────────────────────────

const activeProvider = process.env.AI_PROVIDER ?? "zai";

export const provider = activeProvider === "gemini" ? geminiProvider : zaiProvider;

export const defaultModel =
  process.env.AI_MODEL ?? (activeProvider === "gemini" ? "gemini-2.0-flash" : "gpt-4o-mini");
