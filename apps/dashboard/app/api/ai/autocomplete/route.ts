import { streamText } from "ai";
import { provider, defaultModel } from "../../../../lib/ai/provider";
import { autocompleteRequestSchema } from "../../../../lib/ai/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = autocompleteRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { prefix, context } = parsed.data;

    const result = streamText({
      model: provider(defaultModel),
      system:
        "You are an autocomplete assistant. Continue the text naturally from where it ends. " +
        "Provide only the continuation text — do not repeat what was already written. " +
        "Keep completions concise (1-2 sentences). Match the existing tone and style.",
      prompt: context
        ? `Surrounding context:\n${context}\n\nContinue from: "${prefix}"`
        : `Continue from: "${prefix}"`,
      maxTokens: 100,
      temperature: 0.4,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("[ai] Autocomplete error:", error);
    return Response.json(
      { error: "Failed to generate autocomplete" },
      { status: 500 }
    );
  }
}
