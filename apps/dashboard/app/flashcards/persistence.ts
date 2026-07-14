import type { FlashcardDeckFormData, Flashcard } from "./types";
import { graphqlFetch } from "../../lib/graphql/client";
import {
  createFlashcardDeckMutation,
  createFlashcardMutation,
  updateFlashcardDeckMutation,
  updateFlashcardMutation,
  deleteFlashcardMutation,
} from "../../lib/graphql/flashcards";

const extractRecordId = (result: unknown): string | null => {
  if (!result || typeof result !== "object") return null;

  const record = result as Record<string, unknown>;
  const id = record.id ?? record.uuid ?? record.pk;

  if (typeof id === "string" || typeof id === "number") return String(id);

  for (const value of Object.values(record)) {
    const nestedId = extractRecordId(value);
    if (nestedId) return nestedId;
  }

  return null;
};

const saveCards = async (cards: Flashcard[], deckId: string) => {
  await Promise.all(
    cards.map((card, index) =>
      graphqlFetch<unknown>({
        query: createFlashcardMutation,
        variables: {
          deckId,
          front: card.front,
          back: card.back,
          position: card.position || index,
          hint: card.hint || "",
          tags: card.tags || [],
        },
      })
    )
  );
};

export async function saveDeck(formData: FlashcardDeckFormData) {
  if (!formData.courseId) {
    throw new Error("A course must be selected to create a flashcard deck.");
  }

  const deckVariables = {
    courseId: formData.courseId,
    title: formData.title,
    description: formData.description,
    status: "DRAFT",
  };

  const deckResult = await graphqlFetch<unknown>({
    query: createFlashcardDeckMutation,
    variables: deckVariables,
  });

  const deckId = extractRecordId(deckResult);

  if (!deckId) {
    throw new Error(
      "Deck saved, but the response did not include a deck ID for cards."
    );
  }

  if (formData.cards.length > 0) {
    await saveCards(formData.cards, deckId);
  }

  return deckResult;
}

export async function updateDeck(
  deckId: string,
  data: { title?: string; description?: string; status?: string }
) {
  return graphqlFetch<unknown>({
    query: updateFlashcardDeckMutation,
    variables: { id: deckId, ...data },
  });
}

export async function updateCard(
  cardId: string,
  data: { front?: string; back?: string; position?: number; hint?: string; tags?: string[] }
) {
  return graphqlFetch<unknown>({
    query: updateFlashcardMutation,
    variables: { id: cardId, ...data },
  });
}

export async function createCard(deckId: string, card: Flashcard, position: number) {
  return graphqlFetch<unknown>({
    query: createFlashcardMutation,
    variables: {
      deckId,
      front: card.front,
      back: card.back,
      position: card.position || position,
      hint: card.hint || "",
      tags: card.tags || [],
    },
  });
}

export async function deleteCard(cardId: string) {
  return graphqlFetch<unknown>({
    query: deleteFlashcardMutation,
    variables: { id: cardId },
  });
}
