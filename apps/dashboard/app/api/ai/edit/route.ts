import { streamText } from "ai";
import { provider, defaultModel } from "../../../../lib/ai/provider";
import {
  getSystemPrompt,
  actionPrompts,
  type AIAction,
  type ContentContext,
} from "../../../../lib/ai/prompts";
import { editRequestSchema } from "../../../../lib/ai/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = editRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { selectedText, action, context } = parsed.data;

    const actionPrompt =
      actionPrompts[action as AIAction] ?? actionPrompts.rewrite;

    const result = streamText({
      model: provider(defaultModel),
      system: `${getSystemPrompt(context as ContentContext)}\n\n${actionPrompt}\n\nOutput ONLY the replacement text — no explanations, no meta-commentary.`,
      prompt: selectedText,
      maxTokens: 1000,
      temperature: 0.5,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("[ai] Edit error:", error);
    return Response.json(
      { error: "Failed to edit content" },
      { status: 500 }
    );
  }
}
