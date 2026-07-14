"use client";

import { useState, useEffect } from "react";
import {
  Cards,
  Plus,
  Trash,
  ArrowLeft,
} from "@phosphor-icons/react";
import { graphqlFetch } from "@/lib/graphql/client";
import {
  createFlashcardDeckMutation,
  createFlashcardMutation,
} from "@/lib/graphql/flashcards";
import { publishedCoursesQuery } from "@/lib/graphql/courses";

type Course = {
  id: string;
  title?: string;
  name?: string;
};

type Card = {
  id: string;
  front: string;
  back: string;
  position: number;
  hint: string;
  tags: string[];
};

type FormData = {
  title: string;
  description: string;
  courseId: string;
  cards: Card[];
};

type CoursesData = {
  courses: Course[];
};

type DeckData = {
  createFlashcardDeck: { id: string };
};

type CardData = {
  createFlashcard: { id: string };
};

export default function CreateFlashcardDeckPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    courseId: "",
    cards: [{ id: "new-0", front: "", back: "", position: 0, hint: "", tags: [] }],
  });

  useEffect(() => {
    async function fetchCourses() {
      try {
        const result = await graphqlFetch<CoursesData>({
          query: publishedCoursesQuery,
        });
        setCourses(result.courses ?? []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    }
    fetchCourses();
  }, []);

  const addCard = () => {
    setFormData((prev) => ({
      ...prev,
      cards: [
        ...prev.cards,
        {
          id: `new-${prev.cards.length}`,
          front: "",
          back: "",
          position: prev.cards.length,
          hint: "",
          tags: [],
        },
      ],
    }));
  };

  const removeCard = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index),
    }));
  };

  const updateCard = (index: number, field: keyof Card, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      cards: prev.cards.map((card, i) =>
        i === index ? { ...card, [field]: value } : card
      ),
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a deck title.");
      return;
    }
    if (!formData.courseId) {
      alert("Please select a course.");
      return;
    }
    const validCards = formData.cards.filter((c) => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      alert("Please add at least one card with both front and back content.");
      return;
    }

    setSaving(true);
    try {
      const deckResult = await graphqlFetch<DeckData>({
        query: createFlashcardDeckMutation,
        variables: {
          courseId: formData.courseId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          status: "DRAFT",
        },
      });

      const deckId = deckResult.createFlashcardDeck.id;

      await Promise.all(
        validCards.map((card, i) =>
          graphqlFetch<CardData>({
            query: createFlashcardMutation,
            variables: {
              deckId,
              front: card.front.trim(),
              back: card.back.trim(),
              position: i,
              hint: card.hint?.trim() || "",
              tags: card.tags,
            },
          })
        )
      );

      window.location.href = `/flashcards/${deckId}`;
    } catch (err) {
      console.error("Failed to save deck:", err);
      alert("Failed to save deck. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3">
          <a
            href="/flashcards"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </a>
          <div>
            <h1
              className="text-xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Create Flashcard Deck
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add cards for spaced repetition learning
            </p>
          </div>
        </div>

        {/* Deck Details */}
        <div className="rounded-2xl border bg-card/40 p-5 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Cards className="size-4 text-primary" weight="duotone" />
            Deck Details
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g. Biology Chapter 5"
                className="w-full rounded-xl border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="What this deck covers..."
                rows={2}
                className="w-full rounded-xl border bg-card px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                Course *
              </label>
              <div className="relative">
                <select
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, courseId: e.target.value }))
                  }
                  className="w-full rounded-xl border bg-card px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title || course.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Cards ({formData.cards.length})
            </h2>
            <button
              onClick={addCard}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[13px] font-medium text-muted-foreground transition-all hover:border-primary/20 hover:text-foreground"
            >
              <Plus className="size-3" weight="bold" />
              Add Card
            </button>
          </div>

          {formData.cards.map((card, index) => (
            <div key={card.id || index} className="rounded-2xl border bg-card/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Card #{index + 1}
                </span>
                {formData.cards.length > 1 && (
                  <button
                    className="flex size-7 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10"
                    onClick={() => removeCard(index)}
                  >
                    <Trash className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Front (Question)
                  </label>
                  <textarea
                    value={card.front}
                    onChange={(e) => updateCard(index, "front", e.target.value)}
                    placeholder="What is photosynthesis?"
                    rows={2}
                    className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Back (Answer)
                  </label>
                  <textarea
                    value={card.back}
                    onChange={(e) => updateCard(index, "back", e.target.value)}
                    placeholder="The process by which plants convert sunlight..."
                    rows={2}
                    className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Hint (optional)
                  </label>
                  <input
                    type="text"
                    value={card.hint || ""}
                    onChange={(e) => updateCard(index, "hint", e.target.value)}
                    placeholder="Think about sunlight..."
                    className="w-full rounded-xl border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(card.tags || []).join(", ")}
                    onChange={(e) =>
                      updateCard(
                        index,
                        "tags",
                        e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="biology, plants, energy"
                    className="w-full rounded-xl border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Deck"}
          </button>
          <a
            href="/flashcards"
            className="flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[13px] font-medium text-muted-foreground transition-all hover:border-primary/20 hover:text-foreground"
          >
            Cancel
          </a>
        </div>
      </div>
    </div>
  );
}
