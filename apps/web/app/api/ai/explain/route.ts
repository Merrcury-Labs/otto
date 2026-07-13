import { streamText } from "ai";
import { provider, defaultModel } from "../../../../lib/ai/provider";
import {
  explanationSystemPrompt,
  explanationActionPrompt,
} from "../../../../lib/ai/prompts";
import { explanationRequestSchema } from "../../../../lib/ai/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = explanationRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { front, back, context } = parsed.data;

    const userPrompt = context
      ? `Course context: ${context}\n\nCard front: ${front}\nCard back: ${back}\n\n${explanationActionPrompt}`
      : `Card front: ${front}\nCard back: ${back}\n\n${explanationActionPrompt}`;

    const result = streamText({
      model: provider(defaultModel),
      system: explanationSystemPrompt,
      prompt: userPrompt,
      maxTokens: 300,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("[ai] Explanation error:", error);
    return Response.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
