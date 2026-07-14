import { streamText } from "ai";
import { provider, defaultModel } from "../../../../lib/ai/provider";
import {
  getSystemPrompt,
  actionPrompts,
  type ContentContext,
} from "../../../../lib/ai/prompts";
import { generateRequestSchema } from "../../../../lib/ai/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = generateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { prompt, context, beforeCursor, afterCursor } = parsed.data;

    // Build context-aware prompt
    let userPrompt = "";
    if (beforeCursor) {
      userPrompt += `Text before cursor:\n${beforeCursor}\n\n`;
    }
    if (afterCursor) {
      userPrompt += `Text after cursor:\n${afterCursor}\n\n`;
    }
    userPrompt += prompt;

    const result = streamText({
      model: provider(defaultModel),
      system: `${getSystemPrompt(context as ContentContext)}\n\n${actionPrompts.write}`,
      prompt: userPrompt,
      maxTokens: 1000,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("[ai] Generate error:", error);
    return Response.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
