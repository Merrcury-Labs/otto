export type FlashcardDeckStatus = "published" | "draft";

export interface Flashcard {
  id: number | string;
  front: string;
  back: string;
  position: number;
  hint?: string;
  tags?: string[];
}

export interface FlashcardDeckFormData {
  title: string;
  description: string;
  courseId?: string;
  courseTitle?: string;
  cards: Flashcard[];
}

export interface FlashcardDeck extends FlashcardDeckFormData {
  id: number | string;
  status: FlashcardDeckStatus;
  cardCount: number;
  avgMastery: number;
  createdAt: string;
  updatedAt: string;
}
