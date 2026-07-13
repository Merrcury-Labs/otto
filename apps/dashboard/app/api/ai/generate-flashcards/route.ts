import { generateObject } from "ai";
import { provider, defaultModel } from "../../../../lib/ai/provider";
import {
  getSystemPrompt,
  actionPrompts,
  type ContentContext,
} from "../../../../lib/ai/prompts";
import {
  generateFlashcardsRequestSchema,
  flashcardGenerationSchema,
} from "../../../../lib/ai/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = generateFlashcardsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { lessonContent, lessonTitle, cardCount, context } = parsed.data;

    const { object } = await generateObject({
      model: provider(defaultModel),
      system: `${getSystemPrompt(context as ContentContext)}\n\n${actionPrompts["generate-flashcards"]}`,
      prompt: `Generate ${cardCount} flashcards from this lesson content.\n\nLesson: "${lessonTitle}"\n\nContent:\n${lessonContent}`,
      schema: flashcardGenerationSchema,
    });

    return Response.json(object);
  } catch (error) {
    console.error("[ai] Generate flashcards error:", error);
    return Response.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
